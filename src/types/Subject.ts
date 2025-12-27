export interface Subject {
    // Core Identifiers
    _id?: string | number; // Optional because sometimes it's just raw JSON
    _re: string;           // Acronym (e.g., 'C104')
    _di: string;           // Name (e.g., 'Cálculo 1')
    _cu?: string;          // Course code (e.g., 'EC')

    // Academic Data
    _ap: number;           // Practical credits/hours
    _at: number;           // Theory credits/hours
    _se: number;           // Semester (e.g., 1, 2, ... 10)
    _pr: string | string[]; // Prerequisites (usually string array of acronyms)

    // Status/Category
    _el?: boolean;         // true if Elective (Optativa)
    _ag?: boolean;         // true if Active
    _category?: string;    // 'MANDATORY', 'ELECTIVE', 'COMPLEMENTARY'

    // Metadata
    _workload?: number;    // Total workload in hours
    _pr_creditos_input?: number; // Minimum credits required as prereq

    // Scheduling (The user specifically asked for this)
    _ho?: number[][];      // Schedule slots: [[day, timeSlot], ...] 
    _da?: string | number[]; // Dimension info or similar? Often unused or legacy, keeping for compatibility
    class_name?: string;   // Class name (e.g., 'A', 'B') if specific class selected

    // Allow flexibility for other props
    [key: string]: any;
}
