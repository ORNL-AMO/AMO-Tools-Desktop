/** Electricity Reduction measurement methods, in the order the suite's ElectricityReductionMeasurementMethod expects. */
export const AuxiliaryEquipmentMeasurementMethod = {
  MULTIMETER: 0,
  NAMEPLATE: 1,
  POWER_METER: 2,
  OTHER: 3,
} as const;
export type AuxiliaryEquipmentMeasurementMethod = typeof AuxiliaryEquipmentMeasurementMethod[keyof typeof AuxiliaryEquipmentMeasurementMethod];

export const AUXILIARY_EQUIPMENT_MEASUREMENT_METHOD_LABELS: Record<AuxiliaryEquipmentMeasurementMethod, string> = {
  [AuxiliaryEquipmentMeasurementMethod.MULTIMETER]: 'Multimeter Reading',
  [AuxiliaryEquipmentMeasurementMethod.NAMEPLATE]: 'Nameplate Data',
  [AuxiliaryEquipmentMeasurementMethod.POWER_METER]: 'Power Meter Method',
  [AuxiliaryEquipmentMeasurementMethod.OTHER]: 'Offsheet / Other Method',
};

export interface AuxiliaryEquipmentItemResult {
  id: string;
  name: string;
  /** kW drawn by all of the item's units */
  power: number;
  /** kWh/yr */
  energyUse: number;
  /** $/yr at the facility electricity cost */
  energyCost: number;
}

export interface AuxiliaryEquipmentResults {
  items: AuxiliaryEquipmentItemResult[];
  /** kW */
  totalPower: number;
  /** kWh/yr */
  totalEnergyUse: number;
  /** $/yr */
  totalEnergyCost: number;
}
