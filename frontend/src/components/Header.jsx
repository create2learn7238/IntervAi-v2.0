import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Zap, LayoutDashboard, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 glass-navbar">
      <div className="w-[95%] max-w-[95%] mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center text-white shadow-royal-glow group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">
                Interv<span className="text-[#7C3AED]">AI</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2">
            {[
              { label: 'Features', href: '/#features' },
              { label: 'Pricing', href: '/pricing' },
              { label: 'Help Center', href: '/help' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-5 py-2.5 rounded-full text-sm font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F5F3FF] transition-all"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-primary text-white text-sm font-bold shadow-royal-glow hover:opacity-95 transition-all hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-full border border-[#CBD5E1] bg-white text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-all cursor-pointer shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 rounded-full border border-[#CBD5E1] bg-white text-sm font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-primary text-white text-sm font-bold shadow-royal-glow hover:opacity-95 transition-all hover:scale-[1.02]"
                >
                  <span>Start Practicing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
