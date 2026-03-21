import Grafos from './Grafos';
export default class Escolhe {

    constructor(genesis, schedule, weights = new Map(), mainCourseId = null, seedIndices = new Set()) {
        this.weights = weights;
        this.schedule = schedule || [[], []]
        this.mainCourseId = mainCourseId;
        this.seedIndices = seedIndices;

        // Normalize genesis subjects 
        this.genesis = genesis.map(subject => this.normalize(subject))

        // Initialize NxN collision matrix with -1
        this.n = this.genesis.length;
        this.matrix = Array(this.n).fill(null).map(() => Array(this.n).fill(-1));

        // Allow subclasses to reduce search space before heavy processing
        if (typeof this.reduz === 'function') {
            this.reduz();
            this.n = this.genesis.length;
            this.matrix = Array(this.n).fill(null).map(() => Array(this.n).fill(-1));
        }
    }

    normalize(subject) {
        // Active slots as sparse list of strings "dayIndex:timeIndex"
        let activeSlots = [];

        // Support both array [days, slots] and object { days, slots }
        let dbDays = [], dbTimeSlots = [];
        if (Array.isArray(this.schedule) && this.schedule.length >= 2) {
            [dbDays, dbTimeSlots] = this.schedule;
        } else if (this.schedule && typeof this.schedule === 'object') {
            dbDays = this.schedule.days || [];
            dbTimeSlots = this.schedule.slots || [];
        }

        // 1. Check direct _ho (legacy/simple)
        let rawHo = subject._ho;

        // 2. Fallback to _classSchedules if _ho is missing
        if ((!rawHo || rawHo.length === 0) && subject._classSchedules && subject._classSchedules.length > 0) {
            // Pick the first class as the "representative" for prediction/simulation
            rawHo = subject._classSchedules[0].ho;
        }

        if (rawHo && Array.isArray(rawHo) && dbDays.length > 0 && dbTimeSlots.length > 0) {
            rawHo.forEach(slot => {
                if (Array.isArray(slot) && slot.length === 2) {
                    const [dayId, timeId] = slot;
                    const dayIndex = dbDays.findIndex(d => d.id === dayId);
                    const timeIndex = dbTimeSlots.findIndex(t => t.id === timeId);

                    if (dayIndex !== -1 && timeIndex !== -1) {
                        activeSlots.push(`${dayIndex}:${timeIndex}`);
                    }
                }
            });
        }
        return { ...subject, _grid: activeSlots };
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

            // Seed check: combinations MUST include all subjects in seedIndices
            let missingSeed = false;
            for (const sIdx of this.seedIndices) {
                if (f[sIdx] !== '1') {
                    missingSeed = true;
                    break;
                }
            }
            if (missingSeed) continue;

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

        return aux.sort(this.compare.bind(this))
    }

    compare(a, b) {
        // First priority: Critical Path (Max individual weight)
        const getMaxWeight = (arr) => {
            let max = 0;
            for (const s of arr) {
                const w = this.weights.get(s._re) || 0;
                if (w > max) max = w;
            }
            return max;
        };

        const maxA = getMaxWeight(a);
        const maxB = getMaxWeight(b);
        if (maxA !== maxB) return maxB - maxA;

        // Second priority: Number of subjects (more is better)
        if (a.length !== b.length) return b.length - a.length;

        // Third priority: Total weight sum
        const getSumWeight = (arr) => arr.reduce((acc, s) => acc + (this.weights.get(s._re) || 0), 0);
        return getSumWeight(b) - getSumWeight(a);
    }

    existe(c, a) {
        for (const b of c)
            if (a._re === b._re)
                return true
        return false
    }

