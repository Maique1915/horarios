import Materias from '../Materias'

export default class Escolhe {

    constructor(genesis, cur, dimension, schedule) {
        this.cur = cur
        this.dimension = dimension || [0, 0] // [rows, cols] based on Materias expectation
        this.schedule = schedule || [[], []] // [days, timeslots]

        // Normalize genesis subjects to have boolean grid _ho
        this.genesis = genesis.map(subject => this.normalize(subject))

        console.log(genesis)

        this.reduz()
    }

    normalize(subject) {
        // Create an empty grid
        const m = new Materias(this.cur, this.dimension).m

        if (subject._ho && Array.isArray(subject._ho)) {
            let dbDays = [], dbTimeSlots = [];
            if (Array.isArray(this.schedule) && this.schedule.length >= 2) {
                [dbDays, dbTimeSlots] = this.schedule;
            }

            // Early return or check if mapping is possible
            if (!dbDays || !dbTimeSlots) return { ...subject, _grid: m._ho };

            subject._ho.forEach(slot => {
                // Check if slot is array [dayId, timeId]
                if (Array.isArray(slot) && slot.length === 2) {
                    const [dayId, timeId] = slot
                    const dayIndex = dbDays.findIndex(d => d.id === dayId)
                    const timeIndex = dbTimeSlots.findIndex(t => t.id === timeId)

                    if (dayIndex !== -1 && timeIndex !== -1) {
                        // Materias structure: _ho[dayIndex][timeIndex]
                        if (m._ho[dayIndex] && m._ho[dayIndex][timeIndex] !== undefined) {
                            m._ho[dayIndex][timeIndex] = true
                        }
                    }
                }
            })
        }

        // Return original subject with new _grid property for calculation
        return { ...subject, _grid: m._ho }
    }

    reduz() {
        while (this.genesis.length > 15) {
            const max = this.genesis.length
            const a = Math.floor(Math.random() * (max))
            this.genesis.splice(a, 1)
        }
    }

    count(str) {
        return str.reduce((acc, char) => char === '1' ? acc + 1 : acc, 0);
    }

    exc() {
        const aux = []
        let i = 2 ** this.genesis.length - 1
        while (i > 0) {
            const f = i.toString(2).padStart(this.genesis.length, '0').split('')
            i--

            if (this.count(f) >= 9) continue

            const c = []
            // Create initial empty mask from template (or just null and handle first merge)
            let m = new Materias(this.cur, this.dimension).m
            // We need m to have _grid, not _ho for calculation now
            // But Materias returns m with _ho. Let's alias it.
            let mask = { _grid: m._ho }

            let b = true

            for (const j in f) {
                if (f[j] === "1") {
                    const a = this.genesis[j]
                    if (this.colide(mask, a) && !this.existe(c, a)) {
                        c.push(a)
                        mask = this.merge(a, mask)
                    } else {
                        b = false
                        break
                    }
                }
            }
            if (b)
                aux.push(c)
        }

        return aux.sort(this.compare)
    }

    compare(a, b) {
        return b.length - a.length
    }

    merge(a, b) {
        // Merge a's _grid into b's _grid
        for (const i in a._grid)
            for (const j in a._grid[i])
                if (a._grid[i][j])
                    b._grid[i][j] = true
        return b
    }

    existe(c, a) {
        for (const b of c)
            if (a._re === b._re)
                return true
        return false
    }

    colide(b, a) {
        // Compare b._grid and a._grid
        for (const i in a._grid) {
            const e = a._grid[i]
            const f = b._grid[i]

            for (const d in e) {
                if (e[d] && f[d]) {
                    return false
                }
            }
        }
        return true
    }
}