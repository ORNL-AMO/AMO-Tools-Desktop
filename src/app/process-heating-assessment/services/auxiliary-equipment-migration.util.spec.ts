import { AuxEquipment, AuxiliaryEquipmentItem } from '../../shared/models/phast/auxEquipment';
import { PHAST } from '../models/phast';
import { AuxiliaryEquipmentMeasurementMethod } from '../models/auxiliary-equipment';
import { migrateLegacyAuxEquipment } from './auxiliary-equipment-migration.util';

function legacyEquipment(overrides: Partial<AuxEquipment> = {}): AuxEquipment {
  return {
    name: 'Fan',
    dutyCycle: 50,
    motorPower: 'Calculated',
    motorPhase: '3',
    supplyVoltage: 480,
    averageCurrent: 20,
    powerFactor: 0.85,
    totalConnectedPower: 75,
    ratedCapacity: 80,
    ...overrides,
  };
}

describe('migrateLegacyAuxEquipment', () => {
  it('maps calculated equipment to a multimeter reading run for the scenario hours, ignoring duty cycle', () => {
    const phast: PHAST = { auxEquipment: [legacyEquipment()], operatingHours: { hoursPerYear: 6000 } as never };

    const [item] = migrateLegacyAuxEquipment(phast).auxiliaryEquipment;

    expect(item.id).toBeTruthy();
    expect(item.name).toBe('Fan');
    expect(item.measurementMethod).toBe(AuxiliaryEquipmentMeasurementMethod.MULTIMETER);
    expect(item.multimeterData).toEqual({ numberOfPhases: 3, supplyVoltage: 480, averageCurrent: 20, powerFactor: 0.85 });
    expect(item.operatingHours).toBe(6000);
    expect(item.units).toBe(1);
  });

  it('maps rated equipment to nameplate data in hp at its rated capacity', () => {
    const phast: PHAST = { auxEquipment: [legacyEquipment({ motorPower: 'Rated' })] };

    const [item] = migrateLegacyAuxEquipment(phast).auxiliaryEquipment;

    expect(item.measurementMethod).toBe(AuxiliaryEquipmentMeasurementMethod.NAMEPLATE);
    expect(item.nameplateData.ratedMotorPower).toBe(75);
    expect(item.nameplateData.loadFactor).toBe(80);
    expect(item.nameplateData.motorAndDriveEfficiency).toBe(100);
    expect(item.userSelectedHP).toBeTrue();
  });

  it('defaults to 8760 hours when the scenario has no operating hours', () => {
    const phast: PHAST = { auxEquipment: [legacyEquipment()] };
    expect(migrateLegacyAuxEquipment(phast).auxiliaryEquipment[0].operatingHours).toBe(8760);
  });

  it('reuses the baseline id at the same position so a modification item can be compared to its baseline', () => {
    const baselineItems = [{ id: 'aux-1' }, { id: 'aux-2' }] as AuxiliaryEquipmentItem[];
    const modification: PHAST = { auxEquipment: [legacyEquipment(), legacyEquipment(), legacyEquipment()] };

    const ids = migrateLegacyAuxEquipment(modification, baselineItems).auxiliaryEquipment.map(item => item.id);

    expect(ids.slice(0, 2)).toEqual(['aux-1', 'aux-2']);
    expect(ids[2]).toBeTruthy();
  });

  it('leaves already migrated, equipment-free, and missing scenarios unchanged', () => {
    const migrated: PHAST = { auxEquipment: [legacyEquipment()], auxiliaryEquipment: [] };
    const noEquipment: PHAST = { name: 'Baseline' };

    expect(migrateLegacyAuxEquipment(migrated)).toBe(migrated);
    expect(migrateLegacyAuxEquipment(noEquipment)).toBe(noEquipment);
    expect(migrateLegacyAuxEquipment(undefined)).toBeUndefined();
  });

  it('keeps the legacy field for the legacy module', () => {
    const phast: PHAST = { auxEquipment: [legacyEquipment()] };
    expect(migrateLegacyAuxEquipment(phast).auxEquipment).toBe(phast.auxEquipment);
  });
});
