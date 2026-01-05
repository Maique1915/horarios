import { Subject } from "../../types/Subject";

export default class Grafos {
    materias: Subject[]; // List of available subjects
    cr: number;          // Coeffcient of Rendimento (Credits)
    re: string[];        // Requirements / Completed subjects (acronyms)

    constructor(materias: Subject[], cr: number, names: string[] | Subject[]) {
        this.materias = materias;
        this.re = (names || []).map((n: string | Subject) => (typeof n === 'string' ? n : n._re));

        if (cr === -1) {
            this.cr = this.materias.reduce((acc, materia) => {
                if (this.re.includes(materia._re)) {
                    return acc + (Number(materia._ap) || 0) + (Number(materia._at) || 0);
                }
                return acc;
            }, 0);
        } else {
            this.cr = cr;
        }
    }

    matriz(): Subject[] {
        const resultado = this.materias.filter(
            materia => {
                const jaFeita = this.re.includes(materia._re);
                // Ensure _pr is handled as an array, even if it might be a string or undefined in raw data
                // The Subject interface says string | string[], but logic expects array.
                const prList = Array.isArray(materia._pr) ? materia._pr : (materia._pr ? [materia._pr] : []);
                const temReq = this.temRequisitos(prList as (string | number)[]);

                const minCreditos = materia._pr_creditos_input || 0;
                const temCreditos = this.cr >= minCreditos;

                if (jaFeita) {
                    return false;
                }

                if (!temReq) {
                    //console.log(`  ❌ ${materia._re} (${materia._di}) - NÃO pode fazer. Pré-req: ${JSON.stringify(materia._pr)}`);
                    return false;
                }

                if (!temCreditos) {
                    //console.log(`  ❌ ${materia._re} (${materia._di}) - NÃO pode fazer. Mínimo créditos: ${minCreditos}, Atual: ${this.cr}`);
                    return false;
                }

                //console.log(`  ✅ ${materia._re} (${materia._di}) - PODE fazer. Pré-req: ${JSON.stringify(materia._pr)}. Créditos ok.`);
                return true;
            }
        );

        //console.log('Grafos.matriz(): Resultado:', resultado.length, 'matérias podem ser feitas');
        return resultado;
    }

    temRequisitos(requisitos: (string | number)[]): boolean {
        if (!requisitos || requisitos.length === 0) {
            //console.log(`    ✓ Sem pré-requisitos`);
            return true; // Sem requisitos = pode fazer
        }

        //console.log(`    Verificando ${requisitos.length} pré-requisito(s): ${JSON.stringify(requisitos)}`);

        const resultado = requisitos.every(requisito => {
            const isCredito = Number.isInteger(requisito);
            const temCredito = isCredito && this.cr >= parseInt(String(requisito));

            // Note: If requisito can be a string, includes needs a string.
            const temMateria = !isCredito && this.re.includes(String(requisito));
            const atende = temCredito || temMateria;

            if (isCredito) {
                //console.log(`      ${atende ? '✓' : '✗'} Crédito: ${requisito} (você tem: ${this.cr})`);
            } else {
                //console.log(`      ${atende ? '✓' : '✗'} Matéria: ${requisito} (${temMateria ? 'FEITA' : 'NÃO FEITA'})`);
            }

            return atende;
        });

        //console.log(`    Resultado final: ${resultado ? '✓ TODOS OK' : '✗ FALTAM REQUISITOS'}`);
        return resultado;
    }

    getHorarios(materia: Subject): number[][] {
        return Array.isArray(materia._ho) ? materia._ho : [];
    }

    /**
     * Calculates the "Height" or "Criticality" of each subject.
     * Height = length of the longest prerequisite chain that depends on this subject.
     */
    calculateHeights(): Map<string, number> {
        const heights = new Map<string, number>();
        const successors = new Map<string, string[]>();

        // Build successor map
        this.materias.forEach(m => {
            const prList = Array.isArray(m._pr) ? m._pr : (m._pr ? [m._pr] : []);
            prList.forEach(pr => {
                if (typeof pr === 'string') {
                    if (!successors.has(pr)) successors.set(pr, []);
                    successors.get(pr)!.push(m._re);
                }
            });
        });

        const getSubjectHeight = (acronym: string): number => {
            if (heights.has(acronym)) return heights.get(acronym)!;

            const mySuccessors = successors.get(acronym) || [];
            if (mySuccessors.length === 0) {
                heights.set(acronym, 0);
                return 0;
            }

            const maxSuccessorHeight = Math.max(...mySuccessors.map(s => getSubjectHeight(s)));
            const height = 1 + maxSuccessorHeight;
            heights.set(acronym, height);
            return height;
        };

        this.materias.forEach(m => getSubjectHeight(m._re));
        return heights;
    }
}
