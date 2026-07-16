export interface UserProps {
    id: number;
    username: string;
    passwordHash: string;
    name: string;
    role: string;
    active: boolean;
    courseId?: number | null;
    isPaid: boolean;
    subscriptionExpiresAt?: string | null;
    createdAt?: string;
}

export class User {
    public readonly id: number;
    public username: string;
    public passwordHash: string;
    public name: string;
    public role: string;
    public active: boolean;
    public courseId: number | null;
    public isPaid: boolean;
    public subscriptionExpiresAt: string | null;
    public readonly createdAt: string | null;

    constructor(props: UserProps) {
        this.id = props.id;
        this.username = props.username;
        this.passwordHash = props.passwordHash;
        this.name = props.name;
        this.role = props.role;
        this.active = props.active;
        this.courseId = props.courseId ?? null;
        this.isPaid = props.isPaid;
        this.subscriptionExpiresAt = props.subscriptionExpiresAt ?? null;
        this.createdAt = props.createdAt ?? null;

        this.validate();
    }

    private validate(): void {
        if (!this.username || this.username.trim().length < 3) {
            throw new Error('USER_VALIDATION_ERROR: O nome de usuário deve ter pelo menos 3 caracteres.');
        }
        if (!this.name || this.name.trim().length < 2) {
            throw new Error('USER_VALIDATION_ERROR: O nome deve ter pelo menos 2 caracteres.');
        }
        const allowedRoles = ['user', 'admin'];
        if (!allowedRoles.includes(this.role)) {
            throw new Error(`USER_VALIDATION_ERROR: O papel (role) do usuário deve ser um de: ${allowedRoles.join(', ')}.`);
        }
    }

    public isSubscriptionActive(): boolean {
        if (!this.isPaid || !this.subscriptionExpiresAt) return false;
        const expirationDate = new Date(this.subscriptionExpiresAt);
        return expirationDate > new Date();
    }
}
