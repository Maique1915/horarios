export default class Grafos {
    constructor(materias, cr, names) {
        this.materias = materias
        this.cr = cr
        this.re = names
    }

    matriz() {
        return this.materias.filter(
            materia => {
                if (!this.re.includes(materia._re) && this.temRequisitos(materia._pr))
                    return true
                return false
            }
        )
    }

    temRequisitos(requisitos) {
        return requisitos.every(requisito =>
            (Number.isInteger(requisito) && this.cr >= parseInt(String(requisito))) ||
            (!Number.isInteger(requisito) && this.re.includes(String(requisito)))
        )
    }

    getHorarios(materia) {
        return Array.isArray(materia._ho) ? materia._ho : []
    }
}