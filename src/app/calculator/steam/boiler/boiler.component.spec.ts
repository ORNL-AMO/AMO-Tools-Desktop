import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BoilerComponent } from './boiler.component';
import { BoilerService } from './boiler.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { BoilerInput } from '../../../shared/models/steam/steam-inputs';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
  steamEnergyMeasurement: 'MMBtu'
} as Settings;

function makeInput(steamPressure: number = 200): BoilerInput {
  return {
    deaeratorPressure: 15,
    combustionEfficiency: 85,
    blowdownRate: 2,
    steamPressure: steamPressure,
    thermodynamicQuantity: 0,
    quantityValue: 500,
    steamMassFlow: 45
  };
}

function makeOutput(fuelEnergy: number): BoilerOutput {
  return { fuelEnergy: fuelEnergy } as BoilerOutput;
}

describe('BoilerComponent', () => {
  let component: BoilerComponent;
  let fixture: ComponentFixture<BoilerComponent>;
  let boilerService: BoilerService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(BoilerComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['boiler', 'getQuantityRange']);
    steamServiceSpy.boiler.and.returnValue(makeOutput(60));
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 0, max: 1000 });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [BoilerComponent],
      providers: [
        BoilerService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    boilerService = TestBed.inject(BoilerService);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-boiler');
    });

    it('builds a reset form when the service has no saved input', () => {
      createComponent();
      expect(component.boilerForm.controls.steamPressure.value).toBe(0);
    });

    it('builds the form from the saved service input when present', () => {
      boilerService.boilerInput = makeInput(300);
      createComponent();
      expect(component.boilerForm.controls.steamPressure.value).toBe(300);
      expect(component.input).toEqual(makeInput(300));
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

    it('defaults to the results tab when no global default panel tab is set', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });
  });

  describe('observeModalOpen', () => {
    it('tracks the modal open state from the service', () => {
      createComponent();
      expect(component.isModalOpen).toBeFalse();
      boilerService.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
      boilerService.modalOpen.next(false);
      expect(component.isModalOpen).toBeFalse();
    });
  });

  describe('calculation', () => {
    beforeEach(() => {
      boilerService.boilerInput = makeInput();
      createComponent();
    });

    it('passes the form input and settings to the steam service and assigns the result', () => {
      expect(steamServiceSpy.boiler).toHaveBeenCalledWith(makeInput(), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(60));
    });

    it('updates the result and stores the input when the form changes', () => {
      steamServiceSpy.boiler.and.returnValue(makeOutput(70));
      component.boilerForm.controls.steamPressure.setValue(250);
      component.calculate(component.boilerForm);
      expect(steamServiceSpy.boiler).toHaveBeenCalledWith(makeInput(250), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(70));
      expect(boilerService.boilerInput).toEqual(makeInput(250));
    });

    it('assigns empty results without calculating when the form is invalid', () => {
      steamServiceSpy.boiler.calls.reset();
      component.boilerForm.controls.steamPressure.setValue(null);
      component.calculate(component.boilerForm);
      expect(steamServiceSpy.boiler).not.toHaveBeenCalled();
      expect(component.results).toEqual(component.getEmptyResults());
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      boilerService.boilerInput = makeInput(300);
      createComponent();
    });

    it('resets to a default form and recalculates', () => {
      steamServiceSpy.boiler.calls.reset();
      component.btnResetData();
      expect(component.boilerForm.controls.steamPressure.value).toBe(0);
      expect(component.input.steamPressure).toBe(0);
    });

    it('generates the example form and recalculates', () => {
      steamServiceSpy.boiler.calls.reset();
      component.btnGenerateExample();
      expect(component.boilerForm.controls.combustionEfficiency.value).toBe(70.6);
      expect(component.input.combustionEfficiency).toBe(70.6);
    });

    it('sets the selected tab, current field and small screen tab', () => {
      component.setTab('help');
      component.changeField('blowdownRate');
      component.setSmallScreenTab('details');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('blowdownRate');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders the form when it exists', () => {
      expect(query('app-boiler-form')).not.toBeNull();
    });

    it('hides the form when it does not exist', () => {
      component.boilerForm = undefined;
      fixture.detectChanges();
      expect(query('app-boiler-form')).toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      expect(query('app-boiler-results')).not.toBeNull();
      expect(query('app-boiler-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-boiler-help')).not.toBeNull();
      expect(query('app-boiler-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-boiler-help')).toBeNull();
      expect(query('app-boiler-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops tracking the modal state and closes the modal', () => {
      createComponent();
      boilerService.modalOpen.next(true);
      fixture.destroy();
      expect(boilerService.modalOpen.value).toBeFalse();
      boilerService.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
      boilerService.modalOpen.next(false);
      expect(component.isModalOpen).toBeTrue();
    });
  });
});
