import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SteamPropertiesComponent } from './steam-properties.component';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SteamPropertiesOutput } from '../../../shared/models/steam/steam-outputs';
import { ThermodynamicQuantity } from '../../../shared/models/steam/steam-inputs';

const MOCK_SETTINGS = { steamPressureMeasurement: 'psig', steamTemperatureMeasurement: 'F' } as Settings;
const RANGES = { minPressure: -14.696, maxPressure: 3185, minQuantityValue: 32, maxQuantityValue: 1472 };

function makeOutput(): SteamPropertiesOutput {
  return { pressure: 1678, temperature: 158.5, specificEnthalpy: 130.5, specificEntropy: 0.23, quality: 0, specificVolume: 0.016 };
}

describe('SteamPropertiesComponent', () => {
  let component: SteamPropertiesComponent;
  let fixture: ComponentFixture<SteamPropertiesComponent>;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(settings: Settings = MOCK_SETTINGS): void {
    fixture = TestBed.createComponent(SteamPropertiesComponent);
    component = fixture.componentInstance;
    if (settings) {
      fixture.componentRef.setInput('settings', settings);
    }
    fixture.detectChanges();
    flush();
  }

  function setTab(tab: string): void {
    component.setTab(tab);
    fixture.detectChanges();
    flush();
  }

  function setGraph(value: number): void {
    component.graphToggleForm.controls.graphToggle.setValue(value);
    fixture.detectChanges();
    query('#graphToggle').dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getSteamPropertiesValidationRanges', 'steamProperties']);
    steamServiceSpy.getSteamPropertiesValidationRanges.and.returnValue(RANGES);
    steamServiceSpy.steamProperties.and.returnValue(makeOutput());
    steamServiceSpy.steamPropertiesInput = undefined;
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SteamPropertiesComponent],
      providers: [
        UntypedFormBuilder,
        ConvertUnitsService,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event and builds a temperature form with its ranges', fakeAsync(() => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-properties');
      expect(steamServiceSpy.getSteamPropertiesValidationRanges).toHaveBeenCalledWith(ThermodynamicQuantity.TEMPERATURE, MOCK_SETTINGS);
      expect(component.steamPropertiesForm.controls.thermodynamicQuantity.value).toBe(ThermodynamicQuantity.TEMPERATURE);
      expect(component.ranges).toEqual(RANGES);
    }));

    it('falls back to global settings when no settings input is given', fakeAsync(() => {
      createComponent(null);
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
    }));

    it('does not calculate an empty default form', fakeAsync(() => {
      createComponent();
      expect(steamServiceSpy.steamProperties).not.toHaveBeenCalled();
      expect(component.validPlot).toBeFalse();
      expect(steamServiceSpy.steamPropertiesInput).toEqual({ quantityValue: '', thermodynamicQuantity: 0, pressure: '' } as any);
    }));

    it('builds the form from saved inputs and calculates them', fakeAsync(() => {
      steamServiceSpy.steamPropertiesInput = { pressure: 100, thermodynamicQuantity: ThermodynamicQuantity.TEMPERATURE, quantityValue: 400 };
      createComponent();
      expect(steamServiceSpy.steamProperties).toHaveBeenCalledWith({ quantityValue: 400, thermodynamicQuantity: 0, pressure: 100 }, MOCK_SETTINGS);
      expect(component.steamPropertiesOutput).toEqual(makeOutput());
      expect(component.validPlot).toBeTrue();
    }));

    it('opens the default panel tab from global settings', fakeAsync(() => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    }));
  });

  describe('panel tabs', () => {
    it('shows the graph panel and hides help on the results tab', fakeAsync(() => {
      createComponent();
      expect(query('#graphToggle')).toBeTruthy();
      expect(query('app-steam-properties-help')).toBeNull();
    }));

    it('shows help and hides the graph panel and both charts on the help tab', fakeAsync(() => {
      createComponent();
      setTab('help');
      expect(query('app-steam-properties-help')).toBeTruthy();
      expect(query('#graphToggle')).toBeNull();
      expect(query('app-steam-properties-chart')).toBeNull();
      expect(query('app-steam-properties-ph-chart')).toBeNull();
    }));

    it('returns to the graph panel when the graph tab is clicked', fakeAsync(() => {
      createComponent();
      setTab('help');
      (fixture.nativeElement.querySelectorAll('.panel-tab-item a')[0] as HTMLElement).click();
      fixture.detectChanges();
      flush();
      expect(component.tabSelect).toBe('results');
      expect(query('#graphToggle')).toBeTruthy();
    }));
  });

  describe('graph toggle', () => {
    it('shows the T-S chart by default', fakeAsync(() => {
      createComponent();
      expect(query('app-steam-properties-chart')).toBeTruthy();
      expect(query('app-steam-properties-ph-chart')).toBeNull();
    }));

    it('shows the P-H chart when the toggle selects it', fakeAsync(() => {
      createComponent();
      setGraph(1);
      expect(component.graphToggle).toBe('1');
      expect(query('app-steam-properties-chart')).toBeNull();
      expect(query('app-steam-properties-ph-chart')).toBeTruthy();
    }));

    it('switches back to the T-S chart', fakeAsync(() => {
      createComponent();
      setGraph(1);
      setGraph(0);
      expect(query('app-steam-properties-chart')).toBeTruthy();
      expect(query('app-steam-properties-ph-chart')).toBeNull();
    }));
  });

  describe('user actions', () => {
    it('updates the current field', fakeAsync(() => {
      createComponent();
      component.setField('quantityValue');
      expect(component.currentField).toBe('quantityValue');
    }));

    it('updates the ranges and validators when the known quantity changes', fakeAsync(() => {
      createComponent();
      const enthalpyRanges = { minPressure: -14.696, maxPressure: 3185, minQuantityValue: 10, maxQuantityValue: 20 };
      steamServiceSpy.getSteamPropertiesValidationRanges.and.returnValue(enthalpyRanges);
      component.updateForm(ThermodynamicQuantity.ENTHALPY);
      component.steamPropertiesForm.controls.quantityValue.setValue(25);
      expect(component.ranges).toEqual(enthalpyRanges);
      expect(component.steamPropertiesForm.controls.quantityValue.errors.max).toBeTruthy();
    }));

    it('creates a table row from the current output', fakeAsync(() => {
      steamServiceSpy.steamPropertiesInput = { pressure: 100, thermodynamicQuantity: ThermodynamicQuantity.TEMPERATURE, quantityValue: 400 };
      createComponent();
      (query('.btn-add-row') as HTMLElement).click();
      expect(component.data).toEqual({ pressure: 1678, thermodynamicQuantity: 0, temperature: 158.5, enthalpy: 130.5, entropy: 0.23, volume: 0.016, quality: 0 });
    }));

    it('resets the inputs to zero and toggles the reset flag', fakeAsync(() => {
      createComponent();
      const toggle = component.toggleResetData;
      component.btnResetData();
      expect(component.steamPropertiesForm.controls.pressure.value).toBe(0);
      expect(component.steamPropertiesForm.controls.quantityValue.value).toBe(0);
      expect(component.toggleResetData).toBe(!toggle);
    }));

    it('generates the example inputs and calculates them', fakeAsync(() => {
      createComponent();
      const toggle = component.toggleExampleData;
      component.btnGenerateExample();
      expect(steamServiceSpy.steamProperties).toHaveBeenCalledWith({ quantityValue: 158.5, thermodynamicQuantity: 0, pressure: 1678 }, MOCK_SETTINGS);
      expect(component.toggleExampleData).toBe(!toggle);
    }));

    it('sets the small screen tab', fakeAsync(() => {
      createComponent();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    }));
  });
});
