import Individuo from './Individuo'

export default class AG{

	constructor(materias){
		this.pop = []
		this.maxGenes = 9
		this.qtdPop = materias.length*2
		this.genesis = materias
	}

	initPop(m){
		for(let i = 0; i < this.qtdPop; i++){
			const aux = []
			for(const l in m){
				aux.push(this.rand(0,1) == 1)
			}
			this.pop.push(new Individuo(aux))
		}
	}

	fitness(){
		for(const l of this.pop){
			l.pts = this.colide(l.gene)
		}
		this.pop.sort(this.cmp)
	}

	cross(){
		let pais = this.pop.slice(0,7)
		
		for(let i = pais.length - 1; i > 1; i--){
			const r = this.rand(1, pais[0].gene.length-2)
			const x = this.roleta(pais)
			this.troca(pais, x, pais.length -1)
			const y = this.roleta(pais.slice(0, i))
			this.troca(pais, y, pais.length -2)

			let gx = pais[x].gene.slice(0,r)
			let gy = pais[y].gene.slice(r, pais[y].gene.length)

			this.pop.unshift(new Individuo(gx.concat(gy)))

			pais = pais.slice(0, i-1)
			
		}
	}

	novaPop(){
		this.pop = this.pop.slice(0, this.qtdPop)
	}

	multa(){
		let r = this.rand(0,50)
		if(r === 3){
			console.log("multação")
			const r1 = this.rand(0, Math.floor(this.pop.length/2))
			const r2 = this.rand(0, this.genesis.length-1)
			this.pop[r1].gene[r2] = !this.pop[r1].gene[r2]
		}
	}

	render(mat){
		this.initPop(this.genesis)
		for (var i = 0; i < 1000; i++) {
			this.fitness()
			if(i%100 === 99){	
				console.log("geração: "+i+" gene :"+ this.pop[0].gene.join(", ")+" => "+this.pop[0].pts)
			}
			this.cross()
			this.multa()
			this.novaPop()	
		}
		mat = []
		for (let i = 0; mat.length < 3; i++) {
			const aux = []	
			for(const a in this.pop[0].gene){
				if (this.pop[i].gene[a]) {
					aux.push(this.genesis[a])
				}
			}
			if(!mat.includes())
				mat.push(aux)
		}
		console.log(mat.length)
	}

	troca(v,i, j){
		const aux = v[i]
		v[i] = v[j]
		v[j] = aux
	}

	roleta(v){
		let n = 0, aux = [], x = 0,y = 0
		const s = this.rand(0,100)
		for(const l of v) 
			n += l.pts
		for(const l in v){
			x = l == 0? 100*v[l].pts/n : 100*v[l].pts/n + aux[l-1]
			if (x > s)
				break
			y = l
		}
		return y
	}

	colide(v){
		const aux = []
		let count = 0
		let p = 0
		for (const i in v) {
			let count1 = 0
			if(v[i]){
				p++
				for(const k in this.genesis[i]._ho){
					const a = this.genesis[i]._ho[k]
					for(const j in v){
						if(v[j] && i !== j){
							const b = this.genesis[j]._ho[k]
							for(const c in a){
								if(a[c] === b[c] && a[c]){
									count1++
									break
								}	
							}
							if(count1 > 0) break
						}
					}
				}
			}
			count += count1
			aux.push(count1)
		}
		return Math.floor(p - count)
	}

	print(v){
		for(const g of v){
			console.log(g.gene.join(", ")+" => "+g.pts)
		}
	}

	cmp(a,b){
		const i = a.pts
		const j = b.pts
		return i < j? 1: i > j? -1: 0
	}

	rand(i,f){
		return Math.floor(Math.random() * (f-i+1)+i) 
	}
}