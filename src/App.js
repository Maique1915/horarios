import React from 'react';
import './model/css/index.css';
import './model/css/App.css';
import GeraGrade from './routes/GeraGrade'
import Quadro from './routes/Quadro'
import Home from './routes/Home'

const App = (props) => {
    const cur = props.cur === undefined || props.cur === "" ? "engcom" : props.cur

        return (
            <div className="App-window">
                <nav>
                    <ul className="menu">
                        <li><label className="bar" htmlFor="home">Home</label></li>
                        <li><label className="bar" htmlFor="horario">Grades</label></li>
                        <li><label className="bar" htmlFor="grade">Gerar a sua</label></li>
                    </ul>
                </nav>
                <div className='contentarea'>
                    <input type="radio" id={"home"} name="tela" className="radio" defaultChecked />
                    <input type="radio" id={"horario"} name="tela" className="radio" />
                    <input type="radio" id={"grade"} name="tela" className="radio" />
                    <input type="radio" id={"atualiza"} name="tela" className="radio" />
                    <input type="radio" id={"fluxograma"} name="tela" className="radio" />
                    <div className="tela3">
                        < Home />
                    </div>
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
