'use client';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import HorarioEditor from './HorarioEditor';
import { useAuth } from '../../contexts/AuthContext';
import ClassesTable, { ClassTableData } from './ClassesTable';

interface ClassRow {
    id?: number;
    subject_id: number;
    day_id: number;
    time_slot_id: number;
    class: string;
    start_real_time?: string;
    end_real_time?: string;
}

interface GroupedClass {
    className: string;
    subjectId: number;
    rows: ClassRow[];
}

interface Subject {
    id: number;
    name: string;
    acronym: string;
    course_id: number;
    semester: number;
}

interface Course {
    id: number;
    name: string;
    code: string;
}

export default function ClassesManager() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<GroupedClass[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

    // Selection state
    const [editingClass, setEditingClass] = useState<GroupedClass | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSubjectId, setFilterSubjectId] = useState<number | null>(null);
    const [filterSemester, setFilterSemester] = useState<number | null>(null);

    // Form state
    const [newClassSubjectId, setNewClassSubjectId] = useState<number | null>(null);
    const [newClassName, setNewClassName] = useState('');
    const [newClassSemesterFilter, setNewClassSemesterFilter] = useState<number | null>(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchCourses(), fetchSubjects(), fetchClasses()]);
            setLoading(false);
        };
        init();
    }, []);

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, name, code').order('name');
        if (data) {
            setCourses(data);
        }
    };

    const fetchSubjects = async () => {
        const { data } = await supabase.from('subjects').select('id, name, acronym, course_id, semester').order('name');
        if (data) setSubjects(data);
    };

    const fetchClasses = async () => {
        try {
            const { data, error } = await supabase.from('classes').select('*');
            if (error) throw error;

            // Group by 'class' name AND 'subject_id' to differentiate between courses
            const grouped: Record<string, GroupedClass> = {};
            (data as ClassRow[]).forEach(row => {
                const key = `${row.class}|${row.subject_id}`;
                if (!grouped[key]) {
                    grouped[key] = {
                        className: row.class,
                        subjectId: row.subject_id,
                        rows: []
                    };
                }
                grouped[key].rows.push(row);
            });

            setClasses(Object.values(grouped).sort((a, b) => a.className.localeCompare(b.className)));
        } catch (err) {
            console.error('Error fetching classes:', err);
            alert('Erro ao carregar turmas');
        }
    };

    const handleSave = async (data: { class_name: string; ho: number[][]; da: (string[] | null)[] }) => {
        if (!user) return;

        let className = data.class_name;
        const subjectId = editingClass ? editingClass.subjectId : newClassSubjectId;

        if (!subjectId) {
            alert("Erro: Disciplina não identificada.");
            return;
        }

        try {
            setLoading(true);
            const oldName = editingClass?.className || className;

            if (editingClass) {
                const { error: deleteError } = await supabase
                    .from('classes')
                    .delete()
                    .eq('class', editingClass.className);
                if (deleteError) throw deleteError;
            } else {
                // Creation Mode: Check for name collision ONLY in the current course
                const currentCourseSubjects = subjects
                    .filter(s => s.course_id === Number(selectedCourseId))
                    .map(s => s.id);

                const existingNamesInCourse = classes
                    .filter(c => currentCourseSubjects.includes(c.subjectId))
                    .map(c => c.className);

                if (existingNamesInCourse.includes(className)) {
                    // Try to find a unique suffix
                    let suffixChar = 66; // 'B' (65 is A)
                    let newName = className;

                    while (true) {
                        const suffix = ` - ${String.fromCharCode(suffixChar)}`;
                        const tryName = `${className}${suffix}`;

                        if (!existingNamesInCourse.includes(tryName)) {
                            newName = tryName;
                            break;
                        }

                        suffixChar++;
                        // Emergency break if too many (A-Z exhausted)
                        if (suffixChar > 90) { // Z
                            newName = `${className} - ${Date.now()}`; // Fallback timestamp
                            break;
                        }
                    }
                    className = newName;
                }

                // Only delete if we are SURE it's safe (e.g. if we just generated a new name that theoretically shouldn't exist, 
                // or if we are overwriting an exact match which shouldn't happen if we logic above is right).
                // But for safety, and since 'classes' table doesn't have unique constraint on class name (it seems),
                // we delete to avoid duplicate rows for the same class name if they somehow exist.
                const { error: deleteError } = await supabase
                    .from('classes')
                    .delete()
                    .eq('class', className);
                if (deleteError) throw deleteError;
            }

            const newRows = data.ho.map((slot, index) => {
                const dayId = slot[0];
                const timeSlotId = slot[1];
                const customTimes = data.da[index];

                return {
                    class: className,
                    subject_id: subjectId,
                    day_id: dayId,
                    time_slot_id: timeSlotId,
                    start_real_time: customTimes ? customTimes[0] : null,
                    end_real_time: customTimes ? customTimes[1] : null
                };
            });

            if (newRows.length > 0) {
                const { error: insertError } = await supabase
                    .from('classes')
                    .insert(newRows);
                if (insertError) throw insertError;
            }

            alert('Turma salva com sucesso!');
            await fetchClasses();

            setIsCreating(false);
            setEditingClass(null);
            setNewClassName('');
            setNewClassSubjectId(null);
            setNewClassSemesterFilter(null);

        } catch (err: any) {
            console.error('Error saving class:', err);
            alert('Erro ao salvar turma: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (className: string) => {
        if (!confirm(`Tem certeza que deseja excluir a turma "${className}"?`)) return;

        try {
            const { error } = await supabase.from('classes').delete().eq('class', className);
            if (error) throw error;
            fetchClasses();
            if (editingClass?.className === className) {
                setEditingClass(null);
            }
        } catch (err: any) {
            alert('Erro ao excluir: ' + err.message);
        }
    };

    const getEditorProps = (cls: GroupedClass) => {
        const ho: number[][] = [];
        const da: (string[] | null)[] = [];
        cls.rows.forEach(row => {
            ho.push([row.day_id, row.time_slot_id]);
            if (row.start_real_time || row.end_real_time) {
                da.push([row.start_real_time || '', row.end_real_time || '']);
            } else {
                da.push(null);
            }
        });
        return { ho, da };
    };

    // --- Filtering Logic ---
    const availableSubjects = subjects.filter(s =>
        selectedCourseId ? s.course_id === Number(selectedCourseId) : true
    );

    const filteredClasses = classes.filter(cls => {
        if (!selectedCourseId) return false;

        const subject = subjects.find(s => s.id === cls.subjectId);
        if (subject?.course_id !== Number(selectedCourseId)) return false;

        // Text Search (Class Name or Subject Name/Acronym)
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const matchName = cls.className.toLowerCase().includes(q);
            const matchSubject = subject ? (subject.name.toLowerCase().includes(q) || subject.acronym.toLowerCase().includes(q)) : false;

            if (!matchName && !matchSubject) return false;
        }

        // Subject Filter
        if (filterSubjectId && cls.subjectId !== filterSubjectId) return false;

        // Semester Filter
        if (filterSemester && subject?.semester !== filterSemester) return false;

        return true;
    });

    const getSubjectName = (id: number) => {
        const sub = subjects.find(s => s.id === id);
        return sub ? sub.name : String(id);
    };

    const getSubjectAcronym = (id: number) => {
        const sub = subjects.find(s => s.id === id);
        return sub ? sub.acronym : String(id);
    };

    const getSubjectSemester = (id: number) => {
        const sub = subjects.find(s => s.id === id);
        return sub ? sub.semester : 0;
    };

    // Render Panels
    const renderRightPanel = () => {
        // Sticky container to keep it in view
        const stickyClass = "sticky top-6";

        if (!selectedCourseId) {
            return (
                <div className={`${stickyClass} bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center text-gray-400`}>
                    <span className="material-symbols-outlined text-4xl mb-2">arrow_back</span>
                    <p>Selecione um curso para gerenciar turmas.</p>
                </div>
            );
        }

        if (isCreating) {
            return (
                <div className={`${stickyClass} bg-white dark:bg-gray-800 p-6 rounded-lg shadow`}>
                    <div className="flex items-center gap-2 mb-6 text-primary">
                        <span className="material-symbols-outlined">add</span>
                        <h3 className="text-lg font-bold">Nova Turma</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                                Período
                            </label>
                            <select
                                className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                value={newClassSemesterFilter || ''}
                                onChange={e => {
                                    setNewClassSemesterFilter(e.target.value ? Number(e.target.value) : null);
                                    setNewClassSubjectId(null); // Reset subject when period changes
                                }}
                            >
                                <option value="">Todos</option>
                                {[...new Set(availableSubjects.map(s => s.semester))].sort((a, b) => a - b).map(sem => (
                                    <option key={sem} value={sem}>{sem}º Período</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
                                Disciplina <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                                value={newClassSubjectId || ''}
                                onChange={e => {
                                    const sid = Number(e.target.value);
                                    setNewClassSubjectId(sid);
                                    const sub = subjects.find(s => s.id === sid);
                                    if (sub) setNewClassName(sub.name);
                                }}
                            >
                                <option value="">Selecione...</option>
                                {availableSubjects
                                    .filter(s => newClassSemesterFilter ? s.semester === newClassSemesterFilter : true)
                                    .map(s => (
                                        <option key={s.id} value={s.id}>{s.acronym} - {s.name}</option>
                                    ))}
                            </select>
                        </div>
                    </div>
                    {!newClassSubjectId && (
                        <p className="mt-[-16px] mb-4 text-xs text-slate-400 italic">Selecione o período e a disciplina para habilitar o editor.</p>
                    )}

                    {newClassSubjectId && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <HorarioEditor
                                initialClassName={newClassName}
                                initialHo={[]}
                                initialDa={[]}
                                onSave={handleSave}
                                onCancel={() => { setIsCreating(false); setNewClassSemesterFilter(null); }}
                                isReviewing={false}
                                courseId={selectedCourseId}
                            />
                        </div>
                    )}

                    {!newClassSubjectId && (
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => { setIsCreating(false); setNewClassSemesterFilter(null); }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-gray-700"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}
                </div>
            );
        }

        if (editingClass) {
            const { ho, da } = getEditorProps(editingClass);
            return (
                <div className={`${stickyClass} bg-white dark:bg-gray-800 p-6 rounded-lg shadow`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined">edit</span>
                            <h3 className="text-lg font-bold">Editar Turma</h3>
                        </div>
                        <button onClick={() => setEditingClass(null)} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <HorarioEditor
                        initialClassName={editingClass.className}
                        initialHo={ho}
                        initialDa={da}
                        onSave={handleSave}
                        onCancel={() => { setEditingClass(null); setNewClassSemesterFilter(null); }}
                        isReviewing={false}
                        courseId={selectedCourseId}
                    />
                </div>
            );
        }

        return (
            <div className={`${stickyClass} bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center text-gray-400 py-20 border-2 border-dashed border-gray-100 dark:border-gray-700`}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-primary">add_circle</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gerenciar Turmas</h3>
                    <p className="max-w-xs mx-auto text-sm">Selecione uma turma na lista para editar ou crie uma nova.</p>
                    <button
                        onClick={() => { setIsCreating(true); setNewClassSubjectId(null); setNewClassName(''); setNewClassSemesterFilter(null); }}
                        className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                    >
                        Criar Nova Turma
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <LoadingSpinner message="Carregando dados..." />;

    const selectedCourse = courses.find(c => c.id === Number(selectedCourseId));

    return (
        <div className="mx-auto max-w-[1920px] p-6 lg:p-8 space-y-8">
            {/* Top Bar: Selector */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-border-light dark:border-border-dark flex flex-col md:flex-row items-center gap-4">
                <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap">Gerenciar Turmas</h2>
                <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-2xl">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Curso:</span>
                    <select
                        value={selectedCourseId || ''}
                        onChange={e => {
                            setSelectedCourseId(e.target.value ? Number(e.target.value) : null);
                            setEditingClass(null);
                            setIsCreating(false);
                            setFilterSubjectId(null);
                            setFilterSemester(null);
                            setSearchQuery('');
                            setNewClassSemesterFilter(null);
                        }}
                        className="flex-1 p-2.5 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                    >
                        <option value="">Selecione um curso...</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedCourseId && selectedCourse && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Section */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-display font-bold leading-tight tracking-tight text-text-light-primary dark:text-text-dark-primary">
                                Editar Curso: {selectedCourse.code}
                            </h1>
                            <p className="text-base font-normal leading-normal text-text-light-secondary dark:text-text-dark-secondary">
                                Gerencie as turmas e horários deste curso.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => fetchClasses()}
                                className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-11 px-5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary text-sm font-bold shadow-sm hover:shadow-md transition-all group"
                            >
                                <span className="material-symbols-outlined text-xl group-hover:rotate-180 transition-transform duration-500">refresh</span>
                                <span className="truncate">Recarregar</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Left Column: List and Filters */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div className="rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                                {/* Filters Toolbar */}
                                <div className="p-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-900/20 grid grid-cols-1 sm:grid-cols-12 gap-4">
                                    {/* Semester Filter */}
                                    <div className="sm:col-span-3">
                                        <Select
                                            placeholder="Período"
                                            options={[...new Set(availableSubjects.map(s => s.semester))].sort((a, b) => a - b).map(sem => ({
                                                value: sem,
                                                label: `${sem}º Período`
                                            }))}
                                            value={filterSemester ? { value: filterSemester, label: `${filterSemester}º Período` } : null}
                                            onChange={(opt: any) => setFilterSemester(opt?.value || null)}
                                            isClearable
                                            classNamePrefix="select"
                                            classNames={{
                                                control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                                                menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                                                option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                                                singleValue: () => '!text-slate-800 dark:!text-slate-200',
                                                placeholder: () => '!text-slate-400'
                                            }}
                                            styles={{
                                                control: (base: any) => ({
                                                    ...base,
                                                    backgroundColor: 'transparent',
                                                    borderColor: 'transparent',
                                                    borderWidth: 0,
                                                    boxShadow: 'none',
                                                })
                                            }}
                                        />
                                    </div>

                                    {/* Subject Filter */}
                                    <div className="sm:col-span-4">
                                        <Select
                                            placeholder="Disciplina"
                                            options={availableSubjects.map(s => ({
                                                value: s.id,
                                                label: `${s.acronym} - ${s.name}`
                                            }))}
                                            value={filterSubjectId ? availableSubjects.find(s => s.id === filterSubjectId) ? {
                                                value: filterSubjectId,
                                                label: `${availableSubjects.find(s => s.id === filterSubjectId)!.acronym} - ${availableSubjects.find(s => s.id === filterSubjectId)!.name}`
                                            } : null : null}
                                            onChange={(opt: any) => setFilterSubjectId(opt?.value || null)}
                                            isClearable
                                            classNamePrefix="select"
                                            classNames={{
                                                control: () => '!border-slate-300 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !text-sm !min-h-[40px]',
                                                menu: () => '!bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-lg !mt-1',
                                                option: () => '!text-sm hover:!bg-slate-100 dark:hover:!bg-slate-700 !text-slate-800 dark:!text-slate-200',
                                                singleValue: () => '!text-slate-800 dark:!text-slate-200',
                                                placeholder: () => '!text-slate-400'
                                            }}
                                            styles={{
                                                control: (base: any) => ({
                                                    ...base,
                                                    backgroundColor: 'transparent',
                                                    borderColor: 'transparent',
                                                    borderWidth: 0,
                                                    boxShadow: 'none',
                                                })
                                            }}
                                        />
                                    </div>

                                    {/* Search Input */}
                                    <div className="sm:col-span-5 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <span className="material-symbols-outlined text-xl">search</span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar turma..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm h-[40px]"
                                        />
                                    </div>
                                </div>

                                {/* Table */}
                                <ClassesTable
                                    data={filteredClasses as ClassTableData[]}
                                    handleEditClass={(cls) => {
                                        setEditingClass(cls as GroupedClass);
                                        setIsCreating(false);
                                    }}
                                    handleDeleteClass={handleDelete}
                                    selectedClassName={editingClass?.className}
                                    getSubjectName={getSubjectName}
                                    getSubjectAcronym={getSubjectAcronym}
                                    getSubjectSemester={getSubjectSemester}
                                />

                            </div>
                        </div>

                        {/* Right Column: Editor */}
                        <div className="lg:col-span-2">
                            {renderRightPanel()}
                        </div>
                    </div>
                </div>
            )}

            {!selectedCourseId && (
                <div className="text-center py-32 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 animate-in fade-in zoom-in duration-500">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">school</span>
                    <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">Nenhum curso selecionado</h3>
                    <p className="text-gray-500 mt-2">Selecione um curso no menu acima para começar a gerenciar as turmas.</p>
                </div>
            )}
        </div>
    );
}
