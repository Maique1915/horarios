import Materia from '../Materia';

export default class Grafos{
    materias: Materia[];
    feitas: number[];
    cr: number;
    re: string[];

	constructor(materias: Materia[], cr: number, feitas: number[], names: string[]) {
		this.materias = materias
		this.feitas = feitas
		this.cr = cr
		this.re = names
	}

	matriz(): Materia[]{
		return this.materias.filter(
			materia => {
				if(!this.re.includes(materia._re) && this.temRequisos(materia._pr))
					return true
				return false
			}
		)
	}

	temRequisos(b: string[]) {
		for (const c of b) {
			if (Number.isInteger(c) && this.cr >= parseInt(c))
				return true
			if (Number.isInteger(c) || !this.re.includes(c))
				return false
		}
		return true
	}
}