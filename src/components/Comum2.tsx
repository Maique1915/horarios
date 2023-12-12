import React, { useEffect, useState, useId } from 'react';
import '../model/util/css/Matricular.css'
import { cursos, horarios, dimencao, ativas } from '../model/Filtro'
import * as html2pdf from 'html2pdf.js'
import { Link } from 'react-router-dom';
import Materia from '../model/Materia'

const cores: string[] = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"];
const s: string[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const c: Record<string, string> = {"engcomp": "Engenharia de computação", "fisica": "Física", "turismo": "Turismo", "matematica": "Matemática" };

interface HomeProps {
	cur: string;
	materias: Materia[];
	separa: boolean;
	tela: number;
	f: string;
	fun: JSX.Element;
	g: string;
}

interface HomeState {
	se: boolean;
	b: number;
	id: number;
	ind: number;
}

function Comum(props: HomeProps): JSX.Element{
	const [state, setState] = useState<HomeState> ({
		ind: 0,
		id: 0,
		se: props.separa,
		b: 0,
	});

	let cur: string = props.cur === undefined ? "engcomp" : props.cur;
	const fun: JSX.Element = props.fun;
	const _g: string = props.g;
	const _f: string = props.f;
	const _t: number = props.tela;
	let _arr: Materia[] = props.materias;
    let _b: number = 0;
	let passo!: string[][][];
	let quadros!: string[][][];
	let h1: string[][] | undefined = [];
    let _j: number = 0;
    let _i: number = 0;
	let _td: number = 0;
	let _th: number = 0;
    let _s!: string[];
	let _cor!: string[][][];

	function inicia() {
		getCurso()
		grade()
		passo = [...quadros].splice(0, quadros.length > 10 ? 10 : quadros.length)
		h1 = horarios(cur)
		_j = 0
		_i = 0
		indices(0)
	}
	function getCurso() {
		let a = window.location.href.split("/")[3]
		if (a !== cur && a !== "") {
			cur = a
		}
	}

	useEffect(() => {
		getCurso()
	}, [cur])
	function indices(b: number) {
		passo = []
		if (quadros !== undefined && quadros !== null)
			for (let i = b; i < b + 10 && i < quadros.length; i++)
				passo.push(quadros[b + i])
	}

	function grade() {
		const arr: string[][][] = [];
		const cor: string[][][] = [];
		const bd: Materia[] = [..._arr];

		const [lin, col] = dimencao(cur);
		const aux: Materia[][] = state.se ? separa(bd) : [bd];
		_td = col;
		_s = s.slice(0, col);

		const m: string[] = Array(col).fill('');
		const m2: string[] = Array(lin).fill('');

		for (const a of aux) {
			const cl = Array.from(m2, () => Array.from(m))
			const v = Array.from(m2, () => Array.from(m))
			const r = Math.floor(Math.random() * cores.length)

			for (const b in a) {
				const opt = a[b]._el === false && !a[b]._di.includes(" - OPT") ? " - OPT" : ""
				for (let c = 0; c < col; c++) {
					for (let d = 0; d < lin; d++) {
						if (a[b]._ho[c]) {
							if (a[b]._ho[c][d]) {
								if (v[d][c] === "" || v[d][c] === undefined) v[d][c] = a[b]._di + opt
								else v[d][c] += " / " + a[b]._di + opt
								cl[d][c] = cores[(parseInt(b) + r) % cores.length]
							}
						}
					}
				}
			}
			arr.push(v)
			cor.push(cl)
		}
		quadros = arr
		_cor = cor
	}
	function separa(arr: Materia[]): Materia[][] {
		const aux: Materia[][] = [];

		for (const i of arr) {
			if (i._se != aux.length) {
				for (let j = aux.length; j < i._se; j++)
					aux.push([])
			}
			aux[i._se - 1].push(i);
		}
		return aux.filter(e => e.some(elemento => elemento !== undefined && elemento !== null));
	}
	function salva(): void {
		// Cria uma nova div
		const slide = document.createElement('div');
		const tela = document.createElement('div');

		// Adiciona uma classe à nova div
		slide.classList.add('slides2');

		const root = document.querySelector('.seila2');

		// Fazer uma cópia do elemento
		if (root !== null) {
			const elementoCopiado = root.cloneNode(true) as HTMLElement;

			// Anexar a cópia a algum lugar no DOM (por exemplo, ao final do corpo do documento)
			const elementoTexto = elementoCopiado.querySelector('.intervalo');

			// Selecionar o elemento que contém o texto "4ª Grade possível"
			if (elementoTexto !== null) {
				elementoTexto.textContent = 'Grade';
			}

			// Insere a nova div interna dentro da div externa
			slide.appendChild(elementoCopiado);
			tela.appendChild(slide);

			const options: html2pdf.Options = {
				margin: [10, 10, 10, 10],
				filename: 'Grade.pdf',
				html2canvas: { scale: 5 },
				jsPDF: { unit: 'mm', format: 'A4', orientation: 'landscape' },
			};

			// Centralize o conteúdo
			tela.style.textAlign = 'center'; // Centralize horizontalmente
			tela.style.display = 'flex';
			tela.style.flexDirection = 'column';
			tela.style.width = '100%';
			tela.style.height = '100vh';
			tela.style.justifyContent = 'center'; // Centralize verticalmente
			tela.style.alignItems = 'center'; // Centralize verticalmente
			tela.style.margin = 'auto'; /// Centralize verticalmente
			slide.style.margin = 'auto'; /// Centralize verticalmente

			html2pdf().set(options).from(tela).save();
		}
	}
	function isChecked(i: number, j: number): JSX.Element {
		const id: string = `t_${i}_${j}`;

		return (
			<input
				type="checkbox"
				className="t_mat2"
				//onClick={(e) => this.atualiza(i, j, e.target)}
				name={id}
				id={id}
				value={id}
			/>
		);
	}
	function primeiro(n: number): void {
		setState((prev) => ({ se: prev.se, ind: prev.ind, id: n - 1, b: prev.b }))
	}

	function selected(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void {
		const checkbox = document.getElementById('section1') as HTMLInputElement | null;
		if (checkbox) {
			checkbox.checked = false;
		}

		const arr = Object.entries(c).find((item) => item[1] === e.currentTarget.innerText)

		if (arr) {
			cur = arr[0];
			_arr = ativas(cur);
			primeiro(state.id > quadros.length ? quadros.length : state.id + 1);
		}
	}
	function option(e: string): JSX.Element {
		return <Link to={'/' + e} onClick={(f) => selected(f)}>{c[e]}</Link>
	}

	function selects() {
		const item = cursos()
		return (
			<div className="accordion">
				<input type="checkbox" id="section1" />
				<label htmlFor="section1">Cursos</label>
				<div className="content-cursos">
					<div className="cursos">{item.map((e) => option(e))}</div>
				</div>
			</div>
		)
	}
	function mudaTela(i) {
		setState({ b: i })
		setState((e) => ({ b: i, ind: e.ind, id: e.id, se: e.se }))
	}
	function matricular(): JSX.Element {
		if (_t === 2)
			return (
				<input type="submit" value="Baixar grade" onClick={() => salva()} />
			)
		return selects()
	}
	function tela(): JSX.Element {
		let i = state.id
		return (
			<div className="grade-content">
				<div className="intervalo">{i + 1 + _g + _f}</div>
				{caso()}
			</div>
		)
	}
	function muda() {
		_i = 0
		if (state.b !== 1)
			return (
				<>
					<div className="salvar">{matricular()}</div>
					<div className="slides">
						<div className={'seila' + _t}>{tela()}</div>
					</div>
					<div className="footer">
						<div className="buttom-content">{fun || ' '}</div>
						<div className="navigation">{pages()}</div>
					</div>
				</>
			)

		return (
			<>
				<form className="box" action="#" method="post">
					<h1>Login</h1>
					<input type="text" name="" placeholder="Digite sua matrícula" />
					<input type="password" name="" placeholder="Digite sua senha" />
					<input type="submit" value="Matricule-me" onClick={(e) => { mudaTela(e, 0); alert("Ainda não funciona") }} />
				</form>
			</>
		)
	}
	function next(p: boolean): void {
		_b += p ? 10 : _b >= 10 ? -10 : 0
		_b = quadros.length < 10 + _b ? quadros.length - 10 : _b - _b % 10
		indices(_b)
		setState((e) => ({ b: e.b, ind: e.ind, id: e.id, se: e.se }))
	}

	function pages(): JSX.Element[] {
		const h: JSX.Element[] = []
		if (_b > 0) h.push(<label className="control prev" onClick={() => { next(false) }}>{'<<'}</label>)
		if (_t !== 3) {
			for (const x in passo) {
				h.push(labels(x))
			}
			if (_b + 10 < quadros.length) h.push(<label className="control next" onClick={() => { next(true) }}>{'>>'}</label>)
		}
		return h
	}
	function labels(f: number): JSX.Element {
		const n = parseInt(f) + 1 + _b
		const i = _t + "" + (n - 1)
		return (
			<label htmlFor={'radio' + i} className={'page'} onClick={() => { primeiro(n) }} id={'bar' + i}>
				{n + _g}
			</label>
		)
	}
	function linha(a: string[], b: string | null | string[], c: number): JSX.Element[] {
		const h: JSX.Element[] = []
		let s = _td === 6 ? "semana1" : "semana2"
		if (b !== null) {
			h.push(<th className="horario" scope="col">{h1[_i][0] + ' às ' + h1[_i][1]}</th>)
			for (const i in a) {
				if (_t !== 3)
					h.push(<th className={'grade ' + a[i]} scope="col" name={b}>{b[i]}</th>)
				else {
					h.push(
						<th className="grade" scope="col" >
							{isChecked(c, i)}
						</th>
					)
				}
			}
			_i++
		} else {
			h.push(<th className={'semana ' + s} scope="col"></th>)
			for (const i in a)
				h.push(<th className={'semana ' + s} scope="col">{a[i]}</th>)
		}

		return h
	}

	function horario (a: string[], b: string | string[], c: number): JSX.Element {
		if (_i > 0 && h1[_i][0] !== h1[_i - 1][1]) {
			return (
				<>
					<tr><th className='intervalo2' colSpan={ 7 } scope="row">Intervalo</th></tr>
					<tr className="tr">{linha(a, b, c)}</tr>
				</>)
		}
		return (<tr className="tr">{linha(a, b, c)}</tr>)
	}

	function getHorarios (a: string[] | string, b: string[], c: number): JSX.Element[] {
		const h: JSX.Element[] = []
		if (_i < h1.length)
			h.push(horario(b, a, c))
		return h
	}

	function caso(c: number): JSX.Element {
		inicia()
		let u = quadros[state.id] || []
		return (
			<>
				<table className="">
					<thead>
						<tr key={String(c) + '_'}>{linha(_s, null, 0)}</tr>
					</thead>
					<tbody>
						{u.map((a, b) => { return getHorarios(a, _cor[state.id][b], b) })}
					</tbody>
				</table>
			</>
		)
	}

	return (
		<>{muda()}</>
	)
}

export default Comum