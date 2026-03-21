import { Subject } from "../../types/Subject";

export default class Grafos {
    materias: Subject[]; // List of available subjects
    cr: number;          // Coeffcient of Rendimento (Credits)
    re: string[];        // Requirements / Completed subjects (acronyms)
    ids: Set<string | number>; // IDs das matérias concluídas

    constructor(materias: Subject[], cr: number, names: string[] | Subject[]) {
        this.materias = materias;
        this.ids = new Set();

        // Convert names/subjects to acronym list
        this.re = (names || []).map((n: string | Subject) => {
            if (typeof n === 'string') return n;
            if (n._id !== undefined) this.ids.add(n._id);
            return n._re || '';
        });

        if (cr === -1) {
            // Calculate CR by summing credits of all subjects in 'names'
            // This ensures subjects from other courses (not in this.materias) are counted
            this.cr = (names as (string | Subject)[]).reduce((acc, n) => {
                if (typeof n === 'string') {
                    // Fallback to searching in materias if only acronym is provided
                    const materia = this.materias.find(m => m._re === n);
                    if (materia) {
                        return acc + (Number(materia._ap) || 0) + (Number(materia._at) || 0);
                    }
                    return acc;
                } else {
                    // Direct sum from Subject object
                    return acc + (Number(n._ap) || 0) + (Number(n._at) || 0);
                }
            }, 0);
        } else {
            this.cr = cr;
        }

        if (this.re.some(n => n.includes('MET') || n.includes('METO'))) {
            console.log(`[Grafos] Constructor: CR=${this.cr}, Completed includes MET-like subject`);
        }
    }

    matriz(): Subject[] {
        const resultado = this.materias.filter(
            materia => {
                // Verifica se a matéria já foi feita por ID ou por Acrônimo
                const jaFeitaById = (materia._id !== undefined) && this.ids.has(materia._id);
                const jaFeitaByAcr = (materia._re !== undefined) && this.re.includes(materia._re);
                const jaFeita = jaFeitaById || jaFeitaByAcr;

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
                    return false;
                }

                if (!temCreditos) {
                    // if (materia._di?.includes('Metodologia') || materia._re?.includes('MET')) {
                    //     console.log(`[Grafos] !Candidate: ${materia._re} (${materia._di}) - Credits needed: ${minCreditos}, User has: ${this.cr}`);
                    // }
                    return false;
                }

                // if (materia._di?.includes('Metodologia') || materia._re?.includes('MET')) {
                //     console.log(`[Grafos] ✓Candidate: ${materia._re} (${materia._di}) - CR=${this.cr} >= ${minCreditos}, temReq=${temReq}`);
                // }

                return true;
            }
        );

        return resultado;
    }

    temRequisitos(requisitos: (string | number)[]): boolean {
        if (!requisitos || requisitos.length === 0) {
            //console.log(`    ✓ Sem pré-requisitos`);
            return true; // Sem requisitos = pode fazer
        }

        //console.log(`    Verificando ${requisitos.length} pré-requisito(s): ${JSON.stringify(requisitos)}`);

        const resultado = requisitos.every(requisito => {
            // Check if it's a number or a string that looks like a number
            const reqStr = String(requisito);
            const isNumeric = !isNaN(Number(reqStr)) && !isNaN(parseFloat(reqStr));
            
            if (isNumeric) {
                const totalNeeded = parseInt(reqStr, 10);
                return this.cr >= totalNeeded;
            }

            // Otherwise, treat as subject acronym
            return this.re.includes(reqStr);
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
