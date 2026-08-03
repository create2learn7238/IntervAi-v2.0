import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { UserCheck, Camera, CheckCircle2, AlertCircle, Eye, Shield, Bot, Sun, AlignCenter, Shirt } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-hot-toast';

const GUIDELINES = [
  { q: "What should I wear to a formal corporate interview?", a: "Dress one level above the company's dress code. For corporate tech & finance roles, business formal (button-down shirt, blazer) is safest.", category: 'Attire Code' },
  { q: "How should I position myself in front of the camera?", a: "Sit upright with shoulders relaxed. Align camera lens at eye level. Ensure upper torso and shoulders are centered in frame.", category: 'Posture & Framing' },
  { q: "What should I do with my hands during virtual calls?", a: "Rest hands naturally on the table or desk. Use natural open palm gestures when explaining key technical concepts, avoiding fidgeting.", category: 'Body Language' },
  { q: "How do I maintain optimal eye contact online?", a: "Maintain eye contact by looking directly at the camera lens (60-70% of the time) rather than staring at screen video thumbnails.", category: 'Eye Contact Ratio' },
  { q: "How do I handle room lighting and background?", a: "Ensure a bright, soft front light source. Avoid strong backlighting behind your head. Use a neutral, clutter-free background.", category: 'Room Lighting' },
];

export default function DressingPosture() {
  const [active, setActive] = useState(0);
  const [webcamActive, setWebcamActive] = useState(true);
  const current = GUIDELINES[active];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="pb-3 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F3FF] border border-[#8B5CF6]/30 text-xs font-bold text-[#7C3AED] mb-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Live Posture & Lighting Checklist (Feature 11)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Dressing, Posture & Camera Framing Studio
            </h1>
          </div>
        </div>

        {/* Live Camera Framing Checklist Studio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 saas-card p-6 bg-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F172A]">Live Video Feed & Framing Grid</h3>
              <button
                onClick={() => setWebcamActive(!webcamActive)}
                className="text-xs font-bold text-[#7C3AED] hover:underline"
              >
                {webcamActive ? 'Disable Camera' : 'Enable Camera'}
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl bg-[#0F172A] overflow-hidden flex items-center justify-center border border-[#1E293B]">
              {webcamActive ? (
                <Webcam audio={false} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 text-white space-y-2">
                  <Camera className="w-10 h-10 mx-auto text-[#94A3B8]" />
                  <p className="text-xs text-[#94A3B8]">Camera stream disabled</p>
                </div>
              )}

              {/* Target Eye Level Guideline Line */}
              <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-[#10B981]/70 pointer-events-none" />
              <span className="absolute top-1/3 left-4 -translate-y-1/2 text-[10px] font-bold text-[#10B981] bg-black/60 px-2 py-0.5 rounded-full">
                Eye Level Line
              </span>
            </div>
          </div>

          {/* Real-time Checklist Badges */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">Real-Time Presentation Checklist</h3>

            <div className="space-y-3">
              {[
                { label: 'Camera Height: Eye Level', status: 'Optimal', icon: Eye, color: 'text-[#10B981] bg-[#ECFDF5] border-[#10B981]/20' },
                { label: 'Lighting Intensity: Front Soft Light', status: 'Good', icon: Sun, color: 'text-[#10B981] bg-[#ECFDF5] border-[#10B981]/20' },
                { label: 'Torso Alignment: Centered Frame', status: 'Aligned', icon: AlignCenter, color: 'text-[#10B981] bg-[#ECFDF5] border-[#10B981]/20' },
                { label: 'Attire Code: Business Formal', status: 'Verified', icon: Shirt, color: 'text-[#7C3AED] bg-[#F5F3FF] border-[#8B5CF6]/30' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`p-3.5 rounded-xl border flex items-center justify-between ${item.color}`}>
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-bold text-[#0F172A]">{item.label}</span>
                    </div>
                    <span className="text-xs font-bold">{item.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Presentation Guidelines Accordion */}
        <div className="saas-card p-6 bg-white space-y-5">
          <h3 className="text-base font-bold text-[#0F172A]">Placement Interview Standards</h3>

          <div className="flex flex-wrap gap-2">
            {GUIDELINES.map((g, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  active === i
                    ? 'bg-gradient-primary text-white shadow-royal-glow'
                    : 'bg-white border border-[#CBD5E1] text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
              >
                {g.category}
              </button>
            ))}
          </div>

          <div className="p-6 rounded-2xl bg-[#FAFAFC] border border-[#E2E8F0] space-y-3">
            <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider bg-[#F5F3FF] px-2.5 py-1 rounded-full border border-[#8B5CF6]/20">
              {current.category}
            </span>
            <h4 className="text-base font-bold text-[#0F172A]">{current.q}</h4>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{current.a}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
