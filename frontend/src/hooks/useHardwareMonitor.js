import { useEffect, useRef } from 'react';

export default function useHardwareMonitor({ webcamRef, listening, browserSupportsSpeechRecognition, onViolation }) {
  const lastState = useRef({ video: true, audio: true });

  useEffect(() => {
    const interval = setInterval(() => {
      // Check Video (Webcam)
      let videoActive = false;
      if (webcamRef?.current?.stream) {
        const videoTracks = webcamRef.current.stream.getVideoTracks();
        if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
          videoActive = true;
        }
      }

      if (!videoActive && lastState.current.video) {
        if (onViolation) onViolation('CAMERA_OFF', 'Camera stream disconnected or permissions revoked');
      }
      lastState.current.video = videoActive;

      // Note: Microphone monitoring is trickier natively with react-speech-recognition since it abstracts the stream.
      // But we can check if it's supposed to be listening but isn't responding or if browser doesn't support it.
      let audioActive = listening;
      // We will rely on explicit user actions (like turning off mic in UI or browser prompt) or if `listening` unexpectedly drops while we think it should be on.
      
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [webcamRef, listening, browserSupportsSpeechRecognition, onViolation]);

}
