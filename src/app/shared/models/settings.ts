export interface Settings {
    language?: string,
    currency?: string,
    unitsOfMeasure?: string
    assessmentId?: number,
    directoryId?: string
}

export interface PsatSettings { 
    settings?: Settings,
    headMeasurement?: string,
    flowMeasurement?: string
}

export interface PhastSettings {
    settings?: string
}