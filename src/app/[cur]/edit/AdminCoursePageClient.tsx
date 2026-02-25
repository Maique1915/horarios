'use client';

import React, { Suspense } from 'react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { useEditCourseController } from './useEditCourseController';
import EditCourseView from './EditCourseView';

const AdminCoursePageContent = () => {
    const ctrl = useEditCourseController();
    return <EditCourseView ctrl={ctrl} />;
}

export default function AdminCoursePageClient() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <ProtectedRoute>
                <AdminCoursePageContent />
            </ProtectedRoute>
        </Suspense>
    );
}
