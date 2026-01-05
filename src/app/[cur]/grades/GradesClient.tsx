'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import Comum from '../../../components/Comum';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { loadClassesForGrid, getCourseSchedule, getCourseDimension } from '../../../services/disciplinaService';
import { Subject } from '../../../types/Subject';

// --- Controller ---
const useGradesController = () => {
    const params = useParams();
    const rawCur = params?.cur;
    const cur = (Array.isArray(rawCur) ? rawCur[0] : rawCur) || 'engcomp';

    // 1. Fetch Subjects (Ativas)
    const {
        data: a = [],
        isLoading: loadingA,
        error: errorA
    } = useQuery<Subject[]>({
        queryKey: ['ativas', cur],
        queryFn: () => loadClassesForGrid(cur),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        enabled: !!cur,
    });

    // 2. Fetch Schedule (Horarios)
    const {
        data: courseSchedule = [],
        isLoading: loadingSchedule,
        error: errorSchedule
    } = useQuery<any[]>({
        queryKey: ['horarios', cur],
        queryFn: () => getCourseSchedule(cur),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!cur,
    });

    // 3. Fetch Dimension (Dimensao)
    const {
        data: courseDimension = [0, 0],
        isLoading: loadingDimension,
        error: errorDimension
    } = useQuery<number[]>({
        queryKey: ['dimencao', cur],
        queryFn: () => getCourseDimension(cur),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!cur,
    });

    const loading = loadingA || (loadingSchedule && !courseSchedule.length) || (loadingDimension && !courseDimension[0]);
    const error = errorA || errorSchedule || errorDimension;

    return {
        cur,
        subjects: a,
        courseSchedule,
        courseDimension,
        loading,
        error
    };
};

// --- Views ---

const LoadingView = () => (
    <LoadingSpinner message="Carregando disciplinas..." />
);

const ErrorView = ({ error }: { error: unknown }) => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-500">
            <p className="text-xl font-bold mb-2">Erro ao carregar dados</p>
            <p>{(error as Error)?.message || "Erro desconhecido"}</p>
        </div>
    </div>
);

const EmptyView = ({ cur }: { cur: string }) => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <p className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                Nenhuma disciplina encontrada
            </p>
            <p className="text-text-light-secondary dark:text-text-dark-secondary">
                Curso: {cur}
            </p>
        </div>
    </div>
);

const GradesView = ({ ctrl }: { ctrl: ReturnType<typeof useGradesController> }) => {
    if (ctrl.loading) return <LoadingView />;
    if (ctrl.error) return <ErrorView error={ctrl.error} />;

    if (!ctrl.subjects || ctrl.subjects.length === 0) {
        return <EmptyView cur={ctrl.cur} />;
    }

    return (
        <Comum
            materias={ctrl.subjects}
            tela={1}
            cur={ctrl.cur}
            separa={true}
            g={"º"}
            f={' Período'}
            courseSchedule={ctrl.courseSchedule}
            courseDimension={ctrl.courseDimension}
        />
    );
};

const GradesPageWithController = () => {
    const ctrl = useGradesController();
    return <GradesView ctrl={ctrl} />;
};

export default function GradesClient() {
    return (
        <Suspense fallback={<LoadingSpinner message="Carregando..." />}>
            <GradesPageWithController />
        </Suspense>
    );
}
