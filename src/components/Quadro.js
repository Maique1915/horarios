import '../model/util/css/Horarios.css'
import React from 'react';
import db from '../model/db'
import Tabela from './Tabela'
import Comum from './Comum'

class Quadro extends React.Component{
	constructor(){
		super()
		this.cores = ["l1","l2","l3","l4","l5","l6","l7","l8","l9"]
		this.array = Array(10).fill([])
		this.materias = db
		this.arr = []
		this.cor = []
	}

	opc(e, f){
		return <input type="radio"  id={"radio3"+f} name="slide2" className="radio"/>
	}
	
	labels(e, f){
		return <label htmlFor={"radio3"+f} className="bar" id={"bar"+f}>{(f+1)+"º"}</label>
	}

	tela(i, k){
		return (
		<div>
			<div className="intervalo">
				{(k+1)+"º Periodo"}
			</div>
			<Tabela arr={this.arr[k]} cor={this.cor[k]}/>
		</div>
		)
	}

	render(){
		[this.arr, this.cor] = new Comum().grade(this.materias, true)
		return (
			<>
			<div className="slides-content">
				<div className="slides">
					{this.arr.map((e,f) => new Comum().opc(3,f))}
					<div className="seila3">
						{this.arr.map((e, f) =>this.tela(e,f))}
					</div>
				</div>
			</div>
			<div className="footer">
				<div className="salvar"></div>
				<div className="navigation">
					{this.arr.map((e,f) => new Comum().labels(3,f))}
				</div>
			</div>
			</>)
		
	}
}

export default Quadro