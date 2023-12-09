import db from '../model/db'

function ativas(e) {
    return db.filter(item => (item._ag === true || item._se > 0) && item._cu === e)
}
function periodos(e) {
    const vet = ativas(e)
    const v = new Set(vet.map(item => item._se))
    return Array.from(v).length
}

function cursos() {
    const v = new Set(db.map(item => {
        if (item.hasOwnProperty("_se"))
            return item._cu;
        return undefined; // ou simplesmente omita esse retorno
    }));
    return Array.from(v);
}

function horarios(e) {
    const v = new Set(db.filter(item => {
        if (!item.hasOwnProperty("_se") && item._cu === e)
            return true
        return false
    }))
    return Array.from(v)[0]._ho
}
function dimencao(e) {
    const v = new Set(db.filter(item => {
        if (!item.hasOwnProperty("_se") && item._cu === e)
            return true
        return false
    }))
    return Array.from(v)[0]._di
}

export { ativas, periodos, cursos, horarios, dimencao }
