import React, { useState, useEffect, useCallback } from 'react';
import '../styles/HorarioEditor.css';
import LoadingSpinner from './LoadingSpinner';
import { getDays, getTimeSlots } from '../services/scheduleService';


const HorarioEditor = ({ initialClassName, initialHo, initialDa, onSave, onCancel, isReviewing }) => {
  const [days, setDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ho, setHo] = useState(initialHo || []);
  const [da, setDa] = useState(initialDa || []);

  useEffect(() => {
    setHo(initialHo || []);
    setDa(initialDa || []);
  }, [initialHo, initialDa]);

  useEffect(() => {
    const fetchScheduleData = async () => {
      setLoading(true);
      try {
        const [d, t] = await Promise.all([getDays(), getTimeSlots()]);
        setDays(d || []);
        setTimeSlots(t || []);

        setError(null);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching schedule data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchScheduleData();
  }, []); // Empty dependency array means it runs once on mount

  const isSelected = useCallback((dayId, timeSlotId) => {
    return ho.some(item => item[0] === dayId && item[1] === timeSlotId);
  }, [ho]);

  const toggleSelection = (dayId, timeSlotId) => {
    if (isReviewing) return;

    const itemIndex = ho.findIndex(item => item[0] === dayId && item[1] === timeSlotId);

    let newHo;
    let newDa;

    if (itemIndex > -1) {
      newHo = ho.filter((_, idx) => idx !== itemIndex);
      newDa = da.filter((_, idx) => idx !== itemIndex); // Filter da based on ho changes
    } else {
      newHo = [...ho, [dayId, timeSlotId]];
      newDa = [...da, null]; // Add placeholder for new custom time
    }
    setHo(newHo);
    setDa(newDa);
  };

  const handleTimeChange = (newValue, hoIndex, timeComponentIndex) => {
    if (isReviewing) return;

    const newDa = [...da];
    // Start with current daValue or derive from default slot time
    const hoItem = ho[hoIndex];
    const timeSlot = timeSlots.find(ts => ts.id === hoItem[1]);

    // Current effective custom times (if null, use formatted default)
    let currentStart = newDa[hoIndex] ? newDa[hoIndex][0] : formatTime(timeSlot?.start_time);
    let currentEnd = newDa[hoIndex] ? newDa[hoIndex][1] : formatTime(timeSlot?.end_time);

    if (timeComponentIndex === 0) currentStart = newValue;
    else currentEnd = newValue;

    // Default times for comparison
    const defaultStart = formatTime(timeSlot?.start_time);
    const defaultEnd = formatTime(timeSlot?.end_time);

    // If both match default, set to null (no custom time needed)
    if (currentStart === defaultStart && currentEnd === defaultEnd) {
      newDa[hoIndex] = null;
    } else {
      newDa[hoIndex] = [currentStart, currentEnd];
    }

    setDa(newDa);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  if (loading) {
    return <LoadingSpinner message="Carregando grade de horários..." />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Erro ao carregar grade de horários: {error}</div>;
  }

  const sortedSelectedHoDa = initialHo
    .map((hoItem, index) => ({ hoItem, daItem: initialDa[index], originalIndex: index }))
    .sort((a, b) => {
      const dayA = days.find(d => d.id === a.hoItem[0]);
      const dayB = days.find(d => d.id === b.hoItem[0]);
      const slotA = timeSlots.find(ts => ts.id === a.hoItem[1]);
      const slotB = timeSlots.find(ts => ts.id === b.hoItem[1]);

      if (!dayA || !dayB || !slotA || !slotB) return 0;

      const dayIndexA = days.indexOf(dayA);
      const dayIndexB = days.indexOf(dayB);
      if (dayIndexA !== dayIndexB) return dayIndexA - dayIndexB;

      return slotA.start_time.localeCompare(slotB.start_time);
    });

  return (
    <div className="horario-editor-container">
      <div className="flex justify-between">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Nome da Turma</h4>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{initialClassName}</p>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <button
            type="button"
            onClick={() => onSave({ class_name: initialClassName, ho, da })}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
            disabled={isReviewing || !initialClassName || !initialClassName.trim()}
          >
            Salvar Turma
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary border border-border-light dark:border-border-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10 transition-colors"
            disabled={isReviewing}
          >
            Cancelar
          </button>
        </div>
      </div>



      <h3>Grade de Horários</h3>
      <div
        className="schedule-grid"
        style={{ gridTemplateColumns: `120px repeat(${days.length}, 1fr)` }} // Dynamic columns
      >
        <div></div> {/* Empty cell for alignment */}

        {days.map(day => (
          <div key={day.id} className="day-header">{day.name}</div>
        ))}

        {timeSlots.map(slot => (
          <React.Fragment key={slot.id}>
            <div className="time-label">{`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}</div>
            {days.map(day => (
              <label key={day.id} className="slot">
                <input
                  type="checkbox"
                  checked={isSelected(day.id, slot.id)}
                  onChange={() => toggleSelection(day.id, slot.id)}
                  disabled={isReviewing}
                />
                <span></span> {/* Visual representation of the slot */}
              </label>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Seção para Edição de Horários Customizados (Restaurada) */}
      {ho.length > 0 && (
        <div className="custom-time-editor" style={{ marginTop: '20px' }}>
          <h4>Horários Selecionados</h4>
          {ho
            .map((hoItem, index) => ({ hoItem, daItem: da[index], originalIndex: index }))
            .sort((a, b) => {
              const dayA = days.find(d => d.id === a.hoItem[0]);
              const dayB = days.find(d => d.id === b.hoItem[0]);
              const slotA = timeSlots.find(ts => ts.id === a.hoItem[1]);
              const slotB = timeSlots.find(ts => ts.id === b.hoItem[1]);

              if (!dayA || !dayB || !slotA || !slotB) return 0;

              const dayIndexA = days.indexOf(dayA);
              const dayIndexB = days.indexOf(dayB);
              if (dayIndexA !== dayIndexB) return dayIndexA - dayIndexB;

              return slotA.start_time.localeCompare(slotB.start_time);
            })
            .map((item) => {
              const { hoItem, daItem, originalIndex } = item;
              const day = days.find(d => d.id === hoItem[0]);
              const timeSlot = timeSlots.find(ts => ts.id === hoItem[1]);

              const displayValueStart = daItem?.[0] || formatTime(timeSlot?.start_time);
              const displayValueEnd = daItem?.[1] || formatTime(timeSlot?.end_time);

              return (
                <div key={originalIndex} className="custom-time-row">
                  <span>{`${day?.name || 'Dia'} ${timeSlot ? `(${formatTime(timeSlot.start_time)}-${formatTime(timeSlot.end_time)})` : ''}`}</span>
                  <input
                    type="time"
                    value={displayValueStart}
                    onChange={(e) => handleTimeChange(e.target.value, originalIndex, 0)}
                    className="time-input"
                    disabled={isReviewing}
                  />
                  <input
                    type="time"
                    value={displayValueEnd}
                    onChange={(e) => handleTimeChange(e.target.value, originalIndex, 1)}
                    className="time-input"
                    disabled={isReviewing}
                  />
                </div>
              );
            })}
        </div>
      )}


    </div>
  );
};

export default HorarioEditor;