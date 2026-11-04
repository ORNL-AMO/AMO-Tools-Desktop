import { migratePumpEfficiencies } from '../shared/pump-efficiency';
import { PSAT } from '../shared/models/psat';
import { canonical, imperial, initializeMotorDrivenServices, MotorDrivenServices, pumpInputs } from './motor-driven-regression-tests/scenarios';
import { UntypedFormBuilder } from '@angular/forms';
import { AchievableEfficiencyService } from '../calculator/pumps/achievable-efficiency/achievable-efficiency.service';
import { AchievableEfficiencyGraphComponent } from '../calculator/pumps/achievable-efficiency/achievable-efficiency-graph/achievable-efficiency-graph.component';
import { SpecificSpeedGraphComponent } from '../calculator/pumps/specific-speed/specific-speed-graph/specific-speed-graph.component';
import { SpecificSpeedService } from '../calculator/pumps/specific-speed/specific-speed.service';

describe('HI 2020 pump-efficiency production WASM integration', () => {
  let services: MotorDrivenServices;
  beforeAll(async () => { services = await initializeMotorDrivenServices(); });

  it('preserves measured/modified energy, costs, efficiencies and report rounding after legacy migration', () => {
    for (const style of Array.from({length: 11}, (_, i) => i)) {
      for (const settings of [imperial, {...imperial, unitsOfMeasure: 'Metric', powerMeasurement: 'kW', flowMeasurement: 'm3/h', distanceMeasurement: 'm'}]) {
        // Out-of-reference-range saved estimates remain usable supplied efficiencies.
        const input = pumpInputs({pump_style: style, pump_specified: 86.95734532125274, flow_rate: style === 4 ? 2000 : 1840});
        if (settings.flowMeasurement !== 'gpm') {
          input.flow_rate = services.convert.value(input.flow_rate).from('gpm').to(settings.flowMeasurement);
          input.head = services.convert.value(input.head).from('ft').to(settings.distanceMeasurement);
          input.motor_rated_power = services.convert.value(input.motor_rated_power).from('hp').to(settings.powerMeasurement);
        }
        const normalized = services.psat.convertInputs(input, settings);
        const psat: PSAT = {inputs: structuredClone(input), modifications: [{id: 'saved', psat: {inputs: structuredClone(input)}}]};
        const before = canonical({existing: services.pumps.resultsExisting(normalized), modified: services.pumps.resultsModified(normalized)});
        migratePumpEfficiencies(psat);
        const after = canonical({existing: services.pumps.resultsExisting(services.psat.convertInputs(psat.inputs, settings)),
          modified: services.pumps.resultsModified(services.psat.convertInputs(psat.modifications[0].psat.inputs, settings))});
        expect(after).withContext(`${style} ${settings.unitsOfMeasure}`).toEqual(before);
        expect(psat.inputs.pump_specified).toBe(input.pump_specified);
        const report = services.psat.roundResults({...services.pumps.resultsModified(services.psat.convertInputs(psat.modifications[0].psat.inputs, settings)), co2EmissionsOutput: 0});
        expect(report).toEqual(services.psat.roundResults({...services.pumps.resultsModified(normalized), co2EmissionsOutput: 0}));
      }
    }
  });

  it('uses updated reference values, plain limits and existing percentage conventions', () => {
    const estimate = services.pumps.pumpEfficiency(6, 2000, 2000, 1.107, 1, 137, 100);
    expect(estimate.average).toBeCloseTo(0.839835675595905, 12);
    expect(estimate.max).toBeCloseTo(0.8673271191483607, 12);
    expect(services.pumps.achievableEfficiency(6, 990)).toBeCloseTo(6.59497374983, 10);
    expect(services.pumps.pumpEfficiencyLimits(4).maximumFlowRate).toBe(1300);
    expect(services.psat.pumpEfficiency(6, 2000, 2000, 1.107, 1, 137, 100, imperial)).toEqual({average: 0.8398, max: 0.8673});
    const metricSettings = {...imperial, flowMeasurement: 'm3/h', distanceMeasurement: 'm'};
    const flow = services.convert.value(2000).from('gpm').to('m3/h');
    const head = services.convert.value(137).from('ft').to('m');
    expect(services.psat.pumpEfficiency(6, flow, 2000, 1.107, 1, head, 100, metricSettings))
      .toEqual({average: 0.8398, max: 0.8673});
  });

  it('refuses unavailable duties without passing a supplied efficiency through an HI estimate', () => {
    for (const style of [4, 11, 12]) {
      const result = services.pumps.pumpEfficiency(style, 2000, 2000, 1.107, 1, 137, 80);
      expect(Number.isNaN(result.average)).toBeTrue();
      expect(Number.isNaN(result.max)).toBeTrue();
    }
    expect(Number.isNaN(services.pumps.achievableEfficiency(9, 500))).toBeTrue();
  });

  it('plots complete inclusive speed ranges and rejects out-of-range calculated points', () => {
    const forms = new UntypedFormBuilder();
    const speed = new SpecificSpeedService(forms, services.convert);
    const graph = new SpecificSpeedGraphComponent(services.psat, speed, null, null);
    graph.speedForm = speed.initForm(imperial);
    for (const style of [6, 9]) {
      graph.speedForm.controls.pumpType.setValue(style);
      const limits = services.psat.pumpEfficiencyLimits(style);
      const data = graph.getLineTraceData();
      expect(data.x[0]).toBe(limits.minimumSpecificSpeed);
      expect(data.x[data.x.length - 1]).toBe(limits.maximumSpecificSpeed);
      expect(data.y.every(Number.isFinite)).toBeTrue();
    }
    graph.speedForm.controls.pumpType.setValue(9);
    graph.speedForm.controls.pumpRPM.setValue(1);
    graph.specificSpeedChart = speed.specificSpeedChart.getValue();
    graph.selectedDataPoints = [];
    graph.setCalculatedTrace();
    expect(graph.validCurrentSpeed).toBeFalse();
    expect(graph.specificSpeedChart.data[1]?.x ?? []).toEqual([]);
  });

  it('uses the selected flow range in either unit system and never saves an unavailable clicked point', () => {
    const forms = new UntypedFormBuilder();
    const service = new AchievableEfficiencyService(forms, services.convert);
    const graph = new AchievableEfficiencyGraphComponent(services.psat, service, null, null);
    graph.settings = imperial;
    graph.efficiencyForm = service.getFormFromObj({pumpType: 4, flowRate: 400, rpm: 2000,
      kinematicViscosity: 1.107, stageCount: 1, head: 137, pumpEfficiency: 100});
    graph.efficiencyChart = service.efficiencyChart.getValue();
    graph.selectedDataPoints = [];
    expect(graph.setXRange().range).toEqual({min: 300, max: 1300});
    expect(graph.getCurrentPoints(true, 2000)).toEqual([]);
    expect(() => graph.createDataPoints({points: [{x: 2000}]})).not.toThrow();
    expect(graph.selectedDataPoints).toEqual([]);
    graph.settings = {...imperial, flowMeasurement: 'm3/h'};
    expect(graph.setXRange().range.max).toBeCloseTo(services.convert.value(1300).from('gpm').to('m3/h'), 10);
  });
});
