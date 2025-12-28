import React, { useEffect, useCallback } from 'react';
import Select from 'react-select';
// import makeAnimated from 'react-select/animated'; // Removing unused animated components to simplify bundle if not critical
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// const animatedComponents = makeAnimated();

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

const FormField = ({ label, id, type = "text", placeholder, maxLength, required, register, valueAsNumber = false, className = "lg:col-span-1 flex flex-col", disabled = false, error }) => (
  <div className={className}>
    <label className="block mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300" htmlFor={id}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`form-input w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-900 transition-all ${error ? 'border-red-500 dark:border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''}`}
      id={id}
      type={type}
      placeholder={placeholder}
      maxLength={maxLength}
      required={required}
      disabled={disabled}
      {...register(id, { valueAsNumber: valueAsNumber })}
    />
    {error && <span className="text-xs text-red-500 mt-1 font-medium">{error.message}</span>}
  </div>
);

const Toggle = ({ label, id, register, checked, disabled = false }) => (
  <label htmlFor={id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
    <div className={`relative w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}>
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        disabled={disabled}
        {...register(id)}
      />
      <div
        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-[20px]' : 'translate-x-0'}`}
      ></div>
    </div>
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">{label}</span>
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
    const currentId = watch('_re');
    // Filter active disciplines, avoid self-reference
    const activeDisciplinas = disciplinas.filter(d =>
      d._ag &&
      d._se < currentSemester &&
      d._re !== currentId
    );
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

  const isEditing = !!disciplina?._id || !!disciplina?._re;

  // Custom styles for react-select to match the design system
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      boxShadow: 'none',
    })
  };

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-xl shadow-slate-200/50 dark:shadow-black/20 p-6 lg:p-8">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmitHandler)}>
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4 mb-2">
            <h3 className="text-xl font-bold font-display text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className={`material-symbols-outlined rounded-lg p-1.5 ${isEditing ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-primary/10 text-primary'}`}>
                {isEditing ? 'edit' : 'add'}
              </span>
              {isEditing ? 'Editar Disciplina' : 'Nova Disciplina'}
            </h3>
            {isEditing && (
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500">
                {watch('_re')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-12 gap-5">
            <FormField
              label="Código (Sigla)"
              id="_re"
              type="text"
              placeholder="ex: CIC123"
              required
              register={register}
              disabled={isReviewing}
              error={errors._re}
              className="col-span-12 md:col-span-4 flex flex-col"
            />
            <FormField
              label="Semestre"
              id="_se"
              type="number"
              placeholder="1"
              maxLength="2"
              required
              register={register}
              valueAsNumber
              disabled={isReviewing}
              error={errors._se}
              className="col-span-12 md:col-span-4 flex flex-col"
            />
            <FormField
              label="Nome da Disciplina"
              id="_di"
              type="text"
              placeholder="ex: Introdução à Programação"
              required
              register={register}
              disabled={isReviewing}
              error={errors._di}
              className="col-span-12 flex flex-col"
            />

            <div className="col-span-12 md:col-span-6 flex gap-4">
              <FormField
                label="Teóricos"
                id="_at"
                type="number"
                placeholder="3"
                required
                register={register}
                valueAsNumber
                disabled={isReviewing}
                className="flex-1 flex flex-col"
              />
              <FormField
                label="Práticos"
                id="_ap"
                type="number"
                placeholder="3"
                required
                register={register}
                valueAsNumber
                disabled={isReviewing}
                className="flex-1 flex flex-col"
              />
            </div>

            <div className="col-span-12 md:col-span-6 flex flex-col justify-end pb-3">
              <br />
              <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <Toggle label="Obrigatória" id="_el" register={register} checked={watch('_el')} disabled={isReviewing} />
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <Toggle label="Ativa" id="_ag" register={register} checked={watch('_ag')} disabled={isReviewing} />
              </div>
            </div>

            <div className='col-span-12 flex flex-col'>
              <label className="block mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tipo de Pré-requisito
              </label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prereqType"
                    className="form-radio text-primary focus:ring-primary"
                    checked={!watch('_pr_creditos_input')} // If credits is 0 or undefined, assume subjects mode (default)
                    onChange={() => {
                      setValue('_pr_creditos_input', 0);
                    }}
                    disabled={isReviewing}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Disciplinas</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="prereqType"
                    className="form-radio text-primary focus:ring-primary"
                    checked={watch('_pr_creditos_input') > 0}
                    onChange={() => {
                      setValue('_pr', []); // Clear subjects when switching to credits
                      setValue('_pr_creditos_input', 1); // Set default credits to 1 to activate mode
                    }}
                    disabled={isReviewing}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Créditos Mínimos</span>
                </label>
              </div>

              {/* Conditional Rendering based on Mode */}
              {watch('_pr_creditos_input') > 0 ? (
                <div className="animate-fadeIn">
                  <FormField
                    label="Quantidade de Créditos"
                    id="_pr_creditos_input"
                    type="number"
                    placeholder="Ex: 80"
                    register={register}
                    valueAsNumber
                    disabled={isReviewing}
                    className="flex flex-col"
                  />
                  <p className="text-xs text-slate-400 mt-1.5 px-1">
                    O aluno precisa ter completado esta quantidade de créditos para cursar a disciplina.
                  </p>
                </div>
              ) : (
                <div className="animate-fadeIn">
                  <Controller
                    name="_pr"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        isMulti
                        options={getPrerequisiteOptions()}
                        isDisabled={isReviewing}
                        value={getPrerequisiteOptions().filter(option =>
                          field.value && field.value.includes(option.value)
                        )}
                        onChange={(selectedOptions) => field.onChange(selectedOptions.map(option => option.value))}
                        className="w-full"
                        id="_pr"
                        placeholder="Selecione os pré-requisitos..."
                        classNames={{
                          control: () => '!border !border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-800 !rounded-xl !min-h-[42px] !shadow-none hover:!border-primary/50 !transition-colors',
                          menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-xl !mt-2 !shadow-xl !overflow-hidden !z-20',
                          option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200 !py-2',
                          multiValue: () => '!bg-primary/10 !rounded-lg !text-primary dark:!text-blue-300',
                          multiValueLabel: () => '!text-sm !font-medium !text-primary dark:!text-blue-300',
                          multiValueRemove: () => 'hover:!bg-primary/20 hover:!text-primary-dark !rounded-r-lg',
                          placeholder: () => '!text-slate-400'
                        }}
                        styles={customSelectStyles}
                      />
                    )}
                  />
                  <p className="text-xs text-slate-400 mt-1.5 px-1">
                    Selecione as matérias que devem ser cursadas antes desta.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border-light dark:border-border-dark">
            {!isReviewing ? (
              <>
                <button
                  className="flex-1 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 transition-all active:scale-95"
                  type="button"
                  onClick={handleCancel}
                >
                  <span className="truncate">{isEditing ? 'Cancelar Edição' : 'Limpar'}</span>
                </button>
                <button
                  className="flex-[2] min-w-[140px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-6 bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[20px]">{isEditing ? 'save_as' : 'add_circle'}</span>
                  <span className="truncate">{isEditing ? 'Atualizar Disciplina' : 'Adicionar Disciplina'}</span>
                </button>
              </>
            ) : (
              <button
                className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-4 bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors"
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