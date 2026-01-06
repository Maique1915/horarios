'use client';

import React from 'react';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { useProfileController } from './useProfileController';
import ProfileView from './ProfileView';

export default function ProfilePage() {
    const ctrl = useProfileController();

    if (ctrl.authLoading || (ctrl.loadingData && ctrl.user)) {
        return <LoadingSpinner message="Carregando perfil..." />;
    }

    if (!ctrl.user) return null;

    return <ProfileView ctrl={ctrl} />;
}
