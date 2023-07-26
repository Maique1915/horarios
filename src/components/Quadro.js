import '../model/util/css/Horarios.css'
import React from 'react';
import materias from '../model/db'
import Comum from './Comum'

class Quadro extends React.Component{
	render(){
		return <Comum materias = {materias} tela={1} separa={true} g={"º"} f={' Período'}/>
	}
}

export default Quadro