import { Suspense } from 'react';
import MapaMental from '../../../components/MapaMental';
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

export default function CronogramaPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <MapaMental subjectStatus={undefined} onVoltar={undefined} />
        </Suspense>
    );
}
