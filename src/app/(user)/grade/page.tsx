'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { ScheduleEditorView } from '../profile/ScheduleEditorView';
import { loadCurrentEnrollments } from '../../../services/disciplinaService';
import { getCurrentPeriod } from '@/utils/dateUtils';

export default function GradePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [currentEnrollments, setCurrentEnrollments] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/');
            } else {
                loadEnrollments();
            }
        }
    }, [authLoading, user, router]);

    const loadEnrollments = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await loadCurrentEnrollments(user.id);
            const periodoAtual = getCurrentPeriod();
            // Filtrar apenas o que é do período atual
            const filteredData = data.filter((e: any) => e.period === periodoAtual);
            setCurrentEnrollments(filteredData);
        } catch (error) {
            console.error('Error loading enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        router.push('/profile');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-primary animate-spin mb-4">sync</span>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary">Carregando...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <ScheduleEditorView
            currentEnrollments={currentEnrollments}
            userCourseCode={user.courses?.code || 'engcomp'}
            onClose={handleClose}
        />
    );
}
