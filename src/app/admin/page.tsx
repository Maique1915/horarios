'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function AdminPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('admin_get_users', {
                requesting_user_id: currentUser?.id
            });

            if (error) throw error;
            setUsers(data || []);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            // alert('Erro ao carregar usuários: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (user: any) => {
        if (!confirm(`Confirmar pagamento para ${user.name || user.username}?`)) return;

        setProcessingId(user.id);
        try {
            // Optimistic expiration date calculation for UI update
            const createdAt = new Date(user.created_at);
            const expiresAt = new Date(); // Start from NOW for manual approval? 
            // NOTE: The previous logic in UserModal used 'created_at'. 
            // However, usually manual payment entry implies "starts now" or "starts from creation".
            // Since we call an RPC, the RPC decides. 
            // We just assume the RPC works. We'll refresh list or update optimistically.

            // To be consistent with existing logic, let's look at the RPC call.
            const { error } = await supabase.rpc('admin_activate_user', {
                target_user_id: user.id,
                requesting_user_id: currentUser?.id
            });

            if (error) throw error;

            // Remove from local list (since we only show pending) OR update status
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, is_paid: true } : u
            ));

            alert('Usuário ativado com sucesso!');
        } catch (err: any) {
            console.error('Error activating user:', err);
            alert('Erro ao ativar: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    const pendingUsers = users.filter(u => !u.is_paid);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold mb-2">Painel Administrativo</h1>
                <p className="text-text-light-secondary dark:text-text-dark-secondary">
                    Gestão de usuários e pagamentos pendentes.
                </p>
            </div>

            {/* Pending Payments Section */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow border border-border-light dark:border-border-dark overflow-hidden">
                <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                            <span className="material-symbols-outlined">pending_actions</span>
                            Pagamentos Pendentes ({pendingUsers.length})
                        </h2>
                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mt-1">
                            Usuários cadastrados que ainda não realizaram o pagamento.
                        </p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
                        title="Atualizar lista"
                    >
                        <span className="material-symbols-outlined">refresh</span>
                    </button>
                </div>

                {loading ? (
                    <div className="p-8">
                        <LoadingSpinner message="Carregando solicitações..." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-border-light dark:border-border-dark">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Usuário</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Desde</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">Curso</th>
                                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {pendingUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">
                                            Nenhum pagamento pendente no momento.
                                        </td>
                                    </tr>
                                ) : (
                                    pendingUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{user.name || 'Sem nome'}</span>
                                                    <span className="text-xs text-slate-500 font-mono">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {new Date(user.created_at).toLocaleDateString()} <span className="text-xs text-slate-400">({new Date(user.created_at).toLocaleTimeString().slice(0, 5)})</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {user.courses ? (
                                                    <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                                        ID: {user.courses}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleActivate(user)}
                                                    disabled={processingId === user.id}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ml-auto"
                                                >
                                                    {processingId === user.id ? (
                                                        'Processando...'
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-base">check_circle</span>
                                                            Aprovar Pagamento
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">info</span>
                    Como funciona
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                    Ao aprovar um pagamento manual, o sistema executará a ativação padrão <b>(admin_activate_user)</b>, concedendo 6 meses de acesso ao usuário.
                    <br />
                    Para gerenciar usuários já ativos ou editar datas específicas, utilize a tabela "Usuários" no menu lateral.
                </p>
            </div>
        </div>
    );
}