    // Returns true if NO collision (safe)
    semColisao(a, b) {
        // Se alguma das matérias for de outro curso, não verificar choque de horário (conforme pedido do usuário)
        // Isso permite que matérias "extras" convivam na mesma grade mesmo que os horários coincidam no papel.
        const isFromOtherCourse = (s) => s.course_id && this.mainCourseId && s.course_id !== this.mainCourseId;

        if (isFromOtherCourse(a) || isFromOtherCourse(b)) {
            return true;
        }

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
     * @returns {{ semestersCount: number, semesterGrids: Array<Array<Object>> }} Prediction result containing count and grids.
     */
    static predictCompletion(allSubjects, completedSubjects, scheduleMeta, limits = { optionalHours: Infinity, mandatoryHours: Infinity }, mainCourseId = null, equivalencies = [], fixedFutureSemesters = []) {
        if (!allSubjects || allSubjects.length === 0) return 0;

        let currentCompleted = [...completedSubjects]; // Copy to avoid mutating original
        let semesters = 0;
        const semesterGrids = []; // Store the subjects chosen for each predicted semester
        const MAX_SEMESTERS = 20; // Safety break

        while (semesters < MAX_SEMESTERS) {

            // 0. Calculate current accumulated hours
            // Using a more robust elective check: _el=true OR Period 0 OR from other course
            const isOptional = (s) => {
                const isFromMainCourse = !s.course_id || (mainCourseId && s.course_id === mainCourseId);
                if (isFromMainCourse) {
                    return s._el || s._se === 0 || s._category === 'OPTIONAL';
                }

                const equiv = equivalencies.find(e => e.source_subject_id === s._id);
                if (equiv) {
                    // Se tem equivalência no curso alvo, checa se a ALVO é optativa
                    const targetInMain = allSubjects.find(m => m._id === equiv.target_subject_id);
                    if (targetInMain) {
                        return targetInMain._el || targetInMain._se === 0 || targetInMain._category === 'OPTIONAL';
                    }
                    if (equiv.target_subject) {
                        return equiv.target_subject.semester === 0 || !equiv.target_subject.semester;
                    }
                }

                // Se não tem equivalência e é de outro curso, assume optativa (conforme pedido)
                return true;
            };

            const currentMandatoryHours = currentCompleted.filter(s => !isOptional(s)).reduce((acc, s) => acc + (s._workload || 0), 0);
            const currentOptionalHours = currentCompleted.filter(s => isOptional(s)).reduce((acc, s) => acc + (s._workload || 0), 0);

            // 1. Find candidates (what can be taken now)
            // Grafos expects (allSubjects, cr, names). 
            // We pass -1 for CR to auto-calc based on completed.
            const grafos = new Grafos(allSubjects, -1, currentCompleted);
            let candidates = grafos.matriz();

            // 1.05 EXCLUDE subjects that are fixed in ANY future semester
            // This prevents the algorithm from "stealing" a manually placed subject for an earlier semester
            const futureSeeds = fixedFutureSemesters.slice(semesters + 1).flat();
            candidates = candidates.filter(c => !futureSeeds.some(fs => fs._re === c._re));

            // 1.1 FILTER CANDIDATES BASED ON LIMITS
            candidates = candidates.filter(subject => {
                if (!subject._el) {
                    // Mandatory (_el=false): Always allowed
                    return true;
                } else {
                    // Optativa (_el=true): Check if limit reached
                    return currentOptionalHours < limits.optionalHours;
                }
            });

            // If no candidates left, we are done (or stuck, implying done for this simulation)
            if (candidates.length === 0) {
                break;
            }

            // 2. Select best schedule
            // Calculate heights for current pool of subjects
            const heights = grafos.calculateHeights();

            // Identify seeds for this semester from fixedFutureSemesters
            const seedIndices = new Set();
            const currentFixed = fixedFutureSemesters[semesters] || [];
            currentFixed.forEach(fixedSub => {
                const idx = candidates.findIndex(c => c._re === fixedSub._re);
                if (idx !== -1) seedIndices.add(idx);
            });

            // Use Deterministic chooser to avoid random results in prediction
            const escolhe = new EscolheDeterministico(candidates, scheduleMeta, heights, mainCourseId, seedIndices);
            const possibleSchedules = escolhe.exc();

            if (possibleSchedules.length === 0) {
                break;
            }

            // 3. Pick the "best" (most subjects/hours)
            // exc() sorts by length descending, so index 0 is best.
            const bestSchedule = possibleSchedules[0];
            console.log(`✨ Selected ${bestSchedule.length} subjects for this semester:`, bestSchedule.map(s => s._re).join(', '));

            // 4. Update state
            // Add these subjects to completed list
            currentCompleted = [...currentCompleted, ...bestSchedule];
            semesterGrids.push(bestSchedule);
            semesters++;
        }

        console.log(`\n🎉 Prediction finished: ${semesters} semesters total\n`);
        return { semestersCount: semesters, semesterGrids };
    }
}

// Subclass to enforce deterministic reduction for prediction accuracy
class EscolheDeterministico extends Escolhe {
    constructor(genesis, schedule, weights, mainCourseId, seedIndices) {
        super(genesis, schedule, weights, mainCourseId, seedIndices);
    }

    reduz() {
        const originalCount = this.genesis.length;
        console.log(`🔧 Reduz: Starting with ${originalCount} candidates (Seeds: ${this.seedIndices.size})`);

        // Separate subjects: keep mandatory AND seeded ones
        const mandatoryOrSeeded = this.genesis.filter((s, idx) => !s._el || this.seedIndices.has(idx));
        const optionals = this.genesis.filter((s, idx) => s._el && !this.seedIndices.has(idx));

        // Keep all mandatory/seeded subjects
        this.genesis = [...mandatoryOrSeeded];

        // Add optionals up to the limit
        const MAX_SUBJECTS = 20;
        const remainingSlots = Math.max(0, MAX_SUBJECTS - mandatoryOrSeeded.length);

        if (optionals.length > remainingSlots) {
            // Need to reduce optionals
            console.log(`  🔧 Reducing ${optionals.length} optionals to ${remainingSlots}`);

            // Sort optionals by priority (criticality first, then lower semester)
            optionals.sort((a, b) => {
                const critA = this.weights.get(a._re) || 0;
                const critB = this.weights.get(b._re) || 0;
                if (critA !== critB) return critB - critA; // Higher criticality first
                return a._se - b._se; // Lower semester first
            });

            const kept = optionals.slice(0, remainingSlots);
            this.genesis.push(...kept);
        } else {
            this.genesis.push(...optionals);
        }

        console.log(`🔧 Reduz: Final count: ${this.genesis.length} (${mandatoryOrSeeded.length} mandatory/seeded + ${this.genesis.length - mandatoryOrSeeded.length} other optionals)`);

        if (mandatoryOrSeeded.length > MAX_SUBJECTS) {
            console.warn(`⚠️ Warning: ${mandatoryOrSeeded.length} mandatory/seeded subjects exceed the ${MAX_SUBJECTS} limit. All will be kept.`);
        }
    }
}