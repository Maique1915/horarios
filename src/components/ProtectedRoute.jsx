'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push(`/login?from=${encodeURIComponent(pathname)}`);
            } else if (requiredRole && user.role !== requiredRole) {
                router.push('/'); // Redirect unauthorized role to home
            }
        }
    }, [user, loading, router, pathname, requiredRole]);

    if (loading) {
        return <LoadingSpinner message="Verificando autenticação..." />;
    }

    if (!user) {
        return null; // or spinner while redirecting
    }

    if (requiredRole && user.role !== requiredRole) {
        return null; // or Access Denied component
    }

    return children;
};

export default ProtectedRoute;
