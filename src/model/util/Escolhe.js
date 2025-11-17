import Materias from '../Materias'
import { dimencao } from '../Filtro'

export default class Escolhe {

    constructor(genesis, cur) {
        this.genesis = genesis
        this.cur = cur
        this.dimensao = null
        this.reduz()
    }

    async init() {
        this.dimensao = await dimencao(this.cur)
        return this
    }

    reduz() {
        while (this.genesis.length > 15) {
            const max = this.genesis.length
            const a = Math.floor(Math.random() * (max))
            this.genesis.splice(a, 1)
        }
    }

    count(str) {
        return str.reduce((acc, char) => char === '1' ? acc + 1 : acc, 0);
    }

    exc() {
        const aux = []
        let i = 2 ** this.genesis.length - 1
        while (i > 0) {
            const f = i.toString(2).padStart(this.genesis.length, '0').split('')
            i--

            if (this.count(f) >= 9) continue

            const c = []
            let m = new Materias(this.cur, this.dimensao || [0, 0]).m
            let b = true

            for(const j in f){
                if(f[j] === "1"){
                    const a = this.genesis[j]
                    if(this.colide(m, a) && !this.existe(c, a)){
                        c.push(a)
                        m = this.merge(a, m)
                    }else{
                        b = false
                        break
                    }
                }
            }
            if(b)
                aux.push(c)
        }
        
        return aux.sort(this.compare)
    }

    compare(a, b) {
        return b.length - a.length
    }

    merge(a, b) {
        // Mescla os horários de a em b (evita duplicatas)
        const horariosSet = new Set(b._ho.map(h => h.join(',')))
        for (const tupla of a._ho) {
            const key = tupla.join(',')
            if (!horariosSet.has(key)) {
                b._ho.push(tupla)
                horariosSet.add(key)
            }
        }
        return b
    }

    existe(c, a) {
        for(const b of c)
            if(a._re === b._re)
                return true
        return false
    }

    colide(b, a) {
        // Verifica se há colisão entre os horários de b e a
        const horariosB = new Set(b._ho.map(h => h.join(',')))
        for (const tupla of a._ho) {
            if (horariosB.has(tupla.join(','))) {
                return false
            }
        }
        return true
    }
}