import { ConvertSsmtService } from '../../convert-ssmt.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { HeaderWithHighestPressure, HeaderNotHighestPressure } from '../../../shared/models/steam/ssmt';
import { ProcessSteamUsageService } from './process-steam-usage.service';

describe('Process steam usage saved header conversion', () => {
  const imperial = { steamMassFlowMeasurement: 'klb' } as Settings;
  const metric = { steamMassFlowMeasurement: 'kg' } as Settings;
  const calculator = new ProcessSteamUsageService();
  const converter = new ConvertSsmtService(new ConvertUnitsService());

  for (const highestPressure of [true, false]) {
    it(`preserves row totals, counts and percentages through a unit round trip (${highestPressure ? 'HP' : 'MP/LP'})`, () => {
      const data = calculator.getDefaultData(75, 33);
      data.rows[0].quantity = 2;
      data.rows[1].quantity = 3;
      const calculated = calculator.updateCalculatedLosses(data, 'lowPressure', imperial);
      const totals = calculator.calculateTotals(calculated);
      const header = {
        processSteamUsage: totals.processSteamUsage,
        condensationRecoveryRate: totals.condensateRecoveryRate,
        processSteamUsageData: calculated
      } as HeaderWithHighestPressure & HeaderNotHighestPressure;
      const convert = highestPressure
        ? converter.convertHighPressureHeader.bind(converter)
        : converter.convertNotHighPressureHeader.bind(converter);
      convert(header, imperial, metric);
      expect(header.processSteamUsage).toBeCloseTo(totals.processSteamUsage * 453.592, 3);
      expect(calculator.calculateTotals(header.processSteamUsageData).processSteamUsage).toBeCloseTo(header.processSteamUsage, 3);
      convert(header, metric, imperial);
      expect(header.processSteamUsage).toBeCloseTo(totals.processSteamUsage, 3);
      expect(header.processSteamUsageData.rows[0].quantity).toBe(2);
      expect(header.condensationRecoveryRate).toBe(totals.condensateRecoveryRate);
      expect(calculator.calculateTotals(header.processSteamUsageData).recoveredCondensate).toBeCloseTo(24.75, 3);
    });
  }

  it('keeps a single low pressure leak (0.001 klb/hr) through a klb → kg → klb round trip', () => {
    const data = calculator.updateCalculatedLosses(calculator.getDefaultData(0, 0), 'lowPressure', imperial);
    data.rows[0].quantity = 1;
    const calculated = calculator.updateCalculatedLosses(data, 'lowPressure', imperial);
    const header = { processSteamUsage: 0.001, condensationRecoveryRate: 0, processSteamUsageData: calculated } as HeaderWithHighestPressure;
    converter.convertHighPressureHeader(header, imperial, metric);
    expect(header.processSteamUsage).toBe(0.4536);
    converter.convertHighPressureHeader(header, metric, imperial);
    expect(header.processSteamUsage).toBe(0.001);
    expect(header.processSteamUsageData.rows[0].steamUsage).toBe(0.001);
  });

  it('converts legacy headers without row data using the existing 4 decimal rounding', () => {
    const header = { processSteamUsage: 50, condensationRecoveryRate: 50 } as HeaderWithHighestPressure;
    converter.convertHighPressureHeader(header, imperial, metric);
    expect(header.processSteamUsage).toBe(22679.6);
    expect(header.processSteamUsageData).toBeUndefined();
    expect(header.condensationRecoveryRate).toBe(50);
  });
});
