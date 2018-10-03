export interface SSMTOutput{
    //1 always
    ssmtOperationsOutput: SSMTOperationsOutput,
    boilerOutput: BoilerOutput,
    deaerator: DeaeratorOutput,
    feedwater: SteamPropertiesOutput,
    highPressureHeader: HeaderOutputObj,
    highPressureHeaderSteam: SteamPropertiesOutput,
    blowdown: SteamPropertiesOutput,
    condensate: SteamPropertiesOutput,
    makeupWater: SteamPropertiesOutput,
    makeupWaterAndCondensate: SteamPropertiesOutput,
    highPressureProcessSteamUsage: SteamPropertiesOutput,
    //Optional
    //0-4
    condensingTurbine?: TurbineOutput,
    highPressureToMediumPressureTurbine?: TurbineOutput,
    highPressureToLowPressureTurbine?: TurbineOutput,
    mediumPressureToLowPressureTurbine?: TurbineOutput,
    //additional headers
    mediumPressureHeader?: HeaderOutputObj,
    mediumPressureHeaderSteam?: SteamPropertiesOutput,
    lowPressureHeaderSteam?: SteamPropertiesOutput,
    lowPressureHeader?: HeaderOutputObj,
    //0-2 PRV
    highPressureToMediumPressurePrv?: PrvOutput,
    mediumPressureToLowPressurePrv?: PrvOutput,
    //0-4 flash tanks
    blowdownFlashTank?: FlashTankOutput,
    condensateFlashTank?: FlashTankOutput,
    highPressureCondensateFlashTank?:FlashTankOutput,
    mediumPressureCondesnateFlashTank?: FlashTankOutput,
    //TODO: Heat Exchange
    //heatExchange?: HeatExchange
    //vented steam
    ventedSteam?: SteamPropertiesOutput
}

export interface SSMTOperationsOutput {
    powerBalanceGeneration: number,
    powerBalanceDemand: number,
    powerBalanceImport: number,
    powerBalanceUnitCost: number,
    powerBalanceUnitCostPerYear: number,
    fuelBalanceBoiler: number,
    fuelBalanceUnitCost: number,
    fuelBalanceUnitCostPerYear: number,
    makeupWaterFlow:number,
    makeupWaterUnitCost: number,
    makeupWaterUnitCostPerYear: number,
    totalOperatingCostPerYear: number,
    highPressureCost: number,
    mediumPressureCost?: number,
    lowPressureCost?: number
}

export interface BoilerOutput {
    steamPressure: number;
    steamTemperature: number;
    steamSpecificEnthalpy: number;
    steamSpecificEntropy: number;
    steamQuality: number;
    steamMassFlow: number;
    steamEnergyFlow: number;
  
    blowdownPressure: number;
    blowdownTemperature: number;
    blowdownSpecificEnthalpy: number;
    blowdownSpecificEntropy: number;
    blowdownQuality: number;
    blowdownMassFlow: number;
    blowdownEnergyFlow: number;
  
    feedwaterPressure: number;
    feedwaterTemperature: number;
    feedwaterSpecificEnthalpy: number;
    feedwaterSpecificEntropy: number;
    feedwaterQuality: number;
    feedwaterMassFlow: number;
    feedwaterEnergyFlow: number;

    boilerEnergy: number;
    fuelEnergy: number;
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
    massFlow?: number,
    energyFlow?: number
  }

  export interface DeaeratorOutput {
    feedwaterEnergyFlow: number;
    feedwaterMassFlow: number;
    feedwaterPressure: number;
    feedwaterQuality: number;
    feedwaterSpecificEnthalpy: number;
    feedwaterSpecificEntropy: number;
    feedwaterTemperature: number;
    inletSteamEnergyFlow: number;
    inletSteamMassFlow: number;
    inletSteamPressure: number;
    inletSteamQuality: number;
    inletSteamSpecificEnthalpy: number;
    inletSteamSpecificEntropy: number;
    inletSteamTemperature: number;
    inletWaterEnergyFlow: number;
    inletWaterMassFlow: number;
    inletWaterPressure: number;
    inletWaterQuality: number;
    inletWaterSpecificEnthalpy: number;
    inletWaterSpecificEntropy: number;
    inletWaterTemperature: number;
    ventedSteamEnergyFlow: number;
    ventedSteamMassFlow: number;
    ventedSteamPressure: number;
    ventedSteamQuality: number;
    ventedSteamSpecificEnthalpy: number;
    ventedSteamSpecificEntropy: number;
    ventedSteamTemperature: number;
  }


  export interface FlashTankOutput {
    inletWaterEnergyFlow: number;
    inletWaterMassFlow: number;
    inletWaterPressure: number;
    inletWaterQuality: number;
    inletWaterSpecificEnthalpy: number;
    inletWaterSpecificEntropy: number;
    inletWaterTemperature: number;
    outletGasEnergyFlow: number;
    outletGasMassFlow: number;
    outletGasPressure: number;
    outletGasQuality: number;
    outletGasSpecificEnthalpy: number;
    outletGasSpecificEntropy: number;
    outletGasTemperature: number;
    outletLiquidEnergyFlow: number;
    outletLiquidMassFlow: number;
    outletLiquidPressure: number;
    outletLiquidQuality: number;
    outletLiquidSpecificEnthalpy: number;
    outletLiquidSpecificEntropy: number;
    outletLiquidTemperature: number;
  }

  export interface HeaderOutput {
    header: HeaderOutputObj;
    inlet1: HeaderOutputObj;
    inlet2: HeaderOutputObj;
    inlet3: HeaderOutputObj;
    inlet4: HeaderOutputObj;
    inlet5: HeaderOutputObj;
    inlet6: HeaderOutputObj;
    inlet7: HeaderOutputObj;
    inlet8: HeaderOutputObj;
    inlet9: HeaderOutputObj;
  }

  export interface HeaderOutputObj {
    energyFlow: number;
    massFlow: number;
    pressure: number;
    quality: number;
    specificEnthalpy: number;
    specificEntropy: number;
    temperature: number;
    //this may not be needed on header output,
    //used during php calculation, still working through this piece
    // heatLoss?: HeatLossOutput;
    remainingSteam?: SteamPropertiesOutput;
    finalHeaderSteam?: SteamPropertiesOutput;
  }
  

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
    feedwaterEnergyFlow: number;
    feedwaterMassFlow: number;
    feedwaterPressure: number;
    feedwaterQuality: number;
    feedwaterSpecificEnthalpy: number;
    feedwaterSpecificEntropy: number;
    feedwaterTemperature: number;
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
    massFlow: number;
    outletEnergyFlow: number;
    outletPressure: number;
    outletQuality: number;
    outletSpecificEnthalpy: number;
    outletSpecificEntropy: number;
    outletTemperature: number;
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

  //TODO: HeatExchange...
