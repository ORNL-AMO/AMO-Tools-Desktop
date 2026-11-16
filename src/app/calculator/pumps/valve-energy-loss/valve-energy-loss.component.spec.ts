import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ValveEnergyLossComponent } from './valve-energy-loss.component';
import { ValveEnergyLossService } from './valve-energy-loss.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ValveEnergyLossInputs, ValveEnergyLossResults } from '../../../shared/models/calculators';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', defaultPanelTab: 'results' } as Settings;

function makeInputs(overrides: Partial<ValveEnergyLossInputs> = {}): ValveEnergyLossInputs {
  return {
    hoursOperation: 8760,
    electricalRate: 0.05,
    efficiencyPump: 85,
    efficiencyMotor: 95,
    SG: 1,
    flowRate: 5000,
    upstreamPressure: 50,
    upstreamDiameter: 5,
    upstreamHeight: 5,
    valveDiameter: 8,
    downstreamPressure: 35,
    downstreamDiameter: 6,
    downstreamHeight: 2,
    pipeSizeFactor: 1.5,
    ...overrides,
  };
}

function makeResults(headLoss: number = 0): ValveEnergyLossResults {
  const outputs = { headLoss, powerLossFrictional: 0, powerLossElectrical: 0, annualEnergyLoss: 0, annualEnergyCost: 0 };
  return { baselineOutputs: outputs, modificationOutputs: outputs };
}

