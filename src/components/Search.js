import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BsSearch } from 'react-icons/bs';
import { useState } from 'react';
function Search({ loadCurso }) {
    const [cursoName, setCursoName] = useState("");
    return (_jsxs("div", { children: [_jsx("h2", { children: "Busque" }), _jsx("p", { children: "Conhe\uFFFDa seus melhores reposit\uFFFDrios" }), _jsxs("div", { children: [_jsx("input", { type: "text", placeholder: "Nome do usu\uFFFDrio", onChange: (e) => setCursoName(e.target.value) }), _jsx("button", { onClick: () => loadCurso(cursoName), children: _jsx(BsSearch, {}) })] })] }));
}
export default Search;
