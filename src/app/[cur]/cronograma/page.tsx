import { Suspense } from 'react';
import MapaMental from '../../../components/MapaMental';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function CronogramaPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <MapaMental subjectStatus={undefined} onVoltar={undefined} />
        </Suspense>
    );
}
