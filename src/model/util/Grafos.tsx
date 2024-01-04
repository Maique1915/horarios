import { Materia } from '../Materia';

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
				if (!this.re.includes(materia._re) && this.temRequisitos(materia._pr))
					return true
				return false
			}
		)
	}
/*
	temRequisos(b: (number | string)[]) {
		for (const c of b) {
			if (Number.isInteger(c) && this.cr >= c)
				return true
			if (Number.isInteger(c) || !this.re.includes(c))
				return false
		}
		return true
	}
*/
	temRequisitos(requisitos: (number | string)[]): boolean {
		return requisitos.every(requisito =>
			(Number.isInteger(requisito) && this.cr >= parseInt(String(requisito))) ||
			(!Number.isInteger(requisito) && this.re.includes(String(requisito)))
		);
	}
}