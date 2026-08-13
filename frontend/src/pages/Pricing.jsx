import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AiBackgroundAnimation from '../components/AiBackgroundAnimation';

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] relative overflow-x-hidden">
      {/* Animated AI Background */}
      <AiBackgroundAnimation />

      <Header />

      <section className="py-12 lg:py-16 relative z-10">
        <div className="w-[95%] max-w-[95%] mx-auto px-2 sm:px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
            Simple, Fair Pricing
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-2 max-w-md mx-auto">
            Start for free. Upgrade anytime for unlimited mock practice and ATS resume optimization.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex items-center gap-2 p-1 rounded-full bg-white border border-[#E2E8F0] shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                !annual ? 'bg-[#0F172A] text-white' : 'text-[#64748B]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                annual ? 'bg-gradient-primary text-white' : 'text-[#64748B]'
              }`}
            >
              Annual (20% Off)
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            {/* Free */}
            <div className="saas-card p-6 bg-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#64748B] uppercase">Free</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] mt-1">$0</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Basic student prep</p>

                <ul className="mt-5 space-y-2.5 text-xs text-[#64748B]">
                  {['3 AI Mock Sessions / Month', 'Basic ATS Resume Checker', 'Question Bank Access'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F1F5F9]">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-btn border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Start Free
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="saas-card p-6 bg-white border-2 border-[#6366F1] shadow-saas-glow flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="text-xs font-bold text-[#4F46E5] uppercase">Pro Candidate</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] mt-1">
                  {annual ? '$12' : '$15'} <span className="text-xs text-[#64748B] font-normal">/ mo</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">Full practice suite</p>

                <ul className="mt-5 space-y-2.5 text-xs text-[#0F172A] font-semibold">
                  {[
                    'Unlimited Mock Sessions',
                    'Full ATS Resume Optimizer',
                    'Realtime Speech & Tone Feedback',
                    'Dress & Posture Guidance',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#4F46E5]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F1F5F9]">
                <Link
                  to="/register"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-btn bg-gradient-primary text-white text-xs font-semibold shadow-sm hover:opacity-95"
                >
                  <span>Start 7-Day Free Trial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Campus */}
            <div className="saas-card p-6 bg-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#64748B] uppercase">Placement Cell</span>
                <h3 className="text-2xl font-extrabold text-[#0F172A] mt-1">Custom</h3>
                <p className="text-xs text-[#64748B] mt-0.5">For colleges & drives</p>

                <ul className="mt-5 space-y-2.5 text-xs text-[#64748B]">
                  {['Batch Student Analytics', 'Cohort Leaderboards', 'Bulk Student Licenses'].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-[#F1F5F9]">
                <a
                  href="mailto:campus@interai.app"
                  className="w-full inline-flex items-center justify-center py-2.5 rounded-btn border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
