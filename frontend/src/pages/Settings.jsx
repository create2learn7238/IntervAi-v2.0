import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Volume2, Mic, Bot, Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const [aiPersona, setAiPersona] = useState('Strict Recruiter');
  const [speechRate, setSpeechRate] = useState('0.9x');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoRecord, setAutoRecord] = useState(true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('AI studio preferences saved!');
  };

  return (
    <DashboardLayout>
      <div className="pb-2 border-b border-[#E2E8F0]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-[11px] font-bold text-[#4F46E5] mb-1">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Platform Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          AI Studio Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Customize AI question difficulty, interviewer persona, voice synthesis speed, and privacy controls.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
        {/* AI Interviewer Persona */}
        <div className="saas-card p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <Bot className="w-4 h-4 text-[#4F46E5]" />
            <h3 className="text-sm font-bold text-[#0F172A]">AI Interviewer Persona</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'Strict Recruiter', title: 'Strict Tier-1 Recruiter', desc: 'Detailed grilling on edge cases & syntax.' },
              { id: 'Encouraging Coach', title: 'Encouraging Mentor', desc: 'Gentle hints & constructive model answers.' },
              { id: 'Campus Placement Officer', title: 'Campus Officer', desc: 'Standard HR & core CS fundamentals focus.' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setAiPersona(p.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  aiPersona === p.id
                    ? 'bg-[#EEF2FF] border-[#6366F1] shadow-sm'
                    : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                }`}
              >
                <h4 className="text-xs font-bold text-[#0F172A]">{p.title}</h4>
                <p className="text-[11px] text-[#64748B] mt-1 leading-relaxed">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Speech Controls */}
        <div className="saas-card p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <Volume2 className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Voice Synthesis & Audio Level</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                AI Voice Playback Rate
              </label>
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-input text-xs font-medium focus:outline-none focus:border-[#4F46E5]"
              >
                <option value="0.8x">0.8x (Slower / Clearer)</option>
                <option value="0.9x">0.9x (Recommended Standard)</option>
                <option value="1.0x">1.0x (Normal Speed)</option>
                <option value="1.1x">1.1x (Fast Speed)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <div>
                <h4 className="text-xs font-bold text-[#0F172A]">Speech Recognition Auto-start</h4>
                <p className="text-[11px] text-[#64748B]">Automatically listen when question is read</p>
              </div>
              <input
                type="checkbox"
                checked={autoRecord}
                onChange={(e) => setAutoRecord(e.target.checked)}
                className="w-4 h-4 text-[#4F46E5] rounded border-[#CBD5E1] focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>

        {/* Privacy & Notifications */}
        <div className="saas-card p-6 bg-white space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E2E8F0]">
            <Shield className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-bold text-[#0F172A]">Privacy & Data Security</h3>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
            <div>
              <h4 className="text-xs font-bold text-[#0F172A]">No Video Storage Policy</h4>
              <p className="text-[11px] text-[#64748B]">Webcam feeds are processed locally in-browser only</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold">
              ✓ Active Zero-Storage
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-btn bg-gradient-primary text-white text-xs font-semibold shadow-saas-glow hover:opacity-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
