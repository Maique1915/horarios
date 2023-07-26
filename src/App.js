import './model/util/css/index.css'
import './model/util/css/App.css'

import React from 'react';
import Quadro from './components/Quadro'
import GeraGrade from './components/GeraGrade'
import Cadastro from './components/Cadastro'

export default class App extends React.Component {
  render(){
/*
    for (var i = 0; i < 20; i++) {
      console.log("#radio2"+i+":checked ~ .seila2, #radio3"+i+":checked ~ .seila3, #radio1"+i+":checked ~ .seila1 {margin-top: "+-i*711/9+"vh; }")
    }
*/
    return (
      <>
        <div className="App-window">
         <nav>
            <ul className="menu">
              <li><label  className="bar" htmlFor="horario">Horários</label></li>
              <li><label  className="bar" htmlFor="grade">Grades possíveis</label></li>
              <li><label  className="bar hidden" htmlFor="atualiza">Atualiza</label></li>

            </ul>
          </nav>
          <div className='contentarea'>
            <input type="radio" id={"horario"} name="tela" className="radio" defaultChecked />
            <input type="radio" id={"grade"} name="tela" className="radio"/>
            <input type="radio" id={"atualiza"} name="tela" className="radio"/>
            <input type="radio" id={"fluxograma"} name="tela" className="radio"/>
            <div className="tela1">
              <Quadro/>
            </div>
            <div className="tela2">
              <GeraGrade/>
            </div>
            <div className="tela3">
              <Cadastro/>
            </div>
          </div>
        </div>
      </>
    );
  }
}