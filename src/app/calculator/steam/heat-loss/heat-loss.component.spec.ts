import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HeatLossComponent } from './heat-loss.component';
import { HeatLossService } from './heat-loss.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { HeatLossInput } from '../../../shared/models/steam/steam-inputs';
import { HeatLossOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
  steamEnergyMeasurement: 'MMBtu'
} as Settings;

function makeInput(inletPressure: number = 200): HeatLossInput {
  return {
    inletPressure: inletPressure,
    thermodynamicQuantity: 0,
    quantityValue: 500,
    inletMassFlow: 25,
    percentHeatLoss: 2
  };
}

function makeOutput(heatLoss: number): HeatLossOutput {
  return { heatLoss: heatLoss } as HeatLossOutput;
}

describe('HeatLossComponent', () => {
  let component: HeatLossComponent;
  let fixture: ComponentFixture<HeatLossComponent>;
  let heatLossService: HeatLossService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(HeatLossComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['heatLoss', 'getQuantityRange']);
    steamServiceSpy.heatLoss.and.returnValue(makeOutput(1.5));
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 0, max: 1000 });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [HeatLossComponent],
      providers: [
        HeatLossService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    heatLossService = TestBed.inject(HeatLossService);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-heat-loss');
    });

    it('builds a reset form when the service has no saved input', () => {
      createComponent();
      expect(component.heatLossForm.controls.inletPressure.value).toBe(0);
    });

    it('builds the form from the saved service input when present', () => {
      heatLossService.heatLossInput = makeInput(300);
      createComponent();
      expect(component.heatLossForm.controls.inletPressure.value).toBe(300);
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

  describe('calculation', () => {
    beforeEach(() => {
      heatLossService.heatLossInput = makeInput();
      createComponent();
    });

    it('passes the form input and settings to the steam service and assigns the result', () => {
      expect(steamServiceSpy.heatLoss).toHaveBeenCalledWith(makeInput(), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(1.5));
    });

    it('updates the result and stores the input when the form changes', () => {
      steamServiceSpy.heatLoss.and.returnValue(makeOutput(3));
      component.heatLossForm.controls.inletPressure.setValue(250);
      component.calculate(component.heatLossForm);
      expect(steamServiceSpy.heatLoss).toHaveBeenCalledWith(makeInput(250), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(3));
      expect(heatLossService.heatLossInput).toEqual(makeInput(250));
    });

    it('assigns empty results without calculating when the form is invalid', () => {
      steamServiceSpy.heatLoss.calls.reset();
      component.heatLossForm.controls.inletPressure.setValue(null);
      component.calculate(component.heatLossForm);
      expect(steamServiceSpy.heatLoss).not.toHaveBeenCalled();
      expect(component.results).toEqual(component.getEmptyResults());
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      heatLossService.heatLossInput = makeInput(300);
      createComponent();
    });

    it('resets to a default form and recalculates', () => {
      component.btnResetData();
      expect(component.heatLossForm.controls.inletPressure.value).toBe(0);
      expect(component.input.inletPressure).toBe(0);
    });

    it('generates the example form and recalculates', () => {
      component.btnGenerateExample();
      const exampleInput = heatLossService.getObjFromForm(heatLossService.initForm(MOCK_SETTINGS));
      expect(component.input).toEqual(exampleInput);
    });

    it('sets the selected tab, current field and small screen tab', () => {
      component.setTab('help');
      component.changeField('percentHeatLoss');
      component.setSmallScreenTab('details');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('percentHeatLoss');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders the form when it exists', () => {
      expect(query('app-heat-loss-form')).not.toBeNull();
    });

    it('hides the form when it does not exist', () => {
      component.heatLossForm = undefined;
      fixture.detectChanges();
      expect(query('app-heat-loss-form')).toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      expect(query('app-heat-loss-results')).not.toBeNull();
      expect(query('app-heat-loss-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-heat-loss-help')).not.toBeNull();
      expect(query('app-heat-loss-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-heat-loss-help')).toBeNull();
      expect(query('app-heat-loss-results')).toBeNull();
    });
  });
});
