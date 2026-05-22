import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AirLeakSurveyFormComponent } from './air-leak-survey-form.component';
import { AirLeakSurveyService } from '../air-leak-survey.service';
import { AirLeakSurveyFormService } from './air-leak-survey-form.service';
import { ConvertAirLeakService } from '../convert-air-leak.service';
import { StandaloneService } from '../../../standalone.service';
import { LeakMeasurementMethod } from '../../compressed-air-constants';
import { AirLeakSurveyData, AirLeakSurveyInput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

function makeLeak(method: number = LeakMeasurementMethod.Estimate): AirLeakSurveyData {
  return {
    selected: true,
    name: 'Test Leak',
    leakDescription: 'description',
    measurementMethod: method,
    estimateMethodData: { leakRateEstimate: 0.5 },
    bagMethodData: { operatingTime: 8760, bagVolume: 1, bagFillTime: 30, numberOfUnits: 1 },
    decibelsMethodData: {
      linePressure: 100, decibels: 80, decibelRatingA: 1, pressureA: 1,
      firstFlowA: 1, secondFlowA: 1, decibelRatingB: 1, pressureB: 1,
      firstFlowB: 1, secondFlowB: 1,
    },
    orificeMethodData: {
      compressorAirTemp: 70, atmosphericPressure: 14.7, dischargeCoefficient: 0.61,
      orificeDiameter: 0.1, supplyPressure: 100, numberOfOrifices: 1,
    },
    units: 1,
  };
}

function makeInput(leaks: AirLeakSurveyData[]): AirLeakSurveyInput {
  return {
    compressedAirLeakSurveyInputVec: leaks,
    facilityCompressorData: {
      hoursPerYear: 8760,
      utilityType: 1,
      utilityCost: 0.066,
      compressorElectricityData: {
        compressorControl: 8, compressorControlAdjustment: 25,
        compressorSpecificPowerControl: 0, compressorSpecificPower: 16,
      },
    },
  };
}

describe('AirLeakSurveyFormComponent', () => {
  let component: AirLeakSurveyFormComponent;
  let fixture: ComponentFixture<AirLeakSurveyFormComponent>;
  let surveyService: AirLeakSurveyService;

  const settings = { unitsOfMeasure: 'Imperial' } as Settings;

  beforeEach(async () => {
    const convertSpy = jasmine.createSpyObj('ConvertAirLeakService', [
      'convertInputs', 'convertCompressorSpecificPower', 'convertBagMethodResult', 'convertResult',
      'convertExample', 'convertImperialFacilityCompressorData',
    ]);
    convertSpy.convertImperialFacilityCompressorData.and.callFake((v: any) => v);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AirLeakSurveyFormComponent],
      providers: [
        AirLeakSurveyService,
        AirLeakSurveyFormService,
        { provide: ConvertAirLeakService, useValue: convertSpy },
        { provide: StandaloneService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    surveyService = TestBed.inject(AirLeakSurveyService);
    fixture = TestBed.createComponent(AirLeakSurveyFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
  });

  it('builds forms from the active leak when airLeakInput is set', () => {
    const leak = makeLeak(LeakMeasurementMethod.Estimate);
    surveyService.airLeakInput.set(makeInput([leak]));
    fixture.detectChanges();

    expect(component.leakMetaForm).toBeDefined();
    expect(component.leakMetaForm.controls.name.value).toBe('Test Leak');
    expect(component.leakMetaForm.controls.measurementMethod.value).toBe(LeakMeasurementMethod.Estimate);
  });

  it('rebuilds forms when currentLeakIndex changes to a different leak', () => {
    const leakA = { ...makeLeak(), name: 'Leak A' };
    const leakB = { ...makeLeak(LeakMeasurementMethod.Bag), name: 'Leak B' };
    surveyService.airLeakInput.set(makeInput([leakA, leakB]));
    fixture.detectChanges(); // initial effect builds forms for leakA

    surveyService.currentLeakIndex.set(1);
    fixture.detectChanges();

    expect(component.leakMetaForm.controls.name.value).toBe('Leak B');
    expect(component.leakMetaForm.controls.measurementMethod.value).toBe(LeakMeasurementMethod.Bag);
  });

  it('addLeak appends an empty leak and navigates to it', () => {
    const leak = makeLeak();
    surveyService.airLeakInput.set(makeInput([leak]));
    fixture.detectChanges();

    component.addLeak();

    expect(surveyService.airLeakInput().compressedAirLeakSurveyInputVec.length).toBe(2);
    expect(surveyService.currentLeakIndex()).toBe(1);
  });

  it('form value changes propagate back to airLeakInput', () => {
    surveyService.airLeakInput.set(makeInput([makeLeak()]));
    fixture.detectChanges(); // builds forms

    component.leakMetaForm.controls.name.setValue('Updated Name');

    expect(surveyService.airLeakInput().compressedAirLeakSurveyInputVec[0].name).toBe('Updated Name');
  });
});
