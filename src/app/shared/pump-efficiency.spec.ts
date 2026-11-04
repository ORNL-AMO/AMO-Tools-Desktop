import { PSAT, PsatInputs } from './models/psat';
import { migratePumpEfficiencies, physicalPumpStyle, setPhysicalPumpStyle, usablePumpEfficiency } from './pump-efficiency';
import { UpdateDataService } from './helper-services/update-data.service';
import { environment } from '../../environments/environment';

const input = (overrides: Partial<PsatInputs> = {}): PsatInputs => ({operating_hours: 8760,
  fluidType: 'Water', fluidTemperature: 68, pump_style: 6, pump_specified: 86.95734532125274, ...overrides});

describe('HI 2020 saved pump-efficiency migration', () => {
  it('preserves exact saved percentages for all legacy styles and nested modifications', () => {
    const psat: PSAT = {inputs: input(), modifications: Array.from({length: 11}, (_, style) =>
      ({id: String(style), psat: {inputs: input({pump_style: style})}}))};
    expect(migratePumpEfficiencies(psat)).toBeTrue();
    for (const scenario of [psat, ...psat.modifications.map(mod => mod.psat)]) {
      expect(scenario.inputs.pump_style).toBe(11);
      expect(scenario.inputs.pump_specified).toBe(86.95734532125274);
      expect(scenario.inputs.pumpEfficiencyModel.source).toBe('legacy-preserved');
    }
    const stored = JSON.stringify(psat);
    expect(migratePumpEfficiencies(psat)).toBeFalse();
    expect(JSON.stringify(psat)).toBe(stored);
    const duplicate = JSON.parse(stored);
    expect(migratePumpEfficiencies(duplicate)).toBeFalse();
    expect(JSON.stringify(duplicate)).toBe(stored);
  });

  it('keeps specified/PD inputs and never substitutes measured output for a missing estimate', () => {
    for (const style of [11, 12]) {
      const psat: PSAT = {inputs: input({pump_style: style})};
      migratePumpEfficiencies(psat);
      expect(psat.inputs.pump_style).toBe(style);
      expect(psat.inputs.pump_specified).toBe(86.95734532125274);
    }
    for (const value of [undefined, null, 0, -1, 101, NaN, Infinity]) {
      const psat: PSAT = {inputs: input({pump_specified: value}), outputs: {pump_efficiency: 75}};
      migratePumpEfficiencies(psat);
      expect(psat.inputs.pump_style).toBe(6);
      expect(psat.inputs.pump_specified).toEqual(value);
      expect(psat.inputs.pumpEfficiencyModel.source).toBe('needs-review');
      expect(psat.outputs.pump_efficiency).toBe(75);
    }
  });

  it('recognizes new-model scenarios and preserves physical inventory classification through restore', () => {
    const current: PSAT = {inputs: input({pumpEfficiencyModel: {version: 1, source: 'hi-2020-pchip'}})};
    expect(migratePumpEfficiencies(current)).toBeFalse();
    expect(current.inputs.pump_style).toBe(6);
    const legacy: PSAT = {inputs: input()};
    migratePumpEfficiencies(legacy);
    expect(physicalPumpStyle(legacy.inputs)).toBe(6);
    setPhysicalPumpStyle(legacy.inputs, 9);
    expect(physicalPumpStyle(legacy.inputs)).toBe(9);
    expect(legacy.inputs.pump_style).toBe(11);
    expect(legacy.inputs.pump_specified).toBe(86.95734532125274);
  });

  it('accepts only usable supplied-efficiency percentages', () => {
    expect(usablePumpEfficiency(100)).toBeTrue();
    expect(usablePumpEfficiency(0.001)).toBeTrue();
    for (const value of [0, -1, 100.01, NaN, Infinity, null, undefined]) {
      expect(usablePumpEfficiency(value)).toBeFalse();
    }
  });

  it('retains measured-scenario flags when applying the application upgrade', () => {
    const psat: PSAT = {inputs: input({line_frequency: 60}), modifications: [{id: 'measured',
      psat: {inputs: input({line_frequency: 60, whatIfScenario: false})}}]};
    new UpdateDataService(null).updatePsat({name: 'Saved pump', type: 'PSAT', appVersion: environment.version, psat});
    expect(psat.modifications[0].psat.inputs.whatIfScenario).toBeFalse();
    expect(psat.modifications[0].psat.inputs.pump_specified).toBe(86.95734532125274);
  });
});
