import React from 'react';
import CurriculumPageClient from './CurriculumPageClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
    // Return empty array to skip this dynamic route in static export
    // Admin pages require server-side functionality
    return [];
}

interface PageProps {
    params: Promise<{
        courseCode: string;
    }>
}

export default function AdminCurriculumPage({ params }: PageProps) {
    return <CurriculumPageClient params={params} />;
}
