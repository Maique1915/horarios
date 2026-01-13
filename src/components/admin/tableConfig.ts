export interface ColumnConfig {
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'datetime' | 'select' | 'json';
    editable: boolean;
    options?: { label: string; value: any }[]; // For select type
}

export interface TableConfig {
    tableName: string;
    displayName: string;
    primaryKey: string;
    columns: ColumnConfig[];
    rpc?: {
        read?: string;
        create?: string;
        update?: string;
        delete?: string;
    };
    customActions?: {
        label: string;
        icon?: string;
        hrefPattern: string; // e.g. /admin/curriculum/{code}
    }[];
}

export const tableConfigs: Record<string, TableConfig> = {
    users: {
        tableName: 'users',
        displayName: 'Usuários',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'username', label: 'Username', type: 'text', editable: true },
            { key: 'name', label: 'Nome', type: 'text', editable: true },
            { key: 'role', label: 'Role', type: 'text', editable: true },
            { key: 'active', label: 'Ativo?', type: 'boolean', editable: true },
            { key: 'course_id', label: 'ID Curso', type: 'number', editable: true },
            { key: 'is_paid', label: 'Pago?', type: 'boolean', editable: true },
            { key: 'subscription_expires_at', label: 'Expira em', type: 'datetime', editable: true },
            { key: 'created_at', label: 'Criado em', type: 'datetime', editable: false },
        ],
        rpc: {
            read: 'admin_get_users'
        }
    },
    courses: {
        tableName: 'courses',
        displayName: 'Cursos',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'code', label: 'Código', type: 'text', editable: true },
            { key: 'name', label: 'Nome', type: 'text', editable: true },
            { key: 'shift', label: 'Turno', type: 'text', editable: true },
        ],
        customActions: [
            {
                label: 'Grade Curricular',
                icon: 'edit_calendar',
                hrefPattern: '/admin/curriculum/{code}'
            }
        ]
    },
    subjects: {
        tableName: 'subjects',
        displayName: 'Disciplinas',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'course_id', label: 'ID Curso', type: 'number', editable: true },
            { key: 'acronym', label: 'Sigla/Código', type: 'text', editable: true },
            { key: 'name', label: 'Nome', type: 'text', editable: true },
            { key: 'semester', label: 'Semestre', type: 'number', editable: true },
            { key: 'has_theory', label: 'Créd. Teóricos', type: 'number', editable: true },
            { key: 'has_practical', label: 'Créd. Práticos', type: 'number', editable: true },
            { key: 'workload', label: 'Carga Horária', type: 'number', editable: true },
            { key: 'elective', label: 'Eletiva?', type: 'boolean', editable: true },
            { key: 'active', label: 'Ativo?', type: 'boolean', editable: true },
            {
                key: 'category',
                label: 'Categoria',
                type: 'select',
                editable: true,
                options: [
                    { label: 'Obrigatória', value: 'MANDATORY' },
                    { label: 'Eletiva', value: 'ELECTIVE' },
                    { label: 'Complementar', value: 'COMPLEMENTARY' }
                ]
            },
        ]
    },
    classes: {
        tableName: 'classes',
        displayName: 'Turmas',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'class', label: 'Turma', type: 'text', editable: true },
            { key: 'subject_id', label: 'ID Disciplina', type: 'number', editable: true },
            { key: 'day_id', label: 'ID Dia', type: 'number', editable: true },
            { key: 'time_slot_id', label: 'ID Horário', type: 'number', editable: true },
        ]
    },
    days: {
        tableName: 'days',
        displayName: 'Dias',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'name', label: 'Nome', type: 'text', editable: true },
            { key: 'short_name', label: 'Abrev.', type: 'text', editable: true },
        ]
    },
    time_slots: {
        tableName: 'time_slots',
        displayName: 'Horários',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'start_time', label: 'Início', type: 'text', editable: true },
            { key: 'end_time', label: 'Fim', type: 'text', editable: true },
        ]
    },
    complementary_activities: {
        tableName: 'complementary_activities',
        displayName: 'Atividades Complementares',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'group', label: 'Grupo', type: 'text', editable: true },
            { key: 'code', label: 'Código', type: 'text', editable: true },
            { key: 'description', label: 'Descrição', type: 'text', editable: true },
            { key: 'workload_formula', label: 'Fórmula CH', type: 'text', editable: true },
            { key: 'limit_hours', label: 'Limite Horas', type: 'number', editable: true },
            { key: 'requirements', label: 'Requisitos', type: 'text', editable: true },
            { key: 'active', label: 'Ativo?', type: 'boolean', editable: true },
            { key: 'course_id', label: 'ID Curso', type: 'number', editable: true },
        ]
    },
    comments: {
        tableName: 'comments',
        displayName: 'Comentários',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID', type: 'number', editable: false },
            { key: 'content', label: 'Conteúdo', type: 'text', editable: true },
            { key: 'user_id', label: 'ID Usuário', type: 'number', editable: true },
            { key: 'created_at', label: 'Criado em', type: 'datetime', editable: false },
        ]
    },
    complementary_activity_groups: {
        tableName: 'complementary_activity_groups',
        displayName: 'Grupos Atv. Compl.',
        primaryKey: 'id',
        columns: [
            { key: 'id', label: 'ID (Grupo)', type: 'text', editable: true },
            { key: 'description', label: 'Descrição', type: 'text', editable: true },
            { key: 'min_hours', label: 'Min. Horas', type: 'number', editable: true },
            { key: 'max_hours', label: 'Max. Horas', type: 'number', editable: true },
            { key: 'course_id', label: 'ID Curso', type: 'number', editable: true },
        ]
    }
    // Add more tables as needed
};
