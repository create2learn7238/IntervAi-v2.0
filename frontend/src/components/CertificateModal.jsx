import React from 'react';
import { X, Award, CheckCircle2, Printer, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * CertificateModal - Placement Readiness Certificate with dynamic prop resolution.
 */
export default function CertificateModal({
  isOpen,
  onClose,
  score,
  overallScore,
  role,
  jobPosition,
  jobposition,
  candidateName,
}) {
  const { user } = useAuth();
  if (!isOpen) return null;

  const displayName = candidateName || user?.name || 'Candidate';
  const displayScore = score || overallScore || '0.0';
  const displayRole = role || jobPosition || jobposition || 'Software Developer';

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const certificateId = `INTV-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200 overflow-hidden space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Canvas */}
        <div id="certificate-print-area" className="p-8 border-4 border-double border-indigo-200 rounded-xl bg-gradient-to-br from-slate-50 via-white to-indigo-50/50 text-center relative overflow-hidden space-y-4">
          {/* Top Stamp */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>OFFICIAL INTERVAI PLACEMENT READINESS CERTIFICATE</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Certificate of Excellence
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
            This is proudly awarded to
          </p>

          {/* Candidate Name */}
          <h2 className="text-2xl font-semibold text-indigo-700 my-2 underline underline-offset-8 decoration-indigo-300">
            {displayName}
          </h2>

          <p className="text-sm font-normal leading-relaxed text-slate-600 max-w-lg mx-auto">
            for successfully completing the <strong>AI Mock Interview Assessment</strong> for the position of{' '}
            <span className="font-semibold text-slate-900">{displayRole}</span> with an evaluation score of{' '}
            <span className="font-semibold text-emerald-700">{displayScore} / 10</span>.
          </p>

          {/* Verification Badge & Date */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Issued Date</p>
              <p className="text-xs font-semibold text-slate-900">{currentDate}</p>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified: {certificateId}</span>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Authorized Engine</p>
              <p className="text-xs font-semibold text-indigo-600">IntervAI AI Coach</p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
