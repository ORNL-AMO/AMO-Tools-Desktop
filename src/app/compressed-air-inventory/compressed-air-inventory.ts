import { Co2SavingsData } from "../calculator/utilities/co2-savings/co2-savings.service";
import { AssessmentType, ConnectedFromState, InventoryType } from "../shared/connected-inventory/integrations";
import { OperatingHours } from "../shared/models/operations";

export interface CompressedAirInventoryData {
  co2SavingsData?: Co2SavingsData,
  systemInformation: SystemInformation,
  systems: Array<CompressedAirInventorySystem>,
  displayOptions: CompressedAirPropertyDisplayOptions,
  endUses: Array<EndUse>,
  hasConnectedInventoryItems?: boolean,
  hasConnectedPsat?: boolean,
  isValid?: boolean,
  existingDataUnits?: string
}

export interface SystemInformation {
  systemElevation: number,
  atmosphericPressure: number,
  atmosphericPressureKnown: boolean,
}

export interface CompressedAirInventorySystem {
  name: string,
  operatingHours: number,
  totalAirStorage: number,
  description: string,
  id: string,
  catalog: Array<CompressedAirItem>,
  isValid?: boolean,
}

export interface ConnectedInventoryProperties {
  connectedItem?: ConnectedItem,
  connectedItems?: Array<ConnectedItem>,
  connectedAssessments?: Array<ConnectedItem>,
}


export interface CompressedAirItem extends ConnectedInventoryProperties {
  id: string,
  suiteDbItemId?: number,
  systemId: string,
  name: string,
  description: string,
  notes: string,
  nameplateData: NameplateData,
  compressedAirMotor: CompressedAirMotorProperties,
  compressedAirControlsProperties: CompressedAirControlsProperties,
  compressedAirDesignDetailsProperties: CompressedAirDesignDetailsProperties,
  compressedAirPerformancePointsProperties: CompressedAirPerformancePointsProperties,
  centrifugalSpecifics: CentrifugalSpecifics,
  fieldMeasurements: FieldMeasurements;
  validCompressedAir?: ValidCompressedAir,
  compressorLibId?: number,
}

export interface ValidCompressedAir {
  isValid: boolean,
  nameplateDataValid: boolean,
  compressedAirMotorValid: boolean,
  compressedAirControlsValid: boolean,
  compressedAirDesignDetailsValid: boolean,
  compressedAirCentrifugalSpecifics: boolean,
  compressedAirPerformancePointsValid: boolean,
  compressedAirFieldMeasurementsValid: boolean,
}

export interface CompressedAirPropertyDisplayOptions {
  nameplateDataOptions: NameplateDataOptions,
  compressedAirMotorPropertiesOptions: CompressedAirMotorPropertiesOptions,
  compressedAirControlsPropertiesOptions: CompressedAirControlsPropertiesOptions,
  compressedAirDesignDetailsPropertiesOptions: CompressedAirDesignDetailsPropertiesOptions,
  compressedAirPerformancePointsPropertiesOptions: CompressedAirPerformancePointsPropertiesOptions,
  fieldMeasurementsOptions: FieldMeasurementsOptions,
}

export interface ConnectedItem {
  id?: string,
  name: string,
  inventoryId: number,
  inventoryName?: string,
  systemId?: string,
  inventoryType?: InventoryType,
  assessmentType?: AssessmentType,
  assessmentId?: number,
  assessmentName?: string,
  connectedFromState?: ConnectedFromState,
}


export interface CentrifugalSpecifics {
  surgeAirflow: number,
  maxFullLoadPressure: number,
  maxFullLoadCapacity: number,
  minFullLoadPressure: number
  minFullLoadCapacity: number
}

export interface FieldMeasurements {
  yearlyOperatingHours: number,
  operatingHours?: OperatingHours,

}

export interface FieldMeasurementsOptions {
  displayFieldMeasurements: boolean,
  yearlyOperatingHours: boolean,
}


export interface NameplateData {
  compressorType: number,
  fullLoadOperatingPressure: number,
  fullLoadRatedCapacity: number,
  totalPackageInputPower: number
  //motorPower: number,
  //fullLoadAmps: number,
  //ratedLoadPower: number,
  //ploytropicCompressorExponent: number,

}

export interface NameplateDataOptions {
  displayNameplateData: boolean,
  compressorType: boolean,
  fullLoadOperatingPressure: boolean,
  fullLoadRatedCapacity: boolean,
  totalPackageInputPower: boolean
}

export interface CompressedAirMotorProperties {
  motorPower: number,
  motorFullLoadAmps: number,
}
export interface CompressedAirMotorPropertiesOptions {
  displayCompressedAirMotorProperties: boolean,
  motorPower: boolean,
  motorFullLoadAmps: boolean,
}

export interface CompressedAirControlsProperties {
  controlType: number,
  unloadPointCapacity: number,
  numberOfUnloadSteps: number,
  automaticShutdown: boolean,
  unloadSumpPressure: number,
}
export interface CompressedAirControlsPropertiesOptions {
  displayCompressedAirControlsProperties: boolean,
  controlType: boolean,
  unloadPointCapacity: boolean,
  numberOfUnloadSteps: boolean,
  automaticShutdown: boolean,
  unloadSumpPressure: boolean,
}

