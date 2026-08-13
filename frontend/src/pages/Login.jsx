import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, X, CheckCircle2 } from 'lucide-react';
import { loginUser, forgotPassword, resetPassword } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import AiBackgroundAnimation from '../components/AiBackgroundAnimation';
import Header from '../components/Header';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = (userObj, tokenStr) => {
    login(userObj, tokenStr);
    toast.success(`Welcome back, ${userObj.name}!`);
    if (userObj.role === 'recruiter' || userObj.role === 'admin') {
      navigate('/dashboard/admin-analytics');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      handleLoginSuccess(data, data.token);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please check credentials.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSignIn = async (demoEmail, roleName) => {
    const demoPw = 'password123';
    setEmail(demoEmail);
    setPassword(demoPw);
    setLoading(true);

    try {
      const { data } = await loginUser({ email: demoEmail, password: demoPw });
      handleLoginSuccess({ _id: data._id, name: data.name, email: data.email, role: data.role || 'student' }, data.token);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || `Demo sign in for ${roleName} failed.`);
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Flow Handlers
  const handleOpenForgot = (e) => {
    e.preventDefault();
    setForgotEmail(email || '');
    setForgotStep(1);
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowForgotModal(true);
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    setForgotLoading(true);
    try {
      const { data } = await forgotPassword({ email: forgotEmail });
      toast.success(data.message || 'If an account exists, a reset code was sent.', { duration: 7000 });
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to request password reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode.trim()) {
      toast.error('Please enter the 6-digit reset code');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setForgotLoading(true);
    try {
      await resetPassword({ email: forgotEmail, resetCode, newPassword });
      toast.success('Password reset successfully! Please sign in with your new password.');
      setEmail(forgotEmail);
      setPassword(newPassword);
      setShowForgotModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex flex-col justify-between font-sans antialiased text-[#0F172A] relative overflow-x-hidden">
      {/* Background Glow */}
      <AiBackgroundAnimation />

      {/* Main Top Header Navbar */}
      <Header />

      {/* Main Card Container */}
      <div className="w-full max-w-md mx-auto my-8 relative z-10">
        <div className="saas-card p-6 sm:p-8 shadow-2xl bg-white border border-[#E2E8F0] relative overflow-hidden">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Sign In to IntervAI</h1>
            <p className="text-xs text-[#64748B] mt-1">
              Access your interview studio & AI practice sessions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#0F172A]">Password</label>
                <button
                  type="button"
                  onClick={handleOpenForgot}
                  className="text-[11px] font-bold text-[#7C3AED] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-gradient-primary text-white text-xs font-bold shadow-royal-glow hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Separator */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E8F0]" />
            </div>
            <span className="relative px-3 bg-white text-[11px] font-bold text-[#94A3B8] uppercase">
              Or continue with
            </span>
          </div>

          {/* 3 Quick One-Click Demo Accounts */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center mb-1">
              ⚡ Instant 1-Click Demo Portals
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSignIn('demo@interai.app', 'Student')}
                className="py-2.5 px-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                title="Explore Candidate Dashboard, Mock Session, AI Ratings & Certificates"
              >
                <span className="text-base">🎓</span>
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSignIn('recruiter@techcorp.com', 'Recruiter')}
                className="py-2.5 px-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                title="Explore Recruiter Dashboard, Talent Discovery & Hire/Consider Badges"
              >
                <span className="text-base">💼</span>
                <span>Recruiter</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoSignIn('admin@intervai.app', 'Admin')}
                className="py-2.5 px-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-700 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                title="Explore Admin Control Center & Platform Analytics"
              >
                <span className="text-base">🛡️</span>
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Sign Up Prompt */}
          <div className="text-center mt-6 pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B]">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1 ml-1"
              >
                <span>Create free account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#E2E8F0] relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">Reset Your Password</h3>
                  <p className="text-xs text-[#64748B]">Step {forgotStep} of 2</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-full text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Enter your registered account email. We will generate a secure 6-digit verification code to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-5 py-2.5 rounded-full border border-[#CBD5E1] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-6 py-2.5 rounded-full bg-gradient-primary text-white text-xs font-bold shadow-royal-glow hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Get Reset Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="p-3 bg-[#F5F3FF] border border-[#7C3AED]/20 rounded-xl text-xs text-[#7C3AED] font-medium flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                  <div>
                    Verification code generated for <strong className="font-bold">{forgotEmail}</strong>. Check your toast or enter code below.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full h-11 px-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-mono font-bold tracking-widest text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full h-11 pl-10 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs font-bold text-[#7C3AED] hover:underline"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-6 py-2.5 rounded-full bg-gradient-primary text-white text-xs font-bold shadow-royal-glow hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer text */}
      <div className="text-center py-4 text-xs text-[#64748B]">
        Protected by IntervAI Enterprise Security • Privacy Policy
      </div>
    </div>
  );
}

