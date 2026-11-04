import { migratePumpEfficiencies } from '../shared/pump-efficiency';
import { PSAT } from '../shared/models/psat';
import { canonical, imperial, initializeMotorDrivenServices, MotorDrivenServices, pumpInputs } from './motor-driven-regression-tests/scenarios';
import { UntypedFormBuilder } from '@angular/forms';
import { AchievableEfficiencyService } from '../calculator/pumps/achievable-efficiency/achievable-efficiency.service';
import { AchievableEfficiencyGraphComponent } from '../calculator/pumps/achievable-efficiency/achievable-efficiency-graph/achievable-efficiency-graph.component';
import { SpecificSpeedGraphComponent } from '../calculator/pumps/specific-speed/specific-speed-graph/specific-speed-graph.component';
import { SpecificSpeedService } from '../calculator/pumps/specific-speed/specific-speed.service';
import { PsatService } from '../psat/psat.service';
import { PumpFluidService } from '../psat/pump-fluid/pump-fluid.service';
import { MotorService } from '../psat/motor/motor.service';
import { FieldDataService } from '../psat/field-data/field-data.service';
import { AssessmentCo2SavingsService } from '../shared/assessment-co2-savings/assessment-co2-savings.service';
import { ChangeDetectorRef } from '@angular/core';
import { PsatReportComponent } from '../psat/psat-report/psat-report.component';
import { PsatReportRollupService } from '../report-rollup/psat-report-rollup.service';
import { ExportToJustifiPsatService } from '../shared/export-to-justifi-modal/export-to-justifi-services/export-to-justifi-psat.service';
import { SettingsDbService } from '../indexedDb/settings-db.service';
import { Assessment } from '../shared/models/assessment';
import { PsatSummaryCardComponent } from '../dashboard/directory-dashboard/directory-items/assessment-item/psat-summary-card/psat-summary-card.component';
import { PsatDiagramComponent } from '../psat/psat-diagram/psat-diagram.component';
import { PsatSankeyComponent } from '../shared/psat-sankey/psat-sankey.component';
import { PsatChartsService } from '../psat/services/psat-charts.service';
import { PlotlyService } from 'angular-plotly.js';
import { TestBed } from '@angular/core/testing';
import * as ExcelJS from 'exceljs';

