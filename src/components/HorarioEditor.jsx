import React, { useState, useEffect } from 'react';
import db2 from '../model/db2.json'; // Importar db2.json
import './HorarioEditor.css'; // CSS para o editor de horários

const HorarioEditor = ({ initialHo, initialDa, onHoChange, onDaChange, cur }) => {
  const [ho, setHo] = useState(initialHo || []);
  const [da, setDa] = useState(initialDa || []);

  // Encontrar os dados de horários para o curso atual
  const cursoData = db2.find(c => c._cu === cur);
  const numHorarios = cursoData ? cursoData._da[0] : 0; // Número de horários
  const numDias = cursoData ? cursoData._da[1] : 0;     // Número de dias
  const horariosDefinidos = cursoData ? cursoData._hd : []; // Definições dos horários

  const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  useEffect(() => {
    setHo(initialHo || []);
    // Garante que `da` tenha o mesmo tamanho de `ho`, preenchendo com null se necessário
    const initialDaSized = (initialHo || []).map((_, index) => (initialDa && initialDa[index]) ? initialDa[index] : null);
    setDa(initialDaSized);
  }, [initialHo, initialDa]);

  useEffect(() => {
    onHoChange(ho); // Notificar o componente pai sobre as mudanças
  }, [ho]);

  const isSelected = (diaIndex, horarioIndex) => {
    return ho.some(item => item[0] === diaIndex && item[1] === horarioIndex);
  };

  const toggleSelection = (diaIndex, horarioIndex) => {
    const itemIndex = ho.findIndex(item => item[0] === diaIndex && item[1] === horarioIndex);
    
    let newHo, newDa;

    if (itemIndex > -1) { // Se já está selecionado, remove
      newHo = [...ho];
      newDa = [...da];
      newHo.splice(itemIndex, 1);
      newDa.splice(itemIndex, 1);
    } else { // Se não está selecionado, adiciona
      newHo = [...ho, [diaIndex, horarioIndex]];
      newDa = [...da, null]; // Adiciona um placeholder para o novo horário
    }

    setHo(newHo);
    setDa(newDa);
    onHoChange(newHo);
    onDaChange(newDa);
  };

  const handleTimeChange = (newValue, index, timeIndex) => {
    const newDa = [...da];
    if (!newDa[index]) {
      // Se não houver um array, cria um a partir do horário predefinido ou um vazio
      const horarioPredefinido = horariosDefinidos[ho[index][1]] || ['', ''];
      newDa[index] = [...horarioPredefinido];
    }
    newDa[index][timeIndex] = newValue;

    setDa(newDa);
    onDaChange(newDa);
  };

  if (!cursoData) {
    return <div>{`Erro: Dados de horários para o curso "${cur}" não encontrados em db2.json.`}</div>;
  }

  return (
    <div className="horario-editor-container">
      <table>
        <thead>
          <tr>
            <th>Horário</th>
            {diasSemana.slice(0, numDias).map((dia, index) => (
              <th key={index}>{dia}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: numHorarios }).map((_, horarioIndex) => (
            <tr key={horarioIndex}>
              <td>{horariosDefinidos[horarioIndex] ? `${horariosDefinidos[horarioIndex][0]} - ${horariosDefinidos[horarioIndex][1]}` : ''}</td>
              {Array.from({ length: numDias }).map((_, diaIndex) => (
                <td key={diaIndex}>
                  <button
                    className={`horario-toggle-button ${isSelected(diaIndex, horarioIndex) ? 'selected' : ''}`}
                    onClick={() => toggleSelection(diaIndex, horarioIndex)}
                  >
                    {/* Pode adicionar um ícone ou texto aqui se quiser */}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Nova Seção para Edição de Horários Customizados */}
      <div className="custom-time-editor" style={{ marginTop: '20px' }}>
        <h4>Horários Selecionados</h4>
        {ho
          .map((item, index) => ({ ho: item, da: da[index], originalIndex: index })) // Combina os dados
          .sort((a, b) => a.ho[0] - b.ho[0] || a.ho[1] - b.ho[1]) // Ordena por dia, depois por horário
          .map((sortedItem) => { // Mapeia os itens ordenados para a UI
            const { ho: item, da: daValue, originalIndex } = sortedItem;
            const dia = diasSemana[item[0]];
            const horarioPredefinido = horariosDefinidos[item[1]];
            const displayValue = daValue || horarioPredefinido || ['', ''];

            return (
              <div key={originalIndex} className="custom-time-row">
                <span>{`${dia} - ${horarioPredefinido ? `${horarioPredefinido[0]}-${horarioPredefinido[1]}` : `Custom`}`}</span>
                <input 
                  type="time" 
                  value={displayValue[0]}
                  onChange={(e) => handleTimeChange(e.target.value, originalIndex, 0)}
                  className="time-input"
                />
                <input 
                  type="time" 
                  value={displayValue[1]}
                  onChange={(e) => handleTimeChange(e.target.value, originalIndex, 1)}
                  className="time-input"
                />
              </div>
            )
        })}
      </div>
    </div>
  );
};

export default HorarioEditor;