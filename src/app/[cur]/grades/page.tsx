import { Suspense } from 'react';
import Quadro from '../../../components/Quadro';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function GradesPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <Quadro />
        </Suspense>
    );
}
