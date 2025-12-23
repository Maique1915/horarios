import React, { useEffect, useCallback, useState } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveClassSchedule, deleteClassSchedule } from '../services/classService';
import LoadingSpinner, { SavingSpinner } from './LoadingSpinner';
import HorarioEditor from './HorarioEditor';

const animatedComponents = makeAnimated();

const formSchema = z.object({
  _id: z.number().nullable().optional(),
  _di: z.string().min(3, "Nome muito curto"),
  _re: z.string().min(2, "A sigla é muito curta"),
  _se: z.coerce.number(),
  _at: z.coerce.number().min(0),
  _ap: z.coerce.number().min(0),
  _pr: z.array(z.union([z.string(), z.coerce.number()])),
  _el: z.boolean(),
  _ag: z.boolean(),
  _cu: z.string(),
  _classSchedules: z.array(z.object({
    class_name: z.string().min(1, "Nome da turma não pode ser vazio"),
    ho: z.array(z.tuple([z.number(), z.number()])).optional(),
    da: z.array(z.union([z.tuple([z.string(), z.string()]), z.null()])).nullable().optional(),
  })).default([]),
  _pr_creditos_input: z.coerce.number().optional().default(0),
});

const blankForm = {
  _id: null,
  _di: '',
  _re: '',
  _se: 0,
  _at: 0,
  _ap: 0,
  _pr: [],
  _el: false,
  _ag: false,
  _cu: '',
  _classSchedules: [], // New field for class schedules
  _pr_creditos_input: 0
};

const FormField = ({ label, id, type = "text", placeholder, maxLength, required, register, valueAsNumber = false, className = "lg:col-span-1 flex flex-col", disabled = false }) => (
  <div className={className}>
    <label className="block mb-2 text-sm font-medium" htmlFor={id}>
      {label}
    </label>
    <input
      className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary disabled:opacity-70 disabled:cursor-not-allowed"
      id={id}
      type={type}
      placeholder={placeholder}
      maxLength={maxLength}
      required={required}
      disabled={disabled}
      {...register(id, { valueAsNumber: valueAsNumber })}
    />
  </div>
);

const Toggle = ({ label, id, register, checked, disabled = false }) => (
  <label htmlFor={id} className={`flex items-center ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
    <div className={`relative w-14 h-8 rounded-full ${checked ? 'bg-primary/60' : 'bg-gray-600'}`}>
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        disabled={disabled}
        {...register(id)}
      />
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'translate-x-6' : ''}`}></div>
    </div>
    <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
  </label>
);

