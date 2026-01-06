import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

const UserManagementModal = ({ onClose }) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Usar RPC seguro para buscar usuários
            const { data, error } = await supabase.rpc('admin_get_users', {
                requesting_user_id: currentUser.id
            });

            if (error) throw error;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Erro ao carregar usuários: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (user) => {
        if (!confirm(`Deseja ativar o usuário ${user.username || user.email}?`)) return;

        setProcessingId(user.id);
        try {
            // Calcular data de expiração: 6 meses a partir da data de criação (adesão)
            const createdAt = new Date(user.created_at);
            const expiresAt = new Date(createdAt);
            expiresAt.setMonth(expiresAt.getMonth() + 6);

            // Chamar RPC para ativar usuário
            const { error } = await supabase.rpc('admin_activate_user', {
                target_user_id: user.id,
                requesting_user_id: currentUser.id
            });

            if (error) throw error;

            // Atualizar lista local
            setUsers(users.map(u =>
                u.id === user.id
                    ? { ...u, is_paid: true, subscription_expires_at: expiresAt.toISOString() }
                    : u
            ));

            alert(`Usuário ativado com sucesso! Expira em: ${expiresAt.toLocaleDateString()}`);

        } catch (err) {
            console.error('Error activating user:', err);
            alert('Erro ao ativar usuário: ' + err.message);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full p-6 shadow-2xl relative">
                <LoadingSpinner message="Carregando usuários..." />
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl max-w-5xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-text-light-primary dark:text-text-dark-primary">Gerenciar Usuários</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <div className="overflow-auto flex-1 border border-border-light dark:border-border-dark rounded-lg">
                    <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nome / Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Curso</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Pagamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expiração</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-border-light dark:divide-border-dark">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary">{user.name || 'Sem nome'}</span>
                                            <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary">@{user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                        {user.courses ? `ID: ${user.courses}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_paid ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Pago
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                Pendente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                        {user.subscription_expires_at
                                            ? new Date(user.subscription_expires_at).toLocaleDateString()
                                            : '-'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleActivate(user)}
                                            disabled={processingId === user.id}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold disabled:opacity-50"
                                            title="Ativar assinatura por 6 meses a partir da data de criação"
                                        >
                                            {processingId === user.id ? 'Processando...' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-xs text-text-light-secondary dark:text-text-dark-secondary text-right">
                    Total: {users.length} usuários
                </div>
            </div>
        </div>
    );
};

export default UserManagementModal;
