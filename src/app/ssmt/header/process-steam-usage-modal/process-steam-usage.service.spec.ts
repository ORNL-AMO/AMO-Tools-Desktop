import { Settings } from '../../../shared/models/settings';
import { ProcessSteamUsageData } from '../../../shared/models/steam/ssmt';
import { ProcessSteamUsageService, SteamHeaderPressureLevel } from './process-steam-usage.service';

describe('ProcessSteamUsageService', () => {
  let service: ProcessSteamUsageService;
  let imperialSettings: Settings;

  beforeEach(() => {
    service = new ProcessSteamUsageService();
    imperialSettings = { steamMassFlowMeasurement: 'klb' } as Settings;
  });

  it('initializes leak, trap loss, and existing process rows without changing existing totals', () => {
    const data = service.getDefaultData(75, 33);

    expect(data.rows.map(row => row.name)).toEqual(['Steam Leaks', 'Steam Trap Leaks', 'Process 1']);
    expect(data.rows[0].condensateRecoverable).toBeFalse();
    expect(data.rows[1].condensateRecoverable).toBeFalse();
    expect(data.rows[2].steamUsage).toBe(75);
    expect(data.rows[2].condensateRecoveryRate).toBe(33);
  });

  it('calculates issue 3019 leak and trap losses for the selected pressure level', () => {
    const data = service.getDefaultData(0, 0);
    data.rows[0].quantity = 2;
    data.rows[1].quantity = 3;

    const highPressureData = service.updateCalculatedLosses(data, 'highPressure', imperialSettings);

    expect(highPressureData.rows[0].steamUsage).toBeCloseTo(0.062, 6);
    expect(highPressureData.rows[1].steamUsage).toBeCloseTo(0.375, 6);
  });

  it('bases overall recovery on recovered mass from each recoverable row', () => {
    const data: ProcessSteamUsageData = {
      rows: [
        {
          name: 'Steam Leaks',
          type: 'steam-leaks',
          quantity: 0,
          steamUsage: 25,
          condensateRecoverable: false,
          condensateRecoveryRate: 0
        },
        {
          name: 'Process 1',
          type: 'process',
          steamUsage: 75,
          condensateRecoverable: true,
          condensateRecoveryRate: 33
        }
      ]
    };

    const totals = service.calculateTotals(data);

    expect(totals.processSteamUsage).toBe(100);
    expect(totals.recoveredCondensate).toBeCloseTo(24.75, 6);
    expect(totals.condensateRecoveryRate).toBeCloseTo(24.75, 6);
  });

  it('combines recovered condensate from rows with different recovery rates', () => {
    const data: ProcessSteamUsageData = {
      rows: [
        {
          name: 'Process 1',
          type: 'process',
          steamUsage: 60,
          condensateRecoverable: true,
          condensateRecoveryRate: 50
        },
        {
          name: 'Process 2',
          type: 'process',
          steamUsage: 40,
          condensateRecoverable: true,
          condensateRecoveryRate: 25
        }
      ]
    };

    const totals = service.calculateTotals(data);

    expect(totals.recoveredCondensate).toBe(40);
    expect(totals.condensateRecoveryRate).toBe(40);
  });

  const pressureCases: { level: SteamHeaderPressureLevel; leak: number; trap: number }[] = [
    { level: 'lowPressure', leak: 0.001, trap: 0.004 },
    { level: 'mediumPressure', leak: 0.012, trap: 0.048 },
    { level: 'highPressure', leak: 0.031, trap: 0.125 }
  ];
  for (const { level, leak, trap } of pressureCases) {
    for (const { unit, factor } of [{ unit: 'klb', factor: 1 }, { unit: 'lb', factor: 1000 }, { unit: 'kg', factor: 453.592 }, { unit: 'tonne', factor: 0.453592 }]) {
      it(`converts ${level} losses to ${unit}/hr without changing counts or the source data`, () => {
        const data = service.getDefaultData(75, 33);
        data.rows[0].quantity = 2;
        data.rows[1].quantity = 3;
        const converted = service.updateCalculatedLosses(data, level, { steamMassFlowMeasurement: unit } as Settings);
        expect(converted.rows[0].steamUsage).toBeCloseTo(2 * leak * factor, 5);
        expect(converted.rows[1].steamUsage).toBeCloseTo(3 * trap * factor, 5);
        expect(converted.rows[0].quantity).toBe(2);
        expect(converted.rows[1].quantity).toBe(3);
        expect(data.rows[0].steamUsage).toBe(0);
        expect(converted.rows[2]).toEqual(data.rows[2]);
        expect(converted.rows[2]).not.toBe(data.rows[2]);
      });
    }
  }

  it('returns finite zero totals for no rows or zero usage', () => {
    for (const data of [{ rows: [] }, service.getDefaultData(0, 100)]) {
      expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 0, recoveredCondensate: 0, condensateRecoveryRate: 0 });
    }
  });

  it('ignores a stored recovery percentage on a nonrecoverable row', () => {
    const data = service.getDefaultData(100, 100);
    data.rows[2].condensateRecoverable = false;
    expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 100, recoveredCondensate: 0, condensateRecoveryRate: 0 });
  });

  it('rounds totals to 4 decimal places instead of exposing floating-point noise', () => {
    const data = service.updateCalculatedLosses(service.getDefaultData(60, 50), 'lowPressure', { steamMassFlowMeasurement: 'klb' } as Settings);
    data.rows[0].quantity = 2;
    data.rows[1].quantity = 3;
    data.rows.push({ name: 'Second process', type: 'process', steamUsage: 40, condensateRecoverable: true, condensateRecoveryRate: 25 });
    const totals = service.calculateTotals(service.updateCalculatedLosses(data, 'lowPressure', { steamMassFlowMeasurement: 'klb' } as Settings));
    expect(totals).toEqual({ processSteamUsage: 100.014, recoveredCondensate: 40, condensateRecoveryRate: 39.9944 });
  });

  it('uses high pressure loss rates for the high pressure header', () => {
    const data = service.getDefaultData(75, 33);
    data.rows[0].quantity = 1000;
    data.rows[1].quantity = 6000;
    const totals = service.calculateTotals(service.updateCalculatedLosses(data, 'highPressure', { steamMassFlowMeasurement: 'klb' } as Settings));
    expect(totals).toEqual({ processSteamUsage: 856, recoveredCondensate: 24.75, condensateRecoveryRate: 2.8914 });
  });

  it('keeps 100% recovery within header validation bounds for fractional flows', () => {
    const totals = service.calculateTotals(service.getDefaultData(0.007, 100));
    expect(totals.recoveredCondensate).toBe(0.007);
    expect(totals.condensateRecoveryRate).toBe(100);
  });

  it('maps header keys to pressure levels', () => {
    expect(service.getPressureLevel('highPressureHeader')).toBe('highPressure');
    expect(service.getPressureLevel('mediumPressureHeader')).toBe('mediumPressure');
    expect(service.getPressureLevel('lowPressureHeader')).toBe('lowPressure');
  });

  it('copies rows so edits to a modification do not change the baseline', () => {
    const baseline = service.getDefaultData(75, 33);
    const copy = service.copyData(baseline);
    copy.rows[2].steamUsage = 50;

    expect(baseline.rows[2].steamUsage).toBe(75);
    expect(service.copyData(undefined)).toBeUndefined();
  });

  it('only reports modification rows as modified when they differ from baseline', () => {
    const baseline = service.getDefaultData(75, 33);
    const modification = service.copyData(baseline);

    expect(service.isDataModified(baseline, undefined)).toBeFalse();
    expect(service.isDataModified(baseline, modification)).toBeFalse();
    modification.rows[0].quantity = 10;
    expect(service.isDataModified(baseline, modification)).toBeTrue();
    expect(service.isDataModified(undefined, modification)).toBeTrue();
  });
});
