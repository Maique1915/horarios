import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './EditDb.css'; // Usaremos o CSS existente e talvez adicionemos mais
import db from '../model/db.json'; // Importar db.json diretamente
import db2 from '../model/db2.json'; // Importar definições de grade

import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from 'react-router-dom';
import { da } from 'zod/locales';

const animatedComponents = makeAnimated();

const formSchema = z.object({
  _id: z.string().optional(), // Adicionado para compatibilidade, embora não usado diretamente no db.json
  _di: z.string().min(3, "Nome muito curto"),
  _re: z.string().min(2, "Código muito curto"),
  _se: z.coerce.number(),
  _at: z.coerce.number().min(0),
  _ap: z.coerce.number().min(0),
  _pr: z.array(z.string()),
  _el: z.boolean(),
  _ag: z.boolean(),
  _cu: z.string(),
  _ho: z.array(z.tuple([z.number(), z.number()])),
  _da: z.array(z.union([z.tuple([z.string(), z.string()]), z.null()])).nullable(),
});

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

  // Função para gerar as opções de pré-requisitos
  const getPrerequisiteOptions = useCallback(() => {
    const activeDisciplinas = disciplinas.filter(d => d._ag);
    const uniquePrerequisites = Array.from(new Set(activeDisciplinas.map(d => d._re)));
    return uniquePrerequisites.map(re => ({ value: re, label: `${re} - ${activeDisciplinas.find(d => d._re === re)?._di || ''}` }));
  }, [disciplinas]);



  const defaultFormValues = React.useMemo(() => ({
    _id: "", _di: "", _re: "", _se: 1, _at: 4, _ap: 0, _pr: [], _el: false, _ag: true, _cu: cur, _ho: [], _da: [],
  }), [cur]);


  const courseData = db2.find(c => c._cu === cur);
  const days = ['','Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].filter((_, index) => index < (courseData?._da[1] + 1 || 6));
  const timeIntervals = courseData?._hd || []; // Usar _hd de db2.json

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });

  const { handleSubmit, register, control, setValue, watch, reset, formState: { errors } } = form;

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
    reset({ ...disciplinaToEdit, _id: disciplinaToEdit._re }); // Preencher o formulário
    setEditingDisciplineId(disciplinaToEdit._re); // Usar _re como ID temporário
    setEditingDisciplina(disciplinaToEdit); // Definir a disciplina completa para edição
  };

  const handleEditingInputChange = (e, field) => {
    if (!editingDisciplina) return;

    let parsedValue;
    if (e.target.type === 'checkbox') {
      parsedValue = e.target.checked;
    } else if (e.target.type === 'select-multi' && field === '_pr') {
      parsedValue = e.target.value ? e.target.value.map(option => option.value) : [];
    } else if (['_se', '_at', '_ap'].includes(field)) {
      parsedValue = parseInt(e.target.value) || '';
    } else {
      parsedValue = e.target.value;
    }

    // Update the main list
    const updatedDisciplinas = disciplinas.map(d =>
      (d._re === editingDisciplina._re && d._se === editingDisciplina._se)
        ? { ...d, [field]: parsedValue }
        : d
    );
    setDisciplinas(updatedDisciplinas);

    // Update the local form state
    setEditingDisciplina(prev => ({ ...prev, [field]: parsedValue }));
  };

  // Nova função para lidar com a mudança de horários do HorarioEditor para edição
  const handleEditingHoChange = useCallback((newHo) => {
    if (!editingDisciplina) return;

    const updatedDisciplinas = disciplinas.map(d =>
      (d._re === editingDisciplina._re && d._se === editingDisciplina._se)
        ? { ...d, _ho: newHo }
        : d
    );
    setDisciplinas(updatedDisciplinas);

    setEditingDisciplina(prev => ({ ...prev, _ho: newHo }));
  }, [editingDisciplina, disciplinas]);

  const resetDisciplina = () => {
    if (!editingDisciplina) return;

    // Find the original discipline from the reference
    const originalDisciplina = referenceDisciplinas.find(d =>
      d._re === editingDisciplina._re && d._se === editingDisciplina._se
    );

    if (originalDisciplina) {
      // Update the 'disciplinas' (editing) state with the original data
      setDisciplinas(prevDisciplinas => {
        return prevDisciplinas.map(d => {
          if (d._re === editingDisciplina._re && d._se === editingDisciplina._se) {
            return originalDisciplina;
          }
          return d;
        });
      });

      // Update the local editing form as well
      setEditingDisciplina(JSON.parse(JSON.stringify(originalDisciplina)));
    }
  };

  const closeEditForm = () => {
    setEditingDisciplina(null); // Fechar o formulário de edição
  };

  const handleNewInputChange = (e, field) => {
    let value = e.target.value;
    if (e.target.type === 'select-multi' && field === '_pr') {
      value = e.target.value ? e.target.value.map(option => option.value) : [];
    } else if (field === '_el' || field === '_ag') {
      value = e.target.checked; // Para checkboxes
    } else if (field === '_se' || field === '_at' || field === '_ap') {
      value = parseInt(value);
    }
    setNewDisciplina(prev => ({ ...prev, [field]: value }));
  };

  // Nova função para lidar com a mudança de horários do HorarioEditor para adição
  const handleNewHoChange = useCallback((newHo) => {
    setNewDisciplina(prev => ({ ...prev, _ho: newHo }));
  }, []);

  const addDisciplina = () => {
    const updatedDisciplinas = [...disciplinas, { ...newDisciplina, _se: parseInt(newDisciplina._se), _at: parseInt(newDisciplina._at), _ap: parseInt(newDisciplina._ap) }];
    setDisciplinas(updatedDisciplinas);
    setNewDisciplina({
      _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: 'matematica', _ho: []
    });
    setShowAddFormOverlay(false); // Esconder o formulário de adição após adicionar
  };

  const cancelAddDisciplina = () => {
    setShowAddFormOverlay(false);
    setNewDisciplina({
      _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: 'matematica', _ho: []
    });
  };

  const removeDisciplina = (disciplinaToRemove) => {
    if (window.confirm(`Tem certeza que deseja remover a disciplina "${disciplinaToRemove._di}" (${disciplinaToRemove._re})? Esta ação é permanente.\n\nVocê pode apenas desativa-la, isto oculará ela do sistema.`)) {
      const updatedDisciplinas = disciplinas.filter(d =>
        !(d._re === disciplinaToRemove._re && d._se === disciplinaToRemove._se)
      );
      setDisciplinas(updatedDisciplinas);
      setEditingDisciplina(null); // Fechar o formulário de edição
    }
  };

  const saveAllDisciplinas = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(disciplinas, null, 2));
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
    return true;
  });

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-1x1 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-bold leading-tight tracking-tight">Course Subject Management</p>
            <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
              Add, edit, or remove course subjects from the university catalog.
            </p>
          </div>
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

        <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Subjects Table */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
              <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-border-light dark:border-border-dark">
                <div className="flex-1">
                  <label className="flex flex-col min-w-40 h-10 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                      <div className="text-text-light-secondary dark:text-text-dark-secondary flex border-r-0 items-center justify-center pl-3 pr-2 bg-background-light dark:bg-background-dark rounded-l-lg">
                        <span className="material-symbols-outlined text-xl">search</span>
                      </div>
                      <input
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border-none bg-background-light dark:bg-background-dark focus:ring-2 focus:ring-primary h-full placeholder:text-text-light-secondary placeholder:dark:text-text-dark-secondary px-2 rounded-l-none border-l-0 text-sm font-normal leading-normal"
                        placeholder="Search by subject name or code..."
                      />
                    </div>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-lg bg-background-light dark:bg-background-dark hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-xl">filter_list</span>
                  </button>
                  <button className="p-2.5 rounded-lg bg-background-light dark:bg-background-dark hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-xl">swap_vert</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 p-4 border-b border-border-light dark:border-border-dark">
                <Select
                  placeholder="Academic Period"
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
                      <th className="px-6 py-3" scope="col">Subject Code</th>
                      <th className="px-6 py-3" scope="col">Subject Name</th>
                      <th className="px-6 py-3" scope="col">Academic Period</th>
                      <th className="px-6 py-3" scope="col">Credits</th>
                      <th className="px-6 py-3" scope="col">Status</th>
                      <th className="px-6 py-3 text-right" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disciplinasFiltradas.map((disciplina, index) => (
                      <tr key={`${disciplina._re}-${disciplina._se}-${index}`} className="border-b border-border-light dark:border-border-dark">
                        <td className="px-6 py-4 font-medium">{disciplina._re}</td>
                        <td className="px-6 py-4">{disciplina._di}</td>
                        <td className="px-6 py-4">{disciplina._se}º Período</td>
                        <td className="px-6 py-4">{disciplina._at + disciplina._ap}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${disciplina._ag ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {disciplina._ag ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex justify-end gap-2">
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

          {/* Add New Subject Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-8 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6">
              <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                <h3 className="text-xl font-bold">Formulário de disciplina</h3>

                <div className="flex flex-col gap-4">
                  <div class="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-1 flex flex-col">
                      <label className="block mb-2 text-sm font-medium" htmlFor="numeric-period">
                        Semestre
                      </label>
                      <input
                        className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="numericPeriod"
                        type="number"
                        placeholder="e.g., 1"
                        value={editingDisciplina ? editingDisciplina._se : newDisciplina._se}
                        onChange={(e) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)(e, '_se')}
                        maxLength="2"
                        required
                      />
                    </div>
                    <div className="lg:col-span-3 flex flex-col">
                      <label className="block mb-2 text-sm font-medium" htmlFor="subject-name">
                        Disiciplina
                      </label>
                      <input
                        className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="_di"
                        type="text"
                        placeholder="e.g., Introduction to Programming"
                        value={editingDisciplina ? editingDisciplina._di : newDisciplina._di}
                        onChange={(e) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)(e, '_di')}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium" htmlFor="academic-period">
                        Referência
                      </label>
                      <input
                        className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                        id="_re"
                        type="text"
                        placeholder="e.g., 101A"
                        value={editingDisciplina ? editingDisciplina._re : newDisciplina._re}
                        onChange={(e) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)(e, '_re')}
                        required
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-2">

                      <label htmlFor="_el_edit" className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="_el_edit"
                            className="sr-only" // sr-only makes it visually hidden but accessible
                            checked={editingDisciplina ? editingDisciplina._el : newDisciplina._el}
                            onChange={(e) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)(e, '_el')}
                          />
                          <div className="block bg-gray-600 w-14 h-8 rounded-full"></div> {/* Track */}
                          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${editingDisciplina && editingDisciplina._el ? 'translate-x-full bg-primary' : ''}`}></div> {/* Thumb */}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">Eletiva</span>
                      </label>

                      <label htmlFor="_ag_edit" className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input
                            type="checkbox"
                            id="_ag_edit"
                            className="sr-only" // sr-only makes it visually hidden but accessible
                            checked={editingDisciplina ? editingDisciplina._ag : newDisciplina._ag}
                            onChange={(e) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)(e, '_ag')}
                          />
                          <div className="block bg-gray-600 w-14 h-8 rounded-full"></div> {/* Track */}
                          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${editingDisciplina && editingDisciplina._ag ? 'translate-x-full bg-primary' : ''}`}></div> {/* Thumb */}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">Ativa</span>
                      </label>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium" htmlFor="credit-hours">
                          Créditos práticos
                        </label>
                        <input
                          className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                          id="_ap"
                          type="number"
                          placeholder="3"
                          value={editingDisciplina ? editingDisciplina._ap : newDisciplina._ap}
                          onChange={(e) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)(e, '_ap')}
                          required
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium" htmlFor="credit-hours">
                          Creditos teóricos
                        </label>
                        <input
                          className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                          id="_at"
                          type="number"
                          placeholder="3"
                          value={editingDisciplina ? editingDisciplina._at : newDisciplina._at}
                          onChange={(e) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)(e, '_at')}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium" htmlFor="department">
                      Pré-requisitos
                    </label>
                    <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      options={getPrerequisiteOptions()}
                      value={getPrerequisiteOptions().filter(option => editingDisciplina ? editingDisciplina._pr.includes(option.value) : newDisciplina._pr.includes(option.value))}
                      onChange={(selectedOptions) => (editingDisciplina ? handleEditingInputChange : handleNewInputChange)({ target: { value: selectedOptions, type: 'select-multi' } }, '_pr')}
                      className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                      id="_pr"
                      classNamePrefix="select"
                    />
                  </div>



                  <div className="space-y-4">
                    <label className="block text-sm font-medium">Horários</label>

                    <div className={`grid grid-cols-${days.length} gap-2 text-center text-xs`}>
                      {/* Cabeçalho */}
                      {days.map((day, index) => (
                        <div key={`header-${index}`} className="font-medium text-text-light-secondary dark:text-text-dark-secondary">
                          {day}
                        </div>
                      ))}
                      <div className={`col-span-${days.length} border-t border-border-light dark:border-border-dark my-1`}></div>

                      {/* Corpo do quadro */}
                      {timeIntervals.map((interval, timeIndex) => (
                        <React.Fragment key={timeIndex}>
                          <div className="flex items-center justify-center font-medium text-text-light-secondary dark:text-text-dark-secondary">
                            {interval[0]} - {interval[1]}
                          </div>
                          {days.slice(1).map((day, dayIndex) => {
                            const currentHo = editingDisciplina ? editingDisciplina._ho : newDisciplina._ho;
                            const isChecked = currentHo.some(
                              (ho) => ho[0] === dayIndex + 1 && ho[1] === timeIndex
                            );
                            return (
                              <label
                                key={dayIndex}
                                className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ring-1 ring-transparent hover:bg-primary/10 transition-colors ${isChecked ? 'bg-primary/20 ring-primary' : 'bg-background-light dark:bg-background-dark'
                                  }`}
                              >
                                <input
                                  className="form-checkbox hidden"
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleTimeSlotToggle(dayIndex + 1, timeIndex)}
                                />
                                <span className="text-xs font-medium">&ensp;</span> {/* Espaço para a label */}
                              </label>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <button
                    className="flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                    type="submit"
                  >
                    <span className="truncate">Save Changes</span>
                  </button>
                  <button
                    className="flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary border border-border-light dark:border-border-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-colors"
                    type="button"
                    onClick={() => {
                      if (editingDisciplina) {
                        resetDisciplina();
                      } else {
                        setNewDisciplina({
                          _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
                        });
                      }
                    }}
                  >
                    <span className="truncate">Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditDb;