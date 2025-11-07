import React, { useEffect, useCallback } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import db2 from '../model/db2.json';

const animatedComponents = makeAnimated();

const formSchema = z.object({
  _id: z.string().optional(),
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

const blankForm = {
  _id: '',
  _di: '',
  _re: '',
  _se: 0,
  _at: 0,
  _ap: 0,
  _pr: [],
  _el: false,
  _ag: false,
  _cu: '',
  _ho: [],
  _da: null
};

const FormField = ({ label, id, type = "text", placeholder, maxLength, required, register, valueAsNumber = false, className = "lg:col-span-1 flex flex-col" }) => (
  <div className={className}>
    <label className="block mb-2 text-sm font-medium" htmlFor={id}>
      {label}
    </label>
    <input
      className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
      id={id}
      type={type}
      placeholder={placeholder}
      maxLength={maxLength}
      required={required}
      {...register(id, { valueAsNumber: valueAsNumber })}
    />
  </div>
);

const Toggle = ({ label, id, register, checked }) => (
  <label htmlFor={id} className="flex items-center cursor-pointer">
    <div className="relative w-14 h-8 rounded-full bg-gray-600">
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        {...register(id)}
      />
      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${checked ? 'translate-x-6 bg-primary' : ''}`}></div>
    </div>
    <span className="ml-3 text-sm font-medium text-gray-900">{label}</span>
  </label>
);

const DisciplinaForm = ({
  disciplina,
  onSubmit,
  onCancel,
  cur,
  disciplinas
}) => {
  const { handleSubmit, register, control, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: blankForm,
  });

  const courseData = db2.find(c => c._cu === cur);
  const allDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const numDays = courseData?._da[1] || 5; // Default to 5 days if not specified
  const days = allDays.slice(0, numDays);
  const timeIntervals = courseData?._hd || [];



  const getPrerequisiteOptions = useCallback(() => {
    if (!disciplinas) return [];
    const activeDisciplinas = disciplinas.filter(d => d._ag);
    const uniquePrerequisites = Array.from(new Set(activeDisciplinas.map(d => d._re)));
    return uniquePrerequisites.map(re => ({ value: re, label: `${re} - ${activeDisciplinas.find(d => d._re === re)?._di || ''}` }));
  }, [disciplinas]);

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
    if (disciplina) { // Apenas preenche se uma disciplina for fornecida
      reset(disciplina);
    } else {
      // Se nenhuma disciplina for fornecida (novo formulário), reseta para o estado inicial completamente vazio
      reset(blankForm);
    }
  }, [disciplina, reset, cur]); // Adicionar 'cur' como dependência

  const handleTimeSlotChange = useCallback((dayOfWeek, timeIndex) => {
    const currentHo = watch('_ho');
    const newHo = [...currentHo];
    const index = newHo.findIndex(
      (ho) => ho[0] === dayOfWeek && ho[1] === timeIndex
    );

    if (index > -1) {
      newHo.splice(index, 1); // Remove se já existe
    } else {
      newHo.push([dayOfWeek, timeIndex]); // Adiciona se não existe
    }
    setValue('_ho', newHo);
  }, [watch, setValue]);

  return (
    <div className="lg:col-span-2">
      <div className="sticky top-8 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-xl font-bold">Formulário de disciplina</h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <FormField
                label="Semestre"
                id="_se"
                type="number"
                placeholder="e.g., 1"
                maxLength="2"
                required
                register={register}
                valueAsNumber
                className="lg:col-span-1 flex flex-col"
              />
              <FormField
                label="Disciplina"
                id="_di"
                type="text"
                placeholder="ex: Introdução à Programação"
                required
                register={register}
                className="lg:col-span-3 flex flex-col"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="Referência"
                id="_re"
                type="text"
                placeholder="ex: 101A"
                required
                register={register}
              />

              <div className="grid grid-cols-2 gap-2">
                <label className="block mb-2 text-sm font-medium" htmlFor="academic-period">
                  &nbsp;
                </label>
                <label className="block mb-2 text-sm font-medium" htmlFor="academic-period">
                  &nbsp;
                </label>
                <Toggle label="Eletiva" id="_el" register={register} checked={watch('_el')} />

                <Toggle label="Ativa" id="_ag" register={register} checked={watch('_ag')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Créditos práticos"
                  id="_ap"
                  type="number"
                  placeholder="3"
                  required
                  register={register}
                  valueAsNumber
                />
                <FormField
                  label="Créditos teóricos"
                  id="_at"
                  type="number"
                  placeholder="3"
                  required
                  register={register}
                  valueAsNumber
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium" htmlFor="department">
                Pré-requisitos
              </label>
              <Controller
                name="_pr"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    options={getPrerequisiteOptions()}
                    value={getPrerequisiteOptions().filter(option =>
                      field.value && field.value.includes(option.value)
                    )}
                    onChange={(selectedOptions) => field.onChange(selectedOptions.map(option => option.value))}
                    className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                    id="_pr"
                    classNamePrefix="select"
                  />
                )}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium">Horários</label>
              <div className={`grid grid-cols-${days.length + 1} gap-2 text-center text-xs`}>
                <div className="font-medium text-text-light-secondary dark:text-text-dark-secondary"></div> {/* Empty cell for time labels */}
                {days.map((day, index) => (
                  <div key={`header-${index}`} className="font-medium text-text-light-secondary dark:text-text-dark-secondary">
                    {day}
                  </div>
                ))}
                <div className={`col-span-${days.length + 1} border-t border-border-light dark:border-border-dark my-1`}></div>
                {timeIntervals.map((interval, timeIndex) => (
                  <React.Fragment key={timeIndex}>
                    <div className="flex items-center justify-center font-medium text-text-light-secondary dark:text-text-dark-secondary">
                      {interval[0]} - {interval[1]}
                    </div>
                    {days.map((day, dayIndex) => {
                      const currentHo = watch('_ho');
                      const isChecked = currentHo && currentHo.some(
                        (ho) => ho[0] === dayIndex + 1 && ho[1] === timeIndex
                      );
                      return (
                        <label
                          key={dayIndex}
                          className={`flex items-center justify-center p-2 rounded-lg cursor-pointer ring-1 ring-transparent hover:bg-primary/10 transition-colors ${isChecked ? 'bg-primary/20 ring-primary' : 'bg-background-light dark:bg-background-dark'}`}
                        >
                          <input
                            className="form-checkbox hidden"
                            type="checkbox"
                            checked={isChecked || false}
                            onChange={() => handleTimeSlotChange(dayIndex + 1, timeIndex)}
                          />
                          <span className="text-xs font-medium">&ensp;</span>
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
              <span className="truncate">Salvar Alterações</span>
            </button>
            <button
              className="flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary border border-border-light dark:border-border-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-colors"
              type="button"
              onClick={handleCancel}
            >
              <span className="truncate">Cancelar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisciplinaForm;