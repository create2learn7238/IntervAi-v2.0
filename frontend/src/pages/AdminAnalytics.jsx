import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users, Award, TrendingUp, Download, CheckCircle2,
  BarChart3, Search, ShieldCheck, Briefcase, Trash2, Video
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getAdminAnalytics, getAdminUsers, deactivateUser, updateUserRole, toggleUserSuspension, getAdminInterviews, getAdminFeedbacks } from '../services/adminService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [interviewsList, setInterviewsList] = useState([]);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  // Debounce search query to trigger fetch
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Will trigger fetchData due to above effect
      } else {
        fetchData();
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes, interviewsRes, feedbacksRes] = await Promise.all([
        getAdminAnalytics(),
        getAdminUsers({ page: currentPage, limit: 10, search: searchQuery }),
        getAdminInterviews(),
        getAdminFeedbacks()
      ]);
      setData(analyticsRes.data.data);
      setUsersList(usersRes.data.data.users);
      setInterviewsList(interviewsRes.data.data);
      setFeedbacksList(feedbacksRes.data.data || []);
      setTotalPages(usersRes.data.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        toast.error(err.response?.data?.error || 'Failed to load admin dashboard', { id: 'admin-dashboard-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await deactivateUser(id);
      toast.success('User deactivated');
      fetchData(); // refresh
    } catch (e) {
      toast.error('Failed to deactivate user');
    }
  };

  const handleToggleSuspension = async (id, currentStatus) => {
    try {
      await toggleUserSuspension(id, !currentStatus);
      toast.success(currentStatus ? 'User unsuspended' : 'User suspended');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update suspension status');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update role');
    }
  };

  const filteredUsers = usersList; // Filtering is now done on the backend

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Platform Analytics & User Management
            </h1>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-500">Loading data...</div>
        ) : (
          <>
            {/* Custom Tabs */}
            <div className="flex border-b border-slate-200 gap-6 overflow-x-auto mb-6">
              {['Overview', 'User Management', 'Interview Sessions', 'Feedbacks'].map(tab => (
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

            {/* Overview Tab */}
            {activeTab === 'Overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Total Users', val: data?.totalUsers || 0, icon: Users, color: 'text-indigo-600' },
                { label: 'Total Interviews', val: data?.totalInterviews || 0, icon: BarChart3, color: 'text-blue-600' },
                { label: 'Avg Trust Score', val: `${data?.averageTrustScore || 0} / 100`, icon: Award, color: 'text-emerald-500' },
                { label: 'Certificates Issued', val: data?.totalCertificates || 0, icon: TrendingUp, color: 'text-amber-500' },
              ].map((s) => (
                <div key={s.label} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
                    <div className={`p-2 rounded-xl bg-slate-50 ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 mt-3">{s.val}</p>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Daily Interviews</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.dailyInterviews || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">User Growth (Last 7 Days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.userGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'User Management' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">User Management</h3>
                  <p className="text-xs text-slate-500">Manage candidates and recruiters across the platform</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full h-9 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 px-4">Name</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 px-4">Role</th>
                      <th className="pb-3 px-4">Status</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{user.name}</td>
                        <td className="py-3 px-4 text-slate-500">{user.email}</td>
                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none ${user.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                                user.role === 'recruiter' ? 'bg-indigo-100 text-indigo-700' :
                                  'bg-emerald-100 text-emerald-700'
                              }`}
                          >
                            <option value="student" className="bg-white text-slate-800">STUDENT</option>
                            <option value="recruiter" className="bg-white text-slate-800">RECRUITER</option>
                            <option value="admin" className="bg-white text-slate-800">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-bold ${user.placementStatus === 'Not Active' ? 'text-slate-400' : 'text-emerald-600'}`}>
                            {user.placementStatus || 'Active'}
                          </span>
                          {user.isSuspended && (
                            <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                              SUSPENDED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleSuspension(user._id, user.isSuspended)}
                                className={`text-xs font-semibold px-3 py-1 rounded-lg mr-2 transition-colors ${user.isSuspended
                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                  }`}
                                title={user.isSuspended ? "Unsuspend User" : "Suspend User"}
                              >
                                {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                              <button
                                onClick={() => handleDeactivate(user._id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors p-2 align-middle"
                                title="Deactivate User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-sm">No users found.</div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}
            
            {/* Interview Sessions Tab */}
            {activeTab === 'Interview Sessions' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Interview Sessions</h3>
                  <p className="text-xs text-slate-500">Review candidate interview attempts and AI evaluations</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 px-4">Job Position</th>
                      <th className="pb-3 px-4">Candidate Email</th>
                      <th className="pb-3 px-4">Difficulty / Exp</th>
                      <th className="pb-3 px-4">Date</th>
                      <th className="pb-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {interviewsList?.map((interview) => (
                      <tr key={interview._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{interview.jobposition}</td>
                        <td className="py-3 px-4 text-slate-500">{interview.createdby}</td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mr-2">
                            {interview.difficulty}
                          </span>
                          <span className="text-xs text-slate-500">{interview.jobexp} yrs</span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={`/dashboard/interview/${interview.mockid}/feedback`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors inline-block"
                            title="View Feedback Report"
                          >
                            View Feedback
                          </a>
                          {interview.sessionVideoUrl && (
                            <a
                              href={interview.sessionVideoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 ml-2"
                              title="Watch Full Session Video"
                            >
                              <Video className="w-3.5 h-3.5" /> Watch Video
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!interviewsList || interviewsList.length === 0) && (
                  <div className="py-8 text-center text-slate-500 text-sm">No interviews recorded.</div>
                )}
              </div>
            </div>
            )}

            {/* Feedbacks Tab */}
            {activeTab === 'Feedbacks' && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  User Feedbacks
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Rating</th>
                      <th className="py-3 px-4">Feedback</th>
                      <th className="py-3 px-4">Upgrade Details</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {feedbacksList?.map((fb) => (
                      <tr key={fb._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{fb.name}</div>
                          <div className="text-xs text-slate-500">{fb.email}</div>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-500">
                          {fb.rating} / 5
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate" title={fb.feedback}>
                          {fb.feedback}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-xs" title={fb.upgradeDetails}>
                          {fb.needsUpgradation ? (
                            <span className="text-indigo-600 font-semibold">{fb.upgradeDetails || 'Requested Upgrade'}</span>
                          ) : (
                            <span className="text-slate-400">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-xs">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!feedbacksList || feedbacksList.length === 0) && (
                  <div className="py-8 text-center text-slate-500 text-sm">No feedbacks recorded.</div>
                )}
              </div>
            </div>
            )}

          </>
        )}
      </div>
    </DashboardLayout>
  );
}
