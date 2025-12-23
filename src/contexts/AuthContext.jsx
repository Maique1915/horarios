'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Obter sessão atual
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                // Buscar dados extras do perfil (pagamento, etc)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_paid')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    session.user.is_paid = profile.is_paid;
                    setUser(session.user);
                }
            }
            setLoading(false);
        };

        fetchSession();

        // Escutar mudanças de estado (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth State Changed:', event);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_paid')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    session.user.is_paid = profile.is_paid;
                }
                setUser(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router]);

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Erro no login Supabase:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password, fullName) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;
            return { success: true, user: data.user, session: data.session };
        } catch (error) {
            console.error('Erro no cadastro Supabase:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const value = {
        user,
        loading,
        login,
        register, // Nova função exportada
        logout,
        isAuthenticated
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
