import Materias from '../Materias'

export default class Escolhe{
	
	constructor(genesis){
		this.genesis = genesis
	}

	exc(){
		let aux = []
		let i = 2 ** this.genesis.length -1
		
		while(true) {
			if(i <= 0) break
			let f = i.toString(2).padStart(this.genesis.length, '0')
			i--
			if(f.split("1").length >= 9)
				continue
			
			let c = []
			let m = new Materias(0,0,0,0,0,0,0)
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
		aux.sort(this.compare)
		return aux
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

	colide(b,a){
		for (const i in a._ho) {
			const e = a._ho[i]
			const f = b._ho[i]
			for(const d in e){
				if(e[d] && f[d]){
					return false
				}
			}
		}
		return true
	}
}