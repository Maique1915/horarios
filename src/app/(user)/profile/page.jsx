'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import {
    loadCompletedSubjects,
    loadCurrentEnrollments,
    loadDbData,
    loadClassesForGrid,
    toggleCompletedSubject,
    toggleMultipleSubjects
} from '../../../services/disciplinaService';
import { getDays, getTimeSlots } from '../../../services/scheduleService';
import { getUserTotalHours } from '../../../services/complementaryService';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Escolhe from '../../../model/util/Escolhe';

const ProfilePage = () => {
    const { user, isAuthenticated, loading: authLoading, updateUser } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    useEffect(() => {
        console.log("ProfilePage mounted");
        return () => console.log("ProfilePage unmounted");
    }, []);



    // Metadata for schedule formatting
    const [scheduleMeta, setScheduleMeta] = useState({ days: [], slots: [] });

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', username: '', password: '', currentPassword: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                username: user.username || '',
                password: '',
                currentPassword: ''
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

    // Helper to format schedule and group by day
    const getFormattedSchedule = (scheduleData) => {
        if (!scheduleData || !Array.isArray(scheduleData) || scheduleMeta.days.length === 0) return [];

        // 1. Enrich data with day/slot info
        const enriched = scheduleData.map(item => {
            const dayId = Array.isArray(item) ? item[0] : null;
            const slotId = Array.isArray(item) ? item[1] : null;
            const day = scheduleMeta.days.find(d => d.id === dayId);
            const slot = scheduleMeta.slots.find(s => s.id === slotId);
            const slotIndex = scheduleMeta.slots.findIndex(s => s.id === slotId);
            return { day, slot, slotIndex };
        }).filter(x => x.day && x.slot);

        // 2. Group by Day ID to preserve order
        const byDay = {};
        enriched.forEach(({ day, slot, slotIndex }) => {
            if (!byDay[day.id]) byDay[day.id] = { name: day.name, slots: [] };
            byDay[day.id].slots.push({ slot, slotIndex });
        });

        // 3. Format
        const result = Object.values(byDay).map(dayGroup => {
            // Sort slots by time
            dayGroup.slots.sort((a, b) => a.slotIndex - b.slotIndex);

            // Compress consecutive slots
            const ranges = [];
            if (dayGroup.slots.length > 0) {
                let start = dayGroup.slots[0];
                let end = dayGroup.slots[0];

                for (let i = 1; i < dayGroup.slots.length; i++) {
                    const current = dayGroup.slots[i];
                    // Check if consecutive (assuming slot indices are sequential in the array)
                    if (current.slotIndex === end.slotIndex + 1) {
                        end = current;
                    } else {
                        ranges.push(`${start.slot.start_time.substring(0, 5)} - ${end.slot.end_time.substring(0, 5)}`);
                        start = current;
                        end = current;
                    }
                }
                ranges.push(`${start.slot.start_time.substring(0, 5)} - ${end.slot.end_time.substring(0, 5)}`);
            }

            return {
                day: dayGroup.name.substring(0, 3), // Seg, Ter
                times: ranges
            };
        });

        return result;
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

    // NEW: Local state for selected items in Edit Mode
    const [selectedIds, setSelectedIds] = useState(new Set());

    useEffect(() => {
        if (!authLoading && !isAuthenticated()) {
            router.push('/login?from=/profile');
        }
    }, [authLoading, isAuthenticated, router]);

    // Initialize Edit Mode
    useEffect(() => {
        if (isEditing) {
            // Lazy load all subjects if needed
            if (allSubjects.length === 0) {
                const loadAll = async () => {
                    const courseCode = localStorage.getItem('last_active_course');
                    const data = await loadDbData(courseCode);
                    setAllSubjects(data);
                };
                loadAll();
            }

            // Initialize selectedIds from currently completed subjects
            const currentIds = new Set(completedSubjects.map(s => s._id));
            setSelectedIds(currentIds);
        }
    }, [isEditing, completedSubjects]); // Depend on completedSubjects to sync initial state

    const handleToggleSubject = (subjectId, currentStatus) => {
        // Only update local state
        const newSelected = new Set(selectedIds);
        if (newSelected.has(subjectId)) {
            newSelected.delete(subjectId);
        } else {
            newSelected.add(subjectId);
        }
        setSelectedIds(newSelected);
    };

    const handleTogglePeriod = (semester, isChecked) => {
        // Only update local state
        const subjectsInSemester = subjectsBySemester[semester];
        const newSelected = new Set(selectedIds);

        subjectsInSemester.forEach(s => {
            if (isChecked) {
                newSelected.add(s._id);
            } else {
                newSelected.delete(s._id);
            }
        });
        setSelectedIds(newSelected);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const originalIds = new Set(completedSubjects.map(s => s._id));

            // Find added and removed IDs
            const addedIds = [];
            const removedIds = [];

            // Check for additions
            for (const id of selectedIds) {
                if (!originalIds.has(id)) {
                    addedIds.push(id);
                }
            }

            // Check for removals
            for (const id of originalIds) {
                if (!selectedIds.has(id)) {
                    removedIds.push(id);
                }
            }

            // Perform bulk updates
            const promises = [];
            if (addedIds.length > 0) promises.push(toggleMultipleSubjects(user.id, addedIds, true));
            if (removedIds.length > 0) promises.push(toggleMultipleSubjects(user.id, removedIds, false));

            await Promise.all(promises);

            // Refresh data
            await queryClient.invalidateQueries(['completedSubjects', user.id]);
            setIsEditing(false);
            alert("Alterações salvas com sucesso!");

        } catch (error) {
            console.error("Error saving subjects:", error);
            alert("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // selectedIds will be reset by useEffect next time isEditing becomes true
    };

    // ... existing constants ...
    const MANDATORY_REQ_HOURS = 3774;
    const ELECTIVE_REQ_HOURS = 360;
    const COMPLEMENTARY_REQ_HOURS = 210;
    const TOTAL_REQ_HOURS = MANDATORY_REQ_HOURS + ELECTIVE_REQ_HOURS + COMPLEMENTARY_REQ_HOURS;

    // Calculate effective hours (capped at requirements)
    const mandatorySubjects = completedSubjects.filter(s => s._el);
    const electiveSubjects = completedSubjects.filter(s => !s._el);

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

    const sortedSemesters = Object.keys(subjectsBySemester)
        .filter(sem => Number(sem) > 0)
        .sort((a, b) => a - b);
    const [selectedSemester, setSelectedSemester] = useState('all');

    // Filter semesters based on selection
    const filteredSemesters = selectedSemester === 'all'
        ? sortedSemesters
        : sortedSemesters.filter(sem => sem === selectedSemester);


    // 5. Graduation Prediction
    const [estimatedDate, setEstimatedDate] = useState(null);

    useEffect(() => {
        if (scheduleMeta.days.length > 0) {
            const calculatePrediction = async () => {
                let subjectsToProcess = allSubjects;

                if (subjectsToProcess.length === 0) {
                    const courseCode = user?.courses?.code || localStorage.getItem('last_active_course');
                    if (courseCode) {
                        try {
                            subjectsToProcess = await loadClassesForGrid(courseCode);
                        } catch (e) {
                            console.error("Failed to load subjects for prediction", e);
                            return;
                        }
                    } else {
                        return;
                    }
                }

                if (subjectsToProcess.length > 0) {
                    const remainingSemesters = Escolhe.predictCompletion(
                        subjectsToProcess,
                        completedSubjects,
                        scheduleMeta
                    );

                    const today = new Date();
                    const futureDate = new Date(today);
                    futureDate.setMonth(futureDate.getMonth() + (remainingSemesters * 6));
                    setEstimatedDate(futureDate);
                }
            };
            calculatePrediction();
        }
    }, [allSubjects, completedSubjects, scheduleMeta]);


    // Log when key data changes to debug re-renders (can be removed later)
    useEffect(() => {
        console.log("ProfilePage data updated:", {
            completedSubjectsCount: completedSubjects.length,
            enrollmentsCount: currentEnrollments.length,
            user: user?.id
        });
    }, [completedSubjects.length, currentEnrollments.length, user?.id]);

    if (authLoading || (loadingData && user)) {
        return <LoadingSpinner message="Carregando perfil..." />;
    }

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn max-w-6xl">
            {/* Header do Perfil - Sober */}
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 mb-8 border border-border-light dark:border-border-dark shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-5 flex-1 w-full md:w-auto">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-border-light dark:border-border-dark">
                            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary">{user.name || user.username}</h1>
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="w-7 h-7 rounded-full text-text-light-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                                    title="Editar Perfil"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary bg-background-light dark:bg-background-dark px-2.5 py-0.5 rounded-md border border-border-light dark:border-border-dark">
                                    <span className="material-symbols-outlined text-sm">badge</span>
                                    {user.username}
                                </span>
                                <span className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary bg-background-light dark:bg-background-dark px-2.5 py-0.5 rounded-md border border-border-light dark:border-border-dark">
                                    <span className="material-symbols-outlined text-sm">school</span>
                                    {user.role === 'admin' ? 'Administrador' : 'Estudante'}
                                </span>
                                {user.subscription_expires_at && (
                                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/30">
                                        <span className="material-symbols-outlined text-sm">hourglass_bottom</span>
                                        Vence em: {new Date(user.subscription_expires_at).toLocaleDateString('pt-BR')}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress Stats - Minimalist */}
                    <div className="bg-background-light dark:bg-background-dark rounded-xl p-4 min-w-[280px] border border-border-light dark:border-border-dark w-full md:w-auto flex flex-col justify-between">
                        <div className="mb-4">
                            <div className="flex justify-between items-end mb-2 gap-4">
                                <span className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Progresso Total</span>
                                <span className="text-xl font-bold text-primary">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Prediction in Header */}
                        <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">event_available</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Previsão</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                                    {estimatedDate ? (
                                        <>
                                            {estimatedDate.toLocaleString('default', { month: 'short' })}/{estimatedDate.getFullYear()}
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-normal">Calculando...</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Progress Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fadeIn delay-100">
                <CategoryProgress
                    title="Obrigatórias"
                    subjects={mandatorySubjects}
                    reqHours={3774}
                    reqCredits={198}
                    color="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-600"
                    icon="school"
                />
                <CategoryProgress
                    title="Optativas"
                    subjects={electiveSubjects}
                    reqHours={360}
                    reqCredits={20}
                    color="text-purple-600 dark:text-purple-400"
                    bgColor="bg-purple-600"
                    icon="star"
                />
                <CategoryProgress
                    title="Atividades Comp."
                    subjects={[]}
                    reqHours={210}
                    reqCredits={0}
                    color="text-orange-600 dark:text-orange-400"
                    bgColor="bg-orange-600"
                    icon="extension"
                    customTotalHours={complementaryHours}
                    onClick={() => router.push('/activities')}
                />


            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Turmas Atuais */}
                <div className="bg-surface-light dark:bg-surface-dark lg:col-span-3 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5">
                        <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">calendar_today</span>
                            Grade Atual (Em Curso)
                        </h2>
                    </div>
                    <div className="p-6">
                        {currentEnrollments.length === 0 ? (
                            <div className="text-center py-8">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                                    Nenhuma disciplina em curso no momento.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {currentEnrollments.map((subject) => {
                                    const scheduleGroups = getFormattedSchedule(subject.schedule_data);

                                    return (
                                        <li key={subject.id} className="p-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:border-primary/30 transition-colors group">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary text-base leading-tight mb-1" title={subject.name}>{subject.name || subject.class_name || "Disciplina"}</h3>
                                                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                            {subject.acronym || "N/A"}
                                                        </span>
                                                        {(subject.course_name || subject.semester) && (
                                                            <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary flex items-center gap-1">
                                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                {subject.course_name || subject.semester}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Schedule Display */}
                                                {scheduleGroups.length > 0 && (
                                                    <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                        {scheduleGroups.map((group, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                                <span className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wide min-w-[24px]">
                                                                    {group.day}
                                                                </span>
                                                                <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                                <div className="flex flex-wrap gap-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                                    {group.times.map((time, tIdx) => (
                                                                        <span key={tIdx} className={tIdx > 0 ? "before:content-[','] before:mr-1 before:text-slate-300 dark:before:text-slate-600" : ""}>
                                                                            {time}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Disciplinas Concluídas */}
                <div className="bg-surface-light dark:bg-surface-dark lg:col-span-2 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit">
                    <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex flex-wrap justify-between items-center gap-4">
                        <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            Concluídas <span className="text-sm font-normal text-slate-500 ml-1">({completedSubjects.length})</span>
                        </h2>

                        <div className="flex items-center gap-2">
                            {isEditing && (
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="px-2 py-1.5 rounded-lg text-xs border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 text-text-light-primary dark:text-text-dark-primary focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="all">Todos</option>
                                    {sortedSemesters.map(sem => (
                                        <option key={sem} value={sem}>{sem}º Per</option>
                                    ))}
                                </select>
                            )}

                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCancel}
                                        disabled={saving}
                                        className="px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm flex items-center gap-1"
                                    >
                                        {saving ? 'Salvando...' : 'Salvar'}
                                        {!saving && <span className="material-symbols-outlined text-[14px]">save</span>}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-white dark:bg-slate-800 text-text-light-secondary hover:text-primary border border-border-light dark:border-border-dark"
                                    title="Gerenciar Disciplinas"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-0">
                        {isEditing ? (
                            // Edit Mode: Checklist
                            <div className="max-h-[500px] overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                {allSubjects.length === 0 ? (
                                    <div className="py-8">
                                        <LoadingSpinner />
                                    </div>
                                ) : (
                                    filteredSemesters.map(sem => {
                                        const semesterSubjects = subjectsBySemester[sem];
                                        // Now checks local state `selectedIds` instead of props
                                        const allCompleted = semesterSubjects.every(s => selectedIds.has(s._id));

                                        return (
                                            <div key={sem} className="animate-fadeIn">
                                                <div className="flex items-center justify-between mb-2 sticky top-0 bg-surface-light dark:bg-surface-dark pb-2 z-10">
                                                    <h3 className="text-xs font-bold text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                                                        {sem}º Período
                                                    </h3>
                                                    <label className="flex items-center gap-2 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800 px-2 rounded transition-colors">
                                                        <span className="text-[10px] text-text-light-secondary dark:text-text-dark-secondary group-hover:text-primary transition-colors uppercase font-bold tracking-wide">
                                                            Todos
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                                                            checked={allCompleted}
                                                            onChange={(e) => handleTogglePeriod(sem, e.target.checked)}
                                                            disabled={saving}
                                                        />
                                                    </label>
                                                </div>
                                                <div className="space-y-1">
                                                    {subjectsBySemester[sem].map(subject => {
                                                        const isCompleted = selectedIds.has(subject._id);
                                                        return (
                                                            <label
                                                                key={subject._id}
                                                                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${isCompleted
                                                                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                                                                    : 'bg-white dark:bg-slate-800/50 border-border-light dark:border-border-dark hover:border-primary/30'
                                                                    }`}
                                                            >
                                                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isCompleted ? 'bg-green-500 border-green-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                                                                    }`}>
                                                                    {isCompleted && <span className="material-symbols-outlined text-white text-[10px] font-bold">check</span>}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isCompleted}
                                                                    disabled={saving}
                                                                    onChange={() => handleToggleSubject(subject._id, isCompleted)}
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={`text-sm font-medium leading-tight mb-0.5 ${isCompleted ? 'text-green-900 dark:text-green-100' : 'text-text-light-primary dark:text-text-dark-primary'}`}>
                                                                        {subject._di}
                                                                    </div>
                                                                    <div className="flex gap-2 text-xs opacity-70">
                                                                        <span>{subject._re}</span>
                                                                        <span>• {Number(subject._ap || 0) + Number(subject._at || 0)}cr</span>
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        ) : (
                            // View Mode: Empty State / Summary
                            <div className="text-center py-10 px-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 mb-3">
                                    <span className="material-symbols-outlined text-2xl text-green-600 dark:text-green-400">task_alt</span>
                                </div>
                                <h3 className="text-base font-semibold text-text-light-primary dark:text-text-dark-primary mb-1">
                                    Progresso Registrado
                                </h3>
                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-4 max-w-[200px] mx-auto">
                                    Você já concluiu {completedSubjects.length} disciplinas. Mantenha seu histórico atualizado.
                                </p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark rounded-lg text-sm font-medium text-text-light-secondary hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                                >
                                    Gerenciar Histórico
                                </button>
                            </div>
                        )
                        }
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {
                isEditingProfile && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                        <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark scale-100 transform transition-transform">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">Editar Perfil</h2>
                                <button onClick={() => setIsEditingProfile(false)} className="text-text-light-secondary hover:text-primary">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                                {updateError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex gap-2 items-center">
                                        <span className="material-symbols-outlined text-lg">error</span>
                                        {updateError}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-light-primary dark:text-text-dark-primary text-sm"
                                        placeholder="Seu nome"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">
                                        Usuário
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.username}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-light-primary dark:text-text-dark-primary text-sm"
                                        placeholder="seu.usuario"
                                    />
                                </div>

                                <div className="space-y-1.5 pt-2 border-t border-border-light dark:border-border-dark mt-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">
                                        Senha Atual (Obrigatório para alterações)
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.currentPassword}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-light-primary dark:text-text-dark-primary text-sm"
                                        placeholder="Digite sua senha atual"
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary mb-1.5">
                                        Segurança
                                    </label>
                                    {!showPassword ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(true)}
                                            className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10 w-full justify-center"
                                        >
                                            <span className="material-symbols-outlined text-lg">lock_reset</span>
                                            Alterar senha
                                        </button>
                                    ) : (
                                        <div className="space-y-3 animate-fadeIn bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border-light dark:border-border-dark">
                                            <input
                                                type="password"
                                                value={editForm.password}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-light-primary dark:text-text-dark-primary text-sm"
                                                placeholder="Nova senha"
                                            />
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-light-primary dark:text-text-dark-primary text-sm"
                                                placeholder="Confirmar nova senha"
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowPassword(false);
                                                        setEditForm(prev => ({ ...prev, password: '' }));
                                                        setConfirmPassword('');
                                                    }}
                                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingProfile(false)}
                                        className="flex-1 px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-light-secondary dark:text-text-dark-secondary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm shadow-sm"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
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
            className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 flex flex-col gap-4 group ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
        >
            <div className="flex items-center gap-4 mb-2">
                <div className={`w-10 h-10 rounded-lg ${bgColor}/10 flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
                </div>
                <h3 className="font-bold text-base text-text-light-primary dark:text-text-dark-primary leading-tight">{title}</h3>
            </div>

            <div className="space-y-4">
                {/* Hours Progress */}
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wide font-semibold">Carga Horária</span>
                        <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                            {Math.round(totalHours)} / {reqHours} h
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${bgColor} transition-all duration-1000`} style={{ width: `${hoursPct}%` }}></div>
                    </div>
                </div>

                {/* Credits Progress (only if reqCredits > 0) */}
                {reqCredits > 0 && (
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wide font-semibold">Créditos</span>
                            <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                                {totalCredits} / {reqCredits}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${bgColor} opacity-70 transition-all duration-1000`} style={{ width: `${creditsPct}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;