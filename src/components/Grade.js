import '../model/util/css/MateriasFeitas.css'
import React from 'react';
import materias from '../model/db'
import Horarios from './Horarios'
import { Link } from 'react-router-dom';
import Escolhe from '../model/util/Escolhe'
import Grafos from '../model/util/Grafos'

export default class Grade extends React.Component{
	

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

		const gr = new Grafos(materias, this.state.keys).matriz()
		this.es = new Escolhe(gr)
		this.materias = this.es.exc()
		this.arr = this.es._array(gr)
		console.log(this.arr)

		this.materias = this.materias.splice(0, this.materias.length > 7? 7: this.materias.length-1)
	}

	horarios(e, f){
		return <Horarios className={f === 0 ?"s1": ""} materias={e}/>
	}

	opc(e, f){
		return <input type="radio"  id={"radio"+f} name="slide" className="radio"/>
	}
	
	labels(e, f){
		return <label htmlFor={"radio"+f} className="bar" id={"bar"+f}>&#173;</label>
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

	iDivs(item, key){
		return (
			<>
				<div className="periodo">{(key+1)+"º Periodo"}</div>
				<div className="as">{item}</div>
			</>
			)
	}


	periodios(key, item){
		return(
			<div className="check">
				<input type="checkbox" className="mat" id={item._re} name={item._re} defaultValue={key} onClick={(e)=>{this.handleCheck(e)}}/>
		  	<label htmlFor={item._re}> {item._di}</label><br/>
	  	</div>
			)

	}

	//
	tela(){
		if (this.state.b) {
			let as = this.periodo()
			return(
				<div className="cont">
			<div className="MateriasFeitas-content">
				<form onSubmit={this.verifica} action={"/horario?"+this.mat}>
				<p>Materias feitas: {this.state.names.sort().join(", ") || " Nenhuma"}</p>
					<div className="periodo-content">
						<div className="lista">
				          {as.map(this.iDivs)}
				        </div>
					</div>
				</form>
			</div>
			<div className="buttom-content">
				<Link to={"horario"}>
					<input type="submit" defaultValue="Começar" onClick={(e) => this.verifica(e)}/>
				</Link>
				</div>
			</div>
			)
		}else{//
			return( 
			<>
				<div className="slides-content">
					<div className="slides">
						{this.materias.map((e,f) => this.opc(e,f))}
						<div className="seila">
							{this.materias.map((e,f) => this.horarios(e,f))}
						</div>
					</div>
				</div>
				<div className="footer">
					<div className="opc">
						<div className="abrir">Possiveis:&nbsp;{"  "+this.arr.length}</div>
						<div className="pos">{this.arr.join(", ")}</div>
					</div>
					<div className="navigation">
						{this.materias.map((e,f) => this.labels(e,f))}
					</div>
				</div>
			</>
			)
		}
	}

	render(){
		return this.tela()
	}
}
