import { FlueGasByVolume, FlueGasByMass } from "../phast/losses/flueGas";

//USED FOR STANDALONE STEAM CALCS
//ssmt.ts has models for SSMT assessments
export interface SteamPropertiesInput {
  thermodynamicQuantity: number;
  pressure: number;
  quantityValue: number;
}

export interface SaturatedPropertiesInput {
  saturatedPressure?: number;
  saturatedTemperature?: number;
}

export interface BoilerInput {
  deaeratorPressure: number;
  combustionEfficiency: number;
  blowdownRate: number;
  steamPressure: number;
  thermodynamicQuantity: number;
  quantityValue: number;
  steamMassFlow: number;
}

export interface DeaeratorInput {
  deaeratorPressure: number;
  ventRate: number;
  feedwaterMassFlow: number;
  waterPressure: number;
  waterThermodynamicQuantity: number; //1 is ENTHALPY
  waterQuantityValue: number;
  steamPressure: number;
  steamThermodynamicQuantity: number; //2 is ENTROPY
  steamQuantityValue: number;
}

export interface FlashTankInput {
  inletWaterPressure: number;
  thermodynamicQuantity: number; //1 is ENTHALPY
  quantityValue: number;
  inletWaterMassFlow: number;
  tankPressure: number;
}

export interface HeaderInput {
  headerPressure: number;
  inlets: Array<HeaderInputObj>;
  numberOfInlets?: number;
}

export interface HeaderInputObj {
  pressure: number;
  thermodynamicQuantity: number;
  quantityValue: number;
  massFlow: number;
}

export interface HeatLossInput {
  inletPressure: number;
  thermodynamicQuantity: number; //0 is TEMPERATURE
  quantityValue: number;
  inletMassFlow: number;
  percentHeatLoss: number;
}

export interface PrvInput {
  inletPressure: number;
  thermodynamicQuantity: number; //0 is TEMPERATURE
  quantityValue: number;
  inletMassFlow: number;
  outletPressure: number;
  feedwaterPressure: number;
  feedwaterThermodynamicQuantity: number; //2 is ENTROPY
  feedwaterQuantityValue: number;
  desuperheatingTemp: number;
}

export interface TurbineInput {
  solveFor: number; // (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
  inletPressure: number;
  inletQuantity: number;
  inletQuantityValue: number;
  turbineProperty: number; // massFlow = 0, powerOut = 1
  isentropicEfficiency: number;
  generatorEfficiency: number;
  massFlowOrPowerOut: number; // massFlow or powerOut
  outletSteamPressure: number;
  outletQuantity: number;
  outletQuantityValue: number;
}

export const ThermodynamicQuantityOptions: Array<Quantity> = [
  {
    value: 0,
    display: 'Temperature'
  },
  {
    value: 1,
    display: 'Enthalpy'
  },
  {
    value: 2,
    display: 'Entropy'
  },
  {
    value: 3,
    display: 'Quality'
  }
];

export interface Quantity {
  value: number;
  display: string;
}


export interface HeatExchangerInput {
  hotInletMassFlow: number,
  hotInletEnergyFlow: number,
  hotInletTemperature: number,
  hotInletPressure: number,
  hotInletQuality: number,
  hotInletSpecificVolume: number,
  hotInletDensity: number,
  hotInletSpecificEnthalpy: number,
  hotInletSpecificEntropy: number,
  coldInletMassFlow: number,
  coldInletEnergyFlow: number,
  coldInletTemperature: number,
  coldInletPressure: number,
  coldInletQuality: number,
  coldInletSpecificVolume: number,
  coldInletDensity: number,
  coldInletSpecificEnthalpy: number,
  coldInletSpecificEntropy: number,
  approachTemp: number
}


export interface StackLossInput {
  flueGasType: number,
  flueGasByVolume: FlueGasByVolume,
  flueGasByMass: FlueGasByMass,
  name: string

}

export enum SteamQuality {
    SATURATED = 0,
    SUPERHEATED = 1
}

export enum SteamPressureOrTemp {
    PRESSURE = 0,
    TEMPERATURE = 1
}