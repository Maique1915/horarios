'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ativas, horarios, dimencao } from '../model/Filtro.jsx';

import Comum from './Comum.jsx';
import LoadingSpinner from './LoadingSpinner';
import { useQuery } from '@tanstack/react-query';

const Quadro = () => {
    const params = useParams();
    const cur = params?.cur || 'engcomp';

    // 1. Fetch Subjects (Ativas)
    const {
        data: a = [],
        isLoading: loadingA,
        error: errorA
    } = useQuery({
        queryKey: ['ativas', cur],
        queryFn: () => ativas(cur),
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
        enabled: !!cur,
    });

    // 2. Fetch Schedule (Horarios)
    const {
        data: courseSchedule = [],
        isLoading: loadingSchedule,
        error: errorSchedule
    } = useQuery({
        queryKey: ['horarios', cur],
        queryFn: () => horarios(cur),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!cur,
    });

    // 3. Fetch Dimension (Dimensao)
    const {
        data: courseDimension = [0, 0],
        isLoading: loadingDimension,
        error: errorDimension
    } = useQuery({
        queryKey: ['dimencao', cur],
        queryFn: () => dimencao(cur),
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !!cur,
    });

    const loading = loadingA || (loadingSchedule && !courseSchedule.length) || (loadingDimension && !courseDimension[0]);
    const error = errorA || errorSchedule || errorDimension;

    if (loading) {
        return (
            <LoadingSpinner
                message="Carregando disciplinas..."
            />
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-500">
                    <p className="text-xl font-bold mb-2">Erro ao carregar dados</p>
                    <p>{error?.message || "Erro desconhecido"}</p>
                </div>
            </div>
        );
    }

    if (!a || a.length === 0) {
        return (
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
    }

    return (
        <Comum
            materias={a}
            tela={1}
            cur={cur}
            separa={true}
            g={"º"}
            f={' Período'}
            courseSchedule={courseSchedule}
            courseDimension={courseDimension}
        />
    );
}

export default Quadro
