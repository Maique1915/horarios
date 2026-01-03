import Grafos from './Grafos';
export default class Escolhe {

    constructor(genesis, schedule) {
        this.schedule = schedule || [[], []]

        // Normalize genesis subjects 
        this.genesis = genesis.map(subject => this.normalize(subject))

        this.reduz()

        // Initialize NxN collision matrix with -1
        this.n = this.genesis.length;
        this.matrix = Array(this.n).fill(null).map(() => Array(this.n).fill(-1));
    }

    normalize(subject) {
        // Active slots as sparse list of strings "dayIndex:timeIndex"
        let activeSlots = [];

        if (subject._ho && Array.isArray(subject._ho)) {
            let dbDays = [], dbTimeSlots = [];
            if (Array.isArray(this.schedule) && this.schedule.length >= 2) {
                [dbDays, dbTimeSlots] = this.schedule;
            }

            if (dbDays && dbTimeSlots) {
                subject._ho.forEach(slot => {
                    if (Array.isArray(slot) && slot.length === 2) {
                        const [dayId, timeId] = slot
                        const dayIndex = dbDays.findIndex(d => d.id === dayId)
                        const timeIndex = dbTimeSlots.findIndex(t => t.id === timeId)

                        if (dayIndex !== -1 && timeIndex !== -1) {
                            activeSlots.push(`${dayIndex}:${timeIndex}`)
                        }
                    }
                })
            }
        }
        return { ...subject, _grid: activeSlots }
    }

    reduz() {
        while (this.genesis.length > 20) {
            const max = this.genesis.length
            const a = Math.floor(Math.random() * (max))
            this.genesis.splice(a, 1)
        }
    }

    count(str) {
        return str.reduce((acc, char) => char === '1' ? acc + 1 : acc, 0);
    }

    // Check collision between index i and j (memoized)
    // Returns 1 if safe (no collision), 0 if collision
    checkCollision(i, j) {
        if (i === j) return 1; // Same subject doesn't collide with self in this context? Or irrelevant.

        // Ensure i < j for matrix access
        let r = i, c = j;
        if (r > c) { r = j; c = i; }

        if (this.matrix[r][c] !== -1) {
            return this.matrix[r][c];
        }

        const subjectsCollide = !this.semColisao(this.genesis[r], this.genesis[c]);
        // User said: "se as duas colidirem ponha ... um 0, se não ponha 1"
        const res = subjectsCollide ? 0 : 1;

        this.matrix[r][c] = res;
        return res;
    }

    exc() {
        const aux = []
        let i = 2 ** this.genesis.length - 1

        while (i > 0) {
            const f = i.toString(2).padStart(this.genesis.length, '0').split('')
            i--

            if (this.count(f) >= 9) continue

            const currentCombinationIndices = [];
            const currentCombinationSubjects = [];
            let valid = true;

            for (let j = 0; j < f.length; j++) {
                if (f[j] === "1") {
                    const idx = j; // Index in this.genesis

                    // Check against all already added subjects in this combination
                    for (const prevIdx of currentCombinationIndices) {
                        if (this.checkCollision(prevIdx, idx) === 0) {
                            valid = false;
                            break;
                        }
                    }

                    if (!valid) break;

                    // Also check for "duplicate subject reference" (same subject code) 
                    // although normally genesis shouldn't have dupes, but legacy existing check did this.
                    // legacy: !this.existe(c, a). 
                    // Let's keep it if we want to be safe, but collision check is the main one.
                    const subject = this.genesis[idx];
                    if (this.existe(currentCombinationSubjects, subject)) {
                        // Treat as valid skip? Or invalid combo?
                        // If we have same subject twice, it's effectively a collision of headers.
                        // But physically they might not collide time-wise.
                        // Just don't add it? Or mark invalid?
                        // Original code: if (semColisao && !existe) -> add. else -> break.
                        // So if it exists, it breaks (b=false).
                        valid = false;
                        break;
                    }

                    currentCombinationIndices.push(idx);
                    currentCombinationSubjects.push(subject);
                }
            }

            if (valid) {
                aux.push(currentCombinationSubjects);
            }
        }

        return aux.sort(this.compare)
    }

    compare(a, b) {
        return b.length - a.length
    }

    existe(c, a) {
        for (const b of c)
            if (a._re === b._re)
                return true
        return false
    }

