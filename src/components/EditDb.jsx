import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './EditDb.css'; // Usaremos o CSS existente e talvez adicionemos mais
import db from '../model/db.json'; // Importar db.json diretamente
import db2 from '../model/db2.json'; // Importar definições de grade

import * as z from "zod";
import { useParams } from 'react-router-dom';
import { da } from 'zod/locales';
import DisciplinaForm from './DisciplinaForm';

const animatedComponents = makeAnimated();

// Componente auxiliar para renderizar cada período
const PeriodEditDivs = ({ periodKey, subjectsData, onEditDisciplina }) => {
  return (
    <div className="period-item">
      <div className="period-header">
        <h3 className="period-label">{`${periodKey}º Período`}</h3>
      </div>
      <div className="subject-group">
        {subjectsData.map((disciplina, index) => (
          <div key={`${disciplina._re}-${disciplina._se}-${index}`} className="subject-button-wrapper">
            <button
              className="subject-button"
              onClick={() => onEditDisciplina(disciplina)} // Passar a disciplina completa para edição
            >
              {disciplina._di} ({disciplina._re})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const EditDb = () => {
  const { cur } = useParams(); // Obter o curso da URL
  const [referenceDisciplinas, setReferenceDisciplinas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSemestreIndex, setActiveSemestreIndex] = useState(0); // Para navegação entre semestres
  const [editingDisciplineId, setEditingDisciplineId] = useState(null); // ID da disciplina atualmente sendo editada
  const [editingDisciplina, setEditingDisciplina] = useState(null); // Disciplina atualmente sendo editada
  const [showAddFormOverlay, setShowAddFormOverlay] = useState(false); // Controla a visibilidade do formulário de adição
  const [newDisciplina, setNewDisciplina] = useState(() => ({ // Estado para a nova disciplina
    _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
  }));
  const [filtroPeriodo, setFiltroPeriodo] = useState({ value: 1, label: '1º Período' });
  const [filtroStatus, setFiltroStatus] = useState({ value: true, label: 'Ativa' });
  const [filtroEl, setFiltroEl] = useState({ value: true, label: 'Eletiva' });
  const [filtroTexto, setFiltroTexto] = useState('');

  const defaultFormValues = React.useMemo(() => ({
    _id: "", _di: "", _re: "", _se: 1, _at: 4, _ap: 0, _pr: [], _el: false, _ag: true, _cu: cur, _ho: [], _da: [],
  }), [cur]);

  useEffect(() => {
    console.log('Carregando disciplinas para o curso:', cur);
    const filteredDb = db.filter(d => d._cu === cur).map(d => ({ ...d, _da: d._da || [] }));
    setReferenceDisciplinas(filteredDb);
    setDisciplinas(JSON.parse(JSON.stringify(filteredDb))); // Deep copy for editing
    setLoading(false);
    // Resetar a visualização quando o curso mudar
    setActiveSemestreIndex(0);
  }, [cur]); // Adicionar cur como dependência

  const separarPorSemestre = (allDisciplinas) => {
    const semestresMap = new Map();
    allDisciplinas.forEach(disciplina => {
      const semestre = disciplina._se;
      if (!semestresMap.has(semestre)) {
        semestresMap.set(semestre, []);
      }
      semestresMap.get(semestre).push(disciplina);
    });
    return Array.from(semestresMap.entries()).sort((a, b) => a[0] - b[0]).map(entry => entry[1]);
  };

  const disciplinasPorSemestre = separarPorSemestre(disciplinas);
  const currentSemestreDisciplinas = disciplinasPorSemestre[activeSemestreIndex] || [];


  const handleEditDisciplina = (disciplinaToEdit) => {
    setEditingDisciplineId(disciplinaToEdit._re); // Usar _re como ID temporário
    setEditingDisciplina({ ...disciplinaToEdit }); // Definir a disciplina completa para edição, passando uma cópia
  };

  const handleSaveDisciplina = (updatedDisciplina) => {
    setDisciplinas(prevDisciplinas => {
      const newDisciplinas = prevDisciplinas.map(d =>
        (d._re === updatedDisciplina._re && d._se === updatedDisciplina._se)
          ? updatedDisciplina
          : d
      );
      return newDisciplinas;
    });
    setEditingDisciplina(null); // Fechar o formulário após salvar
  };

  const handleCancelForm = () => {
    setEditingDisciplina(null);
    setNewDisciplina({
      _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
    });
  };

  const addDisciplina = (newDisciplineData) => {
    const newDisciplineWithParsedNumbers = {
      ...newDisciplineData,
      _se: parseInt(newDisciplineData._se),
      _at: parseInt(newDisciplineData._at),
      _ap: parseInt(newDisciplineData._ap),
      _cu: cur,
    };

    setDisciplinas(prevDisciplinas => [...prevDisciplinas, newDisciplineWithParsedNumbers]);
    handleCancelForm(); // Call handleCancelForm to reset newDisciplina and close the form
  };

  const removeDisciplina = (disciplinaToRemove) => {
    if (window.confirm(`Excluir removerá a matéria do sistema. Se a matéria só não vai ser dada no semestre seguinte, basta desativá-la. Tem certeza que deseja remover a disciplina "${disciplinaToRemove._di}" (${disciplinaToRemove._re})?`)) {
      const updatedDisciplinas = disciplinas.filter(d =>
        !(d._re === disciplinaToRemove._re && d._se === disciplinaToRemove._se)
      );
      setDisciplinas(updatedDisciplinas);
      setEditingDisciplina(null); // Fechar o formulário de edição
    }
  };

  const saveAllDisciplinas = (currentDisciplinas) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentDisciplinas, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "db.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleTimeSlotToggle = useCallback((day, timeIndex) => {
    const targetDisciplina = editingDisciplina || newDisciplina;
    if (!targetDisciplina) return;

    const currentHo = targetDisciplina._ho || [];
    const isChecked = currentHo.some(
      (ho) => ho[0] === day && ho[1] === timeIndex
    );

    const newHo = isChecked
      ? currentHo.filter(([d, t]) => !(d === day && t === timeIndex))
      : [...currentHo, [day, timeIndex]];

    if (editingDisciplina) {
      handleEditingHoChange(newHo);
    } else {
      handleNewHoChange(newHo);
    }
  });
  const handleToggleStatus = (disciplinaToToggle) => {
    const updatedDisciplinas = disciplinas.map(d =>
      (d._re === disciplinaToToggle._re && d._se === disciplinaToToggle._se)
        ? { ...d, _ag: !d._ag }
        : d
    );
    setDisciplinas(updatedDisciplinas);
  };

  const opcoesPeriodo = [...new Set(disciplinas.map(d => d._se))].sort((a, b) => a - b).map(se => ({ value: se, label: `${se}º Período` }));
  const opcoesCurso = [...new Set(db.map(d => d._cu))].map(cu => ({ value: cu, label: cu }));
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

  // Função para resetar o formulário
  const resetForm = (defaultValues) => {
    setDisciplina(defaultValues || {
      _id: '',
      _di: '',
      _re: '',
      _se: 1,
      _at: 0,
      _ap: 0,
      _pr: [],
      _el: false,
      _ag: true,
      _cu: '',
      _ho: [],
      _da: null
    });
  };


  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-1x1 p-6 lg:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-3xl font-bold leading-tight tracking-tight">Gerenciamento de Disciplinas do Curso</p>
                      <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                        Adicione, edite ou remova disciplinas do catálogo da universidade.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                        onClick={() => saveAllDisciplinas(disciplinas)}
                      >
                        <span className="material-symbols-outlined text-xl">download</span>
                        <span className="truncate">Salvar JSON</span>
                      </button>
                      <button
                        className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                        onClick={() => {
                          setEditingDisciplina(null);
                          setNewDisciplina({
                            _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
                          });
                        }}
                      >
                        <span className="material-symbols-outlined text-xl">add</span>
                        <span className="truncate">Nova disciplina</span>
                      </button>
                    </div>
                  </div>
        <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Subjects Table */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
              <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-border-light dark:border-border-dark">
                <div className="w-full md:w-1/2 lg:w-1/3">
                  <label className="flex flex-col min-w-40 h-10 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                      <div className="text-text-light-secondary dark:text-text-dark-secondary flex border-r-0 items-center justify-center pl-3 pr-2 bg-background-light dark:bg-background-dark rounded-l-lg">
                        <span className="material-symbols-outlined text-xl">search</span>
                      </div>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary h-full placeholder:text-text-light-secondary placeholder:dark:text-text-dark-secondary px-2 rounded-l-none border-l-0 text-sm font-normal leading-normal"
                        placeholder="Pesquisar por nome ou código da disciplina..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                      />
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 p-4 border-b border-border-light dark:border-border-dark">
                <Select
                  placeholder="Período"
                  options={opcoesPeriodo}
                  onChange={setFiltroPeriodo}
                  isClearable
                />
                <Select
                  placeholder="Eletiva/Optativa"
                  options={opcoesEl}
                  onChange={setFiltroEl}
                  isClearable
                />
                <Select
                  placeholder="Status"
                  options={opcoesStatus}
                  onChange={setFiltroStatus}
                  isClearable
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase text-text-light-secondary dark:text-text-dark-secondary">
                    <tr>
                      <th className="px-6 py-3" scope="col">Código</th>
                      <th className="px-6 py-3" scope="col">Nome da Disciplina</th>
                      <th className="px-6 py-3" scope="col">Período</th>
                      <th className="px-6 py-3" scope="col">Créditos</th>
                      <th className="px-6 py-3 text-right" scope="col">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinasFiltradas.map((disciplina, index) => (
                      <tr key={`${disciplina._re}-${disciplina._se}-${index}`} className="border-b border-border-light dark:border-border-dark">
                        <td className="px-6 py-4 font-medium">{disciplina._re}</td>
                        <td className="px-6 py-4">{disciplina._di}</td>
                        <td className="px-6 py-4">{disciplina._se}º Período</td>
                        <td className="px-6 py-4">{disciplina._at + disciplina._ap}</td>
                        <td className="px-6 py-4 flex justify-end gap-2">
                          <button
                            className={`p-2 rounded-md hover:bg-gray-500/10 ${disciplina._ag ? 'text-green-500' : 'text-red-500'} transition-colors`}
                            onClick={() => handleToggleStatus(disciplina)}
                          >
                            <span className="material-symbols-outlined text-xl">{disciplina._ag ? 'visibility' : 'visibility_off'}</span>
                          </button>
                          <button
                            className="p-2 rounded-md hover:bg-primary/10 text-primary transition-colors"
                            onClick={() => handleEditDisciplina(disciplina)}
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            className="p-2 rounded-md hover:bg-red-500/10 text-red-500 transition-colors"
                            onClick={() => removeDisciplina(disciplina)}
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <DisciplinaForm
            disciplina={editingDisciplina || newDisciplina}
            onSubmit={editingDisciplina ? handleSaveDisciplina : addDisciplina}
            onCancel={handleCancelForm}
            cur={cur}
            disciplinas={disciplinas}
          />
        </div>
      </div>
    </main>
  );
};

export default EditDb;