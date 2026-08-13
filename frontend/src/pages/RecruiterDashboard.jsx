import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, CheckCircle2, ShieldCheck, Search, Filter, Award, 
  MapPin, BookOpen, Star, Mail, Briefcase, ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getRecruiterDashboard, getRecruiterCandidates, getRecruiterAnalytics } from '../services/recruiterService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#F43F5E'];

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [candidatesPage, setCandidatesPage] = useState(1);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recruiterDashboardData', candidatesPage, searchQuery, skillFilter, roleFilter, minScoreFilter],
    queryFn: async () => {
      const filters = { search: searchQuery, skill: skillFilter, targetRole: roleFilter, minScore: minScoreFilter };
      const [dashRes, candRes, anRes] = await Promise.all([
        getRecruiterDashboard(),
        getRecruiterCandidates(candidatesPage, filters),
        getRecruiterAnalytics()
      ]);
      return {
        dashboard: dashRes.data.data,
        candidates: candRes.data.data,
        totalPages: candRes.data.totalPages,
        analytics: anRes.data.data
      };
    },
    keepPreviousData: true
  });

  const dashboardData = data?.dashboard;
  const candidates = data?.candidates || [];
  const totalPages = data?.totalPages || 1;
  const analytics = data?.analytics;

  const renderBadge = (text) => {
    if (text === 'Hire') return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">HIRE</span>;
    if (text === 'Consider') return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">CONSIDER</span>;
    if (text === 'Reject') return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">REJECT</span>;
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">{text}</span>;
  };

  if (isLoading && !data) return <DashboardLayout><div className="p-10 text-slate-500">Loading Talent Dashboard...</div></DashboardLayout>;
  if (isError) return <DashboardLayout><div className="p-10 text-rose-500">Failed to load dashboard. Please refresh.</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Talent Discovery Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">Discover, filter, and review high-performing candidates based on AI interview results.</p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
          {['Overview', 'Talent Pool', 'Analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Candidates', val: dashboardData?.totalCandidates || 0, icon: Users, color: 'text-indigo-600' },
                { label: 'Active Candidates', val: dashboardData?.activeCandidates || 0, icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'Avg AI Score', val: dashboardData?.averageCandidateScore || 0, icon: Award, color: 'text-purple-500' },
                { label: 'Avg Trust Score', val: dashboardData?.averageTrustScore || 0, icon: ShieldCheck, color: 'text-rose-500' },
              ].map((s) => (
                <div key={s.label} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">{s.label}</span>
                    <div className={`p-1.5 rounded-lg bg-slate-50 ${s.color}`}><s.icon className="w-4 h-4" /></div>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900">{s.val}</p>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Hiring Recommendations</h3>
                <div className="h-64 flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics?.hiringRecBreakdown || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="count" nameKey="name" label>
                        {(analytics?.hiringRecBreakdown || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Position Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.positionDist || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="position" type="category" width={100} tick={{fontSize: 10}} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TALENT POOL (CANDIDATES) TAB */}
        {activeTab === 'Talent Pool' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Discovery Filters */}
            <div className="flex flex-col md:flex-row gap-4 border-b border-slate-100 pb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={e => {setSearchQuery(e.target.value); setCandidatesPage(1);}}
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="relative">
                  <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by Skill..."
                    value={skillFilter}
                    onChange={e => {setSkillFilter(e.target.value); setCandidatesPage(1);}}
                    className="w-40 h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Role..."
                    value={roleFilter}
                    onChange={e => {setRoleFilter(e.target.value); setCandidatesPage(1);}}
                    className="w-32 h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <select 
                  value={minScoreFilter} 
                  onChange={e => {setMinScoreFilter(e.target.value); setCandidatesPage(1);}} 
                  className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="">Any Score</option>
                  <option value="9">9+ Score</option>
                  <option value="8">8+ Score</option>
                  <option value="7">7+ Score</option>
                </select>
              </div>
            </div>

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {candidates.map(c => (
                <div key={c._id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{c.name}</h4>
                          <p className="text-xs text-slate-500 truncate w-32">{c.targetRole || 'Software Engineer'}</p>
                        </div>
                      </div>
                      {renderBadge(c.recommendation)}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="truncate">{c.email}</span>
                      </div>
                      {c.college && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" /> <span className="truncate">{c.college}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(c.skills || []).slice(0, 4).map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-semibold border border-slate-200">
                          {skill}
                        </span>
                      ))}
                      {(c.skills?.length > 4) && <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[10px] font-semibold">+{c.skills.length - 4}</span>}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">AI Score</p>
                        <p className="text-lg font-black text-indigo-600">{c.aiScore}<span className="text-sm text-slate-400 font-medium">/10</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Trust</p>
                        <p className="text-lg font-black text-slate-700">{c.trustScore}%</p>
                      </div>
                    </div>
                    <Link to={`/dashboard/recruiter/candidate/${c._id}`} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {candidates.length === 0 && !isLoading && (
              <div className="p-12 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No candidates match your discovery filters.
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                disabled={candidatesPage <= 1}
                onClick={() => setCandidatesPage(p => p - 1)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg disabled:opacity-50 text-sm font-semibold hover:bg-slate-50"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-slate-500">Page {candidatesPage} of {totalPages}</span>
              <button
                disabled={candidatesPage >= totalPages}
                onClick={() => setCandidatesPage(p => p + 1)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg disabled:opacity-50 text-sm font-semibold hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'Analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Skill Demand</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.skillPerformance || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="skill" type="category" width={100} tick={{fontSize: 10}} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#6366F1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
