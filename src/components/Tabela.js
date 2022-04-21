import '../model/util/css/Horarios.css'
import React from 'react'

class Quadro extends React.Component{
	constructor(props){
		super(props)
		this.h = [
			"07:00 as 07:50",
			"07:50 as 08:40",
			"08:40 as 10:30",
			"10:00 as 10:50",
			"10:50 as 11:40",
			"11:40 as 12:30"
		]
		this.s = ["Seg", "Ter", "Qua", "Qui", "Sex"]
		this.arr = props.arr
		this.cor = props.cor
	}

	tela(){
		return (
			<>
				<div className="tabela">
					<div className="horario-content">
						<div className="horario f">
												
						</div>
						<div className="horario">
							{this.h[0]}
						</div>
						<div className="horario">
							{this.h[1]}
						</div>
						<div className="horario">
							{this.h[2]}
						</div>						
					</div>
					<div className="conteiner">
						<div className="semana-content">
							<div className="semana">
								<b>{this.s[0]}</b>
							</div>
							<div className="semana">
								<b>{this.s[1]}</b>
							</div>
							<div className="semana">
								<b>{this.s[2]}</b>
							</div>
							<div className="semana">
								<b>{this.s[3]}</b>
							</div>
							<div className="semana">
								<b>{this.s[4]}</b>
							</div>

						</div>
						<div className="materia-content">
							<div className="materia-content">
								<div className="materia">
									<div className={"semana "+this.cor[0][0]}>{this.arr[0][0]}</div>
									<div className={"semana "+this.cor[1][0]}>{this.arr[1][0]}</div>
									<div className={"semana "+this.cor[2][0]}>{this.arr[2][0]}</div>
									<div className={"semana "+this.cor[3][0]}>{this.arr[3][0]}</div>
									<div className={"semana "+this.cor[4][0]}>{this.arr[4][0]}</div>
								</div>
								<div className="materia">
									<div className={"semana "+this.cor[0][1]}>{this.arr[0][1]}</div>
									<div className={"semana "+this.cor[1][1]}>{this.arr[1][1]}</div>
									<div className={"semana "+this.cor[2][1]}>{this.arr[2][1]}</div>
									<div className={"semana "+this.cor[3][1]}>{this.arr[3][1]}</div>
									<div className={"semana "+this.cor[4][1]}>{this.arr[4][1]}</div>	
								</div>
								<div className="materia">
									<div className={"semana "+this.cor[0][2]}>{this.arr[0][2]}</div>
									<div className={"semana "+this.cor[1][2]}>{this.arr[1][2]}</div>
									<div className={"semana "+this.cor[2][2]}>{this.arr[2][2]}</div>
									<div className={"semana "+this.cor[3][2]}>{this.arr[3][2]}</div>
									<div className={"semana "+this.cor[4][2]}>{this.arr[4][2]}</div>	
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
							{this.h[3]}
						</div>
						<div className="horario">
							{this.h[4]}
						</div>
						<div className="horario">
							{this.h[5]}
						</div>						
					</div>
					<div className="conteiner">
						<div className="materia-content">
							<div className="materia-content">
								<div className="materia">
									<div className={"semana "+this.cor[0][3]}>{this.arr[0][3]}</div>
									<div className={"semana "+this.cor[1][3]}>{this.arr[1][3]}</div>
									<div className={"semana "+this.cor[2][3]}>{this.arr[2][3]}</div>
									<div className={"semana "+this.cor[3][3]}>{this.arr[3][3]}</div>
									<div className={"semana "+this.cor[4][3]}>{this.arr[4][3]}</div>	
								</div>
								<div className="materia">
									<div className={"semana "+this.cor[0][4]}>{this.arr[0][4]}</div>
									<div className={"semana "+this.cor[1][4]}>{this.arr[1][4]}</div>
									<div className={"semana "+this.cor[2][4]}>{this.arr[2][4]}</div>
									<div className={"semana "+this.cor[3][4]}>{this.arr[3][4]}</div>
									<div className={"semana "+this.cor[4][4]}>{this.arr[4][4]}</div>	
								</div>
								<div className="materia">
									<div className={"semana "+this.cor[0][5]}>{this.arr[0][5]}</div>
									<div className={"semana "+this.cor[1][5]}>{this.arr[1][5]}</div>
									<div className={"semana "+this.cor[2][5]}>{this.arr[2][5]}</div>
									<div className={"semana "+this.cor[3][5]}>{this.arr[3][5]}</div>
									<div className={"semana "+this.cor[4][5]}>{this.arr[4][5]}</div>	
								</div>
							</div>
						</div>
					</div>
				</div>
			</>
			)
	}

	render(){
		return this.tela()
	}
}

export default Quadro