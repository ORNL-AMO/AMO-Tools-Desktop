import { Co2SavingsData } from "../../calculator/utilities/co2-savings/co2-savings.service";

// Output interfaces for process cooling API service
export interface ProcessCoolingChillerOutput {
    efficiency: number[];
    hours: number[];
    power: number[];
    energy: number[];
}

export interface ProcessCoolingPumpOutput {
    chillerPumpingEnergy: number[];
    // only appears for water cooled systems
    condenserPumpingEnergy?: number[];
}

export interface ProcessCoolingTowerOutput {
    hours: number[];
    energy: number[];
}

export interface ProcessCoolingResults {
    chiller: ProcessCoolingChillerOutput[];
    pump: ProcessCoolingPumpOutput;
    tower?: ProcessCoolingTowerOutput;
}

export interface ProcessCoolingAssessment {
    name: string;
    setupDone: boolean;
    isValid: boolean;
    selectedModificationId: string;
    existingDataUnits: string;
    selected: boolean;
    systemBasics: ProcessCoolingSystemBasics;
    systemInformation: SystemInformation;
    inventory: Array<ChillerInventoryItem>;
    modifications: Array<Modification>;
}

export interface ProcessCoolingSystemBasics {
    utilityType: string,
    notes: string
}

export interface SystemInformation {
    operations: Operations;
    co2SavingsData: Co2SavingsData;
    airCooledSystemInput: AirCooledSystemInput;
    waterCooledSystemInput: WaterCooledSystemInput;
    chilledWaterPumpInput: PumpInput;
    condenserWaterPumpInput: PumpInput;
    towerInput: TowerInput;
}

export interface Operations {
    annualOperatingHours: number;
    fuelCost: number;
    electricityCost: number;
    zipcode: number;
    chilledWaterSupplyTemp: number;
    condenserCoolingMethod: number;
}


/**
    * UI Model for Air Cooled System Input
     * 
     * MEASUR Tool Suite and CWSAT original input mapping and info
    * @property (in Operations) CHWT double, units F, 35 - 55 Default 44, Chilled Water Supply Temperature
    * @property outdoorAirTemp - OADT double, units F, 80 - 110 Standard 95, Outdoor Air Design Temperature
    * @property airCoolingSource - ACSource Enumeration ACSourceLocation, Cooling Air Source, Indoor or Outside
    * @property indoorTemp double, units F, if Air Source Indoor 60 - 90
    * @property followingTempDifferential - CWTFollow double, units F, if Air Source Outside 5 - 20
    */
export interface AirCooledSystemInput {
    outdoorAirTemp: number,
    airCoolingSource: number,
    indoorTemp: number,
    followingTempDifferential: number
}

/**
    * UI Model for Water Cooled System Input
     * 
     * MEASUR Tool Suite and CWSAT original input mapping and info
    * @property (in Operations) CHWT double, units F, 35 - 55 Default 44, Chilled Water Supply Temperature
    * @property (in Tower) useFreeCooling boolean
    * @property (in Tower) HEXApproachTemp double, units F,  5 - 20, heat exchange temp when free cooling and heat exchanger used
    * @property isConstantCondenserWaterTemp - constantCWT boolean, Is CW temperature constant
    * @property condenserWaterTemp - CWT double, units F, 70 - 90, CW temperature constant
    * @property (in Pump Condenser Water) CWVariableFlow boolean
    * @property (in Pump Condenser Water) CWFlowRate double, units gpm/ton
    * @property followingTempDifferential CWTFollow double, units F, when CW temperature not constant
    */
export interface WaterCooledSystemInput {
    isConstantCondenserWaterTemp: boolean,
    condenserWaterTemp: number, 
    followingTempDifferential: number, // * if not constantCWT "CWT follows ambient wet-bulb plus"
}

