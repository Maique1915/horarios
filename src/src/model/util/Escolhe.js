import Materias from '../Materias'

export default class Escolhe{
	
	constructor(genesis, cur){

		this.genesis = genesis
		this.cur = cur
		this.reduz()
	}

	reduz() {
		while (this.genesis.length > 15) {
			const max = this.genesis.length
			const a = Math.floor(Math.random() * (max))
			this.genesis.splice(a, 1)
		}
	}

	exc(){
		let aux = []
		let i = 2 ** this.genesis.length - 1
		while (i > 0) {
			let f = i.toString(2).padStart(this.genesis.length, '0')
			i--
			if(f.split("1").length >= 9)
				continue
			
			let c = []
			let m = new Materias(this.cur,0,0,0,0,0,0,0)
			let b = true

			for(const j in f){
				if(f[j] === "1"){
					let a = this.genesis[j]
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

	compare(a, b){
		return b.length - a.length
	}

	merge(a, b){
		for (const i in a._ho)
			for(const j in a._ho[i])
				if(a._ho[i][j])
					b._ho[i][j] = true
		return b
	}

	existe(c,a){
		for(const b of c)
			if(a._re === b._re)
				return true
		return false
	}

	colide(b, a) {
		for (const i in a._ho) {
			const e = a._ho[i]
			const f = b._ho[i]
			
			for (const d in e) {
				if(e[d] && f[d]){
					return false
				}
			}
		}
		return true
	}
}