import '../model/util/css/Horarios.css'
import React from 'react';
import db from '../model/db'
import Comum from './Comum'

class Quadro extends React.Component{
	constructor(){
		super()
	}

	render(){
		return <Comum materias = {db} tela={3} separa= {true} f={'Período'}/>
	}
}

export default Quadro