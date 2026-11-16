import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MotorPerformanceComponent } from './motor-performance.component';
import { MotorPerformanceInputs, MotorPerformanceService } from './motor-performance.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { Assessment } from '../../../shared/models/assessment';
import { PSAT } from '../../../shared/models/psat';
import { FSAT } from '../../../shared/models/fans';

const MOCK_ASSESSMENT = { id: 7 } as Assessment;
const MOCK_PSAT = { name: 'psat' } as PSAT;
const MOCK_FSAT = { name: 'fsat' } as FSAT;

function makeInputs(horsePower: number = 200): MotorPerformanceInputs {
  return {
    frequency: 60,
    horsePower: horsePower,
    motorRPM: 1780,
    efficiencyClass: 1,
    motorVoltage: 460,
    fullLoadAmps: 225.4,
    sizeMargin: 1,
    efficiency: 0,
  };
}

function makeForm(name: string, horsePower: number = 200): UntypedFormGroup {
  const form = new UntypedFormBuilder().group(makeInputs(horsePower));
  (form as any).testName = name;
  return form;
}

function formName(form: UntypedFormGroup): string {
  return (form as any).testName;
}

describe('MotorPerformanceComponent', () => {
  let component: MotorPerformanceComponent;
  let fixture: ComponentFixture<MotorPerformanceComponent>;
  let serviceSpy: jasmine.SpyObj<MotorPerformanceService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let calculatorDbServiceSpy: jasmine.SpyObj<CalculatorDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let globalSettings: Settings;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { inAssessment?: boolean, assessment?: Assessment, psat?: PSAT, fsat?: FSAT, settings?: Settings } = {}): void {
    fixture = TestBed.createComponent(MotorPerformanceComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, (inputs as any)[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    globalSettings = { powerMeasurement: 'hp' } as Settings;
    serviceSpy = jasmine.createSpyObj('MotorPerformanceService', [
      'initForm', 'initFormFromObj', 'initFormFromPsat', 'initFormFromFsat', 'resetForm', 'getObjFromForm',
    ]);
    serviceSpy.motorPerformanceInputs = undefined;
    serviceSpy.initForm.and.callFake(() => makeForm('example'));
    serviceSpy.initFormFromObj.and.callFake(() => makeForm('fromObj'));
    serviceSpy.initFormFromPsat.and.callFake(() => makeForm('fromPsat'));
    serviceSpy.initFormFromFsat.and.callFake(() => makeForm('fromFsat'));
    serviceSpy.resetForm.and.callFake(() => makeForm('reset', 0));
    serviceSpy.getObjFromForm.and.callFake((form: UntypedFormGroup) => form.getRawValue());

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: globalSettings });
    calculatorDbServiceSpy = jasmine.createSpyObj('CalculatorDbService', ['getByAssessmentId', 'saveAssessmentCalculator']);
    calculatorDbServiceSpy.saveAssessmentCalculator.and.returnValue(Promise.resolve());
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [MotorPerformanceComponent],
      providers: [
        { provide: MotorPerformanceService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: CalculatorDbService, useValue: calculatorDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization (standalone)', () => {
    it('sends the analytics event and clears the saving flag', () => {
      calculatorDbServiceSpy.isSaving = true;
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-MOTOR-performance');
      expect(calculatorDbServiceSpy.isSaving).toBeFalse();
    });

    it('starts from a reset form when the service has no saved inputs', () => {
      createComponent();
      expect(serviceSpy.resetForm).toHaveBeenCalled();
      expect(formName(component.performanceForm)).toBe('reset');
    });

    it('restores the form from the saved service inputs', () => {
      const saved = makeInputs(300);
      serviceSpy.motorPerformanceInputs = saved;
      createComponent();
      expect(serviceSpy.initFormFromObj).toHaveBeenCalledWith(saved);
      expect(formName(component.performanceForm)).toBe('fromObj');
    });

    it('uses the global settings when none are provided', () => {
      createComponent();
      expect(component.settings).toBe(globalSettings);
      expect(component.performanceForm.controls.horsePower.value).toBe(0);
    });

    it('defaults the motor power to 150 for non-hp global settings', () => {
      globalSettings.powerMeasurement = 'kW';
      createComponent();
      expect(component.performanceForm.controls.horsePower.value).toBe('150');
    });

    it('keeps provided settings without patching the motor power', () => {
      const settings = { powerMeasurement: 'kW' } as Settings;
      createComponent({ settings: settings });
      expect(component.settings).toBe(settings);
      expect(component.performanceForm.controls.horsePower.value).toBe(0);
    });

    it('defaults to the results tab when the global settings have no panel tab', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });

    it('uses the global default panel tab', () => {
      globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('initialization (in assessment)', () => {
    async function createInAssessment(inputs: { psat?: PSAT, fsat?: FSAT } = {}): Promise<void> {
      createComponent({ inAssessment: true, assessment: MOCK_ASSESSMENT, ...inputs });
      await fixture.whenStable();
    }

    it('restores the form from saved calculator inputs without saving', async () => {
      const saved = makeInputs(300);
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue({ id: 1, motorPerformanceInputs: saved } as Calculator);
      await createInAssessment();
      expect(calculatorDbServiceSpy.getByAssessmentId).toHaveBeenCalledWith(7);
      expect(serviceSpy.initFormFromObj).toHaveBeenCalledWith(saved);
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).not.toHaveBeenCalled();
    });

    const sourceCases: Array<{ label: string, inputs: { psat?: PSAT, fsat?: FSAT }, expected: string }> = [
      { label: 'the PSAT', inputs: { psat: MOCK_PSAT }, expected: 'fromPsat' },
      { label: 'the FSAT', inputs: { fsat: MOCK_FSAT }, expected: 'fromFsat' },
      { label: 'example data', inputs: {}, expected: 'example' },
    ];

    sourceCases.forEach(({ label, inputs, expected }) => {
      it(`builds the form from ${label} and saves it when the calculator has no inputs`, async () => {
        const calculator = { id: 1 } as Calculator;
        calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
        await createInAssessment(inputs);
        expect(formName(component.performanceForm)).toBe(expected);
        expect(calculator.motorPerformanceInputs).toEqual(makeInputs());
        expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, calculator);
      });

      it(`creates and saves a new calculator from ${label} when none exists`, async () => {
        calculatorDbServiceSpy.getByAssessmentId.and.returnValue(undefined);
        await createInAssessment(inputs);
        expect(formName(component.performanceForm)).toBe(expected);
        expect(component.calculator).toEqual({ assessmentId: 7, motorPerformanceInputs: makeInputs() });
        expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, component.calculator);
      });
    });

    it('does not patch the motor power for non-hp settings', async () => {
      globalSettings.powerMeasurement = 'kW';
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue({ id: 1, motorPerformanceInputs: makeInputs() } as Calculator);
      await createInAssessment();
      expect(component.performanceForm.controls.horsePower.value).toBe(200);
    });
  });

  describe('calculation triggers', () => {
    it('stores the standalone inputs on the service and toggles the chart', async () => {
      createComponent();
      component.performanceForm.controls.horsePower.setValue(75);
      await component.calculate();
      expect(serviceSpy.motorPerformanceInputs).toEqual(makeInputs(75));
      expect(component.toggleCalculate).toBeTrue();
      await component.calculate();
      expect(component.toggleCalculate).toBeFalse();
    });

    it('saves the inputs to the assessment calculator when in an assessment', async () => {
      const calculator = { id: 1, motorPerformanceInputs: makeInputs() } as Calculator;
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
      createComponent({ inAssessment: true, assessment: MOCK_ASSESSMENT });
      await fixture.whenStable();
      component.performanceForm.controls.horsePower.setValue(90);
      await component.calculate();
      expect(calculator.motorPerformanceInputs).toEqual(makeInputs(90));
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, calculator);
      expect(serviceSpy.motorPerformanceInputs).toBeUndefined();
      expect(component.toggleCalculate).toBeTrue();
    });

    it('only toggles the chart when a PSAT is provided outside an assessment', async () => {
      createComponent({ psat: MOCK_PSAT });
      await component.calculate();
      expect(serviceSpy.motorPerformanceInputs).toBeUndefined();
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).not.toHaveBeenCalled();
      expect(component.toggleCalculate).toBeTrue();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
    });

    it('btnResetData resets the form and recalculates', () => {
      serviceSpy.resetForm.calls.reset();
      component.btnResetData();
      expect(serviceSpy.resetForm).toHaveBeenCalled();
      expect(formName(component.performanceForm)).toBe('reset');
      expect(component.toggleCalculate).toBeTrue();
    });

    it('btnGenerateExample loads example data and recalculates', () => {
      component.btnGenerateExample();
      expect(formName(component.performanceForm)).toBe('example');
      expect(serviceSpy.motorPerformanceInputs).toEqual(makeInputs());
      expect(component.toggleCalculate).toBeTrue();
    });

    it('changeField stores the focused field', () => {
      component.changeField('motorRPM');
      expect(component.currentField).toBe('motorRPM');
    });

    it('setTab switches the help panel tab', () => {
      component.setTab('help');
      expect(component.tabSelect).toBe('help');
    });

    it('setSmallScreenTab switches the small-screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template: help panel tabs', () => {
    beforeEach(() => {
      createComponent();
    });

    it('shows the chart and hides the help on the results tab', () => {
      expect(query('app-motor-performance-chart')).not.toBeNull();
      expect(query('app-motor-performance-help')).toBeNull();
    });

    it('shows the help and hides the chart on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-motor-performance-help')).not.toBeNull();
      expect(query('app-motor-performance-chart')).toBeNull();
    });

    it('hides both the help and the chart for any other tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-motor-performance-help')).toBeNull();
      expect(query('app-motor-performance-chart')).toBeNull();
    });

    it('switches back to the chart from the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      component.setTab('results');
      fixture.detectChanges();
      expect(query('app-motor-performance-chart')).not.toBeNull();
      expect(query('app-motor-performance-help')).toBeNull();
    });

    it('always renders the form', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-motor-performance-form')).not.toBeNull();
    });
  });
});
