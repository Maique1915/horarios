import { Subject } from '@/types/Subject';

export const calculateMandatorySubjects = (
    allSubjects: Subject[],
    effectiveCompletedIds: Set<number>
) => {
    return allSubjects
        .filter(s => !s._el && effectiveCompletedIds.has(s._id as number))
        .sort((a, b) => {
            const periodA = a._se ?? 0;
            const periodB = b._se ?? 0;
            if (periodA !== periodB) {
                return periodA - periodB;
            }
            const codeA = a._re ?? '';
            const codeB = b._re ?? '';
            return codeA.localeCompare(codeB);
        });
};
