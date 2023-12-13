import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import '../model/css/Matricular.css';
import { cursos, horarios, dimencao, ativas, periodos } from '../model/Filtro';
import * as html2pdf from 'html2pdf.js';
import { Link } from 'react-router-dom';
import 'bootstrap/scss/bootstrap.scss';
const cores = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"];
const s = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const c = { "engcomp": "Engenharia de computação", "fisica": "Física", "turismo": "Turismo", "matematica": "Matemática" };
const Comum = (props) => {
    const [state, setState] = useState({ b: 0, c: 0, ind: 0, id: 0, materias: props.materias });
    //	let {cur, materias, separa, tela, f, fun, g}: ComumProps = props
    let _cur = window.location.href.split("/")[3];
    _cur = _cur === '' ? "engcomp" : _cur;
    console.log(_cur);
    const _p = props;
    let _passo = [];
    let _quadros = [];
    let _h1 = [];
    let _j = 0;
    let _i = 0;
    let _td = 0;
    let _s = [];
    let _cor = [];
    function inicia() {
        const h = horarios(_cur);
        _h1 = h === undefined ? [] : h;
        grade();
        _passo = [..._quadros].splice(0, _quadros.length > 10 ? 10 : _quadros.length);
        _j = 0;
        _i = 0;
        indices(0);
    }
    useEffect(() => {
    }); // Executado apenas uma vez após a montagem do componente
    function indices(b) {
        _passo = [];
        for (let i = b; i < b + 10 && i < _quadros.length; i++)
            _passo.push(_quadros[b + i]);
    }
    function grade() {
        const arr = [];
        const cor = [];
        const bd = [...state.materias];
        const [th, td] = dimencao(_cur);
        const aux = _p.separa ? separa(bd) : bd;
        _td = td;
        _s = s.slice(0, td);
        const m = Array(td).fill("");
        const m2 = Array(th).fill("");
        for (const a of aux) {
            const cl = Array.from(m2, () => Array.from(m));
            const v = Array.from(m2, () => Array.from(m));
            const r = Math.floor(Math.random() * cores.length);
            for (const b in a) {
                const opt = a[b]._el === false && !a[b]._di.includes(" - OPT") ? " - OPT" : "";
                for (let c = 0; c < td; c++) {
                    for (let d = 0; d < th; d++) {
                        if (a[b]._ho[c]) {
                            if (a[b]._ho[c][d]) {
                                if (v[d][c] === "" || v[d][c] === undefined)
                                    v[d][c] = a[b]._di + opt;
                                else
                                    v[d][c] += " / " + a[b]._di + opt;
                                cl[d][c] = cores[(parseInt(b) + r) % cores.length];
                            }
                        }
                    }
                }
            }
            arr.push(v);
            cor.push(cl);
        }
        _quadros = arr;
        _cor = cor;
    }
    function separa(arr) {
        const aux = [];
        const aux2 = arr[0];
        for (const i of aux2) {
            if (i._se !== aux.length) {
                for (let j = aux.length; j < i._se; j++)
                    aux.push([]);
            }
            aux[i._se - 1].push(i);
        }
        return aux.filter(e => e.some(elemento => elemento !== undefined && elemento !== null));
    }
    function salva(){
        // Cria uma nova div
        const slide = document.createElement('div');
        const tela = document.createElement('div');

        // Adiciona uma classe à nova div
        slide.classList.add('slides2');

        const root = document.querySelector(".seila2")
        // Fazer uma cópia do elemento
        const elementoCopiado = root.cloneNode(true);

        // Anexar a cópia a algum lugar no DOM (por exemplo, ao final do corpo do documento)
        const elementoTexto = elementoCopiado.querySelector('.intervalo');
        // Selecionar o elemento que contém o texto "4ª Grade possível"
        elementoTexto.textContent = "Grade";

        // Insere a nova div interna dentro da div externa
        slide.appendChild(elementoCopiado);
        tela.appendChild(slide);

        const options = {
            margin: [10, 10, 10, 10],
            filename: "Grade.pdf",
            html2canvas: { scale: 5 },
            jsPDF: { unit: "mm", format: "A4", orientation: "landscape" }
        }

        // Centralize o conteúdo
        tela.style.textAlign = "center"; // Centralize horizontalmente
        tela.style.display = "flex";
        tela.style.flexDirection = "column";
        tela.style.width = "100%";
        tela.style.height = "100vh";
        tela.style.justifyContent = "center"; // Centralize verticalmente
        tela.style.alignItems = "center"; // Centralize verticalmente
        tela.style.margin = "auto"; /// Centralize verticalmente
        slide.style.margin = "auto"; /// Centralize verticalmente

        html2pdf().set(options).from(tela).save()
    }
    function isChecked(i, j) {
        const id = `t_${String(i)}_${String(j)}`;
        return _jsx("input", { type: "checkbox", className: "t_mat2", name: id, id: id, value: id });
    }
    function primeiro(n) {
        setState((e) => ({ ...e, id: n - 1 }));
    }
    function selected(e) {
        const checkbox = document.getElementById('section1');
        const r = e.target;
        if (checkbox !== null) {
            checkbox.checked = false;
            const arr = Object.entries(c).filter(item => {
                if (item[1] === r.innerText)
                    return true;
                return false;
            })[0];
            _cur = arr[0];
            state.materias = [ativas(_cur)];
            const p = periodos(_cur);
            if (p !== undefined)
                primeiro(state.id > p ? p : state.id + 1);
        }
    }
    function option(e) {
        return _jsx(Link, { to: "/" + e, onClick: (f) => selected(f), children: c[e] });
    }
    function selects() {
        const item = cursos();
        return (_jsxs("div", { className: "accordion", children: [_jsx("input", { type: "checkbox", id: "section1" }), _jsx("label", { htmlFor: "section1", children: "Cursos" }), _jsx("div", { className: "content-cursos", children: _jsx("div", { className: "cursos", children: item.map((e) => option(e)) }) })] }));
    }
    function mudaTela(i) {
        setState((e) => ({ ...e, b: i }));
    }
    function matricular() {
        if (_p.tela === 2)
            return (_jsx(_Fragment, { children: _jsx("input", { type: "submit", value: "Baixar grade", onClick: () => salva() }) }));
        return (selects());
    }
    function tela() {
        return (_jsxs("div", { className: "grade-content", children: [_jsx("div", { className: "intervalo", children: (state.id + 1) + _p.g + _p.f }), caso()] }));
    }
    function muda() {
        _i = 0;
        if (state.b !== 1)
            return (_jsxs(_Fragment, { children: [_jsx("div", { className: "salvar", children: matricular() }), _jsx("div", { className: "slides", children: _jsx("div", { className: "seila" + _p.tela, children: tela() }) }), _jsxs("div", { className: "footer", children: [_jsxs("div", { className: "buttom-content", children: [_p.fun || " ", _jsx("br", {})] }), _jsx("div", { className: "navigation", children: pages() })] })] }));
        return (_jsx(_Fragment, { children: _jsxs("form", { className: "box", action: "#", method: "post", children: [_jsx("h1", { children: "Login" }), _jsx("input", { type: "text", name: "", placeholder: "Digite sua matrícula" }), _jsx("input", { type: "password", name: "", placeholder: "Digite sua senha" }), _jsx("input", { type: "submit", value: "Matricule-me", onClick: () => { mudaTela(0); alert("Ainda não funciona"); } })] }) }));
    }
    function next(p) {
        let b = state.c + (p ? 10 : state.c >= 10 ? -10 : 0);
        b = (_quadros.length < 10 + b) ? _quadros.length - 10 : b - b % 10;
        indices(b);
        setState((e) => ({ ...e, c: b }));
    }
    function labels(f) {
        const n = f + 1 + state.c;
        const i = _p.tela + "" + (n - 1);
        return (_jsx("label", { htmlFor: "radio" + i, className: "page", onClick: () => { primeiro(n); }, id: "bar" + i, children: n + _p.g }));
    }
    function pages() {
        const h = [];
        if (state.c > 0)
            h.push(_jsx("label", { className: "control prev", onClick: () => { next(false); }, children: "<<" }));
        if (_p.tela !== 3) {
            for (const x in _passo) {
                h.push(labels(parseInt(x)));
            }
            if (state.c + 10 < _quadros.length)
                h.push(_jsx("label", { className: "control next", onClick: () => { next(true); }, children: ">>" }));
        }
        return h;
    }
    function linha(a, b, c) {
        const h = [];
        const s = _td === 6 ? "semana1" : "semana2";
        const key = "th_" + String(_i) + "_" + String(_j) + "_";
        if (b !== null) {
            h.push(_jsx("th", { className: "horario", scope: "col", children: _h1[_i][0] + " às " + _h1[_i][1] }, key)); //
            for (const i in a) {
                if (_p.tela !== 3)
                    h.push(_jsx("th", { className: "grade " + a[i], scope: "col", children: b[i] }, key + "_" + String(i)));
                else {
                    h.push(_jsx("th", { className: "grade", scope: "col", children: isChecked(c, parseInt(i)) }, key + "_" + String(i)));
                }
            }
            _i++;
        }
        else {
            h.push(_jsx("th", { className: "semana " + s, scope: "col" }, key));
            for (const i in a)
                h.push(_jsx("th", { className: "semana " + s, scope: "col", children: a[i] }, key + "_" + String(i)));
        }
        return h;
    }
    function horario(a, b, c) {
        if (_i > 0 && _h1[_i][0] !== _h1[_i - 1][1]) {
            return (_jsxs(_Fragment, { children: [_jsx("tr", { children: _jsx("th", { className: 'intervalo2', colSpan: 7, scope: "row", children: "Intervalo" }) }), _jsx("tr", { className: "tr", children: linha(a, b, c) })] }));
        }
        return (_jsx("tr", { className: "tr", children: linha(a, b, c) }));
    }
    function getHorarios(a, b, c) {
        const h = [];
        if (_i < _h1.length)
            h.push(horario(b, a, c));
        return h;
    }
    function caso() {
        inicia();
        const u = _quadros[state.id];
        return (_jsx(_Fragment, { children: _jsxs("table", { className: "", children: [_jsx("thead", { children: _jsx("tr", { children: linha(_s, null, 0) }) }), _jsx("tbody", { children: u.map((a, b) => { return getHorarios(a, _cor[state.id][b], b); }) })] }) }));
    }
    return muda();
};
export default Comum;
