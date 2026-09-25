import { DryerType } from '../../../shared/models/standalone';
import { DRYER_TYPE_OPTIONS, getDryerTypeApplicability } from './compressed-air-dryer-type-config';

describe('compressed air dryer type config', () => {
  it('lists every dryer type in enum order with its label', () => {
    expect(DRYER_TYPE_OPTIONS).toEqual([
      { value: DryerType.Heatless, label: 'Heatless' },
      { value: DryerType.HeatedExternally, label: 'Heated Externally' },
      { value: DryerType.BlowerPurgeWithSweep, label: 'Blower Purge (With Sweep)' },
      { value: DryerType.BlowerPurgeWithoutSweep, label: 'Blower Purge (Without Sweep)' },
      { value: DryerType.HeatOfCompressionHC, label: 'Heat of Compression (HC)' },
      { value: DryerType.HeatOfCompressionSP, label: 'Heat of Compression (SP)' },
      { value: DryerType.Refrigerated, label: 'Refrigerated' },
    ]);
  });

  const APPLICABILITY_CASES: Array<[DryerType, string]> = [
    [DryerType.Heatless, 'purge, DDC, and cycle length'],
    [DryerType.HeatedExternally, 'purge, heater (automatic/manual), heating hours, DDC, and cycle length'],
    [DryerType.BlowerPurgeWithSweep, 'purge, heater (automatic/manual), heating hours, motor (automatic/manual), DDC, and cycle length'],
    [DryerType.BlowerPurgeWithoutSweep, 'heater (automatic/manual), heating hours, motor (automatic/manual), DDC, and cycle length'],
    [DryerType.HeatOfCompressionHC, 'purge, heater (always calculated), heating hours, DDC, and cycle length'],
    [DryerType.HeatOfCompressionSP, 'DDC and cycle length'],
    [DryerType.Refrigerated, 'motor (automatic/manual) and cooling water rate'],
  ];
  APPLICABILITY_CASES.forEach(([dryerType, expected]) => {
    it(`describes the inputs that apply to ${DryerType[dryerType]}`, () => {
      expect(getDryerTypeApplicability(dryerType)).toBe(expected);
    });
  });
});
