import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SaturatedPropertiesComponent } from './saturated-properties.component';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SaturatedPropertiesOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = { steamPressureMeasurement: 'psig', steamTemperatureMeasurement: 'F' } as Settings;

function makeOutput(): SaturatedPropertiesOutput {
  return {
    saturatedPressure: 100,
    saturatedTemperature: 337.9,
    liquidEnthalpy: 308.5,
    gasEnthalpy: 1188.3,
    evaporationEnthalpy: 879.8,
    liquidEntropy: 0.4877,
    gasEntropy: 1.6032,
    evaporationEntropy: 1.1155,
    liquidVolume: 0.0179,
    gasVolume: 4.4322,
    evaporationVolume: 4.4143,
  };
}

function makeSteamService(): Partial<SteamService> & { saturatedProperties: jasmine.Spy } {
  return {
    STEAM_TEMPERATURE_MIN_F: 32,
    SATURATED_STEAM_TEMPERATURE_MAX_F: 705.1,
    BOILER_PRESSURE_EXCLUSIVE_MIN_PSIG: -14.696,
    SATURATED_BOILER_PRESSURE_MAX_PSIG: 3185.415389,
    saturatedPropertiesInputs: undefined,
    saturatedProperties: jasmine.createSpy('saturatedProperties').and.returnValue(makeOutput()),
  } as any;
}

