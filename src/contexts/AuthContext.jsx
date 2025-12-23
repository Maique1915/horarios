'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

// URL do Apps Script - MESMA URL usada para dados do sistema
const AUTH_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8E80OOXc9pjXZos9XHuxwT1DkwXZqVshjRPX7DVfEdCDGEYaB89w8P2oyRRQGJSYI4A/exec';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar se há sessão salva no localStorage
        const savedUser = localStorage.getItem('auth_user');
        const savedToken = localStorage.getItem('auth_token');
        const savedExpiry = localStorage.getItem('auth_expiry');

        if (savedUser && savedToken && savedExpiry) {
            const expiry = new Date(savedExpiry);
            if (expiry > new Date()) {
                setUser(JSON.parse(savedUser));
            } else {
                // Token expirado
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            // Hash simples da senha (SHA-256)
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Fazer requisição ao Apps Script
            const response = await fetch(`${AUTH_SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&passwordHash=${passwordHash}`, {
                method: 'GET',
            });

            const result = await response.json();

            if (result.success) {
                const userData = {
                    username: result.username,
                    name: result.name,
                    role: result.role
                };

                // Gerar token simples (em produção, use JWT)
                const token = btoa(`${username}:${Date.now()}`);

                // Expira em 8 horas
                const expiry = new Date();
                expiry.setHours(expiry.getHours() + 8);

                // Salvar no localStorage
                localStorage.setItem('auth_user', JSON.stringify(userData));
                localStorage.setItem('auth_token', token);
                localStorage.setItem('auth_expiry', expiry.toISOString());

                setUser(userData);
                return { success: true };
            } else {
                return { success: false, error: result.error || 'Credenciais inválidas' };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: 'Erro ao conectar com o servidor' };
        }
    };

    const logout = () => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_expiry');
        setUser(null);
    };

    const isAuthenticated = () => {
        return user !== null;
    };

    const value = {
        user,
        loading,
        login,
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
