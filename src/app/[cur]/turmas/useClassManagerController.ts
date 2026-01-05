import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { loadDbData } from '../../../services/disciplinaService';
import { getDays, getTimeSlots } from '../../../services/scheduleService';
import { saveClassSchedule as saveClass, deleteClassSchedule as deleteClass, getClassesBySubjectId as loadClasses } from '../../../services/classService';

// --- Types ---
import { Subject } from '../../../types/Subject';

export interface ScheduleSlot {
    day: string;
    time: string;
}

export interface ClassData {
    id?: string;
    turma: string;
    professor: string;
    sala: string;
    horario: ScheduleSlot[];
    disciplina_id?: string | number;
    _di?: string; // Discipline Name for display
}

export interface DisciplineOption {
    value: string | number;
    label: string;
    original: Subject;
}

// --- Controller ---
export const useClassManagerController = () => {
    const params = useParams();
    const cur = params?.cur as string | undefined;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [disciplinas, setDisciplinas] = useState<Subject[]>([]);
    const [semestre, setSemestre] = useState<number>(1);
    const [selectedDisciplina, setSelectedDisciplina] = useState<DisciplineOption | null>(null);

    // Classes for the selected discipline
    const [classes, setClasses] = useState<ClassData[]>([]);

    // Editor State
    const [editingClassIndex, setEditingClassIndex] = useState<number | null>(null);
    const [currentClass, setCurrentClass] = useState<ClassData>({
        turma: '',
        professor: '',
        sala: '',
        horario: []
    });

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Schedule Meta
    const [days, setDays] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);

    // Load initial data
    useEffect(() => {
        const init = async () => {
            if (!cur) return;
            try {
                const [dbData, d, t] = await Promise.all([
                    loadDbData(cur),
                    getDays(),
                    getTimeSlots()
                ]);
                setDisciplinas(dbData || []);
                setDays(d || []);
                setSlots(t || []);
            } catch (error) {
                console.error("Error loading initial data", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [cur]);

    // Derived: Discipline Options
    const disciplinaOptions: DisciplineOption[] = useMemo(() => {
        return disciplinas
            .filter(d => Number(d._se) === semestre)
            .sort((a, b) => a._di.localeCompare(b._di))
            .map(d => ({ value: d._id || '', label: d._di, original: d }));
    }, [disciplinas, semestre]);

    // Load classes when discipline is selected
    useEffect(() => {
        const fetchClasses = async () => {
            if (!selectedDisciplina || !cur) {
                setClasses([]);
                return;
            }
            try {
                const loadedClasses = await loadClasses(selectedDisciplina.value);
                const mappedClasses = loadedClasses.map(c => ({
                    ...c,
                    horario: c.ho ? c.ho.map(([d, t]) => ({ day: String(d), time: String(t) })) : []
                }));

                setClasses(mappedClasses as unknown as ClassData[]);
            } catch (error) {
                console.error("Error loading classes", error);
                setClasses([]); // Ensure empty on error or start fresh
            }
        };
        fetchClasses();
    }, [selectedDisciplina, cur]);

    // Actions
    const handleNewClass = () => {
        setCurrentClass({ turma: '', professor: '', sala: '', horario: [] });
        setEditingClassIndex(null);
        setIsEditing(true);
    };

    const handleEditClass = (index: number) => {
        setCurrentClass({ ...classes[index] });
        setEditingClassIndex(index);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingClassIndex(null);
    };

    const handleSaveClass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cur || !selectedDisciplina) return;

        setSaving(true);
        try {
            // @ts-ignore
            await saveClass(selectedDisciplina.value, { ...currentClass, class_name: currentClass.turma });

            // Reload classes to get latest ID/State
            // @ts-ignore
            const loadedClasses = await loadClasses(selectedDisciplina.value);
            const mappedClasses = loadedClasses.map(c => ({
                ...c,
                horario: c.ho ? c.ho.map(([d, t]) => ({ day: String(d), time: String(t) })) : []
            }));
            setClasses(mappedClasses as unknown as ClassData[]);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving class", error);
            alert("Erro ao salvar turma.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteClass = async (classId: string | undefined) => {
        if (!cur || !selectedDisciplina || !classId) return;
        if (!confirm("Tem certeza que deseja excluir esta turma?")) return;

        try {
            // @ts-ignore
            await deleteClass(selectedDisciplina.value, classId); // classId is the class name here
            // @ts-ignore
            const loadedClasses = await loadClasses(selectedDisciplina.value);
            const mappedClasses = loadedClasses.map(c => ({
                ...c,
                horario: c.ho ? c.ho.map(([d, t]) => ({ day: String(d), time: String(t) })) : []
            }));
            setClasses(mappedClasses as unknown as ClassData[]);
        } catch (error) {
            console.error("Error deleting class", error);
            alert("Erro ao excluir turma.");
        }
    };

    const toggleScheduleSlot = (dayId: string, slotId: string) => {
        const existingIndex = currentClass.horario.findIndex(h => h.day === dayId && h.time === slotId);
        const newHorario = [...currentClass.horario];
        if (existingIndex >= 0) {
            newHorario.splice(existingIndex, 1);
        } else {
            newHorario.push({ day: dayId, time: slotId });
        }
        setCurrentClass({ ...currentClass, horario: newHorario });
    };

    return {
        // State
        cur,
        loading,
        semestre, setSemestre,
        selectedDisciplina, setSelectedDisciplina,
        disciplinaOptions,
        classes,
        days, slots,
        // Editor State
        isEditing,
        currentClass, setCurrentClass,
        saving,
        editingClassIndex,
        // Actions
        handleNewClass,
        handleEditClass,
        handleCancelEdit,
        handleSaveClass,
        handleDeleteClass,
        toggleScheduleSlot,
        // Utils
        semesters: Array.from(new Set(disciplinas.map(d => Number(d._se)).filter(Number))).sort((a, b) => a - b)
    };
};
