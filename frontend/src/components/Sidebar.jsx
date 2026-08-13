import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  ShieldCheck,
  X,
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
    { path: '/dashboard/history', label: 'History', icon: History },
    { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { path: '/dashboard/admin-analytics', label: 'Admin Portal', icon: ShieldCheck },
  ];

  const recruiterNav = [
    { path: '/dashboard/recruiter', label: 'Recruiter Dashboard', icon: ShieldCheck },
  ];

  const secondaryNav = [
    { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
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
              to="/"
              onClick={closeMobile}
              className="flex items-center gap-2.5 overflow-hidden"
              title="Back to Home Page"
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
            {renderNavGroup('Account', secondaryNav)}
          </div>
        </div>

        {/* User & Role Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          {(!collapsed || mobileOpen) && (
            <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/60 p-2 flex items-center gap-2.5 shadow-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 blur-2xl rounded-full -mr-6 -mt-6 pointer-events-none"></div>
              <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50 shrink-0 relative z-10">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-center gap-1.5 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Role:</span>
                <span className="text-xs font-bold text-slate-700 tracking-wide capitalize">
                  {currentRole === 'admin' ? 'Admin' : currentRole === 'recruiter' ? 'Recruiter' : 'Student'}
                </span>
              </div>
            </div>
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
