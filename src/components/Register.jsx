'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import useMercadoPago from '../hooks/useMercadoPago';
import { supabase } from '../lib/supabaseClient';
import LoadingSpinner from './LoadingSpinner';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPixUI, setShowPixUI] = useState(false);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');

    const { register } = useAuth();
    // const { createMercadoPagoCheckout } = useMercadoPago(); // DISABLED: Mercado Pago
    const router = useRouter();

    React.useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase.from('courses').select('id, name');
            if (error) console.error("Error fetching courses:", error);
            else setCourses(data || []);
        };
        fetchCourses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.');
                setLoading(false);
                return;
            }

            // 1. Criar conta no Supabase (status is_paid defaults to false)
            console.log("Registering user:", { username, fullName, selectedCourse });
            const result = await register(username, password, fullName, selectedCourse);

            if (result.success && result.user) {
                // 2. SUCESSO: Mostrar Instruções PIX
                // OLD MP LOGIC:
                /* 
                await createMercadoPagoCheckout({
                    testeId: result.user.id,
                    userEmail: username,
                });
                */
                setLoading(false);
                setShowPixUI(true); // Show manual payment instructions
            } else {
                setError(result.error || "Falha ao criar conta.");
                setLoading(false);
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado. Tente novamente.');
            console.error(err);
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner message="Criando conta..." />;
    }

    if (showPixUI) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-8 text-center animate-fadeIn">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined text-4xl">check_circle</span>
                    </div>
                    <h2 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">Conta Criada!</h2>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary mb-6">
                        Para liberar seu acesso, efetue o pagamento via PIX.
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6 border border-border-light dark:border-border-dark overflow-hidden">
                        <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Chave Pix (Copia e Cola)</p>
                        <p className="text-sm font-mono font-bold text-primary select-all cursor-pointer break-all" onClick={() => navigator.clipboard.writeText('https://nubank.com.br/cobrar/b5da35/69502bf1-5053-4657-a79b-172095c747ed')}>
                            https://nubank.com.br/cobrar/b5da35/69502bf1-5053-4657-a79b-172095c747ed
                        </p>
                        <p className="text-xs text-slate-400 mt-2">Clique para copiar</p>
                    </div>

                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-6">
                        Envie o comprovante para o WhatsApp abaixo para ativar sua conta.
                    </p>

                    <a
                        href="https://wa.me/5521988567387?text=Ol%C3%A1%2C%20segue%20meu%20comprovante%20de%20pagamento%20para%20libera%C3%A7%C3%A3o%20do%20Gerador%20de%20Hor%C3%A1rios."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined">send</span>
                        Enviar via WhatsApp (21 98856-7387)
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden transition-all">
                    {/* Header */}
                    <div className="p-8 text-center border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
                            <span className="material-symbols-outlined text-4xl">
                                person_add
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2 tracking-tight">
                            Criar Conta
                        </h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                            Cadastre-se para acessar
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="border border-red-500/20 bg-red-500/10 rounded-lg p-3 flex items-start gap-3">
                                <span className="material-symbols-outlined text-lg text-red-500">error</span>
                                <p className="text-sm font-medium text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Curso
                            </label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-text-light-primary dark:text-text-dark-primary appearance-none cursor-pointer"
                                required
                            >
                                <option value="" disabled>Selecione seu curso</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Usuário (Email)
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                placeholder="Seu usuário/email"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    placeholder="Sua senha"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold uppercase text-text-light-secondary dark:text-text-dark-secondary tracking-wider">
                                Confirmar Senha
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                placeholder="Confirme a senha"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:translate-y-px"
                            >
                                <span className="text-sm">Cadastrar</span>
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="text-xs text-slate-500 hover:text-primary font-medium transition-colors"
                            >
                                Já tem uma conta? Faça login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
