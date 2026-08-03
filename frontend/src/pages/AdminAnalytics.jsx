import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users, Award, TrendingUp, Download, CheckCircle2,
  BarChart3, Search, ShieldCheck, Briefcase, Trash2
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getAdminAnalytics, getAdminUsers, deactivateUser, updateUserRole } from '../services/adminService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, usersRes] = await Promise.all([
        getAdminAnalytics(),
        getAdminUsers()
      ]);
      setData(analyticsRes.data.data);
      setUsersList(usersRes.data.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      toast.error(err.response?.data?.error || 'Failed to load admin dashboard');
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

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      toast.success(`User role updated to ${newRole}`);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update role');
    }
  };

  const filteredUsers = usersList.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

            {/* User Management Table */}
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
                            className={`px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider outline-none cursor-pointer border-none ${
                              user.role === 'admin' ? 'bg-rose-100 text-rose-700' :
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
                        </td>
                        <td className="py-3 px-4 text-right">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeactivate(user._id)}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-2"
                              title="Deactivate User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-sm">No users found.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
