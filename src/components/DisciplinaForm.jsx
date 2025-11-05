import React from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

const DisciplinaForm = ({
  disciplina,
  onInputChange,
  onHoChange,
  onSubmit,
  onCancel,
  getPrerequisiteOptions,
  days,
  timeIntervals,
  handleTimeSlotToggle,
  cur
}) => {
  const { handleSubmit, register, control, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: disciplina,
  });

  return (
    <div className="lg:col-span-2">
      <div className="sticky top-8 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm p-6">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
          <h3 className="text-xl font-bold">Formulário de disciplina</h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-1 flex flex-col">
                <label className="block mb-2 text-sm font-medium" htmlFor="numeric-period">
                  Semestre
                </label>
                <input
                  className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                  id="numericPeriod"
                  type="number"
                  placeholder="e.g., 1"
                  value={disciplina._se}
                  onChange={(e) => onInputChange(e, '_se')}
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
                  value={disciplina._di}
                  onChange={(e) => onInputChange(e, '_di')}
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
                  value={disciplina._re}
                  onChange={(e) => onInputChange(e, '_re')}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label htmlFor="_el_edit" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="_el_edit"
                      className="sr-only"
                      checked={disciplina._el}
                      onChange={(e) => onInputChange(e, '_el')}
                    />
                    <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${disciplina._el ? 'translate-x-full bg-primary' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Eletiva</span>
                </label>

                <label htmlFor="_ag_edit" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="_ag_edit"
                      className="sr-only"
                      checked={disciplina._ag}
                      onChange={(e) => onInputChange(e, '_ag')}
                    />
                    <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${disciplina._ag ? 'translate-x-full bg-primary' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">Ativa</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium" htmlFor="credit-hours">
                    Créditos práticos
                  </label>
                  <input
                    className="form-input w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                    id="_ap"
                    type="number"
                    placeholder="3"
                    value={disciplina._ap}
                    onChange={(e) => onInputChange(e, '_ap')}
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
                    value={disciplina._at}
                    onChange={(e) => onInputChange(e, '_at')}
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
                value={getPrerequisiteOptions().filter(option => disciplina._pr.includes(option.value))}
                onChange={(selectedOptions) => onInputChange({ target: { value: selectedOptions, type: 'select-multi' } }, '_pr')}
                className="w-full rounded-lg border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary"
                id="_pr"
                classNamePrefix="select"
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium">Horários</label>
              <div className={`grid grid-cols-${days.length} gap-2 text-center text-xs`}>
                {days.map((day, index) => (
                  <div key={`header-${index}`} className="font-medium text-text-light-secondary dark:text-text-dark-secondary">
                    {day}
                  </div>
                ))}
                <div className={`col-span-${days.length} border-t border-border-light dark:border-border-dark my-1`}></div>
                {timeIntervals.map((interval, timeIndex) => (
                  <React.Fragment key={timeIndex}>
                    <div className="flex items-center justify-center font-medium text-text-light-secondary dark:text-text-dark-secondary">
                      {interval[0]} - {interval[1]}
                    </div>
                    {days.slice(1).map((day, dayIndex) => {
                      const isChecked = disciplina._ho.some(
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
                            checked={isChecked}
                            onChange={() => handleTimeSlotToggle(dayIndex + 1, timeIndex)}
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
              <span className="truncate">Save Changes</span>
            </button>
            <button
              className="flex-1 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary border border-border-light dark:border-border-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-colors"
              type="button"
              onClick={onCancel}
            >
              <span className="truncate">Cancel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisciplinaForm;
