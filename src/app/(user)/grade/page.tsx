'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { ScheduleEditorView } from '../profile/ScheduleEditorView';
import { loadCurrentEnrollments, saveCurrentEnrollments, fetchCourseConfig, loadCompletedSubjects } from '../../../services/disciplinaService';
import { getCurrentPeriod } from '@/utils/dateUtils';

export default function GradePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [currentEnrollments, setCurrentEnrollments] = React.useState<any[]>([]);
    const [activePeriod, setActivePeriod] = React.useState<string>('');
    const [completedSubjectIds, setCompletedSubjectIds] = React.useState<Set<number>>(new Set());
    const [loading, setLoading] = React.useState(true);

    const handleClose = () => {
        router.push('/profile');
    };

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

            // Buscar configuração do curso para obter as datas do período
            const courseCode = user.courses?.code;
            let periodStart: string | null = null;
            let periodEnd: string | null = null;

            if (courseCode) {
                try {
                    const config = await fetchCourseConfig(courseCode);
                    periodStart = config?.period_start ?? null;
                    periodEnd = config?.period_end ?? null;
                } catch (e) {
                    console.warn('Grade: could not load course config, falling back to computed period', e);
                }
            }

            const data = await loadCurrentEnrollments(user.id);

            // Buscar disciplinas concluídas para bloquear no modal de adição
            const completed = await loadCompletedSubjects(user.id);
            setCompletedSubjectIds(new Set(completed.map((s: any) => Number(s._id || s.subject_id))));

            if (periodStart && periodEnd) {
                // Datas configuradas no banco → fonte de verdade, exibir tudo
                setCurrentEnrollments(data);
                // Período ativo = o que está nas matrículas existentes (ou o calculado como fallback)
                const existingPeriod = (data[0] as any)?.period ?? getCurrentPeriod();
                setActivePeriod(existingPeriod);
            } else {
                // Fallback legacy: filtrar pelo período calculado pelo sistema
                const periodoAtual = getCurrentPeriod();
                setCurrentEnrollments(data.filter((e: any) => e.period === periodoAtual));
                setActivePeriod(periodoAtual);
            }
        } catch (error) {
            console.error('Error loading enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    const queryClient = useQueryClient();
    const handleSave = async (enrollments: any[]) => {
        if (!user) return;
        try {
            // Usar o período já determinado (do banco ou calculado)
            const periodo = activePeriod || getCurrentPeriod();
            await saveCurrentEnrollments(user.id, enrollments, periodo, user.course_id);
            await queryClient.invalidateQueries({ queryKey: ['currentEnrollments', user.id] });
        } catch (error) {
            console.error('Error saving grade:', error);
        }
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
            completedSubjectIds={completedSubjectIds}
            onClose={handleClose}
            onSave={handleSave}
        />
    );
}
