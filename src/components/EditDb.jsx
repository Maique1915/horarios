import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import './EditDb.css'; // Usaremos o CSS existente e talvez adicionemos mais
import { loadDbData, clearCache } from '../model/loadData'; // Importar loader e clearCache
import { horarios, dimencao } from '../model/Filtro.jsx'; // Importar horarios e dimencao

import * as z from "zod";
import { useParams } from 'react-router-dom';
import { da } from 'zod/locales';
import DisciplinaForm from './DisciplinaForm';
import DisciplinaTable from './DisciplinaTable';
import LoadingSpinner, { SavingSpinner } from './LoadingSpinner';

const animatedComponents = makeAnimated();

// URL do Apps Script
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8E80OOXc9pjXZos9XHuxwT1DkwXZqVshjRPX7DVfEdCDGEYaB89w8P2oyRRQGJSYI4A/exec';

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
  const [showForm, setShowForm] = useState(false); // Controla a visibilidade do formulário de adição/edição
  const [newDisciplina, setNewDisciplina] = useState(() => ({ // Estado para a nova disciplina
    _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
  }));
  const [filtroPeriodo, setFiltroPeriodo] = useState(null);
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [filtroEl, setFiltroEl] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [syncing, setSyncing] = useState(false); // Estado para indicar sincronização
  const [courseSchedule, setCourseSchedule] = useState([]);
  const [courseDimension, setCourseDimension] = useState([0, 0]);

  const defaultFormValues = React.useMemo(() => ({
    _id: "", _di: "", _re: "", _se: 1, _at: 4, _ap: 0, _pr: [], _el: false, _ag: true, _cu: cur, _ho: [], _da: [],
  }), [cur]);

  useEffect(() => {
    const fetchData = async () => {
      console.log('EditDb: Carregando dados para o curso:', cur);
      setLoading(true);
      try {
        const [db, schedule, dimension] = await Promise.all([
          loadDbData(),
          horarios(cur),
          dimencao(cur)
        ]);
        
        const filteredDb = db.filter(d => d._cu === cur).map(d => ({ ...d, _da: d._da || [] }));
        setReferenceDisciplinas(filteredDb);
        setDisciplinas(JSON.parse(JSON.stringify(filteredDb))); // Deep copy for editing
        setCourseSchedule(schedule);
        setCourseDimension(dimension);
        setError(null);
        
        console.log('EditDb: Dados carregados -', filteredDb.length, 'disciplinas');
      } catch (err) {
        console.error('EditDb: Erro ao carregar dados:', err);
        setError('Erro ao carregar disciplinas. Tente novamente.');
      } finally {
        setLoading(false);
      }
      // Resetar a visualização quando o curso mudar
      setActiveSemestreIndex(0);
    };
    
    fetchData();
  }, [cur]); // Adicionar cur como dependência

  // Função para salvar no Google Sheets via Apps Script
  const saveToGoogleSheets = async (action, data) => {
    setSyncing(true);
    try {
      console.log(`Salvando no Google Sheets - Action: ${action}`, data);
      
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Importante para Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          course: cur,
          ...data
        })
      });

      // Com no-cors, não podemos ler a resposta, então assumimos sucesso
      console.log(`Operação ${action} enviada com sucesso`);
      
      // Limpa o cache para forçar recarregamento
      clearCache();
      
      // Recarrega os dados
      const db = await loadDbData();
      const filteredDb = db.filter(d => d._cu === cur).map(d => ({ ...d, _da: d._da || [] }));
      setReferenceDisciplinas(filteredDb);
      setDisciplinas(JSON.parse(JSON.stringify(filteredDb)));
      
      return { success: true };
      
    } catch (error) {
      console.error(`Erro ao salvar no Google Sheets (${action}):`, error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

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
    setShowForm(true); // Mostrar o formulário
  };

  const handleSaveDisciplina = async (updatedDataFromForm) => {
    try {
      // Salva no Google Sheets
      await saveToGoogleSheets('updateDiscipline', {
        reference: editingDisciplina._re,
        data: updatedDataFromForm
      });
      
      setEditingDisciplina(null);
      setEditingDisciplineId(null);
      setShowForm(false);
      
      alert('✅ Disciplina atualizada com sucesso no Google Sheets!');
      
    } catch (error) {
      console.error('Erro ao salvar disciplina:', error);
      alert('❌ Erro ao salvar disciplina. Verifique o console.');
      
      // Mantém a edição local mesmo se falhar no servidor
      setDisciplinas(prevDisciplinas => {
        const newDisciplinas = prevDisciplinas.map(d => {
          if (editingDisciplina && d._re === editingDisciplina._re && d._se === editingDisciplina._se) {
            return { ...editingDisciplina, ...updatedDataFromForm };
          }
          return d;
        });
        return newDisciplinas;
      });
      setEditingDisciplina(null);
      setShowForm(false);
    }
  };

  const handleCancelForm = () => {
    setEditingDisciplina(null);
    setNewDisciplina({
      _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
    });
    setShowForm(false); // Voltar para a lista
  };

  const addDisciplina = async (newDisciplineData) => {
    const newDisciplineWithParsedNumbers = {
      ...newDisciplineData,
      _se: parseInt(newDisciplineData._se),
      _at: parseInt(newDisciplineData._at),
      _ap: parseInt(newDisciplineData._ap),
      _cu: cur,
    };

    try {
      // Salva no Google Sheets
      await saveToGoogleSheets('addDiscipline', {
        data: newDisciplineWithParsedNumbers
      });
      
      handleCancelForm();
      setShowForm(false);
      
      alert('✅ Disciplina adicionada com sucesso no Google Sheets!');
      
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      alert('❌ Erro ao adicionar disciplina. Verifique o console.');
      
      // Adiciona localmente mesmo se falhar no servidor
      setDisciplinas(prevDisciplinas => [...prevDisciplinas, newDisciplineWithParsedNumbers]);
      handleCancelForm();
      setShowForm(false);
    }
  };

  const removeDisciplina = async (disciplinaToRemove) => {
    if (!window.confirm(`Excluir removerá a matéria do sistema. Se a matéria só não vai ser dada no semestre seguinte, basta desativá-la. Tem certeza que deseja remover a disciplina "${disciplinaToRemove._di}" (${disciplinaToRemove._re})?`)) {
      return;
    }
    
    try {
      // Remove do Google Sheets
      await saveToGoogleSheets('deleteDiscipline', {
        reference: disciplinaToRemove._re
      });
      
      setEditingDisciplina(null);
      alert('✅ Disciplina removida com sucesso do Google Sheets!');
      
    } catch (error) {
      console.error('Erro ao remover disciplina:', error);
      alert('❌ Erro ao remover disciplina. Verifique o console.');
      
      // Remove localmente mesmo se falhar no servidor
      const updatedDisciplinas = disciplinas.filter(d =>
        !(d._re === disciplinaToRemove._re && d._se === disciplinaToRemove._se)
      );
      setDisciplinas(updatedDisciplinas);
      setEditingDisciplina(null);
    }
  };

  const saveAllDisciplinas = async (currentDisciplinas) => {
    // Converter para CSV com separador TAB (igual ao CourseSelector)
    const headers = "_cu\t_se\t_di\t_re\t_ap\t_at\t_el\t_ag\t_pr\t_ho\t_au\t_ha\t_da";
    
    const csvRows = currentDisciplinas.map(disc => {
      // Formatar arrays e valores
      const _pr = Array.isArray(disc._pr) && disc._pr.length > 0 
        ? `"${disc._pr.join(', ')}"` 
        : '';
      
      const _ho = Array.isArray(disc._ho) && disc._ho.length > 0
        ? `"${JSON.stringify(disc._ho).replace(/"/g, '')}"`
        : '';
      
      const _ha = Array.isArray(disc._ha) && disc._ha.length > 0
        ? `"${JSON.stringify(disc._ha).replace(/"/g, '')}"`
        : '[]';
      
      const _au = disc._au || '';
      const _da = disc._da || '';
      
      // Criar linha CSV com separador TAB
      return `${disc._cu}\t${disc._se}\t${disc._di}\t${disc._re}\t${disc._ap}\t${disc._at}\t${disc._el}\t${disc._ag}\t${_pr}\t${_ho}\t${_au}\t${_ha}\t${_da}`;
    });
    
    const csvContent = headers + '\n' + csvRows.join('\n');
    
    // Copiar para clipboard
    try {
      await navigator.clipboard.writeText(csvContent);
      
      alert(
        `✅ Dados CSV copiados para a área de transferência!\n\n` +
        `📋 INSTRUÇÕES:\n\n` +
        `1. Abra o Google Sheets com seus dados\n` +
        `2. Vá para a aba "${cur}"\n` +
        `3. Selecione TODA a planilha (Ctrl+A)\n` +
        `4. Cole os dados copiados (Ctrl+V)\n` +
        `5. Os dados serão atualizados automaticamente\n\n` +
        `⚠️ IMPORTANTE: Esta operação irá SUBSTITUIR todos os dados da aba "${cur}"\n` +
        `Certifique-se de estar na aba correta antes de colar!\n\n` +
        `Total de disciplinas: ${currentDisciplinas.length}`
      );
    } catch (err) {
      console.error('Erro ao copiar:', err);
      
      // Fallback: fazer download do CSV
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `${cur}_disciplinas.csv`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      alert(
        `⚠️ Não foi possível copiar automaticamente.\n\n` +
        `O arquivo CSV foi baixado.\n\n` +
        `📋 INSTRUÇÕES:\n` +
        `1. Abra o arquivo CSV baixado\n` +
        `2. Copie todo o conteúdo (Ctrl+A, Ctrl+C)\n` +
        `3. Vá para o Google Sheets, aba "${cur}"\n` +
        `4. Selecione a célula A1\n` +
        `5. Cole os dados (Ctrl+V)`
      );
    }
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
  const handleToggleStatus = async (disciplinaToToggle) => {
    console.log('Toggle chamado para:', disciplinaToToggle);
    
    try {
      const newStatus = !disciplinaToToggle._ag;
      
      // Atualiza no Google Sheets
      await saveToGoogleSheets(newStatus ? 'activate' : 'deactivate', {
        reference: disciplinaToToggle._re
      });
      
      alert(`✅ Disciplina ${newStatus ? 'ativada' : 'desativada'} com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('❌ Erro ao alterar status. Verifique o console.');
      
      // Atualiza localmente mesmo se falhar no servidor
      const updatedDisciplinas = disciplinas.map(d => {
        const isSameDisciplina = 
          d._re === disciplinaToToggle._re && 
          d._se === disciplinaToToggle._se &&
          d._di === disciplinaToToggle._di &&
          d._cu === disciplinaToToggle._cu;
        
        if (isSameDisciplina) {
          console.log('Toggling:', d._di, 'de', d._ag, 'para', !d._ag);
        }
        
        return isSameDisciplina ? { ...d, _ag: !d._ag } : d;
      });
      
      console.log('Total modificadas:', updatedDisciplinas.filter((d, i) => d._ag !== disciplinas[i]._ag).length);
      setDisciplinas(updatedDisciplinas);
    }
  };

  const opcoesPeriodo = [...new Set(disciplinas.map(d => d._se))].sort((a, b) => a - b).map(se => ({ value: se, label: `${se}º Período` }));
  
  const [opcoesCurso, setOpcoesCurso] = useState([]);
  
  useEffect(() => {
    const fetchCursos = async () => {
      const db = await loadDbData();
      const cursos = [...new Set(db.map(d => d._cu))].map(cu => ({ value: cu, label: cu }));
      setOpcoesCurso(cursos);
    };
    fetchCursos();
  }, []);
  
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
      {syncing && <SavingSpinner message="Salvando no Google Sheets..." />}
      
      <div className="mx-auto max-w-1x1 p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-bold leading-tight tracking-tight">Gerenciamento de Disciplinas do Curso</p>
            <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
              Adicione, edite ou remova disciplinas diretamente no Google Sheets.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-green-600 text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                clearCache();
                const db = await loadDbData();
                const filteredDb = db.filter(d => d._cu === cur).map(d => ({ ...d, _da: d._da || [] }));
                setReferenceDisciplinas(filteredDb);
                setDisciplinas(JSON.parse(JSON.stringify(filteredDb)));
                alert('✅ Dados recarregados do Google Sheets!');
              }}
              disabled={syncing}
            >
              <span className="material-symbols-outlined text-xl">refresh</span>
              <span className="truncate">Recarregar</span>
            </button>
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => saveAllDisciplinas(disciplinas)}
              disabled={syncing}
            >
              <span className="material-symbols-outlined text-xl">download</span>
              <span className="truncate">Baixar CSV</span>
            </button>
            <button
              className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setEditingDisciplina(null);
                setNewDisciplina({
                  _se: '', _di: '', _re: '', _at: '', _ap: '', _pr: [], _el: false, _ag: false, _cu: cur, _ho: [], _da: []
                });
                setShowForm(true); // Mostrar o formulário
              }}
              disabled={syncing}
            >
              <span className="material-symbols-outlined text-xl">add</span>
              <span className="truncate">Nova disciplina</span>
            </button>
          </div>
        </div>
        {showForm ? (
          <DisciplinaForm
            disciplina={editingDisciplina || newDisciplina}
            onSubmit={editingDisciplina ? handleSaveDisciplina : addDisciplina}
            onCancel={handleCancelForm}
            cur={cur}
            disciplinas={disciplinas}
            courseSchedule={courseSchedule}
            courseDimension={courseDimension}
          />
        ) : (
          <div className="grid grid-cols gap-6">
            {/* Subjects Table */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm">
                <div className="flex gap-3 p-4 border-b border-border-light dark:border-border-dark">
                  <div className="w-1/12">
                    <Select
                      placeholder="Período"
                      options={opcoesPeriodo}
                      onChange={setFiltroPeriodo}
                      isClearable
                    />
                  </div>
                  <div className="w-1/9">
                    <Select
                      placeholder="Eletiva/Optativa"
                      options={opcoesEl}
                      onChange={setFiltroEl}
                      isClearable
                    />
                  </div>
                  <div className="w-1/15">
                    <Select
                      placeholder="Status"
                      options={opcoesStatus}
                      onChange={setFiltroStatus}
                      isClearable
                    />
                  </div>
                  <div className="w-1/4 md:w-1/4 lg:w-1/3">
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

                <DisciplinaTable
                  data={disciplinasFiltradas}
                  handleEditDisciplina={handleEditDisciplina}
                  removeDisciplina={removeDisciplina}
                  handleToggleStatus={handleToggleStatus}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default EditDb;