
class Escolhe{
	
	constructor(genesis){
		this.genesis = genesis
	}

	exc(){
		let aux = []
		for(const a of this.genesis){
			let c = []
			for(const b of this.genesis){
				if (c.length === 0) {
					c.push(a)
				}
				if(this.cmp(c, b)){
					c.push(b)	
				}
			}

			const stra = this._string(c)
			let foi = true
			
			for(const b of aux){
				const strb = this._string(b)
				if(stra === strb){
					foi = false
					break
				}
			}
			
			if (foi){
				aux.push(c)
			}
		}
		aux.sort(this.compare)
		return aux
	}

	
	_printa(e){
		console.log(this._string(e))
	}

	_string(e){
		return this._array(e).join(", ")
	}

	_array(e){
		const str= []
		for(const a in e){
			str.push(e[a]._di)
		}
		return str.sort()
	}


	array(e){
		const str= []
		for(const a of e){
			str.push(this._array(a))
		}
		console.log(str)
		return str
	}

	compare(a, b){
		const i = a.length
		const j = b.length
		return i < j ? 1 : i > j? -1 : 0
	}

	cmp(c,a){
		for (const b of c) {
			for (const i in a._ho) {
				const e = a._ho[i]
				const f = b._ho[i]
				for(const d in e){
					if(e[d] && f[d]){
						return false
					}
				}
			}
		}
		return true
	}

}

export default Escolhe