    // Returns true if NO collision (safe)
    semColisao(a, b) {
        // a._grid and b._grid are arrays of strings
        // Iterate smaller one for efficiency
        const [small, large] = a._grid.length < b._grid.length ? [a, b] : [b, a];

        for (const slot of small._grid) {
            if (large._grid.includes(slot)) {
                return false; // Collision
            }
        }
        return true;
    }

    /**
     * Simulates future semesters to predict graduation.
     * @param {Array} allSubjects - All available subjects in the course.
     * @param {Array} completedSubjects - Subjects already completed by the user.
     * @param {Object} scheduleMeta - { days: [], slots: [] } Metadata for schedule parsing.
     * @returns {number} Estimated number of semesters remaining.
     */
    static predictCompletion(allSubjects, completedSubjects, scheduleMeta, limits = { electiveHours: Infinity, mandatoryHours: Infinity }) {
        if (!allSubjects || allSubjects.length === 0) return 0;

        let currentCompleted = [...completedSubjects]; // Copy to avoid mutating original
        let semesters = 0;
        const semesterGrids = []; // Store the subjects chosen for each predicted semester
        const MAX_SEMESTERS = 20; // Safety break

        while (semesters < MAX_SEMESTERS) {
            // 0. Calculate current accumulated hours
            const currentMandatoryHours = currentCompleted.filter(s => s._el).reduce((acc, s) => acc + (s._workload || 0), 0);
            const currentElectiveHours = currentCompleted.filter(s => !s._el).reduce((acc, s) => acc + (s._workload || 0), 0);

            // 1. Find candidates (what can be taken now)
            // Grafos expects (allSubjects, cr, names). 
            // We pass -1 for CR to auto-calc based on completed.
            const grafos = new Grafos(allSubjects, -1, currentCompleted);
            let candidates = grafos.matriz();

            // 1.1 FILTER CANDIDATES BASED ON LIMITS
            candidates = candidates.filter(subject => {
                if (subject._el) {
                    // Mandatory: Always allowed
                    return true;
                } else {
                    // Elective: Check if limit reached
                    return currentElectiveHours < limits.electiveHours;
                }
            });

            // If no candidates left, we are done (or stuck, implying done for this simulation)
            if (candidates.length === 0) break;

            // 2. Select best schedule
            // Use Deterministic chooser to avoid random results in prediction
            const escolhe = new EscolheDeterministico(candidates, scheduleMeta);
            const possibleSchedules = escolhe.exc();

            if (possibleSchedules.length === 0) {
                // Should not happen if candidates exist, unless huge conflict 
                // or no slots. If so, we break (can't take more).
                break;
            }

            // 3. Pick the "best" (most subjects/hours)
            // exc() sorts by length descending, so index 0 is best.
            const bestSchedule = possibleSchedules[0];

            // 4. Update state
            // Add these subjects to completed list
            currentCompleted = [...currentCompleted, ...bestSchedule];
            semesterGrids.push(bestSchedule);
            semesters++;
        }

        return { semestersCount: semesters, semesterGrids };
    }
}

// Subclass to enforce deterministic reduction for prediction accuracy
class EscolheDeterministico extends Escolhe {
    reduz() {
        while (this.genesis.length > 20) {
            // Deterministic prune: Remove lowest priority (High semester, Elective)
            // We want to KEEP: Mandatory, Low Semester.
            // So we find the "worst" candidate to remove.
            // Worst = Elective (true), High Semester.

            let worstIdx = -1;
            let worstScore = -1; // Score: Elective=1000, Semester=Value. High score = bad.

            for (let i = 0; i < this.genesis.length; i++) {
                const s = this.genesis[i];
                // Heuristic score
                let score = s._se; // Base: Semester
                if (s._el) score += 1000; // Penalize electives

                if (score > worstScore) {
                    worstScore = score;
                    worstIdx = i;
                } else if (score === worstScore) {
                    // Tie breaker: Random? Or ID? Use ID for stability
                    if (s._id > this.genesis[worstIdx]._id) {
                        worstIdx = i;
                    }
                }
            }

            if (worstIdx !== -1) {
                this.genesis.splice(worstIdx, 1);
            } else {
                // Fallback
                this.genesis.pop();
            }
        }
    }
}