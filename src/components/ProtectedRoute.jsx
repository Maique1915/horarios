'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push(`/login?from=${encodeURIComponent(pathname)}`);
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return <LoadingSpinner message="Verificando autenticação..." />;
    }

    if (!user) {
        return null; // or spinner while redirecting
    }

    return children;
};

export default ProtectedRoute;
