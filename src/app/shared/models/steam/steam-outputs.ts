import { SSMTInputs, SsmtValid } from "./ssmt";

//THIS MODEL HAS BEEN UPDATED TO MATCH THE SUITE RETURN VALUES
export interface SSMTOutput {
  boilerOutput: BoilerOutput;

  highPressureHeaderSteam: SteamPropertiesOutput;
  highPressureSteamHeatLoss: HeatLossOutput;

  mediumPressureToLowPressurePrv: PrvOutput;
  highPressureToMediumPressurePrv: PrvOutput;

  highPressureToLowPressureTurbine: TurbineOutput;
  highPressureToLowPressureTurbineIdeal?: TurbineOutput;
  highPressureToMediumPressureTurbine: TurbineOutput;
  highPressureToMediumPressureTurbineIdeal?: TurbineOutput;
  highPressureCondensateFlashTank: FlashTankOutput;

  lowPressureHeaderSteam: SteamPropertiesOutput;
  lowPressureSteamHeatLoss: HeatLossOutput;

  mediumPressureToLowPressureTurbine: TurbineOutput;
  mediumPressureToLowPressureTurbineIdeal?: TurbineOutput;
  mediumPressureCondensateFlashTank: FlashTankOutput;

  mediumPressureHeaderSteam: SteamPropertiesOutput;
  mediumPressureSteamHeatLoss: HeatLossOutput;

  blowdownFlashTank: FlashTankOutput;

  highPressureCondensate: SteamPropertiesOutput;
  lowPressureCondensate: SteamPropertiesOutput;
  mediumPressureCondensate: SteamPropertiesOutput;
  combinedCondensate: SteamPropertiesOutput;
  returnCondensate: SteamPropertiesOutput;
  condensateFlashTank: FlashTankOutput;

  makeupWater: SteamPropertiesOutput;
  makeupWaterAndCondensate: SteamPropertiesOutput;

  condensingTurbine: TurbineOutput;
  condensingTurbineIdeal?: TurbineOutput;
  deaeratorOutput: DeaeratorOutput;

  highPressureProcessSteamUsage: ProcessSteamUsage;
  mediumPressureProcessSteamUsage: ProcessSteamUsage;
  lowPressureProcessSteamUsage: ProcessSteamUsage;

  // powerGenerated: number;
  // boilerFuelCost: number;
  // makeupWaterCost: number;
  // totalOperatingCost: number;
  // powerGenerationCost: number;
  //boilerFuelUsage: number;
  marginalHPCost?: number;
  marginalMPCost?: number;
  marginalLPCost?: number;


  // makeupWaterVolumeFlow: number;
  // annualMakeupWaterFlow: number;

  lowPressureVentedSteam: SteamPropertiesOutput;
  heatExchanger: HeatExchangerOutput;

  // sitePowerImport: number;
  // sitePowerDemand: number;
  operationsOutput: SSMTOperationsOutput;
}

export interface SSMTOperationsOutput {
  powerGenerated: number,
  boilerFuelCost: number,
  makeupWaterCost: number,
  totalOperatingCost: number,
  powerGenerationCost: number,
  boilerFuelUsage: number,
  sitePowerImport: number,
  sitePowerDemand: number,
  makeupWaterVolumeFlow: number,
  //makeupWaterVolumeFlowAnnual (suite) = annualMakeupWaterFlow (desktop)
  makeupWaterVolumeFlowAnnual: number
}

//export interface SSMTOperationsOutput {
//   powerBalanceGeneration: number,
//   powerBalanceDemand: number,
//   powerBalanceImport: number,
//   powerBalanceUnitCost: number,
//   powerBalanceUnitCostPerYear: number,
//   fuelBalanceBoiler: number,
//   fuelBalanceUnitCost: number,
//   fuelBalanceUnitCostPerYear: number,
//   makeupWaterFlow: number,
//   makeupWaterFlowRate: number,
//   makeupWaterUnitCost: number,
//   makeupWaterUnitCostPerYear: number,
//   totalOperatingCostPerYear: number,
//   highPressureCost: number,
//   mediumPressureCost?: number,
//   lowPressureCost?: number
// }

export interface BoilerOutput {
  steamPressure: number;
  steamTemperature: number;
  steamSpecificEnthalpy: number;
  steamSpecificEntropy: number;
  steamQuality: number;
  steamMassFlow: number;
  steamEnergyFlow: number;
  steamVolume?: number;

