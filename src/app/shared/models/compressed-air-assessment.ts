
export interface CompressedAirAssessment {
    name?: string;
    modifications?: Modification[];
    selected?: boolean;
    systemBasics: CASystemBasics
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