import db from './db.json';
import Materia from './Materia';

function ativas(e: string): Materia[] {
    e = e === undefined ? "engcomp" : e
    const a = db.filter((item) => (item._ag === true || (item._se && item._se > 0)) && item._cu === e)
    return a !== undefined ? a : [];
}

function periodos(e: string): number | undefined {
    const vet = ativas(e);
    const v = new Set(vet.map(item => item._se));
    return v.size > 0 ? v.size : undefined;
}

function cursos(): string[] {
    const v = new Set(db.map((item) => item._cu));
    return Array.from(v);
}

function horarios(e: string): string[][] | undefined {
    e = e === undefined ? "engcomp" : e
    const v = db.find((item) => !item._se && item._cu === e);
    return v === undefined || v === null ? [] : v._hd
}

function dimencao(e: string): number[] | [] {
    e = e === undefined ? "engcomp" : e
    const v = db.find((item) => !item._se && item._cu === e);
    return v ? v._di : [];
}

export { ativas, periodos, cursos, horarios, dimencao };
