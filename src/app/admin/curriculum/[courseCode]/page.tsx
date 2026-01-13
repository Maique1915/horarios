'use client';

import React, { use } from 'react';
import EditCourseView from '../../../../app/[cur]/edit/EditCourseView';
import { useEditCourseController } from '../../../../app/[cur]/edit/useEditCourseController';

interface PageProps {
    params: Promise<{
        courseCode: string;
    }>
}

export default function AdminCurriculumPage({ params }: PageProps) {
    const { courseCode } = use(params);
    const ctrl = useEditCourseController({ courseCode });

    return (
        <div className="h-full">
            <EditCourseView ctrl={ctrl} />
        </div>
    );
}
