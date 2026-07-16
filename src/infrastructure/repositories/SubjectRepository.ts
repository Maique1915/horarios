import { supabase } from '../../lib/supabaseClient';
import { Subject } from '../../domain/entities/Subject';

export class SubjectRepository {
    private static mapToEntity(item: any): Subject {
        return new Subject({
            id: item.id,
            courseId: item.course_id,
            semester: item.semester,
            name: item.name,
            acronym: item.acronym,
            categoryId: item.category_id,
            category: item.subject_categories ? item.subject_categories.name : null,
            optional: item.optional,
            active: item.active,
            hasPractical: item.has_practical,
            hasTheory: item.has_theory,
            elective: item.elective,
            workload: item.workload
        });
    }

    public static async findAll(courseId?: number): Promise<Subject[]> {
        let q = supabase.from('subjects').select('*, subject_categories(name)');
        if (courseId) q = q.eq('course_id', courseId);

        const { data, error } = await q;
        if (error) throw error;
        
        return data.map(this.mapToEntity);
    }

    public static async findByIds(ids: number[]): Promise<Subject[]> {
        const { data, error } = await supabase.from('subjects').select('*, subject_categories(name)').in('id', ids);
        if (error) throw error;
        return data.map(this.mapToEntity);
    }

    public static async insert(subject: Subject): Promise<Subject> {
        const { data, error } = await supabase.from('subjects').insert({
            course_id: subject.courseId,
            semester: subject.semester,
            name: subject.name,
            acronym: subject.acronym,
            category_id: subject.categoryId,
            optional: subject.optional,
            active: subject.active,
            has_practical: subject.hasPractical,
            has_theory: subject.hasTheory,
            elective: subject.elective,
            workload: subject.workload
        }).select('*, subject_categories(name)').single();

        if (error) throw error;
        return this.mapToEntity(data);
    }

    public static async update(id: number, updates: Partial<Subject>): Promise<Subject> {
        const dbPayload: any = {};
        if (updates.name !== undefined) dbPayload.name = updates.name;
        if (updates.semester !== undefined) dbPayload.semester = updates.semester;
        if (updates.acronym !== undefined) dbPayload.acronym = updates.acronym;
        if (updates.categoryId !== undefined) dbPayload.category_id = updates.categoryId;
        if (updates.optional !== undefined) dbPayload.optional = updates.optional;
        if (updates.active !== undefined) dbPayload.active = updates.active;
        if (updates.hasPractical !== undefined) dbPayload.has_practical = updates.hasPractical;
        if (updates.hasTheory !== undefined) dbPayload.has_theory = updates.hasTheory;
        if (updates.elective !== undefined) dbPayload.elective = updates.elective;
        if (updates.workload !== undefined) dbPayload.workload = updates.workload;

        const { data, error } = await supabase.from('subjects').update(dbPayload).eq('id', id).select('*, subject_categories(name)').single();
        if (error) throw error;

        return this.mapToEntity(data);
    }

    public static async delete(id: number): Promise<void> {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (error) throw error;
    }
}
