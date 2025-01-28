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
  compressedAirControlsProperties: CompressedAirControlsProperties
}

export interface CompressedAirPropertyDisplayOptions {
  nameplateDataOptions: NameplateDataOptions,
  compressedAirMotorPropertiesOptions: CompressedAirMotorPropertiesOptions,
  compressedAirControlsPropertiesOptions: CompressedAirControlsPropertiesOptions
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