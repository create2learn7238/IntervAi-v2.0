import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function CompulsoryProfileGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  // If user exists but hasn't completed their compulsory profile setup
  // Admins bypass this requirement
  if (user && user.role !== 'admin' && !user.profileCompleted && location.pathname !== '/dashboard/profile') {
    toast.error('Compulsory Profile Setup: Please choose your User Type (Student or Recruiter) to continue.', {
      id: 'profile-guard-toast',
    });
    return <Navigate to="/dashboard/profile" replace />;
  }

  return children;
}
