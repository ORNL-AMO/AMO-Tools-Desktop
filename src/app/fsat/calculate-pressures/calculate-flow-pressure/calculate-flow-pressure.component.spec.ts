import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

import { CalculateFlowPressureComponent } from './calculate-flow-pressure.component';
import { FanAnalysisService } from '../../../calculator/fans/fan-analysis/fan-analysis.service';
import { ConvertFanAnalysisService } from '../../../calculator/fans/fan-analysis/convert-fan-analysis.service';
import { FanInfoFormService } from '../../../calculator/fans/fan-analysis/fan-analysis-form/fan-info-form/fan-info-form.service';
import { PlaneDataFormService } from '../../../calculator/fans/fan-analysis/fan-analysis-form/plane-data-form/plane-data-form.service';
import { FsatService } from '../../fsat.service';
import { FieldData, Fan203Inputs, FSAT, PlaneResults } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makePlane() {
  return { barometricPressure: 0, dryBulbTemp: 0 };
}

function makeInputData(): Fan203Inputs {
  return {
    FanRatedInfo: {},
    BaseGasDensity: {},
    FanShaftPower: {},
    PlaneData: {
      FlowTraverse: makePlane(),
      FanEvaseOrOutletFlange: makePlane(),
      FanInletFlange: makePlane(),
      InletMstPlane: makePlane(),
      OutletMstPlane: makePlane(),
      AddlTraversePlanes: [makePlane()],
    },
  } as unknown as Fan203Inputs;
}

function makeFsat(usingStaticPressure: boolean): FSAT {
  return {
    fieldData: { usingStaticPressure } as FieldData,
    baseGasDensity: { inputType: 'custom', barometricPressure: 29.92, gasDensity: 0.07 },
    fanSetup: { fanSpeed: 1780 },
    fanMotor: { motorRpm: 1785 },
  } as FSAT;
}

function makePlaneResults(): PlaneResults {
  return {
    FanInletFlange: { gasVolumeFlowRate: 1000.12345, staticPressure: -1.11111, gasTotalPressure: -0.55555, gasVelocityPressure: 0.44444 },
    FanOrEvaseOutletFlange: { staticPressure: 2.22222, gasTotalPressure: 3.33333 },
  } as unknown as PlaneResults;
}

