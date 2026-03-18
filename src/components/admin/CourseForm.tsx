import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Course } from './CoursesManager';
import { fetchAllUniversities, DbUniversity } from '../../model/universitiesModel';

const formSchema = z.object({
    code: z.string().min(2, "O código deve ter pelo menos 2 caracteres"),
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    shift: z.string().min(1, "O turno é obrigatório").or(z.literal('')).transform(val => val || null).nullable(),
    university_id: z.coerce.number().positive("A universidade é obrigatória").nullable().refine(val => val !== null && val > 0, {
        message: "A universidade é obrigatória"
    }),
    needs_complementary_activities: z.boolean().default(false),
    credit_categories: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "O nome da categoria é obrigatório"),
        required_hours: z.coerce.number().min(0, "As horas devem ser um número positivo"),
    })).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface CourseFormProps {
    initialData?: Course;
    onSave: (data: any) => void;
    onCancel: () => void;
}

export default function CourseForm({ initialData, onSave, onCancel }: CourseFormProps) {
    const [universities, setUniversities] = useState<DbUniversity[]>([]);

    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: '',
            name: '',
            shift: '',
            university_id: null,
            needs_complementary_activities: false,
            credit_categories: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "credit_categories"
    });

    useEffect(() => {
        const loadUniversities = async () => {
            try {
                const data = await fetchAllUniversities();
                setUniversities(data);
            } catch (error) {
                console.error('Error loading universities:', error);
            }
        };
        loadUniversities();
    }, []);

    useEffect(() => {
        if (initialData) {
            reset({
                code: initialData.code,
                name: initialData.name,
                shift: initialData.shift || '',
                // @ts-ignore
                university_id: initialData.university_id || null,
                // @ts-ignore
                needs_complementary_activities: !!initialData.needs_complementary_activities,
                credit_categories: Array.isArray(initialData.credit_categories) ? initialData.credit_categories : [],
            });
        } else {
            reset({
                code: '',
                name: '',
                shift: '',
                university_id: null,
                needs_complementary_activities: false,
                credit_categories: [],
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: FormData) => {
        onSave(data);
    };

    const onError = (errors: any) => {
        console.error('Form Validation Errors:', JSON.stringify(errors, null, 2));
        
        // Try to find the first field with an error
        const flattenErrors = (obj: any, prefix = ''): string[] => {
            const msgs: string[] = [];
            for (const key in obj) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (obj[key]?.message) {
                    msgs.push(`${fullKey}: ${obj[key].message}`);
                } else if (typeof obj[key] === 'object') {
                    msgs.push(...flattenErrors(obj[key], fullKey));
                }
            }
            return msgs;
        };

        const allErrors = flattenErrors(errors);
        if (allErrors.length > 0) {
            alert(`Erro de validação:\n\n${allErrors.slice(0, 3).join('\n')}`);
        }
    };

    const addCategory = () => {
        const nextId = fields.length + 1;
        append({ id: String(nextId), name: '', required_hours: 0 });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Código <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    {...register('code')}
                    className={`w-full rounded-xl border ${errors.code ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                        } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary p-2.5 outline-none transition-all`}
                    placeholder="Ex: ENGCOMP"
                />
                {errors.code && (
                    <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome do Curso <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    {...register('name')}
                    className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                        } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary p-2.5 outline-none transition-all`}
                    placeholder="Ex: Engenharia da Computação"
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Universidade <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('university_id', { 
                            valueAsNumber: false,
                            setValueAs: (val) => val === '' ? null : (typeof val === 'string' ? parseInt(val, 10) : val)
                        })}
                        className={`w-full rounded-xl border ${errors.university_id ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary p-2.5 outline-none transition-all`}
                    >
                        <option value="">Selecione...</option>
                        {universities.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                    {errors.university_id && (
                        <p className="mt-1 text-xs text-red-500">{errors.university_id.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Turno <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('shift')}
                        className={`w-full rounded-xl border ${errors.shift ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary p-2.5 outline-none transition-all`}
                    >
                        <option value="">Selecione...</option>
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                        <option value="Noturno">Noturno</option>
                        <option value="Integral">Integral</option>
                    </select>
                    {errors.shift && (
                        <p className="mt-1 text-xs text-red-500">{errors.shift.message}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <input
                    type="checkbox"
                    id="needs_complementary_activities"
                    {...register('needs_complementary_activities')}
                    className="w-5 h-5 text-primary border-slate-300 dark:border-slate-700 rounded focus:ring-primary dark:focus:ring-primary/20 focus:ring-2 cursor-pointer transition-colors checked:bg-primary"
                />
                <label
                    htmlFor="needs_complementary_activities"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                >
                    Exige Atividades Complementares?
                </label>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Categorias de Créditos
                    </label>
                    <button
                        type="button"
                        onClick={addCategory}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-dark transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Adicionar Categoria
                    </button>
                </div>

                {fields.length === 0 && (
                    <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
                        Nenhuma categoria definida. Clique no botão acima para adicionar.
                    </div>
                )}

                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 group">
                            <div className="flex gap-2 items-start">
                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-xs font-mono text-slate-500 shrink-0 mt-1">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <input
                                        type="text"
                                        {...register(`credit_categories.${index}.name`)}
                                        className="w-full bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 p-0"
                                        placeholder="Nome da categoria (ex: Teórica)"
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">ID: {fields[index].id}</span>
                                        <input
                                            type="number"
                                            {...register(`credit_categories.${index}.required_hours`, { 
                                                valueAsNumber: true,
                                                setValueAs: (value) => {
                                                    if (value === '' || value === undefined || value === null) return 0;
                                                    const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
                                                    return isNaN(num) ? 0 : num;
                                                }
                                            })}
                                            className="w-20 bg-transparent border-none text-[10px] text-slate-400 focus:ring-0 p-0"
                                            placeholder="Horas req."
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="p-1 px-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                            {errors.credit_categories?.[index] && (
                                <div className="ml-10 mt-1">
                                    {errors.credit_categories[index]?.name && (
                                        <p className="text-[10px] text-red-500">{errors.credit_categories[index]?.name?.message}</p>
                                    )}
                                    {errors.credit_categories[index]?.required_hours && (
                                        <p className="text-[10px] text-red-500">{errors.credit_categories[index]?.required_hours?.message}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="flex-[2] px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                >
                    {initialData ? 'Salvar Alterações' : 'Criar Curso'}
                </button>
            </div>
        </form>
    );
}
