import { DbDay, DbTimeSlot, fetchAllDays, fetchAllTimeSlots } from '../model/schedulerModel';

let daysCache: DbDay[] | null = null;
let timeSlotsCache: DbTimeSlot[] | null = null;

export const getDays = async (): Promise<DbDay[]> => {
    if (daysCache) return daysCache;

    const data = await fetchAllDays();
    daysCache = data;
    return data;
};

export const getTimeSlots = async (): Promise<DbTimeSlot[]> => {
    if (timeSlotsCache) return timeSlotsCache;

    const data = await fetchAllTimeSlots();
    timeSlotsCache = data;
    return data;
};
