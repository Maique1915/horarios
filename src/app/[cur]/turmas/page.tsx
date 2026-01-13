'use client';

import React, { Suspense } from 'react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import ClassesManager from '../../../components/admin/ClassesManager';

export default function ClassManagerPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <ProtectedRoute>
                <ClassesManager />
            </ProtectedRoute>
        </Suspense>
    );
}
