'use client';

import React, { useState } from 'react';
import Select from 'react-select';
import { useParams } from 'next/navigation';
import DisciplinaForm from './DisciplinaForm';
import DisciplinaTable from './DisciplinaTable';
import LoadingSpinner, { SavingSpinner } from './LoadingSpinner';
import { useDisciplinas } from '../hooks/useDisciplinas';
import UserManagementModal from './UserManagementModal';

const EditDb = () => {
  const params = useParams();
  const cur = params?.cur; // Obter o curso da URL. Pode ser undefined em /edit

  // Use the Controller Hook
  const {
    disciplinas,
    loading,
    error,
    // pendingChanges,
    syncing,
    courseSchedule,
    courseDimension,
    addDisciplina,
    updateDisciplina,
    removeDisciplina,
    toggleStatus,
    // handleCommit,
    refresh
  } = useDisciplinas(cur);

  const [activeSemestreIndex, setActiveSemestreIndex] = useState(0); // Para navegação entre semestres (se usada no futuro)

  // User Management Modal State
  const [showUserModal, setShowUserModal] = useState(false);

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
  // Handlers for UI interactions
  const handleEditDisciplinaInteraction = (disciplinaToEdit) => {
    setEditingDisciplineId(disciplinaToEdit._re);
    setEditingDisciplina({ ...disciplinaToEdit });
    setShowForm(true);
  };

  const handleSaveDisciplinaInteraction = async (updatedDataFromForm) => {
    // If editing, we update
    const result = await updateDisciplina(editingDisciplina._re, updatedDataFromForm);
    if (result.success) {
      setEditingDisciplina(null);
      setEditingDisciplineId(null);
      setShowForm(false);
      alert('✅ Disciplina atualizada com sucesso!');
    } else {
      alert('❌ Erro ao atualizar disciplina: ' + (result.error?.message || result.error));
    }
  };

  const handleCancelFormInteraction = () => {
    setEditingDisciplina(null);
    setNewDisciplina({
      _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
    });
    setShowForm(false);
  };

  const handleAddDisciplinaInteraction = async (newDisciplineData) => {
    const result = await addDisciplina(newDisciplineData);
    if (result.success) {
      handleCancelFormInteraction();
      alert('✅ Disciplina adicionada com sucesso!');
    } else {
      alert('❌ Erro ao adicionar disciplina: ' + (result.error?.message || result.error));
    }
  };

  const handleRemoveDisciplinaInteraction = async (disciplinaToCheck) => {
    if (!window.confirm(`Excluir removerá a matéria do sistema. Se a matéria só não vai ser dada no semestre seguinte, basta desativá-la. Tem certeza que deseja remover a disciplina "${disciplinaToCheck._di}" (${disciplinaToCheck._re})?`)) {
      return;
    }
    const result = await removeDisciplina(disciplinaToCheck);
    if (result.success) {
      setEditingDisciplina(null);
      alert('✅ Disciplina removida com sucesso!');
    } else {
      alert('❌ Erro ao remover disciplina: ' + (result.error?.message || result.error));
    }

  };
  /*
    const onCommitClick = async () => {
       // Commit logic removed
    };
  */
  const onRefreshClick = async () => {
    await refresh();
    alert('✅ Dados recarregados!');
  };

  const handleDisciplineUpdateState = (updatedDisciplina) => {
    // This was used when Form updated the state directly. 
    // Now the form calls onSubmit which we handle.
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
    if (filtroTexto && !(d._di?.toLowerCase() || "").includes(filtroTexto.toLowerCase()) && !(d._re?.toLowerCase() || "").includes(filtroTexto.toLowerCase())) return false;
    return true;
  });

  // Custom styles for react-select to match the design system
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      boxShadow: 'none',
    })
  };

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
    <>
      <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark min-h-screen">
        {/* Overlay de salvamento */}
        {syncing && <SavingSpinner message="Salvando no Supabase..." />}

        <div className="mx-auto max-w-[1920px] p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-display font-bold leading-tight tracking-tight text-text-light-primary dark:text-text-dark-primary">
                Gerenciar Oferta
              </h1>
              <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                Adicione, edite ou remova disciplinas da oferta acadêmica.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className={`flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group`}
                onClick={onRefreshClick}
                disabled={syncing}
              >
                <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
                <span className="truncate">Recarregar</span>
              </button>

              <button
                className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary text-sm font-bold shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => window.location.href = `/${cur}/turmas`}
                disabled={syncing}
              >
                <span className="material-symbols-outlined text-xl text-primary">calendar_month</span>
                <span className="truncate">Ver Grades</span>
              </button>

              <button
                className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary text-sm font-bold shadow-sm hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowUserModal(true)}
                disabled={syncing}
              >
                <span className="material-symbols-outlined text-xl text-indigo-500">group</span>
                <span className="truncate">Gerenciar Usuários</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Column: Table and Filters */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden">
                {/* Filters Header */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="sm:col-span-3">
                    <Select
                      placeholder="Período"
                      options={opcoesPeriodo}
                      onChange={setFiltroPeriodo}
                      isClearable
                      classNamePrefix="select"
                      classNames={{
                        control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                        menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                        option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                        singleValue: () => '!text-slate-800 dark:!text-slate-200',
                        placeholder: () => '!text-slate-400'
                      }}
                      styles={customSelectStyles}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Select
                      placeholder="Tipo"
                      options={opcoesEl}
                      onChange={setFiltroEl}
                      isClearable
                      classNamePrefix="select"
                      classNames={{
                        control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                        menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                        option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                        singleValue: () => '!text-slate-800 dark:!text-slate-200',
                        placeholder: () => '!text-slate-400'
                      }}
                      styles={customSelectStyles}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Select
                      placeholder="Status"
                      options={opcoesStatus}
                      onChange={setFiltroStatus}
                      isClearable
                      classNamePrefix="select"
                      classNames={{
                        control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                        menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                        option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                        singleValue: () => '!text-slate-800 dark:!text-slate-200',
                        placeholder: () => '!text-slate-400'
                      }}
                      styles={customSelectStyles}
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-xl">search</span>
                      </div>
                      <input
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm transition-all h-[40px]"
                        placeholder="Pesquisar disciplina..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                      />
                    </div>
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
        </div >
      </main >
      {showUserModal && <UserManagementModal onClose={() => setShowUserModal(false)} />
      }
    </>
  );
};

export default EditDb;