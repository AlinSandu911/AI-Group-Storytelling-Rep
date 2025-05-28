'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ChildAccountsManager from '@/components/family/ChildAccountsManager';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function MyChildrenPage() {
  const { user, loading: authLoading } = useAuth();
  
  if (authLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-indigo-800 mb-6">My Children</h1>
          
          <ChildAccountsManager />
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
