import { Suspense } from 'react';
import GeraGrade from '../../components/GeraGrade';
import LoadingSpinner from '../../components/LoadingSpinner';
import { loadCoursesRegistry } from '../../services/disciplinaService';

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

export default function CoursePage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <GeraGrade />
        </Suspense>
    );
}
