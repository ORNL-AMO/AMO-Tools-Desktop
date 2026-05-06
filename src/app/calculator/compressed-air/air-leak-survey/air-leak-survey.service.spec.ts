import { TestBed } from '@angular/core/testing';
import { AirLeakSurveyService } from './air-leak-survey.service';
import { ConvertAirLeakService } from '../air-leak/convert-air-leak.service';
import { StandaloneService } from '../../standalone.service';
import { AirLeakSurveyFormService } from './air-leak-survey-form/air-leak-survey-form.service';
import { Settings } from '../../../shared/models/settings';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyResult } from '../../../shared/models/standalone';
import { LeakMeasurementMethod } from '../compressed-air-constants';

describe('AirLeakSurveyService', () => {
  let service: AirLeakSurveyService;
  let convertAirleakService: jasmine.SpyObj<ConvertAirLeakService>;
  let standaloneService: jasmine.SpyObj<StandaloneService>;

  beforeEach(() => {
    convertAirleakService = jasmine.createSpyObj('ConvertAirLeakService', ['convertInputs', 'convertCompressorSpecificPower', 'convertBagMethodResult', 'convertResult']);
    convertAirleakService.convertCompressorSpecificPower.and.callFake((value: number) => value);
    convertAirleakService.convertBagMethodResult.and.callFake((value: AirLeakSurveyResult) => value);
    convertAirleakService.convertResult.and.callFake((value: AirLeakSurveyResult) => value);

    standaloneService = jasmine.createSpyObj('StandaloneService', ['airLeakSurvey']);

    TestBed.configureTestingModule({
      providers: [
        AirLeakSurveyService,
        { provide: ConvertAirLeakService, useValue: convertAirleakService },
        { provide: StandaloneService, useValue: standaloneService },
        {
          provide: AirLeakSurveyFormService,
          useValue: jasmine.createSpyObj('AirLeakSurveyFormService', ['getEmptyAirLeakData'])
        }
      ]
    });

    service = TestBed.inject(AirLeakSurveyService);
  });

  it('returns empty output if settings were not initialized', () => {
    service.input.set(getInput([getLeak('Leak A', true)], 1, 25));
    const output = service.output();

    expect(output.baselineTotal).toEqual({ totalFlowRate: 0, annualTotalFlowRate: 0, annualTotalElectricity: 0, annualTotalElectricityCost: 0 });
    expect(output.modificationTotal).toEqual({ totalFlowRate: 0, annualTotalFlowRate: 0, annualTotalElectricity: 0, annualTotalElectricityCost: 0 });
    expect(output.savings).toEqual({ totalFlowRate: 0, annualTotalFlowRate: 0, annualTotalElectricity: 0, annualTotalElectricityCost: 0 });
  });

  it('preserves 0 compressor-control adjustment in electric path', () => {
    service.settings = { unitsOfMeasure: 'Imperial' } as Settings;
    standaloneService.airLeakSurvey.and.returnValue({ totalFlowRate: 4, annualTotalFlowRate: 40, annualTotalElectricity: 800, annualTotalElectricityCost: 80 });

    const output = service.getResults({ unitsOfMeasure: 'Imperial' } as Settings, getInput([getLeak('Leak A', true)], 1, 0));

    expect(output.savings.annualTotalElectricity).toBe(0);
    expect(output.savings.annualTotalElectricityCost).toBe(0);
    expect(output.modificationTotal.annualTotalElectricity).toBe(800);
    expect(output.modificationTotal.annualTotalElectricityCost).toBe(80);
  });

  it('keeps baseline/modification/savings parity for valid standalone input', () => {
    service.settings = { unitsOfMeasure: 'Imperial' } as Settings;
    standaloneService.airLeakSurvey.and.callFake((inputObj: AirLeakSurveyInput) => {
      const leakName = inputObj.compressedAirLeakSurveyInputVec[0].name;
      if (leakName === 'Leak A') {
        return { totalFlowRate: 10, annualTotalFlowRate: 100, annualTotalElectricity: 1000, annualTotalElectricityCost: 100 };
      }
      return { totalFlowRate: 5, annualTotalFlowRate: 50, annualTotalElectricity: 500, annualTotalElectricityCost: 50 };
    });

    const output = service.getResults({ unitsOfMeasure: 'Imperial' } as Settings, getInput([getLeak('Leak A', true), getLeak('Leak B', false)], 0, 25));

    expect(output.baselineTotal).toEqual({ totalFlowRate: 15, annualTotalFlowRate: 150, annualTotalElectricity: 1500, annualTotalElectricityCost: 150 });
    expect(output.modificationTotal).toEqual({ totalFlowRate: 5, annualTotalFlowRate: 50, annualTotalElectricity: 500, annualTotalElectricityCost: 50 });
    expect(output.savings).toEqual({ totalFlowRate: 10, annualTotalFlowRate: 100, annualTotalElectricity: 1000, annualTotalElectricityCost: 100 });
  });
});

function getInput(leaks: Array<AirLeakSurveyData>, utilityType: number, compressorControlAdjustment: number): AirLeakSurveyInput {
  return {
    compressedAirLeakSurveyInputVec: leaks,
    facilityCompressorData: {
      hoursPerYear: 8760,
      utilityType: utilityType,
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: 8,
        compressorControlAdjustment: compressorControlAdjustment,
        compressorSpecificPowerControl: 0,
        compressorSpecificPower: 16
      }
    }
  };
}

function getLeak(name: string, selected: boolean): AirLeakSurveyData {
  return {
    selected: selected,
    name: name,
    leakDescription: `${name} description`,
    measurementMethod: LeakMeasurementMethod.Estimate,
    estimateMethodData: { leakRateEstimate: 1 },
    bagMethodData: { operatingTime: 1, bagVolume: 1, bagFillTime: 1, numberOfUnits: 1 },
    decibelsMethodData: {
      linePressure: 1,
      decibels: 1,
      decibelRatingA: 1,
      pressureA: 1,
      firstFlowA: 1,
      secondFlowA: 1,
      decibelRatingB: 1,
      pressureB: 1,
      firstFlowB: 1,
      secondFlowB: 1
    },
    orificeMethodData: {
      compressorAirTemp: 1,
      atmosphericPressure: 1,
      dischargeCoefficient: 1,
      orificeDiameter: 1,
      supplyPressure: 1,
      numberOfOrifices: 1
    },
    units: 1
  };
}
