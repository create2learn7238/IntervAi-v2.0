import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#151C2C] border-t border-[#E4E4E7] dark:border-[#26334D] py-16 relative z-10 transition-colors duration-200">
      <div className="w-[95%] max-w-[95%] mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-sm">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-[#0F172A] dark:text-white">
                  Interv<span className="text-[#6366F1] dark:text-[#818CF8]">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-[#52525B] dark:text-[#94A3B8] -mt-1 tracking-wider uppercase">
                  Modern AI Career Platform
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-[#52525B] dark:text-[#94A3B8] leading-relaxed max-w-sm">
              The AI-powered interview preparation suite designed for college students, freshers, job seekers, and campus placement cells.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/30 border border-[#10B981]/20 text-xs font-semibold text-[#10B981]">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>All Systems Operational</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#52525B] dark:text-[#94A3B8]">
              <li><Link to="/dashboard" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">AI Mock Interview</Link></li>
              <li><Link to="/dashboard/questions" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">Question Bank</Link></li>
              <li><Link to="/dashboard/dressing-posture" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">Dress & Posture</Link></li>
            </ul>
          </div>

          {/* Target Audience */}
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider mb-4">Solutions</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#52525B] dark:text-[#94A3B8]">
              <li><a href="#target" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">College Students</a></li>
              <li><a href="#target" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">Fresh Graduates</a></li>
              <li><a href="#target" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">Job Seekers</a></li>
              <li><a href="#target" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">Placement Cells</a></li>
              <li><a href="#target" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">Campus Drives</a></li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#52525B] dark:text-[#94A3B8]">
              <li><a href="#" className="hover:text-[#4338CA] dark:hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E4E4E7] dark:border-[#26334D] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52525B] dark:text-[#94A3B8]">
          <p>© {new Date().getFullYear()} IntervAI Inc. Built for student career acceleration.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-full text-[#52525B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F4F4F6] dark:hover:bg-[#1E293B] transition-colors" title="Global Site">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
