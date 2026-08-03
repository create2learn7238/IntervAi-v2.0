import React, { useState, useEffect } from 'react';
import { Bot, ArrowLeft, ArrowRight, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../services/api';
import { toast } from 'react-hot-toast';

export default function BasicPractice() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await api.get('/interviews/practice');
        setQuestions(data);
      } catch (err) {
        toast.error('Failed to generate dynamic practice questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-slate-600 font-medium">Generating your dynamic practice questions with AI...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-slate-600 font-medium text-lg">Failed to load practice questions.</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Try Again</button>
        </div>
      </DashboardLayout>
    );
  }

  const current = questions[active];

  return (
    <DashboardLayout>
      <div className="pb-2 border-b border-[#E2E8F0]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-[11px] font-bold text-[#4F46E5] mb-1">
          <Bot className="w-3.5 h-3.5" />
          <span>Behavioral HR Flashcards</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Behavioral & Non-Technical Practice
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Master behavioral interview scenarios using the STAR method (Situation, Task, Action, Result).
        </p>
      </div>

      {/* Progress Cards */}
      <div className="flex flex-wrap gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              active === i
                ? 'bg-gradient-primary text-white shadow-saas-glow'
                : revealed[i]
                ? 'bg-[#ECFDF5] text-[#10B981] border border-[#10B981]/20'
                : 'bg-white border border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            Question {i + 1}
          </button>
        ))}
      </div>

      {/* Main Flashcard */}
      <div className="saas-card p-6 sm:p-8 bg-white space-y-6 max-w-3xl">
        <span className="px-2.5 py-1 rounded-md bg-[#EEF2FF] text-[#4F46E5] text-[10px] font-bold">
          Category: {current.category}
        </span>

        <div className="p-6 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
          <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Question Prompt</span>
          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] leading-relaxed">{current.q}</h3>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => setRevealed((r) => ({ ...r, [active]: !r[active] }))}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-btn text-xs font-semibold transition-all ${
              revealed[active]
                ? 'bg-[#EEF2FF] text-[#4F46E5] border border-[#6366F1]/30'
                : 'bg-gradient-primary text-white shadow-saas-glow'
            }`}
          >
            {revealed[active] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{revealed[active] ? 'Hide Model Structure' : 'Reveal Ideal Answer Model'}</span>
          </button>
        </div>

        {revealed[active] && (
          <div className="p-6 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20 space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-[#10B981]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended STAR Answer Structure</span>
            </div>
            <p className="text-xs text-[#0F172A] leading-relaxed">{current.a}</p>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t border-[#F1F5F9]">
          <button
            disabled={active === 0}
            onClick={() => setActive((a) => a - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-btn border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>
          <button
            disabled={active === questions.length - 1}
            onClick={() => setActive((a) => a + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-btn bg-gradient-primary text-white text-xs font-semibold shadow-sm disabled:opacity-30"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
