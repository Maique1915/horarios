import { supabase } from './src/lib/supabaseClient';

async function checkTimeSlots() {
    const { data: courses, error: errC } = await supabase.from('courses').select('id, code, name');
    if (errC) console.error(errC);
    console.log('Courses:', courses);

    const { data: slots, error: errS } = await supabase.from('time_slots').select('*');
    if (errS) console.error(errS);
    console.log('Total Time Slots:', slots?.length);

    const mathCourse = courses?.find(c => c.code.toLowerCase().includes('mat') || c.name.toLowerCase().includes('mat'));
    if (mathCourse) {
        console.log('Mathematics Course found:', mathCourse);
        const mathSlots = slots?.filter(s => s.course_id === mathCourse.id);
        console.log('Math Specific Slots:', mathSlots);
    } else {
        console.log('Math Course not found by search');
    }

    const slotsByCourse: Record<string, number> = {};
    slots?.forEach(s => {
        const key = s.course_id || 'NULL';
        slotsByCourse[key] = (slotsByCourse[key] || 0) + 1;
    });
    console.log('Slots grouped by course_id:', slotsByCourse);
}

checkTimeSlots();