  blowdownPressure: number;
  blowdownTemperature: number;
  blowdownSpecificEnthalpy: number;
  blowdownSpecificEntropy: number;
  blowdownQuality: number;
  blowdownMassFlow: number;
  blowdownEnergyFlow: number;
  blowdownVolume?: number;

  feedwaterPressure: number;
  feedwaterTemperature: number;
  feedwaterSpecificEnthalpy: number;
  feedwaterSpecificEntropy: number;
  feedwaterQuality: number;
  feedwaterMassFlow: number;
  feedwaterEnergyFlow: number;
  feedwaterVolume?: number;
  boilerEnergy: number;
  fuelEnergy: number;
  blowdownRate?: number;
  combustionEff?: number;
}


export interface SteamPropertiesOutput {
  pressure: number;
  temperature: number;
  specificEnthalpy: number;
  specificEntropy: number;
  quality: number;
  specificVolume?: number;
  //SteamProperties() function call does not have these fields
  //these fields will be set during the SSMT calculation
  //and will need to be apart of objects with this type
  massFlow?: number;
  energyFlow?: number;
}

export interface DeaeratorOutput {
  feedwaterEnergyFlow: number;
  feedwaterMassFlow: number;
  feedwaterPressure: number;
  feedwaterQuality: number;
  feedwaterSpecificEnthalpy: number;
  feedwaterSpecificEntropy: number;
  feedwaterTemperature: number;
  feedwaterVolume?: number;
  inletSteamEnergyFlow: number;
  inletSteamMassFlow: number;
  inletSteamPressure: number;
  inletSteamQuality: number;
  inletSteamSpecificEnthalpy: number;
  inletSteamSpecificEntropy: number;
  inletSteamTemperature: number;
  inletSteamVolume?: number;
  inletWaterEnergyFlow: number;
  inletWaterMassFlow: number;
  inletWaterPressure: number;
  inletWaterQuality: number;
  inletWaterSpecificEnthalpy: number;
  inletWaterSpecificEntropy: number;
  inletWaterTemperature: number;
  inletWaterVolume?: number;
  ventedSteamEnergyFlow: number;
  ventedSteamMassFlow: number;
  ventedSteamPressure: number;
  ventedSteamQuality: number;
  ventedSteamSpecificEnthalpy: number;
  ventedSteamSpecificEntropy: number;
  ventedSteamTemperature: number;
  ventedSteamVolume?: number;

}


export interface FlashTankOutput {
  inletWaterEnergyFlow: number;
  inletWaterMassFlow: number;
  inletWaterPressure: number;
  inletWaterQuality: number;
  inletWaterSpecificEnthalpy: number;
  inletWaterSpecificEntropy: number;
  inletWaterTemperature: number;
  inletWaterVolume?: number;
  outletGasEnergyFlow: number;
  outletGasMassFlow: number;
  outletGasPressure: number;
  outletGasQuality: number;
  outletGasSpecificEnthalpy: number;
  outletGasSpecificEntropy: number;
  outletGasTemperature: number;
  outletGasVolume?: number;
  outletLiquidEnergyFlow: number;
  outletLiquidMassFlow: number;
  outletLiquidPressure: number;
  outletLiquidQuality: number;
  outletLiquidSpecificEnthalpy: number;
  outletLiquidSpecificEntropy: number;
  outletLiquidTemperature: number;
  outletLiquidVolume?: number;
}

export interface HeaderOutput {
  header: SteamPropertiesOutput;
  inlet1: SteamPropertiesOutput;
  inlet2: SteamPropertiesOutput;
  inlet3: SteamPropertiesOutput;
  inlet4: SteamPropertiesOutput;
  inlet5: SteamPropertiesOutput;
  inlet6: SteamPropertiesOutput;
  inlet7: SteamPropertiesOutput;
  inlet8: SteamPropertiesOutput;
  inlet9: SteamPropertiesOutput;
}

// export interface HeaderOutputObj {
//   energyFlow: number;
//   massFlow: number;
//   pressure: number;
//   quality: number;
//   specificEnthalpy: number;
//   specificEntropy: number;
//   temperature: number;
// }


export interface HeatLossOutput {
  heatLoss: number;
  inletEnergyFlow: number;
  inletMassFlow: number;
  inletPressure: number;
  inletQuality: number;
  inletSpecificEnthalpy: number;
  inletSpecificEntropy: number;
  inletTemperature: number;
  outletEnergyFlow: number;
  outletMassFlow: number;
  outletPressure: number;
  outletQuality: number;
  outletSpecificEnthalpy: number;
  outletSpecificEntropy: number;
  outletTemperature: number;
}

