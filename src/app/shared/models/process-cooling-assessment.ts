import { Co2SavingsData } from "../../calculator/utilities/co2-savings/co2-savings.service";
import { getNewIdString } from "../helperFunctions";

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
    pumpInput: PumpInput;
    towerInput: TowerInput;
}

export interface Operations {
    annualOperatingHours: number;
    fuelCost: number;
    electricityCost: number;
    // zipcode
    geographicLocation: number;
    chilledWaterSupplyTemp: number;
    condenserCoolingMethod: number;
}


// ? comment == is in different form section of origin UI
// * comment == name differs, could be improved, or other
// ! other

/**
    * UI Model for Air Cooled System Input
     * 
     * MEASUR Tool Suite input mapping and info
    * @property CHWT double, units F, 35 - 55 Default 44, Chilled Water Supply Temperature
    * @property OADT double, units F, 80 - 110 Standard 95, Outdoor Air Design Temperature
    * @property ACSource Enumeration ACSourceLocation, Cooling Air Source, Indoor or Outside
    * @property indoorTemp double, units F, if Air Source Indoor 60 - 90
    * @property CWTFollow double, units F, if Air Source Outside 5 - 20
    */
export interface AirCooledSystemInput {
    CHWT: number,
    OADT: number,
    ACSource: number,
    indoorTemp: number,
    CWTFollow: number
}

/**
    * UI Model for Water Cooled System Input
     * 
     * MEASUR Tool Suite input mapping and info
    * @property CHWT double, units F, 35 - 55 Default 44, Chilled Water Supply Temperature
    * @property useFreeCooling boolean
    * @property HEXApproachTemp double, units F,  5 - 20, heat exchange temp when free cooling and heat exchanger used
    * @property constantCWT boolean, Is CW temperature constant
    * @property CWT double, units F, 70 - 90, CW temperature constant
    * @property CWVariableFlow boolean
    * @property CWFlowRate double, units gpm/ton
    * @property CWTFollow double, units F, when CW temperature not constant
    */
export interface WaterCooledSystemInput {
    constantCWT: boolean, // * "Is the CWT Constant?"
    CHWT: number,  // ? Operations.chilledWaterSupplyTemp
    useFreeCooling: boolean, // ? TowerInput "System with Free Cooling"
    HEXApproachTemp: number,  // ? from TowerInput if useFreeCooling and HEX required are true
    CWT: number,  // * if is constantCWT
    CWTFollow: number, // * if not constantCWT "CWT follows ambient wet-bulb plus"
    // ? below fields set by Pump CW
    CWVariableFlow: boolean, // ! CW field from pump
    CWFlowRate: number, // !  CW field from pump
}

/**
     * UI Model for Tower Input
     * 
     * MEASUR Tool Suite input mapping and info
     * @property numTower integer, # of Towers
     * @property numFanPerTower_Cells integer, # Cells
     * @property fanSpeedType Enumeration FanMotorSpeedType
     * @property towerSizing Enumeration TowerSizedBy, sized by tonnage or fan hp
     * @property towerCellFanType Enumeration CellFanType
     * @property cellFanHP double, units hp, 1 -100 hp
     * @property tonnage double, units ton, 20 - 3000
     */
export interface TowerInput {
    numTowers: number;
    towerType?: number;
    numFanPerTowerCells: number; // * set by towerType choice - number of cells/fans
    fanSpeedType: number; // * set by towerType choice - 1 = Two Speed, 2 = Variable Speed
    towerSizing: number; // * Size Tower By change to "Tower Size units" or other
    towerCellFanType: number; // * "Fan Type"
    cellFanHP: number; // * if size tower by hp hp/fan
    tonnage: number; // * if Size tower by tons
}


// System Information
/** 
    * UI Model for Pump Input
    * 
    * MEASUR Tool Suite input mapping and info
     * @property variableFlow boolean
     * @property flowRate double, units gpm/ton
     * @property efficiency double, percentage as fraction
     * @property motorSize double, units hp
     * @property motorEfficiency double, percentage as fraction
     */
export interface PumpInput {
    variableFlow: boolean;
    flowRate: number;
    efficiency: number; // * Pump Efficiency
    motorSize: number;
    motorEfficiency: number;
    variableFlowCW: boolean;
    flowRateCW: number;
    efficiencyCW: number; // * Pump Efficiency
    motorSizeCW: number;
    motorEfficiencyCW: number;
}


// todo variable fields
/**
     *UI Model for Chiller Inventory Item

    * MEASUR Tool Suite input mapping and info
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
    isFullLoadEffKnown: boolean;
    fullLoadEff: number;
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


export interface ProcessCoolingAssessmentResults { }



export type CompressorChillerType = 'centrifugal' | 'reciprocating' | 'helical-rotary';
