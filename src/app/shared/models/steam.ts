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
