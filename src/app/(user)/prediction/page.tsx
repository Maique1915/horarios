'use client';

import React from 'react';
import { usePredictionController } from './usePredictionController';
import PredictionView from './PredictionView';

export default function PredictionPage() {
    const ctrl = usePredictionController();
    return <PredictionView ctrl={ctrl} />;
}
