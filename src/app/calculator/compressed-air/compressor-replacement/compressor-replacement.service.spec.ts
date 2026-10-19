import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CompressorReplacementService, CompressorReplacementData } from './compressor-replacement.service';
import { Settings } from '../../../shared/models/settings';

describe('CompressorReplacementService', () => {
  let service: CompressorReplacementService;
  const imperial = { unitsOfMeasure: 'Imperial' } as Settings;
  const metric = { unitsOfMeasure: 'Metric' } as Settings;
  /** m³/min per acfm and bar per psi, same factors the service uses */
  const ACFM_TO_M3MIN = 0.0283168;
  const PSI_TO_BAR = 0.0689476;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [CompressorReplacementService]
    });
    service = TestBed.inject(CompressorReplacementService);
  });

  /** Baseline from Compressor_Performance.xlsx: 170 acfm fixed-speed unit, 32.6 / 17.4 kW. */
  function fixedSpeed(settings: Settings, values: Partial<CompressorReplacementData> = {}): CompressorReplacementData {
    return {
      ...service.initObject(0, settings),
      averageDutyFactor: 0.3, totalOperatingHours: 8760, ratedCapacity: 170,
      fullLoadPower: 32.6, zeroFlowPower: 17.4,
      operatingPressure: 125, fullLoadPressure: 125, maxFullFlowPressure: 145,
      ...values
    };
  }

  /** Modification from the spreadsheet: CAGI Chicago Pneumatic CPVSd 21 15kW at 125 psig. */
  function vsd(settings: Settings, values: Partial<CompressorReplacementData> = {}): CompressorReplacementData {
    const cap = settings === metric ? ACFM_TO_M3MIN : 1;
    const psi = settings === metric ? PSI_TO_BAR : 1;
    return {
      ...service.initObject(0, settings),
      averageDutyFactor: 0.5665, totalOperatingHours: 8760, ratedCapacity: 90 * cap,
      fullLoadPower: 19.5, zeroFlowPower: 0, operatingPressure: 125 * psi, fullLoadPressure: 125 * psi,
      maxCapacity: 90 * cap, capacity4: 75 * cap, capacity3: 59 * cap, capacity2: 44 * cap, minCapacity: 28 * cap,
      powerAtMaxCapacity: 19.5, powerAtCapacity4: 16.2, powerAtCapacity3: 13, powerAtCapacity2: 10, powerAtMinCapacity: 7,
      ...values
    };
  }

  it('blends full-load and zero-flow power by duty factor (imperial)', () => {
    const output = service.getResults([fixedSpeed(imperial)], [], 0.07, 0.07, 14.7, 14.7, imperial);
    const row = output.baselineRows[0];
    expect(row.electricityUse).toBeCloseTo(192369.6, 1);
    expect(row.maxInputPower).toBeCloseTo(32.6, 4);
    expect(row.annualCost).toBeCloseTo(13465.87, 2);
    expect(row.cfm).toBeCloseTo(51, 4);
    expect(row.cubicFeet / 1000000).toBeCloseTo(26.8056, 4);
    expect(row.costPerCF).toBeCloseTo(0.00050235, 8);
  });

  it('interpolates between VSD ladder rungs (imperial)', () => {
    const output = service.getResults([fixedSpeed(imperial)], [vsd(imperial)], 0.07, 0.07, 14.7, 14.7, imperial);
    const row = output.modificationRows[0];
    expect(row.electricityUse).toBeCloseTo(99837.72, 1);
    expect(row.maxInputPower).toBeCloseTo(19.5, 4);
    expect(row.annualCost).toBeCloseTo(6988.64, 2);
    expect(output.results.electricitySavings).toBeCloseTo(92531.88, 1);
    expect(output.results.electricityCostSavings).toBeCloseTo(6477.23, 2);
    expect(output.results.maxInputPowerChange).toBeCloseTo(13.1, 4);
  });

  it('gives the same energy results in metric at rated pressure and sea level', () => {
    const baseline = fixedSpeed(metric, { ratedCapacity: 4.814, operatingPressure: 8.618, fullLoadPressure: 8.618, maxFullFlowPressure: 9.997 });
    const output = service.getResults([baseline], [vsd(metric)], 0.07, 0.07, 101.325, 101.325, metric);
    expect(output.baselineRows[0].electricityUse).toBeCloseTo(192369.6, 1);
    expect(output.modificationRows[0].electricityUse).toBeCloseTo(99837.72, 1);
    expect(output.baselineRows[0].cfm).toBeCloseTo(1.4442, 4);
    expect(output.baselineRows[0].cubicFeet / 1000000).toBeCloseTo(0.759072, 6);
    expect(output.baselineRows[0].costPerCF).toBeCloseTo(0.0177399, 7);
  });

  it('scales full-load power for a lower operating pressure', () => {
    const values: Partial<CompressorReplacementData> = { averageDutyFactor: 0.85, ratedCapacity: 1050, fullLoadPower: 200, zeroFlowPower: 60, maxFullFlowPressure: 135 };
    const reduced = fixedSpeed(imperial, { ...values, operatingPressure: 100 });
    expect(service.pressureCorrectionFactor(reduced, 14.7, imperial)).toBeCloseTo(0.884813, 6);
    const output = service.getResults([fixedSpeed(imperial, values)], [reduced], 0.066, 0.066, 14.7, 14.7, imperial);
    expect(output.baselineRows[0].electricityUse).toBeCloseTo(1568040, 1);
    expect(output.modificationRows[0].electricityUse).toBeCloseTo(1396503.69, 1);
    expect(output.modificationRows[0].maxInputPower).toBeCloseTo(176.96, 2);
  });

  it('applies the same pressure correction in metric', () => {
    const reduced = fixedSpeed(metric, { operatingPressure: 6.895, fullLoadPressure: 8.618 });
    expect(service.pressureCorrectionFactor(reduced, 101.325, metric)).toBeCloseTo(0.884861, 6);
  });

  it('raises the correction above 1 at altitude', () => {
    expect(service.pressureCorrectionFactor(fixedSpeed(imperial), 12.2, imperial)).toBeCloseTo(1.103569, 6);
    const output = service.getResults([fixedSpeed(imperial)], [], 0.07, 0.07, 12.2, 12.2, imperial);
    expect(output.baselineRows[0].electricityUse).toBeCloseTo(201242.64, 1);
  });

  it('uses average power as entered and re-scales a linked modification', () => {
    const baseline = fixedSpeed(imperial, { compressorId: 'base-1', powerInputType: 'averagePower', averagePower: 25, averageDutyFactor: 0.6 });
    const linked = fixedSpeed(imperial, { powerInputType: 'averagePower', averagePower: 999, averageDutyFactor: 0.6, operatingPressure: 110, linkedCompressorId: 'base-1' });
    const output = service.getResults([baseline], [linked], 0.07, 0.07, 14.7, 14.7, imperial);
    expect(output.baselineRows[0].electricityUse).toBeCloseTo(219000, 1);
    expect(output.modificationRows[0].maxInputPower).toBeCloseTo(23.3215, 4);
    expect(output.modificationRows[0].electricityUse).toBeCloseTo(204296.57, 1);
  });

  it('load/unloads below the lowest VSD rung and clamps at the top rung', () => {
    const output = service.getResults([vsd(imperial, { averageDutyFactor: 0.2 })], [vsd(imperial, { averageDutyFactor: 1 })], 0.07, 0.07, 14.7, 14.7, imperial);
    expect(output.baselineRows[0].electricityUse).toBeCloseTo(39420, 1);
    expect(output.modificationRows[0].electricityUse).toBeCloseTo(170820, 1);
  });

  it('still calculates with a yellow warning when duty factor is above 1', () => {
    const data = fixedSpeed(imperial, { averageDutyFactor: 1.1 });
    expect(service.checkWarnings(data).averageDutyFactor).not.toBeNull();
    const output = service.getResults([data], [], 0.07, 0.07, 14.7, 14.7, imperial);
    expect(output.baselineRows[0].electricityUse).toBeCloseTo(298891.2, 1);
  });

  it('flags the other yellow warnings', () => {
    const warnings = service.checkWarnings(fixedSpeed(imperial, { totalOperatingHours: 9000, zeroFlowPower: 40, maxFullFlowPressure: 120, operatingPressure: 150 }));
    expect(warnings.totalOperatingHours).not.toBeNull();
    expect(warnings.zeroFlowPower).not.toBeNull();
    expect(warnings.maxFullFlowPressure).not.toBeNull();
    expect(warnings.operatingPressure).not.toBeNull();
    expect(service.checkScenarioWarnings(20, imperial).atmosphericPressure).not.toBeNull();
    expect(service.checkScenarioWarnings(101.325, metric).atmosphericPressure).toBeNull();
  });

  it('stops the scenario when atmospheric pressure is 0 (red)', () => {
    expect(service.checkScenarioErrors(0.07, 0, 500).atmosphericPressure).toBe('Value must be greater than 0');
    const output = service.getResults([fixedSpeed(imperial)], [], 0.07, 0.07, 0, 0, imperial);
    expect(output.baselineRows[0].electricityUse).toBe(0);
    expect(output.results.baselineResults.totalAnnualCost).toBe(0);
  });

  it('leaves a compressor with negative hours out of the results (red)', () => {
    const data = fixedSpeed(imperial, { totalOperatingHours: -10 });
    expect(service.isCompressorValid(data)).toBeFalse();
    const output = service.getResults([data, fixedSpeed(imperial)], [], 0.07, 0.07, 14.7, 14.7, imperial);
    expect(output.baselineRows[0].electricityUse).toBe(0);
    expect(output.results.baselineResults.totalElectricityUse).toBeCloseTo(192369.6, 1);
  });

  it('converts defaults and CAGI search criteria for metric', () => {
    const data = service.initObject(0, metric);
    expect(data.unloadSumpPressure).toBe(1.03);
    expect(data.pressureRequirement).toBe(8.62);
    expect(service.generateExample(metric).ratedCapacity).toBe(29.73);
    expect(service.getDefaultAtmosphericPressure(metric)).toBe(101.325);
    expect(service.toCagiAirflow(2.548512, metric)).toBeCloseTo(90, 4);
    expect(service.toCagiPressure(8.61845, metric)).toBeCloseTo(125, 4);
  });
});
