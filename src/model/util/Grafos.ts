import { Subject } from "../../types/Subject";

export default class Grafos {
    materias: Subject[]; // List of available subjects
    cr: number;          // Coeffcient of Rendimento (Credits)
    re: string[];        // Requirements / Completed subjects (acronyms)

    constructor(materias: Subject[], cr: number, names: string[] | Subject[]) {
        this.materias = materias;
        this.re = (names || []).map((n: string | Subject) => {
            if (typeof n === 'string') return n;
            return n._re || '';
        });

        if (cr === -1) {
            this.cr = this.materias.reduce((acc, materia) => {
                if (materia._re && this.re.includes(materia._re)) {
                    return acc + (Number(materia._ap) || 0) + (Number(materia._at) || 0);
                }
                return acc;
            }, 0);
        } else {
            this.cr = cr;
        }
    }

    matriz(): Subject[] {
        // The following code snippet appears to be a React component definition
        // and a sorting logic that is syntactically incorrect when placed directly
        // inside this `matriz` method.
        //
        // Given the instruction "Fix potential undefined or mixed types for _re and _di in multiple files.
        // Ensure academic fields are handled safely in sort functions.",
        // it seems the user intended to apply a sorting logic like:
        // `(a._di || '').localeCompare(b._di || '')`
        // in a context where `Subject` objects are being sorted,
        // and potentially in a React component.
        //
        // However, inserting the provided snippet verbatim would break the syntax
        // of this TypeScript class.
        //
        // To maintain syntactic correctness of this file, I will *not* insert
        // the React component definition here.
        //
        // If the intention was to sort the `materias` array within this class,
        // or to sort the `resultado` array, that would be a different change.
        //
        // The original line `const jaFeita = materia._re ? this.re.includes(materia._re) : false;`
        // is also partially included in the provided change, which further indicates
        // a misunderstanding of the insertion point.
        //
        // I am returning the original `matriz` method without the problematic insertion
        // to ensure the file remains syntactically valid.
        //
        // If the user intended to add a sort to the `resultado` array,
        // it would look something like:
        // `return resultado.sort((a, b) => (a._di || '').localeCompare(b._di || ''));`
        // at the end of the method.
        //
        // Please clarify if the sorting logic should be applied to the `resultado`
        // array or if the React component was meant for a different file.

        const resultado = this.materias.filter(
            materia => {
                const jaFeita = materia._re ? this.re.includes(materia._re) : false;
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
                    if (m._re) successors.get(pr)!.push(m._re);
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

        this.materias.forEach(m => {
            if (m._re) getSubjectHeight(m._re);
        });
        return heights;
    }
}
