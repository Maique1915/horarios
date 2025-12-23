import { Suspense } from 'react';
import Login from '../../components/Login';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <Login />
        </Suspense>
    );
}
