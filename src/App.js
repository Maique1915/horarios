import React from 'react'
import './model/css/index.css'
import './model/css/App.css'
import './model/css/Home.css'
import GeraGrade from './routes/GeraGrade'
import Quadro from './routes/Quadro'
import db3 from './model/bd3.json'

const App = (props) => {
    const cur = props.cur === undefined || props.cur === "" ? "engcom" : props.cur
    
    function fecha(){
        document.getElementById("horario").checked = true
    }

    return (
        <div className="App-window">
            <nav>
                <ul className="menu">
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
                    <div className="home">
                        <div className="form">
                            <label className="lbl" htmlFor="clubs">
                                <button className="text-token-text-primary" onClick={() => fecha()}>
                                    X
                                </button>
                                <h1>{db3.titulo}</h1>
                                <h5>{db3.subtitulo}</h5>
                                <h4>Como usar</h4>
                                <video width="100%" controls autoplay loop muted >
                                    <source src="./r2-1.mp4" type="video/mp4" />
                                    Seu navegador não suporta o elemento de vídeo.
                                </video></label>
                        </div>
                    </div>
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
