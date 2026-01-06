'use client';

import React, { Suspense } from 'react';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { useEditDbController } from './useEditDbController';
import EditDbView from './EditDbView';

// Main Component
const AdminPageContent = () => {
    const ctrl = useEditDbController();
    return <EditDbView ctrl={ctrl} />;
}

export default function AdminPage() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <ProtectedRoute>
                <AdminPageContent />
            </ProtectedRoute>
        </Suspense>
    );
}
