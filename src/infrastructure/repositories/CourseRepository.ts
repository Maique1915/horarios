import { supabase } from '../../lib/supabaseClient';
import { Course } from '../../domain/entities/Course';

export class CourseRepository {
    public static async findAll(): Promise<Course[]> {
        const { data, error } = await supabase.from('courses').select('*, workloads:course_workloads(*)');
        if (error) throw error;
        
        return data.map((item: any) => new Course({
            id: item.id,
            code: item.code,
            name: item.name,
            shift: item.shift,
            modalities: item.modalities,
            periods: item.periods,
            campus: item.campus,
            activies: item.activies,
            universityId: item.university_id,
            needsComplementaryActivities: item.needs_complementary_activities,
            periodStart: item.period_start,
            periodEnd: item.period_end
        }));
    }

    public static async findByCode(code: string): Promise<Course | null> {
        const { data, error } = await supabase
            .from('courses')
            .select('*, workloads:course_workloads(*)')
            .eq('code', code)
            .limit(1);

        if (error) throw error;
        if (!data || data.length === 0) return null;
        
        const item = data[0];

        return new Course({
            id: item.id,
            code: item.code,
            name: item.name,
            shift: item.shift,
            modalities: item.modalities,
            periods: item.periods,
            campus: item.campus,
            activies: item.activies,
            universityId: item.university_id,
            needsComplementaryActivities: item.needs_complementary_activities,
            periodStart: item.period_start,
            periodEnd: item.period_end
        });
    }

    public static async insert(course: Course): Promise<Course> {
        const { data, error } = await supabase.from('courses').insert({
            code: course.code,
            name: course.name,
            shift: course.shift,
            modalities: course.modalities,
            periods: course.periods,
            campus: course.campus,
            activies: course.activies,
            university_id: course.universityId,
            needs_complementary_activities: course.needsComplementaryActivities
        }).select().single();

        if (error) throw error;

        return new Course({
            id: data.id,
            code: data.code,
            name: data.name,
            shift: data.shift,
            modalities: data.modalities,
            periods: data.periods,
            campus: data.campus,
            activies: data.activies,
            universityId: data.university_id,
            needsComplementaryActivities: data.needs_complementary_activities,
            periodStart: data.period_start,
            periodEnd: data.period_end
        });
    }

    public static async update(id: number, updates: Partial<Course>): Promise<Course> {
        // Remap to DB snake_case
        const dbPayload: any = {};
        if (updates.name !== undefined) dbPayload.name = updates.name;
        if (updates.code !== undefined) dbPayload.code = updates.code;
        if (updates.shift !== undefined) dbPayload.shift = updates.shift;
        if (updates.modalities !== undefined) dbPayload.modalities = updates.modalities;
        if (updates.periods !== undefined) dbPayload.periods = updates.periods;
        if (updates.campus !== undefined) dbPayload.campus = updates.campus;
        if (updates.activies !== undefined) dbPayload.activies = updates.activies;
        if (updates.universityId !== undefined) dbPayload.university_id = updates.universityId;
        if (updates.needsComplementaryActivities !== undefined) dbPayload.needs_complementary_activities = updates.needsComplementaryActivities;

        const { data, error } = await supabase.from('courses').update(dbPayload).eq('id', id).select().single();
        if (error) throw error;

        return new Course({
            id: data.id,
            code: data.code,
            name: data.name,
            shift: data.shift,
            modalities: data.modalities,
            periods: data.periods,
            campus: data.campus,
            activies: data.activies,
            universityId: data.university_id,
            needsComplementaryActivities: data.needs_complementary_activities,
            periodStart: data.period_start,
            periodEnd: data.period_end
        });
    }

    public static async delete(id: number): Promise<void> {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
    }
}
