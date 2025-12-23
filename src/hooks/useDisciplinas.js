import { useState, useCallback, useEffect } from 'react';
import { loadDbData, commitChanges, clearCache } from '../services/disciplinaService';
import { horarios, dimencao } from '../model/Filtro';

export const useDisciplinas = (courseCode) => {
    const [disciplinas, setDisciplinas] = useState([]);
    const [referenceDisciplinas, setReferenceDisciplinas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingChanges, setPendingChanges] = useState([]);
    const [syncing, setSyncing] = useState(false);

    // Extra data needed for the view
    const [courseSchedule, setCourseSchedule] = useState([]);
    const [courseDimension, setCourseDimension] = useState([0, 0]);

    const fetchData = useCallback(async () => {
        if (!courseCode) return;

        console.log('useDisciplinas: Carregando dados para o curso:', courseCode);
        setLoading(true);
        try {
            const [db, schedule, dimension] = await Promise.all([
                loadDbData(),
                horarios(courseCode),
                dimencao(courseCode)
            ]);

            const filteredDb = db.filter(d => d._cu === courseCode).map(d => ({ ...d, _da: d._da || [] }));
            setReferenceDisciplinas(filteredDb);
            // Deep copy for editing to avoid mutating reference
            setDisciplinas(JSON.parse(JSON.stringify(filteredDb)));

            setCourseSchedule(schedule);
            setCourseDimension(dimension);
            setError(null);

            console.log('useDisciplinas: Dados carregados -', filteredDb.length, 'disciplinas');
        } catch (err) {
            console.error('useDisciplinas: Erro ao carregar dados:', err);
            setError('Erro ao carregar disciplinas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }, [courseCode]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const queueChange = useCallback((change) => {
        setPendingChanges(prev => [...prev, change]);
    }, []);

    const addDisciplina = useCallback((newDisciplineData) => {
        const newDisciplineWithParsedNumbers = {
            ...newDisciplineData,
            _se: parseInt(newDisciplineData._se),
            _at: parseInt(newDisciplineData._at),
            _ap: parseInt(newDisciplineData._ap),
            _cu: courseCode,
        };

        setDisciplinas(prev => [...prev, newDisciplineWithParsedNumbers]);
        queueChange({
            type: 'addDiscipline',
            payload: { data: newDisciplineWithParsedNumbers }
        });
    }, [courseCode, queueChange]);

    const updateDisciplina = useCallback((originalAcronym, updatedData) => {
        setDisciplinas(prev => prev.map(d => {
            if (updatedData._id && d._id === updatedData._id) return { ...d, ...updatedData };
            if (!updatedData._id && d._re === originalAcronym) return { ...d, ...updatedData };
            return d;
        }));

        queueChange({
            type: 'updateDiscipline',
            payload: {
                reference: originalAcronym,
                id: updatedData._id,
                data: updatedData
            }
        });
    }, [queueChange]);

    const removeDisciplina = useCallback((disciplinaToRemove) => {
        setDisciplinas(prev => prev.filter(d => {
            if (disciplinaToRemove._id) return d._id !== disciplinaToRemove._id;
            return d._re !== disciplinaToRemove._re;
        }));
        queueChange({
            type: 'deleteDiscipline',
            payload: {
                reference: disciplinaToRemove._re,
                id: disciplinaToRemove._id
            }
        });
    }, [queueChange]);

    const toggleStatus = useCallback((disciplinaToToggle) => {
        const newStatus = !disciplinaToToggle._ag;
        setDisciplinas(prev => prev.map(d => {
            if (disciplinaToToggle._id && d._id === disciplinaToToggle._id) return { ...d, _ag: newStatus };
            if (!disciplinaToToggle._id && d._re === disciplinaToToggle._re) return { ...d, _ag: newStatus };
            return d;
        }));
        queueChange({
            type: newStatus ? 'activate' : 'deactivate',
            payload: { reference: disciplinaToToggle._re }
        });
    }, [queueChange]);

    const handleCommit = useCallback(async () => {
        if (pendingChanges.length === 0) {
            return;
        }

        setSyncing(true);
        try {
            await commitChanges(pendingChanges, courseCode);

            setPendingChanges([]);
            // Clear cache and reload to ensure consistency
            clearCache();

            // We could just re-fetch, but let's update reference to match current state optimistically or fetch fresh?
            // Fetching fresh is safer to get DB IDs if items were added.
            await fetchData();

            return { success: true };
        } catch (error) {
            console.error('Erro ao salvar no Supabase:', error);
            return { success: false, error };
        } finally {
            setSyncing(false);
        }
    }, [pendingChanges, courseCode, fetchData]);

    const refresh = useCallback(async () => {
        clearCache();
        await fetchData();
    }, [fetchData]);

    return {
        disciplinas,
        loading,
        error,
        pendingChanges,
        syncing,
        courseSchedule,
        courseDimension,
        addDisciplina,
        updateDisciplina,
        removeDisciplina,
        toggleStatus,
        handleCommit,
        refresh
    };
};
