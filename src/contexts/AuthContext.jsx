'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import bcrypt from 'bcryptjs';

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
                // Allow access to plans page, login, or api routes
                const allowedPaths = ['/plans', '/login', '/register'];
                const isAllowed = allowedPaths.includes(pathname) || pathname?.startsWith('/api');

                if (!isAllowed) {
                    console.log("Acesso negado (Não pago ou Expirado), redirecionando para /plans");
                    router.push('/plans');
                }
            }
        }
    }, [user, loading, pathname, router]);

    const login = async (username, password) => {
        try {
            // Busca usuário na tabela customizada 'users'
            const { data: user, error } = await supabase
                .from('users')
                .select('*, courses!users_course_id_fkey(code)')
                .eq('username', username)
                .maybeSingle();

            if (error || !user) {
                return { success: false, error: 'Usuário não encontrado.' };
            }

            // Normalize courses (Supabase might return array)
            if (Array.isArray(user.courses)) {
                user.courses = user.courses[0] || null;
            }

            // 1. Verificação de senha em texto plano (MIGRAÇÃO)
            // Check both password_hash and legacy password column if exists
            const dbPassword = user.password_hash || user.password;

            if (dbPassword === password) {
                console.log("Migrando senha de texto plano para hash...");
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                // Atualizar no banco
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ password_hash: hashedPassword })
                    .eq('id', user.id);

                if (updateError) {
                    console.error("Falha ao migrar senha de usuário:", updateError);
                    // We continue login even if migration fails, but log it.
                }

                // Atualizar objeto local (para não salvar texto plano no state/storage)
                user.password_hash = hashedPassword;

                // Login com sucesso
                localStorage.setItem('app_user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }

            // 2. Verificação de Hash (Padrão e Seguro)
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                localStorage.setItem('app_user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }

            return { success: false, error: 'Senha incorreta.' };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (username, password, fullName, courseId) => {
        try {
            // Verificar se usuário já existe
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .maybeSingle();

            if (existingUser) {
                return { success: false, error: 'Usuário já existe.' };
            }

            // Criptografar senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Criar usuário na tabela users
            const { data, error } = await supabase
                .from('users')
                .insert([
                    {
                        username,
                        password_hash: hashedPassword, // Salva o hash
                        name: fullName,
                        role: 'user',
                        active: true,
                        is_paid: false, // Padrão: não pago
                        course_id: courseId
                    }
                ])
                .select('*, courses!users_course_id_fkey(code)')
                .single();

            if (error) throw error;

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
        router.push('/');
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const updateUser = async (userId, updates) => {
        try {
            // Prepare update object
            const dataToUpdate = {};
            if (updates.name) dataToUpdate.name = updates.name;
            if (updates.username) dataToUpdate.username = updates.username;

            if (updates.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(updates.password, salt);
                dataToUpdate.password_hash = hashedPassword;
            }

            if (Object.keys(dataToUpdate).length === 0) return { success: true };

            const { data, error } = await supabase
                .from('users')
                .update(dataToUpdate)
                .eq('id', userId)
                .select('*, courses!users_course_id_fkey(code)')
                .single();

            if (error) throw error;

            if (Array.isArray(data.courses)) {
                data.courses = data.courses[0] || null;
            }

            // Update local state and storage
            localStorage.setItem('app_user', JSON.stringify(data));
            setUser(data);

            return { success: true, user: data };
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return { success: false, error: error.message };
        }
    };

    const value = React.useMemo(() => ({
        user,
        loading,
        login,
        register,
        updateUser,
        logout,
        isAuthenticated
    }), [user, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
