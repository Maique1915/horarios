'use client';

import React, { Suspense } from 'react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { useClassManagerController } from './useClassManagerController';
import ClassManagerView from './ClassManagerView';

const ClassManagerPageContent = () => {
    const ctrl = useClassManagerController();
    return <ClassManagerView ctrl={ctrl} />;
}

export default function ClassManagerPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <ProtectedRoute>
                <ClassManagerPageContent />
            </ProtectedRoute>
        </Suspense>
    );
}
