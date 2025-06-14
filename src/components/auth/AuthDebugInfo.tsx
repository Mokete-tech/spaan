
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AuthDebugInfo: React.FC = () => {
  const { user, session, profile, isLoading } = useAuth();

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Debug Info (Dev Only)</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>Loading: {isLoading.toString()}</div>
        <div>User: {user ? user.email : 'null'}</div>
        <div>Session: {session ? 'exists' : 'null'}</div>
        <div>Profile: {profile ? `${profile.first_name} ${profile.last_name}` : 'null'}</div>
        <div>Profile Complete: {profile?.is_profile_complete?.toString()}</div>
        <div>Current URL: {window.location.href}</div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugInfo;
