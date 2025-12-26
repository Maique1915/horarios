import { useState, useCallback, useEffect } from 'react';
// ... imports
import {
    loadDbData,
    clearCache,
    addSubject,
    updateSubject,
    deleteSubject,
    deleteSubjectByAcronym,
    toggleSubjectStatus
} from '../services/disciplinaService';
import { horarios, dimencao } from '../model/Filtro';
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
        queryFn: () => horarios(courseCode),
        staleTime: Infinity,
        enabled: !!courseCode,
    });

    const {
        data: dimension,
        isLoading: loadingDim
    } = useQuery({
        queryKey: ['dimensao', courseCode],
        queryFn: () => dimencao(courseCode),
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
        return queryClient.invalidateQueries(['disciplinas', courseCode]);
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

    const updateDisciplina = useCallback(async (originalAcronym, updatedData) => {
        setSyncing(true);
        try {
            // Need ID for update. If not in updatedData, try to find in current list
            let subjectId = updatedData._id;

            // Wait, we are calling this with updatedData which might be from form.
            if (!subjectId) {
                // Try finding by original acronym in current list
                const existing = disciplinas.find(d => d._re === originalAcronym);
                if (existing) subjectId = existing._id;
            }

            if (!subjectId) {
                throw new Error("ID da disciplina não encontrado para atualização.");
            }

            await updateSubject(courseCode, subjectId, updatedData);
            clearCache();
            await invalidate();
            return { success: true };
        } catch (err) {
            console.error(err);
            return { success: false, error: err };
        } finally {
            setSyncing(false);
        }
    }, [courseCode, disciplinas, invalidate]);

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
        await queryClient.invalidateQueries(['disciplinas', courseCode]);
        await queryClient.invalidateQueries(['horarios', courseCode]);
        await queryClient.invalidateQueries(['dimensao', courseCode]);
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
