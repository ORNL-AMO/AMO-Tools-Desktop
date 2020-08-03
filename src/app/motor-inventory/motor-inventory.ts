
export interface MotorInventoryData {
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

export interface MotorItem {
  id: string,
  suiteDbItemId: number,
  nemaTable: string,
  departmentId: string,
  name: string,
  description: string,
  voltageLimit: number,

  batchAnalysisData: BatchAnalysisData,
  loadCharacteristicData: LoadCharacteristicData,
  manualSpecificationData: ManualSpecificationData,
  nameplateData: NameplateData,
  operationData: OperationData
  otherData: OtherData,
  purchaseInformationData: PurchaseInformationData,
  torqueData: TorqueData
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
  stalledRotorTimeHot: number,
  stalledRotorTimeCold: number
  poles: number,
  currentType: number,
}

export interface NameplateData {
  //required data
  ratedMotorPower: number,
  efficiencyClass: number,
  nominalEfficiency: number,
  lineFrequency: number,
  motorRpm: number
  //optional
  manufacturer: string,
  model: string,
  motorType: string,
  enclosureType: string,
  ratedVoltage: number,
  serviceFactor: number,
  insulationClass: number,
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
  powerFactorAtLoad: number
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
  stalledRotorTimeHot: boolean,
  stalledRotorTimeCold: boolean,
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
  powerFactorAtLoad: boolean
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