import { Suspense } from 'react';
import Register from '../../components/Register';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RegisterPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <Register />
        </Suspense>
    );
}
