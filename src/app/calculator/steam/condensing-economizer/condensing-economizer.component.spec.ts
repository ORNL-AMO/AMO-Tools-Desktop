import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CondensingEconomizerComponent } from './condensing-economizer.component';
import { CondensingEconomizerService } from './condensing-economizer.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { CondensingEconomizerInput } from '../../../shared/models/steam/condensingEconomizer';
import { CondensingEconTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

const IMPERIAL = { unitsOfMeasure: 'Imperial', fuelCost: 5 } as Settings;

function makeInput(overrides: Partial<CondensingEconomizerInput> = {}): CondensingEconomizerInput {
  return {
    operatingHours: 8000,
    fuelCost: 5,
    materialTypeId: 1,
    oxygenCalculationMethod: 'Oxygen in Flue Gas',
    flueGasTemperature: 300,
    modifiedFlueGasTemperature: 100,
    combustionAirTemperature: 80,
    fuelTemp: 65,
    flueGasO2: 3,
    ambientAirTemperature: 80,
    moistureInCombustionAir: 1,
    heatInput: 50,
    excessAir: 15,
    substance: 'Natural Gas',
    ...overrides,
  } as CondensingEconomizerInput;
}

describe('CondensingEconomizerComponent', () => {
  let component: CondensingEconomizerComponent;
  let fixture: ComponentFixture<CondensingEconomizerComponent>;
  let serviceSpy: jasmine.SpyObj<CondensingEconomizerService>;
  let analyticsSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbStub: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { settings?: Settings, inTreasureHunt?: boolean } = { settings: IMPERIAL }): void {
    fixture = TestBed.createComponent(CondensingEconomizerComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  async function configure(input?: CondensingEconomizerInput): Promise<void> {
    serviceSpy = jasmine.createSpyObj<CondensingEconomizerService>('CondensingEconomizerService',
      ['initDefaultEmptyInputs', 'initDefaultEmptyOutputs', 'calculate', 'generateExampleData'],
      {
        condensingEconomizerInput: new BehaviorSubject<CondensingEconomizerInput>(input),
        resetData: new BehaviorSubject<boolean>(undefined),
        generateExample: new BehaviorSubject<boolean>(undefined),
        modalOpen: new BehaviorSubject<boolean>(false),
      });
    analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbStub = { globalSettings: { unitsOfMeasure: 'Metric' } as Settings };

    await TestBed.configureTestingModule({
      declarations: [CondensingEconomizerComponent],
      providers: [
        { provide: CondensingEconomizerService, useValue: serviceSpy },
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
      expect(analyticsSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-condensing-economizer');
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
      serviceSpy.condensingEconomizerInput.next(makeInput({ operatingHours: 100 }));
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
      createComponent();
    });

    it('save emits the current input as a treasure hunt opportunity', () => {
      const emitted: Array<CondensingEconTreasureHunt> = [];
      component.emitSave.subscribe(val => emitted.push(val));
      component.save();
      expect(emitted).toEqual([{
        inputData: makeInput(),
        energySourceData: { energySourceType: 'Other Fuel', unit: 'MMBtu' },
        opportunityType: Treasure.condensingEconomizer
      }]);
    });

    it('cancel resets the inputs and emits cancel', () => {
      const emitted: Array<boolean> = [];
      component.emitCancel.subscribe(val => emitted.push(val));
      component.cancel();
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

    it('always renders the form', () => {
      createComponent();
      expect(query('app-condensing-economizer-form')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-condensing-economizer-results')).not.toBeNull();
      expect(query('app-condensing-economizer-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-condensing-economizer-help')).not.toBeNull();
      expect(query('app-condensing-economizer-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-condensing-economizer-help')).toBeNull();
      expect(query('app-condensing-economizer-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    beforeEach(async () => await configure(makeInput()));

    it('stops calculating after destroy', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      fixture.destroy();
      serviceSpy.condensingEconomizerInput.next(makeInput({ operatingHours: 100 }));
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
      expect(serviceSpy.condensingEconomizerInput.getValue()).toBeUndefined();
    });

    it('keeps the input on destroy outside a treasure hunt', () => {
      createComponent();
      fixture.destroy();
      expect(serviceSpy.condensingEconomizerInput.getValue()).toEqual(makeInput());
    });
  });
});