const DisciplinaForm = ({
  disciplina,
  onSubmit,
  onCancel,
  cur,
  disciplinas,
  isReviewing = false,
  onEditClassSchedule,
  onDeleteClassSchedule,
  onAddNewClassSchedule,
  onStateChange,
}) => {
  const { handleSubmit, register, control, setValue, watch, reset, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: blankForm,
  });

  const [editingScheduleIndex, setEditingScheduleIndex] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleEditSchedule = (index) => {
    setEditingScheduleIndex(index);
  };

  const handleAddNewSchedule = () => {
    const currentSchedules = watch('_classSchedules') || [];
    const disciplineName = watch('_di');

    let newClassName = disciplineName;
    if (currentSchedules.length > 0) {
      const suffix = String.fromCharCode('A'.charCodeAt(0) + currentSchedules.length);
      newClassName = `${disciplineName} - ${suffix}`;
    }

    const newSchedules = [...currentSchedules, { class_name: newClassName, ho: [], da: [] }];
    setValue('_classSchedules', newSchedules, { shouldValidate: true });
    setEditingScheduleIndex(newSchedules.length - 1);
  };

  const handleDeleteSchedule = async (index) => {
    if (!window.confirm('Tem certeza que quer remover esta turma?')) return;

    const subjectId = watch('_id');
    const classNameToDelete = (watch('_classSchedules') || [])[index]?.class_name;

    if (!subjectId) { // If the discipline is new, just remove locally
      const newSchedules = (watch('_classSchedules') || []).filter((_, i) => i !== index);
      setValue('_classSchedules', newSchedules, { shouldValidate: true });
      if (editingScheduleIndex === index) setEditingScheduleIndex(null);
      return;
    }

    setIsSyncing(true);
    try {
      await deleteClassSchedule(subjectId, classNameToDelete);

      const newSchedules = (watch('_classSchedules') || []).filter((_, i) => i !== index);
      setValue('_classSchedules', newSchedules, { shouldValidate: true });
      if (editingScheduleIndex === index) setEditingScheduleIndex(null);

      alert('✅ Turma removida com sucesso!');
      if (onStateChange) onStateChange(getValues());
    } catch (error) {
      console.error('Erro ao remover a turma:', error);
      alert(`❌ Erro ao remover a turma: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveSchedule = async (savedSchedule) => {
    const subjectId = watch('_id');
    if (!subjectId) {
      alert("A disciplina precisa ser salva no sistema antes de poder adicionar ou editar turmas. Por favor, clique em 'Salvar Alterações' para a disciplina primeiro e tente novamente.");
      return;
    }

    setIsSyncing(true);
    try {
      await saveClassSchedule(subjectId, savedSchedule);

      const currentSchedules = watch('_classSchedules') || [];
      const newSchedules = [...currentSchedules];
      newSchedules[editingScheduleIndex] = savedSchedule;
      setValue('_classSchedules', newSchedules, { shouldValidate: true, shouldDirty: true });

      setEditingScheduleIndex(null);
      alert('✅ Turma salva com sucesso!');
      if (onStateChange) onStateChange(getValues());
    } catch (error) {
      console.error('Erro ao salvar a turma:', error);
      alert(`❌ Erro ao salvar a turma: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Removido: const [courseData, setCourseData] = useState(null);
  // Removido: const [loading, setLoading] = useState(true);

  // Removido: useEffect para fetchCourseData
  // Removido: const allDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  // Removido: const numDays = courseData?._da[1] || 5;
  // Removido: const days = allDays.slice(0, numDays);
  // Removido: const timeIntervals = courseData?._hd || [];



  const getPrerequisiteOptions = useCallback(() => {
    if (!disciplinas) return [];
    const currentSemester = watch('_se');
    const activeDisciplinas = disciplinas.filter(d => d._ag && d._se < currentSemester);
    const uniquePrerequisites = Array.from(new Set(activeDisciplinas.map(d => d._re)));
    return uniquePrerequisites.map(re => ({ value: re, label: `${re} - ${activeDisciplinas.find(d => d._re === re)?._di || ''}` }));
  }, [disciplinas, watch]);

  // Função para resetar o formulário completamente
  const handleCancel = () => {
    console.log('DisciplinaForm handleCancel - resetting to empty state'); // DEBUG
    // Reseta o formulário para um estado completamente "vazio"
    reset(blankForm);

    // Chama a função onCancel original se existir
    if (onCancel) {
      onCancel();
    }
  };

  // Atualiza o formulário quando a disciplina prop muda (para edição)
  useEffect(() => {
    console.log('DisciplinaForm useEffect - disciplina prop:', disciplina); // DEBUG
    if (disciplina) {
      const numericPrerequisites = disciplina._pr.filter(pr => typeof pr === 'number');
      const stringPrerequisites = disciplina._pr.filter(pr => typeof pr === 'string');

      reset({
        ...disciplina,
        _pr: stringPrerequisites,
        _pr_creditos_input: numericPrerequisites.length > 0 ? numericPrerequisites[0] : 0,
      });
    } else {
      reset(blankForm);
    }
  }, [disciplina, reset, cur]);



  const onSubmitHandler = (data) => {
    const finalPrerequisites = [...data._pr];
    if (data._pr_creditos_input > 0) {
      finalPrerequisites.push(data._pr_creditos_input);
    }
    const finalData = { ...data, _pr: finalPrerequisites };
    onSubmit(finalData);
  };



  return (
    <div className="lg:col-span-2 flex gap-6 relative">
      {isSyncing && <SavingSpinner message="Salvando turma..." />}
      {/* Coluna da Esquerda: Formulário */}
      <div className="w-1/2">
        <div className="sticky top-8 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitHandler)}>
            <h3 className="text-xl font-bold">Formulário de disciplina</h3>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-8 md:grid-cols-4 lg:grid-cols-2 gap-6">
                <FormField
                  label="Semestre"
                  id="_se"
                  type="number"
                  placeholder="e.g., 1"
                  maxLength="2"
                  required
                  register={register}
                  valueAsNumber
                  disabled={isReviewing}
                  className="lg:col-span-1 flex flex-col"
                />
                <FormField
                  label="Disciplina"
                  id="_di"
                  type="text"
                  placeholder="ex: Introdução à Programação"
                  required
                  register={register}
                  disabled={isReviewing}
                  className="lg:col-span-5 flex flex-col"
                />
                <FormField
                  label="Sigla"
                  id="_re"
                  type="text"
                  placeholder="ex: CIC123"
                  required
                  register={register}
                  disabled={isReviewing}
                  className="lg:col-span-1 flex flex-col"
                />
              </div>
              <div className="grid grid-cols-8 md:grid-cols-4 lg:grid-cols-2 gap-6">

                <FormField
                  label="Créditos práticos"
                  id="_ap"
                  type="number"
                  placeholder="3"
                  required
                  register={register}
                  valueAsNumber
                  disabled={isReviewing}
                  className="lg:col-span-2 flex flex-col"
                />
                <FormField
                  label="Créditos teóricos"
                  id="_at"
                  type="number"
                  placeholder="3"
                  required
                  register={register}
                  valueAsNumber
                  disabled={isReviewing}
                  className="lg:col-span-2 flex flex-col"
                />

                <div className="lg:col-span-2 flex flex-row gap-2">
                  <label className="block mb-2 text-sm font-medium" htmlFor="academic-period">
                    &nbsp;
                  </label>
                  <label className="block mb-2 text-sm font-medium" htmlFor="academic-period">
                    &nbsp;
                  </label>
                  <Toggle label="Eletiva" id="_el" register={register} checked={watch('_el')} disabled={isReviewing} />
                  <Toggle label="Ativa" id="_ag" register={register} checked={watch('_ag')} disabled={isReviewing} />
                </div>


              </div>

              <div className="flex flex-cols-8 md:grid-cols-4 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2 flex flex-col">
                  <FormField
                    label="Créditos mínimos"
                    id="_pr_creditos_input"
                    type="number"
                    placeholder="0"
                    register={register}
                    valueAsNumber
                    disabled={isReviewing}
                    className="lg:col-span-2 flex flex-col"
                  />
                </div>

                <div className='w-1/2 lg:col-span-6 flex flex-col'>
                  <label className="block mb-2 text-sm font-medium" htmlFor="department">
                    Pré-requisitos
                  </label>
                  <Controller
                    name="_pr"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        components={animatedComponents}
                        isMulti
                        options={getPrerequisiteOptions()}
                        isDisabled={isReviewing}
                        value={getPrerequisiteOptions().filter(option =>
                          field.value && field.value.includes(option.value)
                        )}
                        onChange={(selectedOptions) => field.onChange(selectedOptions.map(option => option.value))}
                        className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary disabled:opacity-70"
                        id="_pr"
                        classNamePrefix="select"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Turmas e Horários */}
            <div className="mt-4">
              <h4 className="text-lg font-bold mb-2">Turmas e Horários</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                  <thead className="bg-background-light dark:bg-background-dark">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                        Turma
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                        Horários
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                    {(watch('_classSchedules') || []).map((schedule, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-primary dark:text-text-dark-primary font-medium">
                          {schedule.class_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light-secondary dark:text-text-dark-secondary">
                          {schedule.ho ? `${schedule.ho.length} slots` : '0 slots'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleEditSchedule(index)}
                            className="text-primary hover:text-primary/80 mr-4"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSchedule(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(watch('_classSchedules') || []).length === 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-sm text-text-light-secondary dark:text-text-dark-secondary">
                          Nenhuma turma cadastrada.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={handleAddNewSchedule} className="mt-2 text-sm text-green-500 hover:underline">+ Adicionar Nova Turma</button>
            </div>


            <div className="flex items-center gap-4 mt-2">
              {!isReviewing ? (
                <>
                  <button
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                    type="submit"
                  >
                    <span className="truncate">Salvar Alterações</span>
                  </button>
                  <button
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary border border-border-light dark:border-border-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-colors"
                    type="button"
                    onClick={handleCancel}
                  >
                    <span className="truncate">Cancelar</span>
                  </button>
                </>
              ) : (
                <button
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
                  type="button"
                  onClick={onCancel}
                >
                  <span className="truncate">Fechar</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Coluna da Direita: Editor de Horário */}
      <div className="w-1/2">
        {editingScheduleIndex !== null && (
          <div className="sticky top-8 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6">
            <h3 className="text-xl font-bold mb-4">Editor de Turma/Horário</h3>
            <HorarioEditor
              initialClassName={(watch('_classSchedules') || [])[editingScheduleIndex]?.class_name}
              initialHo={(watch('_classSchedules') || [])[editingScheduleIndex]?.ho}
              initialDa={(watch('_classSchedules') || [])[editingScheduleIndex]?.da}
              onSave={handleSaveSchedule}
              onCancel={() => setEditingScheduleIndex(null)}
              isReviewing={isReviewing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DisciplinaForm;