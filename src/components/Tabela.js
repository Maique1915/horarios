import '../model/util/css/Horarios.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'
import Table from 'react-bootstrap/Table';

export default class Quadro extends React.Component{
	
	constructor(props){
		super(props)
		this.h = [
			[
			"07:00 as 07:50",
			"07:50 as 08:40",
			"08:40 as 10:30"],
			[
			"10:00 as 10:50",
			"10:50 as 11:40",
			"11:40 as 12:30"]
		]
		this.s = ["Seg", "Ter", "Qua", "Qui", "Sex"]
		this.arr = props.arr
		this.cor = props.cor
		this.id = props.tela
	}

	tabela(i){
		return typeof this.cor === "undefined"? this.caso2(i*3) : this.caso1(i*3)
	}

	caso1(i){
		for (var i = 0; i < 10; i++) {
			console.log(i*37.8055)
		}
		return(
			<table className="">
  				<thead>
			  	    <tr>
			      		<th scope="col"></th>
			      		<th className="semana" scope="col">{this.s[0]}</th>
			      		<th className="semana s2" scope="col">{this.s[1]}</th>
			      		<th className="semana" scope="col">{this.s[2]}</th>
			      		<th className="semana s2" scope="col">{this.s[3]}</th>
			      		<th className="semana" scope="col">{this.s[4]}</th>
			    	</tr>
			  	</thead>
			  	<tbody>
				    <tr>
			      		<th className="horario" scope="col">{this.h[0][0]}</th>
			      		<th className={"grade "+this.cor[0][0]} scope="col">{this.arr[0][0]}</th>
			      		<th className={"grade "+this.cor[1][0]} scope="col">{this.arr[1][0]}</th>
			      		<th className={"grade "+this.cor[2][0]} scope="col">{this.arr[2][0]}</th>
			      		<th className={"grade "+this.cor[3][0]} scope="col">{this.arr[3][0]}</th>
			      		<th className={"grade "+this.cor[4][0]} scope="col">{this.arr[4][0]}</th>
			    	</tr>
			    	<tr>
			      		<th className="horario s2" scope="col">{this.h[0][1]}</th>
			      		<th className={"grade "+this.cor[0][1]} scope="col">{this.arr[0][1]}</th>
			      		<th className={"grade "+this.cor[1][1]} scope="col">{this.arr[1][1]}</th>
			      		<th className={"grade "+this.cor[2][1]} scope="col">{this.arr[2][1]}</th>
			      		<th className={"grade "+this.cor[3][1]} scope="col">{this.arr[3][1]}</th>
			      		<th className={"grade "+this.cor[4][1]} scope="col">{this.arr[4][1]}</th>
			    	</tr>
				    <tr>
			      		<th className="horario" scope="col">{this.h[0][1]}</th>
			      		<th className={"grade "+this.cor[0][2]} scope="col">{this.arr[0][2]}</th>
			      		<th className={"grade "+this.cor[1][2]} scope="col">{this.arr[1][2]}</th>
			      		<th className={"grade "+this.cor[2][2]} scope="col">{this.arr[2][2]}</th>
			      		<th className={"grade "+this.cor[3][2]} scope="col">{this.arr[3][2]}</th>
			      		<th className={"grade "+this.cor[4][2]} scope="col">{this.arr[4][2]}</th>
			    	</tr>
			    	<tr>
			      		<th className='intervalo2' colSpan="6" scope="row">Intervalo</th>	
			    	</tr>
			    	<tr>
			      		<th className="horario s2" scope="col">{this.h[1][0]}</th>
			      		<th className={"grade "+this.cor[0][3]} scope="col">{this.arr[0][3]}</th>
			      		<th className={"grade "+this.cor[1][3]} scope="col">{this.arr[1][3]}</th>
			      		<th className={"grade "+this.cor[2][3]} scope="col">{this.arr[2][3]}</th>
			      		<th className={"grade "+this.cor[3][3]} scope="col">{this.arr[3][3]}</th>
			      		<th className={"grade "+this.cor[4][3]} scope="col">{this.arr[4][3]}</th>
			    	</tr>
			    	<tr>
			      		<th className="horario" scope="col">{this.h[1][1]}</th>
			      		<th className={"grade "+this.cor[0][4]} scope="col">{this.arr[0][4]}</th>
			      		<th className={"grade "+this.cor[1][4]} scope="col">{this.arr[1][4]}</th>
			      		<th className={"grade "+this.cor[2][4]} scope="col">{this.arr[2][4]}</th>
			      		<th className={"grade "+this.cor[3][4]} scope="col">{this.arr[3][4]}</th>
			      		<th className={"grade "+this.cor[4][4]} scope="col">{this.arr[4][4]}</th>
			    	</tr>
				    <tr>
			      		<th className="horario s2" scope="col">{this.h[1][2]}</th>
			      		<th className={"grade "+this.cor[0][5]} scope="col">{this.arr[0][5]}</th>
			      		<th className={"grade "+this.cor[1][5]} scope="col">{this.arr[1][5]}</th>
			      		<th className={"grade "+this.cor[2][5]} scope="col">{this.arr[2][5]}</th>
			      		<th className={"grade "+this.cor[3][5]} scope="col">{this.arr[3][5]}</th>
			      		<th className={"grade "+this.cor[4][5]} scope="col">{this.arr[4][5]}</th>
			    	</tr>
			  </tbody>
			</table>
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
		return this.tabela(0)
	}

	render(){
		return this.tela()
	}
}