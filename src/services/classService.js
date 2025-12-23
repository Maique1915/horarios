import { supabase } from '../lib/supabaseClient';

/**
 * Service for handling operations on the 'classes' table (turmas).
 */

// Salva ou atualiza os horários de uma turma específica
export const saveClassSchedule = async (subjectId, classSchedule) => {
    // Deleta todas as entradas para esta turma para garantir consistência
    await supabase.from('classes').delete().match({ subject_id: subjectId, class: classSchedule.class_name });

    // Insere as novas entradas de horário
    if (classSchedule.ho && classSchedule.ho.length > 0) {
        const newClassesRows = classSchedule.ho.map(([dayId, timeSlotId]) => ({
            subject_id: subjectId,
            class: classSchedule.class_name,
            day_id: dayId,
            time_slot_id: timeSlotId,
        }));
        const { error } = await supabase.from('classes').insert(newClassesRows);
        if (error) throw error;
    }
};

// Deleta todos os horários de uma turma específica
export const deleteClassSchedule = async (subjectId, className) => {
    const { error } = await supabase.from('classes').delete().match({ subject_id: subjectId, class: className });
    if (error) throw error;
};
