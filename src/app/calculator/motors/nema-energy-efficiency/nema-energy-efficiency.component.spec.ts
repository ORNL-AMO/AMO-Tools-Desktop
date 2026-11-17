import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NemaEnergyEfficiencyComponent } from './nema-energy-efficiency.component';
import { NemaEnergyEfficiencyService, NemaInputs } from './nema-energy-efficiency.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { CalculatorDbService } from '../../../indexedDb/calculator-db.service';
import { PsatService } from '../../../psat/psat.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { Calculator } from '../../../shared/models/calculators';
import { PSAT } from '../../../shared/models/psat';
import { FSAT } from '../../../shared/models/fans';

const HP_SETTINGS = { powerMeasurement: 'hp', unitsOfMeasure: 'Imperial' } as Settings;
const KW_METRIC_SETTINGS = { powerMeasurement: 'kW', unitsOfMeasure: 'Metric' } as Settings;
const MOCK_ASSESSMENT = { id: 7 } as Assessment;

function makeNemaInputs(overrides: Partial<NemaInputs> = {}): NemaInputs {
  return { frequency: 50, horsePower: 75, efficiencyClass: 1, motorRPM: 1780, efficiency: null, ...overrides };
}

function makePsat(): PSAT {
  return {
    inputs: { line_frequency: 60, motor_rated_power: 300, efficiency_class: 2, motor_rated_speed: 1785, efficiency: null }
  } as PSAT;
}

function makeFsat(): FSAT {
  return {
    fanMotor: { lineFrequency: 50, motorRatedPower: 40, efficiencyClass: 0, motorRpm: 1450, specifiedEfficiency: null }
  } as FSAT;
}

