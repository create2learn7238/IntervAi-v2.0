import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Video,
  FileText,
  History,
  BarChart3,
  HelpCircle,
  Settings,
  CreditCard,
  BookOpen,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Bot,
  LogOut,
  Zap,
  ShieldCheck,
  X,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

/**
 * Sidebar - Responsive Sidebar Component with Mobile Drawer and Desktop Collapse functionality.
 *
 * @param {boolean} collapsed - Desktop collapsed state (w-20 vs w-64)
 * @param {Function} setCollapsed - Toggle desktop collapsed state
 * @param {boolean} mobileOpen - Mobile drawer open state
 * @param {Function} setMobileOpen - Toggle mobile drawer state
 */
export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentRole = user?.role || 'student';

  const toggleRole = () => {
    const newRole = currentRole === 'student' ? 'recruiter' : 'student';
    setUser((prev) => ({ ...prev, role: newRole }));
    toast.success(`Switched role to ${newRole === 'recruiter' ? 'Placement Officer (Recruiter)' : 'Student'}`);
  };

  const mainNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/interview/new', label: 'Mock Interview', icon: Video },
    { path: '/dashboard/resume-analyzer', label: 'Resume Analyzer', icon: FileText },
    { path: '/dashboard/ats-score', label: 'ATS Score', icon: Award },
    { path: '/dashboard/history', label: 'History', icon: History },
    { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { path: '/dashboard/admin-analytics', label: 'Admin Portal', icon: ShieldCheck },
  ];

  const recruiterNav = [
    { path: '/dashboard/recruiter', label: 'Recruiter Dashboard', icon: ShieldCheck },
  ];

  const practiceNav = [
    { path: '/dashboard/questions', label: 'Question Bank', icon: BookOpen },
    { path: '/dashboard/basic-practice', label: 'Behavioral Prep', icon: Bot },
    { path: '/dashboard/dressing-posture', label: 'Dress & Posture', icon: UserCheck },
  ];

  const secondaryNav = [
    { path: '/pricing', label: 'Pricing', icon: CreditCard },
    { path: '/help', label: 'Help Center', icon: HelpCircle },
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const renderNavGroup = (title, items) => (
    <div className="space-y-1">
      {title && !collapsed && (
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          {title}
        </p>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-4 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-normal leading-relaxed'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col justify-between ${
          // Desktop styles
          collapsed ? 'hidden md:flex md:w-20' : 'hidden md:flex md:w-64'
        } ${
          // Mobile drawer styles
          mobileOpen ? 'flex w-64 translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header & Logo */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            <NavLink
              to="/dashboard"
              onClick={closeMobile}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Zap className="w-5 h-5 fill-white text-white" />
              </div>
              {(!collapsed || mobileOpen) && (
                <span className="text-xl font-semibold tracking-tight text-slate-900">
                  Interv<span className="text-indigo-600">AI</span>
                </span>
              )}
            </NavLink>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={closeMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)]">
            {currentRole === 'admin' && renderNavGroup('Admin Portal', adminNav)}
            {currentRole === 'recruiter' && renderNavGroup('Recruiter Portal', recruiterNav)}
            {renderNavGroup('Workspace', mainNav)}
            {renderNavGroup('Practice', practiceNav)}
            {renderNavGroup('Account', secondaryNav)}
          </div>
        </div>

        {/* User & Role Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          {(!collapsed || mobileOpen) && (
            <button
              onClick={toggleRole}
              className="w-full py-1.5 px-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer text-center"
            >
              Role: {currentRole === 'admin' || currentRole === 'recruiter' ? 'Recruiter' : 'Student'} • Switch
            </button>
          )}

          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
              <NavLink
                to="/dashboard/profile"
                onClick={closeMobile}
                className="flex items-center gap-2.5 overflow-hidden flex-1"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.name || 'Candidate'}
                  </p>
                  <p className="text-[10px] font-normal text-slate-500 uppercase tracking-wider">
                    {currentRole}
                  </p>
                </div>
              </NavLink>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
