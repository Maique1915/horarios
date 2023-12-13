import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './model/css/index.css';
import './model/css/App.css';
import GeraGrade from './routes/GeraGrade';
import Quadro from './routes/Quadro';
const App = (props) => {
    const cur = props.cur;
    return (_jsxs("div", { className: "App-window", children: [_jsx("nav", { children: _jsxs("ul", { className: "menu", children: [_jsx("li", { children: _jsx("label", { className: "bar", htmlFor: "horario", children: "Grades" }) }), _jsx("li", { children: _jsx("label", { className: "bar", htmlFor: "grade", children: "Gerar a sua" }) })] }) }), _jsxs("div", { className: 'contentarea', children: [_jsx("input", { type: "radio", id: "horario", name: "tela", className: "radio", defaultChecked: true }), _jsx("input", { type: "radio", id: "grade", name: "tela", className: "radio" }), _jsx("input", { type: "radio", id: "atualiza", name: "tela", className: "radio" }), _jsx("input", { type: "radio", id: "fluxograma", name: "tela", className: "radio" }), _jsx("div", { className: "tela1", children: _jsx(Quadro, { cur: cur }) }), _jsx("div", { className: "tela2", children: _jsx(GeraGrade, { cur: cur }) })] })] }));
};
export default App;
