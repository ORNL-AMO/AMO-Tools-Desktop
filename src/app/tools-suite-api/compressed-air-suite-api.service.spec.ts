import { CompressorsCalcInput, CentrifugalInput } from '../compressed-air-assessment/compressed-air-calculation.service';
import { CompressedAirSuiteApiService } from './compressed-air-suite-api.service';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import { type MeasurToolsSuite } from 'measur-tools-suite';

describe('CompressedAirSuiteApiService', () => {
  const performanceResult = {
    powerKw: 73.5,
    airflowAcfm: 412,
    powerFraction: 0.75,
    airflowFraction: 0.6
  };

  class FakeCompressor {
    static constructorArgs: number[];
    static constructorName: string;
    static lastInstance: FakeCompressor;

    electricalArgs: number[];
    deleted: boolean = false;

    constructor(name: string, args: number[]) {
      FakeCompressor.constructorName = name;
      FakeCompressor.constructorArgs = args;
      FakeCompressor.lastInstance = this;
    }

    calculateFromPowerFraction(): typeof performanceResult {
      return performanceResult;
    }

    calculateFromCapacityFraction(): typeof performanceResult {
      return performanceResult;
    }

    calculateFromMeasuredPower(): typeof performanceResult {
      return performanceResult;
    }

    calculateFromMeasuredCapacity(): typeof performanceResult {
      return performanceResult;
    }

    calculateFromElectrical(...args: number[]): typeof performanceResult {
      this.electricalArgs = args;
      return performanceResult;
    }

    delete(): void {
      this.deleted = true;
    }
  }

  function fakeConstructor(name: string): new (...args: number[]) => FakeCompressor {
    return class extends FakeCompressor {
      constructor(...args: number[]) {
        super(name, args);
      }
    };
  }

  const module = {
    CompressorControl: {
      LoadUnload: 0,
      ModulationUnload: 1,
      BlowOff: 2,
      ModulationWithoutUnload: 3,
      StartStop: 4,
      VariableDisplacementUnload: 5,
      MultiStepUnloading: 6,
      Vfd: 7
    },
    CompressorInputBasis: {
      PowerFraction: 0,
      CapacityFraction: 1,
      MeasuredPower: 2,
      MeasuredCapacity: 3,
      Electrical: 4
    },
    CompressorType: {
      Centrifugal: 0,
      Screw: 1,
      Reciprocating: 2
    },
    CompressorLubricant: {
      Injected: 0,
      Free: 1,
      None: 2
    },
    CompressorStage: {
      Single: 0,
      Two: 1,
      Multiple: 2
    },
    LoadUnloadCompressor: fakeConstructor('LoadUnloadCompressor'),
    ModulationWithUnloadCompressor: fakeConstructor('ModulationWithUnloadCompressor'),
    ModulationWithoutUnloadCompressor: fakeConstructor('ModulationWithoutUnloadCompressor'),
    StartStopCompressor: fakeConstructor('StartStopCompressor'),
    VariableFrequencyDriveCompressor: fakeConstructor('VariableFrequencyDriveCompressor'),
    CentrifugalLoadUnloadCompressor: fakeConstructor('CentrifugalLoadUnloadCompressor'),
    CentrifugalModulationUnloadCompressor: fakeConstructor('CentrifugalModulationUnloadCompressor'),
    CentrifugalBlowOffCompressor: fakeConstructor('CentrifugalBlowOffCompressor')
  } as unknown as MeasurToolsSuite;

  const helper = {
    convertNullInputValueForObjectConstructor: (value: number): number => value ?? 0,
    getControlTypeEnum: (value: number): number => value,
    getComputeFromEnum: (value: number): number => value,
    getCompressorTypeEnum: (value: number): number => value,
    getLubricantEnum: (value: number): number => value,
    getStageEnum: (value: number): number => value
  } as unknown as SuiteApiHelperService;

  const toolsSuiteApiService = { ToolsSuiteModule: module } as ToolsSuiteApiService;
  let service: CompressedAirSuiteApiService;

  beforeEach(() => {
    FakeCompressor.constructorArgs = undefined;
    FakeCompressor.constructorName = undefined;
    FakeCompressor.lastInstance = undefined;
    service = new CompressedAirSuiteApiService(helper, toolsSuiteApiService);
  });

  function compressorInput(overrides: Partial<CompressorsCalcInput> = {}): CompressorsCalcInput {
    return {
      compressorType: 1,
      controlType: 4,
      computeFrom: 1,
      computeFromVal: 0.6,
      computeFromPFVoltage: 460,
      computeFromPFAmps: 120,
      powerAtFullLoad: 100,
      capacityAtFullLoad: 500,
      powerAtNoLoad: 25,
      capacityAtMaxFullFlow: 525,
      powerAtUnload: 80,
      capacityAtUnload: 350,
      lubricantType: 0,
      stageType: 0,
      powerMax: 105,
      dischargePsiFullLoad: 100,
      dischargePsiMax: 110,
      modulatingPsi: 5,
      atmosphericPsi: 14.7,
      receiverVolume: 100,
      loadFactorUnloaded: 0.25,
      powerMaxPercentage: 1.05,
      powerAtFullLoadPercentage: 1,
      unloadPointCapacity: 70,
      blowdownTime: 40,
      unloadSumpPressure: 15,
      noLoadPowerFM: 0.65,
      pressureAtUnload: 105,
      midTurndownPower: 75,
      midTurndownAirflow: 300,
      turndownPower: 45,
      turndownAirflow: 150,
      ...overrides
    } as CompressorsCalcInput;
  }

  function centrifugalInput(overrides: Partial<CentrifugalInput> = {}): CentrifugalInput {
    return {
      compressorType: 0,
      controlType: 0,
      computeFrom: 1,
      computeFromVal: 0.6,
      computeFromPFVoltage: 460,
      computeFromPFAmps: 120,
      powerAtFullLoad: 452.3,
      capacityAtFullLoad: 3138,
      powerAtBlowOff: 370.9,
      surgeFlow: 2510,
      percentageBlowOff: 0.5,
      powerAtNoLoad: 71.3,
      capacityAtMaxFullFlow: 3005,
      powerAtUnload: 411.9,
      capacityAtUnload: 2731,
      ...overrides
    } as CentrifugalInput;
  }

  [
    { name: 'screw', compressorType: 1 },
    { name: 'reciprocating', compressorType: 2 }
  ].forEach(testCase => {
    it(`passes the explicit ${testCase.name} compressor type to the start/stop constructor`, () => {
      service.compressorCalc(compressorInput({ compressorType: testCase.compressorType }));

      expect(FakeCompressor.constructorName).toBe('StartStopCompressor');
      expect(FakeCompressor.constructorArgs).toEqual([100, 500, 1.05, 1, testCase.compressorType]);
    });
  });

  it('forwards electrical inputs in voltage, current, power-factor order and treats results as values', () => {
    const result = service.compressorCalc(compressorInput({
      computeFrom: 4,
      computeFromVal: 0.83,
      computeFromPFVoltage: 480,
      computeFromPFAmps: 95
    }));

    expect(FakeCompressor.lastInstance.electricalArgs).toEqual([480, 95, 0.83]);
    expect(result).toEqual({
      powerCalculated: 73.5,
      capacityCalculated: 412,
      percentagePower: 0.75,
      percentageCapacity: 0.6
    });
    expect(FakeCompressor.lastInstance.deleted).toBeTrue();
  });

  it('retains the long load/unload constructor with explicit no-load power', () => {
    service.compressorCalc(compressorInput({ controlType: 0, powerAtNoLoad: 27 }));

    expect(FakeCompressor.constructorName).toBe('LoadUnloadCompressor');
    expect(FakeCompressor.constructorArgs.length).toBe(17);
    expect(FakeCompressor.constructorArgs[12]).toBe(27);
  });

  [
    { controlType: 0, constructorName: 'LoadUnloadCompressor' },
    { controlType: 1, constructorName: 'ModulationWithUnloadCompressor' },
    { controlType: 3, constructorName: 'ModulationWithoutUnloadCompressor' },
    { controlType: 4, constructorName: 'StartStopCompressor' },
    { controlType: 5, constructorName: 'ModulationWithUnloadCompressor' },
    { controlType: 6, constructorName: 'LoadUnloadCompressor' },
    { controlType: 7, constructorName: 'VariableFrequencyDriveCompressor' }
  ].forEach(testCase => {
    it(`routes control type ${testCase.controlType} to ${testCase.constructorName}`, () => {
      service.compressorCalc(compressorInput({ controlType: testCase.controlType }));
      expect(FakeCompressor.constructorName).toBe(testCase.constructorName);
    });
  });

  [
    { controlType: 0, constructorName: 'CentrifugalLoadUnloadCompressor' },
    { controlType: 1, constructorName: 'CentrifugalModulationUnloadCompressor' },
    { controlType: 2, constructorName: 'CentrifugalBlowOffCompressor' }
  ].forEach(testCase => {
    it(`routes centrifugal control type ${testCase.controlType} to ${testCase.constructorName}`, () => {
      service.compressorCalcCentrifugal(centrifugalInput({ controlType: testCase.controlType }));
      expect(FakeCompressor.constructorName).toBe(testCase.constructorName);
    });
  });
});
