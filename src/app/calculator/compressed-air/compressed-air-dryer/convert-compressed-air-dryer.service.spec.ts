import { TestBed } from '@angular/core/testing';
import { ConvertCompressedAirDryerService } from './convert-compressed-air-dryer.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { DryerOperatingCostInput, DryerOperatingCostOutput, DryerType, PurgeInputMode } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirDryerService } from './compressed-air-dryer.service';
import { CompressedAirDryersSuiteApiService } from '../../../tools-suite-api/compressed-air-dryer-suite-api.service';

describe('ConvertCompressedAirDryerService', () => {
  let service: ConvertCompressedAirDryerService;
  const imperial = { unitsOfMeasure: 'Imperial' } as Settings;
  const metric = { unitsOfMeasure: 'Metric' } as Settings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConvertCompressedAirDryerService, ConvertUnitsService]
    });
    service = TestBed.inject(ConvertCompressedAirDryerService);
  });

  function buildMetricInput(overrides: Partial<DryerOperatingCostInput> = {}): DryerOperatingCostInput {
    return {
      dryerType: DryerType.BlowerPurgeWithSweep,
      annualOperatingHours: 8760,
      flowRate: 28.317,
      pressure: 6.895,
      temperature: 23.889,
      costOfElectricity: 0.08,
      costOfCompressedAir: 8.829,
      costOfCoolingWater: 0.132,
      purgeInputMode: PurgeInputMode.DirectFlow,
      purgeRate: 0,
      purgeFlowRate: 2.8317,
      heaterPower: 40,
      heatingHoursPerDay: 18,
      motorPower: 7.457,
      designDDCPercentage: 16.33,
      regenerationCycleLength: 4,
      ...overrides,
    };
  }

  function buildImperialOutput(): DryerOperatingCostOutput {
    return {
      waterRemoved: 8.345,
      totalCostPerYear: 12000,
      heaterPower: 40,
      heatingHoursPerDay: 18,
      purgeRate: 7,
      designDDCPercentage: 16.33,
      purgeFlowRate: 100,
      motorPower: 10,
      regenerationCycleLength: 4,
    };
  }

  describe('metric inputs to the Suite imperial contract', () => {
    it('converts direct purge airflow from m3/min to SCFM', () => {
      const converted = service.convertInputsToImperial(buildMetricInput(), metric);
      expect(converted.purgeFlowRate).toBeCloseTo(100, 1);
    });

    it('converts manual motor power from kW to hp', () => {
      const converted = service.convertInputsToImperial(buildMetricInput(), metric);
      expect(converted.motorPower).toBeCloseTo(10, 1);
    });

    it('keeps zero purge flow and motor power at zero so automatic sizing is preserved', () => {
      const converted = service.convertInputsToImperial(buildMetricInput({ purgeFlowRate: 0, motorPower: 0 }), metric);
      expect(converted.purgeFlowRate).toBe(0);
      expect(converted.motorPower).toBe(0);
    });

    it('leaves unit-independent values unchanged', () => {
      const converted = service.convertInputsToImperial(buildMetricInput(), metric);
      expect(converted.annualOperatingHours).toBe(8760);
      expect(converted.heaterPower).toBe(40);
      expect(converted.heatingHoursPerDay).toBe(18);
      expect(converted.designDDCPercentage).toBe(16.33);
      expect(converted.regenerationCycleLength).toBe(4);
      expect(converted.purgeInputMode).toBe(PurgeInputMode.DirectFlow);
    });

    it('returns imperial inputs unchanged', () => {
      const input = buildMetricInput();
      expect(service.convertInputsToImperial(input, imperial)).toBe(input);
    });

    it('round-trips purge flow and motor power through a units change', () => {
      const original = buildMetricInput();
      const imperialInput = service.convertStoredInput(original, 'Metric', 'Imperial');
      const metricAgain = service.convertStoredInput(imperialInput, 'Imperial', 'Metric');
      expect(metricAgain.purgeFlowRate).toBeCloseTo(original.purgeFlowRate, 2);
      expect(metricAgain.motorPower).toBeCloseTo(original.motorPower, 2);
    });
  });

  describe('Suite output to display units', () => {
    it('derives water removed volume in gal/hr for imperial', () => {
      const output = service.convertOutputForDisplay(buildImperialOutput(), imperial);
      expect(output.waterRemoved).toBe(8.345);
      expect(output.waterRemovedVolume).toBeCloseTo(1, 6);
      expect(output.purgeFlowRate).toBe(100);
      expect(output.motorPower).toBe(10);
    });

    it('converts water removed, purge flow, and motor power for metric', () => {
      const output = service.convertOutputForDisplay(buildImperialOutput(), metric);
      expect(output.waterRemoved).toBeCloseTo(3.785, 2);
      expect(output.waterRemovedVolume).toBeCloseTo(3.785, 2);
      expect(output.purgeFlowRate).toBeCloseTo(2.832, 2);
      expect(output.motorPower).toBeCloseTo(7.457, 2);
    });

    it('does not mutate the Suite output', () => {
      const suiteOutput = buildImperialOutput();
      service.convertOutputForDisplay(suiteOutput, metric);
      expect(suiteOutput.waterRemoved).toBe(8.345);
      expect(suiteOutput.waterRemovedVolume).toBeUndefined();
    });
  });

  describe('validator ranges', () => {
    it('converts the purge flow and motor power maximums for metric', () => {
      const ranges = service.getValidatorRanges(metric);
      expect(ranges.purgeFlowRate.max).toBeCloseTo(1415.842, 0);
      expect(ranges.motorPower.max).toBeCloseTo(745.7, 0);
    });
  });

  describe('Imperial/Metric round trips', () => {
    let convertUnitsService: ConvertUnitsService;

    beforeEach(() => {
      convertUnitsService = TestBed.inject(ConvertUnitsService);
    });

    function buildImperialInput(): DryerOperatingCostInput {
      return {
        ...buildMetricInput(),
        flowRate: 1000,
        pressure: 100,
        temperature: 75,
        costOfCompressedAir: 0.25,
        costOfCoolingWater: 0.5,
        purgeFlowRate: 100,
        motorPower: 10,
      };
    }

    it('round-trips direct purge flow Imperial -> Metric -> Imperial', () => {
      const original = buildImperialInput();
      const metricInput = service.convertStoredInput(original, 'Imperial', 'Metric');
      expect(metricInput.purgeFlowRate).toBeCloseTo(2.832, 3);
      const imperialAgain = service.convertStoredInput(metricInput, 'Metric', 'Imperial');
      expect(imperialAgain.purgeFlowRate).toBeCloseTo(original.purgeFlowRate, 1);
    });

    it('round-trips motor power Imperial -> Metric -> Imperial', () => {
      const original = buildImperialInput();
      const metricInput = service.convertStoredInput(original, 'Imperial', 'Metric');
      expect(metricInput.motorPower).toBeCloseTo(7.457, 3);
      const imperialAgain = service.convertStoredInput(metricInput, 'Metric', 'Imperial');
      expect(imperialAgain.motorPower).toBeCloseTo(original.motorPower, 2);
    });

    it('does not drift over repeated units changes', () => {
      let input = buildImperialInput();
      for (let i = 0; i < 5; i++) {
        input = service.convertStoredInput(service.convertStoredInput(input, 'Imperial', 'Metric'), 'Metric', 'Imperial');
      }
      expect(input.purgeFlowRate).toBeCloseTo(100, 1);
      expect(input.motorPower).toBeCloseTo(10, 1);
    });

    it('shows the same water removed mass in both unit systems', () => {
      const imperialDisplay = service.convertOutputForDisplay(buildImperialOutput(), imperial);
      const metricDisplay = service.convertOutputForDisplay(buildImperialOutput(), metric);
      const metricMassAsLbPerHr = convertUnitsService.convertValue(metricDisplay.waterRemoved, 'kg', 'lb');
      expect(metricMassAsLbPerHr).toBeCloseTo(imperialDisplay.waterRemoved, 6);
    });

    it('shows the same water removed volume in both unit systems', () => {
      const imperialDisplay = service.convertOutputForDisplay(buildImperialOutput(), imperial);
      const metricDisplay = service.convertOutputForDisplay(buildImperialOutput(), metric);
      const metricVolumeAsGalPerHr = convertUnitsService.convertValue(metricDisplay.waterRemovedVolume, 'L', 'gal');
      expect(metricVolumeAsGalPerHr).toBeCloseTo(imperialDisplay.waterRemovedVolume, 6);
    });

    it('keeps water removed mass and volume consistent with the density of water in both unit systems', () => {
      const imperialDisplay = service.convertOutputForDisplay(buildImperialOutput(), imperial);
      const metricDisplay = service.convertOutputForDisplay(buildImperialOutput(), metric);
      expect(imperialDisplay.waterRemoved / imperialDisplay.waterRemovedVolume).toBeCloseTo(8.345, 6);
      // 8.345 lb/gal is about 1.0 kg/L
      expect(metricDisplay.waterRemoved / metricDisplay.waterRemovedVolume).toBeCloseTo(1.0, 2);
    });
  });

  describe('calculate pipeline round trip', () => {
    let dryerService: CompressedAirDryerService;
    let convertUnitsService: ConvertUnitsService;
    let suiteInputs: Array<DryerOperatingCostInput>;

    // Deterministic stand-in for the WASM Suite: echoes the purge flow and motor power it receives
    // and derives water removed from inlet flow, all in the Suite's imperial contract.
    const fakeSuite = {
      dryerOperatingCost: (input: DryerOperatingCostInput): DryerOperatingCostOutput => {
        suiteInputs.push(input);
        return {
          waterRemoved: input.flowRate * 0.01,
          totalCostPerYear: 1000,
          heaterPower: input.heaterPower,
          heatingHoursPerDay: input.heatingHoursPerDay,
          purgeRate: input.purgeRate,
          designDDCPercentage: input.designDDCPercentage,
          purgeFlowRate: input.purgeFlowRate,
          motorPower: input.motorPower,
          regenerationCycleLength: input.regenerationCycleLength,
        };
      }
    };

    beforeEach(() => {
      suiteInputs = [];
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          CompressedAirDryerService,
          ConvertCompressedAirDryerService,
          ConvertUnitsService,
          { provide: CompressedAirDryersSuiteApiService, useValue: fakeSuite },
        ]
      });
      dryerService = TestBed.inject(CompressedAirDryerService);
      service = TestBed.inject(ConvertCompressedAirDryerService);
      convertUnitsService = TestBed.inject(ConvertUnitsService);
    });

    function buildImperialEntry(): DryerOperatingCostInput {
      return { ...buildMetricInput(), flowRate: 1000, pressure: 100, temperature: 75, costOfCompressedAir: 0.25, costOfCoolingWater: 0.5, purgeFlowRate: 100, motorPower: 10 };
    }

    it('sends the Suite equivalent imperial values for Imperial and Metric entries', () => {
      const imperialInput = buildImperialEntry();
      const metricInput = service.convertStoredInput(imperialInput, 'Imperial', 'Metric');

      dryerService.calculate(imperialInput, imperial);
      dryerService.calculate(metricInput, metric);

      const [fromImperial, fromMetric] = suiteInputs;
      expect(fromMetric.purgeFlowRate).toBeCloseTo(fromImperial.purgeFlowRate, 1);
      expect(fromMetric.motorPower).toBeCloseTo(fromImperial.motorPower, 2);
      expect(fromMetric.flowRate).toBeCloseTo(fromImperial.flowRate, 0);
    });

    it('returns Metric results that convert back to the Imperial results', () => {
      const imperialInput = buildImperialEntry();
      const metricInput = service.convertStoredInput(imperialInput, 'Imperial', 'Metric');

      const imperialResult = dryerService.calculate(imperialInput, imperial);
      const metricResult = dryerService.calculate(metricInput, metric);

      expect(metricResult.purgeFlowRate).toBeCloseTo(metricInput.purgeFlowRate, 2);
      expect(metricResult.motorPower).toBeCloseTo(metricInput.motorPower, 2);
      expect(convertUnitsService.convertValue(metricResult.purgeFlowRate, 'm3/min', 'ft3/min')).toBeCloseTo(imperialResult.purgeFlowRate, 1);
      expect(convertUnitsService.convertValue(metricResult.motorPower, 'kW', 'hp')).toBeCloseTo(imperialResult.motorPower, 2);
      expect(convertUnitsService.convertValue(metricResult.waterRemoved, 'kg', 'lb')).toBeCloseTo(imperialResult.waterRemoved, 1);
      expect(convertUnitsService.convertValue(metricResult.waterRemovedVolume, 'L', 'gal')).toBeCloseTo(imperialResult.waterRemovedVolume, 1);
    });

    it('returns an empty output without calling the Suite for invalid inputs', () => {
      const result = dryerService.calculate({ ...buildImperialEntry(), annualOperatingHours: null }, imperial);
      expect(suiteInputs.length).toBe(0);
      expect(result).toEqual(dryerService.getEmptyOutput());
    });

    it('treats a blank direct purge flow as invalid', () => {
      dryerService.calculate({ ...buildImperialEntry(), purgeFlowRate: null }, imperial);
      expect(suiteInputs.length).toBe(0);
    });

    it('requires a purge rate greater than 0 for dryer types that purge', () => {
      const percentMode = { ...buildImperialEntry(), purgeInputMode: PurgeInputMode.PercentOfDryerCapacity, purgeFlowRate: 0 };
      dryerService.calculate({ ...percentMode, purgeRate: 0 }, imperial);
      expect(suiteInputs.length).toBe(0);
      dryerService.calculate({ ...percentMode, purgeRate: 7 }, imperial);
      expect(suiteInputs.length).toBe(1);
    });

    it('does not require a purge rate for dryer types without purge', () => {
      dryerService.calculate({ ...buildImperialEntry(), dryerType: DryerType.BlowerPurgeWithoutSweep, purgeRate: 0, purgeFlowRate: 0 }, imperial);
      expect(suiteInputs.length).toBe(1);
    });

    it('uses 8736 annual operating hours for the example', () => {
      expect(dryerService.generateExample(imperial).annualOperatingHours).toBe(8736);
    });

    it('keeps a blank direct purge flow blank through a units change', () => {
      const converted = service.convertStoredInput({ ...buildImperialEntry(), purgeFlowRate: null }, 'Imperial', 'Metric');
      expect(converted.purgeFlowRate).toBeNull();
    });
  });
});
