'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import LoadingSpinner from '../shared/LoadingSpinner';
import EditCourseView from '../../app/[cur]/edit/EditCourseView';
import { useEditCourseController } from '../../app/[cur]/edit/useEditCourseController';

export default function SubjectsManager() {
    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('courses').select('code, name').order('name');
        if (data) {
            setCourses(data);
        } else if (error) {
            console.error('Error fetching courses:', error);
        }
        setLoading(false);
    };

    if (loading) return <LoadingSpinner message="Carregando cursos..." />;

    return (
        <div className="space-y-4">
            {/* Header with Selector */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col md:flex-row items-center gap-4 shrink-0">
                <h2 className="text-xl font-bold whitespace-nowrap">Gerenciar Disciplinas</h2>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <label className="text-base font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Curso:</label>
                    <select
                        value={selectedCourseCode}
                        onChange={(e) => setSelectedCourseCode(e.target.value)}
                        className="px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 w-full md:min-w-[400px] text-base font-medium shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                        <option value="">Selecione um curso...</option>
                        {courses.map(c => (
                            <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedCourseCode ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    {/* The EditCourseView expects full height usually, we wrap it */}
                    <CourseEditorWrapper courseCode={selectedCourseCode} />
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 min-h-[400px]">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">school</span>
                        <p className="text-gray-500 text-lg">Selecione um curso acima para gerenciar a grade curricular.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// Wrapper ensuring clean controller initialization per course
function CourseEditorWrapper({ courseCode }: { courseCode: string }) {
    // We pass the courseCode to the controller so it uses it instead of URL params
    const ctrl = useEditCourseController({ courseCode });

    // We render the view using this controller
    return <EditCourseView ctrl={ctrl} />;
}