describe('ValveEnergyLossComponent', () => {
  let component: ValveEnergyLossComponent;
  let fixture: ComponentFixture<ValveEnergyLossComponent>;
  let serviceSpy: jasmine.SpyObj<ValveEnergyLossService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getPanels(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.calculator-panel-container'));
  }

  function getAddModificationButton(): HTMLElement | null {
    return Array.from(getPanels()[1].querySelectorAll('button'))
      .find((button: HTMLElement) => button.textContent.includes('Add Modified Condition')) as HTMLElement ?? null;
  }

  function getTabLink(label: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'))
      .find((link: HTMLElement) => link.textContent.trim() === label) as HTMLElement;
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, operatingHours?: OperatingHours, settings?: Settings } = {}): void {
    fixture = TestBed.createComponent(ValveEnergyLossComponent);
    component = fixture.componentInstance;
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    if (inputs.operatingHours !== undefined) {
      fixture.componentRef.setInput('operatingHours', inputs.operatingHours);
    }
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('ValveEnergyLossService', [
      'initEmptyInputs', 'initDefaultEmptyOutput', 'calculateEnergyLoss', 'initModification',
      'generateExampleData', 'generateExampleResults',
    ]);
    serviceSpy.baselineData = new BehaviorSubject<ValveEnergyLossInputs>(undefined);
    serviceSpy.modificationData = new BehaviorSubject<ValveEnergyLossInputs>(undefined);
    serviceSpy.results = new BehaviorSubject<ValveEnergyLossResults>(undefined);
    serviceSpy.currentField = new BehaviorSubject<string>('default');
    serviceSpy.resetData = new BehaviorSubject<boolean>(undefined);
    serviceSpy.generateExample = new BehaviorSubject<boolean>(undefined);
    serviceSpy.modalOpen = new BehaviorSubject<boolean>(false);

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: MOCK_SETTINGS });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [ValveEnergyLossComponent],
      providers: [
        { provide: ValveEnergyLossService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('creates the component and sends the analytics event', () => {
      createComponent();
      expect(component).toBeTruthy();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PUMP-valve-energy-loss');
    });

    it('uses the global default panel tab and settings', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
      expect(component.settings).toBe(MOCK_SETTINGS);
    });

    it('keeps provided settings', () => {
      const settings = { unitsOfMeasure: 'Metric' } as Settings;
      createComponent({ settings });
      expect(component.settings).toBe(settings);
    });

    it('initializes empty inputs and outputs when the service has no baseline data', () => {
      createComponent();
      expect(serviceSpy.initEmptyInputs).toHaveBeenCalledWith(undefined);
      expect(serviceSpy.initDefaultEmptyOutput).toHaveBeenCalled();
    });

    it('initializes empty inputs with the treasure hunt operating hours', () => {
      createComponent({ inTreasureHunt: true, operatingHours: { hoursPerYear: 5000 } as OperatingHours });
      expect(serviceSpy.initEmptyInputs).toHaveBeenCalledWith(5000);
    });

    it('keeps existing baseline data', () => {
      serviceSpy.baselineData.next(makeInputs());
      createComponent();
      expect(serviceSpy.initEmptyInputs).not.toHaveBeenCalled();
      expect(serviceSpy.initDefaultEmptyOutput).not.toHaveBeenCalled();
    });

    it('marks the modification as existing and calculates when modification data exists', () => {
      serviceSpy.baselineData.next(makeInputs());
      serviceSpy.modificationData.next(makeInputs({ downstreamPressure: 45 }));
      createComponent();
      expect(component.modificationExists).toBeTrue();
    });

    it('does not mark the modification as existing without modification data', () => {
      createComponent();
      expect(component.modificationExists).toBeFalse();
    });
  });

  describe('reactive observers', () => {
    beforeEach(() => {
      createComponent();
    });

    it('tracks the modal open state', () => {
      serviceSpy.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
    });

    it('stores emitted results and ignores empty emissions', () => {
      const results = makeResults(5);
      serviceSpy.results.next(results);
      serviceSpy.results.next(undefined);
      expect(component.results).toBe(results);
    });

    it('reselects the baseline when baseline data changes', () => {
      component.baselineSelected = false;
      serviceSpy.baselineData.next(makeInputs());
      expect(component.baselineSelected).toBeTrue();
    });

    it('does not calculate on baseline changes when no modification exists', () => {
      serviceSpy.baselineData.next(makeInputs());
      expect(serviceSpy.calculateEnergyLoss).not.toHaveBeenCalled();
    });

    it('calculates on baseline and modification changes once a modification exists', () => {
      component.modificationExists = true;
      serviceSpy.baselineData.next(makeInputs());
      expect(serviceSpy.calculateEnergyLoss).not.toHaveBeenCalled();
      serviceSpy.modificationData.next(makeInputs());
      serviceSpy.baselineData.next(makeInputs());
      expect(serviceSpy.calculateEnergyLoss).toHaveBeenCalledTimes(2);
      expect(serviceSpy.calculateEnergyLoss).toHaveBeenCalledWith(MOCK_SETTINGS);
    });
  });

  describe('treasure hunt header', () => {
    it('hides the save/cancel actions outside a treasure hunt', () => {
      createComponent();
      expect(query('.treasure-hunt-help')).toBeNull();
      expect(query('.fa-save')).toBeNull();
    });

    it('shows the save/cancel actions in a treasure hunt', () => {
      createComponent({ inTreasureHunt: true, operatingHours: { hoursPerYear: 5000 } as OperatingHours });
      expect(query('.treasure-hunt-help')).not.toBeNull();
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
    });
  });

  describe('modification panel', () => {
    it('renders only the baseline form and the add-modification prompt without a modification', () => {
      createComponent();
      expect(getPanels()[0].querySelectorAll('app-valve-energy-loss-form').length).toBe(1);
      expect(getPanels()[1].querySelector('app-valve-energy-loss-form')).toBeNull();
      expect(getAddModificationButton()).not.toBeNull();
      expect(getPanels()[1].querySelector('.no-data')).not.toBeNull();
    });

    it('renders the modification form and hides the prompt when a modification exists', () => {
      serviceSpy.baselineData.next(makeInputs());
      serviceSpy.modificationData.next(makeInputs());
      createComponent();
      expect(getPanels()[1].querySelectorAll('app-valve-energy-loss-form').length).toBe(1);
      expect(getAddModificationButton()).toBeNull();
      expect(getPanels()[1].querySelector('.no-data')).toBeNull();
    });

    it('creates a modification from the add button', () => {
      createComponent();
      getAddModificationButton().click();
      fixture.detectChanges();
      expect(serviceSpy.initModification).toHaveBeenCalled();
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineSelected).toBeFalse();
      expect(serviceSpy.calculateEnergyLoss).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(getPanels()[1].querySelectorAll('app-valve-energy-loss-form').length).toBe(1);
      expect(getAddModificationButton()).toBeNull();
    });
  });

  describe('results/help tabs', () => {
    it('renders the results panel for the results tab', () => {
      createComponent();
      expect(query('app-valve-energy-loss-results')).not.toBeNull();
      expect(query('app-valve-energy-loss-help')).toBeNull();
    });

    it('renders the help panel after selecting the help tab', () => {
      createComponent();
      getTabLink('Help').click();
      fixture.detectChanges();
      expect(component.tabSelect).toBe('help');
      expect(query('app-valve-energy-loss-help')).not.toBeNull();
      expect(query('app-valve-energy-loss-results')).toBeNull();
    });

    it('renders the results panel again after selecting the results tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      getTabLink('Results').click();
      fixture.detectChanges();
      expect(query('app-valve-energy-loss-results')).not.toBeNull();
      expect(query('app-valve-energy-loss-help')).toBeNull();
    });

    it('renders neither panel for an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-valve-energy-loss-results')).toBeNull();
      expect(query('app-valve-energy-loss-help')).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
    });

    it('resets data back to an empty baseline', () => {
      component.modificationExists = true;
      component.baselineSelected = false;
      serviceSpy.modificationData.next(makeInputs());
      serviceSpy.initEmptyInputs.calls.reset();
      component.btnResetData();
      fixture.detectChanges();
      expect(serviceSpy.initEmptyInputs).toHaveBeenCalledWith();
      expect(serviceSpy.initDefaultEmptyOutput).toHaveBeenCalled();
      expect(serviceSpy.resetData.getValue()).toBeTrue();
      expect(serviceSpy.modificationData.getValue()).toBeUndefined();
      expect(component.modificationExists).toBeFalse();
      expect(component.baselineSelected).toBeTrue();
      expect(getAddModificationButton()).not.toBeNull();
    });

    it('generates example data and results', () => {
      component.baselineSelected = false;
      component.btnGenerateExample();
      fixture.detectChanges();
      expect(serviceSpy.generateExampleData).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(serviceSpy.generateExampleResults).toHaveBeenCalled();
      expect(serviceSpy.calculateEnergyLoss).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineSelected).toBeTrue();
      expect(getPanels()[1].querySelectorAll('app-valve-energy-loss-form').length).toBe(1);
    });

    it('selects the baseline or modification panel on click', () => {
      getPanels()[1].click();
      expect(component.baselineSelected).toBeFalse();
      getPanels()[0].click();
      expect(component.baselineSelected).toBeTrue();
    });

    it('updates the selected panel from the small screen tabs', () => {
      component.setSmallScreenTab('modification');
      expect(component.smallScreenTab).toBe('modification');
      expect(component.baselineSelected).toBeFalse();
      component.setSmallScreenTab('details');
      expect(component.baselineSelected).toBeFalse();
      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBeTrue();
    });
  });

  describe('destroy', () => {
    it('stops reacting to service emissions after destroy', () => {
      createComponent();
      component.modificationExists = true;
      serviceSpy.calculateEnergyLoss.calls.reset();
      fixture.destroy();
      serviceSpy.modalOpen.next(true);
      serviceSpy.results.next(makeResults(9));
      serviceSpy.modificationData.next(makeInputs());
      serviceSpy.baselineData.next(makeInputs());
      expect(component.isModalOpen).toBeFalse();
      expect(component.results).toBeUndefined();
      expect(serviceSpy.calculateEnergyLoss).not.toHaveBeenCalled();
    });
  });
});
