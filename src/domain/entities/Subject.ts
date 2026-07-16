export interface SubjectProps {
    id: number;
    courseId: number;
    semester: number;
    name: string;
    acronym: string;
    categoryId?: number | null;
    category?: any; // Para suportar join da nova tabela se necessário
    optional: boolean;
    active: boolean;
    hasPractical?: boolean;
    hasTheory?: boolean;
    elective?: boolean;
    workload?: number | null;
}

export class Subject {
    public readonly id: number;
    public readonly courseId: number;
    public semester: number;
    public name: string;
    public acronym: string;
    public categoryId: number | null;
    public category: any | null; // Join result
    public optional: boolean;
    public active: boolean;
    public hasPractical: boolean;
    public hasTheory: boolean;
    public elective: boolean;
    public workload: number | null;

    constructor(props: SubjectProps) {
        this.id = props.id;
        this.courseId = props.courseId;
        this.semester = props.semester;
        this.name = props.name;
        this.acronym = props.acronym;
        this.categoryId = props.categoryId ?? null;
        this.category = props.category ?? null;
        this.optional = props.optional;
        this.active = props.active;
        this.hasPractical = props.hasPractical ?? false;
        this.hasTheory = props.hasTheory ?? true;
        this.elective = props.elective ?? false;
        this.workload = props.workload ?? null;

        this.validate();
    }

    private validate(): void {
        if (!this.name || this.name.trim().length < 2) {
            throw new Error('SUBJECT_VALIDATION_ERROR: O nome da disciplina deve ter pelo menos 2 caracteres.');
        }
        if (!this.acronym || this.acronym.trim().length === 0) {
            throw new Error('SUBJECT_VALIDATION_ERROR: A sigla da disciplina é obrigatória.');
        }
        if (this.courseId <= 0) {
            throw new Error('SUBJECT_VALIDATION_ERROR: O ID do curso é inválido.');
        }
        if (this.semester < 0) {
            throw new Error('SUBJECT_VALIDATION_ERROR: O semestre não pode ser negativo.');
        }
    }
}
