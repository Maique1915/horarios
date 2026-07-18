import {
    DbClass,
    insertClasses,
    deleteClassScheduleBySubjectAndName,
    fetchFullClassesBySubjectId
} from '../model/classesModel';
import { fetchSubjectsByIds } from '../model/subjectsModel';

/**
 * Service for handling operations on the 'classes' table (turmas).
 */

interface ClassScheduleItem {
    class_name: string;
    turma?: string; // Legacy support
    ho: number[][]; // [day_id, time_slot_id][]
    da?: string[][]; // [start, end][]
    professor?: string;
    sala?: string;
}

interface GroupedClass extends ClassScheduleItem {
    id: string; // Using class_name as ID for view compatibility
    turma: string;
}

// Salva ou atualiza os horários de uma turma específica
export const saveClassSchedule = async (subjectId: number | string, classSchedule: ClassScheduleItem) => {
    // Delete all entries for this class to ensure consistency
    const className = classSchedule.class_name || classSchedule.turma;
    if (!className) throw new Error("Class name is required.");

    let classCodeToSave = className;
    const subjects = await fetchSubjectsByIds([Number(subjectId)]);
    const subject = subjects[0];
    if (subject && subject.name) {
        if (className === subject.name) {
            classCodeToSave = '';
        } else if (className.startsWith(`${subject.name} - `)) {
            classCodeToSave = className.substring(subject.name.length + 3);
        } else if (className.startsWith(`${subject.name} -`)) {
            classCodeToSave = className.substring(subject.name.length + 2);
        } else if (className.startsWith(`${subject.name}-`)) {
            classCodeToSave = className.substring(subject.name.length + 1);
        } else if (className.startsWith(`${subject.name} `)) {
            classCodeToSave = className.substring(subject.name.length + 1);
        }
    }

    await deleteClassScheduleBySubjectAndName(subjectId, classCodeToSave);

    // Insert new schedule entries
    if (classSchedule.ho && classSchedule.ho.length > 0) {
        const newClassesRows = classSchedule.ho.map(([dayId, timeSlotId], index) => {
            const customTime = classSchedule.da && classSchedule.da[index];
            return {
                subject_id: Number(subjectId),
                class_code: classCodeToSave,
                day_id: dayId,
                time_slot_id: timeSlotId,
                start_real_time: customTime ? customTime[0] : undefined,
                end_real_time: customTime ? customTime[1] : undefined
            } as any; 
        });
        await insertClasses(newClassesRows);
    }
};

// Deleta todos os horários de uma turma específica
export const deleteClassSchedule = async (subjectId: number | string, className: string) => {
    let classCodeToDelete = className;
    const subjects = await fetchSubjectsByIds([Number(subjectId)]);
    const subject = subjects[0];
    if (subject && subject.name) {
        if (className === subject.name) {
            classCodeToDelete = '';
        } else if (className.startsWith(`${subject.name} - `)) {
            classCodeToDelete = className.substring(subject.name.length + 3);
        } else if (className.startsWith(`${subject.name} -`)) {
            classCodeToDelete = className.substring(subject.name.length + 2);
        } else if (className.startsWith(`${subject.name}-`)) {
            classCodeToDelete = className.substring(subject.name.length + 1);
        } else if (className.startsWith(`${subject.name} `)) {
            classCodeToDelete = className.substring(subject.name.length + 1);
        }
    }
    await deleteClassScheduleBySubjectAndName(subjectId, classCodeToDelete);
};

// Busca as turmas de uma disciplina e as agrupa pelo nome da turma.
export const getClassesBySubjectId = async (subjectId: number | string): Promise<GroupedClass[]> => {
    const data = await fetchFullClassesBySubjectId(subjectId);

    const schedulesByClass = new Map<string, GroupedClass>();

    data.forEach(schedule => {
        const { class_code: className, day_id, time_slot_id, start_real_time, end_real_time, professor, sala } = schedule;
        if (!schedulesByClass.has(className)) {
            schedulesByClass.set(className, {
                id: className,
                class_name: className,
                turma: className,
                professor: professor || undefined,
                sala: sala || undefined,
                ho: [],
                da: []
            });
        }
        const classEntry = schedulesByClass.get(className)!;
        classEntry.ho.push([day_id, time_slot_id]);

        if (start_real_time || end_real_time) {
            classEntry.da?.push([start_real_time || '00:00', end_real_time || '00:00']);
        } else {
            classEntry.da?.push(null as any); // Or handle nulls better in UI
        }
    });

    return Array.from(schedulesByClass.values());
};
