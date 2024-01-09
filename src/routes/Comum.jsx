import React, { useState } from 'react';
import '../model/css/Comum.css'
import '../model/css/Matricular.css'
import { cursos, horarios, dimencao, ativas, periodos } from '../model/Filtro'
import { Link } from 'react-router-dom';
import Pdf from '../model/util/Pdf'

const cores = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"];
const s = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const c = { "engcomp": "Engenharia de computação", "fisica": "Física", "turismo": "Turismo", "matematica": "Matemática" };
const rand = Math.floor(Math.random() * cores.length)

const Comum = (props) => {
	const [state, setState] = useState({ b: 0, c: 0, ind: 0, id: 0, materias: props.materias })
	
	let _cur = window.location.href.split("/")[3]
	_cur = _cur === '' ? "engcomp" : _cur
	console.log(_cur)
	const _p = props
	let _passo = [];
	let _quadros = [];
	let _h1 = [];
	let _j = 0;
	let _i = 0;
	let _td = 0;
	let _s = [];
	let _cor = [];
	let print = false;

	const dataAtual = new Date();
	const mesAtual = dataAtual.getMonth() + 1; // Os meses são indexados de 0 a 11
	const anoAtual = dataAtual.getFullYear();

	console.log(`Mês atual: ${mesAtual}`);
	console.log(`Ano atual: ${anoAtual}`);
	const data =  String(anoAtual) + "." + (mesAtual > 6 ? "2" : "1")

	function inicia() {
		const h = horarios(_cur)
		_h1 = h === undefined? []: h
		console.log("reste")
		grade()
		_passo = [..._quadros].splice(0, _quadros.length > 10 ? 10 : _quadros.length)
		
		_j = 0
		_i = 0

		indices(0)
	}

	function indices(b) {
		_passo = []
		for (let i = b; i < b + 10 && i < _quadros.length; i++)
			_passo.push(_quadros[b + i])
	}

	function grade() {
		const arr = []
		const cor = []
		const bd = [...state.materias]
		const [th, td] = dimencao(_cur)
		
		const aux = _p.separa ? separa(bd) : bd
		_td = td
		_s = s.slice(0, td)
		const m = Array(td).fill("")
		const m2 = Array(th).fill("")
		for (const a of aux) {
			const cl = Array.from(m2, () => Array.from(m))
			const v = Array.from(m2, () => Array.from(m))
			

			for (const b in a) {
				
				const opt = a[b]._el === false && !a[b]._di.includes(" - OPT") ? " - OPT" : "";
				for (let c = 0; c < td; c++) {
					for (let d = 0; d < th; d++) {
						if (a[b]._ho[c]) {
							if (a[b]._ho[c][d]) {
								if (v[d][c] === "" || v[d][c] === undefined) v[d][c] = a[b]._di + opt
								else v[d][c] += " / " + a[b]._di + opt
								cl[d][c] = cores[(parseInt(b) + rand) % cores.length]
							}
						}
					}
				}
			}
			arr.push(v);
			cor.push(cl);
		}

		_quadros = arr
		_cor = cor
	}

	function separa(arr) {
		const aux = []
		console.log(arr)
		const aux2 = arr[0]
		for (const i of aux2) {
			if (i._se !== aux.length) {
				for (let j = aux.length; j < i._se; j++)
					aux.push([])
			}
			aux[i._se - 1].push(i);
		}
		return aux.filter(e => e.some(elemento => elemento !== undefined && elemento !== null));
	}

	function isChecked(i, j) {
		const id = `t_${String(i)}_${String(j)}`
		return <input type="checkbox" className="t_mat2" name={id} id={id} value={id} />
	}

	function primeiro(n) {
		setState((e) => ({ ...e, id: n - 1 }))
	}

	function selected(e) {
		const checkbox = document.getElementById('section1')
		const r = e.target
		if (checkbox !== null) {
			checkbox.checked = false
			const arr = Object.entries(c).filter(item => {
				if (item[1] === r.innerText)
					return true
				return false
			})[0]
			_cur = arr[0]
			state.materias = [ativas(_cur)]
			const p = periodos(_cur)
			if (p !== undefined)
				primeiro(state.id > p ? p : state.id + 1)
		}
	}

	function salva() {
		print = true
		Pdf(tela())
	}

	function option(e) {
		return <Link to={"/" + e} onClick={(f) => selected(f)}>{c[e]}</Link>
	}

	function selects() {
		const item = cursos()
		return (
			<div className="accordion">
				<input type="checkbox" id="section1" />
				<label htmlFor="section1">Cursos</label>
				<div className="content-cursos">
					<div className="cursos">
						{item.map((e) => option(e))}
					</div>
				</div>
			</div>
		)
	}

	function matricular() {
		if (_p.tela === 2)
			return (
				<>
					<input type="submit" value="Baixar grade" onClick={() => salva()} />
				</>)
		return (
			selects()
		)
	}

	function tela() {
		
		return (
			<div className={print ? "" : "grade-content"}>
				<div className={( print? "": "intervalo")}>
					{print? "" : (state.id + 1) + _p.g + _p.f+" "+data}
				</div>
				{caso()}
			</div>
		)
	}

	function muda() {
		_i = 0
		print = false
		return (
			<>
				<div className="content-grade">
					<div className="salvar">
						{matricular()}
					</div>
					<div className="seila">
						<div className={"slides"}>
							{tela()}
						</div>
					</div>
				</div>
				<div className="footer">
					<div className="buttom-content">
						{_p.fun || " "}<br />
					</div>
					<div className="navigation">
						{pages()}
					</div>
				</div>
			</>
		)
	}

	function next(p) {
		let b = state.c + (p ? 10 : state.c >= 10 ? -10 : 0)
		b = (_quadros.length < 10 + b) ? _quadros.length - 10 : b - b % 10
		indices(b)
		setState((e) => ({ ...e, c: b }))
	}

	function labels(f) {
		const n = f + 1 + state.c
		const i = _p.tela + "" + (n - 1)
		let h = <input type="radio" id={"radio"+_p.tela+"_"+ i} key={"radio"+_p.tela+"_"+ i+"_r"} name={"tela"+_p.tela} className={"radio"+_p.tela}/>
		if(state.id === n-1)
			h = <input type="radio" id={"radio"+_p.tela+"_"+ i} key={"radio"+_p.tela+"_"+ i+"_r"} name={"tela"+_p.tela} className={"radio"+_p.tela} defaultChecked/>

		return (
			<>
			{h}
			<label  htmlFor={"radio"+_p.tela+"_"+ i} key={"radio"+_p.tela+"_"+ i+"_l"} className={"page"} onClick={() => { primeiro(n) }} id={"bar" + i}>
				{n + _p.g}
			</label>
			</>
		)
	}

	function pages() {
		const h = []


		if (state.c > 0)
			h.push(<label className="control prev" onClick={() => { next(false) }}>{"<<"}</label>)
		if (_p.tela !== 3) 
			for (const x in _passo) {
				h.push(labels(parseInt(x)))
			}
		if (state.c + 10 < _quadros.length)
			h.push(<label className="control next" onClick={() => { next(true) }}>{">>"}</label>)
		
		return h
	}

	function linha(a, b, c) {
		

		const h = []
		const s = _td === 6 ? "semana1" : "semana2"
		const r = _td === 6 ? "s2" : "s1"
		const key = "th_" + String(_i) + "_" + String(_j) + "_";

		if (b !== null) {
			h.push(<th key={key} className={print ? r+" " : "horario"} scope="col">{_h1[_i][0] + " às " + _h1[_i][1]}</th>)//
			for (const i in a) {
				if (_p.tela !== 3)
					h.push(<th key={key + "_" + String(i)} className={( print? r+" ": "grade ") + a[i]} scope="col" >{b[i]}</th>)
				else {
					h.push(
						<th key={key + "_" + String(i)} className={print ? r+" " : "grade"} scope="col" >
							{isChecked(c, parseInt(i))}
						</th>
					)
				}
			}
			_i++
		} else {
			h.push(<th key={key} className={(print ? r : "semana " + s)} scope="col">{(print ? "Grade " + data : "")}</th>)
			for (const i in a)
				h.push(<th key={key + "_" + String(i)} className={(print? r : "semana " + s)} scope="col">{a[i]}</th>)
		}
		return h
	}

	function horario(a, b, c) {
		if (_i > 0 && _h1[_i][0] !== _h1[_i - 1][1]) {
			return (
				<>
					<tr className={print ? "inte": "" }><th className={(print ? "" : 'intervalo2')} colSpan={7}>{(print ? "" : 'Intervalo')}</th></tr >
					<tr className={print ? "" : "tr"}>{linha(a, b, c)}</tr>
				</>)
		}
		return (<tr className={print ? "" : "tr"}>{linha(a, b, c)}</tr>)
	}

	function getHorarios(a, b, c) {
		const h = []
		
		if (_i < _h1.length)
			h.push(horario(b, a, c))
		return h
	}

	function caso() {
		inicia()
		
		const u = _quadros[state.id]
		console.log(u)
		if(!print)
			return (
				<table>
					<thead>
						<tr>{linha(_s, null, 0)}</tr>
					</thead>
					<tbody>
						{u.map((a, b) => { return getHorarios(a, _cor[state.id][b], b) })}
					</tbody>
				</table>
			)
		return (
			<table className={"table"}>
				<tr>{linha(_s, null, 0)}</tr>
				{u.map((a, b) => { return getHorarios(a, _cor[state.id][b], b) })}
			</table>
		)
	}

	return muda()
	
}

export default Comum
