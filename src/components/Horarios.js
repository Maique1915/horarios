import '../model/util/css/Horarios.css'
import React from 'react';
import Escolhe from '../model/util/Escolhe'
import Grafos from '../model/util/Grafos'
import Tabela from './Tabela'
import Comum from './Comum'

class Horarios extends React.Component{

	constructor(props){
		super(props)
		this.cores = ["l1","l2","l3","l4","l5","l6","l7","l8","l9"]
		this.sem = ["seg", "ter", "qua","qui","sex"]

		const gr = new Grafos(this.props.materias, this.props.feitas).matriz()
		this.es = new Escolhe(gr)
		this.materias = this.es.exc()
		this.arr = this.es._array(gr)
		this.materias = this.materias.splice(0, this.materias.length > 7? 7: this.materias.length-1)
		this.array = Array(10).fill([])
		this.horario =this.horario.bind(this)
	}

	horario(m, c, d, p, h){

		for(const i in this.sem){
			if(this.sem[i] === m){
				for (var j = 0, k = 0; j < 7; j++) {
					if(j !== 3){
						const b = !this.es.colisao(c, [h[j], h[j+1]], false)
						if(b){
							this.arr[k][i] = d
							this.cor[k][i] = p

						}else if(this.arr[k][i] === " "){			
							this.arr[k][i] = " "
							this.cor[k][i] = ""

						}
						k++
					}
				}
				break
			}
		}
	}


	opc(e, f){
		return <input type="radio"  id={"radio1"+f} name="slide1" className="radio"/>
	}
	
	labels(e, f){
		return <label htmlFor={"radio1"+f} className="bar" id={"bar1"+f}>{f+1+"º"}</label>
	}

	a(i,j){
		return <div className={"semana "+i}><b>{j}</b></div>
	}



	tela(i, k){
		return (
		<div className="phorario">
			<div className="intervalo">
				{k+1+"º possivel horários de aulas"}
			</div>
			<Tabela arr={this.arr[k]} cor={this.cor[k]}/>
		</div>
		)
	}

	render(){
		[this.arr, this.cor] = new Comum().grade(this.materias, false)
/*<div className="abrir">Possiveis:&nbsp;{"  "+this.arr.length}</div>
/<div className="pos">{this.arr.join(", ")}</div>*/

		return(
			<div className="total">
				<div className="slides-content">
					<div className="slides">
						{this.materias.map((e,f) => new Comum().opc(1,f))}
						<div className="Horarios-content seila1">
							{this.materias.map((e, f) => this.tela(e,f))}
						</div>
					</div>
				</div>
				<div className="footer">
					<div className="opc">
						
					</div>
					<div className="navigation">
						{this.materias.map((e,f) => new Comum().labels(1,f))}
					</div>
				</div>
			</div>
		)
	}
}

export default Horarios