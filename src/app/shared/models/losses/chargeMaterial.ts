
export interface ChargeMaterial {
  inputs?: {
    chargeMaterialType?: string,
    gasChargeMaterial?: GasChargeMaterial,
    liquidChargeMaterial?: LiquidChargeMaterial,
    solidChargeMaterial?: SolidChargeMaterial
  },
  outputs?: {
    heatLoss?: number
  }
}

export interface GasChargeMaterial {
  baseline?: {
    materialName?: string,
    thermicReactionType?: number,
    specificHeatGas?: number,
    feedRate?: number,
    percentVapor?: number,
    initialTemperature?: number,
    dischargeTemperature?: number,
    specificHeatVapor?: number,
    percentReacted?: number,
    reactionHeat?: number,
    additionalHeat?: number
  },
  modified?: {
    materialName?: string,
    thermicReactionType?: number,
    specificHeatGas?: number,
    feedRate?: number,
    percentVapor?: number,
    initialTemperature?: number,
    dischargeTemperature?: number,
    specificHeatVapor?: number,
    percentReacted?: number,
    reactionHeat?: number,
    additionalHeat?: number
  }
}

export interface LiquidChargeMaterial {
  baseline?: {
    materialName?: string,
    thermicReactionType?: number,
    specificHeatLiquid?: number,
    vaporizingTemperature?: number,
    latentHeat?: number,
    specificHeatVapor?: number,
    chargeFeedRate?: number,
    initialTemperature?: number,
    dischargeTemperature?: number,
    percentVaporized?: number,
    percentReacted?: number,
    reactionHeat?: number,
    additionalHeat?: number
  }
  modified?: {
    materialName?: string,
    thermicReactionType?: number,
    specificHeatLiquid?: number,
    vaporizingTemperature?: number,
    latentHeat?: number,
    specificHeatVapor?: number,
    chargeFeedRate?: number,
    initialTemperature?: number,
    dischargeTemperature?: number,
    percentVaporized?: number,
    percentReacted?: number,
    reactionHeat?: number,
    additionalHeat?: number
  }
}
export interface SolidChargeMaterial {
  baseline?: {
    materialName?: string,
    thermicReactionType?: number,
    specificHeatSolid?: number,
    latentHeat?: number,
    specificHeatLiquid?: number,
    meltingPoint?: number,
    chargeFeedRate?: number,
    waterContentCharged?: number,
    waterContentDischarged?: number,
    initialTemperature?: number,
    dischargeTemperature?: number,
    waterVaporDischargeTemperature?: number,
    chargeMelted?: number,
    chargeReacted?: number,
    reactionHeat?: number,
    additionalHeat?: number
  },
  modified?: {
    materialName?: string,
    thermicReactionType?: number,
    specificHeatSolid?: number,
    latentHeat?: number,
    specificHeatLiquid?: number,
    meltingPoint?: number,
    chargeFeedRate?: number,
    waterContentCharged?: number,
    waterContentDischarged?: number,
    initialTemperature?: number,
    dischargeTemperature?: number,
    waterVaporDischargeTemperature?: number,
    chargeMelted?: number,
    chargeReacted?: number,
    reactionHeat?: number,
    additionalHeat?: number
  }
}