import { supabase } from '../lib/supabaseClient';

export interface DbDay {
    id: number;
    name: string;
    // other fields if any
}

export interface DbTimeSlot {
    id: number;
    start_time: string;
    end_time: string;
    course_id?: number;
    // other fields if any
}

export const fetchAllDays = async () => {
    const { data, error } = await supabase.from('days').select('*').order('id');
    if (error) throw error;
    return data as DbDay[];
};

export const fetchAllTimeSlots = async () => {
    const { data, error } = await supabase.from('time_slots').select('*').order('id');
    if (error) throw error;
    return data as DbTimeSlot[];
};

// Days CRUD
export const insertDay = async (dayData: Partial<DbDay>) => {
    const { data, error } = await supabase.from('days').insert(dayData).select().single();
    if (error) throw error;
    return data as DbDay;
};

export const updateDay = async (id: number, dayData: Partial<DbDay>) => {
    const { data, error } = await supabase.from('days').update(dayData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbDay;
};

export const deleteDay = async (id: number) => {
    const { error } = await supabase.from('days').delete().eq('id', id);
    if (error) throw error;
};

// TimeSlots CRUD
export const insertTimeSlot = async (timeSlotData: Partial<DbTimeSlot>) => {
    const { data, error } = await supabase.from('time_slots').insert(timeSlotData).select().single();
    if (error) throw error;
    return data as DbTimeSlot;
};

export const updateTimeSlot = async (id: number, timeSlotData: Partial<DbTimeSlot>) => {
    const { data, error } = await supabase.from('time_slots').update(timeSlotData).eq('id', id).select().single();
    if (error) throw error;
    return data as DbTimeSlot;
};

export const deleteTimeSlot = async (id: number) => {
    const { error } = await supabase.from('time_slots').delete().eq('id', id);
    if (error) throw error;
};
