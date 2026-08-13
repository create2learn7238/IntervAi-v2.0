import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Mic, MicOff, Volume2, ArrowLeft, Flag, Check, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getInterview, uploadSessionVideo } from '../services/interviewService';
import { saveAnswer } from '../services/feedbackService';
import { useAuth } from '../context/AuthContext';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useFullScreen from '../hooks/useFullScreen';
import useAntiCheating from '../hooks/useAntiCheating';
import useHardwareMonitor from '../hooks/useHardwareMonitor';
import useFaceTracking from '../hooks/useFaceTracking';
import { initMonitorSession, logMonitorViolation } from '../services/monitoringService';

export default function StartInterview() {
  const { interviewid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [baseAnswer, setBaseAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecordingIntent, setIsRecordingIntent] = useState(false);
  const justStartedRef = useRef(false);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const userAnswerRef = useRef(userAnswer);
  useEffect(() => {
    userAnswerRef.current = userAnswer;
  }, [userAnswer]);

  // Auto-restart speech recognition if it stops unexpectedly while user intends to record
  useEffect(() => {
    let timeoutId;
    let fallbackTimeoutId;
    if (isRecordingIntent && !listening) {
      if (!justStartedRef.current) {
        setBaseAnswer(userAnswerRef.current);
        resetTranscript();
        timeoutId = setTimeout(() => {
          SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
        }, 250);
      }

      // Increased fallback timeout to 5000ms to allow slower devices/browsers to restart the mic
      fallbackTimeoutId = setTimeout(() => {
        setIsRecordingIntent(false);
        toast.error('Microphone stopped or blocked. Click the mic button to resume.');
      }, 5000);
    }
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeoutId);
    };
  }, [listening, isRecordingIntent, resetTranscript]);

  useEffect(() => {
    if (isRecordingIntent || listening) {
      const newAnswer = baseAnswer
        ? transcript ? baseAnswer + ' ' + transcript : baseAnswer
        : transcript;
      setUserAnswer(newAnswer);
    }
  }, [transcript, listening, baseAnswer, isRecordingIntent]);

  useEffect(() => {
    if (interviewid === 'new') {
      navigate('/dashboard', { replace: true });
      return;
    }
    getInterview(interviewid)
      .then(({ data }) => {
        try {
          let q = JSON.parse(data.jsonmockresp);
          if (q && !Array.isArray(q)) q = Object.values(q).find((v) => Array.isArray(v)) || [];
          setQuestions(q || []);
        } catch {
          setQuestions([]);
        }
      })
      .catch(() => toast.error('Failed to load interview'));
  }, [interviewid, navigate]);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const isExitingRef = useRef(false);

  const handleViolation = useCallback((type, desc, duration = 0) => {
    if (isExitingRef.current) return;

    logMonitorViolation({
      interviewId: interviewid,
      userEmail: user?.email || 'guest@intervai.app',
      violationType: type,
      description: desc,
      duration
    }).catch(console.error);

    setCheatEvents(prev => {
      const next = { ...prev };
      if (type === 'MULTIPLE_FACES') next.multipleFacesDetected = true;
      if (type === 'LOOKING_AWAY') next.lookingAwayCount = (next.lookingAwayCount || 0) + 1;
      if (type === 'NO_FACE_DETECTED') next.noFaceCount = (next.noFaceCount || 0) + 1;
      if (type === 'TAB_SWITCH') next.tabSwitchCount += 1;
      if (type === 'COPY_PASTE') next.copyPasteCount += 1;
      return next;
    });

    toast.error(`Warning: ${desc}`);
  }, [interviewid, user?.email]);

  const { isFullscreen, requestFullscreen, exitFullscreen } = useFullScreen(() => {
    handleViolation('FULLSCREEN_EXIT', 'Exited full-screen mode');
  });

  useAntiCheating({ onViolation: handleViolation });
  useHardwareMonitor({ webcamRef, listening, browserSupportsSpeechRecognition, onViolation: handleViolation });
  useFaceTracking({ webcamRef, onViolation: handleViolation });

  useEffect(() => {
    if (user?.email) {
      initMonitorSession(interviewid, user.email).catch(console.error);
    }
  }, [interviewid, user]);

  // Keep old cheatEvents state for compatibility with saveAnswer API call
  const [cheatEvents, setCheatEvents] = useState({
    copyPasteCount: 0,
    tabSwitchCount: 0,
    multipleFacesDetected: false,
    extraDeviceDetected: false,
    lookingAwayCount: 0,
    noFaceCount: 0,
  });

  const currentQuestion = questions[activeIndex];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === questions.length - 1;

  const textToSpeech = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);

    // Apply user preference for speed
    const rateStr = user?.preferences?.speechRate || '0.9x';
    const rate = parseFloat(rateStr.replace('x', '')) || 0.9;
    utt.rate = rate;

    // Apply auto-record logic
    const autoRecord = user?.preferences?.autoRecord !== false;
    if (autoRecord) {
      utt.onend = () => {
        if (!listening && !isRecordingIntent) {
          if (!browserSupportsSpeechRecognition) {
            toast.error('Speech recognition not supported. Please type.');
            return;
          }
          justStartedRef.current = true;
          setIsRecordingIntent(true);
          setBaseAnswer(userAnswer);
          resetTranscript();
          SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
          setTimeout(() => { justStartedRef.current = false; }, 1000);
        }
      };
    }

    window.speechSynthesis.speak(utt);
  };

  // Video recording capture
  const startVideoRecording = () => {
    try {
      if (webcamRef.current && webcamRef.current.stream) {
        recordedChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
          mimeType: 'video/webm',
          videoBitsPerSecond: 250000,
        });
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.start(1000);
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (e) {
      console.warn('Video recorder init notice:', e.message);
    }
  };

  const stopVideoRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.onstop = () => {
          try {
            const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            resolve(blob);
          } catch {
            resolve(null);
          }
        };
        try {
          mediaRecorderRef.current.stop();
        } catch {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  };

  const stopRecording = () => {
    setIsRecordingIntent(false);
    if (listening) {
      SpeechRecognition.stopListening();
    }
  };

  const handleMicClick = () => {
    if (isRecordingIntent) {
      setIsRecordingIntent(false);
      SpeechRecognition.stopListening();
    } else {
      if (!browserSupportsSpeechRecognition) {
        toast.error('Speech recognition not supported in this browser. You can type your response!');
        return;
      }
      justStartedRef.current = true;
      setIsRecordingIntent(true);
      setBaseAnswer(userAnswer);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
      setTimeout(() => { justStartedRef.current = false; }, 1000);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) {
      toast.error('Please record or type an answer before saving');
      return;
    }
    if (!currentQuestion) return;

    if (listening) {
      stopRecording();
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('question', currentQuestion.question);
      formData.append('correctanswer', currentQuestion.answer);
      formData.append('useranswer', userAnswer);
      formData.append('cheatEvents', JSON.stringify(cheatEvents));

      await saveAnswer(interviewid, formData);
      toast.success('Answer saved!');
      resetTranscript();
      setUserAnswer('');
      setBaseAnswer('');
      setCheatEvents({
        copyPasteCount: 0,
        tabSwitchCount: 0,
        multipleFacesDetected: false,
        extraDeviceDetected: false,
        lookingAwayCount: 0,
        noFaceCount: 0,
      });

      if (!isLast) {
        setActiveIndex((i) => i + 1);
      } else {
        const sessionBlob = await stopVideoRecording();
        if (sessionBlob) {
          toast.success('Uploading session video...', { duration: 4000 });
          const videoForm = new FormData();
          videoForm.append('video', sessionBlob, 'session.webm');
          try {
            await uploadSessionVideo(interviewid, videoForm);
          } catch (err) {
            console.error('Failed to upload session video', err);
            toast.error('Failed to upload session video');
          }
        }
        navigate(`/dashboard/interview/${interviewid}/feedback`);
      }
    } catch {
      toast.error('Failed to save answer');
    } finally {
      setLoading(false);
    }
  };

  if (!isFullscreen) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-white p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full space-y-6">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Full-Screen Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            This interview is strictly monitored. You must enter full-screen mode to begin or resume your session. Exiting full-screen will be logged as an anti-cheating violation.
          </p>
          <button
            onClick={requestFullscreen}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            Enter Full-Screen & Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col font-sans text-white">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {isRecordingIntent && (
            <div className="flex items-center gap-2 bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full animate-pulse shadow-sm">
              <span className="w-2 h-2 bg-white rounded-full" />
              <span>Recording Speech...</span>
            </div>
          )}
          <span className="text-slate-300 text-sm font-medium">
            Question {activeIndex + 1} of {questions.length || '5'}
          </span>
        </div>

        {/* Question Dots Navigation */}
        <div className="flex items-center gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                stopRecording();
                resetTranscript();
                setUserAnswer('');
                setBaseAnswer('');
                setActiveIndex(i);
              }}
              className={`w-3 h-3 rounded-full transition-all ${i === activeIndex ? 'bg-indigo-500 scale-125' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              title={`Go to question ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            isExitingRef.current = true;
            stopRecording();
            exitFullscreen();
            navigate('/dashboard');
          }}
          className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors"
        >
          Exit Studio
        </button>
      </div>

      {/* Main Workspace with Top Question & Bottom Split */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Full-Width Question Row */}
        {currentQuestion && (
          <div className="w-full p-4 sm:p-6 bg-slate-900 border-b border-slate-800 shrink-0">
            <div className="max-w-5xl mx-auto bg-slate-800/50 rounded-xl p-5 border border-slate-700 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                  AI Question Prompt
                </span>
                <p className="text-white text-base sm:text-lg font-medium leading-relaxed">
                  {currentQuestion.question}
                </p>
              </div>
              <button
                onClick={() => textToSpeech(currentQuestion.question)}
                className="p-3 bg-slate-700 hover:bg-indigo-600 rounded-xl shrink-0 text-white transition-colors border border-slate-600 hover:border-indigo-500"
                title="Read Question Out Loud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Split Screen Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* Left Column: Webcam (takes up remaining space) */}
          <div className="lg:w-1/2 p-4 sm:p-6 bg-slate-950 flex flex-col relative">
            <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl relative">
              <Webcam
                ref={webcamRef}
                className="absolute inset-0 w-full h-full object-cover"
                mirrored
                onUserMedia={startVideoRecording}
              />
            </div>
          </div>

          {/* Right Column: Transcript & Controls */}
          <div className="lg:w-1/2 p-4 sm:p-6 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-10 overflow-y-auto">

            {/* Transcript / Input Area */}
            <div className="flex-1 flex flex-col space-y-3 mb-6 min-h-[150px]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Your Answer (Spoken or Typed)
                </span>
                {userAnswer && (
                  <button
                    onClick={() => {
                      setUserAnswer('');
                      setBaseAnswer('');
                      resetTranscript();
                    }}
                    className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors bg-slate-800/50 px-2.5 py-1 rounded-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isRecordingIntent}
                placeholder={isRecordingIntent ? "Listening... (typing disabled)" : "Speak using the microphone or type your response here..."}
                className={`flex-1 w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none shadow-inner leading-relaxed ${isRecordingIntent ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Controls Footer */}
            <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 shrink-0">
              <div className="flex items-center justify-between">
                <button
                  disabled={isFirst}
                  onClick={() => {
                    stopRecording();
                    resetTranscript();
                    setUserAnswer('');
                    setBaseAnswer('');
                    setActiveIndex((i) => Math.max(0, i - 1));
                  }}
                  className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold disabled:opacity-30 transition-colors px-3 py-2"
                >
                  <ArrowLeft className="w-4.5 h-4.5" /> Prev
                </button>

                {/* Mic Trigger */}
                <button
                  onClick={handleMicClick}
                  disabled={loading}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${isRecordingIntent
                    ? 'bg-rose-600 text-white ring-4 ring-rose-600/30 shadow-lg shadow-rose-600/20 scale-105'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20'
                    }`}
                  title={isRecordingIntent ? 'Stop Recording' : 'Start Speech Recording'}
                >
                  {isRecordingIntent ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
                </button>

                {/* Save & Submit Button */}
                <button
                  onClick={submitAnswer}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Check className="w-4.5 h-4.5" />
                  <span>{isLast ? 'Finish' : 'Save & Next'}</span>
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-400 font-medium mt-4">
                {listening
                  ? '🎤 Speech recognition active — Click the red button to pause recording'
                  : 'Tap microphone to speak OR type directly into the text field above'}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