/**
     * UI Model for Tower Input
     * 
     * MEASUR Tool Suite and CWSAT original input mapping and info
     * @property numberOfTowers - numTower integer, # of Towers
     * @property numberOfFans - numFanPerTower_Cells integer, # Cells
     * @property fanSpeedType Enumeration FanMotorSpeedType
     * @property towerSizeMetric - towerSizing Enumeration TowerSizedBy, sized by tonnage or fan hp
     * @property fanType - towerCellFanType Enumeration CellFanType
     * @property towerSize - (redundant fields) cellFanHP double, units hp, 1 -100 hp
     * @property towerSize - (redundant fields) tonnage double, units ton, 20 - 3000
     */
export interface TowerInput {
    usesFreeCooling: boolean,
    isHEXRequired: boolean,
    HEXApproachTemp: number,  
    numberOfTowers: number;
    // todo make towerType required once logic to populate tower fields from type is known
    towerType?: number;
    numberOfFans: number; // * set by towerType choice - number of cells/fans
    fanSpeedType: number; // * set by towerType choice - 1 = Two Speed, 2 = Variable Speed
    towerSizeMetric: number; 
    fanType: number; 
    towerSize: number;
}


// System Information
/** 
    * UI Model for Chilled Water Pump or Condenser Water Pump 
    * 
    * MEASUR Tool Suite and CWSAT original input mapping and info
     * @property variableFlow boolean
     * @property flowRate double, units gpm/ton
     * @property efficiency double, percentage as fraction
     * @property motorSize double, units hp
     * @property motorEfficiency double, percentage as fraction
     */
export interface PumpInput {
    variableFlow: boolean;
    flowRate: number;
    efficiency: number; 
    motorSize: number;
    motorEfficiency: number;
}


// todo variable fields
/**
     *UI Model for Chiller Inventory Item

    * MEASUR Tool Suite and CWSAT original input mapping and info
     * @param chillerType Enumeration ChillerCompressorType
     * @param capacity double, units ton
     * @param isFullLoadEffKnown boolean, Is full load efficiency known? for this Chiller
     * @param fullLoadEff double, fraction, 0.2 - 2.5 increments of .01
     * @param age double # of years, 0 - 20, (can be 1.5 for eighteen months), assumption chiller efficiency is degraded by 1% / year
     * @param installVSD boolean, Install a VSD on each Centrifugal Compressor Motor
     * @param useARIMonthlyLoadSchedule boolean, if true monthlyLoads not needed and can be set to empty
     * @param monthlyLoads double, 12x11 array of 11 %load bins (0,10,20,30,40,50,60,70,80,90,100) for 12 calendar months
     */
export interface ChillerInventoryItem {
    itemId: string;
    name: string;
    description?: string;
    modifiedDate: Date;
    isValid?: boolean;
    chillerType: number;
    capacity: number;
    isFullLoadEfficiencyKnown: boolean;
    fullLoadEfficiency: number;
    age: number;
    installVSD: boolean;
    useARIMonthlyLoadSchedule: boolean;
    monthlyLoads?: number[][]; // * This is hours per percent load for each month
}

export interface Modification {
    name: string,
    modificationId: string,
    notes?: string
}


export enum CondenserCoolingMethod {
    Water = 0,
    Air = 1
}

export enum AirCoolingSource {
    Indoor = 0,
    Outdoor = 1
}

export interface ProcessCoolingAssessmentResults { }
export type CompressorChillerType = 'centrifugal' | 'reciprocating' | 'helical-rotary';

export type ProcessCoolingMainTabString = 'baseline' | 'assessment' | 'diagram' | 'report' | 'calculators';
export type ProcessCoolingSetupTabString = 'assessment-settings' | 'system-information' | 'inventory' | 'operating-schedule' | 'load-schedule';

export type ProcessCoolingDataProperty = keyof Pick<ProcessCoolingAssessment, 'systemBasics' | 'systemInformation' | 'inventory' | 'modifications'>;
export type ProcessCoolingSystemInformationProperty = keyof Pick<SystemInformation, 'operations' | 'co2SavingsData' | 'airCooledSystemInput' | 'chilledWaterPumpInput' | 'condenserWaterPumpInput' | 'towerInput' | 'waterCooledSystemInput'>;
export type CoolingWaterPumpType = keyof Pick<SystemInformation, 'chilledWaterPumpInput' | 'condenserWaterPumpInput'>;
