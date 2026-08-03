import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, GraduationCap, Briefcase } from 'lucide-react';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import AiBackgroundAnimation from '../components/AiBackgroundAnimation';
import Header from '../components/Header';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [role, setRole] = useState('student');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await registerUser({ ...form, role });
      login(data, data.token);
      toast.success(`Welcome to InterAI, ${data.name}! Registered as ${role === 'recruiter' ? 'Recruiter' : 'Student'}.`);
      if (role === 'recruiter' || role === 'admin') {
        navigate('/dashboard/admin-analytics');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans antialiased text-[#0F172A] relative overflow-x-hidden">
      {/* Animated AI Background */}
      <AiBackgroundAnimation />

      {/* Main Top Header Navbar */}
      <Header />

      {/* Main Card Container */}
      <div className="w-full max-w-md mx-auto my-6 relative z-10">
        <div className="saas-card p-6 sm:p-8 shadow-saas-modal bg-white border border-[#E2E8F0] relative overflow-hidden">
          {/* Top Gradient Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />

          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Create Your Account</h1>
            <p className="text-xs text-[#64748B] mt-1">
              Start practicing AI mock interviews in under 60 seconds
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Role Selector */}
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1.5">
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    role === 'student'
                      ? 'bg-[#F5F3FF] border-[#7C3AED] text-[#7C3AED] shadow-sm ring-1 ring-[#7C3AED]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('recruiter')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    role === 'recruiter'
                      ? 'bg-[#F5F3FF] border-[#7C3AED] text-[#7C3AED] shadow-sm ring-1 ring-[#7C3AED]'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Recruiter</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Alex Johnson"
                  className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-input text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="alex@university.edu"
                  className="w-full h-11 pl-10 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-input text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className="w-full h-11 pl-10 pr-10 bg-[#F8FAFC] border border-[#E2E8F0] rounded-input text-xs font-medium text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A]"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Upgraded Password Strength Meter */}
              <PasswordStrengthMeter password={form.password} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-btn bg-gradient-primary text-white text-xs font-semibold shadow-saas-glow hover:opacity-95 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link Section */}
          <div className="text-center mt-6 pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#7C3AED] hover:underline inline-flex items-center gap-1 ml-1"
              >
                <span>Sign in here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div className="text-center py-4 text-xs text-[#64748B]">
        By registering, you agree to InterAI Terms & Student Privacy Policy
      </div>
    </div>
  );
}

