import React from 'react'
import '../model/css/Home.css'
import db3 from '../model/bd3.json';

class Home extends React.Component {

    indice(i) {
        return (
            <li classNameName="carousel__navigation-item">asd
                <a href={`#carousel__slide${i}`} className="carousel__navigation-button">{`Go to slide ${i}`}sdfd</a>
            </li>
        )
    }
    render() {
        return (
            <div className="home">
                <form className="form">

                    <input type="radio" name="fancy" defaultChecked value="clubs" id="clubs" />
                   
                    
                    <label className="lbl" htmlFor="clubs">
                        <h1>{db3.titulo}</h1>
                        <h5>{db3.subtitulo}</h5>
                        <h4>Como usar</h4>
                        <video width="100%" controls autoplay loop muted >
                            <source src="./r2-1.mp4" type="video/mp4"  />
                            Seu navegador não suporta o elemento de vídeo.
                    </video></label>
                </form>
                </div>
        )
    }
}

export default Home