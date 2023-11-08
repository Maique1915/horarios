import '../model/util/css/Horarios.css'
import React from 'react'
import db from '../model/db'
import Comum from './Comum'

class Cadastro extends React.Component{

	constructor(){
		super()
		this.materias = db
	}
	
	render(){
		return <Comum materias = {this.materias} tela={3} separa = {false} g={"º"} f={" Período"}/>
	}
}

export default Cadastro