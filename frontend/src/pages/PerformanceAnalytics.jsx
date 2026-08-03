import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart3, CheckCircle2, TrendingUp, Download } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ProgressRing from '../components/ProgressRing';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PerformanceAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/candidate');
      setData(res.data.data);
    } catch (error) {
      toast.error('Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="pb-2 border-b border-[#E2E8F0] flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Performance Insights
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Track your practice scores and trust score over time.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500 mt-6">Loading your analytics...</div>
      ) : (
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="saas-card p-5 bg-white flex items-center gap-4 border border-slate-200 rounded-xl shadow-sm">
              <ProgressRing percentage={parseFloat(data?.averageScore || 0) * 10} size={80} strokeWidth={8} label="Score" />
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Average Score</span>
                <h3 className="text-lg font-extrabold text-[#0F172A]">{data?.averageScore || 0} / 10</h3>
                <p className="text-xs text-[#10B981] font-semibold mt-0.5">Overall Performance</p>
              </div>
            </div>

            <div className="saas-card p-5 bg-white flex items-center gap-4 border border-slate-200 rounded-xl shadow-sm">
              <ProgressRing percentage={100} size={80} strokeWidth={8} label="Answers" />
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Questions Answered</span>
                <h3 className="text-lg font-extrabold text-[#0F172A]">{data?.totalAnswers || 0}</h3>
                <p className="text-xs text-[#10B981] font-semibold mt-0.5">Total attempts</p>
              </div>
            </div>

            <div className="saas-card p-5 bg-white flex items-center gap-4 border border-slate-200 rounded-xl shadow-sm">
              <ProgressRing percentage={
                data?.trustScoreTrend?.length > 0 ? data.trustScoreTrend[data.trustScoreTrend.length - 1].score : 100
              } size={80} strokeWidth={8} label="Trust" />
              <div>
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase">Latest Trust Score</span>
                <h3 className="text-lg font-extrabold text-[#0F172A]">
                  {data?.trustScoreTrend?.length > 0 ? data.trustScoreTrend[data.trustScoreTrend.length - 1].score : 100} / 100
                </h3>
                <p className="text-xs text-[#4F46E5] font-semibold mt-0.5">Integrity rating</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Trust Score Trend
            </h3>
            <div className="h-64">
              {data?.trustScoreTrend?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trustScoreTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  Complete an interview to see your trust score trend.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
