import { getNewIdString } from '../../shared/helperFunctions';
import { AuxEquipment, AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { PHAST } from '../models/phast';
import { AuxiliaryEquipmentMeasurementMethod } from '../models/auxiliary-equipment';

/** Annual hours used when a scenario has no operating hours, matching the Electricity Reduction calculator default. */
const DEFAULT_HOURS_PER_YEAR = 8760;

/**
 * Legacy "Calculated" equipment is a multimeter reading and "Rated" is nameplate data in hp at a percent of
 * capacity. Legacy duty cycle is dropped: this module assumes 100%.
 * @param equipment legacy auxiliary equipment item
 * @param hoursPerYear annual operating hours to run the item for
 * @param id id to give the item, so a modification's item can keep its baseline counterpart's id
 * @returns the item in the Electricity Reduction shape
 */
function toAuxiliaryEquipmentItem(equipment: AuxEquipment, hoursPerYear: number, id: string): AuxiliaryEquipmentItem {
  return {
    id,
    name: equipment.name,
    operatingHours: hoursPerYear,
    measurementMethod: equipment.motorPower === 'Rated' ? AuxiliaryEquipmentMeasurementMethod.NAMEPLATE : AuxiliaryEquipmentMeasurementMethod.MULTIMETER,
    multimeterData: {
      numberOfPhases: Number(equipment.motorPhase),
      supplyVoltage: equipment.supplyVoltage,
      averageCurrent: equipment.averageCurrent,
      powerFactor: equipment.powerFactor,
    },
    nameplateData: {
      ratedMotorPower: equipment.totalConnectedPower,
      variableSpeedMotor: false,
      operationalFrequency: undefined,
      lineFrequency: 60,
      motorAndDriveEfficiency: 100,
      loadFactor: equipment.ratedCapacity,
    },
    powerMeterData: { power: undefined },
    otherMethodData: { energy: undefined },
    units: 1,
    userSelectedHP: true,
  };
}

/**
 * Converts legacy `auxEquipment` into `auxiliaryEquipment` when the scenario has not been migrated yet.
 * The legacy field is left in place for the legacy module.
 * @template T PHAST, or undefined for a legacy modification without a phast clone
 * @param phast baseline or legacy modification scenario
 * @param idSource already migrated baseline items; a modification's item reuses the id at the same position so the two can be compared
 * @returns the scenario with `auxiliaryEquipment` set, or the same object when there is nothing to migrate
 */
export function migrateLegacyAuxEquipment<T extends PHAST | undefined>(phast: T, idSource?: AuxiliaryEquipmentItem[]): T {
  if (!phast?.auxEquipment || phast.auxiliaryEquipment !== undefined) {
    return phast;
  }
  const hoursPerYear = phast.operatingHours?.hoursPerYear ?? DEFAULT_HOURS_PER_YEAR;
  const auxiliaryEquipment = phast.auxEquipment.map((equipment, index) =>
    toAuxiliaryEquipmentItem(equipment, hoursPerYear, idSource?.[index]?.id ?? getNewIdString()));
  return { ...phast, auxiliaryEquipment };
}
