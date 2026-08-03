import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Video,
  Plus,
  ArrowRight,
  Bot,
  FileText,
  Award,
  Brain,
  Copy,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import Table from '../components/Table';
import DashboardForm from '../components/DashboardForm';
import ProgressRing from '../components/ProgressRing';
import NewInterviewModal from '../components/NewInterviewModal';
import { useAuth } from '../context/AuthContext';
import { getInterviews, createInterview } from '../services/interviewService';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch Session Logs
  const fetchInterviews = async () => {
    if (!user?.email) {
      setFetching(false);
      return;
    }
    setFetching(true);
    try {
      const { data } = await getInterviews(user.email);
      const fetchedData = data?.data || data;
      setInterviews(Array.isArray(fetchedData) ? fetchedData : []);
    } catch (error) {
      toast.error('Failed to sync interview session logs');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, [user]);

  // Handle Quick Form Submission
  const handleFormSubmit = async (formData) => {
    setFormSubmitting(true);
    try {
      const payload = {
        jobposition: formData.jobPosition,
        jobdesc: formData.jobDescription || `${formData.interviewType} Interview Practice`,
        jobexp: String(formData.jobExperience),
        userEmail: user?.email,
      };

      const res = await createInterview(payload);
      toast.success('Mock interview session created successfully!');
      if (res?.data?.mockid) {
        navigate(`/dashboard/interview/${res.data.mockid}`);
      } else {
        fetchInterviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate mock session');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCopyLink = (jobposition) => {
    toast.success(`Copied practice link for ${jobposition}`);
  };

  const totalSessions = interviews.length;

  // Table Columns Definition with Custom Cell Renderers
  const tableColumns = [
    {
      key: 'jobposition',
      label: 'Target Position',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-xs shrink-0">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 leading-snug">
              {row.jobposition}
            </p>
            <p className="text-xs text-slate-500 font-normal leading-relaxed truncate max-w-xs">
              {row.jobdesc || 'Technical Interview'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'jobexp',
      label: 'Experience',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {row.jobexp} Year(s)
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 font-normal leading-relaxed text-xs">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Recent'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/interview/${row.mockid}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors"
          >
            <span>Start Practice</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => handleCopyLink(row.jobposition)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Copy Title"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      {/* Top Welcome Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Candidate'} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Active Session
            </span>
          </div>
          <p className="text-sm font-normal leading-relaxed text-slate-600">
            Track your AI mock interviews, ATS resume compatibility, and practice metrics.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Session</span>
        </button>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mock Sessions"
          value={totalSessions || '0'}
          subtitle="Completed AI practice"
          icon={Video}
          trend="up"
          trendValue="+2 this week"
        />
        <StatCard
          title="ATS Resume Score"
          value="86 / 100"
          subtitle="Match to target role"
          icon={FileText}
          trend="up"
          trendValue="+4 pts"
        />
        <StatCard
          title="Speech Clarity"
          value="92%"
          subtitle="Pacing & vocal tone"
          icon={Bot}
          trend="up"
          trendValue="Optimal"
        />
        <StatCard
          title="Placement Rank"
          value="#14 / 240"
          subtitle="Top 10th percentile"
          icon={Award}
          trend="up"
          trendValue="Top Tier"
        />
      </div>

      {/* Quick Setup Form & AI Readiness Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Reusable Validated Form */}
        <div className="lg:col-span-2">
          <DashboardForm onSubmit={handleFormSubmit} loading={formSubmitting} />
        </div>

        {/* Right Column: AI Readiness Metric Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                Readiness Score
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                High Confidence
              </span>
            </div>

            <div className="my-6 flex justify-center">
              <ProgressRing percentage={88} size={130} strokeWidth={10} label="Readiness" />
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Technical Depth</span>
                  <span className="text-slate-900">90%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Behavioral Tone</span>
                  <span className="text-slate-900">85%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Link
              to="/dashboard/analytics"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>View Detailed Analytics</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Data Table Component Section */}
      <Table
        title="Recent Interview Sessions"
        subtitle="Review records, sort headers, filter responses, or jump back into practice."
        columns={tableColumns}
        data={interviews}
        loading={fetching}
        pageSize={5}
        actions={
          <button
            onClick={fetchInterviews}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            Refresh Logs
          </button>
        }
      />

      {/* Practice Recommendations Row */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              AI Actionable Preparation Tips
            </h3>
          </div>
          <span className="text-xs font-normal leading-relaxed text-slate-500">
            Updated today based on your recent performance
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Structure System Design Answers',
              desc: 'Keep high-level architecture explanations under 2 minutes before diving into detailed specs.',
              tag: 'Strategy',
            },
            {
              title: 'Optimize ATS Resume Keywords',
              desc: 'Incorporate Redux Toolkit, Tailwind CSS, and Jest into project experience blocks.',
              tag: 'ATS Optimization',
            },
            {
              title: 'Maintain Direct Camera Contact',
              desc: 'Look into the camera lens during key responses to enhance non-verbal engagement metrics.',
              tag: 'Video Studio',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {item.tag}
                </span>
              </div>
              <h4 className="text-sm font-semibold tracking-tight text-slate-900 pt-1">
                {item.title}
              </h4>
              <p className="text-xs font-normal leading-relaxed text-slate-600">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Global New Session Modal */}
      <NewInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchInterviews}
      />
    </DashboardLayout>
  );
}
