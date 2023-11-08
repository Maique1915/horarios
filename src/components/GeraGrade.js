import '../model/util/css/GeraGrade.css'
import React from 'react';
import Comum from './Comum'
import Grafos from '../model/util/Grafos'
import Escolhe from '../model/util/Escolhe'


import materias from '../model/db1'

export default class GeraGrade extends React.Component{

	constructor(){
		super()
		this.state ={names: [], keys: [], x:[], cr:[], b: 0}
		this.handleCheck = this.handleCheck.bind(this);
	}

	handleCheck(e) {
		if(e.target.className === 't_mat'){
			let per = document.getElementById(e.target.value).getElementsByClassName("check");
			for(let i = 0; i < per.length; i++){
				let mat = per[i].firstChild
				mat.checked = e.target.checked
				let id = 0
				if(this.state.b === 0)
					id = this.state.keys.indexOf(parseInt(mat.value))
				else if(this.state.b === 1)
					id = this.state.x.indexOf(mat.id)

				if(e.target.checked === true && id === -1)
					this.altera(true, mat)
				else if(e.target.checked === false && id >= 0)
					this.altera(false, mat)
			}
		}else{
			if(e.target.checked === true)
				this.altera(true, e.target)
			else if(e.target.checked === false){
				this.altera(false, e.target)
			}
		}
		this.setState({})
	}

	altera(a,b){
		if(this.state.b === 0){
			if(a){
				this.state.keys.push(parseInt(b.value))
				this.state.names.push(b.id)
				this.state.cr.push(parseInt(b.attributes.cr.value))
				return
			}
			const i = this.state.keys.indexOf(parseInt(b.value))
			this.state.keys.splice(i,1)
			this.state.names.splice(i,1)
			this.state.cr.splice(i,1)
		}else if(this.state.b === 1){
			if(a){
				this.state.x.push(b.id)
				return
			}
			this.state.x.splice(this.state.x.indexOf(b.id),1)
		}
		document.getElementById("t_"+b.parentNode.parentNode.id).checked = false
	}

	mudaTela(e, i){
  		e.preventDefault()
  		this.setState({b : i})
	}

	periodo(m){
		let aux = {}
		for (let i = 0; i < m.length; i++) {
			if(!(m[i]._se in aux)){
				aux[m[i]._se] = []
			}
			if(this.state.b === 0)
				aux[m[i]._se].push(this.periodios(i,m[i]))
			else if(this.state.b === 1)
				aux[m[i]._se].push(this.periodios(m[i]._re,m[i]))
		}
		return aux
	}

	remove(m){
		let i = 0
		let e = []
		while(i < m.length){
			if (e.includes(m[i]._re))
				m.splice(i,1)
			else{
				if(m[i]._di[m[i]._di.length-1] === "A" || m[i]._di[m[i]._di.length-1] === "B")
					m[i]._di = m[i]._di.substring(0, m[i]._di.length-4)
				else if(!m[i]._el && !m[i]._di.includes(" - OPT"))
					m[i]._di += " - OPT"
				e.push(m[i]._re)

				i++
			}
		}
		return m
	}

	iDivs(i, k, a){
		return (
			<>
				<div className="periodo">
					<input type="checkbox" className="t_mat" name={"t_"+i} id={"t_"+i} value={i} onClick={(e)=>{this.handleCheck(e)}}/>
					<label>{(i)+"º Periodo"}</label>
				</div>
				<div className="as" id ={i}>{a[i].map(e => e)}</div>
			</>
			)
	}

	periodios(k, i){
		let checked = false
		if (this.state.b === 0)
			checked = this.state.keys.includes(k)
		else if (this.state.b === 1)
			checked = this.state.x.includes(i._re)


		return(
			<div className="check">
				<input type="checkbox" cr={i._ap+i._at} defaultChecked={checked} className="mat" id={i._re} name={i._re} value={k} onClick={(e)=>{this.handleCheck(e)}}/>
				<label htmlFor={i._re}>{i._di}</label><br/>
			</div>
			)
	}

	tela(){//
		if (this.state.b === 0) {
			this.m = this.remove([...materias])
			let as = this.periodo(this.m)
			this.state.x = []
			this.cr = this.state.cr.reduce((accumulator,value) => accumulator + value, 0)

			return(
			<div className="teste">
			<div className="salvar"/>
				<div className="slides-content">
					<div className="slides">
						<div className="intervalo">Quais matérias vc já fez?</div>
						<div className="MateriasFeitas-content">
							<div className="periodo-content">
								<div className="lista">
									Você&nbsp;
										{"fez "+this.state.names.length+" matéria(s)" ||" fez Nenhuma matéria" }
										<br/>
											Você&nbsp;
										{"possui "+this.cr+" crédito(s)"||" não possui créditos"}
				          			{Object.keys(as).map((a,b)=>{return this.iDivs(a,b, as)})}
						        </div>
							</div>
						</div>
					</div>
				</div>
				<div className="buttom-content">
					<input type="submit" value="Próximo" onClick={(e) => this.mudaTela(e, 1)}/>
				</div>
			</div>
			)
		}else if(this.state.b === 1){
			this.gr = new Grafos(this.m, this.cr, this.state.keys, this.state.names).matriz()
			let as = this.periodo(this.gr)
			let str = ""

			if(Object.keys(as).length > 0){
				if(this.state.x.length === 0)
					str = "Você deseja fazer todas as matérias"
				else if(this.state.x.length === this.gr.length)
					str = "Você não quer estudar este semestre"
				else
					str = "Você não deseja fazer "+this.state.x.length+" máteria(s)"
			}
			return (
				<div className="teste">
					<div className="salvar"/>
					<div className="slides-content">
						<div className="slides">
							<div className="intervalo">Quais matérias vc não quer fazer?</div>
							<div className="MateriasFeitas-content">
								<div className="periodo-content">
									<div className="lista">
									<br/>
									{str}
									<br/>
				          			{Object.keys(as).length > 0 ? Object.keys(as).map((a,b)=>{return this.iDivs(a,b, as)}): <h3>Você fez todas as matérias!</h3>}&nbsp;
						        </div>
								</div>
							</div>
						</div>
					</div>
					<div className="buttom-content">
						<input type="submit" value="Voltar" onClick={(e) => this.mudaTela(e, 0)}/>
						{Object.keys(as).length > 0 ? <input type="submit" value="Próximo" onClick={(e) => this.mudaTela(e, 2)}/>:" "}
					</div>
				</div>
			)
		}else{
			let m = [...this.gr]

			for(const a of this.state.x){
  				for(const j in m){
  					if(m[j]._re === a){
  						m.splice(j,1)
  						break
  					}
  				}
  			}

			const es = new Escolhe(m)
			m = es.exc()
			m = m.splice(0, m.length > 50? 50: m.length)
			let b = <input type="submit" value="Voltar" onClick={(e) => this.mudaTela(e, 1)}/>
			return( 
				<Comum materias = {m} tela={2} fun={b} separa={false} g={"ª"} f={" Grade possível"}/>

			)
		}
	}
	render(){
		return this.tela()
	}
}
