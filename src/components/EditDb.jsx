'use client';

import React, { useState } from 'react';
import Select from 'react-select';
// import makeAnimated from 'react-select/animated'; // Not used in this View directly anymore if only in Form
import '../styles/EditDb.css';
import { useParams } from 'next/navigation';
import DisciplinaForm from './DisciplinaForm';
import DisciplinaTable from './DisciplinaTable';
import LoadingSpinner, { SavingSpinner } from './LoadingSpinner';
import { useDisciplinas } from '../hooks/useDisciplinas';

// const animatedComponents = makeAnimated(); // Not used

const EditDb = () => {
  const params = useParams();
  const cur = params?.cur; // Obter o curso da URL. Pode ser undefined em /edit

  // Use the Controller Hook
  const {
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
  } = useDisciplinas(cur);

  const [activeSemestreIndex, setActiveSemestreIndex] = useState(0); // Para navegação entre semestres (se usada no futuro)

  // UI State
  const [editingDisciplineId, setEditingDisciplineId] = useState(null);
  const [editingDisciplina, setEditingDisciplina] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newDisciplina, setNewDisciplina] = useState(() => ({
    _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
  }));

  // Filters State
  const [filtroPeriodo, setFiltroPeriodo] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [filtroEl, setFiltroEl] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');

  // Handlers for UI interactions
  const handleEditDisciplinaInteraction = (disciplinaToEdit) => {
    setEditingDisciplineId(disciplinaToEdit._re);
    setEditingDisciplina({ ...disciplinaToEdit });
    setShowForm(true);
  };

  const handleSaveDisciplinaInteraction = (updatedDataFromForm) => {
    // If editing, we update
    updateDisciplina(editingDisciplina._re, updatedDataFromForm);

    setEditingDisciplina(null);
    setEditingDisciplineId(null);
    setShowForm(false);
  };

  const handleCancelFormInteraction = () => {
    setEditingDisciplina(null);
    setNewDisciplina({
      _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
    });
    setShowForm(false);
  };

  const handleAddDisciplinaInteraction = (newDisciplineData) => {
    addDisciplina(newDisciplineData);
    handleCancelFormInteraction();
  };

  const handleRemoveDisciplinaInteraction = (disciplinaToCheck) => {
    if (!window.confirm(`Excluir removerá a matéria do sistema. Se a matéria só não vai ser dada no semestre seguinte, basta desativá-la. Tem certeza que deseja remover a disciplina "${disciplinaToCheck._di}" (${disciplinaToCheck._re})?`)) {
      return;
    }
    removeDisciplina(disciplinaToCheck);
    setEditingDisciplina(null);
  };

  const onCommitClick = async () => {
    if (!window.confirm(`Você tem certeza que deseja commitar ${pendingChanges.length} alterações?`)) {
      return;
    }
    const result = await handleCommit();
    if (result.success) {
      alert('✅ Alterações salvas com sucesso no Supabase!');
    } else {
      alert(`❌ Erro ao salvar no Supabase: ${result.error.message}`);
    }
  };

  const onRefreshClick = async () => {
    await refresh();
    alert('✅ Dados recarregados!');
  };

  const handleDisciplineUpdateState = (updatedDisciplina) => {
    // This was used when Form updated the state directly. 
    // Now the form calls onSubmit which we handle.
    // But DisciplinaForm might call onStateChange for class schedule updates that are saved immediately?
    // In the original code, `handleDisciplineUpdate` updated `disciplinas` state locally.
    // If DisciplinaForm saves classes directly to DB (as it seems to do in original code),
    // we might need to refresh or update local state.
    // The original `handleDisciplineUpdate` was:
    // setDisciplinas(prev => prev.map(d => d._id === updatedDisciplina._id ? updatedDisciplina : d));

    // We can replicate this local update if needed, but `updateDisciplina` might be cleaner.
    // However, `updateDisciplina` queues a change. 
    // `DisciplinaForm` has internal saving for classes that goes DIRECTLY to DB (saveClassSchedule).
    // So effectively, class updates are side-effects.
    // Ideally we should move class saving to the service/hook too, but for now let's support the callback.

    // Since `disciplinas` comes from the hook, we can't set it directly here unless exposure.
    // But we can trigger a re-fetch or ignore if it's just visual.
  };


  // Filter Logic
  const opcoesPeriodo = [...new Set(disciplinas.map(d => d._se))].sort((a, b) => a - b).map(se => ({ value: se, label: `${se}º Período` }));
  const opcoesStatus = [
    { value: true, label: 'Ativa' },
    { value: false, label: 'Inativa' },
  ];
  const opcoesEl = [
    { value: true, label: 'Eletiva' },
    { value: false, label: 'Optativa' },
  ];

  const disciplinasFiltradas = disciplinas.filter(d => {
    if (filtroPeriodo && d._se !== filtroPeriodo.value) return false;
    if (filtroStatus && d._ag !== filtroStatus.value) return false;
    if (filtroEl && d._el !== filtroEl.value) return false;
    if (filtroTexto && !d._di.toLowerCase().includes(filtroTexto.toLowerCase()) && !d._re.toLowerCase().includes(filtroTexto.toLowerCase())) return false;
    return true;
  });


  if (loading) {
    return <LoadingSpinner message="Carregando disciplinas..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <p className="text-xl font-bold text-red-500 mb-2">Erro ao carregar dados</p>
          <p className="text-text-light-secondary dark:text-text-dark-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      {/* Overlay de salvamento */}
      {syncing && <SavingSpinner message="Salvando no Supabase..." />}

      <div className="mx-auto max-w-[1920px] p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-bold leading-tight tracking-tight">Gerenciamento de Disciplinas do Curso</p>
            <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
              Adicione, edite ou remova disciplinas diretamente no Supabase.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-green-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onRefreshClick}
              disabled={syncing}
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              <span className="truncate">Recarregar</span>
            </button>
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onCommitClick}
              disabled={pendingChanges.length === 0 || syncing}
            >
              <span className="material-symbols-outlined text-xl">save</span>
              <span className="truncate">Commit ({pendingChanges.length})</span>
            </button>

            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-purple-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => window.location.href = `/${cur}/turmas`}
              disabled={syncing}
            >
              <span className="material-symbols-outlined text-xl">calendar_month</span>
              <span className="truncate">Novas Grades</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Table and Filters */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
              <div className="flex gap-3 p-4 border-b border-border-light dark:border-border-dark">
                <div className="w-1/6">
                  <Select
                    placeholder="Período"
                    options={opcoesPeriodo}
                    onChange={setFiltroPeriodo}
                    isClearable
                    classNamePrefix="select"
                  />
                </div>
                <div className="w-1/6">
                  <Select
                    placeholder="Tipo"
                    options={opcoesEl}
                    onChange={setFiltroEl}
                    isClearable
                    classNamePrefix="select"
                  />
                </div>
                <div className="w-1/6">
                  <Select
                    placeholder="Status"
                    options={opcoesStatus}
                    onChange={setFiltroStatus}
                    isClearable
                    classNamePrefix="select"
                  />
                </div>
                <div className="flex-1">
                  <label className="flex flex-col h-10 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                      <div className="text-text-light-secondary dark:text-text-dark-secondary flex border-r-0 items-center justify-center pl-3 pr-2 bg-background-light dark:bg-background-dark rounded-l-lg border border-border-light dark:border-border-dark border-r-0">
                        <span className="material-symbols-outlined text-xl">search</span>
                      </div>
                      <input
                        className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary h-full placeholder:text-text-light-secondary placeholder:dark:text-text-dark-secondary px-2 border-l-0 text-sm font-normal leading-normal"
                        placeholder="Pesquisar..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                      />
                    </div>
                  </label>
                </div>
              </div>

              <DisciplinaTable
                data={disciplinasFiltradas}
                handleEditDisciplina={handleEditDisciplinaInteraction}
                removeDisciplina={handleRemoveDisciplinaInteraction}
                handleToggleStatus={toggleStatus}
                selectedId={editingDisciplineId}
              />
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <DisciplinaForm
                disciplina={editingDisciplina || newDisciplina}
                onSubmit={editingDisciplina ? handleSaveDisciplinaInteraction : handleAddDisciplinaInteraction}
                onCancel={handleCancelFormInteraction}
                cur={cur}
                disciplinas={disciplinas}
                courseSchedule={courseSchedule}
                courseDimension={courseDimension}
                isReviewing={false}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditDb;