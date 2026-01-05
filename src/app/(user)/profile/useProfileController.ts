import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { Subject } from '@/types/Subject';
import {
    loadCompletedSubjects,
    loadCurrentEnrollments,
    loadDbData,
    loadClassesForGrid,
    toggleMultipleSubjects,
    Enrollment,
    CompletedSubject
} from '../../../services/disciplinaService';
import { getDays, getTimeSlots } from '../../../services/scheduleService';
import { getUserTotalHours } from '../../../services/complementaryService';
import { getComments, addComment } from '../../../services/commentService';
import ROUTES from '../../../routes';
// @ts-ignore
import Escolhe from '../../../model/util/Escolhe';

// --- Types ---

export interface UserComment {
    id: number | string;
    content: string;
    rating: number;
    created_at: string;
    user?: {
        name: string;
        username: string;
    };
}

export interface ScheduleMeta {
    days: any[];
    slots: any[];
}

export interface EditForm {
    name: string;
    username: string;
    password?: string;
    currentPassword?: string;
}

// --- Controller ---

export const useProfileController = () => {
    const { user, isAuthenticated, loading: authLoading, updateUser, isExpired } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    // -- State --
    const [scheduleMeta, setScheduleMeta] = useState<ScheduleMeta>({ days: [], slots: [] });

    // Edit Profile Modal
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editForm, setEditForm] = useState<EditForm>({ name: '', username: '' });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [updateError, setUpdateError] = useState('');

    // Views
    const [showScheduleView, setShowScheduleView] = useState(false);

    // Manage Subjects (Edit Mode)
    const [isEditingSubjects, setIsEditingSubjects] = useState(false);
    const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
    const [savingSubjects, setSavingSubjects] = useState(false);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
    const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('all');

    // Comments
    const [comments, setComments] = useState<UserComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [loadingComments, setLoadingComments] = useState(true);
    const [submittingComment, setSubmittingComment] = useState(false);

    // Graduation Prediction
    const [estimatedDate, setEstimatedDate] = useState<Date | null>(null);

    // -- Effects & Data Loading --

    useEffect(() => {
        if (!authLoading && !isAuthenticated()) {
            router.push(`${ROUTES.LOGIN}?from=${ROUTES.PROFILE}`);
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                username: user.username || '',
            });
        }
    }, [user]);

    useEffect(() => {
        const loadMeta = async () => {
            try {
                const [d, t] = await Promise.all([getDays(), getTimeSlots()]);
                setScheduleMeta({ days: d || [], slots: t || [] });
            } catch (e) { console.error("Error loading schedule meta", e); }
        };
        loadMeta();
    }, []);

    // Queries
    const { data: completedSubjects = [], isLoading: loadingCompleted } = useQuery<Subject[]>({
        queryKey: ['completedSubjects', user?.id],
        queryFn: async () => {
            const data = await loadCompletedSubjects(user!.id);
            return data as unknown as Subject[];
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
    });



    const { data: currentEnrollments = [], isLoading: loadingEnrollments } = useQuery<Subject[]>({
        queryKey: ['currentEnrollments', user?.id],
        queryFn: async () => {
            const data = await loadCurrentEnrollments(user!.id);
            return data as unknown as Subject[];
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
    });

    const { data: complementaryHours = 0, isLoading: loadingHours } = useQuery<number>({
        queryKey: ['userTotalHours', user?.id],
        queryFn: () => getUserTotalHours(user!.id),
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 5,
    });

    const loadingData = loadingCompleted;

    // Comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const data = await getComments();
                setComments(data);
            } catch (error) {
                console.error("Erro ao carregar comentários:", error);
            } finally {
                setLoadingComments(false);
            }
        };
        fetchComments();
    }, []);

    // Subject Management Init
    useEffect(() => {
        if (isEditingSubjects) {
            if (allSubjects.length === 0) {
                const loadAll = async () => {
                    const courseCode = localStorage.getItem('last_active_course');
                    // @ts-ignore
                    const data = await loadDbData(courseCode);
                    setAllSubjects(data as any);
                };
                loadAll();
            }
            const currentIds = new Set(completedSubjects.map(s => String(s._id)));
            setSelectedSubjectIds(currentIds);
        }
    }, [isEditingSubjects, completedSubjects]);


    // Prediction
    useEffect(() => {
        if (scheduleMeta.days.length > 0 && user) {
            const calculatePrediction = async () => {
                let subjectsToProcess = allSubjects;
                // If not loaded yet (e.g. didn't open edit mode), load them
                if (subjectsToProcess.length === 0) {
                    const courseCode = user.courses?.code || localStorage.getItem('last_active_course');
                    if (courseCode) {
                        try {
                            // @ts-ignore
                            subjectsToProcess = await loadDbData(courseCode);
                        } catch (e) { return; }
                    } else { return; }
                }

                if (subjectsToProcess.length > 0) {
                    const limits = {
                        electiveHours: 360,
                        mandatoryHours: Infinity
                    };

                    const totalCompleted = [...completedSubjects, ...currentEnrollments];
                    const activeSubjects = subjectsToProcess.filter(s => s._ag);

                    const remainingSemesters = Escolhe.predictCompletion(
                        activeSubjects,
                        totalCompleted,
                        scheduleMeta,
                        limits
                    );

                    const baseYear = 2026;
                    const baseSemester = 1;
                    const totalSemesters = remainingSemesters.semestersCount;
                    if (totalSemesters === 0) {
                        setEstimatedDate(new Date()); // Already finished
                    } else {
                        const lastSemesterSeq = baseSemester + totalSemesters - 1;
                        const finalYear = baseYear + Math.floor((lastSemesterSeq - 1) / 2);
                        const finalSem = ((lastSemesterSeq - 1) % 2) + 1;

                        setEstimatedDate(new Date(finalYear, finalSem === 1 ? 0 : 6, 1));
                    }
                }
            };
            calculatePrediction();
        }
    }, [allSubjects, completedSubjects, scheduleMeta, user]);


    // -- Handlers --

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdateError('');
        if (!user) return;

        if (showPassword) {
            if (editForm.password !== confirmPassword) {
                setUpdateError("As senhas não coincidem.");
                return;
            }
        }

        const submissionData = {
            ...editForm,
            password: showPassword ? editForm.password : '',
            currentPassword: editForm.currentPassword || ''
        };

        const { success, error } = await updateUser(user.id, submissionData);
        if (success) {
            setIsEditingProfile(false);
            alert('Perfil atualizado com sucesso!');
        } else {
            setUpdateError(error || 'Erro ao atualizar');
        }
    };

    const handleToggleSubject = (subjectId: string) => {
        const newSelected = new Set(selectedSubjectIds);
        if (newSelected.has(subjectId)) newSelected.delete(subjectId);
        else newSelected.add(subjectId);
        setSelectedSubjectIds(newSelected);
    };

    const handleTogglePeriod = (semester: string, isChecked: boolean) => {
        const subjectsInSemester = allSubjects.filter(s => String(s._se) === semester);
        const newSelected = new Set(selectedSubjectIds);
        subjectsInSemester.forEach(s => {
            if (isChecked) newSelected.add(String(s._id));
            else newSelected.delete(String(s._id));
        });
        setSelectedSubjectIds(newSelected);
    };

    const handleSaveSubjects = async () => {
        if (!user) return;
        try {
            setSavingSubjects(true);
            const originalIds = new Set(completedSubjects.map(s => String(s._id)));
            const addedIds: (string | number)[] = [];
            const removedIds: (string | number)[] = [];

            for (const id of selectedSubjectIds) {
                if (!originalIds.has(id)) addedIds.push(id);
            }
            for (const id of originalIds) {
                if (!selectedSubjectIds.has(id)) removedIds.push(id);
            }

            const promises = [];
            if (addedIds.length > 0) promises.push(toggleMultipleSubjects(user.id, addedIds, true));
            if (removedIds.length > 0) promises.push(toggleMultipleSubjects(user.id, removedIds, false));

            await Promise.all(promises);
            await queryClient.invalidateQueries({ queryKey: ['completedSubjects', user.id] });
            setIsEditingSubjects(false);
            alert("Alterações salvas com sucesso!");

        } catch (error) {
            console.error("Error saving subjects:", error);
            alert("Erro ao salvar alterações.");
        } finally {
            setSavingSubjects(false);
        }
    };

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        setSubmittingComment(true);
        try {
            // @ts-ignore
            await addComment(user.id, newComment, newRating);
            setNewComment('');
            setNewRating(5);
            // @ts-ignore
            const data = await getComments();
            setComments(data);
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            alert("Erro ao enviar comentário.");
        } finally {
            setSubmittingComment(false);
        }
    };

    // Helper: Formatted Schedule
    const getFormattedSchedule = (scheduleData: any) => {
        if (!scheduleData || !Array.isArray(scheduleData) || scheduleMeta.days.length === 0) return [];

        const enriched = scheduleData.map((item: any) => {
            const dayId = Array.isArray(item) ? item[0] : null;
            const slotId = Array.isArray(item) ? item[1] : null;
            const day = scheduleMeta.days.find((d: any) => d.id === dayId);
            const slot = scheduleMeta.slots.find((s: any) => s.id === slotId);
            const slotIndex = scheduleMeta.slots.findIndex((s: any) => s.id === slotId);
            return { day, slot, slotIndex };
        }).filter((x: any) => x.day && x.slot);

        const byDay: any = {};
        enriched.forEach(({ day, slot, slotIndex }: any) => {
            if (!byDay[day.id]) byDay[day.id] = { name: day.name, slots: [] };
            byDay[day.id].slots.push({ slot, slotIndex });
        });

        return Object.values(byDay).map((dayGroup: any) => {
            dayGroup.slots.sort((a: any, b: any) => a.slotIndex - b.slotIndex);
            const ranges: string[] = [];
            if (dayGroup.slots.length > 0) {
                let start = dayGroup.slots[0];
                let end = dayGroup.slots[0];
                for (let i = 1; i < dayGroup.slots.length; i++) {
                    const current = dayGroup.slots[i];
                    if (current.slotIndex === end.slotIndex + 1) end = current;
                    else {
                        ranges.push(`${start.slot.start_time.substring(0, 5)} - ${end.slot.end_time.substring(0, 5)}`);
                        start = current;
                        end = current;
                    }
                }
                ranges.push(`${start.slot.start_time.substring(0, 5)} - ${end.slot.end_time.substring(0, 5)}`);
            }
            return { day: dayGroup.name.substring(0, 3), times: ranges };
        });
    };

    // Helper: Formatted for Grid
    const formattedEnrollmentsForGrid = useMemo(() => {
        if (!currentEnrollments || currentEnrollments.length === 0) return [];
        return currentEnrollments.map(s => ({
            _id: s._id,
            _di: s.class_name || s.name,
            _re: s.acronym,
            _ho: s.schedule_data,
            _se: s.semester,
            _el: !s.elective,
            _ca: s.credits,
            _da: s.schedule_day_time,
            _ap: s._ap || 0,
            _at: s._at || 0,
            _pr: s._pr || []
        }));
    }, [currentEnrollments]);

    // Derived Stats
    const MANDATORY_REQ_HOURS = 3774;
    const ELECTIVE_REQ_HOURS = 360;
    const COMPLEMENTARY_REQ_HOURS = 210;
    const TOTAL_REQ_HOURS = MANDATORY_REQ_HOURS + ELECTIVE_REQ_HOURS + COMPLEMENTARY_REQ_HOURS;
    const mandatorySubjects = completedSubjects.filter(s => s._el);
    const electiveSubjects = completedSubjects.filter(s => !s._el);

    const mandatoryTotalCredits = mandatorySubjects.reduce((sum: number, s: Subject) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);
    const electiveTotalCredits = electiveSubjects.reduce((sum: number, s: Subject) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);
    const mandatoryEffective = Math.min(MANDATORY_REQ_HOURS, mandatoryTotalCredits * 18);
    const electiveEffective = Math.min(ELECTIVE_REQ_HOURS, electiveTotalCredits * 18);
    const compEffective = Math.min(COMPLEMENTARY_REQ_HOURS, complementaryHours || 0);
    const progressPercentage = Math.round(((mandatoryEffective + electiveEffective + compEffective) / TOTAL_REQ_HOURS) * 100);

    return {
        user, authLoading, loadingData, isExpired,
        // State
        isEditingProfile, setIsEditingProfile,
        editForm, setEditForm,
        showPassword, setShowPassword,
        confirmPassword, setConfirmPassword,
        updateError,
        // Views
        showScheduleView, setShowScheduleView,
        formattedEnrollmentsForGrid,
        currentEnrollments,
        completedSubjects,
        complementaryHours,
        // Stats
        progressPercentage, estimatedDate,
        mandatorySubjects, electiveSubjects,
        mandatoryEffective, electiveEffective, compEffective,
        // Subject Mgmt
        isEditingSubjects, setIsEditingSubjects,
        allSubjects, selectedSubjectIds, savingSubjects,
        selectedSemesterFilter, setSelectedSemesterFilter,
        // Comments
        comments, loadingComments, newComment, setNewComment, newRating, setNewRating, submittingComment,
        // Actions
        handleUpdateProfile,
        handleToggleSubject, handleTogglePeriod,
        handleSaveSubjects,
        handlePostComment,
        getFormattedSchedule
    };
};
