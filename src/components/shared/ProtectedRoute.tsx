'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import ROUTES from '../../routes';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string | string[] | null;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole = null }) => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const params = useParams(); // Add useParams
    const cur = params?.cur; // Get 'cur' slug from URL

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push(`${ROUTES.LOGIN}?from=${encodeURIComponent(pathname)}`);
            } else if (requiredRole) {
                // Check if user has one of the required roles
                const hasAllowedRole = Array.isArray(requiredRole)
                    ? requiredRole.includes(user.role)
                    : user.role === requiredRole;

                // Allow 'curso' if 'admin' is required (Implicit support/Legacy) OR if explicitly included
                const isImplicitlyAllowed = requiredRole === 'admin' && user.role === 'curso';

                if (!hasAllowedRole && !isImplicitlyAllowed) {
                    router.push(ROUTES.HOME);
                    return;
                }

                // Additional Security Check for 'curso' role
                if (user.role === 'curso') {
                    // Check if the current route has a 'cur' param and if it matches the user's course
                    if (cur && user.courses?.code === cur) {
                        return; // Allowed
                    }
                    // If mismatch or accessing generic admin route without matching context
                    router.push(ROUTES.HOME);
                    return;
                }
            }
        }
    }, [user, loading, router, pathname, requiredRole, cur]);

    if (loading) {
        return <LoadingSpinner message="Verificando autenticação..." />;
    }

    if (!user) {
        return null; // or spinner while redirecting
    }

    const hasAllowedRole = requiredRole
        ? (Array.isArray(requiredRole) ? requiredRole.includes(user.role) : user.role === requiredRole)
        : true;

    // Implicit 'curso' allowed if 'admin' required
    const isImplicitlyAllowed = requiredRole === 'admin' && user.role === 'curso';

    if (requiredRole && !hasAllowedRole && !isImplicitlyAllowed) {
        return null;
    }

    // Specific 'curso' check for render
    if (user.role === 'curso') {
        if (cur && user.courses?.code !== cur) return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
