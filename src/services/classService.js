import { supabase } from '../lib/supabaseClient.js';

/**
 * Service for handling operations on the 'classes' table (turmas).
 */

// Salva ou atualiza os horários de uma turma específica
export const saveClassSchedule = async (subjectId, classSchedule) => {
    // Deleta todas as entradas para esta turma para garantir consistência
    await supabase.from('classes').delete().match({ subject_id: subjectId, class: classSchedule.class_name });

    // Insere as novas entradas de horário
    if (classSchedule.ho && classSchedule.ho.length > 0) {
        const newClassesRows = classSchedule.ho.map(([dayId, timeSlotId], index) => {
            const customTime = classSchedule.da && classSchedule.da[index];
            return {
                subject_id: subjectId,
                class: classSchedule.class_name,
                day_id: dayId,
                time_slot_id: timeSlotId,
                start_real_time: customTime ? customTime[0] : null,
                end_real_time: customTime ? customTime[1] : null
            };
        });
        const { error } = await supabase.from('classes').insert(newClassesRows);
        if (error) throw error;
    }
};

// Deleta todos os horários de uma turma específica
export const deleteClassSchedule = async (subjectId, className) => {
    const { error } = await supabase.from('classes').delete().match({ subject_id: subjectId, class: className });
    if (error) throw error;
};

// Busca as turmas de uma disciplina e as agrupa pelo nome da turma.
export const getClassesBySubjectId = async (subjectId) => {
    const { data, error } = await supabase
        .from('classes')
        .select('class, day_id, time_slot_id, start_real_time, end_real_time')
        .eq('subject_id', subjectId);

    if (error) throw error;

    const schedulesByClass = new Map();

    data.forEach(schedule => {
        const { class: className, day_id, time_slot_id, start_real_time, end_real_time } = schedule;
        if (!schedulesByClass.has(className)) {
            schedulesByClass.set(className, { class_name: className, ho: [], da: [] });
        }
        const classEntry = schedulesByClass.get(className);
        classEntry.ho.push([day_id, time_slot_id]);

        if (start_real_time || end_real_time) {
            classEntry.da.push([start_real_time || '00:00', end_real_time || '00:00']); // Saving just strings, assuming format is HH:MM:SS or similar
        } else {
            classEntry.da.push(null);
        }
    });

    return Array.from(schedulesByClass.values());
};