describe('HI 2020 pump-efficiency production WASM integration', () => {
  let services: MotorDrivenServices;
  beforeAll(async () => {
    services = await initializeMotorDrivenServices();
    const forms = new UntypedFormBuilder();
    services.psat = new PsatService(services.pumps, services.convert,
      new AssessmentCo2SavingsService(services.convert, forms), new PumpFluidService(forms),
      new MotorService(forms), new FieldDataService(forms));
  });

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

  it('preserves real measured modifications with no saved optimum through migration and comparison', () => {
    const baseline = pumpInputs({whatIfScenario: false});
    const measured = pumpInputs({whatIfScenario: false, pump_specified: null, motor_field_power: 70});
    const before = services.psat.resultsExisting(structuredClone(measured), imperial);
    const assessment: PSAT = {inputs: baseline, modifications: [{id: 'measured', psat: {inputs: measured}}]};
    migratePumpEfficiencies(assessment);
    expect(measured.pumpEfficiencyModel.source).toBe('needs-review');
    expect(services.psat.isPsatValid(measured, false, imperial).isValid).toBeTrue();
    const comparison = services.psat.getPsatResults(baseline, imperial, measured);
    expect(comparison.modificationResults).toEqual(before);
    expect(comparison.modificationResults.annual_cost).toBeGreaterThan(0);
    expect(comparison.percentSavings).toBeLessThan(100);
  });

  it('rejects unsupported HI duties consistently and never reports their empty output as savings', () => {
    const baseline = pumpInputs({whatIfScenario: false});
    const unavailable = pumpInputs({whatIfScenario: true, pump_style: 4, flow_rate: 2000,
      pumpEfficiencyModel: {version: 1, source: 'hi-2020-pchip'}});
    expect(services.psat.isPsatValid(unavailable, false, undefined).isValid).toBeFalse();
    expect(services.psat.isPsatValid(unavailable, false, imperial).isValid).toBeFalse();
    const comparison = services.psat.getPsatResults(baseline, imperial, unavailable);
    expect(comparison.baselineResults.annual_cost).toBeGreaterThan(0);
    expect(comparison.annualSavings).toBe(0);
    expect(comparison.percentSavings).toBe(0);
    expect(comparison.co2EmissionsSavings).toBe(0);
    const report = new PsatReportComponent(null, null, null, services.psat, null);
    const baselineScenario: PSAT = {inputs: baseline};
    const invalidScenario: PSAT = {inputs: unavailable};
    baselineScenario.outputs = report.getResults(baselineScenario, imperial, true);
    invalidScenario.outputs = report.getResults(invalidScenario, imperial, false);
    expect(invalidScenario.valid.isValid).toBeFalse();
    expect(report.getSavingsPercentage(baselineScenario, invalidScenario)).toBe(0);
    expect(report.getPaybackPeriod(baselineScenario, invalidScenario)).toBe(0);
  });

  it('retains saved achievable points across unavailable-to-valid refreshes without duplicate current rows', () => {
    const forms = new UntypedFormBuilder();
    const service = new AchievableEfficiencyService(forms, services.convert);
    const cd = jasmine.createSpyObj<ChangeDetectorRef>('cd', ['detectChanges']);
    const graph = new AchievableEfficiencyGraphComponent(services.psat, service, cd, null);
    graph.settings = imperial;
    graph.efficiencyForm = service.getFormFromObj({pumpType: 6, flowRate: 7000, rpm: 2000,
      kinematicViscosity: 1.107, stageCount: 1, head: 137, pumpEfficiency: 100});
    graph.efficiencyChart = service.efficiencyChart.getValue();
    graph.pointColors = ['red', 'blue'];
    const saved = {id: 'saved', x: 400, y: 70, calculationMethod: 'legacy' as const};
    graph.selectedDataPoints = [{id: undefined, x: 100, y: 60}, saved];
    graph.setMaxAndAvgPoints();
    expect(graph.selectedDataPoints).toEqual([saved]);
    graph.efficiencyForm.controls.flowRate.setValue(2000);
    graph.setMaxAndAvgPoints();
    graph.setMaxAndAvgPoints();
    expect(graph.selectedDataPoints.length).toBe(2);
    expect(graph.selectedDataPoints[0].id).toBeUndefined();
    expect(graph.selectedDataPoints[1]).toBe(saved);
  });

  it('renders all historical speed points and recomputes clicked values before attributing HI provenance', () => {
    const forms = new UntypedFormBuilder();
    const service = new SpecificSpeedService(forms, services.convert);
    const cd = jasmine.createSpyObj<ChangeDetectorRef>('cd', ['detectChanges']);
    const graph = new SpecificSpeedGraphComponent(services.psat, service, cd, null);
    graph.speedForm = service.initForm(imperial);
    graph.speedForm.controls.pumpType.setValue(6);
    graph.speedForm.controls.pumpRPM.setValue(1);
    service.selectedDataPoints.next([{pointColor: 'red', x: 7000, y: 99, calculationMethod: 'legacy'},
      {pointColor: 'blue', x: 990, y: 88, calculationMethod: 'legacy'}]);
    graph.pointColors = ['red', 'blue'];
    graph.renderChart();
    expect(graph.dataPointTraces.length).toBe(2);
    const count = graph.selectedDataPoints.length;
    graph.createDataPoint({points: [{x: 7000, y: 99}]});
    expect(graph.selectedDataPoints.length).toBe(count);
    graph.createDataPoint({points: [{x: 990, y: 88}]});
    expect(graph.selectedDataPoints[count].y).toBe(6.59);
    expect(graph.selectedDataPoints[count].calculationMethod).toBe('hi-2020-pchip');
    expect(graph.selectedDataPoints[1].y).toBe(88);
  });

  it('omits unavailable rollup comparisons, retains original modification indexes and falls back to baseline', () => {
    const invalid = {id: 'invalid', psat: {name: 'Unavailable HI', inputs: pumpInputs({whatIfScenario: true,
      pump_style: 4, flow_rate: 2000, pumpEfficiencyModel: {version: 1, source: 'hi-2020-pchip'}})}};
    const measured = {id: 'measured', psat: {name: 'Measured', inputs: pumpInputs({whatIfScenario: false,
      pump_specified: null, motor_field_power: 70})}};
    const assessment: Assessment = {id: 1, name: 'Synthetic pump', type: 'PSAT',
      psat: {name: 'Baseline', setupDone: true, inputs: pumpInputs({whatIfScenario: false}), modifications: [invalid, measured]}};
    migratePumpEfficiencies(assessment.psat);
    const item = {assessment, settings: {...imperial, pumpsRollupUnit: 'MWh'}};
    const rollup = new PsatReportRollupService(services.psat, services.convert);
    rollup.psatAssessments.next([item]);
    rollup.setAllPsatResults([item]);
    expect(rollup.allPsatResults[0].modificationIndexes).toEqual([1]);
    rollup.initPsatCompare();
    expect(rollup.selectedPsats.value[0].selectedIndex).toBe(1);
    rollup.setResultsFromSelected(rollup.selectedPsats.value);
    rollup.setTotals(item.settings);
    expect(rollup.totals.savingPotential).toBeGreaterThan(0);
    expect(rollup.totals.savingPotential).toBeLessThan(rollup.selectedPsatResults[0].baselineResults.annual_cost);
    assessment.psat.modifications = [invalid];
    rollup.setAllPsatResults([item]);
    rollup.initPsatCompare();
    expect(rollup.selectedPsats.value[0].selectedIndex).toBe(-1);
    rollup.setResultsFromSelected(rollup.selectedPsats.value);
    rollup.setTotals(item.settings);
    expect(rollup.totals.savingPotential).toBe(0);
    rollup.setResultsFromSelected([{...rollup.selectedPsats.value[0], modification: invalid.psat, selectedIndex: 0}]);
    expect(rollup.selectedPsatResults).toEqual([]);
  });

  it('does not export an unavailable HI duty as full baseline energy savings', () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Assessments');
    workbook.addWorksheet('Energy_Efficiency_Measures');
    const settings = jasmine.createSpyObj<SettingsDbService>('settings', ['getByAssessmentId']);
    settings.getByAssessmentId.and.returnValue(imperial);
    const exporter = new ExportToJustifiPsatService(services.psat, settings);
    const assessment: Assessment = {id: 1, name: 'Synthetic pump', type: 'PSAT',
      psat: {setupDone: true, inputs: pumpInputs({whatIfScenario: false}), modifications: [{id: 'unavailable',
        psat: {inputs: pumpInputs({whatIfScenario: true, pump_style: 4, flow_rate: 2000,
          pumpEfficiencyModel: {version: 1, source: 'hi-2020-pchip'}})}}]}};
    expect(exporter.fillPSATWorksheet(workbook, assessment, 2, 2)).toBe(2);
    expect(worksheet.getCell('E2').value).toBeGreaterThan(0);
    expect(worksheet.getCell('G2').value).toBeNull();
  });

  it('keeps dashboard, Sankey and diagram measured results available while validating HI duties with settings', () => {
    const measured: PSAT = {inputs: pumpInputs({whatIfScenario: false, pump_specified: null})};
    migratePumpEfficiencies(measured);
    const expected = services.psat.resultsExisting(structuredClone(measured.inputs), imperial);
    const summary = new PsatSummaryCardComponent(services.psat, null, null);
    summary.psatResults = expected;
    expect(summary.getResults(measured, imperial, false)).toEqual(expected);
    const diagram = new PsatDiagramComponent(services.psat, services.convert);
    expect(diagram.getResults(measured, imperial, true)).toEqual(expected);
    TestBed.configureTestingModule({providers: [{provide: PsatService, useValue: services.psat},
      {provide: PlotlyService, useValue: {}}, {provide: PsatChartsService, useValue: {}}]});
    const sankey = TestBed.runInInjectionContext(() => new PsatSankeyComponent());
    sankey.psat = measured;
    sankey.settings = imperial;
    sankey.isBaseline = false;
    sankey.getChartData();
    expect(sankey.validPsat.isValid).toBeTrue();
    expect(sankey.selectedResults).toEqual(expected);
    const validHI: PSAT = {inputs: pumpInputs({whatIfScenario: true, pump_style: 6,
      pumpEfficiencyModel: {version: 1, source: 'hi-2020-pchip'}})};
    expect(summary.getResults(validHI, imperial, false).annual_cost).toBeGreaterThan(0);
    expect(validHI.valid.isValid).toBeTrue();
  });
});
