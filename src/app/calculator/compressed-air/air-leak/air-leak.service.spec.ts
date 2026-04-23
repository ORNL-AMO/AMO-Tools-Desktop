import { LeakMeasurementMethod } from '../compressed-air-constants';
import { AirLeakService } from './air-leak.service';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyResult } from '../../../shared/models/standalone';
import { Settings } from '../../../shared/models/settings';

describe('AirLeakService', () => {
  let service: AirLeakService;
  let convertAirleakService: any;
  let airLeakFormService: any;
  let standaloneService: any;
  const settings = { unitsOfMeasure: 'Imperial' } as Settings;
  const emptyResult = { totalFlowRate: 0, annualTotalFlowRate: 0, annualTotalElectricity: 0, annualTotalElectricityCost: 0 };

  beforeEach(() => {
    convertAirleakService = jasmine.createSpyObj('ConvertAirLeakService', ['convertInputs', 'convertCompressorSpecificPower', 'convertBagMethodResult', 'convertResult']);
    convertAirleakService.convertCompressorSpecificPower.and.callFake((value: number) => value);
    convertAirleakService.convertBagMethodResult.and.callFake((value: AirLeakSurveyResult) => value);
    convertAirleakService.convertResult.and.callFake((value: AirLeakSurveyResult) => value);

    airLeakFormService = jasmine.createSpyObj('AirLeakFormService', ['checkValidInput']);
    standaloneService = jasmine.createSpyObj('StandaloneService', ['airLeakSurvey']);
    service = new AirLeakService(convertAirleakService, airLeakFormService, standaloneService);
  });

  it('returns default empty output and does not calculate for invalid input', () => {
    airLeakFormService.checkValidInput.and.returnValue(false);
    const output = service.getResults(settings, getInput([getLeak('Leak A', true)], 1, 25));

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(output.modificationTotal).toEqual(emptyResult);
    expect(output.savings).toEqual(emptyResult);
    expect(standaloneService.airLeakSurvey).not.toHaveBeenCalled();
    expect(convertAirleakService.convertInputs).not.toHaveBeenCalled();
  });

  it('keeps standalone baseline/modification/savings calculations for valid input', () => {
    airLeakFormService.checkValidInput.and.returnValue(true);
    standaloneService.airLeakSurvey.and.callFake((inputObj: AirLeakSurveyInput) => {
      const leakName = inputObj.compressedAirLeakSurveyInputVec[0].name;
      if (leakName === 'Leak A') {
        return { totalFlowRate: 10, annualTotalFlowRate: 100, annualTotalElectricity: 1000, annualTotalElectricityCost: 100 };
      }
      return { totalFlowRate: 5, annualTotalFlowRate: 50, annualTotalElectricity: 500, annualTotalElectricityCost: 50 };
    });

    const output = service.getResults(settings, getInput([getLeak('Leak A', true), getLeak('Leak B', false)], 0, 25));

    expect(output.baselineTotal).toEqual({ totalFlowRate: 15, annualTotalFlowRate: 150, annualTotalElectricity: 1500, annualTotalElectricityCost: 150 });
    expect(output.modificationTotal).toEqual({ totalFlowRate: 5, annualTotalFlowRate: 50, annualTotalElectricity: 500, annualTotalElectricityCost: 50 });
    expect(output.savings).toEqual({ totalFlowRate: 10, annualTotalFlowRate: 100, annualTotalElectricity: 1000, annualTotalElectricityCost: 100 });
    expect(output.individualLeaks.length).toBe(2);
  });

  it('applies compressor-control adjustment for electric utility path', () => {
    airLeakFormService.checkValidInput.and.returnValue(true);
    standaloneService.airLeakSurvey.and.returnValue({ totalFlowRate: 4, annualTotalFlowRate: 40, annualTotalElectricity: 800, annualTotalElectricityCost: 80 });

    const output = service.getResults(settings, getInput([getLeak('Leak A', true)], 1, 50));

    expect(output.savings.annualTotalElectricity).toBe(400);
    expect(output.savings.annualTotalElectricityCost).toBe(40);
    expect(output.modificationTotal.annualTotalElectricity).toBe(400);
    expect(output.modificationTotal.annualTotalElectricityCost).toBe(40);
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
