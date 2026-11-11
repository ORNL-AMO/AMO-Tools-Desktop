import { DecimalPipe } from '@angular/common';
import baseline from './legacy-results.json';
import allowed from './expected-differences.json';
import { resultDifferences } from './compare';
import { captureScenarios, initializeMotorDrivenServices, imperial, metric, MotorDrivenServices, ScenarioResult } from './scenarios';

describe('Motor-driven Desktop result preservation', () => {
  let services: MotorDrivenServices;
  let actual: ScenarioResult[];
  beforeAll(async () => {
    services = await initializeMotorDrivenServices();
    actual = captureScenarios(services);
  });

  it('runs the same immutable inputs through production services', () => {
    expect(actual.map(row => ({ id: row.id, inputs: row.inputs, units: row.units })))
      .toEqual(baseline.scenarios.map(row => ({ id: row.id, inputs: row.inputs, units: row.units })));
  });

  it('allows only individually explained and accepted result differences', () => {
    const differences = actual.flatMap((row, index) => resultDifferences(baseline.scenarios[index].result, row.result)
      .map(difference => ({ scenario: row.id, ...difference })));
    // Emit every raw difference, including sub-tolerance values, for CI/issue evidence.
    console.info('MOTOR_DRIVEN_DIFFERENCES::' + btoa(unescape(encodeURIComponent(JSON.stringify(differences)))));
    expect(differences.map(d => ({ scenario: d.scenario, path: d.path, before: d.before, after: d.after })))
      .toEqual(allowed.differences.map(d => ({ scenario: d.scenario, path: d.path, before: d.before, after: d.after })));
    for (const difference of allowed.differences) {
      expect(difference.approved).withContext(`${difference.scenario} ${difference.path}: ${difference.approval}`).toBeTrue();
      expect(difference.cause).toBeTruthy();
    }
  });

  it('preserves fan report formatting, annual totals and field presence', () => {
    const format = new DecimalPipe('en-US');
    const project = (value: unknown) => {
      const result = value as Record<string, number>;
      // Digits mirror fsat-report/results-summary's displayed efficiency/PF and annual totals.
      return { fanEfficiency: format.transform(result.fanEfficiency, '1.0-1'),
        motorPowerFactor: format.transform(result.motorPowerFactor, '1.0-1'),
        annualEnergy: format.transform(result.annualEnergy, '1.0-0'), annualCost: format.transform(result.annualCost, '1.0-0') };
    };
    for (const row of actual.filter(row => row.id.startsWith('fan-'))) {
      const old = baseline.scenarios.find(old => old.id === row.id);
      expect(project(row.result)).withContext(row.id).toEqual(project(old.result));
    }
  });

  it('reproduces the legacy percent input to attribute specified-current rounding differences', () => {
    for (const load of [0, 25]) {
      const old = baseline.scenarios.find(row => row.id === `current-3-${load}`);
      const result = services.tools.ToolsSuiteModule.calculateMotorCurrent({ motorRatedPower: 200,
        motorRpm: 1780, lineFrequency: services.tools.ToolsSuiteModule.LineFrequency.FREQ60,
        efficiencyClass: services.tools.ToolsSuiteModule.MotorEfficiencyClass.SPECIFIED,
        // Deliberately reproduce the old wrapper's unit mistake only for provenance, never production.
        specifiedEfficiency: 90, loadFactor: load / 100, ratedVoltage: 460 }, 225);
      expect(result.current).toBe((old.result as { raw: number }).raw);
    }
  });

  it('passes fractions to the retained MotorPerformance class and keeps owned-object cleanup', () => {
    const calculated = services.pumps.motorPerformance(60, 3, 200, 1780, 90, 460, 225, 1);
    expect(calculated.efficiency).toBeCloseTo(89.1, 8);
    expect(calculated.powerFactor).toBeCloseTo(93.4093052512109, 8);
    expect('delete' in calculated).toBeFalse();
  });

  it('handles zero load, STANDARD enum zero and missing nameplate data without invented defaults', () => {
    const { psat, pumps, convert } = services;
    const direct = psat.motorPowerFactor(200, 0, 60, 90, 460, 60, 1780, 0, undefined, imperial);
    expect(Number.isFinite(direct)).toBeTrue();
    expect(direct).toBeGreaterThan(0);
    const spy = spyOn(pumps, 'motorPowerFactor').and.callThrough();
    expect(psat.motorPowerFactor(200, 0, 60, 90, 460, 60, undefined, 0, undefined, imperial)).toBe(0);
    expect(psat.motorPowerFactor(200, 0, 60, 90, 460, 60, 1780, undefined, undefined, imperial)).toBe(0);
    expect(psat.motorPowerFactor(200, 0, 60, 90, 460, 60, 1780, 3, undefined, imperial)).toBe(0);
    expect(spy).not.toHaveBeenCalled();
    // The old loaded calculation needed no nameplate model fields; retain that valid path.
    expect(psat.motorPowerFactor(200, 75, 60, 90, 460, undefined, undefined, undefined, undefined, imperial))
      .toBe((baseline.scenarios.find(row => row.id === 'power-factor-75').result as { displayed: number }).displayed);
    const powerKw = convert.value(200).from('hp').to('kW');
    expect(psat.motorPowerFactor(powerKw, 75, 175, 90, 460, 60, 1780, 3, 90, metric))
      .toBe(psat.motorPowerFactor(200, 75, 175, 90, 460, 60, 1780, 3, 90, imperial));
  });

  it('keeps the near-zero threshold in fractional load and supplies nameplate data', () => {
    const { pumps, tools } = services;
    const spy = spyOn(tools.ToolsSuiteModule, 'calculateMotorPowerFactor').and.callThrough();
    pumps.motorPowerFactor(200, 0.05, 60, 90, 460, 50, 1450, 3, 90);
    const input = spy.calls.mostRecent().args[0];
    expect(input.lineFrequency).toBe(tools.ToolsSuiteModule.LineFrequency.FREQ50);
    expect(input.motorRpm).toBe(1450);
    expect(input.efficiencyClass).toBe(tools.ToolsSuiteModule.MotorEfficiencyClass.SPECIFIED);
    expect(input.specifiedEfficiency).toBe(0.9);
    expect(input.loadFactor).toBe(0.0005);
    expect(input.motorEfficiency).toBe(0.9);
    expect(input.ratedVoltage).toBe(460);
  });
});
