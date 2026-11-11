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
import { FanAffinityLawFormComponent } from '../calculator/fans/fan-affinity-law/fan-affinity-law-form/fan-affinity-law-form.component';
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
      changeFanSize: false, diameterFan: 36, diameterFanNew: 36, estimateMotorPower: false, nameplatePower: 0, ...overrides };
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
    const si = metricFlows(us); si.powerMotor = us.powerMotor;
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
      {hoursOperation: 0}, {powerMotor: 0},
      {efficiencyMotor: 0}, {efficiencyDrive: 101}, {ratedFlow: 0}, {actualFlow: 0},
      {actualFlow: 31000}, {desiredFlowPercent: -1}, {desiredFlowPercent: 101},
      {flowMode: 1, desiredFlowVolume: 31000},
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

  it('matches Test 5: On/Off to Two-Speed with a larger fan, showing Current and New time rows', () => {
    const result = service.getResults(input({hoursOperation: 4830, electricalRate: 0.08, powerMotor: 22.37,
      efficiencyMotor: 97, efficiencyDrive: 96, ratedFlow: 60000, actualFlow: 60000, motorControlTypeCurrent: 0,
      motorControlTypeNew: 1, flowMode: 1, desiredFlowVolume: 40000, changeFanSize: true, diameterFan: 36, diameterFanNew: 38}), imperial);
    expect(result.newFlowPercent).toBeCloseTo(56.7, 1);
    expect(result.timeAbove50Percent).toBeCloseTo(13.4, 1);
    expect(result.timeAt50Percent).toBeCloseTo(86.6, 1);
    expect(result.timeAt0Percent).toBeCloseTo(0, 10);
    expect(result.baselinePower).toBeCloseTo(24.02, 2);
    expect(result.newPower).toBeCloseTo(7.62, 2);
    expect(result.annualCostSavings).toBeCloseTo(6339, 0);
    // Current time rows show whenever either side is Two-Speed; an On/Off baseline runs at full speed
    expect(result.baselineTimeAbove50Percent).toBeCloseTo(100, 10);
    expect(result.baselineTimeAt50Percent).toBeCloseTo(0, 10);
    expect(result.baselineTimeAt0Percent).toBeCloseTo(0, 10);
  });

  it('estimates delivered Motor Power from Nameplate Power for each baseline control', () => {
    const estimate = (overrides: Partial<FanAffinityLawsInput>, settings: Settings): number => {
      const form = service.getFormFromObj(input({estimateMotorPower: true, ...overrides}));
      service.setEstimatedMotorPower(form, settings);
      return form.controls.powerMotor.value;
    };
    expect(estimate({nameplatePower: 1250, motorControlTypeCurrent: 2, actualFlow: 7040}, imperial)).toBeCloseTo(11.22, 2);
    expect(estimate({nameplatePower: 15, motorControlTypeCurrent: 1, actualFlow: 27000}, imperial)).toBeCloseTo(8.59, 2);
    expect(estimate({nameplatePower: 15, motorControlTypeCurrent: 0, actualFlow: 30000}, metric)).toBeCloseTo(15 * 0.97 * 0.96, 10);
  });

  it('keeps the metered Motor Power until the estimate is usable and requires Nameplate Power only in Estimate mode', () => {
    const form = service.getFormFromObj(input({powerMotor: 50, estimateMotorPower: true, nameplatePower: 0}));
    service.setEstimatedMotorPower(form, imperial);
    expect(form.controls.powerMotor.value).toBe(50);
    expect(form.controls.nameplatePower.errors?.greaterThan).toBe(0);
    expect(form.valid).toBeFalse();
    form.controls.nameplatePower.setValue(15); form.controls.ratedFlow.setValue(0);
    service.setEstimatedMotorPower(form, imperial);
    expect(form.controls.powerMotor.value).toBe(50);
    expect(service.getFormFromObj(input({nameplatePower: 0})).controls.nameplatePower.errors).toBeNull();
  });

  it('flags the Section 4 and 5 validation cases', () => {
    const errors = (overrides: Partial<FanAffinityLawsInput>, field: string) =>
      service.getFormFromObj(input(overrides)).controls[field].errors;
    expect(errors({flowMode: 1, desiredFlowVolume: -10}, 'desiredFlowVolume')?.min).toBeDefined();
    expect(errors({flowMode: 1, desiredFlowVolume: 31000}, 'desiredFlowVolume')?.max?.max).toBe(30000);
    expect(errors({ratedFlow: 0}, 'ratedFlow')?.greaterThan).toBe(0);
    expect(errors({actualFlow: 31000}, 'actualFlow')?.max?.max).toBe(30000);
    expect(errors({actualFlow: 0, motorControlTypeCurrent: 2}, 'actualFlow')?.greaterThan).toBe(0);
    expect(errors({actualFlow: 0, motorControlTypeCurrent: 1}, 'actualFlow')?.greaterThan).toBe(0);
    expect(errors({efficiencyMotor: 0}, 'efficiencyMotor')?.greaterThan).toBe(0);
    expect(errors({efficiencyDrive: 0}, 'efficiencyDrive')?.greaterThan).toBe(0);
    expect(errors({powerMotor: 0}, 'powerMotor')?.greaterThan).toBe(0);
    expect(errors({estimateMotorPower: true, nameplatePower: 0}, 'nameplatePower')?.greaterThan).toBe(0);
    expect(errors({changeFanSize: true, diameterFanNew: 32, flowMode: 1, desiredFlowVolume: 30000}, 'desiredFlowVolume')?.max?.max)
      .toBeCloseTo(30000 * Math.pow(32 / 36, 3), 8);
    const noChange = input({motorControlTypeCurrent: 0, actualFlow: 30000, motorControlTypeNew: 3, changeFanSize: false});
    expect(service.getFormFromObj(noChange).controls.motorControlTypeNew.hasError('noAdjustment')).toBeTrue();
    expect(service.getResults(noChange, imperial).annualCostSavings).toBe(0);
  });

  it("names the new fan's rated flow as the Flow Rate limit only once both diameters are set", () => {
    const view = new FanAffinityLawFormComponent(service);
    view.fanAffinityLawForm = service.getFormFromObj(input({changeFanSize: true, diameterFanNew: 32}));
    expect(view.flowLimitIsNewFan()).toBeTrue();
    view.fanAffinityLawForm.controls.diameterFanNew.setValue(0);
    expect(view.flowLimitIsNewFan()).toBeFalse();
    view.fanAffinityLawForm.controls.changeFanSize.setValue(false);
    expect(view.flowLimitIsNewFan()).toBeFalse();
  });

  it('converts Nameplate Power between hp and kW while Motor Power stays kW', () => {
    const treasure = new FanAffinityLawTreasureHuntService(service, convert);
    const si = treasure.convertFanAffinityLawInput(input({nameplatePower: 15, powerMotor: 20}), imperial, metric);
    expect(si.nameplatePower).toBeCloseTo(convert.value(15).from('hp').to('kW'), 3);
    expect(si.powerMotor).toBe(20);
    const us = treasure.convertFanAffinityLawInput({...si}, metric, imperial);
    expect(us.nameplatePower).toBeCloseTo(15, 2);
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
