import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { BoilerBlowdownRateComponent } from './boiler-blowdown-rate.component';
import { BoilerBlowdownRateInputs, BoilerBlowdownRateService } from './boiler-blowdown-rate.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  steamMassFlowMeasurement: 'klb',
  steamTemperatureMeasurement: 'F',
  steamEnergyMeasurement: 'MMBtu',
  steamVolumeMeasurement: 'gal',
  fuelCost: 5,
  waterCost: 0.003,
} as Settings;

function makeInputs(overrides: Partial<BoilerBlowdownRateInputs> = {}): BoilerBlowdownRateInputs {
  return {
    steamFlow: 100, steamTemperature: 500, feedwaterConductivity: 400, blowdownConductivity: 4000,
    makeupWaterTemperature: 50, fuelCost: 5, waterCost: 0.003, operatingHours: 8000, boilerEfficiency: 80,
    boilerUtilityType: 'Natural Gas', ...overrides
  };
}

describe('BoilerBlowdownRateComponent', () => {
  let component: BoilerBlowdownRateComponent;
  let fixture: ComponentFixture<BoilerBlowdownRateComponent>;
  let service: BoilerBlowdownRateService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function formCount(): number {
    return fixture.nativeElement.querySelectorAll('app-blowdown-rate-form').length;
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(BoilerBlowdownRateComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      declarations: [BoilerBlowdownRateComponent],
      providers: [
        BoilerBlowdownRateService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: jasmine.createSpyObj('SteamService', ['saturatedProperties', 'steamProperties']) },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    service = TestBed.inject(BoilerBlowdownRateService);
  });

  describe('initialization', () => {
    it('sends the analytics event and sets default baseline inputs', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-boiler-blowdown-rate');
      expect(component.baselineInputs).toEqual(service.getDefaultInputs(MOCK_SETTINGS));
      expect(component.modificationExists).toBe(false);
    });

    it('keeps existing baseline inputs', () => {
      service.baselineInputs.next(makeInputs());
      createComponent();
      expect(component.baselineInputs).toEqual(makeInputs());
    });

    it('tracks existing modification inputs', () => {
      service.modificationInputs.next(makeInputs({ steamFlow: 5 }));
      createComponent();
      expect(component.modificationExists).toBe(true);
      expect(component.modificationInputs.steamFlow).toBe(5);
    });

    it('tracks the modal open state', () => {
      createComponent();
      service.modalOpen.next(true);
      expect(component.isModalOpen).toBe(true);
    });

    it('falls back to global settings and default panel tab', () => {
      settingsDbServiceMock.globalSettings.defaultPanelTab = 'help';
      createComponent({});
      expect(component.settings).toBe(settingsDbServiceMock.globalSettings);
      expect(component.tabSelect).toBe('help');
    });
  });

  describe('template visibility', () => {
    it('shows the add-modification prompt without a modification', () => {
      createComponent();
      expect(formCount()).toBe(1);
      expect(query('.no-data')).not.toBeNull();
    });

    it('shows the modification form and hides the prompt with a modification', () => {
      createComponent();
      component.createModification();
      fixture.detectChanges();
      expect(formCount()).toBe(2);
      expect(query('.no-data')).toBeNull();
    });

    it('hides treasure hunt actions outside treasure hunt', () => {
      createComponent();
      expect(query('.fa-save')).toBeNull();
      expect(query('.treasure-hunt-help')).toBeNull();
    });

    it('shows treasure hunt actions in treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-blowdown-rate-results')).not.toBeNull();
      expect(query('app-blowdown-rate-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-blowdown-rate-help')).not.toBeNull();
      expect(query('app-blowdown-rate-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-blowdown-rate-help')).toBeNull();
      expect(query('app-blowdown-rate-results')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('creates a modification copied from the baseline', () => {
      service.baselineInputs.next(makeInputs({ steamFlow: 77 }));
      component.createModification();
      expect(service.modificationInputs.getValue()).toEqual(makeInputs({ steamFlow: 77 }));
      expect(component.baselineSelected).toBe(false);
    });

    it('resets the data', () => {
      component.btnGenerateExample();
      component.btnResetData();
      fixture.detectChanges();
      expect(service.modificationInputs.getValue()).toBeUndefined();
      expect(service.baselineInputs.getValue()).toEqual(service.getDefaultInputs(MOCK_SETTINGS));
      expect(service.showBoiler.getValue()).toBe(false);
      expect(service.showOperations.getValue()).toBe(false);
      expect(service.operatingHours.getValue()).toBeUndefined();
      expect(query('.no-data')).not.toBeNull();
    });

    it('generates the example', () => {
      component.btnGenerateExample();
      fixture.detectChanges();
      const example = service.getExampleInputs(MOCK_SETTINGS);
      expect(service.baselineInputs.getValue()).toEqual(example.baseline);
      expect(service.modificationInputs.getValue()).toEqual(example.modification);
      expect(service.showBoiler.getValue()).toBe(true);
      expect(service.showOperations.getValue()).toBe(true);
      expect(formCount()).toBe(2);
    });

    it('emits the save payload', () => {
      const emitted = [];
      component.emitSave.subscribe(v => emitted.push(v));
      component.save();
      expect(emitted).toEqual([{ baseline: component.baselineInputs, modification: component.modificationInputs, opportunityType: Treasure.boilerBlowdownRate }]);
    });

    it('emits cancel', () => {
      const emitted = [];
      component.emitCancel.subscribe(v => emitted.push(v));
      component.cancel();
      expect(emitted).toEqual([true]);
    });

    it('selects baseline or modification from the small screen tabs', () => {
      component.setSmallScreenTab('modification');
      expect(component.baselineSelected).toBe(false);
      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBe(true);
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
      expect(component.baselineSelected).toBe(true);
    });
  });

  describe('destroy', () => {
    it('keeps the inputs on the service when standalone', () => {
      service.baselineInputs.next(makeInputs());
      createComponent();
      fixture.destroy();
      expect(service.baselineInputs.getValue()).toEqual(makeInputs());
    });

    it('clears the inputs in treasure hunt', () => {
      service.modificationInputs.next(makeInputs());
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      fixture.destroy();
      expect(service.baselineInputs.getValue()).toBeUndefined();
      expect(service.modificationInputs.getValue()).toBeUndefined();
    });

    it('stops tracking service changes after destroy', () => {
      createComponent();
      fixture.destroy();
      service.modificationInputs.next(makeInputs());
      service.modalOpen.next(true);
      expect(component.modificationExists).toBe(false);
      expect(component.isModalOpen).toBe(false);
    });
  });
});
