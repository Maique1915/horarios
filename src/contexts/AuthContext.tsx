'use client';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import ROUTES from '../routes';
import { DbUser } from '../model/usersModel';

interface AuthContextType {
    user: DbUser | null;
    loading: boolean;
    isExpired: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; user?: DbUser; error?: string }>;
    register: (username: string, password: string, fullName: string, courseId: string) => Promise<{ success: boolean; user?: DbUser; error?: string }>;
    updateUser: (userId: number, updates: { name: string; username: string; password?: string; currentPassword: string }) => Promise<{ success: boolean; user?: DbUser; error?: string }>;
    logout: () => Promise<void>;
    isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<DbUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem('app_user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (Array.isArray(parsedUser.courses)) {
                    parsedUser.courses = parsedUser.courses[0] || null;
                }
                setUser(parsedUser);
            } catch (e) {
                console.error("Error parsing stored user", e);
                localStorage.removeItem('app_user');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!loading && user) {
            const isPaid = user.is_paid;
            let isExpired = false;
            if (user.subscription_expires_at) {
                const expiresAt = new Date(user.subscription_expires_at);
                if (new Date() > expiresAt) {
                    isExpired = true;
                }
            }

            // Allow access if paid OR if trial is not expired
            if (!isPaid && isExpired) {
                const allowedPaths = [ROUTES.PLANS, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.HOME];
                const isStaticAllowed = allowedPaths.includes(pathname || '') || pathname?.startsWith('/api');
                const isCoursePublicRoute = pathname ? /^\/[^\/]+(\/(cronograma|grades))?$/.test(pathname) : false;
                const isProtectedUserRoute = [ROUTES.PROFILE, ROUTES.ACTIVITIES, '/edit', '/admin'].some(path => pathname?.startsWith(path));

                const isAllowed = isStaticAllowed || (isCoursePublicRoute && !isProtectedUserRoute);

                if (!isAllowed) {
                    console.log("Acesso negado (Não pago e Expirado), redirecionando para /plans");
                    router.push(ROUTES.PLANS);
                }
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (username_in: string, password_in: string) => {
        try {
            const { data, error } = await supabase.rpc('login_user', {
                username_in: username_in.toLowerCase(),
                password_in
            });

            if (error) {
                console.error("RPC login error:", error);
                return { success: false, error: 'Erro no servidor durante login.' };
            }

            if (!data) {
                return { success: false, error: 'Usuário ou senha incorretos.' };
            }

            const userData = data as any;
            if (Array.isArray(userData.courses)) {
                userData.courses = userData.courses[0] || null;
            }

            localStorage.setItem('app_user', JSON.stringify(userData));
            setUser(userData as DbUser);
            return { success: true, user: userData as DbUser };

        } catch (error: any) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (username_in: string, password_in: string, name_in: string, courseId: string) => {
        try {
            const { data, error } = await supabase.rpc('register_user', {
                username_in: username_in.toLowerCase(),
                password_in,
                name_in,
                course_id_in: parseInt(courseId)
            });

            if (error) {
                if (error.message.includes('Usuário já existe')) {
                    return { success: false, error: 'Usuário já existe.' };
                }
                throw error;
            }

            const userData = data as any;
            if (Array.isArray(userData.courses)) {
                userData.courses = userData.courses[0] || null;
            }

            localStorage.setItem('app_user', JSON.stringify(userData));
            setUser(userData as DbUser);
            return { success: true, user: userData as DbUser };
        } catch (error: any) {
            console.error('Erro no cadastro:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        localStorage.removeItem('app_user');
        setUser(null);
        router.push(ROUTES.HOME);
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const updateUser = async (userId: number, updates: { name: string; username: string; password?: string; currentPassword: string }) => {
        try {
            const { data, error } = await supabase.rpc('update_user', {
                user_id_in: userId,
                name_in: updates.name,
                username_in: updates.username.toLowerCase(),
                new_password_in: updates.password || null,
                current_password_in: updates.currentPassword || null
            });

            if (error) {
                throw error;
            }

            const userData = data as any;
            if (Array.isArray(userData.courses)) {
                userData.courses = userData.courses[0] || null;
            }

            localStorage.setItem('app_user', JSON.stringify(userData));
            setUser(userData as DbUser);
            return { success: true, user: userData as DbUser };
        } catch (error: any) {
            console.error('Erro ao atualizar usuário:', error);
            let msg = error.message;
            if (msg.includes('Senha atual incorreta')) msg = 'Senha atual incorreta.';
            if (msg.includes('Nome de usuário já existe')) msg = 'Nome de usuário já existe.';
            return { success: false, error: msg };
        }
    };

    const value = React.useMemo(() => {
        let isExpired = false;
        if (user && user.subscription_expires_at) {
            const expiresAt = new Date(user.subscription_expires_at);
            if (new Date() > expiresAt) {
                isExpired = true;
            }
        }

        return {
            user,
            loading,
            isExpired,
            login,
            register,
            updateUser,
            logout,
            isAuthenticated
        };
    }, [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
