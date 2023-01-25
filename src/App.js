import './model/util/css/App.css'
import React from 'react';
import Quadro from './components/Quadro'
import Cadastro from './components/Cadastro'
import GeraGrade from './components/GeraGrade'

export default class App extends React.Component {

  constructor(){
    super()
  }

  render(){

    return (
      <>
        <div className="App-window">
          <nav>
            <ul className="menu">
              <li><label  className="bar" htmlFor="horario">Horários</label></li>
              <li><label  className="bar" htmlFor="matricula">Matrículas possíveis</label></li>
            </ul>
          </nav>
          <div className='contentarea'>
            <input type="radio" id={"horario"} name="tela" className="radio" checked />
            <input type="radio" id={"matricula"} name="tela" className="radio"/>
            <div className="tela1">
              <Quadro/>
            </div>
            <div className="tela2">
              <GeraGrade/>
            </div>
          </div>
        </div>
      </>
    );
  }
}