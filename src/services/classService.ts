import {
    DbClass,
    insertClasses,
    deleteClassScheduleBySubjectAndName,
    fetchFullClassesBySubjectId
} from '../model/classesModel';

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

    await deleteClassScheduleBySubjectAndName(subjectId, className);

    // Insert new schedule entries
    if (classSchedule.ho && classSchedule.ho.length > 0) {
        const newClassesRows = classSchedule.ho.map(([dayId, timeSlotId], index) => {
            const customTime = classSchedule.da && classSchedule.da[index];
            return {
                subject_id: Number(subjectId),
                class: className,
                day_id: dayId,
                time_slot_id: timeSlotId,
                start_real_time: customTime ? customTime[0] : undefined,
                end_real_time: customTime ? customTime[1] : undefined,
                professor: classSchedule.professor,
                ['sala']: classSchedule.sala
            } as any; // Cast to any to allow 'sala' if not in interface yet, or update DbClass
        });
        await insertClasses(newClassesRows);
    }
};

// Deleta todos os horários de uma turma específica
export const deleteClassSchedule = async (subjectId: number | string, className: string) => {
    await deleteClassScheduleBySubjectAndName(subjectId, className);
};

// Busca as turmas de uma disciplina e as agrupa pelo nome da turma.
export const getClassesBySubjectId = async (subjectId: number | string): Promise<GroupedClass[]> => {
    const data = await fetchFullClassesBySubjectId(subjectId);

    const schedulesByClass = new Map<string, GroupedClass>();

    data.forEach(schedule => {
        const { class: className, day_id, time_slot_id, start_real_time, end_real_time, professor, sala } = schedule;
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
