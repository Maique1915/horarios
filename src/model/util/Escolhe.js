import Materias from '../Materias'
import { dimencao } from '../Filtro'

export default class Escolhe {

    constructor(genesis, cur) {
        this.genesis = genesis
        this.cur = cur
        this.dimensao = null
        // Removed this.reduz() as we want to process all options
    }

    async init() {
        this.dimensao = await dimencao(this.cur)
        return this
    }

    // Helper to check collision between a set of occupied slots and a candidate class
    colide(occupiedSlots, candidateClass) {
        if (!candidateClass._ho) return false;

        for (const slot of candidateClass._ho) {
            // slot is [dayId, timeId]
            const key = slot.join(',');
            if (occupiedSlots.has(key)) {
                return true;
            }
        }
        return false;
    }

    exc() {
        console.log("Escolhe: Starting backtracking with", this.genesis.length, "classes");

        // 1. Group classes by Subject (using _re as unique identifier for discipline)
        const subjectsMap = {};
        this.genesis.forEach(cls => {
            if (!subjectsMap[cls._re]) {
                subjectsMap[cls._re] = [];
            }
            subjectsMap[cls._re].push(cls);
        });

        const subjectKeys = Object.keys(subjectsMap);
        const results = [];
        const MAX_RESULTS = 50; // Limit to prevent browser freeze if too many combinations

        // 2. Backtracking function
        const backtrack = (index, currentSolution, occupiedSlots) => {
            // Optimization: Stop if we already have enough results
            if (results.length >= MAX_RESULTS) return;

            // Base case: All subjects processed
            if (index === subjectKeys.length) {
                results.push([...currentSolution]);
                return;
            }

            const currentSubject = subjectKeys[index];
            const possibleClasses = subjectsMap[currentSubject];

            // Try each class for the current subject
            for (const cls of possibleClasses) {
                if (!this.colide(occupiedSlots, cls)) {
                    // Add class to solution
                    currentSolution.push(cls);

                    // Add slots to occupied set to track usage for this path
                    const newSlots = [];
                    if (cls._ho) {
                        for (const slot of cls._ho) {
                            const key = slot.join(',');
                            occupiedSlots.add(key);
                            newSlots.push(key);
                        }
                    }

                    // Recurse
                    backtrack(index + 1, currentSolution, occupiedSlots);

                    // Backtrack: Remove class and slots
                    currentSolution.pop();
                    newSlots.forEach(key => occupiedSlots.delete(key));

                    if (results.length >= MAX_RESULTS) return;
                }
            }
        };

        // Start recursion
        const start = performance.now();
        backtrack(0, [], new Set());
        const end = performance.now();
        console.log(`Escolhe: Found ${results.length} valid grades in ${(end - start).toFixed(2)}ms`);

        // Sort by "quality" (e.g. density, or just keep order) 
        // Original code sorted by length, but here all valid grades have same length (one per subject)
        // We can keep it or sort by other criteria if needed.

        return results;
    }
}