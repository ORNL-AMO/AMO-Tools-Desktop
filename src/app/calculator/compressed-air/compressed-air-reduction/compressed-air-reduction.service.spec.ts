import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CompressedAirReductionService } from './compressed-air-reduction.service';
import { ConvertCompressedAirReductionService } from './convert-compressed-air-reduction.service';
import { StandaloneService } from '../../standalone.service';
import { CompressedAirReductionData, CompressedAirReductionResult } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';

describe('CompressedAirReductionService', () => {
  let service: CompressedAirReductionService;
  let convertCompressedAirReductionService: jasmine.SpyObj<ConvertCompressedAirReductionService>;
  let standaloneService: jasmine.SpyObj<StandaloneService>;
  const settings = { unitsOfMeasure: 'Imperial' } as Settings;
  const emptyResult: CompressedAirReductionResult = { energyUse: 0, energyCost: 0, flowRate: 0, singleNozzleFlowRate: 0, consumption: 0 };

  beforeEach(() => {
    convertCompressedAirReductionService = jasmine.createSpyObj('ConvertCompressedAirReductionService', [
      'convertInputs',
      'convertResults',
      'convertDefaultData',
      'convertSpecificPowerToMetric',
      'roundVal'
    ]);
    convertCompressedAirReductionService.convertInputs.and.callFake((value: Array<CompressedAirReductionData>) => value);
    convertCompressedAirReductionService.convertResults.and.callFake((value: CompressedAirReductionResult) => value);
    convertCompressedAirReductionService.convertDefaultData.and.callFake((value: CompressedAirReductionData) => value);
    convertCompressedAirReductionService.convertSpecificPowerToMetric.and.callFake((value: number) => value);
    convertCompressedAirReductionService.roundVal.and.callFake((value: number) => value);

    standaloneService = jasmine.createSpyObj('StandaloneService', ['compressedAirReduction']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        CompressedAirReductionService,
        { provide: ConvertCompressedAirReductionService, useValue: convertCompressedAirReductionService },
        { provide: StandaloneService, useValue: standaloneService }
      ]
    });

    service = TestBed.inject(CompressedAirReductionService);
  });

  it('calculates flow rate reduction using flow meter reading and number of units', () => {
    spyOn(service, 'calculate').and.returnValue(emptyResult);
    spyOn(service, 'calculateIndividualEquipment').and.callFake((input: CompressedAirReductionData) => {
      return { ...emptyResult, flowRate: input.flowMeterMethodData.meterReading };
    });

    const baseline = [getInput('Equipment #1', 20, 1)];
    const modification = [getInput('Equipment #1', 10, 2)];
    service.calculateResults(settings, baseline, modification);
    const results = service.compressedAirResults.getValue();

    expect(results.annualFlowRateReduction).toBe(0);
  });

  it('keeps modification equipment count aligned with baseline for aggregate calculations', () => {
    let inputLengths: Array<number> = [];
    spyOn(service, 'calculate').and.callFake((input: Array<CompressedAirReductionData>) => {
      inputLengths.push(input.length);
      return emptyResult;
    });
    spyOn(service, 'calculateIndividualEquipment').and.returnValue(emptyResult);

    const baseline = [getInput('Equipment #1', 20, 1), getInput('Equipment #2', 10, 1)];
    const modification = [getInput('Equipment #1', 10, 1)];
    service.calculateResults(settings, baseline, modification);
    const results = service.compressedAirResults.getValue();

    expect(inputLengths).toEqual([2, 2]);
    expect(results.modificationResults.length).toBe(2);
  });
});

function getInput(name: string, meterReading: number, units: number): CompressedAirReductionData {
  return {
    name: name,
    hoursPerYear: 8760,
    utilityType: 1,
    utilityCost: 0.066,
    compressedAirCost: 0.12,
    electricityCost: 0.066,
    measurementMethod: 0,
    flowMeterMethodData: {
      meterReading: meterReading
    },
    bagMethodData: {
      operatingTime: 0,
      bagVolume: 0,
      bagFillTime: 0
    },
    pressureMethodData: {
      nozzleType: 0,
      numberOfNozzles: 0,
      supplyPressure: 0
    },
    otherMethodData: {
      consumption: 0
    },
    compressorElectricityData: {
      compressorControl: 8,
      compressorControlAdjustment: 25,
      compressorSpecificPowerControl: 0,
      compressorSpecificPower: 16
    },
    units: units
  };
}
