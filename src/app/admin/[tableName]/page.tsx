import { use } from 'react';
import { notFound } from 'next/navigation';
import { tableConfigs } from '../../../components/admin/tableConfig';
import TableManager from '../../../components/admin/TableManager';
import TimeSlotsManager from '../../../components/admin/TimeSlotsManager';
import ComplementaryGroupsManager from '../../../components/admin/ComplementaryGroupsManager';
import ComplementaryActivitiesManager from '../../../components/admin/ComplementaryActivitiesManager';
import UniversitiesManager from '../../../components/admin/UniversitiesManager';
import TablePageClient from './TablePageClient';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
    // Return empty array to skip this dynamic route in static export
    // Admin pages require server-side functionality
    return [];
}

interface PageProps {
    params: Promise<{
        tableName: string;
    }>
}

export default function TablePage({ params }: PageProps) {
    return <TablePageClient params={params} />;
}
