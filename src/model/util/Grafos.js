export default class Grafos {
    constructor(materias, cr, names) {
        this.materias = materias
        this.cr = cr
        this.re = names
    }

    matriz() {
        console.log('Grafos.matriz(): Iniciando filtragem...');
        console.log('Grafos.matriz(): Total de matérias:', this.materias.length);
        console.log('Grafos.matriz(): Créditos:', this.cr);
        console.log('Grafos.matriz(): Matérias feitas (re):', this.re);

        const resultado = this.materias.filter(
            materia => {
                const jaFeita = this.re.includes(materia._re);
                const temReq = this.temRequisitos(materia._pr);
                const minCreditos = materia._pr_creditos_input || 0;
                const temCreditos = this.cr >= minCreditos;

                if (jaFeita) {
                    return false;
                }

                if (!temReq) {
                    console.log(`  ❌ ${materia._re} (${materia._di}) - NÃO pode fazer. Pré-req: ${JSON.stringify(materia._pr)}`);
                    return false;
                }

                if (!temCreditos) {
                    console.log(`  ❌ ${materia._re} (${materia._di}) - NÃO pode fazer. Mínimo créditos: ${minCreditos}, Atual: ${this.cr}`);
                    return false;
                }

                console.log(`  ✅ ${materia._re} (${materia._di}) - PODE fazer. Pré-req: ${JSON.stringify(materia._pr)}. Créditos ok.`);
                return true;
            }
        );

        console.log('Grafos.matriz(): Resultado:', resultado.length, 'matérias podem ser feitas');
        return resultado;
    }

    temRequisitos(requisitos) {
        if (!requisitos || requisitos.length === 0) {
            console.log(`    ✓ Sem pré-requisitos`);
            return true; // Sem requisitos = pode fazer
        }

        console.log(`    Verificando ${requisitos.length} pré-requisito(s): ${JSON.stringify(requisitos)}`);

        const resultado = requisitos.every(requisito => {
            const isCredito = Number.isInteger(requisito);
            const temCredito = isCredito && this.cr >= parseInt(String(requisito));
            const temMateria = !isCredito && this.re.includes(String(requisito));
            const atende = temCredito || temMateria;

            if (isCredito) {
                console.log(`      ${atende ? '✓' : '✗'} Crédito: ${requisito} (você tem: ${this.cr})`);
            } else {
                console.log(`      ${atende ? '✓' : '✗'} Matéria: ${requisito} (${temMateria ? 'FEITA' : 'NÃO FEITA'})`);
            }

            return atende;
        });

        console.log(`    Resultado final: ${resultado ? '✓ TODOS OK' : '✗ FALTAM REQUISITOS'}`);
        return resultado;
    }

    getHorarios(materia) {
        return Array.isArray(materia._ho) ? materia._ho : []
    }
}