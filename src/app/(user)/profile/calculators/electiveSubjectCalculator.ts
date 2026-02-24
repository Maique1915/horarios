import { Subject } from '@/types/Subject';

interface Equivalency {
    source_subject_id: number;
    target_subject_id: number;
    course_id: number | null;
}

export const calculateElectiveSubjects = (
    takenSubjects: Subject[],
    userCourseId: number,
    gridSubjectIds: Set<number>,
    allEquivalencies: Equivalency[]
) => {
    return takenSubjects.filter(s => {
        // A subject is an elective ONLY if its course_id is different from the grid course ID
        // AND it doesn't exist in the current grid directly
        const subjectCourseId = Number(s.course_id);
        const isFromDifferentCourse = subjectCourseId !== userCourseId;
        const existsInGrid = gridSubjectIds.has(s._id as number);

        // If it's from the same course or already in the grid, it's NOT an elective
        if (!isFromDifferentCourse || existsInGrid) return false;

        // Check if this subject has any equivalency that maps into our grid
        const hasGridEquivalency = allEquivalencies.some(eq => {
            const isSource = eq.source_subject_id === s._id;
            const isTarget = eq.target_subject_id === s._id;
            const isBidirectional = eq.course_id === null;

            // Case 1: The subject taken IS the source of an equivalency pointing to a grid subject
            if (isSource && gridSubjectIds.has(eq.target_subject_id)) return true;

            // Case 2: Bidirectional - the subject taken is the target of an eq pointing to a grid subject (which is the source)
            if (isBidirectional && isTarget && gridSubjectIds.has(eq.source_subject_id)) return true;

            return false;
        });

        return !hasGridEquivalency;
    });
};
