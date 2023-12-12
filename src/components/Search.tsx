import { BsSearch } from 'react-icons/bs'
import { useState } from 'react'

type SearchProps = {
    loadCurso: (cursoName: string) => Promise<void>
}
function Search({ loadCurso }: SearchProps) {
    const [ cursoName, setCursoName ] = useState("")

    return (
        <div>
            <h2>Busque</h2>
            <p>Conheça seus melhores repositórios</p>
            <div>
                <input type="text" placeholder="Nome do usuário" onChange={(e) => setCursoName(e.target.value)} />
                <button onClick={() => loadCurso(cursoName)}><BsSearch /></button>
            </div>
        </div>
    )
}

export default Search
