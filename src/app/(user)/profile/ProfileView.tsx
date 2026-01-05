import React from 'react';
import { useRouter } from 'next/navigation';
import ROUTES from '../../../routes';
import Comum from '../../../components/Comum';
import { useProfileController } from './useProfileController';

// --- View Components ---

interface CategoryProgressProps {
    title: string;
    subjects: any[];
    reqHours: number;
    reqCredits: number;
    color: string;
    bgColor: string;
    icon: string;
    customTotalHours?: number;
    onClick?: () => void;
}

const CategoryProgress = ({ title, subjects, reqHours, reqCredits, color, bgColor, icon, customTotalHours, onClick }: CategoryProgressProps) => {
    const totalCredits = subjects.reduce((sum: number, s: any) => sum + (Number(s._ap || 0) + Number(s._at || 0)), 0);
    const totalHours = customTotalHours !== undefined ? customTotalHours : totalCredits * 18;
    const hoursPct = reqHours > 0 ? Math.min(100, Math.round((totalHours / reqHours) * 100)) : 0;
    const creditsPct = reqCredits > 0 ? Math.min(100, Math.round((totalCredits / reqCredits) * 100)) : 0;

    return (
        <div
            onClick={onClick}
            className={`bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 flex flex-col gap-4 group ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
        >
            <div className="flex items-center gap-4 mb-2">
                <div className={`w-10 h-10 rounded-lg ${bgColor}/10 flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
                </div>
                <h3 className="font-bold text-base text-text-light-primary dark:text-text-dark-primary leading-tight">{title}</h3>
            </div>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between text-xs mb-2">
                        <span className="text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wide font-semibold">Carga Horária</span>
                        <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                            {Math.round(totalHours)} / {reqHours} h
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${bgColor} transition-all duration-1000`} style={{ width: `${hoursPct}%` }}></div>
                    </div>
                </div>
                {reqCredits > 0 && (
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-text-light-secondary dark:text-text-dark-secondary uppercase tracking-wide font-semibold">Créditos</span>
                            <span className="font-medium text-text-light-primary dark:text-text-dark-primary">
                                {totalCredits} / {reqCredits}
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${bgColor} opacity-70 transition-all duration-1000`} style={{ width: `${creditsPct}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfileHeaderView = ({ ctrl }: { ctrl: ReturnType<typeof useProfileController> }) => {
    if (!ctrl.user) return null;
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 mb-8 border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-5 flex-1 w-full md:w-auto">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-border-light dark:border-border-dark">
                        <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary">{ctrl.user.name || ctrl.user.username}</h1>
                            <button
                                onClick={() => ctrl.setIsEditingProfile(true)}
                                className="w-7 h-7 rounded-full text-text-light-secondary hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
                                title="Editar Perfil"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary bg-background-light dark:bg-background-dark px-2.5 py-0.5 rounded-md border border-border-light dark:border-border-dark">
                                <span className="material-symbols-outlined text-sm">badge</span>
                                {ctrl.user.username}
                            </span>
                            <span className="flex items-center gap-1.5 text-text-light-secondary dark:text-text-dark-secondary bg-background-light dark:bg-background-dark px-2.5 py-0.5 rounded-md border border-border-light dark:border-border-dark">
                                <span className="material-symbols-outlined text-sm">school</span>
                                {ctrl.user.role === 'admin' ? 'Administrador' : 'Estudante'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-background-light dark:bg-background-dark rounded-xl p-4 min-w-[280px] border border-border-light dark:border-border-dark w-full md:w-auto flex flex-col justify-between">
                    <div className="mb-4">
                        <div className="flex justify-between items-end mb-2 gap-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Progresso Total</span>
                            <span className="text-xl font-bold text-primary">{ctrl.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${ctrl.progressPercentage}%` }}></div>
                        </div>
                    </div>

                    {!ctrl.isExpired && ctrl.user?.is_paid && (
                        <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg p-2 -mx-2 mt-2"
                            onClick={() => location.href = ROUTES.PREDICTION}>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-teal-600 dark:text-teal-400">event_available</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Previsão</span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 justify-end">
                                    {ctrl.estimatedDate ? (
                                        <>
                                            {ctrl.estimatedDate.getFullYear()}.{ctrl.estimatedDate.getMonth() + 1 <= 6 ? 1 : 2}
                                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-400 font-normal">Calculando...</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const EditProfileModal = ({ ctrl }: { ctrl: ReturnType<typeof useProfileController> }) => {
    if (!ctrl.isEditingProfile) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-border-light dark:border-border-dark scale-100 transform transition-transform">
                <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary">Editar Perfil</h2>
                    <button onClick={() => ctrl.setIsEditingProfile(false)} className="text-text-light-secondary hover:text-primary">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={ctrl.handleUpdateProfile} className="p-6 space-y-4">
                    {ctrl.updateError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm flex gap-2 items-center">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {ctrl.updateError}
                        </div>
                    )}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Nome Completo</label>
                        <input
                            type="text"
                            value={ctrl.editForm.name}
                            onChange={(e) => ctrl.setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            placeholder="Seu nome"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary">Usuário</label>
                        <input
                            type="text"
                            value={ctrl.editForm.username}
                            onChange={(e) => ctrl.setEditForm(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                            placeholder="seu.usuario"
                        />
                    </div>

                    <div className="pt-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-light-secondary dark:text-text-dark-secondary mb-1.5">Segurança</label>
                        {!ctrl.showPassword ? (
                            <button
                                type="button"
                                onClick={() => ctrl.setShowPassword(true)}
                                className="text-sm text-primary hover:text-primary-dark font-medium flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10 w-full justify-center"
                            >
                                <span className="material-symbols-outlined text-lg">lock_reset</span>
                                Alterar senha
                            </button>
                        ) : (
                            <div className="space-y-3 animate-fadeIn bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-border-light dark:border-border-dark">
                                <input
                                    type="password"
                                    value={ctrl.editForm.password || ''}
                                    onChange={(e) => ctrl.setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark text-sm"
                                    placeholder="Nova senha"
                                />
                                <input
                                    type="password"
                                    value={ctrl.confirmPassword}
                                    onChange={(e) => ctrl.setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-border-light dark:border-border-dark text-sm"
                                    placeholder="Confirmar nova senha"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => { ctrl.setShowPassword(false); ctrl.setEditForm(prev => ({ ...prev, password: '' })); ctrl.setConfirmPassword(''); }}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border-light dark:border-border-dark">
                        <button type="button" onClick={() => ctrl.setIsEditingProfile(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm">Cancelar</button>
                        <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors font-medium text-sm shadow-sm">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function ProfileView({ ctrl }: { ctrl: ReturnType<typeof useProfileController> }) {
    const router = useRouter();

    if (!ctrl.user) return null;

    return (
        <div className="container mx-auto px-4 py-8 animate-fadeIn max-w-6xl">
            <ProfileHeaderView ctrl={ctrl} />
            <EditProfileModal ctrl={ctrl} />

            {ctrl.showScheduleView ? (
                <div className="animate-fadeIn">
                    <Comum
                        materias={ctrl.formattedEnrollmentsForGrid as any}
                        tela={2}
                        cur={ctrl.user.courses?.code || 'engcomp'}
                        hideSave={true}
                        fun={
                            <button
                                onClick={() => ctrl.setShowScheduleView(false)}
                                className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl h-10 px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Voltar
                            </button>
                        }
                        g="ª"
                        f="Grade Atual"
                        separa={false}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fadeIn delay-100">
                        <CategoryProgress
                            title="Obrigatórias"
                            subjects={ctrl.mandatorySubjects}
                            reqHours={3774}
                            reqCredits={198}
                            color="text-blue-600 dark:text-blue-400"
                            bgColor="bg-blue-600"
                            icon="school"
                        />
                        <CategoryProgress
                            title="Optativas"
                            subjects={ctrl.electiveSubjects}
                            reqHours={360}
                            reqCredits={20}
                            color="text-purple-600 dark:text-purple-400"
                            bgColor="bg-purple-600"
                            icon="star"
                        />
                        <CategoryProgress
                            title="Atividades Comp."
                            subjects={[]}
                            reqHours={210}
                            reqCredits={0}
                            color="text-orange-600 dark:text-orange-400"
                            bgColor="bg-orange-600"
                            icon="extension"
                            customTotalHours={ctrl.complementaryHours}
                            onClick={() => router.push(ROUTES.ACTIVITIES)}
                        />
                    </div>

                    {/* TWO COLUMNS: Enrollments & Completed */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Enrollments */}
                        <div className="bg-surface-light dark:bg-surface-dark lg:col-span-3 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                                    Grade Atual (Em Curso)
                                </h2>
                                {ctrl.currentEnrollments.length > 0 && (
                                    <button
                                        onClick={() => ctrl.setShowScheduleView(true)}
                                        className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">grid_view</span>
                                        Visualizar Grade
                                    </button>
                                )}
                            </div>
                            <div className="p-6">
                                {ctrl.currentEnrollments.length === 0 ? (
                                    <div className="text-center py-8">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">event_busy</span>
                                        <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">Nenhuma disciplina em curso no momento.</p>
                                    </div>
                                ) : (
                                    <ul className="space-y-3">
                                        {ctrl.currentEnrollments.map((subject: any) => {
                                            const scheduleGroups = ctrl.getFormattedSchedule(subject.schedule_data);
                                            return (
                                                <li key={subject._id} className="p-4 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:border-primary/30 transition-colors group">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-text-light-primary dark:text-text-dark-primary text-base leading-tight mb-1" title={subject.name}>{subject.name || subject.class_name || "Disciplina"}</h3>
                                                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">{subject.acronym || "N/A"}</span>
                                                                {(subject.course_name || subject.semester) && (
                                                                    <span className="text-xs text-text-light-secondary dark:text-text-dark-secondary flex items-center gap-1">
                                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                                        {subject.course_name || subject.semester}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {scheduleGroups.length > 0 && (
                                                            <div className="flex flex-col gap-1.5 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                                {scheduleGroups.map((group: any, idx: number) => (
                                                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800/80 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                                                        <span className="text-xs font-bold text-primary dark:text-blue-400 uppercase tracking-wide min-w-[24px]">{group.day}</span>
                                                                        <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
                                                                        <div className="flex flex-wrap gap-x-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                                                                            {group.times.map((time: string, tIdx: number) => (
                                                                                <span key={tIdx} className={tIdx > 0 ? "before:content-[','] before:mr-1 before:text-slate-300 dark:before:text-slate-600" : ""}>{time}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Completed Subjects */}
                        <div className="bg-surface-light dark:bg-surface-dark lg:col-span-2 rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden h-fit">
                            <div className="px-6 py-4 border-b border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-white/5 flex flex-wrap justify-between items-center gap-4">
                                <h2 className="text-lg font-bold text-text-light-primary dark:text-text-dark-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                                    Concluídas <span className="text-sm font-normal text-slate-500 ml-1">({ctrl.completedSubjects.length})</span>
                                </h2>
                                <div className="flex items-center gap-2">
                                    {ctrl.isEditingSubjects && (
                                        <select
                                            value={ctrl.selectedSemesterFilter}
                                            onChange={(e) => ctrl.setSelectedSemesterFilter(e.target.value)}
                                            className="px-2 py-1.5 rounded-lg text-xs border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 focus:ring-1 focus:ring-primary outline-none"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="optativas">Optativas</option>
                                            {Array.from(new Set(ctrl.allSubjects.map(s => s._se).filter(s => s && Number(s) > 0))).sort((a, b) => Number(a) - Number(b)).map(sem => (
                                                <option key={sem} value={sem}>{sem}º Per</option>
                                            ))}
                                        </select>
                                    )}
                                    {ctrl.isEditingSubjects ? (
                                        <button
                                            onClick={ctrl.handleSaveSubjects}
                                            disabled={ctrl.savingSubjects}
                                            className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                                        >
                                            {ctrl.savingSubjects ? <span className="material-symbols-outlined text-sm animate-spin">sync</span> : <span className="material-symbols-outlined text-sm">save</span>}
                                            Salvar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => ctrl.setIsEditingSubjects(true)}
                                            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                            Editar
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="p-0 overflow-y-auto max-h-[500px] custom-scrollbar">
                                {ctrl.isEditingSubjects ? (
                                    <div className="divide-y divide-border-light dark:divide-border-dark">
                                        {ctrl.allSubjects
                                            .filter(s => {
                                                if (ctrl.selectedSemesterFilter === 'all') return true;
                                                if (ctrl.selectedSemesterFilter === 'optativas') return !s._el;
                                                return s._se == ctrl.selectedSemesterFilter;
                                            })
                                            .sort((a, b) => {
                                                if (a._el !== b._el) return a._el ? -1 : 1;
                                                return (a._di || "").localeCompare(b._di || "");
                                            })
                                            .map((subject) => {
                                                const isSelected = ctrl.selectedSubjectIds.has(subject._id);
                                                return (
                                                    <div
                                                        key={subject._id}
                                                        onClick={() => ctrl.handleToggleSubject(subject._id)}
                                                        className={`px-6 py-3 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isSelected ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                                            {isSelected && <span className="material-symbols-outlined text-white text-sm">check</span>}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${isSelected ? 'text-green-900 dark:text-green-100' : 'text-text-light-primary dark:text-text-dark-primary'}`}>{subject._di}</p>
                                                            <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">{subject._re} • {subject._se}º Período</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border-light dark:divide-border-dark">
                                        {ctrl.completedSubjects.length === 0 ? (
                                            <div className="text-center py-8 px-6">
                                                <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">Nenhuma disciplina concluída.</p>
                                            </div>
                                        ) : (
                                            ctrl.completedSubjects
                                                .sort((a, b) => (Number(b._se) || 0) - (Number(a._se) || 0))
                                                .map((subject) => (
                                                    <div key={subject._id} className="px-6 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary group-hover:text-primary transition-colors">{subject._di}</p>
                                                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-0.5">
                                                                    {subject._re} • {subject._se ? `${subject._se}º Período` : 'Optativa'}
                                                                </p>
                                                            </div>
                                                            {!subject._el && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                                                    OPT
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </div>
                                )}
                            </div>
                            {ctrl.isEditingSubjects && (
                                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-border-light dark:border-border-dark flex justify-between items-center text-xs text-slate-500">
                                    <span>{ctrl.selectedSubjectIds.size} selecionadas</span>
                                    {ctrl.selectedSemesterFilter !== 'all' && ctrl.selectedSemesterFilter !== 'optativas' && (
                                        <button
                                            onClick={() => ctrl.handleTogglePeriod(ctrl.selectedSemesterFilter, true)}
                                            className="text-primary hover:underline"
                                        >
                                            Marcar todo {ctrl.selectedSemesterFilter}º
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

