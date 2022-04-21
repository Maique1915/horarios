import '../model/util/css/Horarios.css'
import React from 'react'
import MateriasArray from '../model/materiasArray'
import db from '../model/db'

class Cadastro extends React.Component{

	constructor(){
		super()
		this.array = new MateriasArray().opc
		const colunas = Array(this.array.length).fill(" ")
		this.arr = Array.from(colunas, () => Array.from(colunas))
		this.materias = db
	}

	grava(e){
		const mat = document.getElementsByClassName("materias")
		const ma = new MateriasArray().materias
		for(const l of mat){
			for(const m of ma){
				if(m.disciplina === l.value){
					const ind = l.name.replace("materia", "")
					if(l.value.length > 0){
						m.horario = ind.concat("1")
					}else{
						m.horario = ind.concat("0")
					}
					console.log(ind.concat("0"))
				}
			
			}
		}
		
		var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ma));
		var downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href",     dataStr);
		downloadAnchorNode.setAttribute("download", "bd.json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		alert("salve este db.json na pasta model")
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	periodo(){
		let aux = []
		for (const i in this.array) {
			let sem = []
			for (var j = 0; j < 5; j++) {
				let h = []
				for (var k = 0; k < 6; k++){
					h.push(this.periodos(j+""+k, i, this.array[i].mat))
				}
				sem.push(h)
			}
			aux.push(sem)
		}
		return aux
	}

	periodos(key, i, item){

		return (
			<select name={"materia"+key} className="materias" id={"materia"+key}>
			    <option value="">Nenhuma</option>
			    {item.map((e)=>this.a(e,key, i))}
			</select>
			)
	}

	a(e,f, i){
		for(const l in this.materias){
			if(this.materias[l]._di === e){
				if(this.materias[l]._ho[parseInt(f[0])][parseInt(f[1])]){
					return (<option selected value={e}>{e}</option>)
				}
			}
		}
		return<option value={e}>{e}</option>
	}

	opc(e, f){
		return <input type="radio"  id={"radio2"+f} name="slide" className="radio"/>
	}
	
	labels(e, f){
		return <label htmlFor={"radio2"+f} className="bar" id={"bar"+f}>{(f+1)+"º"}</label>
	}
	

	tela(item, key){
		return (
			<>
			<div className={"Cadastro-content "+(key===0? "seila":"")}>
				<div className="intervalo">
					{(key+1)+"º Periodo"}
				</div>
				<div className="tabela">
					<div className="horario-content">
						<div className="horario f">
												
						</div>
						<div className="horario">
							07:00 as 07:50
						</div>
						<div className="horario">
							07:50 as 08:40
						</div>
						<div className="horario">
							08:40 as 10:30
						</div>						
					</div>
					<div className="conteiner">
						<div className="semana-content">
							<div className="semana">
								<b>Seg</b>
							</div>
							<div className="semana">
								<b>Ter</b>
							</div>
							<div className="semana">
								<b>Qua</b>
							</div>
							<div className="semana">
								<b>Qui</b>
							</div>
							<div className="semana">
								<b>Sex</b>
							</div>

						</div>
						<div className="materia-content">
							<div className="materia-content">
								<div className="materia">
									<div className="semana">{this.opcs[key][0][0]}</div>
									<div className="semana">{this.opcs[key][1][0]}</div>
									<div className="semana">{this.opcs[key][2][0]}</div>
									<div className="semana">{this.opcs[key][3][0]}</div>
									<div className="semana">{this.opcs[key][4][0]}</div>
								</div>
								<div className="materia">
									<div className="semana">{this.opcs[key][0][1]}</div>
									<div className="semana">{this.opcs[key][1][1]}</div>
									<div className="semana">{this.opcs[key][2][1]}</div>
									<div className="semana">{this.opcs[key][3][1]}</div>
									<div className="semana">{this.opcs[key][4][1]}</div>	
								</div>
								<div className="materia">
									<div className="semana">{this.opcs[key][0][2]}</div>
									<div className="semana">{this.opcs[key][1][2]}</div>
									<div className="semana">{this.opcs[key][2][2]}</div>
									<div className="semana">{this.opcs[key][3][2]}</div>
									<div className="semana">{this.opcs[key][4][2]}</div>	
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="intervalo">
					Intervalo
				</div>
				<div className="tabela">
					<div className="horario-content">
						<div className="horario">
							10:00 as 10:50
						</div>
						<div className="horario">
							10:50 as 11:40
						</div>
						<div className="horario">
							11:40 as 12:30
						</div>						
					</div>
					<div className="conteiner">
						<div className="materia-content">
							<div className="materia-content">
								<div className="materia">
									<div className="semana">{this.opcs[key][0][3]}</div>
									<div className="semana">{this.opcs[key][1][3]}</div>
									<div className="semana">{this.opcs[key][2][3]}</div>
									<div className="semana">{this.opcs[key][3][3]}</div>
									<div className="semana">{this.opcs[key][4][3]}</div>	
								</div>
								<div className="materia">
									<div className="semana">{this.opcs[key][0][4]}</div>
									<div className="semana">{this.opcs[key][1][4]}</div>
									<div className="semana">{this.opcs[key][2][4]}</div>
									<div className="semana">{this.opcs[key][3][4]}</div>
									<div className="semana">{this.opcs[key][4][4]}</div>	
								</div>
								<div className="materia">
									<div className="semana">{this.opcs[key][0][5]}</div>
									<div className="semana">{this.opcs[key][1][5]}</div>
									<div className="semana">{this.opcs[key][2][5]}</div>
									<div className="semana">{this.opcs[key][3][5]}</div>
									<div className="semana">{this.opcs[key][4][5]}</div>	
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			</>
			)
	}

	render(){
		this.opcs = this.periodo()
		console.log(this.opcs)
		return (
		<>
			<div className="slides2-content">
				<div className="slides">
					{this.arr.map((e,f) => this.opc(e,f))}
					<div className="seila2">
						{this.arr.map((e, f) =>this.tela(e,f))}
					</div>
				</div>
			</div>
			<div className="footer">
				<div className="salvar">
				<input type="submit" value="Salvar" onClick={this.grava} /></div>
				<div className="navigation">
					{this.arr.map((e,f) => this.labels(e,f))}
				</div>
			</div>
			</>

			)
		
	}
}

export default Cadastro