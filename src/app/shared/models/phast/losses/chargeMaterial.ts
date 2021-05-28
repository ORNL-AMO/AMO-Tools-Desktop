import { NgModel } from "@angular/forms";

export interface ChargeMaterial {
  chargeMaterialType?: string;
  gasChargeMaterial?: GasChargeMaterial;
  liquidChargeMaterial?: LiquidChargeMaterial;
  solidChargeMaterial?: SolidChargeMaterial;
  name?: string;
}

//Gas uses "feedRate"
export interface GasChargeMaterial {
  materialId?: number;
  thermicReactionType?: number;
  specificHeatGas?: number;
  feedRate?: number;
  chargeFeedRate?: number;
  percentVapor?: number;
  initialTemperature?: number;
  dischargeTemperature?: number;
  specificHeatVapor?: number;
  percentReacted?: number;
  reactionHeat?: number;
  additionalHeat?: number;
  heatRequired?: number;
  endoExoHeat?: number;
  netHeatLoss?: number;
}
//Liquid and Solid uses "chargeFeedRate"
export interface LiquidChargeMaterial {
  materialId?: number;
  thermicReactionType?: number;
  specificHeatLiquid?: number;
  vaporizingTemperature?: number;
  latentHeat?: number;
  specificHeatVapor?: number;
  feedRate?: number;
  chargeFeedRate?: number;
  initialTemperature?: number;
  dischargeTemperature?: number;
  percentVaporized?: number;
  percentReacted?: number;
  reactionHeat?: number;
  additionalHeat?: number;
  heatRequired?: number;
  endoExoHeat?: number;
  netHeatLoss?: number;
}
export interface SolidChargeMaterial {
  materialId?: number;
  thermicReactionType?: number;
  specificHeatSolid?: number;
  latentHeat?: number;
  specificHeatLiquid?: number;
  meltingPoint?: number;
  feedRate?: number;
  chargeFeedRate?: number;
  waterContentCharged?: number;
  waterContentDischarged?: number;
  initialTemperature?: number;
  dischargeTemperature?: number;
  waterVaporDischargeTemperature?: number;
  chargeMelted?: number;
  chargeReacted?: number;
  reactionHeat?: number;
  additionalHeat?: number;
  heatRequired?: number;
  endoExoHeat?: number;
  netHeatLoss?: number;
}

export interface ChargeMaterialOutput {
  baseline?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<ChargeMaterialResult>},
  modification?: {totalFuelUse: number, grossLoss: number, totalFuelCost: number, losses: Array<ChargeMaterialResult>},
  energyUnit?: string,
  fuelSavings?: number,
  costSavings?: number
}

export interface ChargeMaterialResult {
  heatRequired?: number,
  netHeatLoss?: number,
  endoExoHeat?: number,
  grossLoss?: number,
  fuelUse?: number,
  fuelCost?: number
  energyUnit?: string,
}

export interface LoadChargeMaterial
  {
    netHeatLoss: number,
    endoExoHeat: number,
    grossHeatLoss: number,
    bindingResult: number
  };

export interface EnergyData {
  energySourceType?: string;
  fuelCost?: number;
  userFuelCost?: number;
  hoursPerYear?: number;
  availableHeat?: number;
}