import { TestBed } from '@angular/core/testing';
import { CompressedAirDryersSuiteApiService } from './compressed-air-dryer-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { DryerOperatingCostInput, DryerType, PurgeInputMode } from '../shared/models/standalone';

describe('CompressedAirDryersSuiteApiService', () => {
  let service: CompressedAirDryersSuiteApiService;
  let calculateSpy: jasmine.Spy;
  let legacyConstructorSpy: jasmine.Spy;
  let resultDeleteSpy: jasmine.Spy;

  // Unique sentinels stand in for the Emscripten enum values so the mapping is checked by identity.
  const suiteDryerType = {
    Heatless: { name: 'Heatless' },
    HeatedExternally: { name: 'HeatedExternally' },
    BlowerPurgeWithSweep: { name: 'BlowerPurgeWithSweep' },
    BlowerPurgeWithoutSweep: { name: 'BlowerPurgeWithoutSweep' },
    HeatOfCompressionHC: { name: 'HeatOfCompressionHC' },
    HeatOfCompressionSP: { name: 'HeatOfCompressionSP' },
    Refrigerated: { name: 'Refrigerated' },
  };
  const suitePurgeInputMode = {
    PercentOfDryerCapacity: { name: 'PercentOfDryerCapacity' },
    DirectFlow: { name: 'DirectFlow' },
  };

  const suiteResult = {
    waterRemoved: 12.5,
    totalCostPerYear: 45678.9,
    heaterPower: 22.1,
    heatingHoursPerDay: 18,
    purgeRate: 7.2,
    designDDCPercentage: 16.33,
    purgeFlowRate: 72,
    motorPower: 5.5,
    regenerationCycleLength: 4,
  };

  function buildInput(overrides: Partial<DryerOperatingCostInput> = {}): DryerOperatingCostInput {
    return {
      dryerType: DryerType.BlowerPurgeWithSweep,
      annualOperatingHours: 8760,
      flowRate: 1000,
      pressure: 100,
      temperature: 75,
      costOfElectricity: 0.08,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.5,
      purgeInputMode: PurgeInputMode.DirectFlow,
      purgeRate: 0,
      purgeFlowRate: 70,
      heaterPower: 25,
      heatingHoursPerDay: 18,
      motorPower: 7.5,
      designDDCPercentage: 16.33,
      regenerationCycleLength: 4,
      ...overrides,
    };
  }

  beforeEach(() => {
    resultDeleteSpy = jasmine.createSpy('result.delete');
    calculateSpy = jasmine.createSpy('calculateDryerOperatingCost')
      .and.callFake(() => ({ ...suiteResult, delete: resultDeleteSpy }));
    legacyConstructorSpy = jasmine.createSpy('DryerOperatingCost');

    const fakeToolsSuiteApiService = {
      ToolsSuiteModule: {
        DryerType: suiteDryerType,
        PurgeInputMode: suitePurgeInputMode,
        calculateDryerOperatingCost: calculateSpy,
        DryerOperatingCost: legacyConstructorSpy,
      },
    };

    TestBed.configureTestingModule({
      providers: [
        CompressedAirDryersSuiteApiService,
        SuiteApiHelperService,
        { provide: ToolsSuiteApiService, useValue: fakeToolsSuiteApiService },
      ]
    });
    service = TestBed.inject(CompressedAirDryersSuiteApiService);
  });

  it('calls calculateDryerOperatingCost exactly once per calculation', () => {
    service.dryerOperatingCost(buildInput());
    expect(calculateSpy).toHaveBeenCalledTimes(1);
  });

  it('does not construct the legacy DryerOperatingCost class', () => {
    service.dryerOperatingCost(buildInput());
    expect(legacyConstructorSpy).not.toHaveBeenCalled();
  });

  it('sends dryerType inside the single input object, not as a separate argument', () => {
    service.dryerOperatingCost(buildInput());
    const args = calculateSpy.calls.mostRecent().args;
    expect(args.length).toBe(1);
    expect(args[0].dryerType).toBe(suiteDryerType.BlowerPurgeWithSweep);
  });

  it('maps every input field to the Suite contract', () => {
    service.dryerOperatingCost(buildInput());
    expect(calculateSpy.calls.mostRecent().args[0]).toEqual({
      dryerType: suiteDryerType.BlowerPurgeWithSweep,
      flowRate: 1000,
      pressure: 100,
      temperature: 75,
      annualOperatingHours: 8760,
      costOfElectricity: 0.08,
      costOfCompressedAir: 0.25,
      costOfCoolingWater: 0.5,
      heaterPower: 25,
      heatingHoursPerDay: 18,
      purgeRate: 0,
      purgeFlowRate: 70,
      designDDCPercentage: 16.33,
      regenerationCycleLength: 4,
      motorPower: 7.5,
      purgeInputMode: suitePurgeInputMode.DirectFlow,
    });
  });

  it('does not send the legacy schedule fields', () => {
    service.dryerOperatingCost(buildInput());
    const suiteInput = calculateSpy.calls.mostRecent().args[0];
    expect('operatingHoursPerDay' in suiteInput).toBeFalse();
    expect('operatingDaysPerWeek' in suiteInput).toBeFalse();
    expect('operatingWeeksPerYear' in suiteInput).toBeFalse();
  });

  const DRYER_TYPE_CASES: Array<[DryerType, object]> = [
    [DryerType.Heatless, suiteDryerType.Heatless],
    [DryerType.HeatedExternally, suiteDryerType.HeatedExternally],
    [DryerType.BlowerPurgeWithSweep, suiteDryerType.BlowerPurgeWithSweep],
    [DryerType.BlowerPurgeWithoutSweep, suiteDryerType.BlowerPurgeWithoutSweep],
    [DryerType.HeatOfCompressionHC, suiteDryerType.HeatOfCompressionHC],
    [DryerType.HeatOfCompressionSP, suiteDryerType.HeatOfCompressionSP],
    [DryerType.Refrigerated, suiteDryerType.Refrigerated],
  ];
  DRYER_TYPE_CASES.forEach(([dryerType, expected]) => {
    it(`maps DryerType.${DryerType[dryerType]} to the Suite runtime enum`, () => {
      service.dryerOperatingCost(buildInput({ dryerType }));
      expect(calculateSpy.calls.mostRecent().args[0].dryerType).toBe(expected);
    });
  });

  it('maps both purge input modes to the Suite runtime enum', () => {
    service.dryerOperatingCost(buildInput({ purgeInputMode: PurgeInputMode.PercentOfDryerCapacity }));
    expect(calculateSpy.calls.mostRecent().args[0].purgeInputMode).toBe(suitePurgeInputMode.PercentOfDryerCapacity);
    service.dryerOperatingCost(buildInput({ purgeInputMode: PurgeInputMode.DirectFlow }));
    expect(calculateSpy.calls.mostRecent().args[0].purgeInputMode).toBe(suitePurgeInputMode.DirectFlow);
  });

  it('sends 0 for null or undefined numeric inputs', () => {
    service.dryerOperatingCost(buildInput({ heaterPower: null, motorPower: undefined }));
    const suiteInput = calculateSpy.calls.mostRecent().args[0];
    expect(suiteInput.heaterPower).toBe(0);
    expect(suiteInput.motorPower).toBe(0);
  });

  it('maps every result field', () => {
    expect(service.dryerOperatingCost(buildInput())).toEqual(suiteResult);
  });

  it('does not attempt WASM cleanup on the result', () => {
    const output = service.dryerOperatingCost(buildInput());
    expect(resultDeleteSpy).not.toHaveBeenCalled();
    expect('delete' in output).toBeFalse();
  });

  it('does not attempt WASM cleanup on the input', () => {
    const inputDeleteSpy = jasmine.createSpy('input.delete');
    const input = Object.assign(buildInput(), { delete: inputDeleteSpy });
    service.dryerOperatingCost(input);
    expect(inputDeleteSpy).not.toHaveBeenCalled();
    expect('delete' in calculateSpy.calls.mostRecent().args[0]).toBeFalse();
  });
});
