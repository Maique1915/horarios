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
export const useEditDbController = () => {
    const params = useParams();
    const cur = params?.cur as string | undefined;

    // Use the Controller Hook
    const {
        disciplinas,
        loading,
        error,
        syncing,
        courseSchedule,
        courseDimension,
        addDisciplina,
        updateDisciplina,
        removeDisciplina,
        toggleStatus,
        refresh
        // @ts-ignore
    } = useDisciplinas(cur);

    // User Management Modal State
    const [showUserModal, setShowUserModal] = useState(false);

    // UI State
    const [editingDisciplineId, setEditingDisciplineId] = useState<string | null>(null);
    const [editingDisciplina, setEditingDisciplina] = useState<Subject | null>(null);
    const [showForm, setShowForm] = useState(false);

    // Default new discipline state
    const defaultNewDisciplina = useMemo(() => ({
        _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
    }), [cur]);

    const [newDisciplina, setNewDisciplina] = useState(defaultNewDisciplina);

    // Filters State
    const [filtroPeriodo, setFiltroPeriodo] = useState<SelectOption | null>(null);
    const [filtroStatus, setFiltroStatus] = useState<SelectOption | null>(null);
    const [filtroEl, setFiltroEl] = useState<SelectOption | null>(null);
    const [filtroTexto, setFiltroTexto] = useState('');

    // Handlers
    const handleEditDisciplinaInteraction = (disciplinaToEdit: Subject) => {
        setEditingDisciplineId(disciplinaToEdit._re ?? null);
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
            const errorMsg = result.error && typeof result.error === 'object' && 'message' in result.error
                ? (result.error as any).message
                : String(result.error || 'Erro desconhecido');
            alert(`❌ Erro ao atualizar disciplina: ${errorMsg}`);
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
            const errorMsg = result.error && typeof result.error === 'object' && 'message' in result.error
                ? (result.error as any).message
                : String(result.error || 'Erro desconhecido');
            alert(`❌ Erro ao adicionar disciplina: ${errorMsg}`);
        }
    };

    const handleRemoveDisciplinaInteraction = async (disciplinaToCheck: Subject) => {
        if (!window.confirm(`Excluir removerá a matéria do sistema. Se a matéria só não vai ser dada no semestre seguinte, basta desativá-la. Tem certeza que deseja remover a disciplina "${disciplinaToCheck._di}" (${disciplinaToCheck._re})?`)) {
            return;
        }
        const result = await removeDisciplina(disciplinaToCheck);
        if (result.success) {
            setEditingDisciplina(null);
            alert('✅ Disciplina removida com sucesso!');
        } else {
            const errorMsg = result.error && typeof result.error === 'object' && 'message' in result.error
                ? (result.error as any).message
                : String(result.error || 'Erro desconhecido');
            alert(`❌ Erro ao remover disciplina: ${errorMsg}`);
        }
    };

    const onRefreshClick = async () => {
        // @ts-ignore
        await refresh();
        alert('✅ Dados recarregados!');
    };

    const handleUserManagementOpen = () => setShowUserModal(true);
    const handleUserManagementClose = () => setShowUserModal(false);

    // Filter Logic
    const opcoesPeriodo = useMemo(() =>
        [...new Set(disciplinas.map((d: Subject) => d._se))]
            .filter((se): se is string | number => se !== undefined && se !== null)
            .sort((a, b) => Number(a) - Number(b))
            .map(se => ({ value: se, label: `${se}º Período` })),
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
        courseSchedule,
        courseDimension,
        showUserModal,
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
        handleUserManagementOpen,
        handleUserManagementClose,
        toggleStatus,
    };
};
