import React from 'react';
import { useParams } from 'react-router-dom';
import { ativas } from '../model/Filtro.jsx';
import Comum from './Comum.jsx';

const Quadro = () => {
    const { cur = 'engcomp' } = useParams(); // Use useParams para obter 'cur'
    const a = ativas(cur);
    return <Comum materias={[a]} tela={1} cur={cur} separa={true} g={"º"} f={' Período'} />;
}
export default Quadro
