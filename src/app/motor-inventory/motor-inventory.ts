import { Co2SavingsData } from "../calculator/utilities/co2-savings/co2-savings.service";
import { ConnectedInventoryProperties } from "../pump-inventory/pump-inventory";
import { ConnectedItem } from "../shared/connected-inventory/integrations";
import { OperatingHours } from "../shared/models/operations";

export interface MotorInventoryData {
  co2SavingsData?: Co2SavingsData,
  hasConnectedInventoryItems?: boolean,
  existingDataUnits?: string,
  departments: Array<MotorInventoryDepartment>,
  displayOptions: MotorPropertyDisplayOptions
}

export interface MotorInventoryDepartment {
  name: string,
  operatingHours: number,
  description: string,
  id: string,
  catalog: Array<MotorItem>
}

export interface MotorItem extends ConnectedInventoryProperties {
  id: string,
  suiteDbItemId?: number,
  nemaTable?: string,
  departmentId: string,
  name: string,
  description: string,
  voltageLimit?: number,
  batchAnalysisData: BatchAnalysisData,
  loadCharacteristicData: LoadCharacteristicData,
  manualSpecificationData: ManualSpecificationData,
  nameplateData: NameplateData,
  operationData: OperationData
  otherData: OtherData,
  purchaseInformationData: PurchaseInformationData,
  torqueData: TorqueData,
  validMotor?: ValidMotor
}


export interface ValidMotor {
  isValid: boolean,
  motorValid: boolean,
}



export interface BatchAnalysisData {
  modifiedCost: number,
  modifiedPower: number,
  modifiedEfficiency: number,
  modifiedPercentLoad: number,
  rewindCost: number,
  rewindEfficiencyLoss: number
}

export interface LoadCharacteristicData {
  efficiency75: number,
  efficiency50: number,
  efficiency25: number,
  powerFactor100: number,
  powerFactor75: number,
  powerFactor50: number,
  powerFactor25: number,
  ampsIdle: number,
}

export interface ManualSpecificationData {
  //required data
  synchronousSpeed: number,
  //optional
  ratedSpeed: number,
  frame: string,
  shaftPosiion: string,
  windingResistance: number,
  rotorBars: number,
  statorSlots: number,
  ampsLockedRotor: number,
  poles: number,
  currentType: string,
}

export interface NameplateData {
  //required data
  ratedMotorPower: number,
  efficiencyClass: number,
  nominalEfficiency: number,
  lineFrequency: number,
  //optional
  manufacturer: string,
  model: string,
  motorType: string,
  enclosureType: string,
  ratedVoltage: number,
  serviceFactor: number,
  insulationClass: string,
  weight: number,
  numberOfPhases: number,
  fullLoadSpeed: number,
  fullLoadAmps: number,
}

export interface OperationData {
  location: string,
  annualOperatingHours: number,
  averageLoadFactor: number,
  utilizationFactor: number,
  efficiencyAtAverageLoad: number,
  powerFactorAtLoad: number,
  currentAtLoad: number,
  operatingHours?: OperatingHours
}

export interface OtherData {
  driveType: number,
  isVFD: boolean,
  hasLoggerData: boolean,
  voltageConnectionType: string,
}

export interface PurchaseInformationData {
  catalogId: string,
  listPrice: number,
  warranty: Date,
  directReplacementCost: number
}

export interface TorqueData {
  torqueFullLoad: number,
  torqueBreakDown: number,
  torqueLockedRotor: number,
}

//DISPLAY OPTIONS
export interface MotorPropertyDisplayOptions {
  batchAnalysisOptions: BatchAnalysisOptions,
  loadCharactersticOptions: LoadCharacteristicOptions,
  manualSpecificationOptions: ManualSpecificationOptions,
  nameplateDataOptions: NameplateDataOptions,
  operationDataOptions: OperationDataOptions,
  otherOptions: OtherOptions,
  purchaseInformationOptions: PurchaseInformationOptions,
  torqueOptions: TorqueOptions
}

export interface BatchAnalysisOptions {
  displayBatchAnalysis: boolean,
  modifiedCost: boolean,
  modifiedPower: boolean,
  modifiedEfficiency: boolean,
  modifiedPercentLoad: boolean,
  rewindCost: boolean,
  rewindEfficiencyLoss: boolean
}

export interface LoadCharacteristicOptions {
  displayLoadCharacteristics: boolean,
  efficiency75: boolean,
  efficiency50: boolean,
  efficiency25: boolean,
  powerFactor100: boolean,
  powerFactor75: boolean,
  powerFactor50: boolean,
  powerFactor25: boolean,
  ampsIdle: boolean,
}

export interface ManualSpecificationOptions {
  displayManualSpecifications: boolean,
  ratedSpeed: boolean,
  frame: boolean,
  shaftPosiion: boolean,
  windingResistance: boolean,
  rotorBars: boolean,
  statorSlots: boolean,
  ampsLockedRotor: boolean,
  poles: boolean,
  currentType: boolean,
}

export interface NameplateDataOptions {
  displayNameplateData: boolean,
  manufacturer: boolean,
  model: boolean,
  motorType: boolean,
  enclosureType: boolean,
  ratedVoltage: boolean,
  serviceFactor: boolean,
  insulationClass: boolean,
  weight: boolean,
  numberOfPhases: boolean,
  fullLoadSpeed: boolean,
  fullLoadAmps: boolean
}

export interface OperationDataOptions {
  displayOperationData: boolean,
  location: boolean,
  annualOperatingHours: boolean,
  averageLoadFactor: boolean,
  utilizationFactor: boolean,
  efficiencyAtAverageLoad: boolean,
  powerFactorAtLoad: boolean,
  currentAtLoad: boolean
}

export interface OtherOptions {
  displayOther: boolean,
  driveType: boolean,
  isVFD: boolean,
  hasLoggerData: boolean,
  voltageConnectionType: boolean,
}

export interface PurchaseInformationOptions {
  displayPurchaseInformation: boolean,
  catalogId: boolean,
  listPrice: boolean,
  warranty: boolean,
  directReplacementCost: boolean
}

export interface TorqueOptions {
  displayTorque: boolean,
  torqueFullLoad: boolean,
  torqueBreakDown: boolean,
  torqueLockedRotor: boolean,
}



export interface FilterInventorySummary {
  selectedDepartmentIds: Array<string>,
  efficiencyClasses: Array<number>,
  ratedPower: Array<number>,
  ratedVoltage: Array<number>
}