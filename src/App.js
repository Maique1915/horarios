import './model/util/css/App.css'
import React from 'react';
import Quadro from './components/Quadro'
import Cadastro from './components/Cadastro'
import Grade from './components/Grade'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";


export default class App extends React.Component {

  render(){
       
    return (
      <Router>
      <div className="App-window">
      <nav>
        <ul className="menu">
          <li><a href="/">Horários</a></li>
          <li><a href="/grade">Matrículas possíveis</a></li>
          <li><a href="/horario">Alterar horários</a></li>
        </ul>
      </nav>
        <div className='contentarea'>
          <Routes>
            <Route path="/" element={<Quadro/>}/>
            <Route path="/grade" exact element={<Grade/>}/>
            <Route path="/horario" element={<Cadastro/>}/>
          </Routes>
        </div>
      </div>
      </Router>
    );
  }
}