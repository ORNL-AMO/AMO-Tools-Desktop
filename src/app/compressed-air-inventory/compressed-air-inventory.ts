import { Co2SavingsData } from "../calculator/utilities/co2-savings/co2-savings.service";
import { AssessmentType, ConnectedFromState, InventoryType } from "../shared/connected-inventory/integrations";

export interface CompressedAirInventoryData {
  co2SavingsData?: Co2SavingsData,
  departments: Array<CompressedAirInventoryDepartment>,
  displayOptions: CompressedAirPropertyDisplayOptions,
  hasConnectedInventoryItems?: boolean,
  hasConnectedPsat?: boolean,
  isValid?: boolean,
  existingDataUnits?: string
}

export interface CompressedAirInventoryDepartment {
  name: string,
  operatingHours: number,
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
  departmentId: string,
  name: string,
  description: string,
  notes: string,
  nameplateData: NameplateData,
  compressedAirMotor: CompressedAirMotorProperties,
  compressedAirControlsProperties: CompressedAirControlsProperties,
  compressedAirDesignDetailsProperties: CompressedAirDesignDetailsProperties
}

export interface CompressedAirPropertyDisplayOptions {
  nameplateDataOptions: NameplateDataOptions,
  compressedAirMotorPropertiesOptions: CompressedAirMotorPropertiesOptions,
  compressedAirControlsPropertiesOptions: CompressedAirControlsPropertiesOptions,
  compressedAirDesignDetailsPropertiesOptions: CompressedAirDesignDetailsPropertiesOptions,
  compressedAirPerformancePointsPropertiesOptions: CompressedAirPerformancePointsPropertiesOptions
}

export interface ConnectedItem {
  id?: string,
  name: string,
  inventoryId: number,
  inventoryName?: string,
  departmentId?: string,
  inventoryType?: InventoryType,
  assessmentType?: AssessmentType,
  assessmentId?: number,
  assessmentName?: string,
  connectedFromState?: ConnectedFromState,
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