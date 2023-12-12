import '../model/css/Horarios.css'
import React from 'react'
import { ativas } from '../model/Filtro'
import Comum from './Comum'
import '../model/css/GeraGrade.css'

interface HomeProps {
	cur: string;
}

interface HomeState {
	cur: string;
}

class Quadro extends React.Component<HomeProps, HomeState> {
	constructor(props: HomeProps) {
		super(props)
		this.state = { cur: props.cur }
	}

	render() {
		const a = ativas(this.props.cur)
		return <Comum materias={a} tela={1} cur={this.props.cur} separa={true} g={"º"} f={' Período'} />
	}
}

export default Quadro