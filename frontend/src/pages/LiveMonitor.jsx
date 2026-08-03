import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldAlert, CheckCircle2, AlertTriangle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { getMonitorSummary } from '../services/monitoringService';
import { toast } from 'react-hot-toast';

export default function LiveMonitor() {
  const { interviewid } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const { data } = await getMonitorSummary(interviewid);
      setSummary(data.data);
    } catch (error) {
      toast.error('Failed to fetch monitor summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [interviewid]);

  if (loading && !summary) {
    return <div className="h-screen bg-slate-950 flex items-center justify-center text-white">Loading Admin Panel...</div>;
  }

  const { trustScore, status, violations, violationCount } = summary || {};

  const getStatusColor = (s) => {
    if (s === 'Excellent') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (s === 'Good') return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    if (s === 'Warning') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  };

  const getStatusIcon = (s) => {
    if (s === 'Excellent' || s === 'Good') return <CheckCircle2 className="w-8 h-8" />;
    if (s === 'Warning') return <AlertTriangle className="w-8 h-8" />;
    return <AlertCircle className="w-8 h-8" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Live Interview Monitor</h1>
            <p className="text-slate-400 mt-1">Session ID: {interviewid}</p>
          </div>
          <button onClick={fetchSummary} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors border border-slate-700">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Trust Score Card */}
          <div className={`md:col-span-1 rounded-2xl p-6 border flex flex-col items-center justify-center text-center space-y-4 ${getStatusColor(status)}`}>
            {getStatusIcon(status)}
            <div>
              <div className="text-6xl font-black">{trustScore}</div>
              <div className="text-sm font-semibold uppercase tracking-widest mt-2 opacity-80">Trust Score</div>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-black/20 text-sm font-semibold">
              Status: {status}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
              <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Violations</span>
              <span className="text-4xl font-bold text-rose-400">{violationCount}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
              <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Live Status</span>
              <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>
          </div>
        </div>

        {/* Violations Log */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" /> Violation Logs
            </h2>
          </div>
          
          <div className="divide-y divide-slate-800">
            {violations && violations.length > 0 ? (
              violations.map((v) => (
                <div key={v._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-md ${
                        v.severity === 'High' ? 'bg-rose-500/20 text-rose-400' :
                        v.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {v.severity}
                      </span>
                      <span className="text-sm font-medium text-slate-300">{v.violationType}</span>
                    </div>
                    <p className="text-white font-medium">{v.description}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(v.createdAt).toLocaleString()} | User: {v.userEmail}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-rose-400 font-semibold text-lg">
                      -{v.trustScoreBefore - v.trustScoreAfter} pts
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {v.trustScoreBefore} → {v.trustScoreAfter}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-500 font-medium">
                No violations recorded for this session. Candidate is doing great!
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
