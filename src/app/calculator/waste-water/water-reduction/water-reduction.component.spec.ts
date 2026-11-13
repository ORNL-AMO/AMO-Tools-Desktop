import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WaterReductionComponent } from './water-reduction.component';
import { WaterReductionService } from './water-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { WaterReductionData, WaterReductionResults } from '../../../shared/models/standalone';
import { Treasure, WaterReductionTreasureHunt } from '../../../shared/models/treasure-hunt';

const GLOBAL_SETTINGS = { unitsOfMeasure: 'Imperial', defaultPanelTab: 'help' } as Settings;
const MOCK_OPERATING_HOURS = { hoursPerYear: 5000 } as OperatingHours;

function makeData(index: number, overrides: Partial<WaterReductionData> = {}): WaterReductionData {
  return {
    name: 'Equipment #' + (index + 1),
    hoursPerYear: 8760,
    waterCost: 0.005,
    measurementMethod: 0,
    meteredFlowMethodData: { meterReading: 100 },
    volumeMeterMethodData: { initialMeterReading: 4235, finalMeterReading: 5842, elapsedTime: 15 },
    bucketMethodData: { bucketVolume: 10, bucketFillTime: 20 },
    otherMethodData: { consumption: 15000 },
    isWastewater: false,
    ...overrides,
  };
}

function makeResults(baselineWaterUse: number = 100): WaterReductionResults {
  return {
    baselineResults: { waterUse: baselineWaterUse, waterCost: 0, annualWaterSavings: 0, costSavings: 0 },
    modificationResults: { waterUse: 0, waterCost: 0, annualWaterSavings: 0, costSavings: 0 },
    annualWaterSavings: 0,
    annualCostSavings: 0,
  };
}

