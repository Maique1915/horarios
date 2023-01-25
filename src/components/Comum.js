import React from 'react';
import Tabela from './Tabela'

const cores = ["l1","l2","l3","l4","l5","l6","l7","l8","l9"] 

export default class Comum extends React.Component{

	constructor(props){
		super(props)
		console.log(props)
		this.arr = props.materias
		this.t = props.tela
		this.f = props.f
		this.grade(props.materias, props.separa)
	}

	grade(materias, s){
		const m = Array(5).fill("")
		const m2 = Array(6).fill("")
		let arr = []
		let cor = []
		let aux = materias
		const r = Math.floor(Math.random()*cores.length)
		if (s) {
			aux = this.separa(aux)
		}

		for(const a of aux){
			const cl = Array.from(m, () => Array.from(m2))
			const v = Array.from(m, () => Array.from(m2))
			for(const b in a){
				for(const c in a[b]._ho){
					for(const d in a[b]._ho[c]){
						if(a[b]._ho[c][d]){
							v[c][d] = a[b]._di
							cl[c][d] = cores[(b + r)%cores.length]
						}				
					}
				}
			}
			arr.push(v)
			cor.push(cl)
		}
		this.arr = arr
		this.cor = cor
	}

	separa(arr){
		let aux = []
		let aux2 = []
		let count = 1
		for(const i of arr){
			if(i._se !== count){
				count = i._se
				aux.push(aux2)
				aux2 = []
			}
			aux2.push(i)
		}
		aux.push(aux2)
		return aux
	}

	opc(e, f){
		return <input type="radio"  id={"radio"+e+""+f} name={"slide"+e} className="radio"/>
	}
	
	labels(e, f){
		return <label htmlFor={"radio"+e+""+f} className="bar7" id={"bar"+e+""+f}>{f+1+"º"}</label>
	}//
	
	periodos(array){
		this.materias = array
		const arr = this.separa(array)
		const [a, b] = this.grade(array)
		let aux = []
		for (const i in arr) {
			let sem = []
			for (var l = 0; l < 5; l++) {
				let h = []
				for (var c = 0; c < 6; c++) {
					h.push(this.selects(l,c, arr[i]))
				}
				sem.push(h)
			}
			aux.push(sem)
		}

		return aux
	}

	selects(i, j, item){
		let key = i+""+j
		let val = ""
		for(const l of item	){
			if(l._ho[i][j]){
				val = l._di
				break
			}
		}
		return (
			<select name={"materia"+key} defaultValue={val} className="materias" id={"materia"+key}>
			    <option value="">Nenhuma</option>
			    {item.map((e)=>this.option(e._di))}
			</select>
			)
	}

	option(e){
		return <option value={e}>{e}</option>
	}
//
	tela(i, k){
		return (
		<div>
			<div className="intervalo">
				{(k+1)+"º "+this.f}
			</div>
			<Tabela arr={this.arr[k]} cor={this.cor[k]}/>
		</div>
		)
	}
//
	render(){
		return (
			<>
				<div className="slides-content">
					<div className="slides">
						{this.arr.map((e,f) => this.opc(this.t,f))}
						<div className={"seila"+this.t}>
							{this.arr.map((e, f) =>this.tela(e,f))}
						</div>
					</div>
				</div>
				<div className="footer">
					<div className="salvar"></div>
					<div className="navigation">
						{this.arr.map((e,f) => this.labels(this.t,f))}
					</div>
				</div>
			</>)
		
	}
}