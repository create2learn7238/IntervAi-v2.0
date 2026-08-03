import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import NewInterviewModal from './NewInterviewModal';

/**
 * DashboardLayout - Master layout wrapper for all dashboard pages.
 * Handles responsive sidebar collapse, mobile drawer states, top header navigation, and modal triggers.
 */
export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-indigo-500/10 selection:text-indigo-600 relative">
      {/* Responsive Sidebar (Desktop Collapsible & Mobile Drawer) */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Top Navbar */}
      <TopNav
        collapsed={collapsed}
        onOpenNewInterview={() => setIsModalOpen(true)}
        onOpenMobileMenu={() => setMobileOpen(true)}
      />

      {/* Main Content Viewport */}
      <main
        className={`transition-all duration-300 min-h-[calc(100vh-4rem)] p-6 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>

      {/* Global New Interview Modal */}
      <NewInterviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
