export interface DatasetStats {
    total: number;
    classes: Record<string, number>;
}


export interface DatasetClasses {
    classes: string[];
}