describe('NemaEnergyEfficiencyComponent', () => {
  let component: NemaEnergyEfficiencyComponent;
  let fixture: ComponentFixture<NemaEnergyEfficiencyComponent>;
  let nemaService: NemaEnergyEfficiencyService;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let calculatorDbServiceSpy: jasmine.SpyObj<CalculatorDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { settings?: Settings, inAssessment?: boolean, assessment?: Assessment, psat?: PSAT, fsat?: FSAT } = { settings: HP_SETTINGS }): void {
    fixture = TestBed.createComponent(NemaEnergyEfficiencyComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, (inputs as any)[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['nema']);
    psatServiceSpy.nema.and.returnValue(94.5);
    calculatorDbServiceSpy = jasmine.createSpyObj('CalculatorDbService', ['getByAssessmentId', 'saveAssessmentCalculator']);
    calculatorDbServiceSpy.saveAssessmentCalculator.and.returnValue(Promise.resolve(undefined));
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...HP_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      declarations: [NemaEnergyEfficiencyComponent],
      providers: [
        NemaEnergyEfficiencyService,
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: CalculatorDbService, useValue: calculatorDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    nemaService = TestBed.inject(NemaEnergyEfficiencyService);
  });

  describe('initialization', () => {
    it('sends the analytics event and clears the saving flag', () => {
      calculatorDbServiceSpy.isSaving = true;
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-MOTOR-nema-energy-efficiency');
      expect(calculatorDbServiceSpy.isSaving).toBeFalse();
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent({});
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
    });

    it('builds a reset form when the service has no saved inputs', () => {
      createComponent();
      expect(nemaService.getObjFromForm(component.nemaForm)).toEqual(
        { frequency: 60, horsePower: 0, efficiencyClass: 0, motorRPM: 0, efficiency: '' } as any);
    });

    it('restores the form from the service inputs when present', () => {
      nemaService.nemaInputs = makeNemaInputs();
      createComponent();
      expect(nemaService.getObjFromForm(component.nemaForm)).toEqual(makeNemaInputs());
    });

    it('uses the default panel tab from global settings', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('defaults to the results tab', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });
  });

  describe('initialization in an assessment', () => {
    it('loads the form from the saved calculator inputs without saving', async () => {
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue({ id: 3, assessmentId: 7, nemaInputs: makeNemaInputs() } as Calculator);
      createComponent({ settings: HP_SETTINGS, inAssessment: true, assessment: MOCK_ASSESSMENT });
      await fixture.whenStable();
      expect(calculatorDbServiceSpy.getByAssessmentId).toHaveBeenCalledWith(7);
      expect(nemaService.getObjFromForm(component.nemaForm)).toEqual(makeNemaInputs());
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).not.toHaveBeenCalled();
    });

    it('builds the form from the PSAT and saves when the calculator has no inputs', async () => {
      const calculator = { id: 3, assessmentId: 7 } as Calculator;
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
      createComponent({ settings: HP_SETTINGS, inAssessment: true, assessment: MOCK_ASSESSMENT, psat: makePsat() });
      await fixture.whenStable();
      expect(calculator.nemaInputs).toEqual({ frequency: 60, horsePower: 300, efficiencyClass: 2, motorRPM: 1785, efficiency: null });
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, calculator);
    });

    it('builds the form from the FSAT and saves when the calculator has no inputs', async () => {
      const calculator = { id: 3, assessmentId: 7 } as Calculator;
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
      createComponent({ settings: HP_SETTINGS, inAssessment: true, assessment: MOCK_ASSESSMENT, fsat: makeFsat() });
      await fixture.whenStable();
      expect(calculator.nemaInputs).toEqual({ frequency: 50, horsePower: 40, efficiencyClass: 0, motorRPM: 1450, efficiency: null });
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, calculator);
    });

    it('builds a default form and saves when the calculator has no inputs and no PSAT/FSAT', async () => {
      const calculator = { id: 3, assessmentId: 7 } as Calculator;
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
      createComponent({ settings: HP_SETTINGS, inAssessment: true, assessment: MOCK_ASSESSMENT });
      await fixture.whenStable();
      expect(calculator.nemaInputs).toEqual({ frequency: 60, horsePower: 200, efficiencyClass: 0, motorRPM: 1200, efficiency: '' } as any);
    });

    it('creates and saves a new calculator when none exists', async () => {
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(undefined);
      createComponent({ settings: HP_SETTINGS, inAssessment: true, assessment: MOCK_ASSESSMENT, psat: makePsat() });
      await fixture.whenStable();
      expect(component.calculator).toEqual({
        assessmentId: 7,
        nemaInputs: { frequency: 60, horsePower: 300, efficiencyClass: 2, motorRPM: 1785, efficiency: null }
      });
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, component.calculator);
    });
  });

  describe('calculation triggers', () => {
    it('passes the form values and settings to the NEMA calculation', async () => {
      createComponent();
      component.nemaForm = nemaService.initFormFromObj(makeNemaInputs());
      await component.calculate();
      expect(psatServiceSpy.nema).toHaveBeenCalledWith(50, 1780, 1, null, 75, HP_SETTINGS);
      expect(component.tefcValue).toBe(94.5);
    });

    it('produces updated output when inputs change', async () => {
      createComponent();
      component.nemaForm = nemaService.initFormFromObj(makeNemaInputs());
      await component.calculate();
      psatServiceSpy.nema.and.returnValue(91.2);
      component.nemaForm.patchValue({ horsePower: 10 });
      await component.calculate();
      expect(psatServiceSpy.nema.calls.mostRecent().args[4]).toBe(10);
      expect(component.tefcValue).toBe(91.2);
    });

    it('sets the result to 0 without calculating when the form is invalid', async () => {
      createComponent();
      component.nemaForm = nemaService.initFormFromObj(makeNemaInputs({ motorRPM: null }));
      await component.calculate();
      expect(psatServiceSpy.nema).not.toHaveBeenCalled();
      expect(component.tefcValue).toBe(0);
    });

    it('stores the inputs on the service when standalone', async () => {
      createComponent();
      component.nemaForm = nemaService.initFormFromObj(makeNemaInputs());
      await component.calculate();
      expect(nemaService.nemaInputs).toEqual(makeNemaInputs());
    });

    it('saves the inputs to a saved calculator when in an assessment', async () => {
      const calculator = { id: 3, assessmentId: 7, nemaInputs: makeNemaInputs() } as Calculator;
      calculatorDbServiceSpy.getByAssessmentId.and.returnValue(calculator);
      createComponent({ settings: HP_SETTINGS, inAssessment: true, assessment: MOCK_ASSESSMENT });
      await fixture.whenStable();
      component.nemaForm.patchValue({ horsePower: 125 });
      await component.calculate();
      expect(calculator.nemaInputs.horsePower).toBe(125);
      expect(calculatorDbServiceSpy.saveAssessmentCalculator).toHaveBeenCalledWith(MOCK_ASSESSMENT, calculator);
      expect(nemaService.nemaInputs).toBeUndefined();
    });
  });

  describe('user actions', () => {
    it('btnResetData resets the form to 200 hp and recalculates', () => {
      createComponent();
      component.nemaForm = nemaService.initFormFromObj(makeNemaInputs());
      component.btnResetData();
      expect(component.nemaForm.controls.horsePower.value).toBe(200);
      expect(component.nemaForm.controls.motorRPM.value).toBe(0);
      expect(psatServiceSpy.nema).toHaveBeenCalledWith(60, 0, 0, '' as any, 200, HP_SETTINGS);
    });

    it('btnResetData uses 150 kW for metric settings', () => {
      createComponent({ settings: KW_METRIC_SETTINGS });
      component.btnResetData();
      expect(component.nemaForm.controls.horsePower.value).toBe(150);
    });

    it('btnGenerateExample loads the example form and recalculates', () => {
      createComponent();
      component.btnGenerateExample();
      expect(nemaService.getObjFromForm(component.nemaForm)).toEqual(
        { frequency: 60, horsePower: 200, efficiencyClass: 0, motorRPM: 1200, efficiency: '' } as any);
      expect(psatServiceSpy.nema).toHaveBeenCalled();
      expect(component.tefcValue).toBe(94.5);
    });

    it('btnGenerateExample uses 150 kW for metric settings', () => {
      createComponent({ settings: KW_METRIC_SETTINGS });
      component.btnGenerateExample();
      expect(component.nemaForm.controls.horsePower.value).toBe(150);
    });

    it('changeField stores the focused field', () => {
      createComponent();
      component.changeField('motorRPM');
      expect(component.currentField).toBe('motorRPM');
    });

    it('setSmallScreenTab stores the selected small-screen tab', () => {
      createComponent();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    it('shows the graph and hides the help on the results tab', () => {
      createComponent();
      expect(query('app-nema-energy-efficiency-graph')).not.toBeNull();
      expect(query('app-nema-energy-efficiency-help')).toBeNull();
    });

    it('shows the help and hides the graph on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-nema-energy-efficiency-help')).not.toBeNull();
      expect(query('app-nema-energy-efficiency-graph')).toBeNull();
    });

    it('hides both panels for an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-nema-energy-efficiency-help')).toBeNull();
      expect(query('app-nema-energy-efficiency-graph')).toBeNull();
    });

    it('switches tabs when the tab links are clicked', () => {
      createComponent();
      const tabLinks: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'));
      tabLinks[1].click();
      fixture.detectChanges();
      expect(query('app-nema-energy-efficiency-help')).not.toBeNull();
      tabLinks[0].click();
      fixture.detectChanges();
      expect(query('app-nema-energy-efficiency-graph')).not.toBeNull();
      expect(query('app-nema-energy-efficiency-help')).toBeNull();
    });
  });
});
