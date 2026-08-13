import React, { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { createInterview } from '../services/interviewService';
import { useNavigate } from 'react-router-dom';
import DashboardForm from './DashboardForm';

/**
 * NewInterviewModal - High-contrast modal with short, simple placeholders.
 */
export default function NewInterviewModal({ isOpen, onClose, onCreated }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        jobposition: formData.jobPosition,
        jobdescription: formData.jobDescription || `${formData.interviewType} Interview Practice`,
        jobexp: String(formData.jobExperience),
        difficulty: 'Intermediate',
        createdby: user?.email || 'guest@intervai.app',
      };

      const { data } = await createInterview(payload);
      toast.success('AI Interview session generated successfully!');
      onClose();
      if (onCreated) onCreated();
      if (data?.mockid) {
        navigate(`/dashboard/interview/${data.mockid}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create interview session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-xl relative overflow-hidden">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-10"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <DashboardForm onSubmit={handleFormSubmit} loading={loading} />
      </div>
    </div>
  );
}
