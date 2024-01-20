import React from 'react'
import { ativas } from '../model/Filtro'
import Comum from './Comum'

const Quadro = ({ cur }) => {	
	const a = ativas(cur)
	return <Comum materias={[a]} tela={1} cur={cur} separa={true} g={"º"} f={' Período'} />
}

export default Quadro