export interface PrvOutput {
  feedwaterEnergyFlow?: number;
  feedwaterMassFlow?: number;
  feedwaterPressure?: number;
  feedwaterQuality?: number;
  feedwaterSpecificEnthalpy?: number;
  feedwaterSpecificEntropy?: number;
  feedwaterTemperature?: number;
  feedwaterVolume?: number;
  inletEnergyFlow: number;
  inletMassFlow: number;
  inletPressure: number;
  inletQuality: number;
  inletVolume?: number;
  inletSpecificEnthalpy: number;
  inletSpecificEntropy: number;
  inletTemperature: number;
  outletEnergyFlow: number;
  outletMassFlow: number;
  outletPressure: number;
  outletVolume?: number;
  outletQuality: number;
  outletSpecificEnthalpy: number;
  outletSpecificEntropy: number;
  outletTemperature: number;
}

export interface TurbineOutput {
  energyOut: number;
  generatorEfficiency: number;
  inletEnergyFlow: number;
  inletPressure: number;
  inletQuality: number;
  inletSpecificEnthalpy: number;
  inletSpecificEntropy: number;
  inletTemperature: number;
  isentropicEfficiency: number;
  inletVolume?: number;
  massFlow: number;
  outletEnergyFlow: number;
  outletPressure: number;
  outletQuality: number;
  outletVolume?: number;
  outletSpecificEnthalpy: number;
  outletSpecificEntropy: number;
  outletTemperature: number;
  outletIdealPressure: number;
  outletIdealTemperature: number;
  outletIdealSpecificEnthalpy: number;
  outletIdealSpecificEntropy: number;
  outletIdealQuality: number;
  outletIdealVolume?: number;
  powerOut: number;
}

export interface SaturatedPropertiesOutput {
  saturatedPressure: number;
  saturatedTemperature: number;
  liquidEnthalpy: number;
  gasEnthalpy: number;
  evaporationEnthalpy: number;
  liquidEntropy: number;
  gasEntropy: number;
  evaporationEntropy: number;
  liquidVolume: number;
  gasVolume: number;
  evaporationVolume: number;
}


export interface ProcessSteamUsage {
  pressure: number;
  temperature: number;
  energyFlow: number;
  massFlow: number;
  processUsage: number;
}

export interface SSMTLosses {
  fuelEnergy: number;
  makeupWaterEnergy: number;
  stack: number;
  blowdown: number;
  highPressureHeader: number;
  mediumPressureHeader: number;
  lowPressureHeader: number;
  condensingTurbineEfficiencyLoss: number;
  highToMediumTurbineEfficiencyLoss: number;
  highToLowTurbineEfficiencyLoss: number;
  mediumToLowTurbineEfficiencyLoss: number;
  showCondensingTurbine: boolean;
  showHighToMediumTurbine: boolean;
  showHighToLowTurbine: boolean;
  showMediumToLowTurbine: boolean;
  condensingLosses: number;
  condensateLosses: number;
  lowPressureVentLoss: number;
  condensateFlashTankLoss: number;
  deaeratorVentLoss: number;
  highPressureProcessLoss: number;
  mediumPressureProcessLoss: number;
  lowPressureProcessLoss: number;
  condensingTurbineUsefulEnergy: number;
  highToMediumTurbineUsefulEnergy: number;
  highToLowTurbineUsefulEnergy: number;
  mediumToLowTurbineUsefulEnergy: number;
  highPressureProcessUsage: number;
  mediumPressureProcessUsage: number;
  lowPressureProcessUsage: number;
  allProcessUsageUsefulEnergy: number;
  totalProcessLosses: number;
  totalVentLosses: number;
  totalTurbineLosses: number;
  totalOtherLosses: number;
  returnedSteamAndCondensate: number;
}

export interface HeatExchangerOutput {
  hotOutletMassFlow: number;
  hotOutletEnergyFlow: number;
  hotOutletTemperature: number;
  hotOutletPressure: number;
  hotOutletQuality: number;
  hotOutletVolume: number;
  hotOutletDensity: number;
  hotOutletSpecificEnthalpy: number;
  hotOutletSpecificEntropy: number;
  coldOutletMassFlow: number;
  coldOutletEnergyFlow: number;
  coldOutletTemperature: number;
  coldOutletPressure: number;
  coldOutletQuality: number;
  coldOutletVolume: number;
  coldOutletDensity: number;
  coldOutletSpecificEnthalpy: number;
  coldOutletSpecificEntropy: number;
}

