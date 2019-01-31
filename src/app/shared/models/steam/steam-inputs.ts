//USED FOR STANDALONE STEAM CALCS
//ssmt.ts has models for SSMT assessments
export interface SteamPropertiesInput {
  thermodynamicQuantity: number;
  pressure: number;
  quantityValue: number;
}

// export interface SteamPropertiesOutput {
//   pressure: number;
//   temperature: number;
//   specificEnthalpy: number;
//   specificEntropy: number;
//   quality: number;
//   specificVolume: number;
// }

export interface SaturatedPropertiesInput {
  saturatedPressure?: number;
  saturatedTemperature?: number;
}

// export interface SaturatedPropertiesOutput {
//   saturatedPressure: number;
//   saturatedTemperature: number;
//   liquidEnthalpy: number;
//   gasEnthalpy: number;
//   evaporationEnthalpy: number;
//   liquidEntropy: number;
//   gasEntropy: number;
//   evaporationEntropy: number;
//   liquidVolume: number;
//   gasVolume: number;
//   evaporationVolume: number;
// }

export interface BoilerInput {
  deaeratorPressure: number;
  combustionEfficiency: number;
  blowdownRate: number;
  steamPressure: number;
  thermodynamicQuantity: number;
  quantityValue: number;
  steamMassFlow: number;
}

// export interface BoilerOutput {
//   steamPressure: number;
//   steamTemperature: number;
//   steamSpecificEnthalpy: number;
//   steamSpecificEntropy: number;
//   steamQuality: number;
//   steamMassFlow: number;
//   steamEnergyFlow: number;

//   blowdownPressure: number;
//   blowdownTemperature: number;
//   blowdownSpecificEnthalpy: number;
//   blowdownSpecificEntropy: number;
//   blowdownQuality: number;
//   blowdownMassFlow: number;
//   blowdownEnergyFlow: number;

//   feedwaterPressure: number;
//   feedwaterTemperature: number;
//   feedwaterSpecificEnthalpy: number;
//   feedwaterSpecificEntropy: number;
//   feedwaterQuality: number;
//   feedwaterMassFlow: number;
//   feedwaterEnergyFlow: number;
//   boilerEnergy: number;
//   fuelEnergy: number;
// }


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


// export interface DeaeratorOutput {
//   feedwaterEnergyFlow: number;
//   feedwaterMassFlow: number;
//   feedwaterPressure: number;
//   feedwaterQuality: number;
//   feedwaterSpecificEnthalpy: number;
//   feedwaterSpecificEntropy: number;
//   feedwaterTemperature: number;
//   inletSteamEnergyFlow: number;
//   inletSteamMassFlow: number;
//   inletSteamPressure: number;
//   inletSteamQuality: number;
//   inletSteamSpecificEnthalpy: number;
//   inletSteamSpecificEntropy: number;
//   inletSteamTemperature: number;
//   inletWaterEnergyFlow: number;
//   inletWaterMassFlow: number;
//   inletWaterPressure: number;
//   inletWaterQuality: number;
//   inletWaterSpecificEnthalpy: number;
//   inletWaterSpecificEntropy: number;
//   inletWaterTemperature: number;
//   ventedSteamEnergyFlow: number;
//   ventedSteamMassFlow: number;
//   ventedSteamPressure: number;
//   ventedSteamQuality: number;
//   ventedSteamSpecificEnthalpy: number;
//   ventedSteamSpecificEntropy: number;
//   ventedSteamTemperature: number;
// }

// export interface FlashTankOutput {
//   inletWaterEnergyFlow: number;
//   inletWaterMassFlow: number;
//   inletWaterPressure: number;
//   inletWaterQuality: number;
//   inletWaterSpecificEnthalpy: number;
//   inletWaterSpecificEntropy: number;
//   inletWaterTemperature: number;
//   outletGasEnergyFlow: number;
//   outletGasMassFlow: number;
//   outletGasPressure: number;
//   outletGasQuality: number;
//   outletGasSpecificEnthalpy: number;
//   outletGasSpecificEntropy: number;
//   outletGasTemperature: number;
//   outletLiquidEnergyFlow: number;
//   outletLiquidMassFlow: number;
//   outletLiquidPressure: number;
//   outletLiquidQuality: number;
//   outletLiquidSpecificEnthalpy: number;
//   outletLiquidSpecificEntropy: number;
//   outletLiquidTemperature: number;
// }

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
  pressure: number,
  thermodynamicQuantity: number,
  quantityValue: number,
  massFlow: number
}

