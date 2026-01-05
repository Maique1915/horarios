import { useState, useCallback, useEffect } from 'react';
// ... imports
import {
    loadDbData,
    clearCache,
    addSubject,
    updateSubject,
    deleteSubject,
    deleteSubjectByAcronym,
    toggleSubjectStatus,
    getCourseSchedule,
    getCourseDimension
} from '../services/disciplinaService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useDisciplinas = (courseCode) => {
    const queryClient = useQueryClient();
    const [disciplinas, setDisciplinas] = useState([]);
    // Removed pendingChanges
    const [syncing, setSyncing] = useState(false);

    // 1. React Query for Course Data
    const {
        data: dbData,
        isLoading: loadingDb,
        error: errorDb
    } = useQuery({
        queryKey: ['disciplinas', courseCode],
        queryFn: () => loadDbData(courseCode),
        staleTime: Infinity,
        enabled: !!courseCode,
    });

    const {
        data: schedule,
        isLoading: loadingSch
    } = useQuery({
        queryKey: ['horarios', courseCode],
        queryFn: () => getCourseSchedule(courseCode),
        staleTime: Infinity,
        enabled: !!courseCode,
    });

    const {
        data: dimension,
        isLoading: loadingDim
    } = useQuery({
        queryKey: ['dimensao', courseCode],
        queryFn: () => getCourseDimension(courseCode),
        staleTime: Infinity,
        enabled: !!courseCode,
    });

    // 2. Initialize Local State from Query Data
    useEffect(() => {
        if (dbData) {
            const processed = dbData.map(d => ({ ...d, _da: d._da || [] }));
            setDisciplinas(JSON.parse(JSON.stringify(processed)));
        }
    }, [dbData]);

    const loading = loadingDb || loadingSch || loadingDim;
    const error = errorDb ? (errorDb.message || "Erro ao carregar dados") : null;

    // Helper to invalidate
    const invalidate = useCallback(() => {
        return queryClient.invalidateQueries({ queryKey: ['disciplinas', courseCode] });
    }, [queryClient, courseCode]);

    const addDisciplina = useCallback(async (newDisciplineData) => {
        setSyncing(true);
        try {
            const newDisciplineWithParsedNumbers = {
                ...newDisciplineData,
                _se: parseInt(newDisciplineData._se),
                _at: parseInt(newDisciplineData._at),
                _ap: parseInt(newDisciplineData._ap),
                _cu: courseCode,
            };

            await addSubject(courseCode, newDisciplineWithParsedNumbers);
            // Invalidate to fetch fresh data with ID
            clearCache();
            await invalidate();
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: err };
        } finally {
            setSyncing(false);
        }
    }, [courseCode, invalidate]);

    const updateSubjectCallback = useCallback(async (originalAcronym, updatedData) => {
        setSyncing(true);
        console.log('Hook: updateDisciplina triggered for original acronym:', originalAcronym);
        try {
            let sId = updatedData._id;

            if (!sId) {
                console.log('Hook: _id not in updatedData, searching in local state by acronym:', originalAcronym);
                const existing = disciplinas.find(d => d._re === originalAcronym);
                if (existing) {
                    sId = existing._id;
                    console.log('Hook: Found existing subject ID:', sId);
                }
            }

            if (!sId) {
                console.error('Hook: FATAL - No subjectId found for update!');
                throw new Error("ID da disciplina não encontrado para atualização.");
            }

            const sanitizedData = {
                ...updatedData,
                _se: Number(updatedData._se),
                _at: Number(updatedData._at),
                _ap: Number(updatedData._ap),
            };

            console.log('Hook: Sanitized data for service:', sanitizedData);

            await updateSubject(courseCode, Number(sId), sanitizedData);
            console.log('Hook: Update successful');

            clearCache();
            await invalidate();
            return { success: true };
        } catch (err) {
            console.error('Hook: Update failed:', err);
            return { success: false, error: err };
        } finally {
            setSyncing(false);
        }
    }, [courseCode, disciplinas, invalidate]);

    const updateDisciplina = updateSubjectCallback;

    const removeDisciplina = useCallback(async (disciplinaToRemove) => {
        setSyncing(true);
        try {
            if (disciplinaToRemove._id) {
                await deleteSubject(disciplinaToRemove._id);
            } else {
                await deleteSubjectByAcronym(courseCode, disciplinaToRemove._re);
            }
            clearCache();
            await invalidate();
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: err };
        } finally {
            setSyncing(false);
        }
    }, [courseCode, invalidate]);

    const toggleStatus = useCallback(async (disciplinaToToggle) => {
        setSyncing(true);
        try {
            const newStatus = !disciplinaToToggle._ag;
            if (disciplinaToToggle._id) {
                await toggleSubjectStatus(disciplinaToToggle._id, newStatus);
            } else {
                // Fallback if no ID available (should assume ID is present from DB load)
                // Or we need a toggleByAcronym
                // Assuming ID is present for loaded data.
                console.warn("Toggle attempted without ID");
            }
            clearCache();
            await invalidate(); // Optimistic update possible but let's just refetch
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: err };
        } finally {
            setSyncing(false);
        }
    }, [invalidate]);

    const refresh = useCallback(async () => {
        clearCache();
        await queryClient.invalidateQueries({ queryKey: ['disciplinas', courseCode] });
        await queryClient.invalidateQueries({ queryKey: ['horarios', courseCode] });
        await queryClient.invalidateQueries({ queryKey: ['dimensao', courseCode] });
    }, [courseCode, queryClient]);

    return {
        disciplinas,
        loading,
        error,
        // pendingChanges: [], // Removed
        syncing,
        courseSchedule: schedule || [],
        courseDimension: dimension || [0, 0],
        addDisciplina,
        updateDisciplina,
        removeDisciplina,
        toggleStatus,
        // handleCommit: async () => {}, // Removed or dummy
        refresh
    };
};
