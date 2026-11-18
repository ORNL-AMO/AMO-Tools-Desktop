import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerFanComponent } from './cooling-tower-fan.component';
import { CoolingTowerFanService } from './cooling-tower-fan.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { CoolingTowerFanInput, CoolingTowerFanOutput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { CoolingTowerFanTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', electricityCost: 0.066 } as Settings;

function makeInput(overrides: Partial<CoolingTowerFanInput> = {}): CoolingTowerFanInput {
  return {
    towerType: 0,
    numCells: 1,
    waterFlowRate: 924.9,
    ratedFanPower: 59.5119,
    waterLeavingTemp: 81.6495,
    waterEnteringTemp: 87.98386,
    operatingTempWetBulb: 76,
    operatingHours: 7000,
    baselineSpeedType: 0,
    modSpeedType: 1,
    electricityCost: 0.066,
    ...overrides,
  };
}

describe('CoolingTowerFanComponent', () => {
  let component: CoolingTowerFanComponent;
  let fixture: ComponentFixture<CoolingTowerFanComponent>;
  let serviceSpy: jasmine.SpyObj<CoolingTowerFanService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getTabLink(label: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'))
      .find((link: HTMLElement) => link.textContent.trim() === label) as HTMLElement;
  }

  function getActionItems(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.action-item'));
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, settings?: Settings } = {}): void {
    fixture = TestBed.createComponent(CoolingTowerFanComponent);
    component = fixture.componentInstance;
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('CoolingTowerFanService', [
      'initDefaultEmptyInputs', 'initDefaultEmptyOutputs', 'calculate', 'generateExampleData',
    ]);
    serviceSpy.coolingTowerFanInput = new BehaviorSubject<CoolingTowerFanInput>(undefined);
    serviceSpy.coolingTowerFanOutput = new BehaviorSubject<CoolingTowerFanOutput>(undefined);
    serviceSpy.resetData = new BehaviorSubject<boolean>(undefined);
    serviceSpy.generateExample = new BehaviorSubject<boolean>(undefined);
    serviceSpy.currentField = new BehaviorSubject<string>(undefined);

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: MOCK_SETTINGS });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [CoolingTowerFanComponent],
      providers: [
        { provide: CoolingTowerFanService, useValue: serviceSpy },
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
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PC-cooling-tower-fan');
    });

    it('falls back to the global settings when none are provided', () => {
      createComponent();
      expect(component.settings).toBe(MOCK_SETTINGS);
    });

    it('keeps provided settings', () => {
      const settings = { unitsOfMeasure: 'Metric' } as Settings;
      createComponent({ settings });
      expect(component.settings).toBe(settings);
    });

    it('initializes default inputs and outputs when the service has no input', () => {
      createComponent();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(serviceSpy.initDefaultEmptyOutputs).toHaveBeenCalled();
    });

    it('keeps existing input and calculates with it', () => {
      const input = makeInput();
      serviceSpy.coolingTowerFanInput.next(input);
      createComponent();
      expect(serviceSpy.initDefaultEmptyInputs).not.toHaveBeenCalled();
      expect(serviceSpy.initDefaultEmptyOutputs).not.toHaveBeenCalled();
      expect(component.coolingTowerFanInput).toBe(input);
      expect(serviceSpy.calculate).toHaveBeenCalledWith(MOCK_SETTINGS);
    });

    it('starts on the results tab and the form small-screen tab', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
      expect(component.smallScreenTab).toBe('form');
    });
  });

  describe('input observer', () => {
    it('recalculates when a new input is emitted', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      const input = makeInput({ numCells: 3 });
      serviceSpy.coolingTowerFanInput.next(input);
      expect(component.coolingTowerFanInput).toBe(input);
      expect(serviceSpy.calculate).toHaveBeenCalledOnceWith(MOCK_SETTINGS);
    });

    it('does not calculate when the input is cleared', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      serviceSpy.coolingTowerFanInput.next(undefined);
      expect(component.coolingTowerFanInput).toBeUndefined();
      expect(serviceSpy.calculate).not.toHaveBeenCalled();
    });
  });

  describe('user actions', () => {
    it('resets data with the current settings and notifies the form', () => {
      createComponent();
      serviceSpy.initDefaultEmptyInputs.calls.reset();
      const resetValues: Array<boolean> = [];
      serviceSpy.resetData.subscribe(val => resetValues.push(val));

      const resetButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
        .find((button: HTMLElement) => button.textContent.includes('Reset Data')) as HTMLElement;
      resetButton.click();

      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(resetValues[resetValues.length - 1]).toBeTrue();
    });

    it('generates example data with the current settings and notifies the form', () => {
      createComponent();
      const exampleValues: Array<boolean> = [];
      serviceSpy.generateExample.subscribe(val => exampleValues.push(val));

      const exampleButton = Array.from(fixture.nativeElement.querySelectorAll('button'))
        .find((button: HTMLElement) => button.textContent.includes('Generate Example')) as HTMLElement;
      exampleButton.click();

      expect(serviceSpy.generateExampleData).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(exampleValues[exampleValues.length - 1]).toBeTrue();
    });

    it('sets the small screen tab', () => {
      createComponent();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });

    it('emits the treasure hunt payload on save', () => {
      const input = makeInput();
      serviceSpy.coolingTowerFanInput.next(input);
      createComponent({ inTreasureHunt: true });
      let emitted: CoolingTowerFanTreasureHunt;
      component.emitSave.subscribe(val => emitted = val);

      getActionItems()[0].click();

      expect(emitted).toEqual({ coolingTowerFanData: input, opportunityType: Treasure.coolingTowerFan });
    });

    it('emits cancel', () => {
      createComponent({ inTreasureHunt: true });
      let emitted: boolean;
      component.emitCancel.subscribe(val => emitted = val);

      getActionItems()[1].click();

      expect(emitted).toBeTrue();
    });
  });

  describe('template visibility', () => {
    describe('treasure hunt actions', () => {
      it('hides the save/cancel actions outside of treasure hunt', () => {
        createComponent();
        expect(query('.treasure-hunt-help')).toBeNull();
        expect(getActionItems().length).toBe(0);
      });

      it('shows the save/cancel actions in treasure hunt', () => {
        createComponent({ inTreasureHunt: true });
        expect(query('.treasure-hunt-help')).not.toBeNull();
        expect(getActionItems().length).toBe(2);
        expect(query('.action-item .fa-save')).not.toBeNull();
        expect(query('.action-item .fa-times')).not.toBeNull();
      });
    });

    describe('results/help tabs', () => {
      it('shows results and hides help by default', () => {
        createComponent();
        expect(query('app-cooling-tower-fan-results')).not.toBeNull();
        expect(query('app-cooling-tower-fan-help')).toBeNull();
      });

      it('shows help and hides results after clicking the help tab', () => {
        createComponent();
        getTabLink('Help').click();
        fixture.detectChanges();
        expect(component.tabSelect).toBe('help');
        expect(query('app-cooling-tower-fan-help')).not.toBeNull();
        expect(query('app-cooling-tower-fan-results')).toBeNull();
      });

      it('shows results again after clicking the results tab', () => {
        createComponent();
        getTabLink('Help').click();
        fixture.detectChanges();
        getTabLink('Results').click();
        fixture.detectChanges();
        expect(query('app-cooling-tower-fan-results')).not.toBeNull();
        expect(query('app-cooling-tower-fan-help')).toBeNull();
      });

      it('hides both panels for an unknown tab', () => {
        createComponent();
        component.setTab('other');
        fixture.detectChanges();
        expect(query('app-cooling-tower-fan-results')).toBeNull();
        expect(query('app-cooling-tower-fan-help')).toBeNull();
      });
    });

    it('always renders the form', () => {
      createComponent();
      expect(query('app-cooling-tower-fan-form')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stores the current input in the service outside of treasure hunt', () => {
      const input = makeInput();
      serviceSpy.coolingTowerFanInput.next(input);
      createComponent();
      fixture.destroy();
      expect(serviceSpy.coolingTowerFanInput.getValue()).toBe(input);
    });

    it('clears the service input in treasure hunt', () => {
      serviceSpy.coolingTowerFanInput.next(makeInput());
      createComponent({ inTreasureHunt: true });
      fixture.destroy();
      expect(serviceSpy.coolingTowerFanInput.getValue()).toBeUndefined();
    });

    it('stops calculating on input changes after destroy', () => {
      createComponent();
      fixture.destroy();
      serviceSpy.calculate.calls.reset();
      serviceSpy.coolingTowerFanInput.next(makeInput());
      expect(serviceSpy.calculate).not.toHaveBeenCalled();
    });
  });
});
