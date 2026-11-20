import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrvComponent } from './prv.component';
import { PrvService } from './prv.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../settings/settings.service';
import { PrvInput } from '../../../shared/models/steam/steam-inputs';
import { PrvOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;
const WARNING = 'Outlet specific enthalpy associated with set desuperheating temperature is greater than inlet specific enthalpy. Desuperheating canceled.';

function makeResults(overrides: Partial<PrvOutput> = {}): PrvOutput {
  return { inletSpecificEnthalpy: 1200, outletSpecificEnthalpy: 1100, inletTemperature: 400, ...overrides } as PrvOutput;
}

function makePrvInput(overrides: Partial<PrvInput> = {}): PrvInput {
  return {
    inletPressure: 143, thermodynamicQuantity: 0, quantityValue: 500, inletMassFlow: 30, outletPressure: 50,
    feedwaterPressure: 100, feedwaterThermodynamicQuantity: 0, feedwaterQuantityValue: 200, desuperheatingTemp: 400,
    ...overrides
  };
}

describe('PrvComponent', () => {
  let component: PrvComponent;
  let fixture: ComponentFixture<PrvComponent>;
  let prvService: PrvService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(PrvComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  function useSavedInput(isSuperHeating: boolean, overrides: Partial<PrvInput> = {}): void {
    prvService.prvInput = makePrvInput(overrides);
    prvService.isSuperHeating = isSuperHeating;
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange', 'saturatedProperties', 'prvWithDesuperheating', 'prvWithoutDesuperheating']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 32, max: 1472 });
    steamServiceSpy.saturatedProperties.and.returnValue({ saturatedTemperature: 250 } as any);
    steamServiceSpy.prvWithDesuperheating.and.returnValue(makeResults());
    steamServiceSpy.prvWithoutDesuperheating.and.returnValue(makeResults());
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [PrvComponent],
      providers: [
        PrvService,
        ConvertUnitsService,
        FormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    prvService = TestBed.inject(PrvService);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-prv');
    });

    it('builds reset forms without desuperheating when the service has no saved input', () => {
      createComponent();
      expect(component.inletForm.controls.inletPressure.value).toBe(0);
      expect(component.feedwaterForm.controls.feedwaterThermodynamicQuantity.value).toBe(2);
      expect(component.isSuperHeating).toBeFalse();
    });

    it('builds the forms and desuperheating flag from saved service input', () => {
      useSavedInput(true);
      createComponent();
      expect(component.inletForm.controls.inletPressure.value).toBe(143);
      expect(component.feedwaterForm.controls.feedwaterPressure.value).toBe(100);
      expect(component.isSuperHeating).toBeTrue();
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent({});
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
    });

    it('uses the global default panel tab when set', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('calculation', () => {
    it('calculates without desuperheating when the inlet form is valid', () => {
      useSavedInput(false);
      createComponent();
      expect(steamServiceSpy.prvWithoutDesuperheating).toHaveBeenCalledWith(component.input, MOCK_SETTINGS);
      expect(steamServiceSpy.prvWithDesuperheating).not.toHaveBeenCalled();
      expect(component.results).toEqual(makeResults());
    });

    it('calculates with desuperheating when both forms are valid', () => {
      useSavedInput(true);
      createComponent();
      expect(steamServiceSpy.prvWithDesuperheating).toHaveBeenCalledWith(component.input, MOCK_SETTINGS);
      expect(component.results).toEqual(makeResults());
    });

    it('returns empty results without desuperheating when the inlet form is invalid', () => {
      useSavedInput(false);
      createComponent();
      steamServiceSpy.prvWithoutDesuperheating.calls.reset();
      component.inletForm.controls.inletPressure.setValue(null);
      component.setInletForm(component.inletForm);
      expect(steamServiceSpy.prvWithoutDesuperheating).not.toHaveBeenCalled();
      expect(component.results.inletPressure).toBe(0);
    });

    it('returns empty results with desuperheating when the feedwater form is invalid', () => {
      useSavedInput(true);
      createComponent();
      steamServiceSpy.prvWithDesuperheating.calls.reset();
      component.feedwaterForm.controls.feedwaterPressure.setValue(null);
      component.setFeedwaterForm(component.feedwaterForm);
      expect(steamServiceSpy.prvWithDesuperheating).not.toHaveBeenCalled();
      expect(component.results.inletPressure).toBe(0);
    });

    it('stores the input and desuperheating flag on the service', () => {
      useSavedInput(true);
      createComponent();
      component.inletForm.controls.inletPressure.setValue(150);
      component.setInletForm(component.inletForm);
      expect(prvService.prvInput.inletPressure).toBe(150);
      expect(prvService.isSuperHeating).toBeTrue();
    });

    it('updates the desuperheating temperature minimum when the outlet pressure changes', () => {
      useSavedInput(true);
      createComponent();
      steamServiceSpy.saturatedProperties.and.returnValue({ saturatedTemperature: 450 } as any);
      component.inletForm.controls.outletPressure.setValue(80);
      component.setInletForm(component.inletForm);
      expect(steamServiceSpy.saturatedProperties).toHaveBeenCalledWith({ saturatedPressure: 80 }, 0, MOCK_SETTINGS);
      expect(component.feedwaterForm.controls.desuperheatingTemp.errors.min.min).toBe(450);
      expect(component.feedwaterForm.controls.desuperheatingTemp.dirty).toBeTrue();
    });
  });

  describe('checkWarning', () => {
    beforeEach(() => createComponent());

    it('warns when outlet enthalpy exceeds inlet enthalpy', () => {
      component.checkWarning(makeResults({ outletSpecificEnthalpy: 1300 }), makePrvInput());
      expect(component.warning).toBe(WARNING);
    });

    it('warns when the desuperheating temperature exceeds the inlet temperature', () => {
      component.checkWarning(makeResults(), makePrvInput({ desuperheatingTemp: 573.15 }));
      expect(component.warning).toBe(WARNING);
    });

    it('clears the warning when the desuperheating temperature is below the inlet temperature', () => {
      component.warning = WARNING;
      component.checkWarning(makeResults(), makePrvInput({ desuperheatingTemp: 273.15 }));
      expect(component.warning).toBeNull();
    });

    it('clears the warning when there is no desuperheating temperature', () => {
      component.warning = WARNING;
      component.checkWarning(makeResults(), makePrvInput({ desuperheatingTemp: undefined }));
      expect(component.warning).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      useSavedInput(true);
      createComponent();
    });

    it('resets to forms without desuperheating', () => {
      component.btnResetData();
      expect(component.isSuperHeating).toBeFalse();
      expect(component.inletForm.controls.inletPressure.value).toBe(0);
    });

    it('generates the example with desuperheating', () => {
      component.btnResetData();
      component.btnGenerateExample();
      expect(component.isSuperHeating).toBeTrue();
      expect(component.inletForm.controls.inletPressure.value).toBe(143);
      expect(steamServiceSpy.prvWithDesuperheating).toHaveBeenCalled();
    });

    it('sets the selected tab, field and small screen tab', () => {
      component.setTab('help');
      component.changeField('outletPressure');
      component.setSmallScreenTab('details');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('outletPressure');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    it('shows the feedwater form with desuperheating', () => {
      useSavedInput(true);
      createComponent();
      expect(query('app-feedwater-form')).not.toBeNull();
    });

    it('hides the feedwater form without desuperheating', () => {
      useSavedInput(false);
      createComponent();
      expect(query('app-feedwater-form')).toBeNull();
    });

    it('hides the warning when there is none', () => {
      createComponent();
      expect(query('.alert-warning')).toBeNull();
    });

    it('shows the warning text when set', () => {
      createComponent();
      component.warning = WARNING;
      fixture.detectChanges();
      expect(query('.alert-warning').textContent.trim()).toBe(WARNING);
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-prv-results')).not.toBeNull();
      expect(query('app-prv-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-prv-help')).not.toBeNull();
      expect(query('app-prv-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-prv-help')).toBeNull();
      expect(query('app-prv-results')).toBeNull();
    });
  });
});
