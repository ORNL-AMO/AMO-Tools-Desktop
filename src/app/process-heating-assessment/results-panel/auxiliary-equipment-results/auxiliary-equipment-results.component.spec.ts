import { AuxiliaryEquipmentItemResult, AuxiliaryEquipmentResults } from '../../models/auxiliary-equipment';
import { buildAuxiliaryEquipmentRows } from './auxiliary-equipment-results.component';

describe('buildAuxiliaryEquipmentRows', () => {
  const item = (id: string, name: string, energyUse: number): AuxiliaryEquipmentItemResult => ({ id, name, power: 0, energyUse, energyCost: 0 });
  const results = (...items: AuxiliaryEquipmentItemResult[]): AuxiliaryEquipmentResults =>
    ({ items, totalPower: 0, totalEnergyUse: 0, totalEnergyCost: 0 });

  it('lists baseline items alone when no modification is compared', () => {
    expect(buildAuxiliaryEquipmentRows(results(item('a', 'Fan', 100)), undefined)).toEqual([
      { name: 'Fan', baseline: 100, modification: undefined },
    ]);
  });

  it('matches items by id, keeps baseline order, uses the modification name, and appends modification-only items', () => {
    const rows = buildAuxiliaryEquipmentRows(
      results(item('a', 'Fan', 100), item('b', 'Pump', 50)),
      results(item('c', 'Blower', 20), item('a', 'Fan (VFD)', 60)),
    );

    expect(rows).toEqual([
      { name: 'Fan (VFD)', baseline: 100, modification: 60 },
      { name: 'Pump', baseline: 50, modification: undefined },
      { name: 'Blower', baseline: undefined, modification: 20 },
    ]);
  });
});
