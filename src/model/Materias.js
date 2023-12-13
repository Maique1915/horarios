import { dimencao } from './Filtro';
const sem = ["seg", "ter", "qua", "qui", "sex"];
class Materias {
    constructor(cur) {
        Object.defineProperty(this, "m", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.m = { _cu: '', _di: '', _ap: 0, _at: 0, _pr: [], _ag: false, _se: 0, _re: '', _el: false, _ho: [] };
        const [r, c] = dimencao(cur);
        const row = [];
        for (let i = 0; i < r; i++)
            row.push(false);
        for (let i = 0; i < c; i++)
            if (this.m._ho)
                this.m._ho.push([...row]);
    }
    _print() {
        let str = "";
        let hora = "";
        if (this.m._pr && this.m._ho) {
            for (let i = this.m._pr.length - 1; i >= 0; i--) {
                str += "\"" + this.m._pr[i] + "\"";
                if (i !== 0)
                    str += ", ";
            }
            for (let i = 0; i < sem.length; i++) {
                hora += "\"" + sem[i] + "\": [\"" + this.m._ho[i][0] + "\", \"" + this.m._ho[i][1] + "\"] ";
                if (i < sem.length - 1)
                    hora += ", \n\t\t";
            }
        }
        if (hora.length === 0)
            return "";
        if (hora.substring(hora.length - 2) === ", ") {
            hora = hora.substring(0, hora.length - 2);
        }
        return ("{\n\t\"semestre\": " + this.m._se + ", \n" +
            "\t\"horario\": {\n\t\t" + hora + "\n\t}, \n" +
            "\t\"pre requisitos\": [" + str + "], \n" +
            "\t\"aulas praticas\": " + this.m._ap + ", \n" +
            "\t\"aulas teoricas\": " + this.m._at + ", \n" +
            "\t\"referencia\": \"" + this.m._re + "\", \n" +
            "\t\"eletiva\": " + this.m._el + ", \n" +
            "\t\"disciplina\": \"" + this.m._di + "\"\n}");
    }
}
export default Materias;