export interface CompressedAirDesignDetailsProperties {
  blowdownTime: number,
  modulatingPressureRange: number,
  inputPressure: number,
  designEfficiency: number,
  serviceFactor: number,
  noLoadPowerFM: number,
  noLoadPowerUL: number,
  maxFullFlowPressure: number
}
export interface CompressedAirDesignDetailsPropertiesOptions {
  displayCompressedAirDesignDetailsProperties: boolean,
  blowdownTime: boolean,
  modulatingPressureRange: boolean,
  inputPressure: boolean,
  designEfficiency: boolean,
  serviceFactor: boolean,
  noLoadPowerFM: boolean,
  noLoadPowerUL: boolean,
  maxFullFlowPressure: boolean
}

export interface CompressedAirPerformancePointsProperties {
  fullLoad: PerformancePoint,
  maxFullFlow: PerformancePoint,
  midTurndown?: PerformancePoint,
  turndown?: PerformancePoint,
  unloadPoint: PerformancePoint,
  noLoad: PerformancePoint,
  blowoff: PerformancePoint
}
export interface CompressedAirPerformancePointsPropertiesOptions {
  displayCompressedAirPerformancePointsProperties: boolean
}
export interface PerformancePoint {
  dischargePressure: number,
  isDefaultPressure: boolean,
  airflow: number,
  isDefaultAirFlow: boolean,
  power: number,
  isDefaultPower: boolean
}


export interface CompressorTypeOption {
  value: number,
  label: string,
  enumValue: number,
  lubricantTypeEnumValue: number,
  stageTypeEnumValue: number
}

export interface EndUse {
  endUseId: string,
  modifiedDate: Date,
  endUseName: string,
  location?: string,
  endUseDescription: string,
  isValid?: boolean,
  averageRequiredPressure?: number,
  averageLeakRate?: number,
  averageAirflow?: number,
  averagePercentCapacity?: number,
  regulated?: boolean,
  averageMeasuredPressure?: number,
  averageExcessPressure?: number,

}


export const CompressorTypeOptions: Array<CompressorTypeOption> = [
  {
    value: 1,
    label: "Single stage lubricant-injected rotary screw",
    enumValue: 1,
    lubricantTypeEnumValue: 0,
    stageTypeEnumValue: 0
  },
  {
    value: 2,
    label: "Two stage lubricant-injected rotary screw",
    enumValue: 1,
    lubricantTypeEnumValue: 0,
    stageTypeEnumValue: 1
  },
  {
    value: 3,
    label: "Two stage lubricant-free rotary screw",
    enumValue: 1,
    lubricantTypeEnumValue: 1,
    stageTypeEnumValue: 1
  },
  {
    value: 4,
    label: "Single stage reciprocating",
    enumValue: 2,
    lubricantTypeEnumValue: 2,
    stageTypeEnumValue: 0
  },
  {
    value: 5,
    label: "Two stage reciprocating",
    enumValue: 2,
    lubricantTypeEnumValue: 2,
    stageTypeEnumValue: 1
  },
  {
    value: 6,
    label: "Multiple Stage Centrifugal",
    enumValue: 0,
    lubricantTypeEnumValue: 2,
    stageTypeEnumValue: 2
  },
]

export interface ControlType {
  value: number,
  label: string,
  compressorTypes: Array<number>,
  enumValue: number
}

export const ControlTypes: Array<ControlType> = [
  {
    value: 1,
    label: 'Inlet modulation without unloading',
    compressorTypes: [1, 2],
    enumValue: 3
  },
  {
    value: 2,
    label: 'Inlet modulation with unloading',
    compressorTypes: [1, 2],
    enumValue: 1
  },
  {
    value: 3,
    label: 'Variable displacement with unloading',
    compressorTypes: [1, 2],
    enumValue: 5
  },
  {
    value: 4,
    label: 'Load/unload',
    compressorTypes: [1, 2, 3, 4, 5, 6],
    enumValue: 0
  },
  {
    value: 6,
    label: 'Start/Stop',
    compressorTypes: [1, 2, 3, 4, 5],
    enumValue: 4
  },
  {
    value: 5,
    label: 'Multi-step unloading',
    compressorTypes: [4, 5],
    enumValue: 6
  },
  {
    value: 7,
    label: 'Inlet butterfly modulation with blowoff',
    compressorTypes: [6],
    enumValue: 2
  },
  {
    value: 8,
    label: 'Inlet butterfly modulation with unloading',
    compressorTypes: [6],
    enumValue: 1
  },
  {
    value: 9,
    label: 'Inlet guide vane modulation with blowoff',
    compressorTypes: [6],
    enumValue: 2
  },
  {
    value: 10,
    label: 'Inlet guide vane modulation with unloading',
    compressorTypes: [6],
    enumValue: 1
  },
  {
    value: 11,
    label: 'VFD',
    compressorTypes: [1, 2, 3, 4, 5],
    enumValue: 7
  },
]

export interface CompressorInventoryItemWarnings {
  serviceFactor?: string;
}