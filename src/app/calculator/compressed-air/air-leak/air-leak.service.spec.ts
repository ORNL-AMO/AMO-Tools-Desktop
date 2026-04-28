import { LeakMeasurementMethod, exampleLeakInputs } from '../compressed-air-constants';
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
    convertAirleakService = jasmine.createSpyObj('ConvertAirLeakService', [
      'convertInputs', 'convertCompressorSpecificPower', 'convertBagMethodResult', 'convertResult', 'convertExample'
    ]);
    convertAirleakService.convertCompressorSpecificPower.and.callFake((value: number) => value);
    convertAirleakService.convertBagMethodResult.and.callFake((value: AirLeakSurveyResult) => value);
    convertAirleakService.convertResult.and.callFake((value: AirLeakSurveyResult) => value);
    convertAirleakService.convertExample.and.callFake((value: AirLeakSurveyInput) => value);

    airLeakFormService = jasmine.createSpyObj('AirLeakFormService', [
      'checkValidInput', 'getEmptyAirLeakData', 'getEmptyFacilityCompressorData', 'getExampleFacilityCompressorData'
    ]);
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

  // ─── Golden output regression ────────────────────────────────────────────────
  // These tests lock in the aggregation logic, baseline/modification split, and
  // compressor-adjustment calculation against the canonical example dataset.
  // The WASM engine (StandaloneService) is mocked with fixed per-leak values;
  // what is pinned here is getResults() behavior, not the WASM calculations.
  describe('golden output — example data', () => {
    const perLeakResults: Record<string, AirLeakSurveyResult> = {
      'Bag Leak':     { totalFlowRate: 4,  annualTotalFlowRate: 400,  annualTotalElectricity: 4000,  annualTotalElectricityCost: 400  },
      'Estimate Leak':{ totalFlowRate: 1,  annualTotalFlowRate: 100,  annualTotalElectricity: 1000,  annualTotalElectricityCost: 100  },
      'Orifice Leak': { totalFlowRate: 10, annualTotalFlowRate: 1000, annualTotalElectricity: 10000, annualTotalElectricityCost: 1000 },
      'Decibel leak': { totalFlowRate: 2,  annualTotalFlowRate: 200,  annualTotalElectricity: 2000,  annualTotalElectricityCost: 200  },
    };

    // Matches AirLeakFormService.getExampleFacilityCompressorData() exactly.
    const exampleFacilityData = {
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: 0.066,
      compressorElectricityData: { compressorControl: 8, compressorControlAdjustment: 25, compressorSpecificPowerControl: 0, compressorSpecificPower: 16 }
    };

    let exampleInput: AirLeakSurveyInput;

    beforeEach(() => {
      exampleInput = {
        compressedAirLeakSurveyInputVec: JSON.parse(JSON.stringify(exampleLeakInputs)),
        facilityCompressorData: exampleFacilityData as any
      };
      airLeakFormService.checkValidInput.and.returnValue(true);
      standaloneService.airLeakSurvey.and.callFake((input: AirLeakSurveyInput) =>
        ({ ...perLeakResults[input.compressedAirLeakSurveyInputVec[0].name] })
      );
    });

    it('all leaks selected: aggregates baseline and applies compressor adjustment to savings', () => {
      const output = service.getResults(settings, exampleInput);

      // baseline is the sum of all four per-leak results
      expect(output.baselineTotal).toEqual({
        totalFlowRate: 17, annualTotalFlowRate: 1700,
        annualTotalElectricity: 17000, annualTotalElectricityCost: 1700
      });
      // all leaks selected for fixing → nothing stays in modification flow totals
      expect(output.modificationTotal.totalFlowRate).toBe(0);
      expect(output.modificationTotal.annualTotalFlowRate).toBe(0);
      // electricity overwritten: baseline − (baseline × 0.25)
      expect(output.modificationTotal.annualTotalElectricity).toBe(12750);
      expect(output.modificationTotal.annualTotalElectricityCost).toBe(1275);
      // savings electricity adjusted by compressorControlAdjustment (25%)
      expect(output.savings.totalFlowRate).toBe(17);
      expect(output.savings.annualTotalFlowRate).toBe(1700);
      expect(output.savings.annualTotalElectricity).toBe(4250);    // 17000 × 0.25
      expect(output.savings.annualTotalElectricityCost).toBe(425); // 1700  × 0.25
      // 4 individual results in example order with correct names and selected state
      expect(output.individualLeaks.length).toBe(4);
      expect(output.individualLeaks.map(l => l.name)).toEqual([
        'Bag Leak', 'Estimate Leak', 'Orifice Leak', 'Decibel leak'
      ]);
      expect(output.individualLeaks.every(l => l.selected)).toBeTrue();
    });

    it('partial fix: unselected leaks accumulate into modification total', () => {
      // Estimate Leak and Decibel leak will NOT be fixed
      exampleInput.compressedAirLeakSurveyInputVec[1].selected = false;
      exampleInput.compressedAirLeakSurveyInputVec[3].selected = false;

      const output = service.getResults(settings, exampleInput);

      // baseline unchanged
      expect(output.baselineTotal.totalFlowRate).toBe(17);
      // modification retains the two unfixed leaks' flow
      expect(output.modificationTotal.totalFlowRate).toBe(3);          // 1 + 2
      expect(output.modificationTotal.annualTotalFlowRate).toBe(300);  // 100 + 200
      // savings flow = baseline − modification
      expect(output.savings.totalFlowRate).toBe(14);
      expect(output.savings.annualTotalFlowRate).toBe(1400);
      // savings electricity adjusted by 25%: (17000 − 3000) × 0.25
      expect(output.savings.annualTotalElectricity).toBe(3500);
      expect(output.savings.annualTotalElectricityCost).toBe(350);     // (1700 − 300) × 0.25
      // modification electricity overwritten: baseline − adjusted savings
      expect(output.modificationTotal.annualTotalElectricity).toBe(13500);    // 17000 − 3500
      expect(output.modificationTotal.annualTotalElectricityCost).toBe(1350); // 1700  − 350
    });
  });

  // ─── P5 — service state and lifecycle ────────────────────────────────────────
  describe('service state and lifecycle', () => {
    it('deleteLeak removes the correct element and decrements currentLeakIndex when needed', () => {
      service.airLeakInput.next(getInput([
        getLeak('Leak A', true), getLeak('Leak B', true), getLeak('Leak C', true)
      ], 0, 0));
      service.currentLeakIndex.next(2);

      service.deleteLeak(1);

      const vec = service.airLeakInput.value.compressedAirLeakSurveyInputVec;
      expect(vec.length).toBe(2);
      expect(vec.map(l => l.name)).toEqual(['Leak A', 'Leak C']);
      // currentLeakIndex was 2, deleted index 1 → decremented to 1
      expect(service.currentLeakIndex.value).toBe(1);
    });

    it('deleteLeak resets to empty inputs when removing the only remaining leak', () => {
      const emptyLeak = getLeak('Empty Leak', true);
      airLeakFormService.getEmptyAirLeakData.and.returnValue(emptyLeak);
      airLeakFormService.getEmptyFacilityCompressorData.and.returnValue(
        getInput([emptyLeak], 0, 0).facilityCompressorData
      );
      service.airLeakInput.next(getInput([getLeak('Leak A', true)], 0, 0));

      service.deleteLeak(0);

      expect(airLeakFormService.getEmptyAirLeakData).toHaveBeenCalled();
      expect(service.currentLeakIndex.value).toBe(0);
    });

    it('copyLeak duplicates the target leak at the end with a "Copy of" prefix', () => {
      service.airLeakInput.next(getInput([getLeak('Leak A', true), getLeak('Leak B', true)], 0, 0));

      service.copyLeak(0);

      const vec = service.airLeakInput.value.compressedAirLeakSurveyInputVec;
      expect(vec.length).toBe(3);
      expect(vec[2].name).toBe('Copy of Leak A');
      expect(vec[0].name).toBe('Leak A');
      expect(vec[1].name).toBe('Leak B');
    });

    it('generateExampleData populates 4 leaks and does not convert for Imperial settings', () => {
      airLeakFormService.getExampleFacilityCompressorData.and.returnValue(
        getInput([], 1, 25).facilityCompressorData
      );

      service.generateExampleData(settings);

      expect(service.airLeakInput.value.compressedAirLeakSurveyInputVec.length).toBe(4);
      expect(service.currentLeakIndex.value).toBe(0);
      expect(convertAirleakService.convertExample).not.toHaveBeenCalled();
    });

    it('generateExampleData calls convertExample for Metric settings', () => {
      airLeakFormService.getExampleFacilityCompressorData.and.returnValue(
        getInput([], 1, 25).facilityCompressorData
      );

      service.generateExampleData({ unitsOfMeasure: 'Metric' } as Settings);

      expect(convertAirleakService.convertExample).toHaveBeenCalled();
    });

    it('getResults with an empty leaks array returns zero totals without calling the engine', () => {
      airLeakFormService.checkValidInput.and.returnValue(true);

      const output = service.getResults(settings, getInput([], 0, 0));

      expect(output.baselineTotal).toEqual(emptyResult);
      expect(output.savings).toEqual(emptyResult);
      expect(standaloneService.airLeakSurvey).not.toHaveBeenCalled();
    });

    it('setLeakForModification updates the selected state on the correct leak', () => {
      service.airLeakInput.next(getInput([getLeak('Leak A', false)], 0, 0));

      service.setLeakForModification(0, true);

      expect(service.airLeakInput.value.compressedAirLeakSurveyInputVec[0].selected).toBeTrue();
    });
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
      linePressure: 1, decibels: 1, decibelRatingA: 1, pressureA: 1,
      firstFlowA: 1, secondFlowA: 1, decibelRatingB: 1, pressureB: 1,
      firstFlowB: 1, secondFlowB: 1
    },
    orificeMethodData: {
      compressorAirTemp: 1, atmosphericPressure: 1, dischargeCoefficient: 1,
      orificeDiameter: 1, supplyPressure: 1, numberOfOrifices: 1
    },
    units: 1
  };
}
