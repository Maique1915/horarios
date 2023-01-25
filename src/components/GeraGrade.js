import '../model/util/css/GeraGrade.css'
import React from 'react';
import Horarios from './Horarios'
import { Link } from 'react-router-dom';
import AG from '../model/ag/AG'
import materias from '../model/db'
import Escolhe from '../model/util/Escolhe'
import Grafos from '../model/util/Grafos'

export default class GeraGrade extends React.Component{

	constructor(){
		super()
		this.state ={count: 0, names: [], keys: [], cr:[], b: true, c: false}
		this.handleCheck = this.handleCheck.bind(this);
	}

	handleCheck(e) {
		if(e.target.className == 't_mat'){
			let per = document.getElementById(e.target.value).getElementsByClassName("check");
			for(let i = 0; i < per.length; i++){
				let mat = per[i].firstChild
				console.log(mat.attributes.cr.value)

				mat.checked = e.target.checked
				let id = this.state.keys.indexOf(parseInt(mat.value))
				if(e.target.checked == true && id === -1){
					this.state.keys.push(parseInt(mat.value))
					this.state.names.push(mat.id)
					this.state.cr.push(parseInt(mat.attributes.cr.value))

				}else if(e.target.checked == false && id >= 0){
					this.state.keys.splice(this.state.keys.indexOf(parseInt(mat.value)),1)
					this.state.names.splice(this.state.names.indexOf(mat.id),1)
					this.state.cr.splice(this.state.names.indexOf(mat.attributes.cr.value),1)
				}
			}
		}else{
			console.log(e.target.attributes.cr.value)
			if(e.target.checked === true){
				this.state.keys.push(parseInt(e.target.value))
				this.state.names.push(e.target.id)
				this.state.cr.push(parseInt(e.target.attributes.cr.value))
			}else{
				document.getElementById("t_"+e.target.parentNode.parentNode.id).checked = false
				this.state.keys.splice(this.state.keys.indexOf(parseInt(e.target.value)),1)
				this.state.names.splice(this.state.names.indexOf(e.target.id),1)
				this.state.cr.splice(this.state.names.indexOf(e.target.attributes.cr.value),1)
			}
		}
		this.setState({})
	}

	verifica(e){
  		e.preventDefault()
  		this.setState({b : false})
	}

	periodo(){
		let mat = [], aux = []
		let j = 0
		for (let i = 0; i < materias.length; i++) {
			if (j === 0) {
				j = materias[i]._se
			}else if(j !== materias[i]._se){
				j = materias[i]._se
				aux.push(mat)
				mat = []
			}
			mat.push(this.periodios(i,materias[i]))
		}
		aux.push(mat)
		return aux
	}

	iDivs(i, k){
		return (
			<>
				
				<div className="periodo">
					<input type="checkbox" className="t_mat" id={i._re} name={"t_"+k} id={"t_"+k} value={k} onClick={(e)=>{this.handleCheck(e)}}/>
					
					<label>{(k+1)+"º Periodo"}</label>
				</div>
				<div className="as" id ={k}>{i}</div>
			</>
			)
	}

	periodios(k, i){
		return(
			<div className="check">
				<input type="checkbox" cr={i._ap+i._at} className="mat" id={i._re} name={i._re} value={k} onClick={(e)=>{this.handleCheck(e)}}/>
				<label htmlFor={i._re}> {i._di}</label><br/>
			</div>
			)
	}

	tela(){//
		if (this.state.b) {
			let as = this.periodo()
			let cr = this.state.cr.reduce((accumulator,value) => accumulator + value,0);
			return(
			<>
				<div className="MateriasFeitas-content">
					<div className="periodo-content">
						<div className="lista">
								Você&nbsp;
								{"fez "+this.state.names.length+" matéria(s)" ||" fez Nenhuma matéria" }
								<br/>
									Você&nbsp;
								{"possue "+cr+" crédito(s)"||" não possue créditos" }
		          			{as.map((a,b)=>{return this.iDivs(a,b)})}
				        </div>
					</div>
				</div>
				<div className="buttom-content">
					<input type="submit" value="Começar" onClick={(e) => this.verifica(e)}/>
				</div>
			</>
			)
		}else{
			return( 
				<Horarios materias={materias} feitas={this.state.keys}/>
			)
		}
	}

	render(){
		return this.tela()
	}
}
