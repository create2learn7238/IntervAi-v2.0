import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Mail, Briefcase, Award, ShieldAlert, FileText, CheckCircle2, Clock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { getCandidateDetails } from '../services/recruiterService';

export default function CandidateProfile() {
  const { mockid } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDetails();
  }, [mockid]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await getCandidateDetails(mockid);
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
  if (!data || !data.interview) return <DashboardLayout><div className="p-10 text-rose-500">Candidate not found.</div></DashboardLayout>;

  const { interview, user, trustScore, aiScore, recommendation, violations, answers } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-10">
        <div className="flex justify-between items-center">
          <Link to="/dashboard/recruiter" className="flex items-center gap-2 text-indigo-600 hover:underline font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          {renderRecommendationBadge(recommendation)}
        </div>

        {/* Header Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-2xl shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : ((interview.candidateEmail || user?.email) ? (interview.candidateEmail || user?.email).charAt(0).toUpperCase() : 'U')}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-slate-900">{user?.name || 'Unregistered Candidate'}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {interview.candidateEmail || user?.email || 'N/A'}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {interview.jobposition}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:text-right">
            <div className="text-sm font-semibold text-slate-500">Interview Status</div>
            <div className="text-lg font-bold text-indigo-600">{interview.status}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Evaluation */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> AI Evaluation
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Overall AI Score</span>
                <span className="text-xl font-bold text-slate-900">{aiScore}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Questions Answered</span>
                <span className="text-xl font-bold text-slate-900">{answers?.length || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${Math.min(parseFloat(aiScore) * 10, 100)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Trust & Monitoring */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Trust & Monitoring
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Trust Score</span>
                <span className={`text-xl font-bold ${trustScore >= 80 ? 'text-emerald-500' : trustScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{trustScore}/100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-500">Total Violations</span>
                <span className="text-xl font-bold text-slate-900">{violations?.length || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full ${trustScore >= 80 ? 'bg-emerald-500' : trustScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${trustScore}%` }}></div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" /> Profile Details
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 uppercase">College</span>
                <p className="font-semibold text-sm text-slate-700">{user?.college || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase">Experience</span>
                <p className="font-semibold text-sm text-slate-700">{interview.jobexp} Years</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase">Skills</span>
                <p className="font-semibold text-sm text-slate-700">{(user?.skills && user.skills.length > 0) ? user.skills.join(', ') : 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Violations Timeline */}
        {violations && violations.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Violation Timeline</h3>
            <div className="space-y-3">
              {violations.map((v, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{v.violationType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">{new Date(v.createdAt).toLocaleTimeString()} - {v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
