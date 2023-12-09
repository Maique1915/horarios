
export default class Grafos{

	constructor(materias, cr, feitas, names){
		this.materias = materias
		this.feitas = feitas
		this.cr = cr
		this.re = names
	}

	matriz(){
		return this.materias.filter(
			materia => {
				if(!this.re.includes(materia._re) && this.temRequisos(materia._pr))
					return true
				return false
			}
		)
	}

	temRequisos(b){
		for (const c of b){
			if(Number.isInteger(c) && this.cr >= c)
				return true
			if(Number.isInteger(c) || !this.re.includes(c))
				return false
		}
		return true
	}
}