describe('SaturatedPropertiesComponent', () => {
  let component: SaturatedPropertiesComponent;
  let fixture: ComponentFixture<SaturatedPropertiesComponent>;
  let steamServiceMock: ReturnType<typeof makeSteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(settings: Settings = MOCK_SETTINGS): void {
    fixture = TestBed.createComponent(SaturatedPropertiesComponent);
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

  beforeEach(async () => {
    steamServiceMock = makeSteamService();
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SaturatedPropertiesComponent],
      providers: [
        UntypedFormBuilder,
        ConvertUnitsService,
        { provide: SteamService, useValue: steamServiceMock },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event and builds the forms', fakeAsync(() => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-saturated-properties');
      expect(component.graphToggleForm.controls.graphToggle.value).toBe(0);
      expect(component.saturatedPropertiesForm.controls.pressureOrTemperature.value).toBe(0);
    }));

    it('falls back to global settings when no settings input is given', fakeAsync(() => {
      createComponent(null);
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
    }));

    it('computes the ranges from the steam service limits', fakeAsync(() => {
      createComponent();
      expect(component.ranges).toEqual({ minTemp: 32, maxTemp: 705.1, minPressure: -14.696, maxPressure: 3185.415389 });
    }));

    it('does not calculate an empty default form', fakeAsync(() => {
      createComponent();
      expect(steamServiceMock.saturatedProperties).not.toHaveBeenCalled();
      expect(component.validPlot).toBeFalse();
      expect(steamServiceMock.saturatedPropertiesInputs.inputs.saturatedPressure as any).toBe('');
    }));

    it('builds the form from saved inputs and calculates them', fakeAsync(() => {
      steamServiceMock.saturatedPropertiesInputs = { pressureOrTemperature: 0, inputs: { saturatedPressure: 100, saturatedTemperature: 300 } };
      createComponent();
      expect(component.saturatedPropertiesForm.controls.saturatedPressure.value).toBe(100);
      expect(steamServiceMock.saturatedProperties).toHaveBeenCalledWith({ saturatedTemperature: 300, saturatedPressure: 100 }, 0, MOCK_SETTINGS);
      expect(component.saturatedPropertiesOutput).toEqual(makeOutput());
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
      expect(query('app-saturated-properties-help')).toBeNull();
    }));

    it('shows help and hides the graph panel and both charts on the help tab', fakeAsync(() => {
      createComponent();
      setTab('help');
      expect(query('app-saturated-properties-help')).toBeTruthy();
      expect(query('#graphToggle')).toBeNull();
      expect(query('app-saturated-properties-chart')).toBeNull();
      expect(query('app-saturated-properties-ph-chart')).toBeNull();
    }));

    it('returns to the graph panel when the graph tab is clicked', fakeAsync(() => {
      createComponent();
      setTab('help');
      const graphTab = Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'))[0] as HTMLElement;
      graphTab.click();
      fixture.detectChanges();
      flush();
      expect(component.tabSelect).toBe('results');
      expect(query('#graphToggle')).toBeTruthy();
    }));
  });

  describe('graph toggle', () => {
    it('shows the T-S chart by default', fakeAsync(() => {
      createComponent();
      expect(query('app-saturated-properties-chart')).toBeTruthy();
      expect(query('app-saturated-properties-ph-chart')).toBeNull();
    }));

    it('shows the P-H chart when the toggle selects it', fakeAsync(() => {
      createComponent();
      component.graphToggleForm.controls.graphToggle.setValue(1);
      fixture.detectChanges();
      query('#graphToggle').dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(component.graphToggle).toBe('1');
      expect(query('app-saturated-properties-chart')).toBeNull();
      expect(query('app-saturated-properties-ph-chart')).toBeTruthy();
    }));

    it('switches back to the T-S chart', fakeAsync(() => {
      createComponent();
      component.graphToggleForm.controls.graphToggle.setValue(1);
      component.toggleGraph();
      component.graphToggleForm.controls.graphToggle.setValue(0);
      component.toggleGraph();
      fixture.detectChanges();
      expect(query('app-saturated-properties-chart')).toBeTruthy();
      expect(query('app-saturated-properties-ph-chart')).toBeNull();
    }));
  });

  describe('user actions', () => {
    it('updates the current field', fakeAsync(() => {
      createComponent();
      component.setField('saturatedTemperature');
      expect(component.currentField).toBe('saturatedTemperature');
    }));

    it('creates a table row from the current output', fakeAsync(() => {
      steamServiceMock.saturatedPropertiesInputs = { pressureOrTemperature: 0, inputs: { saturatedPressure: 100, saturatedTemperature: 300 } };
      createComponent();
      (query('.btn-add-row') as HTMLElement).click();
      expect(component.data).toEqual({
        pressure: 100, temperature: 337.9, satLiquidEnthalpy: 308.5, evapEnthalpy: 879.8, satGasEnthalpy: 1188.3,
        satLiquidEntropy: 0.4877, evapEntropy: 1.1155, satGasEntropy: 1.6032, satLiquidVolume: 0.0179, evapVolume: 4.4143, satGasVolume: 4.4322,
      });
    }));

    it('resets the data to an empty form and toggles the reset flag', fakeAsync(() => {
      steamServiceMock.saturatedPropertiesInputs = { pressureOrTemperature: 0, inputs: { saturatedPressure: 100, saturatedTemperature: 300 } };
      createComponent();
      const toggle = component.toggleResetData;
      component.btnResetData();
      expect(component.saturatedPropertiesForm.controls.saturatedPressure.value).toBe('');
      expect(component.saturatedPropertiesOutput.saturatedPressure).toBe(0);
      expect(component.toggleResetData).toBe(!toggle);
    }));

    it('generates the example inputs and calculates them', fakeAsync(() => {
      createComponent();
      const toggle = component.toggleExampleData;
      component.btnGenerateExample();
      expect(component.saturatedPropertiesForm.controls.saturatedPressure.value).toBe(2700);
      expect(component.saturatedPropertiesForm.controls.saturatedTemperature.value).toBe(580);
      expect(steamServiceMock.saturatedProperties).toHaveBeenCalledWith({ saturatedTemperature: 580, saturatedPressure: 2700 }, 0, MOCK_SETTINGS);
      expect(component.toggleExampleData).toBe(!toggle);
    }));

    it('sets the small screen tab', fakeAsync(() => {
      createComponent();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    }));
  });
});
