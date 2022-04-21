import '../model/util/css/Horarios.css'
import React from 'react';
import Escolhe from '../model/util/Escolhe'
import Tabela from './Tabela'

class Horarios extends React.Component{

	constructor(props){
		super(props)
		this.cores = ["l1","l2","l3","l4","l5","l6","l7","l8","l9"]
		this.sem = ["seg", "ter", "qua","qui","sex"]

		this.es = new Escolhe([])		
		this.materias = props.materias
		this.arr = []
		this.cor = []
		this.horario =this.horario.bind(this)
	}

	grade(){		
		const i = this.materias
		const m = Array(5).fill("")
		const m2 = Array(6).fill("")

		this.arr = Array.from(m, () => Array.from(m2))
		this.cor = Array.from(m, () => Array.from(m2))
		for(const b in i){
			for(const c in i[b]._ho){		
				for(const d in i[b]._ho[c]){
					if(i[b]._ho[c][d]){
						this.arr[c][d] = i[b]._di
						this.cor[c][d] = this.cores[b%this.cores.length]
					}				
				}
			}
		}
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

	a(i,j){
		return <div className={"semana "+i}><b>{j}</b></div>
	}

	render(){
		this.grade()

		return(
			<div className="Horarios-content">
				<div className="intervalo">
					Horários de aula
				</div>
				<Tabela arr={this.arr} cor={this.cor}/>
			</div>
		)
	}
}

export default Horarios