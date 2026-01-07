export interface Activity {
    id: number;
    activity_id: number;
    hours: number;
    semester: string;
    document_link?: string;
    description?: string;
    activity?: {
        group: string;
        code: string;
        description: string;
        limit_hours?: number;
    };
    [key: string]: any;
}

export interface SubgroupProgress {
    id: number;
    code: string;
    description: string;
    limit: number;
    formula?: string;
    total: number;
    capped_total: number;
}

export interface GroupProgress {
    group: string;
    label: string;
    description: string;
    limit: number;
    min_limit?: number;
    total: number;
    capped_total: number;
    subgroups: SubgroupProgress[];
}

export interface CatalogItem {
    id: number;
    group: string;
    code: string;
    description: string;
    limit_hours: number;
}

export interface Catalog {
    [key: string]: CatalogItem[];
}
