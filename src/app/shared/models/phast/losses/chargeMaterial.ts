
export interface ChargeMaterial {
  chargeMaterialType?: string,
  gasChargeMaterial?: GasChargeMaterial,
  liquidChargeMaterial?: LiquidChargeMaterial,
  solidChargeMaterial?: SolidChargeMaterial,
  name?: string
}

//Gas uses "feedRate"
export interface GasChargeMaterial {
  materialId?: number,
  thermicReactionType?: number,
  specificHeatGas?: number,
  feedRate?: number,
  chargeFeedRate?: number,
  percentVapor?: number,
  initialTemperature?: number,
  dischargeTemperature?: number,
  specificHeatVapor?: number,
  percentReacted?: number,
  reactionHeat?: number,
  additionalHeat?: number,
  heatRequired?: number,
  endoExoHeat?: number,
  netHeatLoss?: number,
}
//Liquid and Solid uses "chargeFeedRate"
export interface LiquidChargeMaterial {
  materialId?: number,
  thermicReactionType?: number,
  specificHeatLiquid?: number,
  vaporizingTemperature?: number,
  latentHeat?: number,
  specificHeatVapor?: number,
  feedRate?: number,
  chargeFeedRate?: number,
  initialTemperature?: number,
  dischargeTemperature?: number,
  percentVaporized?: number,
  percentReacted?: number,
  reactionHeat?: number,
  additionalHeat?: number,
  heatRequired?: number,
  endoExoHeat?: number,
  netHeatLoss?: number,
}
export interface SolidChargeMaterial {
  materialId?: number,
  thermicReactionType?: number,
  specificHeatSolid?: number,
  latentHeat?: number,
  specificHeatLiquid?: number,
  meltingPoint?: number,
  feedRate?: number,
  chargeFeedRate?: number,
  waterContentCharged?: number,
  waterContentDischarged?: number,
  initialTemperature?: number,
  dischargeTemperature?: number,
  waterVaporDischargeTemperature?: number,
  chargeMelted?: number,
  chargeReacted?: number,
  reactionHeat?: number,
  additionalHeat?: number,
  heatRequired?: number,
  endoExoHeat?: number,
  netHeatLoss?: number,
}
