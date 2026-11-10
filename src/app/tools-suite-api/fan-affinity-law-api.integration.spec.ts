import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import createModule, { type MeasurToolsSuite } from 'measur-tools-suite';
import packageInfo from 'measur-tools-suite/package.json';
import { FanAffinityLawApiService } from './fan-affinity-law-api.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { FanAffinityLawService } from '../calculator/fans/fan-affinity-law/fan-affinity-law.service';
import { FanAffinityLawHelpComponent } from '../calculator/fans/fan-affinity-law/fan-affinity-law-help/fan-affinity-law-help.component';
import { FanAffinityLawResultsComponent } from '../calculator/fans/fan-affinity-law/fan-affinity-law-results/fan-affinity-law-results.component';
import { FanAffinityLawTreasureHuntService } from '../treasure-hunt/treasure-hunt-calculator-services/fan-affinity-law-treasure-hunt.service';
import { ConvertUnitsService } from '../shared/convert-units/convert-units.service';
import { FanAffinityLawsInput, FanAffinityLawsOutput } from '../shared/models/standalone';
import { Settings } from '../shared/models/settings';
import { FanAffinityLawTreasureHunt, Treasure } from '../shared/models/treasure-hunt';
import { environment } from '../../environments/environment';

describe('Fan affinity Desktop integration with the published beta', () => {
  let suite: MeasurToolsSuite;
  let api: FanAffinityLawApiService;
  let service: FanAffinityLawService;
  let convert: ConvertUnitsService;
  const imperial: Settings = { unitsOfMeasure: 'Imperial', powerMeasurement: 'hp', electricityCost: 0.07 };
  const metric: Settings = { ...imperial, unitsOfMeasure: 'Metric', powerMeasurement: 'kW' };

  function input(overrides: Partial<FanAffinityLawsInput> = {}): FanAffinityLawsInput {
    return { hoursOperation: 6240, electricalRate: 0.07, efficiencyMotor: 96, efficiencyDrive: 97,
      powerMotor: 10, ratedFlow: 30000, actualFlow: 27000, motorControlTypeCurrent: 1,
      motorControlTypeNew: 1, flowMode: 0, desiredFlowVolume: 16500, desiredFlowPercent: 55,
      changeFanSize: false, diameterFan: 36, diameterFanNew: 36, ...overrides };
  }

  function metricFlows(data: FanAffinityLawsInput): FanAffinityLawsInput {
    return { ...data,
      ratedFlow: convert.value(data.ratedFlow).from('ft3/min').to('m3/s'),
      actualFlow: convert.value(data.actualFlow).from('ft3/min').to('m3/s'),
      desiredFlowVolume: convert.value(data.desiredFlowVolume).from('ft3/min').to('m3/s'),
      diameterFan: convert.value(data.diameterFan).from('in').to('cm'),
      diameterFanNew: convert.value(data.diameterFanNew).from('in').to('cm') };
  }

  beforeAll(async () => {
    suite = await createModule({ locateFile: filename => `/${filename}` });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule], declarations: [FanAffinityLawHelpComponent],
      providers: [FanAffinityLawApiService, { provide: ToolsSuiteApiService, useValue: { ToolsSuiteModule: suite } }]
    }).compileComponents();
    api = TestBed.inject(FanAffinityLawApiService);
    convert = new ConvertUnitsService();
    service = new FanAffinityLawService(new UntypedFormBuilder(), convert, api);
  });

  it('loads exactly beta 461.2, exposes functions, and returns plain objects without cleanup', () => {
    expect(packageInfo.version).toBe('1.2.7-beta.461.2');
    expect('FanAffinityLaws' in suite).toBeFalse();
    const output = api.calculate(input());
    expect('delete' in output).toBeFalse();
    expect(output.annualEnergyBaseline).toBeCloseTo(67010.30927835, 6);
    expect(output.annualEnergyNew).toBeCloseTo(17260.23117776, 6);
    expect(api.get50PercentTimeFactor(0.9)).toEqual(jasmine.objectContaining({ timeAt0Percent: 0 }));
    expect(api.get50PercentTimeFactor(0.9).factor).toBeCloseTo(0.825, 12);
  });

  it('maps inputs and enums without clamping, selecting the volume or percentage target', () => {
    const calculate = spyOn(suite, 'calculateFanAffinityLaws').and.callThrough();
    api.calculate(input({flowMode: 1}));
    const wire = calculate.calls.mostRecent().args[0];
    expect(wire.flowMode).toBe(suite.FlowMode.Volume);
    expect(wire.motorControlTypeCurrent).toBe(suite.MotorControlType.TwoSpeed);
    expect(wire.motorControlTypeNew).toBe(suite.MotorControlType.TwoSpeed);
    expect(wire.flowPercentBaseline).toBe(90);
    expect(wire.motorPower).toBe(10);
    expect(wire.desiredFlowRate).toBe(16500);
    api.calculate(input({motorControlTypeCurrent: 0, actualFlow: 1, motorControlTypeNew: 3}));
    expect(calculate.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
      flowPercentBaseline: 100, motorControlTypeCurrent: suite.MotorControlType.OnOff,
      motorControlTypeNew: suite.MotorControlType.None, desiredFlowRate: 0
    }));
  });

  it('matches the delivered-power VSD example and preserves saved input values', () => {
    const data = metricFlows(input({powerMotor: 11.22, ratedFlow: 30000, actualFlow: 7040,
      motorControlTypeCurrent: 2, motorControlTypeNew: 2, flowMode: 1, desiredFlowVolume: 5000}));
    const saved = { ...data };
    const result = service.getResults(data, metric);
    expect(data).toEqual(saved);
    expect(result.baselinePower).toBeCloseTo(12.0489690722, 8);
    expect(result.newPower).toBeCloseTo(4.3166011808, 8);
    expect(result.baselineFlowVolume).toBeCloseTo(data.actualFlow, 10);
    expect(result.baselineFlowPercent).toBeCloseTo(7040 / 30000 * 100, 10);
    expect(result.annualEnergyNew).toBeCloseTo(result.newPower * data.hoursOperation, 8);
  });

  it('supports larger fans and uses resized flow for Two-Speed shares and displayed power', () => {
    const data = metricFlows(input({powerMotor: 20, hoursOperation: 4380, electricalRate: 0.08,
      efficiencyMotor: 97, efficiencyDrive: 96, ratedFlow: 60000, actualFlow: 0,
      motorControlTypeCurrent: 0, motorControlTypeNew: 1, flowMode: 1, desiredFlowVolume: 40000,
      changeFanSize: true, diameterFan: 36, diameterFanNew: 38}));
    expect(service.getFormFromObj(data).valid).toBeTrue();
    const helper = spyOn(api, 'get50PercentTimeFactor').and.callThrough();
    const resize = spyOn(suite, 'calculateFanAffinityLawsWithFanSize').and.callThrough();
    const result = service.getResults(data, metric);
    expect(resize.calls.mostRecent().args[1]).toBeCloseTo(36, 10);
    expect(resize.calls.mostRecent().args[2]).toBeCloseTo(38, 10);
    expect(helper.calls.mostRecent().args[0]).toBeCloseTo(0.5668464790785829, 12);
    expect(result.annualEnergyNew).toBeCloseTo(29829.67300151, 6);
    expect(result.annualCostSavings).toBeCloseTo(5139.39935576, 6);
    expect(result.newPower).toBeCloseTo(6.810427625916308, 10);
    expect(result.timeAbove50Percent).toBeCloseTo(13.369295815716575, 10);
    expect(result.timeAt50Percent).toBeCloseTo(86.63070418428342, 10);
    const view = new FanAffinityLawResultsComponent(); view.fanAffinityLawResults = result;
    expect(view.flowPercentNew()).toBeCloseTo(56.68464790785829, 10);
  });

  it('agrees across imperial/metric and percentage/volume inputs without rewriting storage', () => {
    const us = input({powerMotor: 30, motorControlTypeCurrent: 2, motorControlTypeNew: 1});
    const si = metricFlows(us); si.powerMotor = convert.value(us.powerMotor).from('hp').to('kW');
    const a = service.getResults(us, imperial); const b = service.getResults(si, metric);
    expect(b.annualEnergyBaseline).toBeCloseTo(a.annualEnergyBaseline, 8);
    expect(b.annualEnergyNew).toBeCloseTo(a.annualEnergyNew, 8);
    const volume = service.getResults({...us, flowMode: 1}, imperial);
    expect(volume.annualEnergyNew).toBeCloseTo(a.annualEnergyNew, 8);
    expect(us.powerMotor).toBe(30);
  });

  it('preserves identity and uses Suite results for a variable-control transition to On/Off', () => {
    const identity = input({desiredFlowPercent: 90});
    const result = service.getResults(identity, imperial);
    expect(result.newPower).toBeCloseTo(result.baselinePower, 10);
    expect(result.annualCostSavings).toBeCloseTo(0, 8);
    const fullSpeed = service.getResults({...identity, motorControlTypeNew: 3}, imperial);
    expect(fullSpeed.newPower).toBeGreaterThan(fullSpeed.baselinePower);
    expect(fullSpeed.desiredFlowPercent).toBe(100);
    const baseline = service.getResults({...identity, desiredFlowPercent: NaN}, imperial, false);
    expect(baseline.annualEnergyNew).toBe(baseline.annualEnergyBaseline);
    expect(baseline.annualCostSavings).toBe(0);
  });

  it('blocks invalid form and Treasure Hunt inputs before calling WASM, clearing prior result fields', () => {
    const calculate = spyOn(api, 'calculate').and.callThrough();
    const resize = spyOn(api, 'changeFanSize').and.callThrough();
    const invalid: Partial<FanAffinityLawsInput>[] = [
      {hoursOperation: 0}, {hoursOperation: Infinity}, {powerMotor: 0}, {powerMotor: NaN},
      {electricalRate: NaN}, {electricalRate: Infinity},
      {efficiencyMotor: 0}, {efficiencyDrive: 101}, {ratedFlow: 0}, {actualFlow: 0},
      {actualFlow: 31000}, {desiredFlowPercent: -1}, {desiredFlowPercent: 101},
      {flowMode: 1, desiredFlowVolume: 31000}, {flowMode: 1, desiredFlowVolume: Infinity},
      {changeFanSize: true, diameterFan: 0}, {changeFanSize: true, diameterFanNew: 0},
      {changeFanSize: true, diameterFanNew: 32, desiredFlowPercent: 90}
    ];
    for (const overrides of invalid) {
      const bad = input(overrides);
      const result = service.getResults(bad, imperial);
      expect(result).withContext(JSON.stringify(overrides)).toEqual({annualEnergyBaseline: 0, annualEnergyNew: 0, annualCostSavings: 0});
      expect(result.newPower).toBeUndefined();
    }
    const treasure = new FanAffinityLawTreasureHuntService(service, convert);
    const opportunity: FanAffinityLawTreasureHunt = { inputData: input({efficiencyMotor: 0}), opportunityType: Treasure.fanAffinityLaw };
    expect(treasure.getTreasureHuntOpportunityResults(opportunity, imperial).costSavings).toBe(0);
    opportunity.inputData = input({electricalRate: NaN});
    expect(treasure.getTreasureHuntOpportunityResults(opportunity, imperial)).toEqual({
      costSavings: 0, energySavings: 0, baselineCost: 0, modificationCost: 0, utilityType: 'Electricity'
    });
    expect(calculate).not.toHaveBeenCalled(); expect(resize).not.toHaveBeenCalled();
  });

  it('refreshes flow limits after diameter/rated-flow edits and synchronizes On/Off inputs', () => {
    const form = service.getFormFromObj(input({changeFanSize: true, diameterFanNew: 38}));
    expect(form.valid).toBeTrue();
    form.controls.desiredFlowPercent.setValue(110); service.setValidators(form);
    expect(form.valid).toBeTrue();
    const percent = service.getResults(service.getObjFromForm(form), imperial);
    const volume = service.getResults(input({changeFanSize: true, diameterFanNew: 38,
      flowMode: 1, desiredFlowVolume: 33000}), imperial);
    expect(percent.annualEnergyNew).toBeCloseTo(volume.annualEnergyNew, 8);
    form.controls.diameterFanNew.setValue(20); service.setValidators(form);
    expect(form.controls.desiredFlowPercent.hasError('max')).toBeTrue();
    form.controls.diameterFanNew.setValue(38); form.controls.desiredFlowPercent.setValue(55); service.setValidators(form);
    expect(form.valid).toBeTrue();
    form.controls.motorControlTypeCurrent.setValue(0); form.controls.ratedFlow.setValue(25000);
    service.setValidators(form);
    expect(form.controls.actualFlow.value).toBe(25000);
    expect(service.getBaselineFlowPercent(service.getObjFromForm(form))).toBe(100);
  });

  it('keeps Treasure Hunt unit conversion and saved input round trips consistent', () => {
    const treasure = new FanAffinityLawTreasureHuntService(service, convert);
    const us = input({powerMotor: 30});
    const saved = JSON.parse(JSON.stringify(us));
    const si = treasure.convertFanAffinityLawInput({...us}, imperial, metric);
    const converted = service.getResults(si, metric);
    const original = service.getResults(saved, imperial);
    expect(converted.annualEnergyBaseline).toBeCloseTo(original.annualEnergyBaseline, -1);
    expect(service.getObjFromForm(service.getFormFromObj(saved))).toEqual(saved);
    expect(saved.powerMotor).toBe(30);
  });

  it('offers the documentation link independently of field help and describes delivered power', () => {
    const fixture = TestBed.createComponent(FanAffinityLawHelpComponent);
    fixture.componentInstance.currentField = 'powerMotor'; fixture.detectChanges();
    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('href')).toBe(environment.measurDocsUrl + 'group__fan__affinity__laws__calculator');
    expect(anchor.target).toBe('_blank'); expect(anchor.rel).toContain('noopener');
    expect(anchor.textContent).toContain('How are fan affinity-law energy savings calculated?');
    expect(fixture.nativeElement.textContent).toContain('baseline operating point');
    fixture.componentInstance.currentField = undefined; fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).not.toBeNull();
  });
});
