import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowRight, Search } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getInterviews } from '../services/interviewService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function InterviewHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.email) return;
    getInterviews(user.email)
      .then(({ data }) => {
        const fetchedData = data?.data || data;
        setInterviews(Array.isArray(fetchedData) ? fetchedData : []);
      })
      .catch(() => toast.error('Failed to load session history'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const filtered = interviews.filter((i) =>
    i.jobposition?.toLowerCase().includes(search.toLowerCase()) ||
    i.jobdescription?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="pb-2 border-b border-[#E2E8F0]">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EEF2FF] border border-[#6366F1]/20 text-[11px] font-bold text-[#4F46E5] mb-1">
          <History className="w-3.5 h-3.5" />
          <span>Session Log & Audit Trail</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
          Interview History & Archives
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
          Review all your previous practice sessions, model answers, and AI performance reports.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter sessions by role..."
            className="w-full h-10 pl-10 pr-4 bg-white border border-[#E2E8F0] rounded-input text-xs font-medium focus:outline-none focus:border-[#4F46E5]"
          />
        </div>
        <span className="text-xs text-[#64748B] font-semibold">
          Showing {filtered.length} total sessions
        </span>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="saas-card p-12 text-center bg-white">
          <History className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">No interview sessions found</h3>
          <p className="text-xs text-[#64748B] mt-1">Start a new AI mock interview to build your practice history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item._id || item.mockid} className="saas-card saas-card-hover p-5 bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EEF2FF] text-[#4F46E5]">
                    {item.difficulty || 'Intermediate'}
                  </span>
                  <span className="text-[11px] text-[#94A3B8]">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0F172A] mb-1">{item.jobposition}</h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4">
                  {item.jobdescription}
                </p>

                <div className="flex items-center gap-3 text-xs text-[#64748B] mb-4">
                  <span className="font-semibold text-[#0F172A]">{item.jobexp} yrs exp</span>
                  <span>•</span>
                  <span className="text-[#10B981] font-bold">5 Questions</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#F1F5F9]">
                <button
                  onClick={() => navigate(`/dashboard/interview/${item.mockid}/feedback`)}
                  className="flex-1 h-9 rounded-btn border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC]"
                >
                  View Report
                </button>
                <button
                  onClick={() => navigate(`/dashboard/interview/${item.mockid}/start`)}
                  className="flex-1 h-9 rounded-btn bg-gradient-primary text-white text-xs font-semibold shadow-sm hover:opacity-95 flex items-center justify-center gap-1"
                >
                  <span>Retake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
