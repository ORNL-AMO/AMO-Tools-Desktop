export const ThermicReactionType = {
  Endothermic: 0,
  Exothermic: 1,
} as const;

export type ThermicReactionType = typeof ThermicReactionType[keyof typeof ThermicReactionType];

export const ChargeMaterialType = {
  Gas: 'Gas',
  Liquid: 'Liquid',
  Solid: 'Solid',
} as const;

export type ChargeMaterialType = typeof ChargeMaterialType[keyof typeof ChargeMaterialType];

export interface ChargeMaterial {
  id?: string;
  chargeMaterialType?: ChargeMaterialType;
  gasChargeMaterial?: GasChargeMaterial;
  liquidChargeMaterial?: LiquidChargeMaterial;
  solidChargeMaterial?: SolidChargeMaterial;
  name?: string;
}

// Gas uses "feedRate"
export interface GasChargeMaterial {
  materialId?: number;
  thermicReactionType?: ThermicReactionType;
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

// Liquid and Solid use "chargeFeedRate"
export interface LiquidChargeMaterial {
  materialId?: number;
  thermicReactionType?: ThermicReactionType;
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
  thermicReactionType?: ThermicReactionType;
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

export interface ChargeMaterialResult {
  heatRequired?: number;
  netHeatLoss?: number;
  endoExoHeat?: number;
}
