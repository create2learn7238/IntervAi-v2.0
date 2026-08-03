import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Video, Webcam as WebcamIcon, Mic, CheckCircle2, ArrowRight, Lightbulb, Shield, Briefcase, Layers } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import NewInterviewModal from '../components/NewInterviewModal';
import { getInterview } from '../services/interviewService';
import { toast } from 'react-hot-toast';

export default function Interview() {
  const { interviewid } = useParams();
  const [interviewdata, setInterviewdata] = useState(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [micActive, setMicActive] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (interviewid && interviewid !== 'new') {
      getInterview(interviewid)
        .then(({ data }) => setInterviewdata(data))
        .catch((err) => console.error('Failed to fetch interview', err));
    } else if (interviewid === 'new') {
      // Default session configuration for new practice sessions
      setInterviewdata({
        mockid: 'new',
        jobposition: 'Full Stack MERN Developer',
        jobdescription: 'React.js, Node.js, Express.js, MongoDB, REST APIs',
        jobexp: '1-3',
        difficulty: 'Intermediate',
      });
      setIsModalOpen(true);
    }
  }, [interviewid]);

  return (
    <DashboardLayout>
      <div className="pb-2 border-b border-[#E2E8F0]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-[11px] font-bold text-[#4F46E5] mb-1">
          <Video className="w-3.5 h-3.5" />
          <span>Camera & Microphone Pre-Check</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Session Configuration Studio
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Verify your audio input, camera frame, and session details before entering the AI interview room.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Session details */}
        {interviewdata ? (
          <div className="space-y-6">
            <div className="saas-card p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
                <Briefcase className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Target Position Summary</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-[#64748B] uppercase tracking-wider block text-[10px]">Position</span>
                  <p className="text-sm font-extrabold text-[#0F172A] mt-0.5">{interviewdata.jobposition}</p>
                </div>

                <div>
                  <span className="font-semibold text-[#64748B] uppercase tracking-wider block text-[10px]">Role Requirements</span>
                  <p className="text-[#64748B] mt-0.5 leading-relaxed">{interviewdata.jobdescription}</p>
                </div>

                <div className="flex gap-6 pt-2 border-t border-[#F1F5F9]">
                  <div>
                    <span className="font-semibold text-[#64748B] text-[10px] uppercase block">Experience</span>
                    <p className="font-bold text-[#0F172A]">{interviewdata.jobexp} Years</p>
                  </div>
                  <div>
                    <span className="font-semibold text-[#64748B] text-[10px] uppercase block">Target Level</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] font-bold">
                      {interviewdata.difficulty || 'Intermediate'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Zero Storage Security Guarantee */}
            <div className="saas-card p-5 bg-[#EEF2FF] border border-[#6366F1]/20 space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4F46E5]" />
                <h4 className="text-xs font-bold text-[#0F172A]">Privacy & Audio Reminders</h4>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                You will answer 5 AI-generated interview questions. Speech recognition transcribes your spoken answers live. Video is never saved to servers.
              </p>
            </div>
          </div>
        ) : (
          <div className="saas-card p-8 bg-white text-center">
            <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* Camera Setup Container */}
        <div className="saas-card p-6 bg-white space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <WebcamIcon className="w-4 h-4 text-[#4F46E5]" />
                <h3 className="text-sm font-bold text-[#0F172A]">Camera & Microphone Test</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${webcamEnabled ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                {webcamEnabled ? '🟢 Camera Active' : 'Camera Off'}
              </span>
            </div>

            {webcamEnabled ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#0F172A]">
                <Webcam
                  onUserMedia={() => {
                    setWebcamEnabled(true);
                    setMicActive(true);
                  }}
                  className="w-full h-full object-cover"
                  mirrored
                />
                <div className="absolute bottom-3 left-3 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-semibold border border-white/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Studio Ready</span>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] text-center space-y-3">
                <WebcamIcon className="w-12 h-12 text-[#94A3B8] mx-auto" />
                <h4 className="text-xs font-bold text-[#0F172A]">Enable Video Preview</h4>
                <p className="text-xs text-[#64748B]">Click below to test your camera and microphone levels.</p>
                <button
                  onClick={() => setWebcamEnabled(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-btn bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors"
                >
                  <WebcamIcon className="w-4 h-4" />
                  <span>Enable Camera & Mic</span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
            <Link
              to={`/dashboard/interview/${interviewid}/start`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-btn bg-gradient-primary text-white text-xs font-semibold shadow-saas-glow hover:opacity-95 transition-all hover:scale-[1.02]"
            >
              <span>Begin AI Interview Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <NewInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DashboardLayout>
  );
}
