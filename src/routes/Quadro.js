import { jsx as _jsx } from "react/jsx-runtime";
import '../model/css/Horarios.css';
import React from 'react';
import { ativas } from '../model/Filtro';
import Comum from './Comum';
import '../model/css/GeraGrade.css';
class Quadro extends React.Component {
    constructor(props) {
        super(props);
        this.state = { cur: props.cur };
    }
    render() {
        const a = ativas(this.state.cur);
        return _jsx(Comum, { materias: [a], tela: 1, cur: this.state.cur, separa: true, g: "º", f: ' Período' });
    }
}
export default Quadro;
