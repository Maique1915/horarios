export default class Grafos{

	constructor(materias, feitas){
		this.materias = materias
		this.possiveis = []
		this.feitas = feitas
		this.re = 0
		for(const a of feitas){
			this.re+= materias[a]._ap + materias[a]._at
		}
		console.log(this.re)
	}

	matriz(){
		let colunas = Array(this.materias.length).fill(0)
		this.arr = Array.from(colunas, () => Array.from(colunas))
		let mat  = []
		let i = 0
		for (var m = this.feitas.length - 1; m >= 0; m--) {
			mat.push(this.materias[this.feitas[m]]._re)
		}

		for (; i <  colunas.length; i++) {
			let requisitos = this.materias[i]._pr
			for (var j = 0; j <  colunas.length; j++) {
				let materia = this.materias[j]._re
				if(requisitos.includes(materia)){
					this.arr[i][j] = 1
					this.arr[j][i] = 9
				}else if(this.materias[j]._pr.length === 0 && !mat.includes(materia)){
					if (!this.possiveis.includes(this.materias[j])) {
						if(this.re >= 140 && this.materias[j]._di === "Estágio Supervisionado"){
							this.possiveis.push(this.materias[j])
							console.log(this.re)
						}else if(this.materias[j]._di !== "Estágio Supervisionado"){
							this.possiveis.push(this.materias[j])
						}
					}
				}
			}
		}

		this.requisitos()
		console.log(this.feitas)
		return this.possiveis
	}

	requisitos(){
		for(let i = 0; i < this.feitas.length;){
			let l = this.feitas[i]
			let c = this.arr[l].indexOf(9)
			if(c >= 0){
				this.arr[l][c] = 0
				this.arr[c][l] = 2
				let bool = true
				for(let t = this.arr[c].indexOf(1);t >= 0;t = this.arr[c].indexOf(1)){
					this.arr[c][t] = 0
					this.arr[t][c] = 0
					if (!this.feitas.includes(t)) {
						bool = false
						this.arr[c].fill(0)
						break
					}
				}
				console.log(this.materias[c]._di+" "+c+" "+(this.feitas.indexOf(c) === -1 )+" "+(this.possiveis.indexOf(this.materias[c]) === -1)+" "+bool )
				if (this.feitas.indexOf(c) === -1 && bool && this.possiveis.indexOf(this.materias[c]) === -1) {
					this.possiveis.push(this.materias[c])
				}
				
			}else{
				i++
			}
		}
	}
}


/*


		for (i = 0; i < this.feitas.length ;) {
			let j = this.arr[this.feitas[i]].indexOf(9)
			if(j < 0){
				i++
			}else{
				this.arr[this.feitas[i]][j] = 0
				if(!this.possiveis.includes(this.materias[j]) && this.feitas.indexOf(j) === -1){
					this.possiveis.push(this.materias[j])
					this.arr[j][m] += 2
				}
			}
		}

*/