import React, { useState, useEffect, useId } from 'react'
import '../model/util/css/Matricular.css'
import { cursos, horarios, dimencao, ativas } from '../model/Filtro'
import * as html2pdf from 'html2pdf.js'
import { Link } from 'react-router-dom'

const cores = ["l0", "l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9", "l10"]
const s = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const c = { "engcomp": "Engenharia de computação", "fisica": "Física", "turismo": "Turismo", "matematica": "Matemática" }

const Comum = (props) => {
	const [state, setState] = useState({
		b: 0,
		ind: 0,
		id: 0,
		se: props.separa,
	})

	let _arr = props.materias
	const _t = props.tela
	const _f = props.f
	const _g = props.g
	const fun = props.fun
	let cur = props.cur === undefined ? "engcomp" : props.cur
	let passo = []
	let quadros = []
	let _cor = []
	let _td = 0
	let _j = 0
	let _i = 0
	let _b = 0
	let _s = []
	let h1 = []

	const inicia = () => {
		getCurso()
		grade()
		passo = [...quadros].splice(0, quadros.length > 10 ? 10 : quadros.length)
		h1 = horarios(cur)
		_j = 0
		_i = 0
		indices(0)
	}

	const getCurso = () => {
		let a = window.location.href.split("/")[3]
		if (a !== cur && a !== "") {
			cur = a
		}
	}

	useEffect(() => {
		getCurso()
	}, [cur])

	const indices = (b) => {
		passo = []
		for (let i = b; i < b + 10 && i < quadros.length; i++)
			passo.push(quadros[b + i])
	}

	const grade = () => {
		const arr = []
		const cor = []
		const bd = [..._arr]
		const [th, td] = dimencao(cur)
		const aux = state.se ? separa(bd) : bd
		const m = Array(td).fill("")
		const m2 = Array(th).fill("")
		_s = s.slice(0, td)
		_td = td

		for (const a of aux) {
			const cl = Array.from(m2, () => Array.from(m))
			const v = Array.from(m2, () => Array.from(m))
			const r = Math.floor(Math.random() * cores.length)

			for (const b in a) {
				const opt = a[b]._el === false && !a[b]._di.includes(" - OPT") ? " - OPT" : ""
				for (let c = 0; c < td; c++) {
					for (let d = 0; d < th; d++) {
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

	const separa = (arr) => {
		let aux = []
		for (const i of arr) {
			if (i._se !== aux.length) {
				for (let j = aux.length; j < i._se; j++) aux.push([])
			}
			aux[i._se - 1].push(i)
		}
		return aux.filter((e) => e.some((elemento) => elemento !== undefined && elemento !== null))
	}

	const salva = () => {
		const slide = document.createElement('div')
		const tela = document.createElement('div')
		slide.classList.add('slides2')
		const root = document.querySelector('.seila2')
		const elementoCopiado = root.cloneNode(true)
		const elementoTexto = elementoCopiado.querySelector('.intervalo')
		elementoTexto.textContent = 'Grade'
		slide.appendChild(elementoCopiado)
		tela.appendChild(slide)

		const options = {
			margin: [10, 10, 10, 10],
			filename: 'Grade.pdf',
			html2canvas: { scale: 5 },
			jsPDF: { unit: 'mm', format: 'A4', orientation: 'landscape' },
		}

		tela.style.textAlign = 'center'
		tela.style.display = 'flex'
		tela.style.flexDirection = 'column'
		tela.style.width = '100%'
		tela.style.height = '100vh'
		tela.style.justifyContent = 'center'
		tela.style.alignItems = 'center'
		tela.style.margin = 'auto'
		slide.style.margin = 'auto'

		html2pdf().set(options).from(tela).save()
	}

	const isChecked = (i, j) => {
		const id = 't_' + i + '_' + j
		return <input type="checkbox" className="t_mat2" name={id} id={id} value={id} />
	}

	const primeiro = (n) => {
		setState((e) => ({ b: e.b, ind: e.ind, id: n - 1, se: e.se }))
	}

	const selected = (e) => {
		let checkbox = document.getElementById('section1')
		checkbox.checked = false
		const arr = Object.entries(c).filter((item) => {
			if (item[1] === e.target.innerText) return true
			return false
		})[0]
		cur = arr[0]
		_arr = ativas(cur)
		primeiro(state.id > quadros.length ? quadros.length : state.id + 1)
	}

	const option = (e) => {
		return <Link to={'/' + e} onClick={(f) => selected(f)}>{c[e]}</Link>
	}

	const selects = () => {
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

	const mudaTela = (e, i) => {
		setState({ b: i })
		setState((e) => ({ b: i, ind: e.ind, id: e.id, se: e.se }))
	}

	const matricular = () => {
		if (_t === 2)
			return (
				<input type="submit" value="Baixar grade" onClick={() => salva()} />
			)
		return selects()
	}

	const tela = () => {
		let i = state.id
		return (
			<div className="grade-content">
				<div className="intervalo">{i + 1 + _g + _f}</div>
				{caso()}
			</div>
		)
	}

	const muda = () => {
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

	const next = (p) => {
		_b += p ? 10 : _b >= 10 ? -10 : 0
		_b = quadros.length < 10 + _b ? quadros.length - 10 : _b - _b % 10
		indices(_b)
		setState((e) => ({ b: e.b, ind: e.ind, id: e.id, se: e.se }))
	}

	const pages = () => {
		let h = []
		if (_b > 0) h.push(<label className="control prev" onClick={(e) => { next(false) }}>{'<<'}</label>)
		if (_t !== 3) {
			for (const x in passo) {
				h.push(labels(x))
			}
			if (_b + 10 < quadros.length) h.push(<label className="control next" onClick={(e) => { next(true) }}>{'>>'}</label>)
		}
		return h
	}

	const labels = (f) => {
		const n = parseInt(f) + 1 + _b
		const i = _t + "" + (n - 1)
		return (
			<label htmlFor={'radio' + i} className={'page'} onClick={(e) => { primeiro(n) }} id={'bar' + i}>
				{n + _g}
			</label>
		)
	}

	const linha = (a, b, c) => {
		let h = []
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

	const horario = (a,b,c) => {
		if (_i > 0 && h1[_i][0] !== h1[_i - 1][1]) {
			return (
				<>
					<tr><th className='intervalo2' colSpan="7" scope="row">Intervalo</th></tr>
					<tr className="tr">{linha(a, b, c)}</tr>
				</>)
		}
		return (<tr className="tr">{linha(a, b, c)}</tr>)
	}

	const getHorarios = (a, b, c) => {
		let h = []
		if (_i < h1.length)
			h.push(horario(b,a,c))
		return h
	}

	const caso = (c) => {
		inicia()
		let u = quadros[state.id] || []
		return (
			<>
				<table className="">
					<thead>
						<tr key={String(c) + '_'}>{linha(_s, null)}</tr>
					</thead>
					<tbody>
						{u.map((a, b) => { return getHorarios(a, _cor[state.id][b], b)})}
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
