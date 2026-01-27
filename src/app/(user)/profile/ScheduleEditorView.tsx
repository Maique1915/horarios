import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../../../lib/supabaseClient';
import Comum from '../../../components/shared/Comum';
import { Subject } from '@/types/Subject';
import { loadDbData } from '../../../services/disciplinaService';

interface ScheduleEditorViewProps {
    currentEnrollments: Subject[];
    userCourseCode: string;
    onClose: () => void;
    onSave?: (enrollments: Subject[]) => void;
}

interface Course {
    id: number;
    code: string;
    name: string;
}

interface SubjectOption {
    value: number;
    label: string;
    subject: Subject;
}

export const ScheduleEditorView = ({ currentEnrollments, userCourseCode, onClose, onSave }: ScheduleEditorViewProps) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);

    // Converter currentEnrollments para o formato correto com _classSchedules
    const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>(() => {
        const converted = currentEnrollments.map((enrollment: Subject) => {
            // Converter schedule_data para _classSchedules
            const classSchedules = enrollment.class_name ? [{
                class_name: enrollment.class_name,
                ho: enrollment.schedule_data || [],
                da: [],
                rt: []
            }] : [];

            return {
                ...enrollment,
                _classSchedules: classSchedules
            };
        });

        console.log('🎓 Disciplinas iniciais (currentEnrollments):', {
            total: converted.length,
            disciplinas: converted.map(s => ({
                nome: s._di,
                turma: s.class_name,
                horarios: s._classSchedules
            }))
        });

        return converted;
    });
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Carregar cursos disponíveis e pré-selecionar o curso do usuário
    useEffect(() => {
        const fetchCourses = async () => {
            const { data, error } = await supabase
                .from('courses')
                .select('id, code, name')
                .order('name');

            if (data && !error) {
                setCourses(data);
                // Pré-selecionar o curso do usuário
                const userCourse = data.find(c => c.code === userCourseCode);
                if (userCourse) {
                    setSelectedCourse(userCourse);
                }
            }
        };
        fetchCourses();
    }, [userCourseCode]);

    // Carregar disciplinas do curso selecionado usando o serviço
    useEffect(() => {
        if (!selectedCourse) {
            setAvailableSubjects([]);
            return;
        }

        const fetchSubjects = async () => {
            setLoading(true);
            try {
                // Usar o serviço loadDbData que já faz todo o processamento de classes e requisitos
                const data = await loadDbData(selectedCourse.code);

                // Filtrar apenas disciplinas que possuem turmas cadastradas
                const subjectsWithClasses = data.filter(s => s._classSchedules && s._classSchedules.length > 0);

                setAvailableSubjects(subjectsWithClasses);
            } catch (err) {
                console.error('Error fetching subjects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [selectedCourse]);

    // Função auxiliar para processar as turmas
    const processClasses = (classes: any[]) => {
        if (!classes || classes.length === 0) return [];

        // Agrupar por nome da turma
        const classesMap = new Map<string, any>();

        classes.forEach(c => {
            const className = c.class;
            if (!classesMap.has(className)) {
                classesMap.set(className, {
                    class_name: className,
                    ho: [],
                    da: [],
                    rt: []
                });
            }

            const classData = classesMap.get(className)!;
            classData.ho.push([c.day_id, c.time_slot_id]);
        });

        return Array.from(classesMap.values());
    };

    const handleAddSubject = (subject: Subject) => {
        // Verificar se já está adicionada
        if (selectedSubjects.some(s => s._id === subject._id)) {
            alert('Esta disciplina já está na sua grade!');
            return;
        }

        setSelectedSubjects([...selectedSubjects, subject]);
    };

    const handleRemoveSubject = (subjectId: number) => {
        setSelectedSubjects(selectedSubjects.filter((s: Subject) => s._id !== subjectId));
    };

    // Preparar disciplinas para exibição na grade
    // O componente Comum espera que cada turma seja uma entrada separada
    const prepareSubjectsForGrid = (subjects: Subject[]) => {
        // Sempre retornar um array, mesmo que vazio
        if (!subjects || subjects.length === 0) {
            console.log('📊 Nenhuma disciplina selecionada');
            return [];
        }

        const gridData: any[] = [];

        subjects.forEach((subject: Subject) => {
            if (subject._classSchedules && subject._classSchedules.length > 0) {
                // Para cada turma, criar uma entrada separada
                subject._classSchedules.forEach((classSchedule: any) => {
                    gridData.push({
                        ...subject,
                        _di: subject._di, // Nome da disciplina
                        class_name: classSchedule.class_name,
                        _ho: classSchedule.ho,
                        _rt: classSchedule.rt || [],
                        _da: classSchedule.da || []
                    });
                });
            }
        });

        console.log('📊 Dados preparados para a grade:', {
            totalDisciplinas: subjects.length,
            totalTurmas: gridData.length,
            disciplinas: subjects.map(s => s._di),
            turmas: gridData.map(g => `${g._di} - ${g.class_name}`)
        });

        return gridData;
    };

    const filteredSubjects = availableSubjects.filter((subject: Subject) => {
        // Filtro de Semestre
        if (selectedSemester !== null && subject._se !== selectedSemester) return false;

        // Filtro de Busca
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            subject._di?.toLowerCase().includes(query) ||
            subject._re?.toLowerCase().includes(query)
        );
    });

    const subjectOptions: SubjectOption[] = filteredSubjects.map((subject: Subject) => ({
        value: subject._id as number,
        label: `${subject._re} - ${subject._di} (${subject._se}º Período)`,
        subject
    }));

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header omitted for brevity - logic remains same */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-1">
                            Editor de Grade
                        </h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary">
                            Customize sua grade atual adicionando ou removendo disciplinas
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all font-medium"
                        >
                            <span className="material-symbols-outlined text-lg">add_circle</span>
                            Adicionar Matéria
                        </button>
                        <button
                            onClick={onClose}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium border border-slate-200 dark:border-slate-700"
                        >
                            <span className="material-symbols-outlined text-lg">logout</span>
                            Sair do Editor
                        </button>
                    </div>
                </div>

                {/* Main Content - Full Width Grid */}
                <div className="w-full">
                    {selectedSubjects.length > 0 ? (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark shadow-2xl overflow-hidden animate-fadeIn">
                            <div className="p-0 overflow-x-auto">
                                <Comum
                                    materias={prepareSubjectsForGrid(selectedSubjects)}
                                    tela={1}
                                    cur={userCourseCode}
                                    hideSave={false}
                                    fun={
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl whitespace-nowrap border border-slate-200 dark:border-slate-700">
                                                {selectedSubjects.length} {selectedSubjects.length === 1 ? 'Matéria' : 'Matérias'}
                                            </div>
                                        </div>
                                    }
                                    g=""
                                    f="Sua Grade de Horários"
                                    separa={false}
                                    noCard={true}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-dashed border-border-light dark:border-border-dark shadow-sm p-20 text-center animate-fadeIn">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 font-light">calendar_add_on</span>
                            </div>
                            <h3 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-3">Sua grade está vazia</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">
                                Clique no botão acima para buscar e adicionar disciplinas do seu curso ou de outros cursos à sua grade.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all font-bold"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Começar a Adicionar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Add Subjects Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-border-light dark:border-border-dark flex flex-col max-h-[90vh] animate-slideUp">
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">add_circle</span>
                                Adicionar Novas Disciplinas
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-6">
                                {/* Filters Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Course Selection */}
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                                            CURSO
                                        </label>
                                        <Select
                                            placeholder="Selecione..."
                                            options={courses.map((c: Course) => ({
                                                value: c.id,
                                                label: `${c.code.toUpperCase()} - ${c.name}`
                                            }))}
                                            onChange={(opt: any) => {
                                                const course = courses.find((c: Course) => c.id === opt?.value);
                                                setSelectedCourse(course || null);
                                            }}
                                            value={selectedCourse ? {
                                                value: selectedCourse.id,
                                                label: `${selectedCourse.code.toUpperCase()} - ${selectedCourse.name}`
                                            } : null}
                                            isClearable
                                            classNamePrefix="select"
                                            classNames={{
                                                control: () => '!border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-xl !text-sm !min-h-[44px] !shadow-sm',
                                                menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-xl !mt-2 !shadow-xl !overflow-hidden !z-50',
                                                option: ({ isFocused }: any) => `!text-sm !p-3 ${isFocused ? '!bg-slate-100 dark:!bg-slate-700' : ''} !text-slate-800 dark:!text-slate-200 cursor-pointer`,
                                                singleValue: () => '!text-slate-800 dark:!text-slate-200',
                                                placeholder: () => '!text-slate-400'
                                            }}
                                        />
                                    </div>

                                    {/* Semester Selection */}
                                    <div className="md:col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                                            PERÍODO
                                        </label>
                                        <Select
                                            placeholder="Todos os períodos"
                                            value={selectedSemester ? { value: selectedSemester, label: `${selectedSemester}º Período` } : { value: null, label: 'Todos os períodos' }}
                                            options={[
                                                { value: null, label: 'Todos os períodos' },
                                                ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}º Período` }))
                                            ]}
                                            onChange={(opt: any) => setSelectedSemester(opt?.value || null)}
                                            isClearable
                                            classNamePrefix="select"
                                            classNames={{
                                                control: () => '!border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-xl !text-sm !min-h-[44px] !shadow-sm',
                                                menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-xl !mt-2 !shadow-xl !overflow-hidden !z-50',
                                                option: ({ isFocused }: any) => `!text-sm !p-3 ${isFocused ? '!bg-slate-100 dark:!bg-slate-700' : ''} !text-slate-800 dark:!text-slate-200 cursor-pointer`,
                                                singleValue: () => '!text-slate-800 dark:!text-slate-200',
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Search Input */}
                                <div className="animate-fadeIn">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                                        BUSCAR POR NOME OU CÓDIGO
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-xl transition-colors group-focus-within:text-primary">search</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Ex: Cálculo I, INF100..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary text-sm outline-none transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                {/* Subjects List */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4 pl-1">
                                        <h3 className="text-sm font-bold text-text-light-secondary dark:text-text-dark-secondary flex items-center gap-2">
                                            RESULTADOS
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                {filteredSubjects.length}
                                            </span>
                                        </h3>
                                        {availableSubjects.length > filteredSubjects.length && (
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSelectedSemester(null);
                                                }}
                                                className="text-xs text-primary hover:underline font-bold"
                                            >
                                                Limpar Filtros
                                            </button>
                                        )}
                                    </div>

                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                            <div className="relative w-12 h-12">
                                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-4 font-medium italic">Sintonizando disciplinas...</p>
                                        </div>
                                    ) : selectedCourse ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                                            {filteredSubjects.length === 0 ? (
                                                <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                                    <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-4 font-light animate-pulse">search_off</span>
                                                    <h4 className="text-slate-500 font-bold mb-1">Nenhuma disciplina encontrada</h4>
                                                    <p className="text-slate-400 text-xs px-8">
                                                        Tente ajustar sua busca ou mudar o período. Apenas disciplinas com turmas cadastradas são exibidas.
                                                    </p>
                                                </div>
                                            ) : (
                                                filteredSubjects.map((subject: Subject) => {
                                                    const isSelected = selectedSubjects.some((s: Subject) => s._id === subject._id);
                                                    return (
                                                        <div
                                                            key={subject._id}
                                                            className={`p-4 rounded-xl border transition-all duration-300 flex justify-between items-center group
                                                                ${isSelected
                                                                    ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                                                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
                                                                }`}
                                                        >
                                                            <div className="flex-1 min-w-0 pr-3">
                                                                <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-primary' : 'text-text-light-primary dark:text-text-dark-primary'}`}>
                                                                    {subject._di}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-600">
                                                                        {subject._re}
                                                                    </span>
                                                                    <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                                                                    <span className="text-[10px] font-bold text-slate-400">
                                                                        {subject._se}º Período
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => isSelected ? handleRemoveSubject(subject._id as number) : handleAddSubject(subject)}
                                                                className={`p-2.5 rounded-xl transition-all flex-shrink-0
                                                                    ${isSelected
                                                                        ? 'text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                                                                        : 'text-primary bg-primary/5 hover:bg-primary/15'
                                                                    }`}
                                                                title={isSelected ? "Remover" : "Adicionar"}
                                                            >
                                                                <span className="material-symbols-outlined text-2xl">
                                                                    {isSelected ? 'do_not_disturb_on' : 'add_circle'}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-700 mb-4 font-light">school</span>
                                            <p className="text-slate-500 font-bold text-center px-10">
                                                Selecione um curso para começar a listar as disciplinas disponíveis.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl flex justify-between items-center text-xs text-slate-500 font-medium">
                            <p>As disciplinas adicionadas aparecerão instantaneamente na sua grade ao fundo.</p>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-primary hover:underline font-bold"
                            >
                                Concluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
