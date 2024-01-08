import db from './db.json';
import db2 from './db2.json';

function ativas(e) {
    e = e === undefined ? "engcomp" : e
    const a = db.filter((item) => item._ag === true && item._cu === e)
    return a !== undefined ? a : [];
}

function periodos(e) {
    const vet = ativas(e);
    const v = new Set(vet.map(item => item._se));
    return v.size > 0 ? v.size : undefined;
}

function cursos() {
    const v = new Set(db2.map((item) => item._cu));
    return Array.from(v);
}

function horarios(e) {
    e = e === undefined ? "engcomp" : e
    const v = db2.find((item) => item._cu === e);
    return v === undefined || v === null ? [] : v._hd
}

function dimencao(e) {
    e = e === undefined ? "engcomp" : e
    const v = db2.find((item) => item._cu === e);
    if (v === undefined)
        return []
    return v._da === undefined ? [] : v._da;
}

export { ativas, periodos, cursos, horarios, dimencao };
