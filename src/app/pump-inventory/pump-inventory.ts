import { Co2SavingsData } from "../calculator/utilities/co2-savings/co2-savings.service";
import { OperatingHours } from "../shared/models/operations";

export interface PumpInventoryData {
  co2SavingsData?: Co2SavingsData,
  departments: Array<PumpInventoryDepartment>,
  displayOptions: PumpPropertyDisplayOptions
  existingDataUnits?: string
}

export interface PumpInventoryDepartment {
  name: string,
  operatingHours: number,
  description: string,
  id: string,
  catalog: Array<PumpItem>
}

export interface PumpItem {
  id: string,
  suiteDbItemId?: number,
  departmentId: string,
  name: string,
  description: string,
  fieldMeasurements: FieldMeasurements,
  fluid: FluidProperties,
  nameplateData: NameplateData,
  pumpEquipment: PumpProperties,
  pumpMotor: PumpMotorProperties,
  pumpStatus: PumpStatus,
  systemProperties: SystemProperties
}

export interface PumpPropertyDisplayOptions {
  nameplateDataOptions: NameplateDataOptions,
  pumpPropertiesOptions: PumpPropertiesOptions,
  fluidPropertiesOptions: FluidPropertiesOptions,
  fieldMeasurementOptions: FieldMeasurementsOptions,
  pumpMotorPropertiesOptions: PumpMotorPropertiesOptions,
  pumpStatusOptions: PumpStatusOptions,
  systemPropertiesOptions: SystemPropertiesOptions,
}


export interface NameplateData {
  manufacturer: string,
  model: string,
  serialNumber: string,
}

export interface NameplateDataOptions {
  displayNameplateData: boolean,
  manufacturer: boolean,
  model: boolean,
  serialNumber: boolean,
}

export interface PumpStatus {
  status: number,
  priority: number,
  yearInstalled: number,
}
export interface PumpStatusOptions {
  displayPumpStatus: boolean,
  status: boolean,
  priority: boolean,
  yearInstalled: boolean,
}

export interface PumpProperties {
  pumpType: number, 
  shaftOrientation: number, 
  shaftSealType: number, 
  numStages: number, 
  inletDiameter: number, 
  outletDiameter: number,
  maxWorkingPressure: number,
  maxAmbientTemperature: number, 
  maxSuctionLift: number, 
  displacement: number, 
  startingTorque: number,
  ratedSpeed: number, 
  impellerDiameter: number, 
  minFlowSize: number, 
  pumpSize: number, 
  designHead: number,
  designFlow: number,
  designEfficiency: number,
}

export interface PumpPropertiesOptions {
  displayPumpProperties: boolean,
  pumpType: boolean, 
  shaftOrientation: boolean, 
  shaftSealType: boolean, 
  numStages: boolean, 
  inletDiameter: boolean, 
  outletDiameter: boolean,
  maxWorkingPressure: boolean,
  maxAmbientTemperature: boolean, 
  maxSuctionLift: boolean, 
  displacement: boolean, 
  startingTorque: boolean,
  ratedSpeed: boolean, 
  impellerDiameter: boolean, 
  minFlowSize: boolean, 
  pumpSize: boolean, 
  designHead: boolean,
  designFlow: boolean,
  designEfficiency: boolean,
}

export interface FluidProperties {
  fluidType: string,
  fluidDensity: number
}
export interface FluidPropertiesOptions {
  displayFluidProperties: boolean,
  fluidType: boolean,
  fluidDensity: boolean
}

export interface SystemProperties {
  driveType: number,
  flangeConnectionClass: string,
  flangeConnectionSize: number,
  componentId: string,
  location: string,
  system: string

}

export interface SystemPropertiesOptions {
  displaySystemProperties: boolean,
  driveType: boolean,
  flangeConnectionClass: boolean,
  flangeConnectionSize: boolean,
  componentId: boolean
  system: boolean,
  location: boolean
}


export interface FieldMeasurements {
  pumpSpeed: number,
  yearlyOperatingHours: number,
  staticSuctionHead: number,
  staticDischargeHead: number,
  efficiency: number,
  assessmentDate: string,
  operatingFlowRate: number,
  operatingHead: number,
  operatingHours?: OperatingHours,
  measuredPower: number;
  measuredCurrent: number;
  measuredVoltage: number;
  system: string;
  location: string;
}
export interface FieldMeasurementsOptions {
  displayFieldMeasurements: boolean,
  pumpSpeed: boolean,
  yearlyOperatingHours: boolean,
  staticSuctionHead: boolean,
  staticDischargeHead: boolean,
  efficiency: boolean,
  assessmentDate: boolean,
  operatingFlowRate: boolean,
  operatingHead: boolean,
  operatingHours?: boolean,
  measuredPower: boolean;
  measuredCurrent: boolean;
  measuredVoltage: boolean;
  system: boolean;
  location: boolean;

}

export interface PumpMotorProperties {
  motorRPM: number,
  lineFrequency: number,
  motorRatedPower: number,
  motorEfficiencyClass: number,
  motorRatedVoltage: number,
  motorFullLoadAmps: number,
  motorEfficiency: number,
}
export interface PumpMotorPropertiesOptions {
  displayPumpMotorProperties: boolean,
  motorRPM: boolean,
  lineFrequency: boolean,
  motorRatedPower: boolean,
  motorEfficiencyClass: boolean,
  motorRatedVoltage: boolean,
  motorFullLoadAmps: boolean,
  motorEfficiency: boolean,
}




// export interface FilterInventorySummary {
//   selectedDepartmentIds: Array<string>,
//   efficiencyClasses: Array<number>,
//   ratedPower: Array<number>,
//   ratedVoltage: Array<number>
// }