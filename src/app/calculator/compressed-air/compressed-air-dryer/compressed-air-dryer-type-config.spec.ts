import { DryerType } from '../../../shared/models/standalone';
import { DRYER_TYPE_OPTIONS, getMinimumPurgeAirRate } from './compressed-air-dryer-type-config';

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

  it('prices the purge air floor at about 3.07 times the electricity rate', () => {
    expect(getMinimumPurgeAirRate(0.08)).toBeCloseTo(0.2455, 4);
  });
});
