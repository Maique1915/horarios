import { Suspense } from 'react';
import GeraGrade from '../../components/GeraGrade';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CoursePage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <GeraGrade />
        </Suspense>
    );
}
