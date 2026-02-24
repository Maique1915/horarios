import { Subject } from '@/types/Subject';

export const calculateOptionalSubjects = (
    allSubjects: Subject[],
    effectiveCompletedIds: Set<number>
) => {
    return allSubjects.filter(s => s._el && effectiveCompletedIds.has(s._id as number));
};
