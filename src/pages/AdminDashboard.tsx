
import React from "react";
import Navbar from "@/components/ui/navbar";
import { Separator } from "@/components/ui/separator";
import PaymentDashboard from "@/components/admin/PaymentDashboard";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  
  // Redirect if not logged in or not admin
  if (!user) {
    return <Navigate to="/auth?redirect=/admin-dashboard" />;
  }
  
  // For demo purposes, let anyone with a login access the admin dashboard
  // In production, uncomment this to restrict access to admins only
  // if (!isAdmin) {
  //   return <Navigate to="/" />;
  // }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 md:px-6 pt-28 pb-16">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">
          Manage payments, transactions and platform operations
        </p>
        
        <Separator className="my-6" />
        
        <div className="grid gap-8">
          <PaymentDashboard />
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
