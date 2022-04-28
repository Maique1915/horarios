import '../model/util/css/Horarios.css'
import React from 'react'

export default class Quadro extends React.Component{
	constructor(props){
		super(props)
		this.h = [[
			"07:00 as 07:50",
			"07:50 as 08:40",
			"08:40 as 10:30"],[
			"10:00 as 10:50",
			"10:50 as 11:40",
			"11:40 as 12:30"]
		]
		this.s = ["Seg", "Ter", "Qua", "Qui", "Sex"]
		this.arr = props.arr
		this.cor = props.cor
		this.id = props.tela
	}

	dia(e){
		return (
			<div className="semana">
				<b>{e}</b>
			</div>
			)
	}

	hora(e){
		return (
			<div className="horario">
				{e}
			</div>
			)
	}

	tabela(i){
		return (
			<div className="tabela">
				<div className="horario-content">
					<div className="horario f"/>
					{this.h[i].map((e) => this.hora(e))}
				</div>
				<div className="conteiner">
					<div className="semana-content">
						{this.s.map((e) => this.dia(e))}
					</div>
					<div className="materia-content">
					{typeof this.cor === "undefined"? this.caso2(i*3) : this.caso1(i*3)}
					</div>
				</div>
			</div>
		)
	}

	caso1(i){
		return (
		<div className="materia-content">
			<div className="materia">
				<div className={"semana "+this.cor[0][i]}>{this.arr[0][i]}</div>
				<div className={"semana "+this.cor[1][i]}>{this.arr[1][i]}</div>
				<div className={"semana "+this.cor[2][i]}>{this.arr[2][i]}</div>
				<div className={"semana "+this.cor[3][i]}>{this.arr[3][i]}</div>
				<div className={"semana "+this.cor[4][i]}>{this.arr[4][i]}</div>
			</div>
			<div className="materia">
				<div className={"semana "+this.cor[0][i+1]}>{this.arr[0][i+1]}</div>
				<div className={"semana "+this.cor[1][i+1]}>{this.arr[1][i+1]}</div>
				<div className={"semana "+this.cor[2][i+1]}>{this.arr[2][i+1]}</div>
				<div className={"semana "+this.cor[3][i+1]}>{this.arr[3][i+1]}</div>
				<div className={"semana "+this.cor[4][i+1]}>{this.arr[4][i+1]}</div>	
			</div>
			<div className="materia">
				<div className={"semana "+this.cor[0][i+2]}>{this.arr[0][i+2]}</div>
				<div className={"semana "+this.cor[1][i+2]}>{this.arr[1][i+2]}</div>
				<div className={"semana "+this.cor[2][i+2]}>{this.arr[2][i+2]}</div>
				<div className={"semana "+this.cor[3][i+2]}>{this.arr[3][i+2]}</div>
				<div className={"semana "+this.cor[4][i+2]}>{this.arr[4][i+2]}</div>	
			</div>
		</div>
		)
	}

	caso2(i){
		return(
		<div className="materia-content">
			<div className="materia">
				<div className="semana">{this.arr[0][i]}</div>
				<div className="semana">{this.arr[1][i]}</div>
				<div className="semana">{this.arr[2][i]}</div>
				<div className="semana">{this.arr[3][i]}</div>
				<div className="semana">{this.arr[4][i]}</div>
			</div>
			<div className="materia">
				<div className="semana">{this.arr[0][i+1]}</div>
				<div className="semana">{this.arr[1][i+1]}</div>
				<div className="semana">{this.arr[2][i+1]}</div>
				<div className="semana">{this.arr[3][i+1]}</div>
				<div className="semana">{this.arr[4][i+1]}</div>	
			</div>
			<div className="materia">
				<div className="semana">{this.arr[0][i+2]}</div>
				<div className="semana">{this.arr[1][i+2]}</div>
				<div className="semana">{this.arr[2][i+2]}</div>
				<div className="semana">{this.arr[3][i+2]}</div>
				<div className="semana">{this.arr[4][i+2]}</div>	
			</div>
		</div>
		)
	}

	tela(){
		return (
			<>
				{this.tabela(0)}
				<div className="intervalo">
					Intervalo
				</div>
				{this.tabela(1)}
			</>
		)
	}

	render(){
		return this.tela()
	}
}