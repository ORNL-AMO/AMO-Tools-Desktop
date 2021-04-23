
export interface CompressedAirAssessment {
    name?: string;
    modifications?: Modification[];
    selected?: boolean;
    systemBasics: CASystemBasics,
    systemInformation: SystemInformation
}

export interface Modification {
    compressedAirAssessment: CompressedAirAssessment
}

export interface CASystemBasics {
    utilityType: string,
    electricityCost: number,
    demandCost: number,
    notes: string
}

export interface SystemInformation {
    nominalPressure: number,
    systemElevation: number,
    totalAirStorage: number,
    isSequencerUsed: boolean,
    targetPressure: number,
    variance: number
}