// export interface HeaderOutput {
//   header: HeaderOutputObj;
//   inlet1: HeaderOutputObj;
//   inlet2: HeaderOutputObj;
//   inlet3: HeaderOutputObj;
//   inlet4: HeaderOutputObj;
//   inlet5: HeaderOutputObj;
//   inlet6: HeaderOutputObj;
//   inlet7: HeaderOutputObj;
//   inlet8: HeaderOutputObj;
//   inlet9: HeaderOutputObj;
// }


// export interface HeaderOutputObj {
//   energyFlow: number;
//   massFlow: number;
//   pressure: number;
//   quality: number;
//   specificEnthalpy: number;
//   specificEntropy: number;
//   temperature: number;
// }


export interface HeatLossInput {
  inletPressure: number;
  thermodynamicQuantity: number; //0 is TEMPERATURE
  quantityValue: number;
  inletMassFlow: number;
  percentHeatLoss: number;
}

// export interface HeatLossOutput {
//   heatLoss: number;
//   inletEnergyFlow: number;
//   inletMassFlow: number;
//   inletPressure: number;
//   inletQuality: number;
//   inletSpecificEnthalpy: number;
//   inletSpecificEntropy: number;
//   inletTemperature: number;
//   outletEnergyFlow: number;
//   outletMassFlow: number;
//   outletPressure: number;
//   outletQuality: number;
//   outletSpecificEnthalpy: number;
//   outletSpecificEntropy: number;
//   outletTemperature: number;
// }

export interface PrvInput {
  inletPressure: number;
  thermodynamicQuantity: number;//0 is TEMPERATURE
  quantityValue: number;
  inletMassFlow: number;
  outletPressure: number;
  feedwaterPressure: number;
  feedwaterThermodynamicQuantity: number; //2 is ENTROPY
  feedwaterQuantityValue: number;
  desuperheatingTemp: number;
}
// export interface PrvOutput {
//   feedwaterEnergyFlow: number;
//   feedwaterMassFlow: number;
//   feedwaterPressure: number;
//   feedwaterQuality: number;
//   feedwaterSpecificEnthalpy: number;
//   feedwaterSpecificEntropy: number;
//   feedwaterTemperature: number;
//   inletEnergyFlow: number;
//   inletMassFlow: number;
//   inletPressure: number;
//   inletQuality: number;
//   inletSpecificEnthalpy: number;
//   inletSpecificEntropy: number;
//   inletTemperature: number;
//   outletEnergyFlow: number;
//   outletMassFlow: number;
//   outletPressure: number;
//   outletQuality: number;
//   outletSpecificEnthalpy: number;
//   outletSpecificEntropy: number;
//   outletTemperature: number;
// }


export interface TurbineInput {
  solveFor: number; // (outlet properties = 0, isentropicEfficiency = 1) - unknown to solve for
  inletPressure: number;
  inletQuantity: number;
  inletQuantityValue: number;
  turbineProperty: number;// massFlow = 0, powerOut = 1
  isentropicEfficiency: number;
  generatorEfficiency: number;
  massFlowOrPowerOut: number; // massFlow or powerOut
  outletSteamPressure: number;
  outletQuantity: number,
  outletQuantityValue: number
}

// export interface TurbineOutput {
//   energyOut: number;
//   generatorEfficiency: number;
//   inletEnergyFlow: number;
//   inletPressure: number;
//   inletQuality: number;
//   inletSpecificEnthalpy: number;
//   inletSpecificEntropy: number;
//   inletTemperature: number;
//   isentropicEfficiency: number;
//   massFlow: number;
//   outletEnergyFlow: number;
//   outletPressure: number;
//   outletQuality: number;
//   outletSpecificEnthalpy: number;
//   outletSpecificEntropy: number;
//   outletTemperature: number;
//   powerOut: number;
// }

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
]

export interface Quantity {

  value: number,
  display: string
}