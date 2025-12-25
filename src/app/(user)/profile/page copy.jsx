'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    loadCompletedSubjects,
    loadCurrentEnrollments,
    getCourseTotalSubjects,
    loadDbData,
    toggleCompletedSubject
} from '../../services/disciplinaService';
import { getUserTotalHours } from '../../services/complementaryService';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProfilePage = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();
    const [completedSubjects, setCompletedSubjects] = useState([]);
    const [currentEnrollments, setCurrentEnrollments] = useState([]);
    const [totalSubjects, setTotalSubjects] = useState(0);
    const [complementaryHours, setComplementaryHours] = useState(0);
    const [loadingData, setLoadingData] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [allSubjects, setAllSubjects] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated()) {
            router.push('/login?from=/profile');
        }
    }, [authLoading, isAuthenticated, router]);

    const fetchData = async () => {
        if (user && user.id) {
            try {
                const courseCode = localStorage.getItem('last_active_course');
                const [completed, enrollments, total, compHours] = await Promise.all([
                    loadCompletedSubjects(user.id),
                    loadCurrentEnrollments(user.id),
                    getCourseTotalSubjects(courseCode),
                    getUserTotalHours(user.id)
                ]);
                setCompletedSubjects(completed);
                setCurrentEnrollments(enrollments);
                setTotalSubjects(total);
                setComplementaryHours(compHours);
            } catch (error) {
                console.error("Failed to load profile data", error);
            } finally {
                setLoadingData(false);
            }
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    // Load all subjects when entering edit mode
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
            await fetchData();
        } catch (error) {
            console.error("Error toggling subject:", error);
            alert("Erro ao atualizar disciplina.");
        } finally {
            setSaving(false);
        }
    };

    const progressPercentage = totalSubjects > 0
        ? Math.round((completedSubjects.length / totalSubjects) * 100)
        : 0;

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
        <div className="container mx-auto px-4 py-8 max-w-5xl animate-fadeIn">
            {/* Header do Perfil */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 mb-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex items-center gap-6 flex-1">
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0">
                            <span className="material-symbols-outlined text-5xl">person</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{user.name || user.username}</h1>
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
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium opacity-90">Progresso do Curso</span>
                            <span className="text-2xl font-bold">{progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-2.5 mb-2">
                            <div
                                className="bg-white h-2.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-xs opacity-75 text-right">
                            {completedSubjects.length} de {totalSubjects} disciplinas
                        </p>
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
                                {currentEnrollments.map((subject) => (
                                    <li key={subject.id} className="p-3 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:border-primary/50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary">{subject.name}</h3>
                                                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">{subject.acronym} - {subject.course_name}</p>
                                            </div>
                                            {subject.class_name && (
                                                <span className="px-2 py-1 text-xs font-bold rounded bg-primary/10 text-primary">
                                                    Turma {subject.class_name}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                ))}
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
                                <ul className="space-y-3">
                                    {completedSubjects.map((subject) => (
                                        <li key={subject._id} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 flex items-center gap-3 animate-fadeIn">
                                            <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-lg">done</span>
                                            <div>
                                                <h3 className="font-medium text-text-light-primary dark:text-text-dark-primary">{subject._di}</h3>
                                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">
                                                    {subject._re} • {subject._se}º Período
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CategoryProgress = ({ title, subjects, reqHours, reqCredits, color, bgColor, icon, customTotalHours }) => {
    // Calculate totals
    const totalCredits = subjects.reduce((sum, s) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);

    // Workload calculation: User specific request: credits * 18
    const totalHours = customTotalHours !== undefined ? customTotalHours : totalCredits * 18;

    // Percentages
    const hoursPct = reqHours > 0 ? Math.min(100, Math.round((totalHours / reqHours) * 100)) : 0;
    const creditsPct = reqCredits > 0 ? Math.min(100, Math.round((totalCredits / reqCredits) * 100)) : 0;

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-5 flex flex-col gap-4">
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
