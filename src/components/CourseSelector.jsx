import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadDbData, clearCache, loadCoursesRegistry } from '../model/loadData';

// 🔧 CONFIGURE A URL DO GOOGLE APPS SCRIPT AQUI:
// Depois de criar o script, cole a URL aqui
const GOOGLE_APPS_SCRIPT_URL = ''; // Cole sua URL aqui após deployment

const CourseSelector = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newCourse, setNewCourse] = useState({
        _cu: '',
        name: '',
        _da: [12, 5], // horários por dia, dias na semana
        _hd: [] // horários com início e fim
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                
                // Carregar registro de cursos do gid=0
                const coursesRegistry = await loadCoursesRegistry();
                console.log('Cursos do registro:', coursesRegistry);
                
                if (coursesRegistry.length > 0) {
                    // Usar dados do registro
                    const data = await loadDbData();
                    
                    const coursesWithInfo = coursesRegistry.map(courseReg => {
                        const courseCode = courseReg._cu;
                        const disciplineCount = data.filter(d => d._cu === courseCode && d._ag === true).length;
                        
                        return {
                            code: courseCode,
                            name: courseReg.name || courseCode.toUpperCase(),
                            disciplineCount,
                            periods: [...new Set(data.filter(d => d._cu === courseCode && d._ag).map(d => d._se))].length,
                            gid: courseReg.gid
                        };
                    });
                    
                    setCourses(coursesWithInfo);
                } else {
                    // Fallback para o método antigo se o registro não estiver disponível
                    const data = await loadDbData();
                    const uniqueCourses = [...new Set(data.map(d => d._cu))];
                    
                    const coursesWithInfo = uniqueCourses.map(courseCode => {
                        const courseInfo = db2.find(c => c._cu === courseCode);
                        const disciplineCount = data.filter(d => d._cu === courseCode && d._ag === true).length;
                        
                        return {
                            code: courseCode,
                            name: courseInfo?.name || courseCode.toUpperCase(),
                            disciplineCount,
                            periods: [...new Set(data.filter(d => d._cu === courseCode && d._ag).map(d => d._se))].length
                        };
                    });

                    setCourses(coursesWithInfo);
                }
            } catch (error) {
                console.error('Erro ao carregar cursos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleAddCourse = async () => {
        if (!newCourse._cu.trim()) {
            alert('Por favor, digite o código do curso');
            return;
        }

        if (!newCourse.name.trim()) {
            alert('Por favor, digite o nome do curso');
            return;
        }

        if (newCourse._da[0] < 0 || newCourse._da[1] < 0) {
            alert('Por favor, configure as dimensões corretamente');
            return;
        }

        if (newCourse._hd.length !== newCourse._da[0]) {
            alert(`Por favor, configure todos os ${newCourse._da[0]} horários`);
            return;
        }

        // Validar se todos os horários estão preenchidos
        const horariosIncompletos = newCourse._hd.some(h => !h[0] || !h[1]);
        if (horariosIncompletos) {
            alert('Por favor, preencha todos os horários (início e fim)');
            return;
        }

        setSaving(true);

        const courseCode = newCourse._cu.toLowerCase();
        const courseName = newCourse.name.toUpperCase();
        
        // Criar linha CSV para registro de cursos (gid=0)
        // Formato: gid	_cu	name	_da	_hd
        const registryLine = `-1\t${courseCode}\t${courseName}\t${JSON.stringify(newCourse._da)}\t${JSON.stringify(newCourse._hd)}`;

        try {
            // Tentar copiar para clipboard
            await navigator.clipboard.writeText(registryLine);
            
            alert(
                `✅ Dados copiados!\n\n` +
                `📋 INSTRUÇÕES IMPORTANTES:\n\n` +
                `1. Abra sua planilha do Google Sheets\n` +
                `2. Vá para a aba "gid=0" (primeira aba com registro de cursos)\n` +
                `3. Adicione uma NOVA LINHA no final\n` +
                `4. Cole os dados (Ctrl+V ou Cmd+V)\n` +
                `5. CRIE uma nova ABA com o nome: "${courseCode}"\n` +
                `6. Descubra o GID da nova aba (veja URL: #gid=NUMERO)\n` +
                `7. VOLTE para a aba "gid=0" e SUBSTITUA o -1 pelo GID real\n\n` +
                `8. Configure em src/model/db2.json:\n` +
                `   {"_cu": "${courseCode}", "name": "${courseName}",\n` +
                `    "_da": ${JSON.stringify(newCourse._da)},\n` +
                `    "_hd": ${JSON.stringify(newCourse._hd)}}\n\n` +
                `9. Recarregue esta página\n\n` +
                `⚠️ IMPORTANTE: Não esqueça de substituir o -1 pelo GID real da nova aba!`
            );

            // Limpa cache
            clearCache();
            
            // Aguarda um momento antes de navegar
            setTimeout(() => {
                navigate(`/${courseCode}/edit`);
                setShowAddModal(false);
            }, 500);
            
        } catch (error) {
            // Fallback: download CSV
            console.error('Erro ao copiar:', error);
            
            const confirmed = window.confirm(
                `❌ Não foi possível copiar automaticamente.\n\n` +
                `Vou baixar um arquivo CSV.\n\n` +
                `LEMBRE-SE: Crie uma aba chamada "${courseCode}" no Google Sheets!\n\n` +
                `Clique OK para baixar.`
            );
            
            if (confirmed) {
                downloadCSV(courseData);
            }
        } finally {
            setSaving(false);
        }
    };

    const downloadCSV = (courseData) => {
        const courseCode = courseData._cu;
        
        // Criar CSV com cabeçalho
        const header = '_cu,_se,_di,_re,_ap,_at,_el,_ag,_pr,_ho,_au,_ha,_da';
        const csvLine = `${courseData._cu},${courseData._se},"${courseData._di}",${courseData._re},${courseData._ap},${courseData._at},${courseData._el},${courseData._ag},"${courseData._pr}","${courseData._ho}","${courseData._au}","${courseData._ha}","${courseData._da}"`;
        const csvContent = `${header}\n${csvLine}`;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `novo_curso_${courseCode}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert(
            `📥 Arquivo CSV baixado!\n\n` +
            `📝 PASSOS OBRIGATÓRIOS:\n\n` +
            `1. Abra sua planilha do Google Sheets\n` +
            `2. Clique no + para CRIAR NOVA ABA\n` +
            `3. Renomeie a aba para: "${courseCode}"\n` +
            `4. Abra o arquivo baixado\n` +
            `5. Copie APENAS a segunda linha (dados)\n` +
            `6. Cole na aba "${courseCode}"\n` +
            `7. Descubra o GID (URL: #gid=NUMERO)\n` +
            `8. Configure em src/model/loadData.js:\n` +
            `   '${courseCode}': 'URL?gid=SEU_GID&single=true&output=csv'\n` +
            `9. Salve e recarregue\n\n` +
            `⚠️ A ABA DEVE se chamar "${courseCode}"`
        );
        
        setTimeout(() => {
            navigate(`/${courseCode}/edit`);
            setShowAddModal(false);
        }, 500);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary">
                        Carregando cursos...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                            Selecione um Curso
                        </h1>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary">
                            Escolha um curso para gerenciar ou adicione um novo
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 shadow-md"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        <span>Adicionar Curso</span>
                    </button>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course.code}
                            onClick={() => navigate(`/${course.code}/edit`)}
                            className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl text-primary">
                                            school
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                                            {course.code.toUpperCase()}
                                        </h3>
                                        <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                            {course.name}
                                        </p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">
                                    arrow_forward
                                </span>
                            </div>

                            <div className="flex gap-4 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg text-primary">
                                        book
                                    </span>
                                    <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                        {course.disciplineCount} disciplinas
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg text-primary">
                                        calendar_month
                                    </span>
                                    <span className="text-sm text-text-light-secondary dark:text-text-dark-secondary">
                                        {course.periods} períodos
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-5xl text-primary">
                                school
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">
                            Nenhum curso encontrado
                        </h3>
                        <p className="text-text-light-secondary dark:text-text-dark-secondary mb-6">
                            Adicione um novo curso para começar
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 shadow-md mx-auto"
                        >
                            <span className="material-symbols-outlined text-xl">add</span>
                            <span>Adicionar Primeiro Curso</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de Adicionar Curso */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary">
                                Adicionar Novo Curso
                            </h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                            >
                                <span className="material-symbols-outlined text-text-light-secondary dark:text-text-dark-secondary">
                                    close
                                </span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                                    Código do Curso *
                                </label>
                                <input
                                    type="text"
                                    value={newCourse._cu}
                                    onChange={(e) => setNewCourse({ ...newCourse, _cu: e.target.value.toLowerCase() })}
                                    placeholder="Ex: engcomp, engmec, adm"
                                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
                                    Apenas letras minúsculas, sem espaços
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                                    Nome do Curso *
                                </label>
                                <input
                                    type="text"
                                    value={newCourse.name}
                                    onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                    placeholder="Ex: ENGCOMP, MATEMATICA, ADMINISTRAÇÃO"
                                    className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
                                    Nome completo em MAIÚSCULAS
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                                        Horários por Dia *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="24"
                                        value={newCourse._da[0]}
                                        onChange={(e) => {
                                            const newValue = parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0;
                                            const newHd = Array.from({ length: newValue }, (_, i) => newCourse._hd[i] || ['', '']);
                                            setNewCourse({ ...newCourse, _da: [newValue, newCourse._da[1]], _hd: newHd });
                                        }}
                                        className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
                                        Ex: 12 slots
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                                        Dias na Semana *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="7"
                                        value={newCourse._da[1]}
                                        onChange={(e) => {
                                            const newValue = parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0;
                                            setNewCourse({ ...newCourse, _da: [newCourse._da[0], newValue] });
                                        }}
                                        className="w-full px-4 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                    <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mt-1">
                                        Ex: 5 dias
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-light-primary dark:text-text-dark-primary mb-2">
                                    Horários (_hd) *
                                </label>
                                <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary mb-3">
                                    Configure os horários de início e fim para cada slot. Total: {newCourse._da[0]} horários
                                </p>
                                <div className="space-y-2 max-h-64 overflow-y-auto border border-border-light dark:border-border-dark rounded-lg p-3 bg-background-light dark:bg-background-dark">
                                    {Array.from({ length: newCourse._da[0] }).map((_, index) => {
                                        const horario = newCourse._hd[index] || ['', ''];
                                        return (
                                            <div key={index} className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-text-light-primary dark:text-text-dark-primary w-16">
                                                    Slot {index + 1}:
                                                </span>
                                                <input
                                                    type="time"
                                                    value={horario[0]}
                                                    onChange={(e) => {
                                                        const newHd = [...newCourse._hd];
                                                        const timeValue = e.target.value.substring(0, 5);
                                                        newHd[index] = [timeValue, horario[1]];
                                                        setNewCourse({ ...newCourse, _hd: newHd });
                                                    }}
                                                    step="60"
                                                    className="flex-1 px-3 py-1.5 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                                />
                                                <span className="text-text-light-secondary dark:text-text-dark-secondary">até</span>
                                                <input
                                                    type="time"
                                                    value={horario[1]}
                                                    onChange={(e) => {
                                                        const newHd = [...newCourse._hd];
                                                        const timeValue = e.target.value.substring(0, 5);
                                                        newHd[index] = [horario[0], timeValue];
                                                        setNewCourse({ ...newCourse, _hd: newHd });
                                                    }}
                                                    step="60"
                                                    className="flex-1 px-3 py-1.5 rounded-md border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark hover:bg-surface-light dark:hover:bg-surface-dark disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddCourse}
                                    disabled={!newCourse._cu.trim() || !newCourse.name.trim() || newCourse._hd.length !== newCourse._da[0] || saving}
                                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Salvando...</span>
                                        </>
                                    ) : (
                                        <span>Adicionar</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseSelector;
