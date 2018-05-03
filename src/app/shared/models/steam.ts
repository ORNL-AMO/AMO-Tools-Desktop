export interface SteamPropertiesInput {
  thermodynamicQuantity: number;
  pressure: number;
  quantityValue: number;
}

export interface SteamPropertiesOutput {
  pressure: number;
  temperature: number;
  specificEnthalpy: number;
  specificEntropy: number;
  quality: number;
  specificVolume: number;
}

export interface SaturatedPropertiesInput {
  saturatedPressure?: number;
  saturatedTemperature?: number;
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

export interface BoilerInput {
  deaeratorPressure: number;
  combustionEfficiency: number;
  blowdownRate: number;
  steamPressure: number;
  quantityType: number;
  quantityValue: number;
  steamMassFlow: number;
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
