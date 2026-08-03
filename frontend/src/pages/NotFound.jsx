import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans antialiased text-[#0F172A]">
      <Header />

      <main className="my-auto py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary text-white flex items-center justify-center mx-auto shadow-saas-glow">
            <Zap className="w-8 h-8 fill-white text-white" />
          </div>

          <div>
            <span className="text-5xl font-extrabold text-gradient-primary tracking-tight">404</span>
            <h1 className="text-2xl font-extrabold text-[#0F172A] mt-2">Page Not Found</h1>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              The interview question or page you are looking for might have been moved or does not exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn bg-gradient-primary text-white text-xs font-semibold shadow-saas-glow hover:opacity-95 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-btn border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
