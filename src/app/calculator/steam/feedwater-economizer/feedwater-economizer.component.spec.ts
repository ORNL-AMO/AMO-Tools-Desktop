import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FeedwaterEconomizerComponent } from './feedwater-economizer.component';
import { FeedwaterEconomizerService } from './feedwater-economizer.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { FeedwaterEconomizerInput } from '../../../shared/models/steam/feedwaterEconomizer';
import { FeedwaterEconomizerTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

const IMPERIAL = { unitsOfMeasure: 'Imperial', fuelCost: 5 } as Settings;

function makeInput(overrides: Partial<FeedwaterEconomizerInput> = {}): FeedwaterEconomizerInput {
  return {
    operatingHours: 8000,
    fuelCost: 5,
    materialTypeId: 1,
    oxygenCalculationMethod: 'Oxygen in Flue Gas',
    excessAir: 15,
    flueGasTemperature: 725,
    flueGasO2: 5,
    fuelTemp: 65,
    combustionAirTemperature: 80,
    ambientAirTemperature: 80,
    moistureInCombustionAir: 1,
    energyRateInput: 53,
    steamPressure: 500,
    steamCondition: 1,
    steamTemperature: 500,
    feedWaterTemperature: 225,
    percBlowdown: 4,
    hxEfficiency: 62.5,
    higherHeatingVal: 1032.44,
    ...overrides,
  };
}

function makeServiceSpy(input?: FeedwaterEconomizerInput): jasmine.SpyObj<FeedwaterEconomizerService> {
  return jasmine.createSpyObj<FeedwaterEconomizerService>('FeedwaterEconomizerService',
    ['initDefaultEmptyInputs', 'initDefaultEmptyOutputs', 'calculate', 'generateExampleData'],
    {
      feedwaterEconomizerInput: new BehaviorSubject<FeedwaterEconomizerInput>(input),
      resetData: new BehaviorSubject<boolean>(undefined),
      generateExample: new BehaviorSubject<boolean>(undefined),
      modalOpen: new BehaviorSubject<boolean>(false),
    });
}

describe('FeedwaterEconomizerComponent', () => {
  let component: FeedwaterEconomizerComponent;
  let fixture: ComponentFixture<FeedwaterEconomizerComponent>;
  let serviceSpy: jasmine.SpyObj<FeedwaterEconomizerService>;
  let analyticsSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbStub: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { settings?: Settings, inTreasureHunt?: boolean } = { settings: IMPERIAL }): void {
    fixture = TestBed.createComponent(FeedwaterEconomizerComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  async function configure(input?: FeedwaterEconomizerInput): Promise<void> {
    serviceSpy = makeServiceSpy(input);
    analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbStub = { globalSettings: { unitsOfMeasure: 'Metric' } as Settings };

    await TestBed.configureTestingModule({
      declarations: [FeedwaterEconomizerComponent],
      providers: [
        { provide: FeedwaterEconomizerService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbStub },
        { provide: AnalyticsService, useValue: analyticsSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  describe('initialization without saved inputs', () => {
    beforeEach(async () => await configure());

    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-feedwater-economizer');
    });

    it('initializes default inputs and outputs with the given settings', () => {
      createComponent();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(IMPERIAL);
      expect(serviceSpy.initDefaultEmptyOutputs).toHaveBeenCalled();
    });

    it('initializes default inputs in a treasure hunt', () => {
      createComponent({ settings: IMPERIAL, inTreasureHunt: true });
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(IMPERIAL);
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent({});
      expect(component.settings).toBe(settingsDbStub.globalSettings);
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(settingsDbStub.globalSettings);
    });

    it('defaults to the results tab', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });

    it('uses the global default panel tab when set', () => {
      settingsDbStub.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('does not calculate while the input is undefined', () => {
      createComponent();
      expect(serviceSpy.calculate).not.toHaveBeenCalled();
    });
  });

  describe('initialization with saved inputs', () => {
    beforeEach(async () => await configure(makeInput()));

    it('keeps the saved inputs instead of initializing defaults', () => {
      createComponent();
      expect(serviceSpy.initDefaultEmptyInputs).not.toHaveBeenCalled();
      expect(serviceSpy.initDefaultEmptyOutputs).not.toHaveBeenCalled();
    });

    it('calculates with the settings when an input is present', () => {
      createComponent();
      expect(serviceSpy.calculate).toHaveBeenCalledWith(IMPERIAL);
    });

    it('recalculates when the input changes', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      serviceSpy.feedwaterEconomizerInput.next(makeInput({ operatingHours: 100 }));
      expect(serviceSpy.calculate).toHaveBeenCalledTimes(1);
    });

    it('tracks the modal open state', () => {
      createComponent();
      expect(component.isModalOpen).toBeFalse();
      serviceSpy.modalOpen.next(true);
      expect(component.isModalOpen).toBeTrue();
    });
  });

  describe('user actions', () => {
    beforeEach(async () => {
      await configure(makeInput());
      createComponent({ settings: IMPERIAL, inTreasureHunt: true });
    });

    it('save emits the current input as a treasure hunt opportunity', () => {
      const emitted: Array<FeedwaterEconomizerTreasureHunt> = [];
      component.emitSave.subscribe(val => emitted.push(val));
      (query('.fa-save').parentElement as HTMLElement).click();
      expect(emitted).toEqual([{
        inputData: makeInput(),
        energySourceData: { energySourceType: 'Other Fuel', unit: 'MMBtu' },
        opportunityType: Treasure.feedwaterEconomizer
      }]);
    });

    it('cancel resets the inputs and emits cancel', () => {
      const emitted: Array<boolean> = [];
      component.emitCancel.subscribe(val => emitted.push(val));
      (query('.fa-times').parentElement as HTMLElement).click();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(IMPERIAL);
      expect(emitted).toEqual([true]);
    });

    it('reset data initializes empty inputs and signals a reset', () => {
      component.btnResetData();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(IMPERIAL);
      expect(serviceSpy.resetData.getValue()).toBeTrue();
    });

    it('generate example builds example data and signals it', () => {
      component.btnGenerateExample();
      expect(serviceSpy.generateExampleData).toHaveBeenCalledWith(IMPERIAL);
      expect(serviceSpy.generateExample.getValue()).toBeTrue();
    });

    it('sets the selected tab', () => {
      component.setTab('help');
      expect(component.tabSelect).toBe('help');
    });

    it('sets the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    beforeEach(async () => await configure(makeInput()));

    it('shows the treasure hunt save and cancel actions in a treasure hunt', () => {
      createComponent({ settings: IMPERIAL, inTreasureHunt: true });
      expect(query('.treasure-hunt-help')).not.toBeNull();
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
    });

    it('hides the treasure hunt actions outside a treasure hunt', () => {
      createComponent();
      expect(query('.treasure-hunt-help')).toBeNull();
      expect(query('.fa-save')).toBeNull();
      expect(query('.fa-times')).toBeNull();
    });

    it('always renders the form', () => {
      createComponent();
      expect(query('app-feedwater-economizer-form')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-feedwater-economizer-results')).not.toBeNull();
      expect(query('app-feedwater-economizer-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-feedwater-economizer-help')).not.toBeNull();
      expect(query('app-feedwater-economizer-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-feedwater-economizer-help')).toBeNull();
      expect(query('app-feedwater-economizer-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    beforeEach(async () => await configure(makeInput()));

    it('stops calculating after destroy', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      fixture.destroy();
      serviceSpy.feedwaterEconomizerInput.next(makeInput({ operatingHours: 100 }));
      expect(serviceSpy.calculate).not.toHaveBeenCalled();
    });

    it('stops tracking the modal state after destroy', () => {
      createComponent();
      fixture.destroy();
      serviceSpy.modalOpen.next(true);
      expect(component.isModalOpen).toBeFalse();
    });

    it('clears the input on destroy in a treasure hunt', () => {
      createComponent({ settings: IMPERIAL, inTreasureHunt: true });
      fixture.destroy();
      expect(serviceSpy.feedwaterEconomizerInput.getValue()).toBeUndefined();
    });

    it('keeps the input on destroy outside a treasure hunt', () => {
      createComponent();
      fixture.destroy();
      expect(serviceSpy.feedwaterEconomizerInput.getValue()).toEqual(makeInput());
    });
  });
});
