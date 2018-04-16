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
