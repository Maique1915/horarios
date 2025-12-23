'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ativas, horarios, dimencao } from '../model/Filtro.jsx';

import Comum from './Comum.jsx';
import LoadingSpinner from './LoadingSpinner';

const Quadro = () => {
    const params = useParams();
    const cur = params?.cur || 'engcomp';
    const [a, setA] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [courseSchedule, setCourseSchedule] = useState([]);
    const [courseDimension, setCourseDimension] = useState([0, 0]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                console.log('Quadro: Carregando dados para curso:', cur);

                const startTime = performance.now();

                // Carrega todos os dados em paralelo
                const [data, schedule, dimension] = await Promise.all([
                    ativas(cur),
                    horarios(cur),
                    dimencao(cur)
                ]);

                const endTime = performance.now();

                console.log('Quadro: Dados recebidos em', (endTime - startTime).toFixed(2), 'ms');
                console.log('Quadro:', data?.length, 'disciplinas');


                setA(data);
                setCourseSchedule(schedule);
                setCourseDimension(dimension);
                setError(null);
            } catch (err) {
                console.error('Quadro: Erro ao carregar dados:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [cur]);

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
                    <p>{error}</p>
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
