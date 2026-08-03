import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Zap,
  ArrowRight,
  Mic,
  Video,
  FileText,
  Target,
  Bot,
  BarChart3,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AiBackgroundAnimation from '../components/AiBackgroundAnimation';

export default function Home() {
  const handlePillClick = (label) => {
    toast.success(`Selected ${label} practice mode`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] font-sans antialiased text-[#0F172A] selection:bg-[#7C3AED]/10 selection:text-[#7C3AED] relative overflow-x-hidden">
      {/* Ambient Backdrop */}
      <AiBackgroundAnimation />

      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 z-10">
        <div className="w-[95%] max-w-[95%] mx-auto px-3 sm:px-6 text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5F3FF] border border-[#8B5CF6]/30 text-sm font-bold text-[#7C3AED] mb-8 shadow-sm">
            <Bot className="w-4 h-4 text-[#7C3AED]" />
            <span>AI-Powered Campus Placement Coach for 2026</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0F172A] tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Ace Your Next <span className="text-[#7C3AED]">Job Interview</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[#64748B] max-w-2xl mx-auto font-normal leading-relaxed">
            Practice voice & video mock questions, verify ATS resume compatibility, and build confidence with real-time AI feedback.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-gradient-primary text-white text-base font-bold shadow-royal-glow hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Start Practicing</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full border border-[#CBD5E1] bg-white text-base font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm"
            >
              View Pricing
            </Link>
          </div>

          {/* Target Audience Pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm font-bold text-[#0F172A]">
            {[
              { emoji: '🎓', label: 'College Students' },
              { emoji: '🚀', label: 'Freshers' },
              { emoji: '💼', label: 'Job Seekers' },
              { emoji: '🏫', label: 'Campus Placement Drives' },
            ].map((pill) => (
              <button
                key={pill.label}
                onClick={() => handlePillClick(pill.label)}
                className="px-6 py-3 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] shadow-sm hover:border-[#7C3AED] hover:text-[#7C3AED] hover:bg-[#F5F3FF] transition-all flex items-center gap-2.5 cursor-pointer hover:-translate-y-0.5"
              >
                <span className="text-base">{pill.emoji}</span>
                <span>{pill.label}</span>
              </button>
            ))}
          </div>

          {/* Interactive Studio Preview Card */}
          <div className="mt-16 max-w-5xl mx-auto saas-card p-6 sm:p-8 bg-white border border-[#E2E8F0] text-left relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-6 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-bold text-[#0F172A]">Live Studio Session — Senior React Engineer</span>
              </div>
              <span className="text-[#10B981] font-extrabold bg-[#ECFDF5] px-4 py-1.5 rounded-full text-xs border border-[#10B981]/20">
                Active Session
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="p-6 rounded-2xl bg-[#F5F3FF] border border-[#8B5CF6]/30">
                  <span className="inline-block text-xs font-bold text-[#7C3AED] uppercase tracking-wider bg-white px-3 py-1 rounded-full mb-2 border border-[#8B5CF6]/20">
                    Question 2 of 5
                  </span>
                  <p className="text-base font-bold text-[#0F172A] mt-1 leading-snug">
                    "How do you handle state re-renders and memoization in large scale React applications?"
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between text-sm">
                  <span className="font-bold text-[#64748B]">Candidate Voice Audio Input</span>
                  <span className="text-[#10B981] font-extrabold bg-[#ECFDF5] px-3.5 py-1 rounded-full border border-[#10B981]/20">
                    Recording • 0:42s
                  </span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">AI Feedback Rating</span>
                  <p className="text-4xl font-extrabold text-[#0F172A] mt-2">9.2 / 10</p>
                </div>
                <div className="text-sm text-[#10B981] font-bold mt-4 inline-flex items-center gap-1.5 bg-[#ECFDF5] px-3.5 py-1.5 rounded-full border border-[#10B981]/20 w-fit">
                  ✓ STAR Structure Validated
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#FAFAFC] z-10 relative border-t border-[#E2E8F0]">
        <div className="w-[95%] max-w-[95%] mx-auto px-3 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Tools Built for Placement Success
            </h2>
            <p className="text-base sm:text-lg text-[#64748B] mt-4 font-normal">
              Practice tailored technical questions, optimize your ATS resume score, and refine video presentation posture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Mic, title: 'AI Voice Mock Studio', desc: 'Practice answering custom questions tailored to job description, years of experience, and difficulty level.' },
              { icon: FileText, title: 'ATS Resume Matcher', desc: 'Compare your resume against real job postings to find missing keywords and formatting improvements.' },
              { icon: BarChart3, title: 'Detailed Feedback Reports', desc: 'Get 10-point ratings, ideal model answers, grammatical suggestions, and STAR method analysis.' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="saas-card saas-card-hover p-8 bg-white border border-[#E2E8F0]">
                  <div className="w-14 h-14 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center mb-6 border border-[#8B5CF6]/30 shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">{f.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
