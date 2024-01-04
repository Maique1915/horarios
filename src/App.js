import React from 'react';
import './model/css/App.css';
import './model/css/Matricular.css';
import GeraGrade from './routes/GeraGrade'
import Quadro from './routes/Quadro'
import 'bootstrap/scss/bootstrap.scss'

const App = (props) => {
    const cur = props.cur

        return (
            <div className="App-window">
                <nav className='nav'>
                    <ul className="menu">
                        <li><label className="bar" htmlFor="horario">Grades</label></li>
                        <li><label className="bar" htmlFor="grade">Gerar a sua</label></li>
                    </ul>
                </nav>
                <div className='contentarea'>
                    <input type="radio" id={"horario"} name="tela" className="radio" defaultChecked />
                    <input type="radio" id={"grade"} name="tela" className="radio" />
                    <input type="radio" id={"atualiza"} name="tela" className="radio" />
                    <input type="radio" id={"fluxograma"} name="tela" className="radio" />
                    <div className="tela1">
                        < Quadro cur={cur} />
                    </div>
                    <div className="tela2">
                        <GeraGrade cur={cur} />
                    </div>
                </div>
            </div>

        )
}

export default App;
