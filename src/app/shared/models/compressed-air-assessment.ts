import { DayTypeSummary, LogToolDbData, LogToolField } from "../../log-tool/log-tool-models";

export interface CompressedAirAssessment {
    name?: string;
    existingDataUnits?: string;
    modifications: Array<Modification>;
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
    name: string,
    modificationId: string,
    // flowReallocation: FlowReallocation,
    reduceAirLeaks: ReduceAirLeaks,
    improveEndUseEfficiency: ImproveEndUseEfficiency,
    reduceSystemAirPressure: ReduceSystemAirPressure,
    adjustCascadingSetPoints: AdjustCascadingSetPoints,
    useAutomaticSequencer: UseAutomaticSequencer,
    reduceRuntime: ReduceRuntime,
    addPrimaryReceiverVolume: AddPrimaryReceiverVolume,
    notes: string
}

// export interface FlowReallocation {
//     // selected: boolean
// }

export interface ReduceAirLeaks {
    leakFlow: number,
    leakReduction: number,
    implementationCost: number,
    order: number
}

export interface ImproveEndUseEfficiency {
    endUseEfficiencyItems: Array<EndUseEfficiencyItem>,
    order: number
}


export interface EndUseEfficiencyItem {
    name: string,
    implementationCost: number,
    reductionType: "Fixed" | "Variable",
    airflowReduction: number,
    substituteAuxiliaryEquipment: boolean,
    equipmentDemand: number,
    collapsed: boolean,
    reductionData: Array<EndUseEfficiencyReductionData>,
}

export interface EndUseEfficiencyReductionData {
    dayTypeId: string,
    dayTypeName: string,
    data: Array<{
        hourInterval: number,
        applyReduction: boolean
        reductionAmount: number
    }>
}


export interface ReduceSystemAirPressure {
    averageSystemPressureReduction: number,
    implementationCost: number,
    order: number
}

export interface AdjustCascadingSetPoints {
    order: number,
    setPointData: Array<CascadingSetPointData>
    implementationCost: number,
}

export interface CascadingSetPointData {
    compressorId: string,
    controlType: number,
    compressorType: number,
    fullLoadDischargePressure: number,
    maxFullFlowDischargePressure: number
}

export interface UseAutomaticSequencer {
    targetPressure: number,
    variance: number,
    order: number,
    profileSummary: Array<ProfileSummary>,
    implementationCost: number,
}

export interface ReduceRuntime {
    runtimeData: Array<ReduceRuntimeData>,
    implementationCost: number,
    order: number
}

export interface ReduceRuntimeData {
    compressorId: string,
    fullLoadCapacity: number,
    automaticShutdownTimer: boolean,
    intervalData: Array<{
        isCompressorOn: boolean,
        timeInterval: number,
    }>
    dayTypeId: string
}

export interface AddPrimaryReceiverVolume {
    increasedVolume: number,
    implementationCost: number,
    order: number
}

export interface CASystemBasics {
    utilityType: string,
    electricityCost: number,
    demandCost: number,
    notes: string
}

export interface SystemInformation {
    systemElevation: number,
    atmosphericPressure: number,
    atmosphericPressureKnown: boolean,
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
    isValid?: boolean,
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
    profileSummary: Array<ProfileSummary>
}


export interface SystemProfileSetup {
    dayTypeId: string,
    numberOfHours: number,
    dataInterval: 1 | 24,
    profileDataType: "power" | "percentCapacity" | "airflow"
}

export interface CentrifugalSpecifics {
    surgeAirflow: number,
    maxFullLoadPressure: number,
    maxFullLoadCapacity: number,
    minFullLoadPressure: number
    minFullLoadCapacity: number
}

export interface ProfileSummary {
    // compressorName: string,
    fullLoadPressure: number,
    fullLoadCapacity: number,
    compressorId: string,
    dayTypeId: string,
    automaticShutdownTimer?: boolean
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
    percentSystemPower: number,
    order: number,
}

export interface ProfileSummaryTotal {
    airflow: number,
    power: number,
    percentCapacity: number,
    percentPower: number,
    timeInterval: number
}


export interface CompressedAirDayType {
    dayTypeId: string,
    name: string,
    numberOfDays: number,
    profileDataType: "power" | "percentCapacity" | "airflow"
}