import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WaterHeatingComponent } from './water-heating.component';
import { WaterHeatingService } from './water-heating.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { WaterHeatingInput } from '../../../shared/models/steam/waterHeating';
import { Treasure, WaterHeatingTreasureHunt } from '../../../shared/models/treasure-hunt';

const IMPERIAL = { unitsOfMeasure: 'Imperial', fuelCost: 5 } as Settings;

function makeInput(overrides: Partial<WaterHeatingInput> = {}): WaterHeatingInput {
  return {
    boilerUtilityType: 'Other Fuel',
    hxUtilityType: 'Other Fuel',
    operatingHours: 7000,
    fuelCost: 6,
    fuelCostBoiler: 6,
    effBoiler: 80,
    waterCost: 0.002,
    treatCost: 0.002,
    pressureSteamIn: 8,
    flowSteamRate: 750,
    temperatureWaterIn: 55,
    pressureWaterOut: 60,
    flowWaterRate: 12,
    effWaterHeater: 72,
    tempMakeupWater: 55,
    presMakeupWater: 15,
    ...overrides,
  };
}

describe('WaterHeatingComponent', () => {
  let component: WaterHeatingComponent;
  let fixture: ComponentFixture<WaterHeatingComponent>;
  let serviceSpy: jasmine.SpyObj<WaterHeatingService>;
  let analyticsSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbStub: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { settings?: Settings, inTreasureHunt?: boolean } = { settings: IMPERIAL }): void {
    fixture = TestBed.createComponent(WaterHeatingComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  async function configure(input?: WaterHeatingInput): Promise<void> {
    serviceSpy = jasmine.createSpyObj<WaterHeatingService>('WaterHeatingService',
      ['initDefaultEmptyInputs', 'initDefaultEmptyOutputs', 'calculate', 'generateExampleData'],
      {
        waterHeatingInput: new BehaviorSubject<WaterHeatingInput>(input),
        resetData: new BehaviorSubject<boolean>(undefined),
        generateExample: new BehaviorSubject<boolean>(undefined),
      });
    analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbStub = { globalSettings: { unitsOfMeasure: 'Metric', fuelCost: 3 } as Settings };

    await TestBed.configureTestingModule({
      declarations: [WaterHeatingComponent],
      providers: [
        { provide: WaterHeatingService, useValue: serviceSpy },
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
      expect(analyticsSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-water-heating');
    });

    it('initializes default inputs without a fuel cost outside a treasure hunt', () => {
      createComponent();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith();
      expect(serviceSpy.initDefaultEmptyOutputs).toHaveBeenCalled();
    });

    it('initializes default inputs with the settings fuel cost in a treasure hunt', () => {
      createComponent({ settings: IMPERIAL, inTreasureHunt: true });
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(5);
      expect(serviceSpy.initDefaultEmptyOutputs).toHaveBeenCalled();
    });

    it('falls back to global settings when no settings input is given', () => {
      createComponent({});
      expect(component.settings).toBe(settingsDbStub.globalSettings);
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
      serviceSpy.waterHeatingInput.next(makeInput({ operatingHours: 100 }));
      expect(serviceSpy.calculate).toHaveBeenCalledTimes(1);
    });
  });

  describe('user actions', () => {
    beforeEach(async () => {
      await configure(makeInput());
      createComponent({ settings: IMPERIAL, inTreasureHunt: true });
    });

    it('save emits the current input with its boiler utility type', () => {
      const emitted: Array<WaterHeatingTreasureHunt> = [];
      component.emitSave.subscribe(val => emitted.push(val));
      (query('.fa-save').parentElement as HTMLElement).click();
      expect(emitted).toEqual([{
        inputData: makeInput(),
        energySourceData: { energySourceType: 'Other Fuel', unit: 'MMBtu' },
        opportunityType: Treasure.waterHeating
      }]);
    });

    it('cancel resets the inputs and emits cancel', () => {
      const emitted: Array<boolean> = [];
      component.emitCancel.subscribe(val => emitted.push(val));
      (query('.fa-times').parentElement as HTMLElement).click();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith();
      expect(emitted).toEqual([true]);
    });

    it('reset data initializes empty inputs and signals a reset', () => {
      component.btnResetData();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith();
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
      expect(query('app-water-heating-form')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-water-heating-results')).not.toBeNull();
      expect(query('app-water-heating-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-water-heating-help')).not.toBeNull();
      expect(query('app-water-heating-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-water-heating-help')).toBeNull();
      expect(query('app-water-heating-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    beforeEach(async () => await configure(makeInput()));

    it('stops calculating after destroy', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      fixture.destroy();
      serviceSpy.waterHeatingInput.next(makeInput({ operatingHours: 100 }));
      expect(serviceSpy.calculate).not.toHaveBeenCalled();
    });

    it('clears the input on destroy in a treasure hunt', () => {
      createComponent({ settings: IMPERIAL, inTreasureHunt: true });
      fixture.destroy();
      expect(serviceSpy.waterHeatingInput.getValue()).toBeUndefined();
    });

    it('keeps the input on destroy outside a treasure hunt', () => {
      createComponent();
      fixture.destroy();
      expect(serviceSpy.waterHeatingInput.getValue()).toEqual(makeInput());
    });
  });
});
