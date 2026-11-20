import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HeaderComponent } from './header.component';
import { HeaderService } from './header.service';
import { SteamService } from '../steam.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../settings/settings.service';
import { HeaderInput } from '../../../shared/models/steam/steam-inputs';
import { HeaderOutput } from '../../../shared/models/steam/steam-outputs';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;

function makeHeaderInput(numberOfInlets: number = 2): HeaderInput {
  const inlets = [];
  for (let i = 0; i < numberOfInlets; i++) {
    inlets.push({ pressure: 100 + i, thermodynamicQuantity: 0, quantityValue: 400 + i, massFlow: 10 + i });
  }
  return { headerPressure: 150, numberOfInlets: numberOfInlets, inlets: inlets };
}

function makeResults(): HeaderOutput {
  return { header: { pressure: 150 } } as HeaderOutput;
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let headerService: HeaderService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange', 'header']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 32, max: 1472 });
    steamServiceSpy.header.and.returnValue(makeResults());
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [HeaderComponent],
      providers: [
        HeaderService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    headerService = TestBed.inject(HeaderService);
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-header');
    });

    it('builds an empty header form with no inlets when the service has no saved input', () => {
      createComponent();
      expect(component.headerPressureForm.controls.headerPressure.value).toBe('');
      expect(component.headerPressureForm.controls.numInlets.value).toBe(0);
      expect(component.inletForms.length).toBe(0);
    });

    it('builds the forms from saved service input', () => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
      expect(component.headerPressureForm.controls.headerPressure.value).toBe(150);
      expect(component.inletForms.length).toBe(2);
      expect(component.inletForms[1].controls.pressure.value).toBe(101);
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
    it('calls the header calculation with the input when every form is valid', () => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
      expect(steamServiceSpy.header).toHaveBeenCalledWith(component.input, MOCK_SETTINGS);
      expect(component.results).toEqual(makeResults());
    });

    it('returns empty results when the header form is invalid', () => {
      createComponent();
      steamServiceSpy.header.calls.reset();
      component.calculate();
      expect(steamServiceSpy.header).not.toHaveBeenCalled();
      expect(component.results.header.pressure).toBe(0);
    });

    it('returns empty results when an inlet form is invalid', () => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
      steamServiceSpy.header.calls.reset();
      component.inletForms[1].controls.pressure.setValue(null);
      component.calculate();
      expect(steamServiceSpy.header).not.toHaveBeenCalled();
      expect(component.results.header.pressure).toBe(0);
    });

    it('stores the input on the service', () => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
      component.headerPressureForm.controls.headerPressure.setValue(200);
      component.calculate();
      expect(headerService.headerInput.headerPressure).toBe(200);
    });
  });

  describe('inlet forms', () => {
    beforeEach(() => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
    });

    it('adds inlet forms when numInlets increases', () => {
      component.headerPressureForm.controls.numInlets.setValue(4);
      component.getInletForms();
      expect(component.inletForms.length).toBe(4);
    });

    it('removes inlet forms from the end when numInlets decreases', () => {
      const first = component.inletForms[0];
      component.headerPressureForm.controls.numInlets.setValue(1);
      component.getInletForms();
      expect(component.inletForms).toEqual([first]);
    });

    it('replaces the saved inlet form and recalculates', () => {
      steamServiceSpy.header.calls.reset();
      const form = headerService.getInletFormFromObj(makeHeaderInput(1).inlets[0], MOCK_SETTINGS);
      component.saveInletForm(form, 1);
      expect(component.inletForms[1]).toBe(form);
      expect(steamServiceSpy.header).toHaveBeenCalled();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
    });

    it('resets to an empty header form with no inlets', () => {
      component.btnResetData();
      expect(component.headerPressureForm.controls.headerPressure.value).toBe('');
      expect(component.inletForms.length).toBe(0);
    });

    it('generates the example with three inlets', () => {
      component.btnGenerateExample();
      expect(component.headerPressureForm.controls.numInlets.value).toBe(3);
      expect(component.inletForms.length).toBe(3);
    });

    it('sets the selected tab', () => {
      component.setTab('help');
      expect(component.tabSelect).toBe('help');
    });

    it('sets the current field and the thermodynamic quantity of a later inlet', () => {
      component.inletForms[1].controls.thermodynamicQuantity.setValue(2);
      component.changeField('quantityValue', 1);
      expect(component.currentField).toBe('quantityValue');
      expect(component.inletThermoQuantity).toBe(2);
    });

    it('sets the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('header pressure validation messages', () => {
    beforeEach(() => {
      createComponent();
    });

    function setPressure(value: any): void {
      component.headerPressureForm.controls.headerPressure.setValue(value);
      component.headerPressureForm.controls.headerPressure.markAsDirty();
      fixture.detectChanges();
    }

    function messages(): string[] {
      return queryAll('.alert-danger span').map(span => span.textContent.trim().replace(/\s+/g, ' '));
    }

    it('hides the error block while the field is pristine', () => {
      expect(query('.alert-danger')).toBeNull();
    });

    it('hides the error block for a valid dirty value', () => {
      setPressure(150);
      expect(query('.alert-danger')).toBeNull();
    });

    it('shows only the required message for an empty value', () => {
      setPressure(null);
      expect(messages()).toEqual(['Value Required']);
    });

    it('shows only the max message above the range', () => {
      setPressure(100000);
      const max = component.headerPressureForm.controls.headerPressure.errors.max.max;
      expect(messages()).toEqual([`Value can't be greater than ${max} psig.`]);
    });

    it('shows only the min message below the range', () => {
      setPressure(-100);
      const min = component.headerPressureForm.controls.headerPressure.errors.min.min;
      expect(messages()).toEqual([`Value can't be less than ${min} psig.`]);
    });
  });

  describe('template lists', () => {
    it('renders one option per inlet count', () => {
      createComponent();
      expect(queryAll('#numInlets option').map(o => o.textContent.trim())).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
    });

    it('renders no inlet forms when there are no inlets', () => {
      createComponent();
      expect(queryAll('app-header-form').length).toBe(0);
    });

    it('renders one inlet form per inlet', () => {
      headerService.headerInput = makeHeaderInput(3);
      createComponent();
      expect(queryAll('app-header-form').length).toBe(3);
    });

    it('keeps the remaining inlet form element when the first inlet is removed', () => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
      const second = queryAll('app-header-form')[1];
      component.inletForms = component.inletForms.slice(1);
      fixture.detectChanges();
      const remaining = queryAll('app-header-form');
      expect(remaining.length).toBe(1);
      expect(remaining[0]).toBe(second);
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
    });

    it('shows results and hides help on the results tab', () => {
      expect(query('app-header-results')).not.toBeNull();
      expect(query('app-header-help')).toBeNull();
    });

    it('hides the results component when there are no results', () => {
      component.results = undefined;
      fixture.detectChanges();
      expect(query('.align-items-center.p-4')).not.toBeNull();
      expect(query('app-header-results')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-header-help')).not.toBeNull();
      expect(query('app-header-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-header-help')).toBeNull();
      expect(query('app-header-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('saves the current input on the service', () => {
      headerService.headerInput = makeHeaderInput(2);
      createComponent();
      const input = component.input;
      headerService.headerInput = undefined;
      fixture.destroy();
      expect(headerService.headerInput).toBe(input);
    });
  });
});
