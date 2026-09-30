import { SSMTInputs } from '../shared/models/steam/ssmt';
import { SSMTOutput } from '../shared/models/steam/steam-outputs';
import { SuiteApiHelperService } from './suite-api-helper.service';
import { SteamSuiteApiService } from './steam-suite-api.service';
import { ToolsSuiteApiService } from './tools-suite-api.service';
import createModule, { type MeasurToolsSuite } from 'measur-tools-suite';

describe('SteamSuiteApiService steam modeler boiler input', () => {
  let boilerInputConstructor: jasmine.Spy;
  let service: SteamSuiteApiService;

  const deletable = () => ({ delete: jasmine.createSpy('delete') });

  beforeEach(() => {
    boilerInputConstructor = jasmine.createSpy('BoilerInput');
    const BoilerInputMock = function (...args: Array<unknown>) {
      boilerInputConstructor(...args);
      return deletable();
    };
    const StandardConstructor = function () {
      return deletable();
    };
    const wasmOutput = deletable();
    const steamModeler = {
      model: jasmine.createSpy('model').and.returnValue(wasmOutput),
      delete: jasmine.createSpy('delete')
    };
    const SteamModelerMock = function () {
      return steamModeler;
    };
    const toolsSuiteApiService = {
      ToolsSuiteModule: {
        BoilerInput: BoilerInputMock,
        OperationsInput: StandardConstructor,
        HeaderInput: StandardConstructor,
        CondensingTurbine: StandardConstructor,
        PressureTurbine: StandardConstructor,
        TurbineInput: StandardConstructor,
        SteamModelerInput: StandardConstructor,
        SteamModeler: SteamModelerMock
      }
    } as unknown as ToolsSuiteApiService;
    const suiteApiHelperService = {
      convertNullInputsForObjectConstructor: jasmine.createSpy('convertNullInputsForObjectConstructor'),
      getCondensingTurbineOperation: jasmine.createSpy('getCondensingTurbineOperation').and.callFake(value => value),
      getPressureTurbineOperation: jasmine.createSpy('getPressureTurbineOperation').and.callFake(value => value)
    } as unknown as SuiteApiHelperService;

    service = new SteamSuiteApiService(suiteApiHelperService, toolsSuiteApiService);
    spyOn(service, 'getHighPressureHeaderObject').and.returnValue(deletable() as never);
    spyOn(service, 'getSSMTOutputFromWASMOutput').and.returnValue({} as SSMTOutput);
  });

  function buildInput(sendBlowdownToDeaerator?: boolean): SSMTInputs {
    const unusedPressureTurbine = {
      isentropicEfficiency: 0,
      generationEfficiency: 0,
      operationType: 0,
      operationValue1: 0,
      operationValue2: 0,
      useTurbine: false
    };

    return {
      boilerInput: {
        fuelType: 1,
        fuel: 1,
        combustionEfficiency: 85,
        blowdownRate: 5,
        blowdownFlashed: true,
        preheatMakeupWater: false,
        steamQuality: 0,
        saturatedPressure: 1,
        pressureOrTemperature: 0,
        steamTemperature: 450,
        deaeratorVentRate: 2,
        deaeratorPressure: 1,
        approachTemperature: 10,
        sendBlowdownToDeaerator
      },
      headerInput: {
        numberOfHeaders: 1,
        highPressureHeader: {
          pressure: 1,
          processSteamUsage: 1,
          condensationRecoveryRate: 50,
          heatLoss: 0,
          condensateReturnTemperature: 300,
          flashCondensateReturn: false
        }
      },
      operationsInput: {
        sitePowerImport: 0,
        makeUpWaterTemperature: 300,
        operatingHoursPerYear: 8760,
        fuelCosts: 1,
        electricityCosts: 1,
        makeUpWaterCosts: 1
      },
      turbineInput: {
        condensingTurbine: {
          isentropicEfficiency: 0,
          generationEfficiency: 0,
          condenserPressure: 0,
          operationType: 0,
          operationValue: 0,
          useTurbine: false
        },
        highToLowTurbine: { ...unusedPressureTurbine },
        highToMediumTurbine: { ...unusedPressureTurbine },
        mediumToLowTurbine: { ...unusedPressureTurbine }
      },
      co2SavingsData: undefined,
      isBaselineCalc: true,
      baselinePowerDemand: 0
    };
  }

  it('passes the enabled blowdown route to the typed suite constructor', () => {
    service.steamModeler(buildInput(true));

    expect(boilerInputConstructor.calls.mostRecent().args[10]).toBeTrue();
  });

  it('passes false for legacy inputs with no saved blowdown route', () => {
    service.steamModeler(buildInput());

    expect(boilerInputConstructor.calls.mostRecent().args[10]).toBeFalse();
  });
});

