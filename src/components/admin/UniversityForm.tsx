import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
});

type FormData = z.infer<typeof formSchema>;

interface University {
    id: number;
    name: string;
}

interface UniversityFormProps {
    initialData?: University;
    onSave: (data: any) => void;
    onCancel: () => void;
}

export default function UniversityForm({ initialData, onSave, onCancel }: UniversityFormProps) {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
        }
    });

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
            });
        } else {
            reset({
                name: '',
            });
        }
    }, [initialData, reset]);

    const onSubmit = (data: FormData) => {
        onSave(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Nome da Universidade <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    {...register('name')}
                    className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'
                        } bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary p-2.5 outline-none transition-all`}
                    placeholder="Ex: CEFET-RJ"
                />
                {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
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
                    {initialData ? 'Salvar Alterações' : 'Criar Universidade'}
                </button>
            </div>
        </form>
    );
}
