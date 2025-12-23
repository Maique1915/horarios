import { Suspense } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import EditDb from '../../../components/EditDb';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function AdminCoursePage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <ProtectedRoute>
                <EditDb />
            </ProtectedRoute>
        </Suspense>
    );
}
