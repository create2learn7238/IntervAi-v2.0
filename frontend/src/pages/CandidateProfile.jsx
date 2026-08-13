import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Mail, Briefcase, Award, ShieldAlert, FileText, CheckCircle2, Clock, Lightbulb, Zap, Crosshair } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getCandidateDetails } from '../services/recruiterService';

export default function CandidateProfile() {
  const { mockid: userId } = useParams(); // URL param is still named mockid in routes likely, but it's now a userId
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [userId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getCandidateDetails(userId);
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  const renderRecommendationBadge = (rec) => {
    if (rec === 'Hire') return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> HIRE</span>;
    if (rec === 'Consider') return <span className="px-3 py-1 bg-amber-100 text-amber-800 font-bold rounded-full text-sm flex items-center gap-1"><Clock className="w-4 h-4"/> CONSIDER</span>;
    return <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold rounded-full text-sm flex items-center gap-1"><ShieldAlert className="w-4 h-4"/> REJECT</span>;
  };

  if (loading) return <DashboardLayout><div className="p-10 text-slate-500">Loading Candidate Profile...</div></DashboardLayout>;
  if (!data || !data.user) return <DashboardLayout><div className="p-10 text-rose-500">Candidate not found.</div></DashboardLayout>;

  const { user, scores, recommendation, interviewsCompleted, history, insights, totalViolations } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <Link to="/dashboard/recruiter" className="flex items-center gap-2 text-indigo-600 hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Talent Pool
          </Link>
          {renderRecommendationBadge(recommendation)}
        </div>

        {/* Header Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {user.email}</span>
                <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {user.targetRole || 'Software Engineer'}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Left Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Summary */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" /> AI Candidate Summary
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {insights?.summary || "Summary not available yet."}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Strengths</h4>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {insights?.strengths?.map(s => <li key={s}>{s}</li>) || <li>None recorded</li>}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1"><Crosshair className="w-3.5 h-3.5" /> Areas to Probe</h4>
                  <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                    {insights?.weaknesses?.map(w => <li key={w}>{w}</li>) || <li>None recorded</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interview History */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Interview History</h3>
              {history && history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4">Role</th>
                        <th className="pb-3 px-4">AI Score</th>
                        <th className="pb-3 px-4">Trust Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {history.map(h => (
                        <tr key={h.mockid} className="hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-600">{new Date(h.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{h.jobposition}</td>
                          <td className="py-3 px-4 font-bold text-indigo-600">{h.aiScore}/10</td>
                          <td className="py-3 px-4 font-bold">{h.trustScore}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No completed interviews yet.</p>
              )}
            </div>
          </div>

          {/* Right Column (1/3 width) */}
          <div className="space-y-6">
            
            {/* Aggregate Scores Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" /> Performance Scores
              </h3>
              
              <div className="mb-6 pb-6 border-b border-slate-100 text-center">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Overall AI Score</p>
                <div className="text-5xl font-black text-indigo-600">{scores?.overall}<span className="text-xl text-slate-400 font-medium">/10</span></div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-semibold text-slate-700">Technical</span>
                    <span className="font-bold">{scores?.technical}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(scores?.technical/10)*100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-semibold text-slate-700">Communication</span>
                    <span className="font-bold">{scores?.communication}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(scores?.communication/10)*100}%` }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-semibold text-slate-700">Problem Solving</span>
                    <span className="font-bold">{scores?.problemSolving}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5"><div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${(scores?.problemSolving/10)*100}%` }}></div></div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> Trust Score</span>
                    <span className={`font-bold ${scores?.trust >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{scores?.trust}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${scores?.trust >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${scores?.trust}%` }}></div></div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Details
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Recommended Roles</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {insights?.recommendedRoles?.map(r => <span key={r} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded">{r}</span>) || <span className="text-sm text-slate-500">N/A</span>}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Skills</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(user?.skills && user.skills.length > 0) ? user.skills.map(s => <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded border border-slate-200">{s}</span>) : <span className="text-sm text-slate-500">Not provided</span>}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Education</span>
                  <p className="font-semibold text-sm text-slate-700 mt-1">{user?.college || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Interviews Completed</span>
                  <p className="font-bold text-sm text-slate-900 mt-1">{interviewsCompleted || 0}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
