'use client';

import React, { use } from 'react';
import EditCourseView from '../../../../app/[cur]/edit/EditCourseView';
import { useEditCourseController } from '../../../../app/[cur]/edit/useEditCourseController';

interface CurriculumPageClientProps {
    params: Promise<{
        courseCode: string;
    }>
}

export default function CurriculumPageClient({ params }: CurriculumPageClientProps) {
    const { courseCode } = use(params);
    const ctrl = useEditCourseController({ courseCode });

    return (
        <div className="h-full">
            <EditCourseView ctrl={ctrl} />
        </div>
    );
}
