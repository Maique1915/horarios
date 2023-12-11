import './model/util/css/index.css'
import './model/util/css/App.css'

import React from 'react';
import Quadro from './components/Quadro'
import GeraGrade from './components/GeraGrade'
import { cursos } from './model/Filtro';

export default class App extends React.Component {

    constructor(props) {
        super(props)
        this.cursos = cursos()
        this.atualiza = this.atualiza.bind(this);
        this.cur = props.cur
    }

    atualiza(e) {
        this.cur = e.target.innerHTML
        this.setState({ })
    }

    render() {
        let a = window.location.href.split("/")[3]
        this.cur = a === "" ? this.cur : a
        return (
        <main>
            <div className="App-window">
                
                    <nav>
                        <ul className="menu">
                            <li><label className="bar" htmlFor="horario">Horários</label></li>
                            <li><label className="bar" htmlFor="grade">Sua grade</label></li>
                            <li><label className="bar hidden" htmlFor="atualiza">Atualiza</label></li>
                        </ul>
                        
                    </nav>
                <div className='contentarea'>
                    <input type="radio" id={"horario"} name="tela" className="radio" defaultChecked />
                    <input type="radio" id={"grade"} name="tela" className="radio"/>
                    <input type="radio" id={"atualiza"} name="tela" className="radio"/>
                    <input type="radio" id={"fluxograma"} name="tela" className="radio"/>
                    <div className="tela1">
                        <Quadro cur={this.cur} />
                    </div>
                    <div className="tela2">
                        <GeraGrade cur={this.cur} />
                    </div>
                </div>
            </div>
        </main>
    )
  }
}