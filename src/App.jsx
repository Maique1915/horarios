import React, { useState } from 'react';
import GeraGrade from './components/GeraGrade';
import Quadro from './components/Quadro';
import './model/css/App.css';

const App = (props) => {
    const [activeTab, setActiveTab] = useState('gerar');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cur } = props;

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Planejador de Grade</h1>
                <button className="menu-toggle" onClick={toggleMenu}>
                    &#9776; {/* Hamburger Icon */}
                </button>
                <nav className={`app-nav ${isMenuOpen ? 'open' : ''}`}>
                    <button 
                        onClick={() => { setActiveTab('grades'); setIsMenuOpen(false); }} 
                        className={activeTab === 'grades' ? 'active' : ''}
                    >
                        Grades
                    </button>
                    <button 
                        onClick={() => { setActiveTab('gerar'); setIsMenuOpen(false); }}
                        className={activeTab === 'gerar' ? 'active' : ''}
                    >
                        Gerar a Sua
                    </button>
                </nav>
            </header>
            
            <main className="content-area">
                {activeTab === 'grades' && <Quadro cur={cur} />}
                {activeTab === 'gerar' && <GeraGrade cur={cur} />}
            </main>
        </div>
    );
}

export default App;