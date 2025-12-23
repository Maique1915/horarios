import { supabase } from '../lib/supabaseClient';

let daysCache = null;
let timeSlotsCache = null;

export const getDays = async () => {
    if (daysCache) return daysCache;

    const { data, error } = await supabase
        .from('days')
        .select('*')
        .order('id');

    if (error) throw error;
    daysCache = data;
    return data;
};

export const getTimeSlots = async () => {
    if (timeSlotsCache) return timeSlotsCache;

    const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('start_time');

    if (error) throw error;
    timeSlotsCache = data;
    return data;
};
