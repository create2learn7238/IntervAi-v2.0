import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import CompulsoryProfileGuard from './components/CompulsoryProfileGuard';
import SplashLoader from './components/SplashLoader';
import AuthEventWrapper from './components/AuthEventWrapper';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import HelpCenter from './pages/HelpCenter';
import NotFound from './pages/NotFound';

// Protected Dashboard Pages (Standard Imports)
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Lazy Loaded Heavy Pages
const ResumeAnalyzer = lazy(() => import('./pages/ResumeAnalyzer'));
const InterviewHistory = lazy(() => import('./pages/InterviewHistory'));
const PerformanceAnalytics = lazy(() => import('./pages/PerformanceAnalytics'));
const Settings = lazy(() => import('./pages/Settings'));
const Questions = lazy(() => import('./pages/Questions'));
const BasicPractice = lazy(() => import('./pages/BasicPractice'));
const DressingPosture = lazy(() => import('./pages/DressingPosture'));
const Interview = lazy(() => import('./pages/Interview'));
const StartInterview = lazy(() => import('./pages/StartInterview'));
const Feedback = lazy(() => import('./pages/Feedback'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AtsScore = lazy(() => import('./pages/AtsScore'));
const LiveMonitor = lazy(() => import('./pages/LiveMonitor'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const CertificateView = lazy(() => import('./pages/CertificateView'));
const CandidateProfile = lazy(() => import('./pages/CandidateProfile'));

export default function App() {
  return (
    <BrowserRouter>
      {/* 2-Second IntervAi Splash Screen with animated glowing dot on the 'i' */}
      <SplashLoader duration={2000} />

      {/* Global Customized Hot Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!rounded-full !px-5 !py-3 !text-sm !font-semibold !bg-white !text-[#0F172A] !border !border-[#E4E4E7] !shadow-lg',
          duration: 3500,
          style: {
            borderRadius: '9999px',
            background: '#FFFFFF',
            color: '#0F172A',
            border: '1px solid #E4E4E7',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
          },
        }}
      />

      <AuthEventWrapper>
        <Suspense fallback={<SplashLoader duration={0} />}>
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* Protected Profile Setup (Always Accessible to Logged-in Users) */}
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected Workspace Routes (Guarded by Compulsory Profile & Role Setup) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <Dashboard />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/resume-analyzer"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <ResumeAnalyzer />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/ats-score"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <AtsScore />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/history"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <InterviewHistory />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/analytics"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <PerformanceAnalytics />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin-analytics"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <AdminAnalytics />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/recruiter"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <RecruiterDashboard />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/recruiter/candidate/:mockid"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <CandidateProfile />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <Settings />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/questions"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <Questions />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/basic-practice"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <BasicPractice />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/dressing-posture"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <DressingPosture />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />

        {/* Interview Session Flow */}
        <Route
          path="/dashboard/interview/:interviewid"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <Interview />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/interview/:interviewid/start"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <StartInterview />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/interview/:interviewid/feedback"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <Feedback />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/monitor/:interviewid"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <LiveMonitor />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/certificate/view/:certId"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <CertificateView />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/certificate/generate/:interviewId"
          element={
            <ProtectedRoute>
              <CompulsoryProfileGuard>
                <CertificateView />
              </CompulsoryProfileGuard>
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
        </Suspense>
      </AuthEventWrapper>
    </BrowserRouter>
  );
}
