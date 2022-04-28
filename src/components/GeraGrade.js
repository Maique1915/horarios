import '../model/util/css/GeraGrade.css'
import React from 'react';
import Horarios from './Horarios'
import { Link } from 'react-router-dom';
import materias from '../model/db'
import Escolhe from '../model/util/Escolhe'
import Grafos from '../model/util/Grafos'

export default class GeraGrade extends React.Component{

	constructor(){
		super()
		this.state ={count: 0, names: [], keys: [], b: true, c: false}
	}

	handleCheck(e) {
		if(e.target.checked === true){
			this.state.keys.push(parseInt(e.target.value))
			this.state.names.push(e.target.id)
		}else{
			this.state.keys.splice(this.state.keys.indexOf(e.target.value),1)
			this.state.names.splice(this.state.names.indexOf(e.target.id),1)
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
				<div className="periodo">{(k+1)+"º Periodo"}</div>
				<div className="as">{i}</div>
			</>
			)
	}

	periodios(k, i){
		return(
			<div className="check">
				<input type="checkbox" className="mat" id={i._re} name={i._re} value={k} onClick={(e)=>{this.handleCheck(e)}}/>
		  	<label htmlFor={i._re}> {i._di}</label><br/>
	  	</div>
			)
	}

	tela(){
		if (this.state.b) {
			let as = this.periodo()
			return(
			<div className="cont">
				<div className="MateriasFeitas-content">
					<div className="periodo-content">
						<div className="lista">
							<p>Materias feitas: {this.state.names.sort().join(", ") || " Nenhuma"}</p>
		          			{as.map(this.iDivs)}
				        </div>
					</div>
				</div>
				<div className="buttom-content">
					<input type="submit" value="Começar" onClick={(e) => this.verifica(e)}/>
				</div>
			</div>
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