describe('SteamSuiteApiService blowdown routing integration', () => {
  let service: SteamSuiteApiService;

  beforeAll(async () => {
    const toolsSuiteApiService = {
      ToolsSuiteModule: await createModule({
        locateFile: () => '/base/node_modules/measur-tools-suite/bin/client.wasm'
      }) as MeasurToolsSuite
    } as unknown as ToolsSuiteApiService;
    const suiteApiHelperService = new SuiteApiHelperService(toolsSuiteApiService);
    service = new SteamSuiteApiService(suiteApiHelperService, toolsSuiteApiService);
  });

  function buildModelInput(sendBlowdownToDeaerator: boolean): SSMTInputs {
    const unusedPressureTurbine = {
      isentropicEfficiency: 0,
      generationEfficiency: 0,
      operationType: 0,
      operationValue1: 0,
      operationValue2: 0,
      useTurbine: false
    };

    return {
      boilerInput: {
        fuelType: 1,
        fuel: 1,
        combustionEfficiency: 85,
        blowdownRate: 5,
        blowdownFlashed: true,
        preheatMakeupWater: false,
        steamQuality: 0,
        saturatedPressure: 1.6528,
        pressureOrTemperature: 0,
        steamTemperature: 476.1,
        deaeratorVentRate: 2,
        deaeratorPressure: 0.1358,
        approachTemperature: 0,
        sendBlowdownToDeaerator
      },
      headerInput: {
        numberOfHeaders: 2,
        highPressureHeader: {
          pressure: 1.6528,
          processSteamUsage: 4535.9,
          condensationRecoveryRate: 70,
          heatLoss: 0.1,
          condensateReturnTemperature: 380.4,
          flashCondensateReturn: false
        },
        lowPressureHeader: {
          pressure: 0.2393,
          processSteamUsage: 3175.1,
          condensationRecoveryRate: 70,
          heatLoss: 0.1,
          flashCondensateIntoHeader: false,
          desuperheatSteamIntoNextHighest: false,
          desuperheatSteamTemperature: 0,
          useBaselineProcessSteamUsage: false
        }
      },
      operationsInput: {
        sitePowerImport: 0,
        makeUpWaterTemperature: 283.15,
        operatingHoursPerYear: 8760,
        fuelCosts: 4,
        electricityCosts: 0.05,
        makeUpWaterCosts: 0.03
      },
      turbineInput: {
        condensingTurbine: {
          isentropicEfficiency: 0,
          generationEfficiency: 0,
          condenserPressure: 0,
          operationType: 0,
          operationValue: 0,
          useTurbine: false
        },
        highToLowTurbine: { ...unusedPressureTurbine },
        highToMediumTurbine: { ...unusedPressureTurbine },
        mediumToLowTurbine: { ...unusedPressureTurbine }
      },
      co2SavingsData: undefined,
      isBaselineCalc: true,
      baselinePowerDemand: 0
    };
  }

  it('changes the deaerator calculation when flashed blowdown is routed to it', () => {
    const legacyOutput = service.steamModeler(buildModelInput(false));
    const routedOutput = service.steamModeler(buildModelInput(true));

    expect(routedOutput.deaeratorOutput.inletSteamMassFlow)
      .not.toEqual(legacyOutput.deaeratorOutput.inletSteamMassFlow);
  });
});
