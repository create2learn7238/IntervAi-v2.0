import React, { useState } from 'react';
import { FileText, CheckCircle2, AlertCircle, Award, Sparkles, Upload, ArrowRight, BarChart2, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ProgressRing from '../components/ProgressRing';
import { toast } from 'react-hot-toast';

export default function AtsScore() {
  const [targetRole, setTargetRole] = useState('Full Stack MERN Developer');
  const [atsScore, setAtsScore] = useState(88);

  const matchedKeywords = [
    'React.js', 'Node.js', 'Express.js', 'MongoDB', 'JavaScript (ES6+)',
    'REST APIs', 'Git / GitHub', 'Tailwind CSS', 'JWT Authentication'
  ];

  const missingKeywords = [
    'TypeScript', 'Docker / Containerization', 'CI/CD Pipelines', 'System Architecture'
  ];

  const recommendations = [
    { title: 'Incorporate Quantifiable Metrics', desc: 'Add numbers to work experience bullets (e.g. "Optimized API load latency by 35%").' },
    { title: 'Add Cloud & Container Skills', desc: 'Include Docker, AWS, or CI/CD tools to raise your profile ATS tier to 95+.' },
    { title: 'Standardize Job Section Titles', desc: 'Ensure standard headers like "Work Experience" and "Technical Skills" for optimal ATS parser extraction.' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ATS Resume Optimizer Studio</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              ATS Compatibility & Keyword Breakdown
            </h1>
            <p className="text-xs font-normal leading-relaxed text-slate-600">
              Evaluate how your resume matches target job positions and employer Applicant Tracking Systems.
            </p>
          </div>
        </div>

        {/* Score Ring Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-indigo-600">
          <div className="flex items-center gap-6">
            <ProgressRing percentage={atsScore} size={100} strokeWidth={9} label="Match" />
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Target Position Match
              </span>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                {targetRole}
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ✓ 88% ATS Pass Rate
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Top 12% Applicant Tier
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Keywords Matching Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Keywords */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900">Matched Skills ({matchedKeywords.length})</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Present on Resume
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                >
                  ✓ {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Missing Keywords */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold text-slate-900">Recommended Keywords ({missingKeywords.length})</h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Action Items
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold"
                >
                  + Add {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-semibold text-slate-900">AI Optimization Recommendations</h3>
            <span className="text-xs text-slate-500 font-normal">Updated in real-time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-900">{rec.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
