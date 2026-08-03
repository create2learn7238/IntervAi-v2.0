import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, Video, FileText, Bot } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AiBackgroundAnimation from '../components/AiBackgroundAnimation';

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState('');

  const faqs = [
    {
      q: 'How does the AI Mock Interview evaluate answers?',
      a: 'InterAI converts your spoken voice responses to text and evaluates technical accuracy, STAR structure, and speech clarity.',
    },
    {
      q: 'Is my webcam video saved anywhere?',
      a: 'No. Video streams are processed locally in your browser for camera posture and eye contact checks. No video is ever saved.',
    },
    {
      q: 'How does the ATS Resume Checker work?',
      a: 'The ATS engine compares your resume text with job description requirements to highlight missing skills and formatting tips.',
    },
    {
      q: 'Can I practice non-technical HR questions?',
      a: 'Yes, visit Behavioral Prep or Question Bank in your dashboard to practice non-technical questions.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] relative overflow-x-hidden">
      {/* Animated AI Background */}
      <AiBackgroundAnimation />

      <Header />

      <section className="py-12 lg:py-16 relative z-10">
        <div className="w-[95%] max-w-[95%] mx-auto px-2 sm:px-4 max-w-3xl space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Help Center & FAQ
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Find answers to common questions about mock interviews and ATS resume scores.
            </p>

            <div className="relative max-w-md mx-auto mt-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search help topics..."
                className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-input text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>
          </div>

          <div className="saas-card p-5 sm:p-6 bg-white space-y-3">
            <h2 className="text-xs font-bold text-[#0F172A] pb-2 border-b border-[#E2E8F0]">
              Frequently Asked Questions
            </h2>

            <div className="divide-y divide-[#F1F5F9]">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className="py-3">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left gap-3 hover:text-[#4F46E5] transition-colors"
                  >
                    <span className="text-xs font-bold text-[#0F172A]">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748B] flex-shrink-0 transition-transform ${
                        openFaq === i ? 'rotate-180 text-[#4F46E5]' : ''
                      }`}
                    />
                  </button>
                  {openFaq === i && (
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
