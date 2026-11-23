import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { FlashTankComponent } from './flash-tank.component';
import { FlashTankService } from './flash-tank.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { FlashTankInput } from '../../../shared/models/steam/steam-inputs';
import { FlashTankOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
  steamEnergyMeasurement: 'MMBtu'
} as Settings;

function makeInput(inletWaterPressure: number = 200): FlashTankInput {
  return {
    inletWaterPressure: inletWaterPressure,
    thermodynamicQuantity: 0,
    quantityValue: 400,
    inletWaterMassFlow: 30,
    tankPressure: 50
  };
}

function makeOutput(outletGasMassFlow: number): FlashTankOutput {
  return { outletGasMassFlow: outletGasMassFlow } as FlashTankOutput;
}

describe('FlashTankComponent', () => {
  let component: FlashTankComponent;
  let fixture: ComponentFixture<FlashTankComponent>;
  let flashTankService: FlashTankService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(FlashTankComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['flashTank', 'getQuantityRange']);
    steamServiceSpy.flashTank.and.returnValue(makeOutput(5));
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 0, max: 1000 });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FlashTankComponent],
      providers: [
        FlashTankService,
        ConvertUnitsService,
        FormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    flashTankService = TestBed.inject(FlashTankService);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-flash-tank');
    });

    it('builds a reset form when the service has no saved input', () => {
      createComponent();
      expect(component.flashTankForm.controls.inletWaterPressure.value).toBe(0);
    });

    it('builds the form from the saved service input when present', () => {
      flashTankService.flashTankInput = makeInput(300);
      createComponent();
      expect(component.flashTankForm.controls.inletWaterPressure.value).toBe(300);
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
      flashTankService.flashTankInput = makeInput();
      createComponent();
    });

    it('passes the form input and settings to the steam service and assigns the result', () => {
      expect(steamServiceSpy.flashTank).toHaveBeenCalledWith(makeInput(), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(5));
    });

    it('updates the result and stores the input when the form changes', () => {
      steamServiceSpy.flashTank.and.returnValue(makeOutput(8));
      component.flashTankForm.controls.inletWaterPressure.setValue(250);
      component.calculate(component.flashTankForm);
      expect(steamServiceSpy.flashTank).toHaveBeenCalledWith(makeInput(250), MOCK_SETTINGS);
      expect(component.results).toEqual(makeOutput(8));
      expect(flashTankService.flashTankInput).toEqual(makeInput(250));
    });

    it('assigns empty results without calculating when the form is invalid', () => {
      steamServiceSpy.flashTank.calls.reset();
      component.flashTankForm.controls.inletWaterPressure.setValue(null);
      component.calculate(component.flashTankForm);
      expect(steamServiceSpy.flashTank).not.toHaveBeenCalled();
      expect(component.results).toEqual(component.getEmptyResults());
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      flashTankService.flashTankInput = makeInput(300);
      createComponent();
    });

    it('resets to a default form and recalculates', () => {
      component.btnResetData();
      expect(component.flashTankForm.controls.inletWaterPressure.value).toBe(0);
      expect(component.input.inletWaterPressure).toBe(0);
    });

    it('generates the example form and recalculates', () => {
      component.btnGenerateExample();
      const exampleInput = flashTankService.getObjFromForm(flashTankService.initForm(MOCK_SETTINGS));
      expect(component.input).toEqual(exampleInput);
    });

    it('sets the selected tab, current field and small screen tab', () => {
      component.setTab('help');
      component.changeField('tankPressure');
      component.setSmallScreenTab('details');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('tankPressure');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders the form when it exists', () => {
      expect(query('app-flash-tank-form')).not.toBeNull();
    });

    it('hides the form when it does not exist', () => {
      component.flashTankForm = undefined;
      fixture.detectChanges();
      expect(query('app-flash-tank-form')).toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      expect(query('app-flash-tank-results')).not.toBeNull();
      expect(query('app-flash-tank-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-flash-tank-help')).not.toBeNull();
      expect(query('app-flash-tank-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-flash-tank-help')).toBeNull();
      expect(query('app-flash-tank-results')).toBeNull();
    });
  });
});
