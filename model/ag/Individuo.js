export default class Individuo{
	
	constructor(gene){
		this._gene = gene
		this._pts = 0
	}

	get gene(){
		return this._gene
	}

	set gene(gene){
		this._gene = gene
	}

	get pts(){
		return this._pts
	}

	set pts(pts){
		this._pts = pts
	}
}