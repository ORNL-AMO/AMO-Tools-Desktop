export interface Settings {
    language?: string,
    currency?: string,
    unitsOfMeasure?: string
    assessmentId?: number,
    directoryId?: number,
    createdDate?: Date,
    modifiedDate?: Date
}

export interface PsatSettings { 
    settings?: Settings,
    headMeasurement?: string,
    flowMeasurement?: string
}

export interface PhastSettings {
    settings?: string
}