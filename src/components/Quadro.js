import '../model/util/css/Horarios.css'
import React from 'react';
import db from '../model/db'
import Tabela from './Tabela'

class Quadro extends React.Component{
	constructor(){
		super()
		this.cores = ["l1","l2","l3","l4","l5","l6","l7","l8","l9"]
		this.array = Array(10).fill([])
		this.materias = db
		this.arr = []
		this.cor = []
	}

	grade(){		
		const l = this.materias
		const m = Array(5).fill("")
		const m2 = Array(6).fill("")
		let arr = []
		const teste = []
		let count = 1
		
		for(const i of l){
			if(i._se !== count){
				count = i._se
				teste.push(arr)
				arr = []
			}
			arr.push(i)
		}

		teste.push(arr)
		for(const a of teste){
			const cl = Array.from(m, () => Array.from(m2))
			const v = Array.from(m, () => Array.from(m2))
			for(const b in a){
				for(const c in a[b]._ho){		
					for(const d in a[b]._ho[c]){
						if(a[b]._ho[c][d]){
							v[c][d] = a[b]._di
							cl[c][d] = this.cores[b%this.cores.length]
						}				
					}
				}
			}
			this.arr.push(v)
			this.cor.push(cl)
		}
	}

	opc(e, f){
		return <input type="radio"  id={"radio2"+f} name="slide" className="radio"/>
	}
	
	labels(e, f){
		return <label htmlFor={"radio2"+f} className="bar" id={"bar"+f}>{(f+1)+"º"}</label>
	}

	tela(item, key){
		return (
			<>
			<div className={"Cadastro-content "+(key===0? "seila":"")}>
				<div className="intervalo">
					{(key+1)+"º Periodo"}
				</div>
				<Tabela arr={this.arr[key]} cor={this.cor[key]}/>
			</div>
			</>
			)
	}

	render(){
	this.grade()
		return (
			<>
			<div className="slides2-content">
				<div className="slides">
					{this.arr.map((e,f) => this.opc(e,f))}
					<div className="seila2">
						{this.arr.map((e, f) =>this.tela(e,f))}
					</div>
					
				</div>
			</div>
			<div className="footer">
				<div className="salvar"></div>
				<div className="navigation">
					{this.arr.map((e,f) => this.labels(e,f))}
				</div>
			</div>
			</>)
		
	}
}

export default Quadro