export interface CourseProps {
    id: number;
    code: string;
    name: string;
    shift: string | null;
    modalities: string | null;
    periods: number | null;
    campus: string | null;
    activies?: boolean;
    universityId?: number | null;
    needsComplementaryActivities?: boolean;
    periodStart?: string | null;
    periodEnd?: string | null;
}

export class Course {
    public readonly id: number;
    public readonly code: string;
    public name: string;
    public shift: string | null;
    public modalities: string | null;
    public periods: number | null;
    public campus: string | null;
    public activies: boolean;
    public universityId: number | null;
    public needsComplementaryActivities: boolean;
    public periodStart: string | null;
    public periodEnd: string | null;

    constructor(props: CourseProps) {
        this.id = props.id;
        this.code = props.code;
        this.name = props.name;
        this.shift = props.shift;
        this.modalities = props.modalities;
        this.periods = props.periods;
        this.campus = props.campus;
        this.activies = props.activies ?? false;
        this.universityId = props.universityId ?? null;
        this.needsComplementaryActivities = props.needsComplementaryActivities ?? false;
        this.periodStart = props.periodStart ?? null;
        this.periodEnd = props.periodEnd ?? null;

        this.validate();
    }

    private validate(): void {
        if (!this.code || this.code.trim().length === 0) {
            throw new Error('COURSE_VALIDATION_ERROR: O código do curso é obrigatório.');
        }
        if (!this.name || this.name.trim().length < 3) {
            throw new Error('COURSE_VALIDATION_ERROR: O nome do curso deve ter pelo menos 3 caracteres.');
        }
        if (this.periods !== null && this.periods <= 0) {
            throw new Error('COURSE_VALIDATION_ERROR: A quantidade de períodos deve ser maior que zero.');
        }
    }
}
