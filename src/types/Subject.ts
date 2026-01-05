export interface Subject {
    // Core Identifiers
    id?: number;
    _id: number; // Internal ID often used in logic
    _re: string;           // Acronym (e.g., 'C104')
    acronym?: string;       // Alias for _re
    _di: string;          // Name (e.g., 'Cálculo 1')
    name?: string;          // Alias for _di
    _cu: string;          // Course code (e.g., 'EC')
    course_name?: string;

    // Academic Data
    _ap: number;          // Practical credits/hours
    _at: number;          // Theory credits/hours
    _se: number; // Semester (e.g., 1, 2, ... 10)
    semester?: number; // Alias for _se
    _pr: string | (string | number)[]; // Prerequisites (acronyms or min credits)

    // Status/Category
    _el: boolean;         // true if Elective (Optativa)
    _ag: boolean;         // true if Active
    _category: string;    // 'MANDATORY', 'ELECTIVE', 'COMPLEMENTARY'
    elective?: boolean;

    // Metadata
    _workload: number;    // Total workload in hours
    credits?: number;      // Total credits
    _pr_creditos_input: number; // Minimum credits required as prereq

    // Scheduling
    _ho?: number[][];      // Schedule slots
    _da?: number[]; // Dimension info
    class_name?: string;   // Class name
    schedule_data?: any;
    schedule_day_time?: any;

    // Allow flexibility for other props
    [key: string]: any;
}
