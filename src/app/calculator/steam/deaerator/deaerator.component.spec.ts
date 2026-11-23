import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { DeaeratorComponent } from './deaerator.component';
import { DeaeratorService } from './deaerator.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { DeaeratorInput } from '../../../shared/models/steam/steam-inputs';
import { DeaeratorOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
  steamEnergyMeasurement: 'MMBtu'
} as Settings;

function makeInput(deaeratorPressure: number = 14): DeaeratorInput {
  return {
    deaeratorPressure: deaeratorPressure,
    ventRate: 0.1,
    feedwaterMassFlow: 400,
    waterPressure: 14,
    waterThermodynamicQuantity: 0,
    waterQuantityValue: 98,
    steamPressure: 20,
    steamThermodynamicQuantity: 1,
    steamQuantityValue: 260
  };
}

function makeOutput(feedwaterMassFlow: number): DeaeratorOutput {
  return { feedwaterMassFlow: feedwaterMassFlow } as DeaeratorOutput;
}

describe('DeaeratorComponent', () => {
  let component: DeaeratorComponent;
  let fixture: ComponentFixture<DeaeratorComponent>;
  let deaeratorService: DeaeratorService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(DeaeratorComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['deaerator', 'getQuantityRange']);
    steamServiceSpy.deaerator.and.returnValue(makeOutput(400));
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 0, max: 1000 });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DeaeratorComponent],
      providers: [
        DeaeratorService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    deaeratorService = TestBed.inject(DeaeratorService);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-deaerator');
    });

    it('builds a reset form when the service has no saved input', () => {
      createComponent();
      expect(component.deaeratorForm.controls.deaeratorPressure.value).toBe(0);
    });

    it('builds the form from the saved service input when present', () => {
      deaeratorService.deaeratorInput = makeInput(30);
      createComponent();
      expect(component.deaeratorForm.controls.deaeratorPressure.value).toBe(30);
      expect(component.input).toEqual(makeInput(30));
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

  describe('calculation', () => {
    beforeEach(() => {
      deaeratorService.deaeratorInput = makeInput();
      createComponent();
    });

    it('passes the form input and settings to the steam service and assigns the result', () => {
      expect(steamServiceSpy.deaerator).toHaveBeenCalledWith(makeInput(), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(400));
    });

    it('updates the result and stores the input when the form changes', () => {
      steamServiceSpy.deaerator.and.returnValue(makeOutput(500));
      component.deaeratorForm.controls.deaeratorPressure.setValue(25);
      component.calculate(component.deaeratorForm);
      expect(steamServiceSpy.deaerator).toHaveBeenCalledWith(makeInput(25), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(500));
      expect(deaeratorService.deaeratorInput).toEqual(makeInput(25));
    });

    it('assigns empty results without calculating when the form is invalid', () => {
      steamServiceSpy.deaerator.calls.reset();
      component.deaeratorForm.controls.deaeratorPressure.setValue(null);
      component.calculate(component.deaeratorForm);
      expect(steamServiceSpy.deaerator).not.toHaveBeenCalled();
      expect(component.results).toEqual(component.getEmptyResults());
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      deaeratorService.deaeratorInput = makeInput(30);
      createComponent();
    });

    it('resets to a default form and recalculates', () => {
      steamServiceSpy.deaerator.calls.reset();
      component.btnResetData();
      expect(component.deaeratorForm.controls.deaeratorPressure.value).toBe(0);
      expect(steamServiceSpy.deaerator).toHaveBeenCalled();
    });

    it('generates the example form and recalculates', () => {
      steamServiceSpy.deaerator.calls.reset();
      component.btnGenerateExample();
      expect(component.deaeratorForm.controls.deaeratorPressure.value).toBe(14);
      expect(steamServiceSpy.deaerator).toHaveBeenCalled();
    });

    it('sets the selected tab, current field and small screen tab', () => {
      component.setTab('help');
      component.changeField('ventRate');
      component.setSmallScreenTab('details');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('ventRate');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      createComponent();
    });

    it('always renders the form', () => {
      expect(query('app-deaerator-form')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      expect(query('app-deaerator-results')).not.toBeNull();
      expect(query('app-deaerator-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-deaerator-help')).not.toBeNull();
      expect(query('app-deaerator-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-deaerator-help')).toBeNull();
      expect(query('app-deaerator-results')).toBeNull();
    });
  });
});
