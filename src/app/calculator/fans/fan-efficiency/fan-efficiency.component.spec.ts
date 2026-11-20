import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { FanEfficiencyComponent } from './fan-efficiency.component';
import { FanEfficiencyInputs, FanEfficiencyService } from './fan-efficiency.service';
import { FsatService } from '../../../fsat/fsat.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { FSAT } from '../../../shared/models/fans';

const MOCK_SETTINGS = { fanPressureMeasurement: 'inH2o', fanFlowRate: 'ft3/min' } as Settings;

function makeInputs(fanSpeed: number = 1180): FanEfficiencyInputs {
  return {
    fanType: 0,
    fanSpeed: fanSpeed,
    inletPressure: -16.36,
    outletPressure: 1.1,
    flowRate: 129691,
    compressibility: 0.988
  };
}

describe('FanEfficiencyComponent', () => {
  let component: FanEfficiencyComponent;
  let fixture: ComponentFixture<FanEfficiencyComponent>;
  let fanEfficiencyService: FanEfficiencyService;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let calculatorDbServiceSpy: jasmine.SpyObj<CalculatorDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = {}): void {
    fixture = TestBed.createComponent(FanEfficiencyComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['optimalFanEfficiency']);
    fsatServiceSpy.optimalFanEfficiency.and.returnValue(72.5);
    calculatorDbServiceSpy = jasmine.createSpyObj('CalculatorDbService', ['getByAssessmentId', 'saveAssessmentCalculator']);
    calculatorDbServiceSpy.saveAssessmentCalculator.and.returnValue(Promise.resolve(undefined));
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FanEfficiencyComponent],
      providers: [
        FanEfficiencyService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: CalculatorDbService, useValue: calculatorDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fanEfficiencyService = TestBed.inject(FanEfficiencyService);
  });

  describe('initialization (standalone)', () => {
    it('creates the component and sends the analytics event', () => {
      createComponent({ settings: MOCK_SETTINGS });
      expect(component).toBeTruthy();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-FAN-efficiency');
    });

    it('builds a default form when the service has no saved inputs', () => {
      spyOn(fanEfficiencyService, 'initForm').and.callThrough();
      createComponent({ settings: MOCK_SETTINGS });
      expect(fanEfficiencyService.initForm).toHaveBeenCalled();
      expect(component.fanEfficiencyForm.controls.fanSpeed.value).toBe(0);
    });

    it('builds the form from saved service inputs when present', () => {
      fanEfficiencyService.fanEfficiencyInputs = makeInputs(1500);
      createComponent({ settings: MOCK_SETTINGS });
      expect(component.fanEfficiencyForm.controls.fanSpeed.value).toBe(1500);
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent();
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
    });

    it('uses the global default panel tab when set', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent({ settings: MOCK_SETTINGS });
      expect(component.tabSelect).toBe('help');
    });

    it('defaults to the results tab when no global default panel tab is set', () => {
      createComponent({ settings: MOCK_SETTINGS });
      expect(component.tabSelect).toBe('results');
    });
  });

  describe('initialization (in assessment)', () => {
    const assessment = { id: 7 } as Assessment;

    it('builds the form from the saved calculator inputs', () => {
      const calculator: Calculator = { id: 3, assessmentId: 7, fanEfficiencyInputs: makeInputs(900) };
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
      createComponent({ settings: MOCK_SETTINGS, assessment: assessment, inAssessment: true });
      expect(calculatorDbServiceSpy.getByAssessmentId).toHaveBeenCalledWith(7);
      expect(component.fanEfficiencyForm.controls.fanSpeed.value).toBe(900);
      expect(component.originalCalculator).toBe(calculator);
    });

    it('creates and saves a new calculator from the fsat when none exists', () => {
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(undefined);
      const fsat = {
        fanSetup: { fanType: 1, fanSpeed: 1780 },
        fieldData: { inletPressure: -5, outletPressure: 2, flowRate: 1000, compressibilityFactor: 0.99 }
      } as unknown as FSAT;
      createComponent({ settings: MOCK_SETTINGS, assessment: assessment, inAssessment: true, fsat: fsat });
      expect(component.fanEfficiencyForm.controls.fanSpeed.value).toBe(1780);
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(assessment, jasmine.objectContaining({ assessmentId: 7 }));
    });
  });

  describe('calculation', () => {
    beforeEach(() => {
      fanEfficiencyService.fanEfficiencyInputs = makeInputs();
      createComponent({ settings: MOCK_SETTINGS });
    });

    it('passes the form inputs and settings to optimalFanEfficiency and assigns the result', () => {
      expect(fsatServiceSpy.optimalFanEfficiency).toHaveBeenCalledWith(makeInputs(), MOCK_SETTINGS);
      expect(component.fanEfficiency).toBe(72.5);
    });

    it('updates the result when the input changes', () => {
      fsatServiceSpy.optimalFanEfficiency.and.returnValue(80.1);
      component.fanEfficiencyForm.controls.fanSpeed.setValue(1600);
      component.calculate();
      expect(fsatServiceSpy.optimalFanEfficiency).toHaveBeenCalledWith(makeInputs(1600), MOCK_SETTINGS);
      expect(component.fanEfficiency).toBe(80.1);
    });

    it('stores the inputs on the service when not in an assessment', () => {
      component.fanEfficiencyForm.controls.fanSpeed.setValue(1600);
      component.calculate();
      expect(fanEfficiencyService.fanEfficiencyInputs).toEqual(makeInputs(1600));
    });

    it('sets the result to 0 without calculating when the form is invalid', () => {
      fsatServiceSpy.optimalFanEfficiency.calls.reset();
      component.fanEfficiencyForm.controls.fanSpeed.setValue(null);
      component.calculate();
      expect(fsatServiceSpy.optimalFanEfficiency).not.toHaveBeenCalled();
      expect(component.fanEfficiency).toBe(0);
    });

    it('saves the calculator when in an assessment with a saved calculator', fakeAsync(() => {
      const assessment = { id: 7 } as Assessment;
      component.inAssessment = true;
      component.assessment = assessment;
      component.calculator = { id: 3, assessmentId: 7 };
      component.calculate();
      flush();
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(assessment, jasmine.objectContaining({ fanEfficiencyInputs: makeInputs() }));
    }));
  });

  describe('user actions', () => {
    beforeEach(() => {
      fanEfficiencyService.fanEfficiencyInputs = makeInputs(1500);
      createComponent({ settings: MOCK_SETTINGS });
    });

    it('resets to a default form and recalculates', () => {
      fsatServiceSpy.optimalFanEfficiency.calls.reset();
      component.btnResetData();
      expect(component.fanEfficiencyForm.controls.fanSpeed.value).toBe(0);
      expect(fsatServiceSpy.optimalFanEfficiency).toHaveBeenCalledWith(
        { fanType: 0, fanSpeed: 0, inletPressure: 0, outletPressure: 0, flowRate: 0, compressibility: 0 }, MOCK_SETTINGS);
    });

    it('generates the example form and recalculates', () => {
      fsatServiceSpy.optimalFanEfficiency.calls.reset();
      component.btnGenerateExample();
      expect(component.fanEfficiencyForm.controls.fanSpeed.value).toBe(1180);
      expect(fsatServiceSpy.optimalFanEfficiency).toHaveBeenCalledWith(makeInputs(1180), MOCK_SETTINGS);
    });

    it('sets the selected tab', () => {
      component.setTab('help');
      expect(component.tabSelect).toBe('help');
    });

    it('sets the current field', () => {
      component.changeField('flowRate');
      expect(component.currentField).toBe('flowRate');
    });

    it('sets the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      createComponent({ settings: MOCK_SETTINGS });
    });

    it('renders the calculator container when settings exist', () => {
      expect(query('.calculator-container')).not.toBeNull();
      expect(query('app-fan-efficiency-form')).not.toBeNull();
    });

    it('hides the calculator container when settings are missing', () => {
      component.settings = undefined;
      fixture.detectChanges();
      expect(query('.calculator-container')).toBeNull();
      expect(query('app-fan-efficiency-form')).toBeNull();
    });

    it('shows the results panel and hides help on the results tab', () => {
      expect(query('app-percent-graph')).not.toBeNull();
      expect(query('.help-panel h3').textContent.trim()).toBe('Fan Efficiency');
      expect(query('app-fan-efficiency-help')).toBeNull();
    });

    it('shows help and hides the results panel on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-fan-efficiency-help')).not.toBeNull();
      expect(query('app-percent-graph')).toBeNull();
      expect(query('.help-panel h3')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-fan-efficiency-help')).toBeNull();
      expect(query('app-percent-graph')).toBeNull();
    });
  });
});
