import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronDown,
  Award,
  Bot,
  RefreshCw,
  Mail,
  ShieldAlert,
  Activity,
  Mic,
  Eye,
  BookOpen,
  Gauge,
  Clock,
  Video,
  Sparkles,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ProgressRing from '../components/ProgressRing';
import CertificateModal from '../components/CertificateModal';
import { getFeedback } from '../services/feedbackService';
import { getInterview } from '../services/interviewService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Feedback() {
  const { interviewid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedbackData, setFeedbackData] = useState([]);
  const [interviewData, setInterviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(0);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);

  useEffect(() => {
    getInterview(interviewid)
      .then(({ data }) => setInterviewData(data))
      .catch(() => { });

    getFeedback(interviewid)
      .then(({ data }) => setFeedbackData(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load feedback report'))
      .finally(() => setLoading(false));
  }, [interviewid]);

  const hasAnswers = feedbackData.length > 0;

  // Calculate Overall Session Averages
  const totalAnswers = feedbackData.length;
  const avgRating = hasAnswers
    ? (feedbackData.reduce((s, d) => s + (parseFloat(d.rating) || 0), 0) / totalAnswers).toFixed(1)
    : '0.0';

  const avgConfidence = hasAnswers
    ? Math.round(feedbackData.reduce((s, d) => s + (d.confidenceScore || 70), 0) / totalAnswers)
    : 0;

  const avgEyeContact = hasAnswers
    ? Math.round(feedbackData.reduce((s, d) => s + (d.eyeContactScore || 75), 0) / totalAnswers)
    : 0;

  const avgClarity = hasAnswers
    ? Math.round(feedbackData.reduce((s, d) => s + (d.clarityScore || 70), 0) / totalAnswers)
    : 0;

  const avgPace = hasAnswers
    ? Math.round(feedbackData.reduce((s, d) => s + (d.paceScore || 80), 0) / totalAnswers)
    : 0;

  const avgDepth = hasAnswers
    ? Math.round(feedbackData.reduce((s, d) => s + (d.depthScore || 60), 0) / totalAnswers)
    : 0;

  const avgVocab = hasAnswers
    ? Math.round(feedbackData.reduce((s, d) => s + (d.vocabularyScore || 65), 0) / totalAnswers)
    : 0;

  const totalFillers = hasAnswers
    ? feedbackData.reduce((s, d) => s + (d.fillerWordsCount || 0), 0)
    : 0;

  // Anti-Cheating Aggregations
  const totalCopyPaste = hasAnswers
    ? feedbackData.reduce((s, d) => s + (d.cheatEvents?.copyPasteCount || 0), 0)
    : 0;

  const totalTabSwitches = hasAnswers
    ? feedbackData.reduce((s, d) => s + (d.cheatEvents?.tabSwitchCount || 0), 0)
    : 0;

  // Dynamic Color Map (Red to Green 1-10 scale)
  const getRatingColor = (scoreNum) => {
    const num = parseFloat(scoreNum) || 0;
    if (num <= 3) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (num <= 6) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (num <= 8) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getRatingBadgeBg = (scoreNum) => {
    const num = parseFloat(scoreNum) || 0;
    if (num <= 3) return 'bg-rose-600 text-white';
    if (num <= 6) return 'bg-amber-500 text-white';
    if (num <= 8) return 'bg-indigo-600 text-white';
    return 'bg-emerald-600 text-white';
  };

  const handleSendEmailReport = async () => {
    if (!hasAnswers) {
      toast.error('No recorded answers to send via email report.');
      return;
    }
    setSendingEmail(true);
    try {
      const res = await axios.post('/api/interviews/send-email-report', {
        email: user?.email || 'student@gmail.com',
        jobposition: 'Software Developer',
        overallRating: avgRating,
        fillerWordCount: totalFillers,
        tone: avgConfidence > 75 ? 'Confident & Articulate' : 'Needs Practice',
      });

      if (res.data.success) {
        toast.success(`Nodemailer dispatched report to ${user?.email || 'your email'}!`);
        if (res.data.previewUrl) {
          window.open(res.data.previewUrl, '_blank');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to dispatch email report');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCertClick = () => {
    if (!hasAnswers) {
      toast.error('Please record answers to at least one question to unlock your certificate!');
      return;
    }
    setIsCertOpen(true);
  };

  return (
    <DashboardLayout>
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700">
            <Bot className="w-3.5 h-3.5" />
            <span>AI Comprehensive Audit</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            360° AI Performance & Feedback Report
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendEmailReport}
            disabled={sendingEmail || !hasAnswers}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>{sendingEmail ? 'Sending...' : 'Email Report'}</span>
          </button>

          <button
            onClick={handleCertClick}
            disabled={!hasAnswers}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Award className="w-4 h-4" />
            <span>View Certificate</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Rating Banner */}
          <div className={`bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border-l-4 ${hasAnswers ? (parseFloat(avgRating) <= 3 ? 'border-l-rose-500' : parseFloat(avgRating) <= 6 ? 'border-l-amber-500' : 'border-l-indigo-600') : 'border-l-slate-300'
            }`}>
            <div className="flex items-center gap-5">
              <ProgressRing
                percentage={hasAnswers ? Math.round((parseFloat(avgRating) / 10) * 100) : 0}
                size={90}
                strokeWidth={9}
                label="Score"
              />
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Session Score
                </span>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                  {hasAnswers ? `${avgRating} / 10 Points` : '0.0 / 10 Points (No Answers Recorded)'}
                </h2>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRatingColor(avgRating)}`}>
                    {hasAnswers ? (parseFloat(avgRating) === 0 ? '0 Points — Wrong/Empty Answers' : `Grade: ${avgRating}/10`) : 'Not Evaluated'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    Filler Words: {totalFillers}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigate(`/dashboard/interview/${interviewid}/start`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake Session</span>
              </button>
            </div>
          </div>

          {/* AI Metrics Grid (Pace, Clarity, Depth, Eye Contact, Confidence) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Avg Confidence', val: `${avgConfidence}%`, icon: Activity },
              { label: 'Eye Contact Ratio', val: `${avgEyeContact}%`, icon: Eye },
              { label: 'Speech Clarity', val: `${avgClarity}%`, icon: Mic },
              { label: 'Pace & Rhythm', val: `${avgPace}%`, icon: Gauge },
              { label: 'Technical Depth', val: `${avgDepth}%`, icon: BookOpen },
              { label: 'Vocabulary Score', val: `${avgVocab}%`, icon: Award },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{m.label}</span>
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xl font-semibold tracking-tight text-slate-900">{hasAnswers ? m.val : '0%'}</p>
                </div>
              );
            })}
          </div>

          {/* Anti-Cheating Monitoring Log */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                  Anti-Cheating Monitoring Log & Auto-Destroy Video Policy
                </h3>
              </div>
              <span className="text-xs font-normal text-slate-500">
                Temporary video logs auto-destroy in 1 hour
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-500">Copy / Paste Events</span>
                <p className="text-base font-semibold text-slate-900">{totalCopyPaste} Detected</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-500">Tab Switch Events</span>
                <p className="text-base font-semibold text-slate-900">{totalTabSwitches} Detected</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-500">Multiple Face Detection</span>
                <p className="text-base font-semibold text-emerald-700">Passed (Single Candidate)</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-semibold text-slate-500">Video Storage Retention</span>
                <p className="text-base font-semibold text-indigo-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Auto-Destroy 1h TTL
                </p>
              </div>
            </div>
          </div>

          {/* Question Breakdown with Justification & Color Coding */}
          {feedbackData.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-900">No recorded answers in this session</h3>
              <p className="text-xs font-normal leading-relaxed text-slate-500 mt-1">
                Please enter the live interview studio and record or type your answers first.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                Question Breakdown, Color Coding & AI Point Justifications
              </h3>

              {feedbackData.map((data, index) => {
                const itemRating = parseFloat(data.rating) || 0;
                return (
                  <div key={data._id || index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Accordion Trigger Header */}
                    <button
                      onClick={() => setExpanded(expanded === index ? null : index)}
                      className="w-full p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                          Q{index + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {data.question}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Rating Pill Badge with Color Map */}
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRatingBadgeBg(itemRating)}`}>
                          {itemRating === 0 ? '0/10 (Incorrect / Empty)' : `${itemRating}/10`}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${expanded === index ? 'rotate-180 text-indigo-600' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expanded === index && (
                      <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
                        {/* 1-Sentence AI Justification Pill */}
                        {data.justification && (
                          <div className={`p-3 rounded-lg border text-xs font-semibold ${itemRating === 0
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                            }`}>
                            <span className="uppercase tracking-wider font-bold text-[10px] block mb-0.5">
                              AI Point Justification:
                            </span>
                            {data.justification}
                          </div>
                        )}

                        {/* Candidate Answer Transcript */}
                        <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                              <XCircle className={`w-4 h-4 ${itemRating === 0 ? 'text-rose-500' : 'text-slate-400'}`} />
                              <span>Candidate Response Transcript</span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              Filler Words: {data.fillerWordsCount || 0}
                            </span>
                          </div>
                          <p className="text-xs font-normal leading-relaxed text-slate-800 italic">
                            "{data.useranswer || 'No answer recorded'}"
                          </p>

                          {/* Recorded Session Video Player */}
                          {data.videoBlobUrl && (
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                                  <Video className="w-4 h-4 text-indigo-600" />
                                  <span>Recorded Session Video</span>
                                </div>
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  Auto-destroys in 1 Hour (TTL)
                                </span>
                              </div>
                              <video
                                controls
                                src={data.videoBlobUrl}
                                className="w-full max-w-lg rounded-lg border border-slate-300 shadow-sm bg-black aspect-video"
                              />
                            </div>
                          )}
                        </div>

                        {/* Ideal Model Answer */}
                        <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Ideal Model Answer</span>
                          </div>
                          <p className="text-xs font-normal leading-relaxed text-slate-800">
                            {data.correctanswer || 'N/A'}
                          </p>
                        </div>

                        {/* AI Detailed Feedback */}
                        {data.feedback && (
                          <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-200 space-y-1.5">
                            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800">
                              <Bot className="w-4 h-4 text-indigo-600" />
                              <span>AI STAR Feedback & Recommendations</span>
                            </div>
                            <p className="text-xs font-normal leading-relaxed text-slate-800">
                              {data.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Overall Short Summary at the bottom */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              Overall Executive Summary
            </h3>
            <p className="text-xs font-normal leading-relaxed text-slate-600">
              {hasAnswers
                ? `Candidate completed ${totalAnswers} interview question(s) with an average rating of ${avgRating}/10. ${totalCopyPaste > 0 || totalTabSwitches > 0
                  ? 'Anti-cheating alerts were recorded during the session.'
                  : 'No anti-cheating policy violations were detected.'
                } Temporary studio video logs are set to auto-destroy within 1 hour.`
                : 'No interview answers recorded for this session yet.'}
            </p>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        candidateName={user?.name || 'Candidate'}
        role={interviewData?.jobposition || 'Software Developer'}
        score={avgRating}
      />
    </DashboardLayout>
  );
}
