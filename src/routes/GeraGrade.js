import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import Comum from './Comum';
import Grafos from '../model/util/Grafos';
import Escolhe from '../model/util/Escolhe';
import { ativas } from '../model/Filtro';
import '../model/css/GeraGrade.css';
import '../model/css/Horarios.css';
const GeraGrade = ({ cur }) => {
    const [state, setState] = useState({
        names: [],
        keys: [],
        estado: 0,
        x: [],
        gr: [],
    });
    let arr = ativas(cur);
    let m = remove([...arr]);
    function handleCheck(e) {
        const r = e.target;
        if (r.className === 't_mat') {
            const b = r.checked;
            // L�gica para lidar com a classe 't_mat'
            const el = document.getElementById(r.value);
            if (el !== null) {
                const per = el.getElementsByClassName("mat");
                for (const mat of per) {
                    if (mat instanceof HTMLInputElement) {
                        mat.checked = b;
                        let id = 0;
                        if (state.estado === 0) {
                            id = state.keys.indexOf(parseInt(mat.value));
                        }
                        else if (state.estado === 1) {
                            id = state.x.indexOf(mat.id);
                        }
                        if (b && id === -1) {
                            altera(true, mat);
                        }
                        else if (!b && id >= 0) {
                            altera(false, mat);
                        }
                    }
                }
                r.checked = b;
            }
        }
        else {
            if (r.checked === true) {
                altera(true, r);
            }
            else if (r.checked === false) {
                altera(false, r);
            }
        }
    }
    function altera(a, b) {
        if (state.estado === 0) {
            const value = parseInt(b.value);
            if (a) {
                setState((prevState) => ({
                    ...prevState,
                    keys: [...prevState.keys, value],
                    names: [...prevState.names, b.id]
                }));
            }
            else {
                setState((prevState) => {
                    const i = prevState.keys.findIndex((key) => key === value);
                    if (i !== -1) {
                        const keys = [...prevState.keys];
                        keys.splice(i, 1);
                        const names = [...prevState.names];
                        names.splice(i, 1);
                        return { ...prevState, keys, names };
                    }
                    return prevState;
                });
            }
        }
        else if (state.estado === 1) {
            if (a) {
                setState((prevState) => ({
                    ...prevState,
                    x: [...prevState.x, b.id]
                }));
            }
            else {
                setState((prevState) => ({
                    ...prevState,
                    x: prevState.x.filter((id) => id !== b.id)
                }));
            }
        }
    }
    function periodo(m) {
        const aux = {};
        for (const i in m) {
            if (!(m[i]._se in aux)) {
                aux[m[i]._se] = [];
            }
            if (state.estado === 0)
                aux[m[i]._se].push(periodios(i, m[i]));
            else if (state.estado === 1)
                aux[m[i]._se].push(periodios(m[i]._re, m[i]));
        }
        return aux;
    }
    function remove(m) {
        const e = [];
        for (let i = 0; i < m.length;) {
            if (e.includes(m[i]._re))
                m.splice(i, 1);
            else {
                if (m[i]._di.includes(" - A") || m[i]._di.includes(" - B"))
                    m[i]._di = m[i]._di.substring(0, m[i]._di.length - 4);
                else if (!m[i]._el && !m[i]._di.includes(" - OPT"))
                    m[i]._di += " - OPT";
                e.push(m[i]._re);
                i++;
            }
        }
        return m;
    }
    function iDivs(i, a) {
        return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "periodo", children: [_jsx("input", { type: "checkbox", className: "t_mat", name: "t_" + i, id: "t_" + i, value: i, onClick: (e) => { handleCheck(e); } }), _jsx("label", { children: (i) + "º Periodo" })] }), _jsx("div", { className: "as", id: String(i), children: a[i].map(e => e) })] }));
    }
    function periodios(k, i) {
        let checked = false;
        if (state.estado === 0)
            checked = state.names.includes(i._re);
        else if (state.estado === 1)
            checked = state.x.includes(i._re);
        return (_jsxs("div", { className: "check", children: [_jsx("input", { type: "checkbox", name: String(i._ap + i._at), defaultChecked: checked, className: "mat", id: i._re, value: k, onClick: (e) => { handleCheck(e); } }), _jsx("label", { htmlFor: i._re, children: i._di }), _jsx("br", {})] }));
    }
    function mudaTela(i) {
        setState((e) => ({ ...e, estado: i }));
    }
    function tela() {
        if (state.estado === 0) {
            arr = ativas(cur);
            m = remove([...arr]);
            const pe = periodo(m);
            state.x = [];
            return (_jsxs("div", { className: "teste", children: [_jsx("div", { className: "salvar" }), _jsx("div", { className: "slides-content", children: _jsxs("div", { className: "slides", children: [_jsx("div", { className: "intervalo", children: "Quais matérias vc já fez?" }), _jsx("div", { className: "MateriasFeitas-content", children: _jsx("div", { className: "periodo-content", children: _jsxs("div", { className: "lista", children: ["Você", "fez " + state.names.length + " matária(s)" || " fez Nenhuma matéria", _jsx("br", {}), "Você", "possui " + state.keys.reduce((accumulator, value) => accumulator + value, 0) + " crédito(s)" || " não possui créditos", Object.keys(pe).map((a) => { return iDivs(a, pe); })] }) }) })] }) }), _jsx("div", { className: "buttom-content", children: _jsx("input", { type: "submit", value: "Próximo", onClick: () => mudaTela(1) }) })] }));
        }
        else {
            if (state.estado === 1) {
                console.log(state.keys);
                console.log(state.names);
                const cr = state.keys.reduce((accumulator, value) => accumulator + value, 0);
                state.gr = new Grafos(m, cr, state.keys, state.names).matriz();
                const pe = periodo(state.gr);
                let str = "";
                if (Object.keys(pe).length > 0) {
                    if (state.x.length === 0)
                        str = "Você deseja fazer todas as matérias";
                    else if (state.x.length === state.gr.length)
                        str = "Você não quer estudar este semestre";
                    else
                        str = "Você não deseja fazer " + state.x.length + " matéria(s)";
                }
                return (_jsxs("div", { className: "teste", children: [_jsx("div", { className: "salvar" }), _jsx("div", { className: "slides-content", children: _jsxs("div", { className: "slides", children: [_jsx("div", { className: "intervalo", children: "Quais matérias vc não quer fazer?" }), _jsx("div", { className: "MateriasFeitas-content", children: _jsx("div", { className: "periodo-content", children: _jsxs("div", { className: "lista", children: [_jsx("br", {}), str, _jsx("br", {}), Object.keys(pe).length > 0 ? Object.keys(pe).map((a) => { return iDivs(a, pe); }) : _jsx("h3", { children: "Você fez todas as matérias!" }), " "] }) }) })] }) }), _jsxs("div", { className: "buttom-content", children: [_jsx("input", { type: "submit", value: "Voltar", onClick: () => mudaTela(0) }), Object.keys(pe).length > 0 ? _jsx("input", { type: "submit", value: "Próximo", onClick: () => mudaTela(2) }) : " "] })] }));
            }
            else {
                const m = [...state.gr];
                let gp = [];
                for (const a of state.x) {
                    for (const j in m) {
                        if (m[j]._re === a) {
                            m.splice(parseInt(j), 1);
                            break;
                        }
                    }
                }
                const es = new Escolhe(m, cur);
                gp = es.exc();
                gp = gp.splice(0, gp.length > 50 ? 50 : gp.length);
                const b = _jsx("input", { type: "submit", value: "Voltar", onClick: () => mudaTela(1) });
                return _jsx(Comum, { materias: gp, tela: 2, fun: b, cur: cur, separa: false, g: "ª", f: " Grade possível" });
            }
        }
    }
    return tela();
};
export default GeraGrade;
