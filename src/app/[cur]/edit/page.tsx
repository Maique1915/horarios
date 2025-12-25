import { Suspense } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import EditDb from '../../../components/EditDb';
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

export default function AdminCoursePage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <ProtectedRoute requiredRole="admin">
                <EditDb />
            </ProtectedRoute>
        </Suspense>
    );
}
