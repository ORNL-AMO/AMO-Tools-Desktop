import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { SpecificSpeedComponent } from './specific-speed.component';
import { SpecificSpeedService } from './specific-speed.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { Calculator, SpecificSpeedInputs } from '../../../shared/models/calculators';
import { PSAT } from '../../../shared/models/psat';
import { Assessment } from '../../../shared/models/assessment';

const MOCK_SETTINGS = { flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;
const MOCK_INPUTS: SpecificSpeedInputs = { pumpType: 2, pumpRPM: 1780, flowRate: 2000, head: 277 };
const MOCK_PSAT = { inputs: { pump_style: 1, pump_rated_speed: 1800, flow_rate: 1500, head: 200 } } as PSAT;
const MOCK_ASSESSMENT = { id: 7 } as Assessment;

function makeForm(name: string): UntypedFormGroup {
  return new UntypedFormBuilder().group({ name: [name] });
}

describe('SpecificSpeedComponent', () => {
  let component: SpecificSpeedComponent;
  let fixture: ComponentFixture<SpecificSpeedComponent>;
  let serviceSpy: jasmine.SpyObj<SpecificSpeedService>;
  let settingsDbServiceSpy: SettingsDbService;
  let calculatorDbServiceSpy: jasmine.SpyObj<CalculatorDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  const defaultForm = makeForm('default');
  const objForm = makeForm('fromObj');
  const psatForm = makeForm('fromPsat');
  const resetForm = makeForm('reset');

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getPanelTab(label: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item'))
      .find((tab: HTMLElement) => tab.textContent.trim() === label) as HTMLElement;
  }

  function getButton(label: string): HTMLButtonElement {
    return Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: HTMLButtonElement) => button.textContent.trim() === label) as HTMLButtonElement;
  }

  function createComponent(inputs: { settings?: Settings, psat?: PSAT, assessment?: Assessment, inAssessment?: boolean } = {}): void {
    fixture = TestBed.createComponent(SpecificSpeedComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('SpecificSpeedService',
      ['initForm', 'initFormFromObj', 'initFormFromPsat', 'getObjFromForm', 'resetForm']);
    serviceSpy.initForm.and.returnValue(defaultForm);
    serviceSpy.initFormFromObj.and.returnValue(objForm);
    serviceSpy.initFormFromPsat.and.returnValue(psatForm);
    serviceSpy.resetForm.and.returnValue(resetForm);
    serviceSpy.getObjFromForm.and.returnValue(MOCK_INPUTS);
    serviceSpy.specificSpeedInputs = undefined;

    settingsDbServiceSpy = { globalSettings: { ...MOCK_SETTINGS } } as SettingsDbService;
    calculatorDbServiceSpy = jasmine.createSpyObj('CalculatorDbService', ['getByAssessmentId', 'saveAssessmentCalculator']);
    calculatorDbServiceSpy.saveAssessmentCalculator.and.returnValue(Promise.resolve());
    calculatorDbServiceSpy.isSaving = true;
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [SpecificSpeedComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: SpecificSpeedService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: CalculatorDbService, useValue: calculatorDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event and resets the saving flag', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledOnceWith('calculator-PUMP-specific-speed');
      expect(calculatorDbServiceSpy.isSaving).toBeFalse();
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent();
      expect(component.settings).toBe(settingsDbServiceSpy.globalSettings);
    });

    it('keeps the settings input when provided', () => {
      const inputSettings = { ...MOCK_SETTINGS, flowMeasurement: 'm3/h' } as Settings;
      createComponent({ settings: inputSettings });
      expect(component.settings).toBe(inputSettings);
    });

    it('defaults tabSelect to results', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });

    it('uses the global default panel tab when set', () => {
      settingsDbServiceSpy.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('builds a default form when standalone with no saved inputs', () => {
      createComponent();
      expect(serviceSpy.initForm).toHaveBeenCalledOnceWith(settingsDbServiceSpy.globalSettings);
      expect(component.speedForm).toBe(defaultForm);
    });

    it('restores the form from saved service inputs when standalone', () => {
      serviceSpy.specificSpeedInputs = MOCK_INPUTS;
      createComponent();
      expect(serviceSpy.initFormFromObj).toHaveBeenCalledOnceWith(MOCK_INPUTS);
      expect(component.speedForm).toBe(objForm);
    });

    it('builds the form from psat inputs when a psat is given outside an assessment', () => {
      createComponent({ psat: MOCK_PSAT });
      expect(serviceSpy.initFormFromPsat).toHaveBeenCalledOnceWith(MOCK_PSAT.inputs);
      expect(component.speedForm).toBe(psatForm);
    });

    describe('in assessment', () => {
      it('restores the form from an existing calculator with saved inputs', async () => {
        const calculator: Calculator = { assessmentId: 7, specificSpeedInputs: MOCK_INPUTS };
        calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
        createComponent({ psat: MOCK_PSAT, assessment: MOCK_ASSESSMENT, inAssessment: true });
        await fixture.whenStable();
        expect(calculatorDbServiceSpy.getByAssessmentId).toHaveBeenCalledOnceWith(7);
        expect(component.calcExists).toBeTrue();
        expect(component.speedForm).toBe(objForm);
        expect(calculatorDbServiceSpy.saveAssessmentCalculator).not.toHaveBeenCalled();
      });

      it('fills an existing calculator without inputs from psat and saves it', async () => {
        const calculator: Calculator = { assessmentId: 7 };
        calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
        createComponent({ psat: MOCK_PSAT, assessment: MOCK_ASSESSMENT, inAssessment: true });
        await fixture.whenStable();
        expect(component.speedForm).toBe(psatForm);
        expect(calculator.specificSpeedInputs).toEqual(MOCK_INPUTS);
        expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledOnceWith(MOCK_ASSESSMENT, calculator);
      });

      it('creates and saves a new calculator when none exists', async () => {
        calculatorDbServiceSpy.getByAssessmentId.and.returnValue(undefined);
        createComponent({ psat: MOCK_PSAT, assessment: MOCK_ASSESSMENT, inAssessment: true });
        await fixture.whenStable();
        expect(component.calcExists).toBeUndefined();
        expect(component.speedForm).toBe(psatForm);
        expect(component.calculator).toEqual({ assessmentId: 7, specificSpeedInputs: MOCK_INPUTS });
        expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledOnceWith(MOCK_ASSESSMENT, component.calculator);
      });
    });
  });

  describe('calculation triggers', () => {
    it('toggles toggleCalculate and stores inputs on the service when standalone', async () => {
      createComponent();
      const before = component.toggleCalculate;
      await component.calculate();
      expect(component.toggleCalculate).toBe(!before);
      expect(serviceSpy.getObjFromForm).toHaveBeenCalledWith(defaultForm);
      expect(serviceSpy.specificSpeedInputs).toEqual(MOCK_INPUTS);
    });

    it('saves the calculator when in an assessment with an existing calculator', async () => {
      const calculator: Calculator = { assessmentId: 7, specificSpeedInputs: MOCK_INPUTS };
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
      createComponent({ psat: MOCK_PSAT, assessment: MOCK_ASSESSMENT, inAssessment: true });
      await fixture.whenStable();
      calculatorDbServiceSpy.saveAssessmentCalculator.calls.reset();
      await component.calculate();
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledOnceWith(MOCK_ASSESSMENT, calculator);
      expect(serviceSpy.specificSpeedInputs).toBeUndefined();
    });

    it('neither stores nor saves when a psat is given outside an assessment', async () => {
      createComponent({ psat: MOCK_PSAT });
      await component.calculate();
      expect(serviceSpy.specificSpeedInputs).toBeUndefined();
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).not.toHaveBeenCalled();
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('resets the form, toggles resetData, and recalculates', () => {
      spyOn(component, 'calculate');
      const before = component.toggleResetData;
      getButton('Reset Data').click();
      expect(serviceSpy.resetForm).toHaveBeenCalledOnceWith(settingsDbServiceSpy.globalSettings);
      expect(component.speedForm).toBe(resetForm);
      expect(component.toggleResetData).toBe(!before);
      expect(component.calculate).toHaveBeenCalled();
    });

    it('generates the example form, toggles resetData, and recalculates', () => {
      spyOn(component, 'calculate');
      serviceSpy.initForm.calls.reset();
      const before = component.toggleResetData;
      getButton('Generate Example').click();
      expect(serviceSpy.initForm).toHaveBeenCalledOnceWith(settingsDbServiceSpy.globalSettings);
      expect(component.speedForm).toBe(defaultForm);
      expect(component.toggleResetData).toBe(!before);
      expect(component.calculate).toHaveBeenCalled();
    });

    it('sets the current field from the form output', () => {
      component.changeField('head');
      expect(component.currentField).toBe('head');
    });

    it('switches small screen tabs', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    it('renders the calculator container when settings exist', () => {
      createComponent();
      expect(query('.calculator-container')).not.toBeNull();
      expect(query('app-specific-speed-form')).not.toBeNull();
    });

    it('hides the calculator container when settings are cleared', () => {
      createComponent();
      fixture.componentRef.setInput('settings', undefined);
      fixture.detectChanges();
      expect(query('.calculator-container')).toBeNull();
      expect(query('app-specific-speed-form')).toBeNull();
    });

    it('shows the graph and hides help on the results tab', () => {
      createComponent();
      expect(query('#specificSpeedGraph')).not.toBeNull();
      expect(query('app-specific-speed-graph')).not.toBeNull();
      expect(query('app-specific-speed-help')).toBeNull();
    });

    it('shows help and hides the graph on the help tab', () => {
      createComponent();
      getPanelTab('Help').querySelector('a').click();
      fixture.detectChanges();
      expect(component.tabSelect).toBe('help');
      expect(query('app-specific-speed-help')).not.toBeNull();
      expect(query('#specificSpeedGraph')).toBeNull();
      expect(query('app-specific-speed-graph')).toBeNull();
    });

    it('returns to the graph when the Graph tab is clicked', () => {
      settingsDbServiceSpy.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(query('#specificSpeedGraph')).toBeNull();
      getPanelTab('Graph').querySelector('a').click();
      fixture.detectChanges();
      expect(query('#specificSpeedGraph')).not.toBeNull();
      expect(query('app-specific-speed-help')).toBeNull();
    });

    it('renders neither panel for an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('#specificSpeedGraph')).toBeNull();
      expect(query('app-specific-speed-help')).toBeNull();
    });

    it('marks the active panel tab', () => {
      createComponent();
      expect(getPanelTab('Graph').classList).toContain('active');
      expect(getPanelTab('Help').classList).not.toContain('active');
    });
  });
});
