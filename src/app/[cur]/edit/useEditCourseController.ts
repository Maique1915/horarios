import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useDisciplinas } from '../../../hooks/useDisciplinas';
import { Subject } from '@/types/Subject';

// --- Types ---
export interface SelectOption {
    value: any;
    label: string;
}

// --- Controller ---
export const useEditCourseController = () => {
    const params = useParams();
    const cur = params?.cur as string | undefined;

    // Use the Controller Hook
    const {
        disciplinas,
        loading,
        error,
        syncing,
        addDisciplina,
        updateDisciplina,
        removeDisciplina,
        toggleStatus,
        refresh
        // @ts-ignore
    } = useDisciplinas(cur);

    // UI state
    const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null);
    const [editingDisciplina, setEditingDisciplina] = useState<Subject | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Filters State
    const [filtroPeriodo, setFiltroPeriodo] = useState<SelectOption | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<SelectOption | null>(null);
    const [filtroEl, setFiltroEl] = useState<SelectOption | null>(null);
    const [filtroTexto, setFiltroTexto] = useState('');

    // Default new discipline state
    const defaultNewDisciplina = useMemo(() => ({
        _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
    }), [cur]);

    const [newDisciplina, setNewDisciplina] = useState(defaultNewDisciplina);

    // Handlers
    const handleEditDisciplinaInteraction = (disciplinaToEdit: Subject) => {
        setEditingDisciplineId(disciplinaToEdit._re);
        setEditingDisciplina({ ...disciplinaToEdit });
        setShowForm(true);
    };

    const handleSaveDisciplinaInteraction = async (updatedDataFromForm: Subject) => {
        const result = await updateDisciplina(editingDisciplina?._re, updatedDataFromForm);
        if (result.success) {
            setEditingDisciplina(null);
            setEditingDisciplineId(null);
            setShowForm(false);
            alert('✅ Disciplina atualizada com sucesso!');
        } else {
            alert('❌ Erro ao atualizar disciplina: ' + ((result.error as Error)?.message || result.error));
        }
    };

    const handleCancelFormInteraction = () => {
        setEditingDisciplina(null);
        setNewDisciplina({ ...defaultNewDisciplina });
        setShowForm(false);
    };

    const handleAddDisciplinaInteraction = async (newDisciplineData: Subject) => {
        const result = await addDisciplina(newDisciplineData);
        if (result.success) {
            handleCancelFormInteraction();
            alert('✅ Disciplina adicionada com sucesso!');
        } else {
            alert('❌ Erro ao adicionar disciplina: ' + ((result.error as Error)?.message || result.error));
        }
    };

    const handleRemoveDisciplinaInteraction = async (disciplinaToCheck: Subject) => {
        if (!window.confirm(`Excluir removerá a matéria do sistema. Tem certeza que deseja remover a disciplina "${disciplinaToCheck._di}" (${disciplinaToCheck._re})?`)) {
            return;
        }
        const result = await removeDisciplina(disciplinaToCheck);
        if (result.success) {
            setEditingDisciplina(null);
            alert('✅ Disciplina removida com sucesso!');
        } else {
            alert('❌ Erro ao remover disciplina: ' + ((result.error as Error)?.message || result.error));
        }
    };

    const onRefreshClick = async () => {
        // @ts-ignore
        await refresh();
        alert('✅ Dados recarregados!');
    };

    // Filter Logic
    const opcoesPeriodo = useMemo(() =>
        [...new Set(disciplinas.map((d: Subject) => d._se))].sort((a: number, b: number) => a - b).map(se => ({ value: se, label: `${se}º Período` })),
        [disciplinas]
    );

    const opcoesStatus = [
        { value: true, label: 'Ativa' },
        { value: false, label: 'Inativa' },
    ];
    const opcoesEl = [
        { value: true, label: 'Eletiva' },
        { value: false, label: 'Optativa' },
    ];

    const disciplinasFiltradas = useMemo(() => disciplinas.filter((d: Subject) => {
        if (filtroPeriodo && d._se !== filtroPeriodo.value) return false;
        if (filtroStatus && d._ag !== filtroStatus.value) return false;
        if (filtroEl && d._el !== filtroEl.value) return false;
        if (filtroTexto && !(d._di?.toLowerCase() || "").includes(filtroTexto.toLowerCase()) && !(d._re?.toLowerCase() || "").includes(filtroTexto.toLowerCase())) return false;
        return true;
    }), [disciplinas, filtroPeriodo, filtroStatus, filtroEl, filtroTexto]);

    return {
        // State
        cur,
        disciplinas,
        loading,
        error,
        syncing,
        // UI State
        editingDisciplineId,
        editingDisciplina,
        newDisciplina,
        // Filter Data
        opcoesPeriodo,
        opcoesStatus,
        opcoesEl,
        disciplinasFiltradas,
        // Filter Setters
        filtroPeriodo, setFiltroPeriodo,
        filtroStatus, setFiltroStatus,
        filtroEl, setFiltroEl,
        filtroTexto, setFiltroTexto,
        // Handlers
        handleEditDisciplinaInteraction,
        handleSaveDisciplinaInteraction,
        handleCancelFormInteraction,
        handleAddDisciplinaInteraction,
        handleRemoveDisciplinaInteraction,
        onRefreshClick,
        toggleStatus
    };
};
