import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AirLeakFormComponent } from './air-leak-form.component';
import { AirLeakService } from '../air-leak.service';
import { AirLeakFormService } from './air-leak-form.service';
import { ConvertAirLeakService } from '../../air-leak-survey/convert-air-leak.service';
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
      firstFlowB: 1, secondFlowB: 1
    },
    orificeMethodData: {
      compressorAirTemp: 70, atmosphericPressure: 14.7, dischargeCoefficient: 0.61,
      orificeDiameter: 0.1, supplyPressure: 100, numberOfOrifices: 1
    },
    units: 1
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
        compressorSpecificPowerControl: 0, compressorSpecificPower: 16
      }
    }
  };
}

describe('AirLeakFormComponent', () => {
  let component: AirLeakFormComponent;
  let fixture: ComponentFixture<AirLeakFormComponent>;
  let airLeakServiceSpy: jasmine.SpyObj<AirLeakService>;
  let airLeakFormService: AirLeakFormService;

  let currentLeakIndex$: BehaviorSubject<number>;
  let airLeakInput$: BehaviorSubject<AirLeakSurveyInput>;

  beforeEach(async () => {
    currentLeakIndex$ = new BehaviorSubject<number>(0);
    airLeakInput$ = new BehaviorSubject<AirLeakSurveyInput>(undefined);

    airLeakServiceSpy = jasmine.createSpyObj('AirLeakService', [''], {
      currentLeakIndex: currentLeakIndex$,
      airLeakInput: airLeakInput$,
      currentField: new BehaviorSubject<string>('default')
    });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AirLeakFormComponent],
      providers: [
        AirLeakFormService,
        FormBuilder,
        { provide: AirLeakService, useValue: airLeakServiceSpy },
        { provide: ConvertAirLeakService, useValue: {} }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    airLeakFormService = TestBed.inject(AirLeakFormService);
    fixture = TestBed.createComponent(AirLeakFormComponent);
    component = fixture.componentInstance;
    component.settings = { unitsOfMeasure: 'Imperial' } as Settings;
  });

  it('builds leakForm from the active leak when airLeakInput emits', () => {
    const leak = makeLeak(LeakMeasurementMethod.Estimate);
    airLeakInput$.next(makeInput([leak]));
    fixture.detectChanges();

    expect(component.leakForm).toBeDefined();
    expect(component.leakForm.controls['name'].value).toBe('Test Leak');
    expect(component.leakForm.controls['measurementMethod'].value).toBe(LeakMeasurementMethod.Estimate);
  });

  it('rebuilds leakForm when currentLeakIndex changes to a different leak', () => {
    const leakA = makeLeak();
    leakA.name = 'Leak A';
    const leakB = makeLeak(LeakMeasurementMethod.Bag);
    leakB.name = 'Leak B';
    const input = makeInput([leakA, leakB]);

    airLeakInput$.next(input);
    fixture.detectChanges();

    currentLeakIndex$.next(1);
    fixture.detectChanges();

    expect(component.currentLeakIndex).toBe(1);
    expect(component.leakForm.controls['name'].value).toBe('Leak B');
    expect(component.leakForm.controls['measurementMethod'].value).toBe(LeakMeasurementMethod.Bag);
  });

  it('saveLeak writes the form values back through airLeakInput.next', () => {
    const leak = makeLeak();
    const input = makeInput([leak]);
    airLeakInput$.next(input);
    fixture.detectChanges();

    airLeakServiceSpy.airLeakInput.getValue = () => input;
    const nextSpy = spyOn(airLeakServiceSpy.airLeakInput, 'next');

    component.leakForm.controls['name'].setValue('Updated Name');
    component.saveLeak();

    expect(nextSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      compressedAirLeakSurveyInputVec: jasmine.arrayContaining([
        jasmine.objectContaining({ name: 'Updated Name' })
      ])
    }));
  });

  it('addLeak appends an empty leak and navigates to it', () => {
    const leak = makeLeak();
    const input = makeInput([leak]);
    airLeakInput$.next(input);
    fixture.detectChanges();

    airLeakServiceSpy.airLeakInput.getValue = () => input;
    const inputNextSpy = spyOn(airLeakServiceSpy.airLeakInput, 'next');
    const indexNextSpy = spyOn(airLeakServiceSpy.currentLeakIndex, 'next');

    component.addLeak();

    expect(inputNextSpy).toHaveBeenCalled();
    expect(indexNextSpy).toHaveBeenCalledWith(1);
  });
});
