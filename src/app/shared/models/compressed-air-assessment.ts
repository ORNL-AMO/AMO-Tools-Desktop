import { DayTypeSummary, LogToolDbData, LogToolField } from "../../log-tool/log-tool-models";

export interface CompressedAirAssessment {
    name?: string;
    modifications?: Modification[];
    selected?: boolean;
    systemBasics: CASystemBasics,
    systemInformation: SystemInformation,
    compressorInventoryItems: Array<CompressorInventoryItem>,
    systemProfile: SystemProfile,
    // logToolDbData?: LogToolDbData,
    logToolData?: {
        dayTypeSummaries: Array<DayTypeSummary>,
        logToolFields: Array<LogToolField>
    },
    compressedAirDayTypes: Array<CompressedAirDayType>
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
    compressorLibId?: number,
    name: string,
    description: string,
    nameplateData: CompressorNameplateData,
    compressorControls: CompressorControls,
    inletConditions: InletConditions,
    designDetails: DesignDetails,
    performancePoints: PerformancePoints,
    centrifugalSpecifics: CentrifugalSpecifics,
    modifiedDate: Date

}

export interface CompressorNameplateData {
    compressorType: number,
    motorPower: number,
    fullLoadOperatingPressure: number,
    fullLoadRatedCapacity: number,
    ratedLoadPower: number,
    ploytropicCompressorExponent: number,
    fullLoadAmps: number,
    //ADDED TO REMOVE GENERIC COMPRESSOR FOR PP CALCS
    totalPackageInputPower: number
}

export interface CompressorControls {
    controlType: number,
    unloadPointCapacity: number,
    numberOfUnloadSteps: number,
    automaticShutdown: boolean,
    //ADDED TO REMOVE GENERIC COMPRESSOR FOR PP CALCS
    unloadSumpPressure: number,
}

export interface InletConditions {
    atmosphericPressure: number,
    temperature: number
}

export interface DesignDetails {
    blowdownTime: number,
    modulatingPressureRange: number,
    inputPressure: number,
    designEfficiency: number,
    serviceFactor: number,
    //ADDED TO REMOVE GENERIC COMPRESSOR FOR PP CALCS
    noLoadPowerFM: number,
    noLoadPowerUL: number,
    maxFullFlowPressure: number
}

export interface PerformancePoints {
    fullLoad: PerformancePoint,
    maxFullFlow: PerformancePoint,
    unloadPoint: PerformancePoint,
    noLoad: PerformancePoint,
    blowoff: PerformancePoint
}

export interface PerformancePoint {
    dischargePressure: number,
    isDefaultPressure: boolean,
    airflow: number,
    isDefaultAirFlow: boolean,
    power: number,
    isDefaultPower: boolean
}

export interface SystemProfile {
    systemProfileSetup: SystemProfileSetup,
    // compressorOrdering: Array<CompressorOrderItem>;
    profileSummary: Array<ProfileSummary>
}


export interface SystemProfileSetup {
    dayTypeId: string,
    numberOfHours: number,
    dataInterval: 2 | 1 | .5 | .25,
    profileDataType: "power" | "percentCapacity" | "airflow"
}


// export interface CompressorOrderItem {
//     compressorName: string,
//     compressorId: string,
//     fullLoadPressure: number,
//     orders: Array<number>
// }

export interface CentrifugalSpecifics {
    surgeAirflow: number,
    maxFullLoadPressure: number,
    maxFullLoadCapacity: number,
    minFullLoadPressure: number
    minFullLoadCapacity: number
}

export interface ProfileSummary {
    compressorName: string,
    fullLoadPressure: number,
    compressorId: string,
    dayTypeId: string,
    profileSummaryData: Array<ProfileSummaryData>,
    logToolFieldId?: string
}

export interface ProfileSummaryData {
    power: number,
    airflow: number,
    percentCapacity: number,
    timeInterval: number,
    percentPower: number,
    percentSystemCapacity: number,
    order: number,
}


export interface CompressedAirDayType {
    dayTypeId: string,
    name: string,
    numberOfDays: number,
    profileDataType: "power" | "percentCapacity" | "airflow"
}