describe('CalculateFlowPressureComponent', () => {
  let component: CalculateFlowPressureComponent;
  let fixture: ComponentFixture<CalculateFlowPressureComponent>;
  let fanAnalysisServiceSpy: jasmine.SpyObj<FanAnalysisService>;
  let fanInfoFormServiceSpy: jasmine.SpyObj<FanInfoFormService>;
  let planeDataFormServiceSpy: jasmine.SpyObj<PlaneDataFormService>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let stepTab: BehaviorSubject<string>;
  let getResults: BehaviorSubject<boolean>;
  let mainTab: BehaviorSubject<string>;

  beforeEach(async () => {
    stepTab = new BehaviorSubject<string>('fan-info');
    getResults = new BehaviorSubject<boolean>(true);
    mainTab = new BehaviorSubject<string>('plane-data');

    fanAnalysisServiceSpy = jasmine.createSpyObj('FanAnalysisService', ['getFlowPressureModalDefaults']);
    Object.assign(fanAnalysisServiceSpy, { stepTab, getResults, mainTab, inputData: undefined, pressureCalcResultType: 'static' });
    fanAnalysisServiceSpy.getFlowPressureModalDefaults.and.callFake(() => makeInputData());

    const convertServiceSpy = jasmine.createSpyObj<ConvertFanAnalysisService>('ConvertFanAnalysisService', ['convertFan203Inputs']);
    convertServiceSpy.convertFan203Inputs.and.callFake((inputs: Fan203Inputs) => inputs);

    fanInfoFormServiceSpy = jasmine.createSpyObj('FanInfoFormService', ['getBasicsFormFromObject']);
    fanInfoFormServiceSpy.getBasicsFormFromObject.and.returnValue({ valid: true } as UntypedFormGroup);

    planeDataFormServiceSpy = jasmine.createSpyObj('PlaneDataFormService', ['checkPlaneDataValid']);
    planeDataFormServiceSpy.checkPlaneDataValid.and.returnValue(true);

    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['getPlaneResults']);
    fsatServiceSpy.getPlaneResults.and.returnValue(makePlaneResults());

    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [CalculateFlowPressureComponent],
      providers: [
        { provide: FanAnalysisService, useValue: fanAnalysisServiceSpy },
        { provide: ConvertFanAnalysisService, useValue: convertServiceSpy },
        { provide: FanInfoFormService, useValue: fanInfoFormServiceSpy },
        { provide: PlaneDataFormService, useValue: planeDataFormServiceSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  function createComponent(usingStaticPressure: boolean = true): void {
    fixture = TestBed.createComponent(CalculateFlowPressureComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('bodyHeight', 500);
    fixture.componentRef.setInput('fsat', makeFsat(usingStaticPressure));
    fixture.detectChanges();
  }

  describe('initialization', () => {
    beforeEach(() => createComponent());

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('seeds the fan analysis service with converted flow pressure defaults', () => {
      expect(fanAnalysisServiceSpy.inAssessmentModal).toBeTrue();
      expect(fanAnalysisServiceSpy.getFlowPressureModalDefaults).toHaveBeenCalled();
      expect(fanAnalysisServiceSpy.inputData.FanRatedInfo.fanSpeed).toBe(1780);
      expect(fanAnalysisServiceSpy.inputData.FanRatedInfo.motorSpeed).toBe(1785);
      expect(fanAnalysisServiceSpy.inputData.PlaneData.FlowTraverse.barometricPressure).toBe(29.92);
    });

    it('selects static pressure result type when the fsat uses static pressure', () => {
      expect(fanAnalysisServiceSpy.pressureCalcResultType).toBe('static');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => createComponent());

    it('shows only the fan info form when stepTab is fan-info', () => {
      expect(fixture.nativeElement.querySelector('app-fan-info-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-plane-data-form')).toBeNull();
    });

    it('shows only the plane data form when stepTab is plane-data', () => {
      stepTab.next('plane-data');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-fan-info-form')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-plane-data-form')).not.toBeNull();
    });

    it('shows neither form for any other stepTab value', () => {
      stepTab.next('results');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-fan-info-form')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-plane-data-form')).toBeNull();
    });

    it('always renders the banner and the help and results panel', () => {
      expect(fixture.nativeElement.querySelector('app-calculate-flow-pressure-banner')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-help-and-results-panel')).not.toBeNull();
    });
  });

  describe('getResults', () => {
    it('writes static pressure results to fieldData and reports valid', () => {
      const invalidEmitted: boolean[] = [];
      const fieldDataEmitted: FieldData[] = [];
      createComponent(true);
      component.emitInvalid.subscribe((v: boolean) => invalidEmitted.push(v));
      component.updateFieldData.subscribe((v: FieldData) => fieldDataEmitted.push(v));

      component.getResults();

      expect(component.fsat.fieldData.flowRate).toBe(1000.123);
      expect(component.fsat.fieldData.usingStaticPressure).toBeTrue();
      expect(component.fsat.fieldData.inletPressure).toBe(-1.111);
      expect(component.fsat.fieldData.outletPressure).toBe(2.222);
      expect(component.fsat.fieldData.inletVelocityPressure).toBe(0.444);
      expect(invalidEmitted).toEqual([false]);
      expect(fieldDataEmitted).toEqual([component.fsat.fieldData]);
    });

    it('writes total pressure results to fieldData when result type is total', () => {
      createComponent(false);
      fanAnalysisServiceSpy.pressureCalcResultType = 'total';

      component.getResults();

      expect(component.fsat.fieldData.usingStaticPressure).toBeFalse();
      expect(component.fsat.fieldData.inletPressure).toBe(-0.556);
      expect(component.fsat.fieldData.outletPressure).toBe(3.333);
    });

    it('reports invalid and skips the calculation when plane data is incomplete', () => {
      const invalidEmitted: boolean[] = [];
      createComponent(true);
      component.emitInvalid.subscribe((v: boolean) => invalidEmitted.push(v));
      fsatServiceSpy.getPlaneResults.calls.reset();
      planeDataFormServiceSpy.checkPlaneDataValid.and.returnValue(false);

      component.getResults();

      expect(fsatServiceSpy.getPlaneResults).not.toHaveBeenCalled();
      expect(invalidEmitted).toEqual([true]);
    });
  });

  describe('destroy', () => {
    it('resets the fan analysis service and stops reacting to its subjects', () => {
      createComponent();
      const fieldDataEmitted: FieldData[] = [];
      component.updateFieldData.subscribe((v: FieldData) => fieldDataEmitted.push(v));

      fixture.destroy();
      getResults.next(true);

      expect(fieldDataEmitted).toEqual([]);
      expect(fanAnalysisServiceSpy.inputData).toBeUndefined();
      expect(stepTab.value).toBe('fan-info');
      expect(mainTab.value).toBe('fan-setup');
    });
  });
});
