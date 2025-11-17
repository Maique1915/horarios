import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCachedCoursesRegistry } from './Filtro';

// Context para dados de configuração do curso
const CourseConfigContext = createContext(null);

/**
 * Provider que compartilha dados de configuração do curso
 * (dimensão da grade e horários fixos) entre todos os componentes
 */
export const CourseConfigProvider = ({ children, currentCourse }) => {
  const [courseConfig, setCourseConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourseConfig = async () => {
      if (!currentCourse) {
        setLoading(false);
        return;
      }

      try {
        console.log('CourseConfigProvider: Carregando config para:', currentCourse);
        const startTime = performance.now();
        
        const coursesRegistry = await getCachedCoursesRegistry();
        const data = coursesRegistry.find(c => c._cu === currentCourse);
        
        const endTime = performance.now();
        console.log(`CourseConfigProvider: Config carregada em ${(endTime - startTime).toFixed(2)}ms`);
        
        if (data) {
          setCourseConfig({
            _cu: data._cu,
            name: data.name,
            _da: data._da || [0, 0], // [numHorarios, numDias]
            _hd: data._hd || [],      // Horários definidos
            gid: data.gid
          });
        } else {
          console.warn(`CourseConfigProvider: Curso ${currentCourse} não encontrado`);
          setCourseConfig(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('CourseConfigProvider: Erro ao carregar config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourseConfig();
  }, [currentCourse]);

  return (
    <CourseConfigContext.Provider value={{ courseConfig, loading, error }}>
      {children}
    </CourseConfigContext.Provider>
  );
};

/**
 * Hook para acessar a configuração do curso
 * @returns {{ courseConfig, loading, error }}
 */
export const useCourseConfig = () => {
  const context = useContext(CourseConfigContext);
  
  if (context === undefined) {
    throw new Error('useCourseConfig must be used within a CourseConfigProvider');
  }
  
  return context;
};

/**
 * Hook simplificado para acessar apenas os dados de configuração
 * @returns {object|null} Configuração do curso ou null
 */
export const useCourseData = () => {
  const { courseConfig } = useCourseConfig();
  return courseConfig;
};

/**
 * Hook para acessar dimensão da grade [numHorarios, numDias]
 * @returns {[number, number]} Dimensão da grade
 */
export const useCourseDimension = () => {
  const { courseConfig } = useCourseConfig();
  return courseConfig?._da || [0, 0];
};

/**
 * Hook para acessar horários definidos
 * @returns {Array} Array de horários [[inicio, fim], ...]
 */
export const useCourseSchedule = () => {
  const { courseConfig } = useCourseConfig();
  return courseConfig?._hd || [];
};

export default CourseConfigContext;
