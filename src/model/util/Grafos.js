export default class Grafos {
    constructor(materias, cr, feitas, names) {
        Object.defineProperty(this, "materias", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "feitas", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "re", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.materias = materias;
        this.feitas = feitas;
        this.cr = cr;
        this.re = names;
    }
    matriz() {
        return this.materias.filter(materia => {
            if (!this.re.includes(materia._re) && this.temRequisitos(materia._pr))
                return true;
            return false;
        });
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
    temRequisitos(requisitos) {
        return requisitos.every(requisito => (Number.isInteger(requisito) && this.cr >= parseInt(String(requisito))) ||
            (!Number.isInteger(requisito) && this.re.includes(String(requisito))));
    }
}
