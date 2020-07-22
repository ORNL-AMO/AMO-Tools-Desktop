
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
  suiteDbItemId?: number,
  departmentId?: string,
  //required properties
  ratedMotorPower: number,
  efficiencyClass: number,
  nominalEfficiency: number,
  synchronousSpeed: number
  lineFrequency: number,

  //optional properties
  description?: string,
  motorRpm?: number,
  ratedVoltage?: number,
  fullLoadAmps?: number,
  annualOperatingHours?: number,
  percentLoad?: number,
  driveType?: number,
  isVFD?: boolean,
  hasLoggerData?: boolean,
  numberOfPhases?: number,
  name: string,
  enclosureType?: string,
  nemaTable?: string,
  poles?: number,
  //additional from excel
  manufacturer?: string,
  model?: string,
  catalogId?: string,
  motorType?: string,
  ratedSpeed?: number,
  fullLoadSpeed?: number,
  frameNumber?: string,
  purpose?: string
  uFrame?: number,
  cFace?: number,
  verticalShaft?: number,
  dFlange?: number,
  serviceFactor?: number,
  insulationClass?: number,
  weight?: number,
  listPrice?: number,
  windingResistance?: number,
  //should warranty = boolean?
  warranty?: number,
  rotorBars?: number,
  statorSlots?: number,
  efficiency75?: number,
  efficiency50?: number,
  efficiency25?: number,
  powerFactor100?: number,
  powerFactor75?: number,
  powerFactor50?: number,
  powerFactor25?: number,
  torqueFullLoad?: number,
  torqueBreakDown?: number,
  torqueLockedRotor?: number,
  ampsIdle?: number,
  ampsLockedRotor?: number,
  stalledRotorTimeHot?: number,
  stalledRotorTimeCold?: number
  voltageConnectionType?: string,
  currentType?: number,
  averageLoadFactor?: number,
  utilizationFactor?: number
}

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
  //Add
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
  frameNumber: boolean,
  uFrame: boolean,
  cFace: boolean,
  verticalShaft: boolean,
  dFlange: boolean,
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
}

export interface OperationDataOptions {
  displayOperationData: boolean,
  ratedSpeed: boolean,
  purpose: boolean,
  annualOperatingHours: boolean,
  averageLoadFactor: boolean,
  utilizationFactor: boolean,
  percentLoad: boolean,
  //Add
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
  //Add
  directReplacementCost: boolean
}

export interface TorqueOptions {
  displayTorque: boolean,
  torqueFullLoad: boolean,
  torqueBreakDown: boolean,
  torqueLockedRotor: boolean,
}