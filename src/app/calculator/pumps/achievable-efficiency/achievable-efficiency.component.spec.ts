import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AchievableEfficiencyComponent } from './achievable-efficiency.component';
import { AchievableEfficiencyService, PumpEfficiencyInputs } from './achievable-efficiency.service';
import { PsatService } from '../../../psat/psat.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { PSAT } from '../../../shared/models/psat';

const IMPERIAL_SETTINGS = { flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;
const METRIC_SETTINGS = { flowMeasurement: 'm3/h', distanceMeasurement: 'm' } as Settings;

function makeForm(): UntypedFormGroup {
  return new UntypedFormGroup({ flowRate: new UntypedFormControl(0) });
}

function makeInputs(overrides: Partial<PumpEfficiencyInputs> = {}): PumpEfficiencyInputs {
  return {
    pumpType: 6,
    flowRate: 2000,
    rpm: 2000,
    kinematicViscosity: 1.107,
    stageCount: 1,
    head: 137,
    pumpEfficiency: 100,
    ...overrides,
  };
}

describe('AchievableEfficiencyComponent', () => {
  let component: AchievableEfficiencyComponent;
  let fixture: ComponentFixture<AchievableEfficiencyComponent>;
  let achievableEfficiencyServiceSpy: jasmine.SpyObj<AchievableEfficiencyService>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let settingsDbService: Partial<SettingsDbService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let form: UntypedFormGroup;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getPanelTabLinks(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'));
  }

  function createComponent(inputs: { settings?: Settings, psat?: PSAT, inPsat?: boolean } = {}): void {
    fixture = TestBed.createComponent(AchievableEfficiencyComponent);
    component = fixture.componentInstance;
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    if (inputs.psat !== undefined) {
      fixture.componentRef.setInput('psat', inputs.psat);
    }
    if (inputs.inPsat !== undefined) {
      fixture.componentRef.setInput('inPsat', inputs.inPsat);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    form = makeForm();
    achievableEfficiencyServiceSpy = jasmine.createSpyObj('AchievableEfficiencyService', ['getFormFromObj', 'getFormFromPSAT']);
    achievableEfficiencyServiceSpy.getFormFromObj.and.returnValue(form);
    achievableEfficiencyServiceSpy.getFormFromPSAT.and.returnValue(form);
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['roundVal']);
    psatServiceSpy.roundVal.and.callFake((val: number) => Math.round(val * 100) / 100);
    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['value']);
    convertUnitsServiceSpy.value.and.callFake((val: number) => ({
      from: () => ({ to: () => val / 2 + 0.004 }),
    }) as any);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbService = { globalSettings: { ...IMPERIAL_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      declarations: [AchievableEfficiencyComponent],
      providers: [
        { provide: AchievableEfficiencyService, useValue: achievableEfficiencyServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PUMP-achievable-efficiency');
    });

    it('uses global settings when no settings input is given', () => {
      createComponent();
      expect(component.settings).toBe(settingsDbService.globalSettings);
    });

    it('keeps the settings input when given', () => {
      createComponent({ settings: METRIC_SETTINGS });
      expect(component.settings).toBe(METRIC_SETTINGS);
    });

    it('builds the starter form in imperial units for the standalone calculator', () => {
      createComponent();
      expect(achievableEfficiencyServiceSpy.getFormFromObj).toHaveBeenCalledWith(makeInputs());
      expect(convertUnitsServiceSpy.value).not.toHaveBeenCalled();
      expect(component.efficiencyForm).toBe(form);
    });

    it('converts and rounds the starter flow rate and head for metric settings', () => {
      createComponent({ settings: METRIC_SETTINGS });
      expect(achievableEfficiencyServiceSpy.getFormFromObj).toHaveBeenCalledWith(makeInputs({ flowRate: 1000, head: 68.5 }));
    });

    it('restores saved inputs when the service has a flow rate and pump type', () => {
      const saved = makeInputs({ flowRate: 55 });
      Object.assign(achievableEfficiencyServiceSpy, { flowRate: 55, pumpType: 3, pumpEfficiencyInputs: saved });
      createComponent();
      expect(achievableEfficiencyServiceSpy.getFormFromObj).toHaveBeenCalledWith(saved);
    });

    it('builds the form from the PSAT when one is given', () => {
      const psat = { inputs: {} } as PSAT;
      createComponent({ psat: psat, settings: IMPERIAL_SETTINGS });
      expect(achievableEfficiencyServiceSpy.getFormFromPSAT).toHaveBeenCalledWith(psat, IMPERIAL_SETTINGS);
      expect(achievableEfficiencyServiceSpy.getFormFromObj).not.toHaveBeenCalled();
    });

    it('defaults to the results tab', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });

    it('uses the default panel tab from global settings', () => {
      settingsDbService.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('toggles calculate once', () => {
      createComponent();
      expect(component.toggleCalculate).toBeFalse();
    });
  });

  describe('template visibility', () => {
    it('renders the calculator when settings exist', () => {
      createComponent();
      expect(query('.calculator-container')).not.toBeNull();
      expect(query('app-achievable-efficiency-form')).not.toBeNull();
    });

    it('renders nothing when settings are cleared', () => {
      createComponent();
      fixture.componentRef.setInput('settings', undefined);
      fixture.detectChanges();
      expect(query('.calculator-container')).toBeNull();
      expect(query('app-achievable-efficiency-form')).toBeNull();
    });

    it('shows the graph and hides help on the results tab', () => {
      createComponent();
      expect(query('#achievableEfficiencyGraph')).not.toBeNull();
      expect(query('app-achievable-efficiency-graph')).not.toBeNull();
      expect(query('app-achievable-efficiency-help')).toBeNull();
    });

    it('shows help and hides the graph on the help tab', () => {
      createComponent();
      getPanelTabLinks()[1].click();
      fixture.detectChanges();
      expect(component.tabSelect).toBe('help');
      expect(query('app-achievable-efficiency-help')).not.toBeNull();
      expect(query('#achievableEfficiencyGraph')).toBeNull();
      expect(query('app-achievable-efficiency-graph')).toBeNull();
    });

    it('returns to the graph when the Graph tab is clicked', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      getPanelTabLinks()[0].click();
      fixture.detectChanges();
      expect(component.tabSelect).toBe('results');
      expect(query('app-achievable-efficiency-graph')).not.toBeNull();
      expect(query('app-achievable-efficiency-help')).toBeNull();
    });

    it('shows neither panel for an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-achievable-efficiency-help')).toBeNull();
      expect(query('#achievableEfficiencyGraph')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('calculate flips toggleCalculate', () => {
      const before = component.toggleCalculate;
      component.calculate();
      expect(component.toggleCalculate).toBe(!before);
    });

    it('changeField stores the current field', () => {
      component.changeField('rpm');
      expect(component.currentField).toBe('rpm');
    });

    it('setSmallScreenTab stores the tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });

    it('Reset Data rebuilds a zeroed form and toggles reset and calculate', () => {
      achievableEfficiencyServiceSpy.getFormFromObj.calls.reset();
      const resetBefore = component.toggleResetData;
      const calculateBefore = component.toggleCalculate;
      const resetButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
        .find((button: HTMLElement) => button.textContent.includes('Reset Data')) as HTMLElement;

      resetButton.click();

      expect(achievableEfficiencyServiceSpy.getFormFromObj).toHaveBeenCalledWith(makeInputs({
        flowRate: 0, rpm: 0, kinematicViscosity: 0, stageCount: 0, head: 0,
      }));
      expect(component.toggleResetData).toBe(!resetBefore);
      expect(component.toggleCalculate).toBe(!calculateBefore);
    });

    it('Generate Example rebuilds the example form and toggles example and calculate', () => {
      achievableEfficiencyServiceSpy.getFormFromObj.calls.reset();
      const exampleBefore = component.toggleExampleData;
      const calculateBefore = component.toggleCalculate;
      const exampleButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
        .find((button: HTMLElement) => button.textContent.includes('Generate Example')) as HTMLElement;

      exampleButton.click();

      expect(achievableEfficiencyServiceSpy.getFormFromObj).toHaveBeenCalledWith(makeInputs());
      expect(component.toggleExampleData).toBe(!exampleBefore);
      expect(component.toggleCalculate).toBe(!calculateBefore);
    });

    it('Generate Example uses the PSAT form when in PSAT', () => {
      const psat = { inputs: {} } as PSAT;
      fixture.componentRef.setInput('inPsat', true);
      fixture.componentRef.setInput('psat', psat);
      component.btnGenerateExample();
      expect(achievableEfficiencyServiceSpy.getFormFromPSAT).toHaveBeenCalledWith(psat, component.settings);
    });
  });
});
