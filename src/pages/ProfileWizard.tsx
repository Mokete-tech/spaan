
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProfileWizardComponent from '@/components/auth/ProfileWizard';

const ProfileWizard = () => {
  const { user, isLoading, profile } = useAuth();

  // If loading, show nothing yet
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If profile is already complete, redirect to home
  if (profile?.is_profile_complete) {
    return <Navigate to="/" replace />;
  }

  return <ProfileWizardComponent />;
};

export default ProfileWizard;
