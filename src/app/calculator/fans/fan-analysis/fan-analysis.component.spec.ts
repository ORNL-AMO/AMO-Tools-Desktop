import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanAnalysisComponent } from './fan-analysis.component';
import { FanAnalysisService } from './fan-analysis.service';
import { ConvertFanAnalysisService } from './convert-fan-analysis.service';
import { PlaneDataFormService } from './fan-analysis-form/plane-data-form/plane-data-form.service';
import { FanInfoFormService } from './fan-analysis-form/fan-info-form/fan-info-form.service';
import { GasDensityFormService } from './fan-analysis-form/gas-density-form/gas-density-form.service';
import { FanShaftPowerFormService } from './fan-analysis-form/fan-shaft-power-form/fan-shaft-power-form.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const MOCK_ASSESSMENT = { id: 7 } as Assessment;

const STEP_LABELS: Array<{ stepIndex: number, label: string }> = [
  { stepIndex: 0, label: 'Fan Basics' },
  { stepIndex: 1, label: 'Gas Density' },
  { stepIndex: 2, label: 'Traverse Data' },
  { stepIndex: 3, label: 'Power' },
];

function makeFanAnalysisService(): FanAnalysisService {
  return new FanAnalysisService(null, null, null, null);
}

describe('FanAnalysisComponent', () => {
  let component: FanAnalysisComponent;
  let fixture: ComponentFixture<FanAnalysisComponent>;
  let fanAnalysisService: FanAnalysisService;
  let convertSpy: jasmine.SpyObj<ConvertFanAnalysisService>;
  let planeDataFormService: Partial<PlaneDataFormService>;
  let planeDataValidSpy: jasmine.Spy;
  let fanInfoFormServiceSpy: jasmine.SpyObj<FanInfoFormService>;
  let gasDensityFormServiceSpy: jasmine.SpyObj<GasDensityFormService>;
  let fanShaftPowerFormServiceSpy: jasmine.SpyObj<FanShaftPowerFormService>;
  let calculatorDbServiceSpy: jasmine.SpyObj<CalculatorDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  async function createComponent(options: { assessment?: Assessment, calculator?: Calculator, setupValid?: boolean } = {}) {
    fanAnalysisService = makeFanAnalysisService();
    convertSpy = jasmine.createSpyObj('ConvertFanAnalysisService', ['convertFan203Inputs']);
    convertSpy.convertFan203Inputs.and.callFake(inputs => inputs);
    planeDataValidSpy = jasmine.createSpy('checkPlaneDataValid').and.returnValue(options.setupValid ?? true);
    planeDataFormService = {
      planeStep: new BehaviorSubject<string>('plane-info'),
      checkPlaneDataValid: planeDataValidSpy,
    };
    fanInfoFormServiceSpy = jasmine.createSpyObj('FanInfoFormService', ['getBasicsFormFromObject']);
    fanInfoFormServiceSpy.getBasicsFormFromObject.and.returnValue({ valid: true } as any);
    gasDensityFormServiceSpy = jasmine.createSpyObj('GasDensityFormService', ['getGasDensityFormFromObj']);
    gasDensityFormServiceSpy.getGasDensityFormFromObj.and.returnValue({ valid: true } as any);
    fanShaftPowerFormServiceSpy = jasmine.createSpyObj('FanShaftPowerFormService', ['getShaftPowerFormFromObj']);
    fanShaftPowerFormServiceSpy.getShaftPowerFormFromObj.and.returnValue({ valid: true } as any);
    calculatorDbServiceSpy = jasmine.createSpyObj('CalculatorDbService', ['getByAssessmentId', 'saveAssessmentCalculator']);
    calculatorDbServiceSpy.getByAssessmentId.and.returnValue(options.calculator);
    calculatorDbServiceSpy.saveAssessmentCalculator.and.returnValue(Promise.resolve() as any);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [FanAnalysisComponent],
      providers: [
        { provide: SettingsDbService, useValue: { globalSettings: MOCK_SETTINGS } },
        { provide: FanAnalysisService, useValue: fanAnalysisService },
        { provide: ConvertFanAnalysisService, useValue: convertSpy },
        { provide: PlaneDataFormService, useValue: planeDataFormService },
        { provide: CalculatorDbService, useValue: calculatorDbServiceSpy },
        { provide: FanInfoFormService, useValue: fanInfoFormServiceSpy },
        { provide: GasDensityFormService, useValue: gasDensityFormServiceSpy },
        { provide: FanShaftPowerFormService, useValue: fanShaftPowerFormServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanAnalysisComponent);
    component = fixture.componentInstance;
    if (options.assessment) {
      fixture.componentRef.setInput('assessment', options.assessment);
    }
    fixture.detectChanges();
  }

  function setStep(stepTab: string) {
    fanAnalysisService.stepTab.next(stepTab);
    fixture.detectChanges();
  }

  function navLinkTexts(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.small-tab-select .nav-link'))
      .map((el: HTMLElement) => el.textContent.trim());
  }

  describe('initialization', () => {
    it('creates the component and sends the analytics event', async () => {
      await createComponent();
      expect(component).toBeTruthy();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-FAN-analysis');
    });

    it('falls back to global settings when none are provided', async () => {
      await createComponent();
      expect(component.settings).toBe(MOCK_SETTINGS);
    });

    it('creates converted default input data when standalone and no data exists', async () => {
      await createComponent();
      expect(fanAnalysisService.inputData).toBeDefined();
      expect(convertSpy.convertFan203Inputs).toHaveBeenCalledWith(fanAnalysisService.inputData, MOCK_SETTINGS);
    });

    it('sets the plane step tabs from the number of traverse planes', async () => {
      await createComponent();
      expect(component.planeStepTabs).toEqual(['plane-info', '1', '2', '3a', '3b', '4', '5']);
    });

    it('updates the plane step tabs when the number of traverse planes changes', async () => {
      await createComponent();
      fanAnalysisService.inputData.FanRatedInfo.traversePlanes = 3;
      fanAnalysisService.getResults.next(true);
      expect(component.planeStepTabs).toEqual(['plane-info', '1', '2', '3a', '3b', '3c', '4', '5']);
    });

    it('creates and saves a new calculator for an assessment without one', async () => {
      await createComponent({ assessment: MOCK_ASSESSMENT });
      expect(calculatorDbServiceSpy.getByAssessmentId).toHaveBeenCalledWith(7);
      expect(component.calculator.assessmentId).toBe(7);
      expect(fanAnalysisService.inputData).toBe(component.calculator.fan203Inputs);
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, component.calculator);
    });

    it('uses existing calculator inputs for an assessment', async () => {
      const existingInputs = makeFanAnalysisService().getDefaultData();
      const calculator: Calculator = { assessmentId: 7, fan203Inputs: existingInputs };
      await createComponent({ assessment: MOCK_ASSESSMENT, calculator });
      expect(component.calcExists).toBeTrue();
      expect(fanAnalysisService.inputData).toBe(existingInputs);
    });
  });

  describe('observers', () => {
    beforeEach(async () => await createComponent());

    it('follows the step tab index', () => {
      setStep('plane-data');
      expect(component.stepIndex).toBe(2);
    });

    it('follows the plane step index', () => {
      (planeDataFormService.planeStep as BehaviorSubject<string>).next('2');
      expect(component.planeStepIndex).toBe(2);
    });

    it('follows the modal open state', () => {
      fanAnalysisService.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
    });

    it('updates setupDone when results are requested', () => {
      planeDataValidSpy.and.returnValue(false);
      fanAnalysisService.getResults.next(true);
      expect(component.setupDone).toBeFalse();
    });
  });

  describe('navigation', () => {
    beforeEach(async () => await createComponent());

    it('next moves to the following step', () => {
      component.next();
      expect(fanAnalysisService.stepTab.value).toBe('gas-density');
    });

    it('next moves through plane steps while on plane data', () => {
      setStep('plane-data');
      component.next();
      expect((planeDataFormService.planeStep as BehaviorSubject<string>).value).toBe('1');
    });

    it('next leaves plane data after the last plane step', () => {
      setStep('plane-data');
      (planeDataFormService.planeStep as BehaviorSubject<string>).next('5');
      component.next();
      expect(fanAnalysisService.stepTab.value).toBe('fan-shaft-power');
    });

    it('back on the first plane step returns to the previous step', () => {
      setStep('plane-data');
      component.back();
      expect(fanAnalysisService.stepTab.value).toBe('gas-density');
    });

    it('back moves to the previous plane step', () => {
      setStep('plane-data');
      (planeDataFormService.planeStep as BehaviorSubject<string>).next('2');
      component.back();
      expect((planeDataFormService.planeStep as BehaviorSubject<string>).value).toBe('1');
    });

    it('changeTabNextOrBack routes to next and back', () => {
      component.changeTabNextOrBack('next');
      expect(fanAnalysisService.stepTab.value).toBe('gas-density');
      component.changeTabNextOrBack('back');
      expect(fanAnalysisService.stepTab.value).toBe('fan-info');
    });

    it('setSmallScreenTab sets the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('example and reset', () => {
    beforeEach(async () => await createComponent());

    it('setExample loads converted example data and returns to the first step', () => {
      setStep('gas-density');
      component.setExample();
      expect(fanAnalysisService.inputData.FanRatedInfo.fanSpeed).toBe(1191);
      expect(fanAnalysisService.stepTab.value).toBe('fan-info');
      expect(fanAnalysisService.mainTab.value).toBe('fan-setup');
    });

    it('resetDefaults loads default data and clears results', () => {
      component.setExample();
      fanAnalysisService.velocityResults.next({} as any);
      component.resetDefaults();
      expect(fanAnalysisService.inputData.FanRatedInfo.fanSpeed).toBeUndefined();
      expect(fanAnalysisService.velocityResults.value).toBeUndefined();
      expect(fanAnalysisService.fanShaftPowerResults.value).toBeUndefined();
    });
  });

  describe('template visibility', () => {
    beforeEach(async () => await createComponent());

    STEP_LABELS.forEach(step => {
      it(`shows the ${step.label} small-screen label at step ${step.stepIndex}`, () => {
        setStep(component.stepTabs[step.stepIndex]);
        expect(navLinkTexts()).toEqual([step.label, 'Details']);
      });
    });

    it('shows the form and help panels before the results step', () => {
      expect(fixture.nativeElement.querySelector('.panel-group')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-fan-analysis-form')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-help-and-results-panel')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-fan-analysis-results')).toBeNull();
    });

    it('shows only the results at the results step', () => {
      setStep('fan-analysis-results');
      expect(fixture.nativeElement.querySelector('.small-tab-select')).toBeNull();
      expect(fixture.nativeElement.querySelector('.panel-group')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-fan-analysis-results')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops following the step tab after the component is destroyed', async () => {
      await createComponent();
      fixture.destroy();
      fanAnalysisService.stepTab.next('plane-data');
      expect(component.stepIndex).toBe(0);
    });

    it('saves the calculator with the current inputs when an existing assessment calculator is destroyed', async () => {
      const calculator: Calculator = { assessmentId: 7, fan203Inputs: makeFanAnalysisService().getDefaultData() };
      await createComponent({ assessment: MOCK_ASSESSMENT, calculator });
      calculatorDbServiceSpy.saveAssessmentCalculator.calls.reset();
      fixture.destroy();
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, calculator);
      expect(calculator.fan203Inputs).toBe(fanAnalysisService.inputData);
    });
  });
});
