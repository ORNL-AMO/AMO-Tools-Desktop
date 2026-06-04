import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AirLeakSurveyService } from './air-leak-survey.service';
import { ConvertAirLeakService } from './convert-air-leak.service';
import { StandaloneService } from '../../standalone.service';
import { AirLeakSurveyFormService } from './air-leak-survey-form/air-leak-survey-form.service';
import { Settings } from '../../../shared/models/settings';
import { AirLeakSurveyData, AirLeakSurveyInput, AirLeakSurveyResult } from '../../../shared/models/standalone';
import { LeakMeasurementMethod, exampleLeakInputs } from '../compressed-air-constants';

describe('AirLeakSurveyService', () => {
  let service: AirLeakSurveyService;
  let convertAirleakService: jasmine.SpyObj<ConvertAirLeakService>;
  let standaloneService: jasmine.SpyObj<StandaloneService>;
  const settings = { unitsOfMeasure: 'Imperial' } as Settings;
  const emptyResult = { totalFlowRate: 0, annualTotalFlowRate: 0, annualTotalElectricity: 0, annualTotalElectricityCost: 0 };

  beforeEach(() => {
    convertAirleakService = jasmine.createSpyObj('ConvertAirLeakService', [
      'convertInputs', 'convertCompressorSpecificPower', 'convertBagMethodResult', 'convertResult',
      'convertExample', 'convertImperialFacilityCompressorData',
    ]);
    convertAirleakService.convertCompressorSpecificPower.and.callFake((value: number) => value);
    convertAirleakService.convertBagMethodResult.and.callFake((value: AirLeakSurveyResult) => value);
    convertAirleakService.convertResult.and.callFake((value: AirLeakSurveyResult) => value);
    convertAirleakService.convertExample.and.callFake((value: AirLeakSurveyInput) => value);
    convertAirleakService.convertImperialFacilityCompressorData.and.callFake((value: any) => value);

    standaloneService = jasmine.createSpyObj('StandaloneService', ['airLeakSurvey']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        AirLeakSurveyService,
        AirLeakSurveyFormService,
        { provide: ConvertAirLeakService, useValue: convertAirleakService },
        { provide: StandaloneService, useValue: standaloneService },
      ]
    });

    service = TestBed.inject(AirLeakSurveyService);
  });

  it('returns empty output if settings were not initialized', () => {
    service.airLeakInput.set(getInput([getLeak('Leak A', true)], 1, 25));
    const output = service.output();

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(output.modificationTotal).toEqual(emptyResult);
    expect(output.savings).toEqual(emptyResult);
  });

  it('returns empty output when facility form is invalid', () => {
    service.settings = settings;
    const invalid = getInput([getLeak('Leak A', true)], 1, 25);
    (invalid.facilityCompressorData.compressorElectricityData as any).compressorControl = null;
    service.airLeakInput.set(invalid);

    const output = service.output();

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(standaloneService.airLeakSurvey).not.toHaveBeenCalled();
  });

  it('preserves 0 compressor-control adjustment in electric path', () => {
    service.settings = settings;
    standaloneService.airLeakSurvey.and.returnValue({ totalFlowRate: 4, annualTotalFlowRate: 40, annualTotalElectricity: 800, annualTotalElectricityCost: 80 });

    const output = service.getResults(settings, getInput([getLeak('Leak A', true)], 1, 0));

    expect(output.savings.annualTotalElectricity).toBe(0);
    expect(output.savings.annualTotalElectricityCost).toBe(0);
    expect(output.modificationTotal.annualTotalElectricity).toBe(800);
    expect(output.modificationTotal.annualTotalElectricityCost).toBe(80);
  });

  it('applies compressor-control adjustment for electric utility path', () => {
    service.settings = settings;
    standaloneService.airLeakSurvey.and.returnValue({ totalFlowRate: 4, annualTotalFlowRate: 40, annualTotalElectricity: 800, annualTotalElectricityCost: 80 });

    const output = service.getResults(settings, getInput([getLeak('Leak A', true)], 1, 50));

    expect(output.savings.annualTotalElectricity).toBe(400);
    expect(output.savings.annualTotalElectricityCost).toBe(40);
    expect(output.modificationTotal.annualTotalElectricity).toBe(400);
    expect(output.modificationTotal.annualTotalElectricityCost).toBe(40);
  });

  it('keeps baseline/modification/savings parity for valid standalone input', () => {
    service.settings = settings;
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

  it('returns zero totals when leak array is empty', () => {
    service.settings = settings;

    const output = service.getResults(settings, getInput([], 0, 0));

    expect(output.baselineTotal).toEqual(emptyResult);
    expect(output.savings).toEqual(emptyResult);
    expect(standaloneService.airLeakSurvey).not.toHaveBeenCalled();
  });

  // ─── Golden output regression ────────────────────────────────────────────────
  // These tests lock in the aggregation logic, baseline/modification split, and
  // compressor-adjustment calculation against the canonical example dataset.
  // The WASM engine (StandaloneService) is mocked with fixed per-leak values;
  // what is pinned here is getResults() behavior, not the WASM calculations.
  describe('golden output — example data', () => {
    const perLeakResults: Record<string, AirLeakSurveyResult> = {
      'Bag Leak':      { totalFlowRate: 4,  annualTotalFlowRate: 400,  annualTotalElectricity: 4000,  annualTotalElectricityCost: 400  },
      'Estimate Leak': { totalFlowRate: 1,  annualTotalFlowRate: 100,  annualTotalElectricity: 1000,  annualTotalElectricityCost: 100  },
      'Orifice Leak':  { totalFlowRate: 10, annualTotalFlowRate: 1000, annualTotalElectricity: 10000, annualTotalElectricityCost: 1000 },
      'Decibel leak':  { totalFlowRate: 2,  annualTotalFlowRate: 200,  annualTotalElectricity: 2000,  annualTotalElectricityCost: 200  },
    };

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
      service.settings = settings;
      standaloneService.airLeakSurvey.and.callFake((input: AirLeakSurveyInput) =>
        ({ ...perLeakResults[input.compressedAirLeakSurveyInputVec[0].name] })
      );
    });

    it('all leaks selected: aggregates baseline and applies compressor adjustment to savings', () => {
      const output = service.getResults(settings, exampleInput);

      expect(output.baselineTotal).toEqual({
        totalFlowRate: 17, annualTotalFlowRate: 1700,
        annualTotalElectricity: 17000, annualTotalElectricityCost: 1700
      });
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
      expect(output.individualLeaks.length).toBe(4);
      expect(output.individualLeaks.map(l => l.name)).toEqual([
        'Bag Leak', 'Estimate Leak', 'Orifice Leak', 'Decibel leak'
      ]);
      expect(output.individualLeaks.every(l => l.selected)).toBeTrue();
    });

    it('partial fix: unselected leaks accumulate into modification total', () => {
      exampleInput.compressedAirLeakSurveyInputVec[1].selected = false;
      exampleInput.compressedAirLeakSurveyInputVec[3].selected = false;

      const output = service.getResults(settings, exampleInput);

      expect(output.baselineTotal.totalFlowRate).toBe(17);
      expect(output.modificationTotal.totalFlowRate).toBe(3);          // 1 + 2
      expect(output.modificationTotal.annualTotalFlowRate).toBe(300);  // 100 + 200
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

  // ─── Service state and lifecycle ─────────────────────────────────────────────
  describe('service state and lifecycle', () => {
    it('deleteLeak removes the correct element and decrements currentLeakIndex when needed', () => {
      service.airLeakInput.set(getInput([
        getLeak('Leak A', true), getLeak('Leak B', true), getLeak('Leak C', true)
      ], 0, 0));
      service.currentLeakIndex.set(2);

      service.deleteLeak(1);

      const vec = service.airLeakInput().compressedAirLeakSurveyInputVec;
      expect(vec.length).toBe(2);
      expect(vec.map(l => l.name)).toEqual(['Leak A', 'Leak C']);
      // currentLeakIndex was 2, deleted index 1 → decremented to 1
      expect(service.currentLeakIndex()).toBe(1);
    });

    it('deleteLeak resets to empty inputs when removing the only remaining leak', () => {
      service.airLeakInput.set(getInput([getLeak('Leak A', true)], 0, 0));

      service.deleteLeak(0);

      const vec = service.airLeakInput().compressedAirLeakSurveyInputVec;
      expect(vec.length).toBe(1);
      expect(service.currentLeakIndex()).toBe(0);
    });

    it('copyLeak duplicates the target leak at the end with a "Copy of" prefix', () => {
      service.airLeakInput.set(getInput([getLeak('Leak A', true), getLeak('Leak B', true)], 0, 0));

      service.copyLeak(0);

      const vec = service.airLeakInput().compressedAirLeakSurveyInputVec;
      expect(vec.length).toBe(3);
      expect(vec[2].name).toBe('Copy of Leak A');
      expect(vec[0].name).toBe('Leak A');
      expect(vec[1].name).toBe('Leak B');
    });

    it('generateExampleData populates 4 leaks and does not convert for Imperial settings', () => {
      service.generateExampleData(settings);

      expect(service.airLeakInput().compressedAirLeakSurveyInputVec.length).toBe(4);
      expect(service.currentLeakIndex()).toBe(0);
      expect(convertAirleakService.convertExample).not.toHaveBeenCalled();
    });

    it('generateExampleData calls convertExample for Metric settings', () => {
      service.generateExampleData({ unitsOfMeasure: 'Metric' } as Settings);

      expect(convertAirleakService.convertExample).toHaveBeenCalled();
    });

    it('setLeakForModification updates the selected state on the correct leak', () => {
      service.airLeakInput.set(getInput([getLeak('Leak A', false)], 0, 0));

      service.setLeakForModification(0, true);

      expect(service.airLeakInput().compressedAirLeakSurveyInputVec[0].selected).toBeTrue();
    });

    it('setLeakForModificationSelectAll toggles all leaks at once', () => {
      service.airLeakInput.set(getInput([
        getLeak('Leak A', true), getLeak('Leak B', true), getLeak('Leak C', false)
      ], 0, 0));

      service.setLeakForModificationSelectAll(false);

      const vec = service.airLeakInput().compressedAirLeakSurveyInputVec;
      expect(vec.every(l => !l.selected)).toBeTrue();
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
    bagMethodData: { operatingTime: 1, bagVolume: 1, bagFillTime: 1 },
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
