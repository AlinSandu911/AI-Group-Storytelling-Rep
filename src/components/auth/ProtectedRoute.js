'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/constants';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    if (!user) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <LoadingSpinner size='large'/>
            </div>
        );
    }

    return children;
}