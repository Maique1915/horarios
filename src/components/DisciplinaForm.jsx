import React, { useEffect, useCallback } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner, { SavingSpinner } from './LoadingSpinner';

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
}) => {
  const { handleSubmit, register, control, setValue, watch, reset, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: blankForm,
  });

  const getPrerequisiteOptions = useCallback(() => {
    if (!disciplinas) return [];
    const currentSemester = watch('_se');
    const activeDisciplinas = disciplinas.filter(d => d._ag && d._se < currentSemester);
    const uniquePrerequisites = Array.from(new Set(activeDisciplinas.map(d => d._re)));
    return uniquePrerequisites.map(re => ({ value: re, label: `${re} - ${activeDisciplinas.find(d => d._re === re)?._di || ''}` }));
  }, [disciplinas, watch]);

  // Função para resetar o formulário completamente
  const handleCancel = () => {
    // Reseta o formulário para um estado completamente "vazio"
    reset(blankForm);

    // Chama a função onCancel original se existir
    if (onCancel) {
      onCancel();
    }
  };

  // Atualiza o formulário quando a disciplina prop muda (para edição)
  useEffect(() => {
    if (disciplina) {
      const numericPrerequisites = disciplina._pr.filter(pr => typeof pr === 'number');
      const stringPrerequisites = disciplina._pr.filter(pr => typeof pr === 'string');

      reset({
        ...disciplina,
        _pr: stringPrerequisites,
        _pr_creditos_input: disciplina._pr_creditos_input !== undefined
          ? disciplina._pr_creditos_input
          : (numericPrerequisites.length > 0 ? numericPrerequisites[0] : 0),
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
    <div className="w-full"> {/* Layout changed to full width since right column is removed */}
      <div className="rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitHandler)}>
          <h3 className="text-xl font-bold">Formulário de disciplina</h3>

          <div className="grid grid-cols-12 gap-6">
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
              className="col-span-6 lg:col-span-2 flex flex-col"
            />
            <FormField
              label="Sigla"
              id="_re"
              type="text"
              placeholder="ex: CIC123"
              required
              register={register}
              disabled={isReviewing}
              className="col-span-6 lg:col-span-2 flex flex-col"
            />
            <FormField
              label="Disciplina"
              id="_di"
              type="text"
              placeholder="ex: Introdução à Programação"
              required
              register={register}
              disabled={isReviewing}
              className="col-span-12 lg:col-span-8 flex flex-col"
            />

            <FormField
              label="Créditos práticos"
              id="_ap"
              type="number"
              placeholder="3"
              required
              register={register}
              valueAsNumber
              disabled={isReviewing}
              className="col-span-4 lg:col-span-2 flex flex-col"
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
              className="col-span-4 lg:col-span-2 flex flex-col"
            />
            <FormField
              label="Créditos mínimos"
              id="_pr_creditos_input"
              type="number"
              placeholder="0"
              register={register}
              valueAsNumber
              disabled={isReviewing}
              className="col-span-4 lg:col-span-2 flex flex-col"
            />

            <div className="col-span-12 lg:col-span-6 flex flex-row items-end gap-6 pb-2">
              <Toggle label="Eletiva" id="_el" register={register} checked={watch('_el')} disabled={isReviewing} />
              <Toggle label="Ativa" id="_ag" register={register} checked={watch('_ag')} disabled={isReviewing} />
            </div>

            <div className='col-span-12 flex flex-col'>
              <label className="block mb-2 text-sm font-medium" htmlFor="_pr">
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
  );
};

export default DisciplinaForm;