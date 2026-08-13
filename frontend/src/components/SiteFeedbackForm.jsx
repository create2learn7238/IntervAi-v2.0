import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submitSiteFeedback } from '../services/feedbackService';
import { toast } from 'react-hot-toast';
import { Star, Send } from 'lucide-react';

export default function SiteFeedbackForm() {
  const { user } = useAuth();
  
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [needsUpgradation, setNeedsUpgradation] = useState(false);
  const [upgradeDetails, setUpgradeDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first to submit feedback!');
      return;
    }
    if (!feedback.trim()) {
      toast.error('Please write some feedback.');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    setLoading(true);
    try {
      await submitSiteFeedback({
        feedback,
        rating,
        needsUpgradation,
        upgradeDetails
      });
      toast.success('Thank you! Your feedback has been submitted.');
      // Reset form
      setFeedback('');
      setRating(0);
      setNeedsUpgradation(false);
      setUpgradeDetails('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="feedback" className="py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] relative z-10">
      <div className="w-[95%] max-w-4xl mx-auto px-2 sm:px-4">
        <div className="text-center mb-3">
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">We Value Your Feedback</h2>
          <p className="text-[#64748B] mt-1 text-xs">Help us improve your experience on IntervAI.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-0.5">Name</label>
              <input 
                type="text" 
                value={user?.name || ''} 
                disabled 
                className="w-full p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs" 
                placeholder={user ? "" : "Please login first"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-0.5">Email</label>
              <input 
                type="email" 
                value={user?.email || ''} 
                disabled 
                className="w-full p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs" 
                placeholder={user ? "" : "Please login first"}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-0.5">Current Date</label>
              <input 
                type="text" 
                value={new Date().toLocaleDateString()} 
                disabled 
                className="w-full p-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-xs" 
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-xs font-semibold text-[#1E293B] mb-0.5">Your Feedback</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows="2"
              className="w-full p-2 rounded-lg border border-[#E2E8F0] focus:ring-1 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all text-xs"
              placeholder="What do you think about our platform?"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 items-center mb-2">
            <div>
              <label className="block text-xs font-semibold text-[#1E293B] mb-0.5">Rating</label>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-0.5 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center h-full pt-3">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsUpgradation}
                  onChange={(e) => setNeedsUpgradation(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#E2E8F0] text-[#7C3AED] focus:ring-[#7C3AED]"
                />
                <span className="text-xs font-semibold text-[#1E293B]">Need any upgradation?</span>
              </label>
            </div>
          </div>

          {needsUpgradation && (
            <div className="mb-2 p-2.5 bg-[#F5F3FF] rounded-lg border border-[#7C3AED]/30">
              <label className="block text-xs font-semibold text-[#7C3AED] mb-0.5">What and when?</label>
              <textarea
                value={upgradeDetails}
                onChange={(e) => setUpgradeDetails(e.target.value)}
                rows="2"
                className="w-full p-1.5 rounded-lg border border-[#7C3AED]/30 focus:ring-1 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all text-xs bg-white"
                placeholder="Tell us what new features you'd like to see and how soon..."
              />
            </div>
          )}

          <div className="flex justify-center mt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold py-2 rounded-lg flex justify-center items-center gap-1.5 transition-colors disabled:opacity-70 text-xs shadow-sm shadow-[#7C3AED]/20 hover:shadow-[#7C3AED]/40 hover:-translate-y-px transform duration-200"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
          
          {!user && (
            <p className="text-center text-red-500 text-[10px] mt-1.5 font-semibold bg-red-50 p-1.5 rounded-md">
              You must be logged in to submit feedback.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
