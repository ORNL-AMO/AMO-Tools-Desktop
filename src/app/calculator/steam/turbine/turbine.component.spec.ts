import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { TurbineComponent } from './turbine.component';
import { TurbineService } from './turbine.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { TurbineOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamMassFlowMeasurement: 'klb',
} as Settings;

const MOCK_RESULTS = { powerOut: 42 } as TurbineOutput;

describe('TurbineComponent', () => {
  let component: TurbineComponent;
  let fixture: ComponentFixture<TurbineComponent>;
  let turbineService: TurbineService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(TurbineComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange', 'turbine']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 0, max: 5000 });
    steamServiceSpy.turbine.and.returnValue(MOCK_RESULTS);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TurbineComponent],
      providers: [
        TurbineService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    turbineService = TestBed.inject(TurbineService);
  });

  describe('initialization', () => {
    it('sends the analytics event and builds a reset form when no input is saved', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-turbine');
      expect(component.turbineForm.controls.inletPressure.value).toBe(0);
      expect(turbineService.turbineInput).toEqual(component.input);
    });

    it('builds the form from the saved input', () => {
      turbineService.turbineInput = turbineService.getObjFromForm(turbineService.initOutletForm(MOCK_SETTINGS));
      createComponent();
      expect(component.turbineForm.controls.inletPressure.value).toBe(66.4);
      expect(steamServiceSpy.turbine).toHaveBeenCalledWith(component.input, MOCK_SETTINGS);
      expect(component.results).toBe(MOCK_RESULTS);
    });

    it('falls back to global settings and default panel tab', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent({});
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('calculation', () => {
    beforeEach(() => createComponent());

    it('calculates results for a valid form and clears the warning', () => {
      const form = turbineService.initOutletForm(MOCK_SETTINGS);
      component.calculate(form);
      expect(steamServiceSpy.turbine).toHaveBeenCalledWith(turbineService.getObjFromForm(form), MOCK_SETTINGS);
      expect(component.results).toBe(MOCK_RESULTS);
      expect(component.warning).toBeNull();
    });

    it('returns empty results for an invalid form', () => {
      steamServiceSpy.turbine.calls.reset();
      const form = turbineService.initOutletForm(MOCK_SETTINGS);
      form.controls.generatorEfficiency.setValue(null);
      component.calculate(form);
      expect(steamServiceSpy.turbine).not.toHaveBeenCalled();
      expect(component.results).toEqual(component.getEmptyResults());
    });

    it('sets a warning when outlet pressure exceeds inlet pressure', () => {
      const form = turbineService.initOutletForm(MOCK_SETTINGS);
      form.controls.outletSteamPressure.setValue(100);
      component.calculate(form);
      expect(component.warning).toBe('Outlet pressure of the turbine cannot be greater than the inlet pressure.');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => createComponent());

    it('hides the warning when there is none', () => {
      component.calculate(turbineService.initOutletForm(MOCK_SETTINGS));
      fixture.detectChanges();
      expect(query('.alert-warning')).toBeNull();
    });

    it('shows the warning text when set', () => {
      const form = turbineService.initOutletForm(MOCK_SETTINGS);
      form.controls.outletSteamPressure.setValue(100);
      component.calculate(form);
      fixture.detectChanges();
      expect(query('.alert-warning').textContent.trim()).toBe('Outlet pressure of the turbine cannot be greater than the inlet pressure.');
    });

    it('shows an empty warning element when the warning is undefined', () => {
      component.warning = undefined;
      fixture.detectChanges();
      expect(query('.alert-warning')).not.toBeNull();
      expect(query('.alert-warning').textContent.trim()).toBe('');
    });

    it('shows results and hides help on the results tab', () => {
      expect(query('app-turbine-results')).not.toBeNull();
      expect(query('app-turbine-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-turbine-help')).not.toBeNull();
      expect(query('app-turbine-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-turbine-help')).toBeNull();
      expect(query('app-turbine-results')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('resets the form and recalculates', () => {
      component.turbineForm = turbineService.initOutletForm(MOCK_SETTINGS);
      component.btnResetData();
      expect(component.turbineForm.controls.inletPressure.value).toBe(0);
      expect(component.input.inletPressure).toBe(0);
    });

    it('generates the outlet example when solving for outlet properties', () => {
      component.btnGenerateExample();
      expect(component.toggleGenerateExample).toBe(true);
      expect(component.turbineForm.controls.solveFor.value).toBe(0);
      expect(component.input.inletPressure).toBe(66.4);
    });

    it('generates the isentropic example when solving for isentropic efficiency', () => {
      component.turbineForm.controls.solveFor.setValue(1);
      component.btnGenerateExample();
      expect(component.turbineForm.controls.solveFor.value).toBe(1);
      expect(component.input.inletPressure).toBe(847.5);
    });

    it('sets the current field and small screen tab', () => {
      component.changeField('inletPressure');
      component.setSmallScreenTab('details');
      expect(component.currentField).toBe('inletPressure');
      expect(component.smallScreenTab).toBe('details');
    });
  });
});
