'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import ROUTES from '../routes';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const pathname = usePathname();

    useEffect(() => {
        // Obter sessão atual do localStorage (simulação de sessão)
        const storedUser = localStorage.getItem('app_user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Normalize courses if array (Legacy fix)
            if (Array.isArray(parsedUser.courses)) {
                parsedUser.courses = parsedUser.courses[0] || null;
            }
            setUser(parsedUser);
        }
        setLoading(false);
    }, []);

    // [NEW] Enforce Payment
    useEffect(() => {
        if (!loading && user) {
            // 1. Checar se pagou
            const isPaid = user.is_paid;

            // 2. Checar validade (se tiver data)
            let isExpired = false;
            if (user.subscription_expires_at) {
                const expiresAt = new Date(user.subscription_expires_at);
                if (new Date() > expiresAt) {
                    isExpired = true;
                }
            }

            // Se não pagou OU expirou
            if (!isPaid || isExpired) {
                // Allow access to plans page, login, api routes, and root
                const allowedPaths = [ROUTES.PLANS, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.HOME];
                const isStaticAllowed = allowedPaths.includes(pathname) || pathname?.startsWith('/api');

                // Allow /[cur], /[cur]/cronograma, /[cur]/grades
                // But block /profile, /activities, /edit (which matches /[cur] pattern)
                const isCoursePublicRoute = /^\/[^\/]+(\/(cronograma|grades))?$/.test(pathname);
                const isProtectedUserRoute = [ROUTES.PROFILE, ROUTES.ACTIVITIES, '/edit', '/admin'].some(path => pathname?.startsWith(path));

                const isAllowed = isStaticAllowed || (isCoursePublicRoute && !isProtectedUserRoute);

                if (!isAllowed) {
                    console.log("Acesso negado (Não pago ou Expirado), redirecionando para /plans");
                    router.push(ROUTES.PLANS);
                }
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (username, password) => {
        try {
            // Secure Login via RPC
            const { data: user, error } = await supabase.rpc('login_user', {
                username_in: username,
                password_in: password
            });

            if (error) {
                console.error("RPC login error:", error);
                return { success: false, error: 'Erro no servidor durante login.' };
            }

            if (!user) {
                return { success: false, error: 'Usuário ou senha incorretos.' };
            }

            // Normalize courses (Supabase might return array)
            if (Array.isArray(user.courses)) {
                user.courses = user.courses[0] || null;
            }

            // Login com sucesso
            localStorage.setItem('app_user', JSON.stringify(user));
            setUser(user);
            return { success: true, user };

        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (username, password, fullName, courseId) => {
        try {
            console.log("AuthContext register called with:", { username, fullName, courseId, parsedCourseId: parseInt(courseId) });
            // Secure Register via RPC
            const { data, error } = await supabase.rpc('register_user', {
                username_in: username,
                password_in: password,
                name_in: fullName,
                course_id_in: parseInt(courseId) // Ensure integer type
            });

            if (error) {
                // Handle specific constraint errors if needed
                if (error.message.includes('Usuário já existe')) {
                    return { success: false, error: 'Usuário já existe.' };
                }
                throw error;
            }

            if (Array.isArray(data.courses)) {
                data.courses = data.courses[0] || null;
            }

            // Login automático
            localStorage.setItem('app_user', JSON.stringify(data));
            setUser(data);

            return { success: true, user: data };
        } catch (error) {
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

    const updateUser = async (userId, updates) => {
        try {
            // Secure Update via RPC
            // updates includes: name, username, password, currentPassword
            const { data, error } = await supabase.rpc('update_user', {
                user_id_in: userId,
                name_in: updates.name,
                username_in: updates.username,
                new_password_in: updates.password || null,
                current_password_in: updates.currentPassword
            });

            if (error) {
                throw error;
            }

            if (Array.isArray(data.courses)) {
                data.courses = data.courses[0] || null;
            }

            // Update local state and storage
            localStorage.setItem('app_user', JSON.stringify(data));
            setUser(data);

            return { success: true, user: data };
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            // Improve error message
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
            isExpired, // Exposed property
            login,
            register,
            updateUser,
            logout,
            isAuthenticated
        };
    }, [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
