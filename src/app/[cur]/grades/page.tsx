import { Suspense } from 'react';
import Quadro from '../../../components/Quadro';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { loadCoursesRegistry } from '../../../services/disciplinaService';

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

export default function GradesPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <Quadro />
        </Suspense>
    );
}
