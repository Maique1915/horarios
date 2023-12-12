import Search from '../components/Search'
import { useState } from 'react'
import { CursoProps } from '../types/cursos'
function Home() {
    const [cursos, setCursos] = useState<CursoProps | null>(null)

    async function loadCurso(c: sring) {
        const res = await fetch(`https://api.github.com/users/${c}`)
        const data = await res.json

        console.log(data)
    }
    return (
        <div>
            <Search loadCurso={loadCurso} />
        </div>
    )
}

export default Home
