import React, { useState, useEffect } from 'react';
import Comum from './Comum';
import Grafos from '../model/util/Grafos';
import Escolhe from '../model/util/Escolhe';
import { ativas } from '../model/Filtro';
import '../model/css/GeraGrade.css'

let _cur = ''
let gr = []
const GeraGrade = ({ cur }) => {
	const [state, setState] = useState({keys: [], crs: [], estado: 0, x: []});
	let arr = ativas(cur);
	let m = remove([...arr])

	useEffect(() => {
		if (cur !== _cur) {
			
			_cur = cur
			setState(({keys: [], crs: [], estado: 0, x: [] }))
			gr = []
		}
	})
	function muda() {
		const a = window.location.href.split("/")[3]
		if (a !== _cur && (a !== "" && a !== undefined)) {
			_cur = a
			cur = a
			state.keys = []
			state.crs = []
			state.estado = 0
			state.x = []
			gr = []
		}
	}

	function handleCheck(e) {
		const r = e.target
		if (r.className === 't_mat') {
			const b = r.checked;
			const el = document.getElementById(r.value);

			if (el !== null) {
				const per = el.getElementsByClassName("mat");
				for (const mat of per) {
					if (mat) {
						mat.checked = b
						let id = 0

						if (state.estado === 0)
							id = state.keys.indexOf(mat.id);
						else if (state.estado === 1)
							id = state.x.indexOf(mat.id)

						if (b && id === -1) 
							altera(true, mat)
						else if (!b && id >= 0)
							altera(false, mat)
					}
				}
				r.checked = b
			}
		} else {
			if (r.checked === true) 
				altera(true, r);
			else if (r.checked === false)
				altera(false, r);
		}
		setState((s) =>({...s}))
	}

	function periodo(m) {
		const aux = {};
		let checked = false
		for (const i in m) {
			if (!(m[i]._se in aux)) {
				aux[m[i]._se] = []
			}
			if (state.estado === 0) {
				checked = state.keys.includes(m[i]._re)
			} else if (state.estado === 1) {
				checked = state.x.includes(m[i]._re)
			}
			aux[m[i]._se].push(periodios(m[i]._re, m[i], checked))
		}
		return aux
	}

	function periodios(k, i, c) {
		return (
			<div className="check">
				<input type="checkbox" key={i._re + "_" + state.estado} name={String((parseInt(i._ap) + parseInt(i._at)))} defaultChecked={c} className="mat" id={i._re} value={i._re} onClick={(e) => { handleCheck(e) }} />
				<label id={i._di} key={i._re + "_l_" + state.estado} htmlFor={i._re}>{i._di}</label><br />
			</div>
		)
	}

	function altera(a, b) {
		if (state.estado === 0 && a) {
			state.keys.push(b.id)
			state.crs.push(parseInt(b.name))
		} else if (state.estado === 0 && !a) {
			const id = state.keys.indexOf(b.id)
			state.keys.splice(id, 1)
			state.crs.splice(id, 1)
		} else if (state.estado === 1 && a)
			state.x.push(b.id)
		else if (state.estado === 1 && !a)
			state.x.splice(state.x.indexOf(b.id), 1)
	}

	function remove(m) {
		const e  = []
		for (let i = 0; i < m.length;){
			if (e.includes(m[i]._re))
				m.splice(i,1)
			else{
				if (m[i]._di.includes(" - A") || m[i]._di.includes(" - B"))
					m[i]._di = m[i]._di.substring(0, m[i]._di.length-4)
				else if(!m[i]._el && !m[i]._di.includes(" - OPT"))
					m[i]._di += " - OPT"
				e.push(m[i]._re)
				i++
			}
		}
		return m
	}

	function iDivs (i, a) {
		return (
			<>
				<div className="periodo">
					<input key={String(i) + "_" + String(state.estado) + "_p"} type="checkbox" className="t_mat" name={"t_"+i} id={"t_"+i} value={i} onClick={(e)=>{handleCheck(e)}}/>
					<label key={String(i) + "_" + String(state.estado) + "_l"} id={"l_"+i }>{(i) +"º Período"}</label>
				</div>
				<div className="as" id={String(i)} key={String(i) + "_" + String(state.estado)}>{a[i].map(e => e)}</div>
			</>
			)
	}

	function mudaTela(i) {
		if (state.estado !== i)
			setState((e) => ({ ...e, estado: i }))
	}

	function tela() {
		muda()
		if (state.estado === 0) {
			arr = ativas(cur)
			m = remove([...arr])
			state.x = []
			const pe = periodo(m)
			let str = "Você fez nenhuma matéria"
			let cr = "Você não possui créditos"
			if (state.keys.length > 0) {
				str = "Você fez " + (state.keys.length) + " matéria(s)"
				cr = "Você possui " + state.crs.reduce((accumulator, value) => accumulator + value, 0) + " crédito(s)"
			}
			return (
				<div className="teste">
					<div className="salvar" />
					<div className="slides-content">
						<div className="slides">
							<div className="intervalo">{"Quais matérias vc já fez?"}</div>
							<div className="MateriasFeitas-content">
								<div className="periodo-content">
									<div className="lista">
										{str}
										<br/>
										{cr}
										{Object.keys(pe).map((a) => { return iDivs(a, pe) })}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="buttom-content">
						<input type="submit" value={"Próximo"} onClick={() => mudaTela(1)} />
					</div>
				</div>
			)
		} else {
			if (state.estado === 1) {
				const cr = state.crs.reduce((accumulator, value) => accumulator + value, 0)
				gr = new Grafos(m, cr, state.keys).matriz()
				const pe = periodo(gr)
				let str = ""

				if (Object.keys(pe).length > 0) {
					if (state.x.length === 0)
						str = "Você deseja fazer todas as matérias"
					else if (state.x.length === gr.length)
						str = "Você não quer estudar este semestre"
					else
						str = "Você não deseja fazer " + state.x.length + " máteria(s)"
				}

				return (
					<div className="teste">
						<div className="salvar" />
						<div className="slides-content">
							<div className="slides">
								<div className="intervalo">{"Quais matérias vc não quer fazer?"}</div>
								<div className="MateriasFeitas-content">
									<div className="periodo-content">
										<div className="lista">
											<br />
											{str}
											<br />
											{Object.keys(pe).length > 0 ? Object.keys(pe).map((a) => { return iDivs(a, pe) }) : <h3>Você fez todas as matérias!</h3>}&nbsp;
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="buttom-content">
							<input type="submit" value="Voltar" onClick={() => mudaTela(0)} />
							{Object.keys(pe).length > 0 ? <input type="submit" value={"Próximo"} onClick={() => mudaTela(2)} /> : " "}
						</div>
					</div>
				)
			} else {
				const m = [...gr]
				let gp = []
				for (const a of state.x)
					for (const j in m)
						if (m[j]._re === a) {
							m.splice(parseInt(j), 1)
							break
						}

				const es = new Escolhe(m, cur)
				gp = es.exc()
				gp = gp.splice(0, gp.length > 50 ? 50 : gp.length)
				const b = <input type="submit" value="Voltar" onClick={() => mudaTela(1)} />

				return <Comum materias={gp} tela={2} fun={b} cur={cur} separa={false} g={"ª"} f={" Grade possível"} />
			}
		}
	}
	return tela()
}

export default GeraGrade
