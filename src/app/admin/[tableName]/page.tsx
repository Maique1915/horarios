'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { tableConfigs } from '../../../components/admin/tableConfig';
import TableManager from '../../../components/admin/TableManager';
import TimeSlotsManager from '../../../components/admin/TimeSlotsManager';
import ComplementaryGroupsManager from '../../../components/admin/ComplementaryGroupsManager';
import ComplementaryActivitiesManager from '../../../components/admin/ComplementaryActivitiesManager';

interface PageProps {
    params: Promise<{
        tableName: string;
    }>
}

export default function TablePage({ params }: PageProps) {
    const { tableName } = use(params);
    const config = tableConfigs[tableName];

    if (!config) {
        notFound();
    }

    if (tableName === 'time_slots') {
        return <TimeSlotsManager />;
    }

    if (tableName === 'complementary_activity_groups') {
        return <ComplementaryGroupsManager />;
    }

    if (tableName === 'complementary_activities') {
        return <ComplementaryActivitiesManager />;
    }

    return (
        <div className="w-full">
            <div className="mb-4">
                <h1 className="text-xl font-bold">Gerenciar: {config.displayName}</h1>
                <p className="text-xs text-slate-500">Tabela: {config.tableName}</p>
            </div>

            <TableManager config={config} />
        </div>
    );
}
