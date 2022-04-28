import React from 'react';

const cores = ["l1","l2","l3","l4","l5","l6","l7","l8","l9"] 

export default class Comum extends React.Component{

	grade(materias, separa){
		const m = Array(5).fill("")
		const m2 = Array(6).fill("")
		let arr = []
		let cor = []
		let aux = materias
		const r = Math.floor(Math.random()*cores.length)
		if (separa) {
			aux = this.separa(aux)
		}

		for(const a of aux){
			const cl = Array.from(m, () => Array.from(m2))
			const v = Array.from(m, () => Array.from(m2))
			for(const b in a){
				for(const c in a[b]._ho){
					for(const d in a[b]._ho[c]){
						if(a[b]._ho[c][d]){
							v[c][d] = a[b]._di
							cl[c][d] = cores[(b + r)%cores.length]
						}				
					}
				}
			}
			arr.push(v)
			cor.push(cl)
		}
		return [arr, cor]
	}

	separa(mat){
		let aux = []
		let aux2 = []
		let count = 1
		for(const i of mat){
			if(i._se !== count){
				count = i._se
				aux.push(aux2)
				aux2 = []
			}
			aux2.push(i)
		}
		aux.push(aux2)
		return aux
	}

	opc(e, f){
		return <input type="radio"  id={"radio"+e+""+f} name={"slide"+e} className="radio"/>
	}
	
	labels(e, f){
		return <label htmlFor={"radio"+e+""+f} className="bar" id={"bar"+e+""+f}>{f+1+"º"}</label>
	}//
	
	periodos(array){
		this.materias = array
		const arr = this.separa(array)
		const [a, b] = this.grade(array)
		let aux = []
		for (const i in arr) {
			let sem = []
			for (var l = 0; l < 5; l++) {
				let h = []
				for (var c = 0; c < 6; c++) {
					h.push(this.selects(l+""+c, i, arr[i]))
				}
				sem.push(h)
			}
			aux.push(sem)
		}

		return aux
	}

	selects(key, i, item){
		return (
			<select name={"materia"+key} className="materias" id={"materia"+key}>
			    <option value="">Nenhuma</option>
			    {item.map((e)=>this.option(e._di,key, i))}
			</select>
			)
	}

	option(e,f, i){
		for(const l in this.materias){
			if(this.materias[l]._di === e){
				if(this.materias[l]._ho[parseInt(f[0])][parseInt(f[1])]){
					return (<option selected value={e}>{e}</option>)
				}
			}
		}
		return <option value={e}>{e}</option>
	}


}