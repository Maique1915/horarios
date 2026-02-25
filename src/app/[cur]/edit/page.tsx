import React from 'react';
import { loadCoursesRegistry } from '../../../services/disciplinaService';
import AdminCoursePageClient from './AdminCoursePageClient';

export async function generateStaticParams() {
    try {
        const courses = await loadCoursesRegistry();
        return courses.map((course: any) => ({
            cur: course._cu,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

export default function AdminCoursePage() {
    return <AdminCoursePageClient />;
}
