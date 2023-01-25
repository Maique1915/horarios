import _ from "./util/_"
const sem = ["seg","ter","qua","qui","sex"]

class Grade{

	constructor(dia, materia, horario){
		this._dia = dia
		this._materia = materia
		this.horario = horario
	}

	get horario(){
		return this._horario
	}

	set horario(horario){
		this.horario = horario
	}

	get dia(){
		return this._dia
	}

	set dia(dia){
		this._dia = dia
	}

	get materia(){
		return this._dia
	}

	set materia(dia){
		this._dia = dia
	}

	_print(){
		return(
			"{\n\t\"dia\": "+this._dia+", \n"+
			"\t\"horario\": "+this._horario+", \n"+
			"\t\"disciplina\": \""+this._materia+"\"\n}"
		)
	}
}

export default Grade;
