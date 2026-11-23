import { ProcessSteamUsageData } from '../../../shared/models/steam/ssmt';
import { OTHER_STEAM_USE_NAME, ProcessSteamUsageService } from './process-steam-usage.service';

describe('ProcessSteamUsageService', () => {
  let service: ProcessSteamUsageService;

  beforeEach(() => {
    service = new ProcessSteamUsageService();
  });

  it('starts with the existing usage as Process 1 and an empty Other (Miscellaneous) row', () => {
    const data = service.getDefaultData(75, 33);

    expect(data.rows.map(row => row.name)).toEqual(['Process 1', OTHER_STEAM_USE_NAME]);
    expect(data.rows.map(row => row.type)).toEqual(['process', 'other']);
    expect(data.rows[0].steamUsage).toBe(75);
    expect(data.rows[0].condensateRecoveryRate).toBe(33);
    expect(data.rows[1]).toEqual({
      name: OTHER_STEAM_USE_NAME,
      type: 'other',
      steamUsage: 0,
      condensateRecoverable: false,
      condensateRecoveryRate: 0
    });
    expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 75, recoveredCondensate: 24.75, condensateRecoveryRate: 33 });
  });

  it('includes Other (Miscellaneous) in total usage but not in recovered condensate unless it is recoverable', () => {
    const data = service.getDefaultData(75, 33);
    data.rows[1].steamUsage = 25;
    expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 100, recoveredCondensate: 24.75, condensateRecoveryRate: 24.75 });

    data.rows[1].condensateRecoverable = true;
    data.rows[1].condensateRecoveryRate = 50;
    expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 100, recoveredCondensate: 37.25, condensateRecoveryRate: 37.25 });
  });

  it('combines recovered condensate from rows with different recovery rates', () => {
    const data: ProcessSteamUsageData = {
      rows: [
        { name: 'Process 1', type: 'process', steamUsage: 60, condensateRecoverable: true, condensateRecoveryRate: 50 },
        { name: 'Process 2', type: 'process', steamUsage: 40, condensateRecoverable: true, condensateRecoveryRate: 25 }
      ]
    };

    const totals = service.calculateTotals(data);

    expect(totals.recoveredCondensate).toBe(40);
    expect(totals.condensateRecoveryRate).toBe(40);
  });

  it('keeps saved process rows and moves Other (Miscellaneous) to the end', () => {
    const saved: ProcessSteamUsageData = {
      rows: [
        { name: OTHER_STEAM_USE_NAME, type: 'other', steamUsage: 5, condensateRecoverable: true, condensateRecoveryRate: 10 },
        { name: 'Dryer', type: 'process', steamUsage: 60, condensateRecoverable: true, condensateRecoveryRate: 50 },
        { name: 'Kettle', type: 'process', steamUsage: 40, condensateRecoverable: false, condensateRecoveryRate: 0 }
      ]
    };

    const data = service.getCalculatorData(saved);

    expect(data.rows.map(row => row.name)).toEqual(['Dryer', 'Kettle', OTHER_STEAM_USE_NAME]);
    expect(data.rows[2]).toEqual(saved.rows[0]);
    expect(data.rows[2]).not.toBe(saved.rows[0]);
    expect(service.calculateTotals(data)).toEqual(service.calculateTotals(saved));
  });

  it('adds an Other (Miscellaneous) row to saved data that has none', () => {
    const data = service.getCalculatorData({
      rows: [{ name: 'Dryer', type: 'process', steamUsage: 60, condensateRecoverable: true, condensateRecoveryRate: 50 }]
    });

    expect(data.rows.map(row => row.type)).toEqual(['process', 'other']);
    expect(data.rows[1].steamUsage).toBe(0);
    expect(data.rows[1].condensateRecoverable).toBeFalse();
  });

  it('combines steam leak and trap rows saved by earlier test builds into Other (Miscellaneous) without changing totals', () => {
    // LP header from the review document: 2 leaks (0.002 klb/hr), 3 traps (0.012 klb/hr), and two process rows.
    const saved = {
      rows: [
        { name: 'Steam Leaks', type: 'steam-leaks', quantity: 2, steamUsage: 0.002, condensateRecoverable: false, condensateRecoveryRate: 0 },
        { name: 'Steam Trap Leaks', type: 'steam-trap-leaks', quantity: 3, steamUsage: 0.012, condensateRecoverable: false, condensateRecoveryRate: 0 },
        { name: 'Process 1', type: 'process', steamUsage: 60, condensateRecoverable: true, condensateRecoveryRate: 50 },
        { name: 'Process 2', type: 'process', steamUsage: 40, condensateRecoverable: true, condensateRecoveryRate: 25 }
      ]
    } as unknown as ProcessSteamUsageData;

    const data = service.getCalculatorData(saved);

    expect(data.rows.map(row => row.name)).toEqual(['Process 1', 'Process 2', OTHER_STEAM_USE_NAME]);
    expect(data.rows[2]).toEqual({
      name: OTHER_STEAM_USE_NAME,
      type: 'other',
      steamUsage: 0.014,
      condensateRecoverable: false,
      condensateRecoveryRate: 0
    });
    expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 100.014, recoveredCondensate: 40, condensateRecoveryRate: 39.9944 });
  });

  it('keeps recovered condensate from earlier leak and trap rows that were marked recoverable', () => {
    const saved = {
      rows: [
        { name: 'Steam Leaks', type: 'steam-leaks', quantity: 10, steamUsage: 1, condensateRecoverable: true, condensateRecoveryRate: 50 },
        { name: 'Steam Trap Leaks', type: 'steam-trap-leaks', quantity: 0, steamUsage: 3, condensateRecoverable: false, condensateRecoveryRate: 0 },
        { name: 'Process 1', type: 'process', steamUsage: 96, condensateRecoverable: false, condensateRecoveryRate: 0 }
      ]
    } as unknown as ProcessSteamUsageData;

    const data = service.getCalculatorData(saved);

    expect(data.rows[1].steamUsage).toBe(4);
    expect(data.rows[1].condensateRecoverable).toBeTrue();
    expect(data.rows[1].condensateRecoveryRate).toBe(12.5);
    expect(service.calculateTotals(data)).toEqual(service.calculateTotals(saved));
  });

  it('keeps a small recovered flow from an earlier leak row instead of rounding it away', () => {
    // 0.001 klb/hr at 4% recovers 0.00004 klb/hr, which is 0 at the 4 decimals the totals are rounded to.
    const saved = {
      rows: [
        { name: 'Steam Leaks', type: 'steam-leaks', quantity: 1, steamUsage: 0.001, condensateRecoverable: true, condensateRecoveryRate: 4 },
        { name: 'Steam Trap Leaks', type: 'steam-trap-leaks', quantity: 0, steamUsage: 0, condensateRecoverable: false, condensateRecoveryRate: 0 },
        { name: 'Process 1', type: 'process', steamUsage: 0.011, condensateRecoverable: false, condensateRecoveryRate: 0 }
      ]
    } as unknown as ProcessSteamUsageData;

    const data = service.getCalculatorData(saved);

    expect(data.rows[1]).toEqual({
      name: OTHER_STEAM_USE_NAME,
      type: 'other',
      steamUsage: 0.001,
      condensateRecoverable: true,
      condensateRecoveryRate: 4
    });
    expect(service.calculateTotals(data)).toEqual(service.calculateTotals(saved));
    expect(service.calculateTotals(data).condensateRecoveryRate).toBe(0.3333);
  });

  it('does not change the saved data it reads', () => {
    const saved = service.getDefaultData(75, 33);
    const data = service.getCalculatorData(saved);
    data.rows[0].steamUsage = 10;
    data.rows[1].steamUsage = 10;

    expect(saved.rows[0].steamUsage).toBe(75);
    expect(saved.rows[1].steamUsage).toBe(0);
  });

  it('returns finite zero totals for no rows or zero usage', () => {
    for (const data of [{ rows: [] }, service.getDefaultData(0, 100)]) {
      expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 0, recoveredCondensate: 0, condensateRecoveryRate: 0 });
    }
  });

  it('ignores a stored recovery percentage on a nonrecoverable row', () => {
    const data = service.getDefaultData(100, 100);
    data.rows[0].condensateRecoverable = false;
    expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 100, recoveredCondensate: 0, condensateRecoveryRate: 0 });
  });

  it('rounds totals to 4 decimal places instead of exposing floating-point noise', () => {
    const data = service.getDefaultData(60, 50);
    data.rows[1].steamUsage = 0.014;
    data.rows.splice(1, 0, { name: 'Process 2', type: 'process', steamUsage: 40, condensateRecoverable: true, condensateRecoveryRate: 25 });
    expect(service.calculateTotals(data)).toEqual({ processSteamUsage: 100.014, recoveredCondensate: 40, condensateRecoveryRate: 39.9944 });
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
    copy.rows[0].steamUsage = 50;

    expect(baseline.rows[0].steamUsage).toBe(75);
    expect(service.copyData(undefined)).toBeUndefined();
  });

  it('only reports modification rows as modified when they differ from baseline', () => {
    const baseline = service.getDefaultData(75, 33);
    const modification = service.copyData(baseline);

    expect(service.isDataModified(baseline, undefined)).toBeFalse();
    expect(service.isDataModified(baseline, modification)).toBeFalse();
    modification.rows[1].steamUsage = 10;
    expect(service.isDataModified(baseline, modification)).toBeTrue();
    expect(service.isDataModified(undefined, modification)).toBeTrue();
  });
});
