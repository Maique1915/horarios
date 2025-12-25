'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
    loadCompletedSubjects,
    loadCurrentEnrollments,
    loadDbData,
    toggleCompletedSubject
} from '../../../services/disciplinaService';
import { getDays, getTimeSlots } from '../../../services/scheduleService';
import { getUserTotalHours } from '../../../services/complementaryService';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../../components/LoadingSpinner';

const ProfilePage = () => {
    const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Metadata for schedule formatting
    const [scheduleMeta, setScheduleMeta] = useState({ days: [], slots: [] });

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', username: '', password: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                username: user.username || '',
                password: ''
            });
            setShowPassword(false);
            setConfirmPassword('');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateError('');

        if (showPassword) {
            if (editForm.password !== confirmPassword) {
                setUpdateError("As senhas não coincidem.");
                return;
            }
        } else {
            // If not changing password, ensure we don't send it (though auth context handles empty)
            // But let's be explicit and clear it from form or handle via context logic
            // The context currently sends it if present.
            // We can just rely on the fact that if !showPassword, we won't populate it.
            // But wait, editForm.password is initialized to empty above.
        }

        // If showPassword is false, we should ensure we submit empty password
        const submissionData = { ...editForm };
        if (!showPassword) {
            submissionData.password = '';
        }

        const { success, error } = await updateUser(user.id, submissionData);
        if (success) {
            setIsEditingProfile(false);
            alert('Perfil atualizado com sucesso!');
        } else {
            setUpdateError(error);
        }
    };

    useEffect(() => {
        const loadMeta = async () => {
            try {
                const [d, t] = await Promise.all([getDays(), getTimeSlots()]);
                setScheduleMeta({ days: d || [], slots: t || [] });
            } catch (e) { console.error("Error loading schedule meta", e); }
        };
        loadMeta();
    }, []);

    // Helper to format schedule
    const formatSchedule = (scheduleData) => {
        if (!scheduleData || !Array.isArray(scheduleData) || scheduleMeta.days.length === 0) return null;

        // Map to readable strings
        const parts = scheduleData.map((item) => {
            // item can be [dayId, slotId] or [dayId, slotId, type]
            const dayId = Array.isArray(item) ? item[0] : null;
            const slotId = Array.isArray(item) ? item[1] : null;

            const day = scheduleMeta.days.find(d => d.id === dayId);
            const slot = scheduleMeta.slots.find(s => s.id === slotId);
            if (!day || !slot) return null;

            const dayName = day.name.substring(0, 3); // Seg, Ter
            const time = slot.start_time.substring(0, 5); // 08:00
            return `${dayName} ${time}`;
        }).filter(Boolean);

        if (parts.length === 0) return null;
        return [...new Set(parts)].join(' | ');
    };

    // 1. Completed Subjects
    const { data: completedSubjects = [], isLoading: loadingCompleted } = useQuery({
        queryKey: ['completedSubjects', user?.id],
        queryFn: () => loadCompletedSubjects(user.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
    });

    // 2. Current Enrollments
    const { data: currentEnrollments = [], isLoading: loadingEnrollments } = useQuery({
        queryKey: ['currentEnrollments', user?.id],
        queryFn: () => loadCurrentEnrollments(user.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
    });

    // 4. Complementary Hours
    const { data: complementaryHours = 0, isLoading: loadingHours } = useQuery({
        queryKey: ['userTotalHours', user?.id],
        queryFn: () => getUserTotalHours(user.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
    });

    // Combined loading state
    const loadingData = loadingCompleted;

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated()) {
            router.push('/login?from=/profile');
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (isEditing && allSubjects.length === 0) {
            const loadAll = async () => {
                const courseCode = localStorage.getItem('last_active_course');
                const data = await loadDbData(courseCode);
                setAllSubjects(data);
            };
            loadAll();
        }
    }, [isEditing]);

    const handleToggleSubject = async (subjectId, currentStatus) => {
        try {
            setSaving(true);
            const newStatus = !currentStatus;
            await toggleCompletedSubject(user.id, subjectId, newStatus);

            // Optimistic update or refetch? Refetch is safer for consistency
            queryClient.invalidateQueries(['completedSubjects', user.id]);
        } catch (error) {
            console.error("Error toggling subject:", error);
            alert("Erro ao atualizar disciplina.");
        } finally {
            setSaving(false);
        }
    };

    // Requirements Constants (TODO: Should come from database/course registry)
    const MANDATORY_REQ_HOURS = 3774;
    const ELECTIVE_REQ_HOURS = 360;
    const COMPLEMENTARY_REQ_HOURS = 210;
    const TOTAL_REQ_HOURS = MANDATORY_REQ_HOURS + ELECTIVE_REQ_HOURS + COMPLEMENTARY_REQ_HOURS;

    // Calculate effective hours (capped at requirements)
    const mandatorySubjects = completedSubjects.filter(s => !s._el);
    const electiveSubjects = completedSubjects.filter(s => s._el && s._category !== 'COMPLEMENTARY');

    const mandatoryTotalCredits = mandatorySubjects.reduce((sum, s) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);
    const electiveTotalCredits = electiveSubjects.reduce((sum, s) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);

    const mandatoryHours = Math.min(MANDATORY_REQ_HOURS, mandatoryTotalCredits * 18);
    const electiveHours = Math.min(ELECTIVE_REQ_HOURS, electiveTotalCredits * 18);
    const compHours = Math.min(COMPLEMENTARY_REQ_HOURS, complementaryHours || 0);

    const progressPercentage = Math.round(((mandatoryHours + electiveHours + compHours) / TOTAL_REQ_HOURS) * 100);

    // Helper to group subjects by semester
    const subjectsBySemester = allSubjects.reduce((acc, subject) => {
        const sem = subject._se;
        if (!acc[sem]) acc[sem] = [];
        acc[sem].push(subject);
        return acc;
    }, {});

    const sortedSemesters = Object.keys(subjectsBySemester).sort((a, b) => a - b);
    const [selectedSemester, setSelectedSemester] = useState('all');

    // Filter semesters based on selection
    const filteredSemesters = selectedSemester === 'all'
        ? sortedSemesters
        : sortedSemesters.filter(sem => sem === selectedSemester);


    if (authLoading || (loadingData && user)) {
        return <LoadingSpinner message="Carregando perfil..." />;
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn">
            {/* Header do Perfil */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 mb-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                            <span className="material-symbols-outlined text-5xl">person</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
                                    title="Editar Perfil"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-4 opacity-90 text-sm">
                                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-base">badge</span>
                                    {user.username}
                                </span>
                                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-base">school</span>
                                    {user.role === 'admin' ? 'Administrador' : 'Estudante'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="bg-white/10 rounded-xl p-4 min-w-[200px] backdrop-blur-sm">
                        <div className="flex justify-between items-end mb-2 gap-4">
                            <span className="text-sm font-medium opacity-90 whitespace-nowrap">Progresso do Curso</span>
                            <span className="text-2xl font-bold">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2.5 mb-2">
                            <div
                                className="bg-white h-2.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                    </div>
                </div>
            </div>



            {/* Detailed Progress Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn delay-100">
                <CategoryProgress
                    title="Obrigatórias"
                    subjects={completedSubjects.filter(s => !s._el)}
                    reqHours={3774}
                    reqCredits={198}
                    color="text-blue-500"
                    bgColor="bg-blue-500"
                    icon="school"
                />
                <CategoryProgress
                    title="Optativas"
                    subjects={completedSubjects.filter(s => s._el && s._category !== 'COMPLEMENTARY')}
                    reqHours={360}
                    reqCredits={20}
                    color="text-purple-500"
                    bgColor="bg-purple-500"
                    icon="star"
                />
                <CategoryProgress
                    title="Atividades Comp."
                    subjects={[]}
                    reqHours={210}
                    reqCredits={0}
                    color="text-orange-500"
                    bgColor="bg-orange-500"
                    icon="extension"
                    customTotalHours={complementaryHours}
                    onClick={() => router.push('/activities')}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Turmas Atuais */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md border border-border-light dark:border-border-dark overflow-hidden h-fit">
                    <div className="p-6 border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50">
                        <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_today</span>
                            Grade Atual (Em Curso)
                        </h2>
                    </div>
                    <div className="p-6">
                        {currentEnrollments.length === 0 ? (
                            <p className="text-text-light-secondary dark:text-text-dark-secondary italic text-center py-4">
                                Nenhuma disciplina em curso no momento.
                            </p>
                        ) : (
                            <ul className="space-y-3">
                                {currentEnrollments.map((subject) => {
                                    const formattedSchedule = formatSchedule(subject.schedule_data);
                                    return (
                                        <li key={subject.id} className="p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:border-primary/50 transition-colors">
                                            <div className="flex justify-between items-center">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary truncate" title={subject.name || "Disciplina"}>{subject.name || subject.class_name || "Disciplina"}</h3>
                                                    <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">{subject.acronym || ""} - {subject.course_name || subject.semester || ""}</p>
                                                </div>
                                                {
                                                    subject.schedule_data && (
                                                        <span className="px-2 py-1 text-xs font-bold rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                                                            {formatSchedule(subject.schedule_data)}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Disciplinas Concluídas */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-md border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300">
                    <div className="p-6 border-b border-border-light dark:border-border-dark bg-background-light/50 dark:bg-background-dark/50 flex flex-wrap justify-between items-center gap-4">
                        <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            Matérias Concluídas
                        </h2>
                        <div className="flex items-center gap-2">
                            {isEditing && (
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="px-3 py-1.5 rounded-lg text-sm border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary/50 outline-none border"
                                >
                                    <option value="all">Todos os Períodos</option>
                                    {sortedSemesters.map(sem => (
                                        <option key={sem} value={sem}>{sem}º Período</option>
                                    ))}
                                </select>
                            )}
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isEditing
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-background-light dark:bg-background-dark text-text-light-secondary hover:text-primary border border-border-light dark:border-border-dark'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {isEditing ? 'check' : 'edit'}
                                </span>
                                {isEditing ? 'Concluir' : 'Gerenciar'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {isEditing ? (
                            // Edit Mode: Checklist
                            <div className="space-y-6">
                                {allSubjects.length === 0 ? (
                                    <div className="text-center py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    filteredSemesters.map(sem => (
                                        <div key={sem} className="animate-fadeIn">
                                            <h3 className="text-sm font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-3">
                                                {sem}º Período
                                            </h3>
                                            <div className="space-y-2">
                                                {subjectsBySemester[sem].map(subject => {
                                                    const isCompleted = completedSubjects.some(cs => cs.id === subject._id);
                                                    return (
                                                        <label
                                                            key={subject._id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${isCompleted
                                                                ? 'bg-green-500/5 border-green-500/30'
                                                                : 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark hover:border-primary/50'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 border-green-500' : 'border-text-light-secondary'
                                                                }`}>
                                                                {isCompleted && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={isCompleted}
                                                                disabled={saving}
                                                                onChange={() => handleToggleSubject(subject._id, isCompleted)}
                                                            />
                                                            <div className="flex-1">
                                                                <span className={`font-medium ${isCompleted ? 'text-green-700 dark:text-green-400' : 'text-text-light-primary dark:text-text-dark-primary'}`}>
                                                                    {subject._di}
                                                                </span>
                                                                <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary ml-2">
                                                                    {subject._re}
                                                                </span>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            // View Mode: List
                            completedSubjects.length === 0 ? (
                                <p className="text-text-light-secondary dark:text-text-dark-secondary italic text-center py-4">
                                    Nenhuma disciplina concluída registrada.
                                </p>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 animate-fadeIn">
                                    <span className="text-6xl font-black text-primary/80 mb-2">
                                        {completedSubjects.length}
                                    </span>
                                    <span className="text-text-light-secondary dark:text-text-dark-secondary font-medium uppercase tracking-wide text-sm">
                                        Matérias Concluídas
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditingProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark">
                        <div className="p-6 border-b border-border-light dark:border-border-dark">
                            <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">Editar Perfil</h2>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                            {updateError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                                    {updateError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none transition-all text-text-light-primary dark:text-text-dark-primary"
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
                                    Usuário (Login)
                                </label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                    className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none transition-all text-text-light-primary dark:text-text-dark-primary"
                                    placeholder="seu.usuario"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary mb-1">
                                    Senha
                                </label>
                                {!showPassword ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(true)}
                                        className="text-sm text-primary hover:underline font-medium"
                                    >
                                        Alterar senha
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-fadeIn">
                                        <input
                                            type="password"
                                            value={editForm.password}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none transition-all text-text-light-primary dark:text-text-dark-primary"
                                            placeholder="Nova senha"
                                        />
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/50 outline-none transition-all text-text-light-primary dark:text-text-dark-primary"
                                            placeholder="Confirmar nova senha"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowPassword(false);
                                                setEditForm(prev => ({ ...prev, password: '' }));
                                                setConfirmPassword('');
                                            }}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Cancelar alteração de senha
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingProfile(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-bold shadow-lg shadow-primary/20"
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CategoryProgress = ({ title, subjects, reqHours, reqCredits, color, bgColor, icon, customTotalHours, onClick }) => {
    // Calculate totals
    const totalCredits = subjects.reduce((sum, s) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);

    // Workload calculation: User specific request: credits * 18
    const totalHours = customTotalHours !== undefined ? customTotalHours : totalCredits * 18;

    // Percentages
    const hoursPct = reqHours > 0 ? Math.min(100, Math.round((totalHours / reqHours) * 100)) : 0;
    const creditsPct = reqCredits > 0 ? Math.min(100, Math.round((totalCredits / reqCredits) * 100)) : 0;

    return (
        <div
            onClick={onClick}
            className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-5 flex flex-col gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        >
            <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-lg ${bgColor}/10 flex items-center justify-center`}>
                    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                </div>
                <h3 className="font-bold text-lg text-text-light-primary dark:text-text-dark-primary">{title}</h3>
            </div>

            <div className="space-y-4">
                {/* Hours Progress */}
                <div>
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-text-light-secondary dark:text-text-dark-secondary">Carga Horária</span>
                        <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                            {Math.round(totalHours)} / {reqHours} h
                        </span>
                    </div>
                    <div className="w-full bg-border-light dark:border-border-dark rounded-full h-2">
                        <div className={`h-2 rounded-full ${bgColor} transition-all duration-1000`} style={{ width: `${hoursPct}%` }}></div>
                    </div>
                </div>

                {/* Credits Progress (only if reqCredits > 0) */}
                {reqCredits > 0 && (
                    <div>
                        <div className="flex justify-between text-sm mb-1.5">
                            <span className="text-text-light-secondary dark:text-text-dark-secondary">Créditos</span>
                            <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                                {totalCredits} / {reqCredits}
                            </span>
                        </div>
                        <div className="w-full bg-border-light dark:border-border-dark rounded-full h-2">
                            <div className={`h-2 rounded-full ${bgColor} opacity-70 transition-all duration-1000`} style={{ width: `${creditsPct}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;