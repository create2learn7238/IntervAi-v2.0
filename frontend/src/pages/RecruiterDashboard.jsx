import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Users, Calendar, CheckCircle2, AlertTriangle, FileText,
  Search, ShieldCheck, Download, Plus, X, Bell, User, Clock, Award
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import {
  getRecruiterDashboard, getRecruiterCandidates,
  getRecruiterInterviews, scheduleInterview, cancelInterview,
  getRecruiterAnalytics, getNotifications, markNotificationRead
} from '../services/recruiterService';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#F43F5E'];

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({ candidateEmail: '', jobposition: '', jobdescription: '', jobexp: '', scheduledDate: '' });

  const [candidatesPage, setCandidatesPage] = useState(1);
  const [interviewsPage, setInterviewsPage] = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recruiterDashboardData', candidatesPage, interviewsPage],
    queryFn: async () => {
      const [dashRes, candRes, intRes, anRes, notifRes] = await Promise.all([
        getRecruiterDashboard(),
        getRecruiterCandidates(candidatesPage),
        getRecruiterInterviews(interviewsPage),
        getRecruiterAnalytics(),
        getNotifications()
      ]);
      return {
        dashboard: dashRes.data.data,
        candidates: candRes.data.data,
        interviews: intRes.data.data,
        analytics: anRes.data.data,
        notifications: notifRes.data.data
      };
    }
  });

  const dashboardData = data?.dashboard;
  const candidates = data?.candidates?.data || [];
  const candidatesTotalPages = data?.candidates?.totalPages || 1;
  const interviews = data?.interviews?.data || [];
  const interviewsTotalPages = data?.interviews?.totalPages || 1;
  const analytics = data?.analytics;
  const notifications = data?.notifications?.data || [];

  const scheduleMutation = useMutation({
    mutationFn: (form) => scheduleInterview(form),
    onSuccess: () => {
      toast.success('Interview Scheduled!');
      setShowScheduleModal(false);
      queryClient.invalidateQueries(['recruiterDashboardData']);
    },
    onError: () => toast.error('Failed to schedule interview')
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelInterview(id),
    onSuccess: () => {
      toast.success('Interview Cancelled');
      queryClient.invalidateQueries(['recruiterDashboardData']);
    },
    onError: () => toast.error('Failed to cancel')
  });

  const notifMutation = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['recruiterDashboardData']);
    }
  });

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    scheduleMutation.mutate(scheduleForm);
  };

  const handleCancelInterview = (id) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    cancelMutation.mutate(id);
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) {
      notifMutation.mutate(notif._id);
    }
  };

  const renderBadge = (text) => {
    if (text === 'Hire') return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">HIRE</span>;
    if (text === 'Consider') return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">CONSIDER</span>;
    if (text === 'Reject') return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">REJECT</span>;
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">{text}</span>;
  };

  if (isLoading) return <DashboardLayout><div className="p-10 text-slate-500">Loading Dashboard Data...</div></DashboardLayout>;
  if (isError) return <DashboardLayout><div className="p-10 text-rose-500">Failed to load dashboard. Please refresh.</div></DashboardLayout>;

  const filteredCandidates = candidates.filter(c => 
    (c.candidateEmail || '').includes(searchQuery) &&
    (statusFilter === 'All' || c.status === statusFilter)
  );

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10 relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Recruiter Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Recruiter Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {unreadNotifs > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></span>}
            </button>
            {activeTab === 'Interviews' && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Schedule
              </button>
            )}
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotifications && (
          <div className="absolute top-16 right-0 w-80 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden">
            <div className="bg-slate-50 p-3 border-b border-slate-200 font-bold text-sm text-slate-700 flex justify-between">
              Notifications
              <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div key={n._id} onClick={() => handleNotificationClick(n)} className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/30' : ''}`}>
                    <p className={`text-sm ${!n.read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>{n.message}</p>
                    <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Custom Tabs */}
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
          {['Overview', 'Candidates', 'Interviews', 'Analytics', 'Reports'].map(tab => (
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
                { label: 'Assigned Candidates', val: dashboardData?.totalCandidates || 0, icon: Users, color: 'text-indigo-600' },
                { label: 'Upcoming Interviews', val: dashboardData?.scheduledInterviews || 0, icon: Calendar, color: 'text-blue-500' },
                { label: 'Completed Interviews', val: dashboardData?.completedInterviews || 0, icon: CheckCircle2, color: 'text-emerald-500' },
                { label: 'In Progress', val: dashboardData?.activeInterviews || 0, icon: Clock, color: 'text-amber-500' },
                { label: 'Avg AI Score', val: dashboardData?.averageCandidateScore || 0, icon: Award, color: 'text-purple-500' },
                { label: 'Avg Trust Score', val: dashboardData?.averageTrustScore || 0, icon: ShieldCheck, color: 'text-rose-500' },
                { label: 'Requires Review', val: dashboardData?.candidatesRequiringReview || 0, icon: AlertTriangle, color: 'text-orange-500' },
                { label: 'Reports Pending', val: dashboardData?.reportsPendingReview || 0, icon: FileText, color: 'text-teal-500' },
              ].map((s) => (
                <div key={s.label} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight w-20">{s.label}</span>
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

        {/* CANDIDATES TAB */}
        {activeTab === 'Candidates' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Candidate Management</h3>
              <div className="flex gap-2">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                    <th className="pb-3 px-4">Candidate Email</th>
                    <th className="pb-3 px-4">Role</th>
                    <th className="pb-3 px-4">AI Score</th>
                    <th className="pb-3 px-4">Trust</th>
                    <th className="pb-3 px-4">Recommendation</th>
                    <th className="pb-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCandidates.map(c => (
                    <tr key={c.mockid} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{c.candidateEmail || 'Self-Assigned'}</td>
                      <td className="py-3 px-4 text-slate-500">{c.jobposition}</td>
                      <td className="py-3 px-4 font-bold">{c.aiScore}/10</td>
                      <td className="py-3 px-4 font-bold">{c.trustScore}%</td>
                      <td className="py-3 px-4">{renderBadge(c.recommendation)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/dashboard/recruiter/candidate/${c.mockid}`} className="text-indigo-600 hover:underline text-xs font-bold">View Profile</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCandidates.length === 0 && <div className="p-8 text-center text-slate-500 text-sm">No candidates match filters.</div>}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                disabled={candidatesPage <= 1}
                onClick={() => setCandidatesPage(p => p - 1)}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50 text-sm font-semibold"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-slate-500">Page {candidatesPage} of {candidatesTotalPages}</span>
              <button
                disabled={candidatesPage >= candidatesTotalPages}
                onClick={() => setCandidatesPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50 text-sm font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* INTERVIEWS TAB */}
        {activeTab === 'Interviews' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Interview Management</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                    <th className="pb-3 px-4">Interview ID</th>
                    <th className="pb-3 px-4">Candidate</th>
                    <th className="pb-3 px-4">Scheduled Date</th>
                    <th className="pb-3 px-4">Violations</th>
                    <th className="pb-3 px-4">Status</th>
                    <th className="pb-3 px-4 text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {interviews.map(i => (
                    <tr key={i.mockid} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{i.mockid}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{i.candidateEmail || 'Self'}</td>
                      <td className="py-3 px-4 text-slate-500">{i.scheduledDate ? new Date(i.scheduledDate).toLocaleDateString() : 'N/A'}</td>
                      <td className="py-3 px-4 text-rose-500 font-bold">{i.violationsCount || 0}</td>
                      <td className="py-3 px-4">{renderBadge(i.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/dashboard/recruiter/candidate/${i.mockid}`} className="text-indigo-600 hover:underline text-xs font-bold mr-3">Details</Link>
                        {i.status !== 'Cancelled' && (
                          <button onClick={() => handleCancelInterview(i.mockid)} className="text-rose-500 hover:underline text-xs font-bold">Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                disabled={interviewsPage <= 1}
                onClick={() => setInterviewsPage(p => p - 1)}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50 text-sm font-semibold"
              >
                Previous
              </button>
              <span className="text-sm font-bold text-slate-500">Page {interviewsPage} of {interviewsTotalPages}</span>
              <button
                disabled={interviewsPage >= interviewsTotalPages}
                onClick={() => setInterviewsPage(p => p + 1)}
                className="px-3 py-1 bg-slate-100 text-slate-600 rounded disabled:opacity-50 text-sm font-semibold"
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
              <h3 className="text-lg font-bold text-slate-900 mb-4">Skill Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.skillPerformance || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="skill" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#6366F1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Weekly Interview Activity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.completionTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="scheduled" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'Reports' && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">Download Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {['Candidate Report', 'Interview Report', 'AI Feedback Report', 'Trust Report', 'Violation Report'].map(rep => (
                <div key={rep} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toast.success(`Downloaded ${rep}`)}>
                  <span className="font-semibold text-slate-700 text-sm">{rep}</span>
                  <button className="p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduling Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">Schedule Interview</h2>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleScheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Candidate Email</label>
                  <input required type="email" value={scheduleForm.candidateEmail} onChange={e => setScheduleForm({...scheduleForm, candidateEmail: e.target.value})} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Role</label>
                  <input required type="text" value={scheduleForm.jobposition} onChange={e => setScheduleForm({...scheduleForm, jobposition: e.target.value})} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input required type="text" value={scheduleForm.jobexp} onChange={e => setScheduleForm({...scheduleForm, jobexp: e.target.value})} className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Job Description</label>
                  <textarea required value={scheduleForm.jobdescription} onChange={e => setScheduleForm({...scheduleForm, jobdescription: e.target.value})} className="w-full h-20 p-3 border border-slate-300 rounded-lg text-sm"></textarea>
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white font-bold h-10 rounded-lg hover:bg-indigo-700">Schedule Now</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
