'use client';
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Select from 'react-select';
import { supabase } from '../../lib/supabaseClient';
import { DbEquivalency } from '../../services/disciplinaService';

const formSchema = z.object({
    course_id: z.number().optional().nullable(),
    target_subject_id: z.number().min(1, "Selecione a disciplina alvo"),
    source_subject_ids: z.array(z.number()).min(1, "Selecione ao menos uma disciplina de origem"),
});

type FormData = z.infer<typeof formSchema>;

interface EquivalencyFormProps {
    initialData?: DbEquivalency;
    onSave: (data: Partial<DbEquivalency>) => void;
    onCancel: () => void;
}

export default function EquivalencyForm({ initialData, onSave, onCancel }: EquivalencyFormProps) {
    const [courses, setCourses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [targetPeriod, setTargetPeriod] = useState<number | null>(null);
    const [sourcePeriod, setSourcePeriod] = useState<number | null>(null);
    const [targetCourseId, setTargetCourseId] = useState<number | null>(null);
    const [sourceCourseId, setSourceCourseId] = useState<number | null>(null);

    const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            course_id: initialData?.course_id || null,
            target_subject_id: initialData?.target_subject_id || 0,
            source_subject_ids: [], // Handled by effect below or parent
        }
    });

    const selectedCourseId = watch('course_id');
    const selectedTargetId = watch('target_subject_id');


    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (initialData && subjects.length > 0) {
            reset({
                course_id: initialData.course_id,
                target_subject_id: initialData.target_subject_id,
                source_subject_ids: [initialData.source_subject_id],
            });

            // Set target filters
            const targetSubject = subjects.find(s => s.id === initialData.target_subject_id);
            if (targetSubject) {
                setTargetCourseId(targetSubject.course_id);
                setTargetPeriod(targetSubject.semester);
            }

            // Set source filters
            const sourceSubject = subjects.find(s => s.id === initialData.source_subject_id);
            if (sourceSubject) {
                setSourceCourseId(sourceSubject.course_id);
                setSourcePeriod(sourceSubject.semester);
            }
        }
    }, [initialData, reset, subjects]);


    const fetchCourses = async () => {
        setLoadingCourses(true);
        const { data } = await supabase.from('courses').select('id, code, name').order('name');
        if (data) setCourses(data);
        setLoadingCourses(false);
    };

    const fetchSubjects = async () => {
        setLoadingSubjects(true);
        const { data, error } = await supabase
            .from('subjects')
            .select('id, acronym, name, semester, course_id, courses(code)')
            .order('name');

        if (error) {
            console.error('Error fetching subjects:', error);
        } else if (data) {
            setSubjects(data);
        }
        setLoadingSubjects(false);
    };
    const onSubmit = (data: FormData) => {
        onSave({
            id: initialData?.id,
            course_id: data.course_id ?? null,
            target_subject_id: data.target_subject_id,
            source_subject_ids: data.source_subject_ids,
        } as any);
    };

    const allPeriods = Array.from(new Set(subjects.map(s => s.semester))).filter(Boolean).sort((a, b) => a - b);
    const periodOptions = allPeriods.map(p => ({ value: p, label: `${p}º P` }));

    const getFilteredOptions = (periodFilter: number | null, courseFilter: number | null) => {
        let filtered = subjects;
        if (periodFilter) {
            filtered = filtered.filter(s => s.semester === periodFilter);
        }
        if (courseFilter) {
            filtered = filtered.filter(s => s.course_id === courseFilter);
        }
        return filtered.map(s => ({
            value: s.id,
            label: `${s.acronym} - ${s.name}${s.courses ? ` (${s.courses.code})` : ''}`
        }));
    };

    const targetSubjectOptions = getFilteredOptions(targetPeriod, targetCourseId);
    const sourceSubjectOptions = getFilteredOptions(sourcePeriod, sourceCourseId);

    const courseOptions = courses.map(c => ({
        value: c.id,
        label: `${c.code} - ${c.name}`
    }));

    const targetCourseOptions = courseOptions.filter(opt => opt.value !== sourceCourseId);
    const sourceCourseOptions = courseOptions.filter(opt => opt.value !== targetCourseId);


    // Custom styles for react-select to match Tailwind dark mode
    const selectStyles = {
        control: (base: any, state: any) => ({
            ...base,
            backgroundColor: 'transparent',
            borderColor: state.isFocused ? '#3b82f6' : '#94a3b8',
            borderRadius: '0.75rem',
            padding: '2px',
            color: 'inherit',
            boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
            '&:hover': {
                borderColor: '#3b82f6'
            }
        }),
        input: (base: any) => ({
            ...base,
            color: 'inherit'
        }),
        placeholder: (base: any) => ({
            ...base,
            color: '#94a3b8' // slate-400
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: 'var(--surface-main, #fff)',
            zIndex: 50,
            borderRadius: '0.75rem',
            border: '1px solid #94a3b830',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#3b82f620' : 'transparent',
            color: state.isSelected ? '#fff' : 'inherit',
            cursor: 'pointer',
            fontSize: '0.875rem',
            padding: '10px 12px'
        }),
        singleValue: (base: any) => ({
            ...base,
            color: 'inherit'
        }),
        noOptionsMessage: (base: any) => ({
            ...base,
            color: '#94a3b8',
            padding: '20px',
            fontSize: '0.875rem'
        })
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
                {/* The "Equation" Block */}
                <div className="flex flex-col gap-4">
                    {/* Target Section (Top) */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">1</span>
                            Disciplina Alvo (O que ele ganha) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col gap-2.5">
                            {/* Filters Row */}
                            <div className="grid grid-cols-2 gap-2">
                                <Select
                                    options={targetCourseOptions}
                                    placeholder="Curso"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={selectStyles}
                                    value={targetCourseOptions.find(opt => opt.value === targetCourseId)}
                                    onChange={(val) => setTargetCourseId(val ? val.value : null)}
                                    isClearable
                                />
                                <Select
                                    options={periodOptions}
                                    placeholder="Período"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={selectStyles}
                                    value={periodOptions.find(opt => opt.value === targetPeriod)}
                                    onChange={(val) => setTargetPeriod(val ? val.value : null)}
                                    isClearable
                                />
                            </div>

                            {/* Subject Search Row */}
                            <div className="relative">
                                <Controller
                                    name="target_subject_id"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            options={targetSubjectOptions}
                                            isLoading={loadingSubjects}
                                            placeholder="Busque a disciplina alvo..."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            styles={selectStyles}
                                            value={targetSubjectOptions.find(opt => opt.value === field.value)}
                                            onChange={(val) => field.onChange(val?.value)}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        {errors.target_subject_id && (
                            <p className="mt-1 text-xs text-red-500">{errors.target_subject_id.message}</p>
                        )}
                    </div>

                    {/* Toggle Button Container (Magic Arrow) */}
                    <div className="flex flex-col items-center gap-2 -my-2 relative z-10">
                        <Controller
                            name="course_id"
                            control={control}
                            render={({ field }) => {
                                const targetSubject = subjects.find(s => s.id === selectedTargetId);
                                const isGlobal = !field.value;

                                return (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();

                                            if (isGlobal) {
                                                // Se tiver disciplina alvo, usa o curso dela. 
                                                // Se não tiver, ainda podemos marcar o "desejo" de ser regional (usando um valor temporário ou apenas avisando)
                                                if (targetSubject?.course_id) {
                                                    field.onChange(targetSubject.course_id);
                                                } else {
                                                    alert("Selecione primeiro a Disciplina Alvo para vincular a um curso específico.");
                                                }
                                            } else {
                                                field.onChange(null);
                                            }
                                        }}
                                        className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer hover:scale-110 active:scale-95 ${!isGlobal
                                            ? 'bg-primary text-white border-primary shadow-primary/40'
                                            : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-primary/50'
                                            }`}
                                        title={isGlobal ? "Clique para tornar este vínculo Regional (Mão Única)" : "Clique para tornar este vínculo Global (Mão Dupla)"}
                                    >
                                        <span className={`material-symbols-outlined text-2xl transition-all duration-500 ${!isGlobal ? 'rotate-0' : 'rotate-180'}`}>
                                            {!isGlobal ? 'arrow_upward' : 'swap_vert'}
                                        </span>
                                    </button>
                                );
                            }}
                        />
                        <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${selectedCourseId ? 'text-primary' : 'text-slate-400'}`}>
                            {selectedCourseId ? 'Regional' : 'Global'}
                        </span>
                    </div>

                    {/* Source Section (Bottom) */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[10px]">2</span>
                            Disciplina(s) de Origem (O que ele já tem) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-col gap-2.5">
                            {/* Filters Row */}
                            <div className="grid grid-cols-2 gap-2">
                                <Select
                                    options={sourceCourseOptions}
                                    placeholder="Curso"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={selectStyles}
                                    value={sourceCourseOptions.find(opt => opt.value === sourceCourseId)}
                                    onChange={(val) => setSourceCourseId(val ? val.value : null)}
                                    isClearable
                                />
                                <Select
                                    options={periodOptions}
                                    placeholder="Período"
                                    className="react-select-container"
                                    classNamePrefix="react-select"
                                    styles={selectStyles}
                                    value={periodOptions.find(opt => opt.value === sourcePeriod)}
                                    onChange={(val) => setSourcePeriod(val ? val.value : null)}
                                    isClearable
                                />
                            </div>

                            {/* Subject Search Row */}
                            <div className="relative">
                                <Controller
                                    name="source_subject_ids"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            isMulti
                                            options={sourceSubjectOptions}
                                            isLoading={loadingSubjects}
                                            placeholder="Busque as disciplinas de origem..."
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                            styles={selectStyles}
                                            value={sourceSubjectOptions.filter(opt => field.value?.includes(opt.value))}
                                            onChange={(opts) => field.onChange(opts ? opts.map(o => o.value) : [])}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                        {errors.source_subject_ids && (
                            <p className="mt-1 text-xs text-red-500">{errors.source_subject_ids.message}</p>
                        )}
                    </div>
                </div>

                {/* Info Block */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                    <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed font-medium">
                        <strong>Lógica Ida e Volta:</strong> Ao criar este vínculo, o sistema entenderá automaticamente que se o aluno tiver as origens, ele concluiu o destino (e vice-versa).
                    </p>
                </div>
            </div>

            {/* Group ID is now automatic */}

            <div className="flex items-center justify-end gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-1 sm:flex-none px-10 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                    {initialData ? 'Atualizar Vínculo' : 'Criar Vínculo'}
                </button>
            </div>
        </form>
    );
}
