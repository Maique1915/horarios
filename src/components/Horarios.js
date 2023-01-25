import '../model/util/css/Horarios.css'
import React from 'react';
import Escolhe from '../model/util/Escolhe'
import Grafos from '../model/util/Grafos'
import Comum from './Comum'

class Horarios extends React.Component{

	constructor(props){
		super(props)
		this.sem = ["seg", "ter", "qua","qui","sex"]

		const gr = new Grafos(this.props.materias, this.props.feitas).matriz()
		this.es = new Escolhe(gr)
		this.materias = this.es.exc()
		this.arr = this.es._array(gr)
		this.materias = this.materias.splice(0, this.materias.length > 7? 7: this.materias.length-1)
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

	render(){
		return <Comum materias = {this.materias} tela={1} separa = {false} f={"Grade possível"}/>
	}
}

export default Horarios