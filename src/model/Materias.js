import { dimencao } from './Filtro'

const sem = ["seg", "ter", "qua", "qui", "sex"]

class Materias{

	constructor(cur, se, di, ap, at, pr, el, re){
		this._se = se
		this._di = di
		this._ap = ap
		this._at = at
		this._pr = pr
		this._re = re
		this._el = el
		const [r, c] = dimencao(cur)
		const row = []
		this._ho = []
		for (let i = 0; i < r; i++)
			row.push(false)
		for (let i = 0; i < c; i++)
			this._ho.push([...row])
	}

	get horario(){
		return this._ho
	}

	set horario(ho){
		const s = parseInt(ho[0])
		const h = parseInt(ho[1])
		this._ho[s][h] = ho[2] === "1"
	}

	get preRequisito(){
		return this._pr
	}

	set preRequisito(pr){
		this._pr = pr
	}

	get pratica(){
		return this._ap
	}

	set pratica(ap){
		this._ap = ap
	}

	get teorica(){
		return this._at
	}

	set teorica(at){
		this._at = at
	}

	get disciplina(){
		return this._di
	}

	set disciplina(di){
		this._di = di
	}

	get referencia(){
		return this._re
	}

	set referencia(re){
		this._re = re
	}

	get eletiva(){
		return this._el
	}

	set eletiva(el){
		this._el = el
	}


	get semestre(){
		return this._se
	}

	set semestre(se){
		this._se = se
	}

	_print(){
		let str = ""
		let hora = ""

		for (var i = this._pr.length - 1; i >= 0; i--) {
			str += "\""+this._pr[i]+"\""
			if (i !== 0)
				str += ", "
		}
		for (i = 0; i < sem.length ; i++) {
			hora += "\""+sem[i]+"\": [\""+this._ho[sem[i]][0]+"\", \""+this._ho[sem[i]][1]+"\"] "
			if (i < sem.length - 1)
				hora += ", \n\t\t"
		}

		if (hora.length === 0) return ""
		if (hora.substring(hora.length - 2) === ", ") {
			hora = hora.substring(0, hora.length - 2)
		}

	
		return(
			"{\n\t\"semestre\": "+this._se+", \n"+
			"\t\"horario\": {\n\t\t"+hora+"\n\t}, \n"+
			"\t\"pre requisitos\": ["+str+"], \n"+
			"\t\"aulas praticas\": "+this._ap+", \n"+
			"\t\"aulas teoricas\": "+this._at+", \n"+
			"\t\"referencia\": \""+this._re+"\", \n"+
			"\t\"eletiva\": "+this._el+", \n"+
			"\t\"disciplina\": \""+this._di+"\"\n}"
		)
	}
}

export default Materias;