describe('WaterReductionComponent', () => {
  let component: WaterReductionComponent;
  let fixture: ComponentFixture<WaterReductionComponent>;
  let serviceSpy: jasmine.SpyObj<WaterReductionService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getPanels(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.calculator-panel-container'));
  }

  function getBaselineForms(): Array<HTMLElement> {
    return Array.from(getPanels()[0].querySelectorAll('app-water-reduction-form'));
  }

  function getModificationForms(): Array<HTMLElement> {
    return Array.from(getPanels()[1].querySelectorAll('app-water-reduction-form'));
  }

  function getAddModificationButton(): HTMLElement | null {
    return Array.from(getPanels()[1].querySelectorAll('button'))
      .find((button: HTMLElement) => button.textContent.includes('Add Modified Condition')) as HTMLElement ?? null;
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, settings?: Settings, isWastewater?: boolean } = {}): void {
    fixture = TestBed.createComponent(WaterReductionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('operatingHours', MOCK_OPERATING_HOURS);
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    if (inputs.isWastewater !== undefined) {
      fixture.componentRef.setInput('isWastewater', inputs.isWastewater);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('WaterReductionService', ['initObject', 'getResults', 'getBaselineExample']);
    serviceSpy.baselineData = undefined;
    serviceSpy.modificationData = undefined;
    serviceSpy.initObject.and.callFake((index: number) => makeData(index));
    serviceSpy.getResults.and.returnValue(makeResults());
    serviceSpy.getBaselineExample.and.callFake(() => makeData(0, { name: 'Example', measurementMethod: 2 }));

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: GLOBAL_SETTINGS });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [WaterReductionComponent],
      providers: [
        { provide: WaterReductionService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-WW-water-reduction');
    });

    it('selects the default panel tab from the global settings', () => {
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('falls back to the global settings when none are passed in', () => {
      createComponent();
      expect(component.settings).toBe(GLOBAL_SETTINGS);
    });

    it('keeps settings that are passed in', () => {
      const settings = { unitsOfMeasure: 'Metric' } as Settings;
      createComponent({ settings: settings });
      expect(component.settings).toBe(settings);
    });

    it('creates one baseline equipment when the service has no saved data', () => {
      createComponent({ isWastewater: true });
      expect(serviceSpy.initObject).toHaveBeenCalledWith(0, GLOBAL_SETTINGS, true, MOCK_OPERATING_HOURS);
      expect(component.baselineData).toEqual([makeData(0)]);
      expect(component.modificationData).toBeUndefined();
      expect(component.modificationExists).toBeFalse();
    });

    it('restores saved baseline and modification data from the service', () => {
      const baseline = [makeData(0), makeData(1)];
      const modification = [makeData(0, { name: 'Saved Mod' })];
      serviceSpy.baselineData = baseline;
      serviceSpy.modificationData = modification;
      createComponent();
      expect(serviceSpy.initObject).not.toHaveBeenCalled();
      expect(component.baselineData).toBe(baseline);
      expect(component.modificationData).toBe(modification);
      expect(component.modificationExists).toBeTrue();
    });

    it('does not flag a modification when the saved modification list is empty', () => {
      serviceSpy.modificationData = [];
      createComponent();
      expect(component.modificationExists).toBeFalse();
    });

    it('calculates results for the initial data', () => {
      createComponent();
      expect(serviceSpy.getResults).toHaveBeenCalledWith(GLOBAL_SETTINGS, component.baselineData, undefined);
      expect(component.waterReductionResults).toEqual(makeResults());
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
    });

    it('addBaselineEquipment appends a new equipment and recalculates', () => {
      serviceSpy.getResults.calls.reset();
      component.addBaselineEquipment();
      expect(serviceSpy.initObject).toHaveBeenCalledWith(1, GLOBAL_SETTINGS, false, MOCK_OPERATING_HOURS);
      expect(component.baselineData.length).toBe(2);
      expect(serviceSpy.getResults).toHaveBeenCalledTimes(1);
    });

    it('removeBaselineEquipment removes the equipment at the index and recalculates', () => {
      component.addBaselineEquipment();
      serviceSpy.getResults.calls.reset();
      component.removeBaselineEquipment(0);
      expect(component.baselineData.map(data => data.name)).toEqual(['Equipment #2']);
      expect(serviceSpy.getResults).toHaveBeenCalledTimes(1);
    });

    it('createModification copies the baseline and selects the modification panel', () => {
      component.createModification();
      expect(component.modificationData).toEqual(component.baselineData);
      expect(component.modificationData[0]).not.toBe(component.baselineData[0]);
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineSelected).toBeFalse();
    });

    it('addModificationEquipment appends a new modification equipment', () => {
      component.createModification();
      component.addModificationEquipment();
      expect(serviceSpy.initObject).toHaveBeenCalledWith(1, GLOBAL_SETTINGS, false, MOCK_OPERATING_HOURS);
      expect(component.modificationData.length).toBe(2);
    });

    it('removeModificationEquipment keeps the modification while equipment remains', () => {
      component.createModification();
      component.addModificationEquipment();
      component.removeModificationEquipment(0);
      expect(component.modificationData.map(data => data.name)).toEqual(['Equipment #2']);
      expect(component.modificationExists).toBeTrue();
    });

    it('removeModificationEquipment clears the modification flag when the last equipment is removed', () => {
      component.createModification();
      component.removeModificationEquipment(0);
      expect(component.modificationData).toEqual([]);
      expect(component.modificationExists).toBeFalse();
    });

    it('updateBaselineData copies the emitted fields into the baseline entry and recalculates', () => {
      const original = component.baselineData[0];
      const updated = makeData(0, { name: 'Rinse', hoursPerYear: 100, waterCost: 0.02, measurementMethod: 3, isWastewater: true });
      serviceSpy.getResults.calls.reset();
      component.updateBaselineData(updated, 0);
      expect(component.baselineData[0]).toBe(original);
      expect(component.baselineData[0]).toEqual(updated);
      expect(serviceSpy.getResults).toHaveBeenCalledTimes(1);
    });

    it('updateModificationData copies the emitted fields into the modification entry', () => {
      component.createModification();
      const updated = makeData(0, { name: 'Mod Rinse', otherMethodData: { consumption: 5 } });
      component.updateModificationData(updated, 0);
      expect(component.modificationData[0]).toEqual(updated);
      expect(component.baselineData[0].name).toBe('Equipment #1');
    });

    it('btnResetData restores one baseline equipment and removes the modification', () => {
      component.createModification();
      component.addBaselineEquipment();
      component.btnResetData();
      expect(component.baselineData).toEqual([makeData(0)]);
      expect(component.modificationData).toEqual([]);
      expect(component.modificationExists).toBeFalse();
    });

    it('btnGenerateExample builds a baseline example and an offsheet modification at 95% of baseline use', () => {
      serviceSpy.getResults.and.returnValue(makeResults(200));
      component.btnGenerateExample();
      expect(serviceSpy.getBaselineExample).toHaveBeenCalledWith(GLOBAL_SETTINGS, MOCK_OPERATING_HOURS);
      expect(component.baselineData[0].name).toBe('Example');
      expect(component.modificationData.length).toBe(1);
      expect(component.modificationData[0].measurementMethod).toBe(3);
      // Imperial results are in kgal, so the gallon input is scaled by 1000.
      expect(component.modificationData[0].otherMethodData.consumption).toBe(190000);
      expect(component.modificationExists).toBeTrue();
    });

    it('save emits the baseline and modification as a water reduction treasure', () => {
      const emitted: Array<WaterReductionTreasureHunt> = [];
      component.emitSave.subscribe(value => emitted.push(value));
      component.createModification();
      component.save();
      expect(emitted).toEqual([{ baseline: component.baselineData, modification: component.modificationData, opportunityType: Treasure.waterReduction }]);
    });

    it('cancel emits true', () => {
      const emitted: Array<boolean> = [];
      component.emitCancel.subscribe(value => emitted.push(value));
      component.cancel();
      expect(emitted).toEqual([true]);
    });

    it('setTab and changeField update the panel state', () => {
      component.setTab('results');
      component.changeField('waterCost');
      expect(component.tabSelect).toBe('results');
      expect(component.currentField).toBe('waterCost');
    });

    it('setSmallScreenTab selects the matching panel', () => {
      component.setSmallScreenTab('modification');
      expect(component.smallScreenTab).toBe('modification');
      expect(component.baselineSelected).toBeFalse();
      component.setSmallScreenTab('details');
      expect(component.baselineSelected).toBeFalse();
      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBeTrue();
    });
  });

  describe('calculation triggers', () => {
    beforeEach(() => {
      createComponent();
    });

    it('passes the current baseline and modification to the results calculation', () => {
      component.createModification();
      expect(serviceSpy.getResults).toHaveBeenCalledWith(GLOBAL_SETTINGS, component.baselineData, component.modificationData);
    });

    it('replaces the results each time the data changes', () => {
      serviceSpy.getResults.and.returnValue(makeResults(300));
      component.addBaselineEquipment();
      expect(component.waterReductionResults.baselineResults.waterUse).toBe(300);
      serviceSpy.getResults.and.returnValue(makeResults(400));
      component.updateBaselineData(makeData(0, { hoursPerYear: 10 }), 0);
      expect(component.waterReductionResults.baselineResults.waterUse).toBe(400);
    });
  });

  describe('template visibility', () => {
    it('hides the treasure hunt actions outside a treasure hunt', () => {
      createComponent({ inTreasureHunt: false });
      expect(query('.fa-save')).toBeNull();
      expect(query('.treasure-hunt-help')).toBeNull();
    });

    it('shows the treasure hunt actions in a treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
      expect(query('.treasure-hunt-help')).not.toBeNull();
    });

    it('renders one baseline form per baseline equipment', () => {
      createComponent();
      expect(getBaselineForms().length).toBe(1);
      component.addBaselineEquipment();
      fixture.detectChanges();
      expect(getBaselineForms().length).toBe(2);
    });

    it('removes the deleted baseline form rather than the last one', () => {
      createComponent();
      component.addBaselineEquipment();
      fixture.detectChanges();
      const secondForm = getBaselineForms()[1];

      component.removeBaselineEquipment(0);
      fixture.detectChanges();

      // Items are tracked by identity, so the remaining equipment keeps its existing form instance.
      expect(getBaselineForms().length).toBe(1);
      expect(getBaselineForms()[0]).toBe(secondForm);
    });

    it('shows the add-modification prompt and no modification forms without a modification', () => {
      createComponent();
      expect(getAddModificationButton()).not.toBeNull();
      expect(getModificationForms().length).toBe(0);
    });

    it('shows the modification forms and hides the prompt once a modification exists', () => {
      createComponent();
      component.createModification();
      component.addModificationEquipment();
      fixture.detectChanges();
      expect(getAddModificationButton()).toBeNull();
      expect(getModificationForms().length).toBe(2);
    });

    it('removes the deleted modification form rather than the last one', () => {
      createComponent();
      component.createModification();
      component.addModificationEquipment();
      fixture.detectChanges();
      const secondForm = getModificationForms()[1];

      component.removeModificationEquipment(0);
      fixture.detectChanges();

      expect(getModificationForms().length).toBe(1);
      expect(getModificationForms()[0]).toBe(secondForm);
    });

    it('shows the prompt again after the last modification equipment is removed', () => {
      createComponent();
      component.createModification();
      fixture.detectChanges();
      component.removeModificationEquipment(0);
      fixture.detectChanges();
      expect(getAddModificationButton()).not.toBeNull();
      expect(getModificationForms().length).toBe(0);
    });

    it('shows the results and hides the help on the results tab', () => {
      createComponent();
      component.setTab('results');
      fixture.detectChanges();
      expect(query('app-water-reduction-results')).not.toBeNull();
      expect(query('app-water-reduction-help')).toBeNull();
    });

    it('shows the help and hides the results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-water-reduction-help')).not.toBeNull();
      expect(query('app-water-reduction-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('saves the baseline and modification to the service outside a treasure hunt', () => {
      createComponent({ inTreasureHunt: false });
      component.createModification();
      const baseline = component.baselineData;
      const modification = component.modificationData;
      fixture.destroy();
      expect(serviceSpy.baselineData).toBe(baseline);
      expect(serviceSpy.modificationData).toBe(modification);
    });

    it('clears the saved data in the service inside a treasure hunt', () => {
      serviceSpy.baselineData = [makeData(0)];
      serviceSpy.modificationData = [makeData(0)];
      createComponent({ inTreasureHunt: true });
      fixture.destroy();
      expect(serviceSpy.baselineData).toBeUndefined();
      expect(serviceSpy.modificationData).toBeUndefined();
    });
  });
});
