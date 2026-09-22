import { ChargeMaterial, ChargeMaterialType } from '../../../../shared/models/phast/losses/chargeMaterial';

function typedMaterial(material: ChargeMaterial) {
  switch (material.chargeMaterialType) {
    case ChargeMaterialType.Liquid:
      return material.liquidChargeMaterial;
    case ChargeMaterialType.Gas:
      return material.gasChargeMaterial;
    case ChargeMaterialType.Solid:
    default:
      return material.solidChargeMaterial;
  }
}

/** Advisory check for values that bypass the form's validators (e.g. Explore Opportunities inputs). */
export function getChargeMaterialInitialTemperatureWarning(material: ChargeMaterial): string | null {
  const typed = typedMaterial(material);
  if (typed?.initialTemperature > typed?.dischargeTemperature) {
    return `Charge Inlet Temperature (${typed.initialTemperature}) cannot be greater than Charge Outlet Temperature (${typed.dischargeTemperature})`;
  }
  return null;
}
