
export interface CompressedAirAssessment {
    name?: string;
    modifications?: Modification[];
    selected?: boolean;
    systemBasics: CASystemBasics,
    systemInformation: SystemInformation,
    compressorInventoryItems: Array<CompressorInventoryItem>,
    systemProfile: SystemProfile
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

export interface CompressorInventoryItem {
    itemId: string,
    name: string,
    nameplateData: CompressorNameplateData,
    compressorControls: CompressorControls,
    performanceData: PerformanceData,
    designDetails: DesignDetails,
    performancePoints: PerformancePoints

}

export interface CompressorNameplateData {
    compressorType: string,
    motorPower: number,
    fullLoadOperatingPressure: number,
    fullLoadRatedCapacity: number,
    ratedLoadPower: number,
    ploytropicCompressorExponent: number
}

export interface CompressorControls {
    controlType: string,
    unloadControls: UnloadControls
}

export interface UnloadControls {
    unloadingPointCapacity: number,
    numberOfUnloadingSteps: number,
    shutdownTimer: boolean
}

export interface PerformanceData {
    inletAtmosphericPressure: number
}

export interface DesignDetails {
    blowdownTime: number,
    unloadSlumpPressure: number,
    modulatingPressureRange: number,
    inputPressure: number,
    surgeAirflow: number,
    maxFullLoadPressure: number,
    maxFullLoadCapacity: number,
    minFullLoadPressure: number
    minFullLoadCapacity: number,
    designEfficiency: number
}

export interface PerformancePoints {
    fullLoad: PerformancePoint,
    maxFullFlow: PerformancePoint,
    unloadPoint: PerformancePoint,
    noLoad: PerformancePoint
}

export interface PerformancePoint {
    dischargePressure: number,
    airflow: number,
    power: number
}

export interface SystemProfile {
    systemProfileSetup: SystemProfileSetup,
    compressorOrdering: Array<CompressorOrderItem>;
}


export interface SystemProfileSetup {
    dayType: string,
    numberOfHours: number,
    dataInterval: 2 | 1 | .5 | .25
}


export interface CompressorOrderItem {
    compressorName: string,
    compressorId: string,
    orders: Array<number>
}