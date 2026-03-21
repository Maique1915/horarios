import { supabase } from '../lib/supabaseClient';

export interface DbDay {
    id: number;
    name: string;
}

export interface DbTimeSlot {
    id: number;
    start_time: string;
    end_time: string;
}

export interface DbClass {
    subject_id: number;
    class: string;
    day_id: number;
    time_slot_id: number;
    start_real_time?: string;
    end_real_time?: string;
    days?: DbDay | DbDay[] | { id: number; name: string } | { id: number; name: string }[];
    times_slots?: DbTimeSlot | DbTimeSlot[] | { id: number; start_time: string; end_time: string } | { id: number; start_time: string; end_time: string }[];
    [key: string]: any;
}

export const fetchClassesBySubjectIds = async (subjectIds: number[]) => {
    console.log(`📡 classesModel.fetchClassesBySubjectIds: buscando ${subjectIds.length} disciplinas`);
    
    // Tentar buscar com JOINs primeiro
    try {
        const { data, error } = await supabase
            .from('classes')
            .select(`
                subject_id, 
                class, 
                day_id, 
                time_slot_id, 
                start_real_time, 
                end_real_time,
                days(id, name),
                time_slots(id, start_time, end_time)
            `)
            .in('subject_id', subjectIds);

        if (error) {
            console.warn(`⚠️ JOIN com days e time_slots falhou para ${subjectIds.length} IDs, tentando sem JOINs:`, error.message);
            // Fallback: buscar sem JOINs
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('classes')
                .select('subject_id, class, day_id, time_slot_id, start_real_time, end_real_time')
                .in('subject_id', subjectIds);

            if (fallbackError) {
                console.error(`❌ Erro ao buscar classes (fallback):`, fallbackError);
                throw fallbackError;
            }

            console.log(`✅ Retornado ${fallbackData?.length || 0} registros de classes (SEM JOINs)`);
            if (fallbackData && fallbackData.length > 0) {
                console.log(`   Amostra sem JOINs:`, fallbackData.slice(0, 2));
                console.log(`   Subject IDs encontrados:`, [...new Set(fallbackData.map(c => c.subject_id))].slice(0, 5));
            }
            
            return (fallbackData || []) as unknown as DbClass[];
        }

        // console.log(`✅ Retornado ${data?.length || 0} registros de classes (COM JOINs)`);
        // if (data && data.length > 0) {
        //     console.log(`   Amostra com JOINs:`, data.slice(0, 2));
        //     console.log(`   Subject IDs encontrados:`, [...new Set(data.map((c: any) => c.subject_id))].slice(0, 5));
        // }
        
        return (data || []) as unknown as DbClass[];
    } catch (err) {
        console.error(`❌ Erro ao buscar classes:`, err);
        throw err;
    }
};

// CRUD operations
export const insertClasses = async (classesData: any[]) => {
    const { error } = await supabase.from('classes').insert(classesData);
    if (error) throw error;
};

export const deleteClassesBySubjectId = async (subjectId: number | string) => {
    const { error } = await supabase.from('classes').delete().eq('subject_id', subjectId);
    if (error) throw error;
};

// Single operations
export const insertClass = async (classData: Partial<DbClass>) => {
    const { data, error } = await supabase.from('classes').insert(classData).select().single();
    if (error) throw error;
    return data as DbClass;
};

export const updateClass = async (id: number, classData: Partial<DbClass>) => {
    const { data, error } = await supabase.from('classes').update(classData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbClass;
};

export const deleteClass = async (id: number) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
};

export const deleteClassScheduleBySubjectAndName = async (subjectId: number | string, className: string) => {
    const { error } = await supabase.from('classes').delete().match({ subject_id: subjectId, class: className });
    if (error) throw error;
};

export const fetchFullClassesBySubjectId = async (subjectId: number | string) => {
    // Tentar buscar com JOINs primeiro
    try {
        const { data, error } = await supabase
            .from('classes')
            .select(`
                subject_id, 
                class, 
                day_id, 
                time_slot_id, 
                start_real_time, 
                end_real_time,
                days(id, name),
                time_slots(id, start_time, end_time)
            `)
            .eq('subject_id', subjectId);

        if (error) {
            console.warn(`⚠️ JOIN com days e time_slots falhou para ${subjectId}, tentando sem JOINs:`, error.message);
            // Fallback: buscar sem JOINs
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('classes')
                .select('subject_id, class, day_id, time_slot_id, start_real_time, end_real_time')
                .eq('subject_id', subjectId);

            if (fallbackError) throw fallbackError;
            return (fallbackData || []) as unknown as DbClass[];
        }

        return (data || []) as unknown as DbClass[];
    } catch (err) {
        console.error(`❌ Erro ao buscar classes para subject ${subjectId}:`, err);
        throw err;
    }
};
