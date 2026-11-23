import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SteamReductionComponent } from './steam-reduction.component';
import { SteamReductionService } from './steam-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { SteamReductionData, SteamReductionResults } from '../../../shared/models/standalone';
import { SteamReductionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', steamCost: 0.2, fuelCost: 0.01 } as Settings;

function makeResults(baselineEnergyUse: number = 1000): SteamReductionResults {
  return {
    baselineResults: { energyCost: 100, energyUse: baselineEnergyUse, steamUse: 10 },
    modificationResults: { energyCost: 50, energyUse: 500, steamUse: 5 },
    annualCostSavings: 50,
    annualEnergySavings: 500,
    annualSteamSavings: 5
  };
}

function makeData(service: SteamReductionService, index: number, name?: string): SteamReductionData {
  const data = service.initObject(index, MOCK_SETTINGS, undefined, 0, 0.2, 0.01, 0.05);
  if (name) {
    data.name = name;
  }
  return data;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('SteamReductionComponent', () => {
  let component: SteamReductionComponent;
  let fixture: ComponentFixture<SteamReductionComponent>;
  let steamReductionService: SteamReductionService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function baselineForms(): Array<HTMLElement> {
    return queryAll('.calculator-panel-container:not(.modification) app-steam-reduction-form');
  }

  function modificationForms(): Array<HTMLElement> {
    return queryAll('.calculator-panel-container.modification app-steam-reduction-form');
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(SteamReductionComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { unitsOfMeasure: 'Imperial' } as Settings };

    await TestBed.configureTestingModule({
      declarations: [SteamReductionComponent],
      providers: [
        ConvertUnitsService,
        { provide: StandaloneService, useValue: jasmine.createSpyObj('StandaloneService', ['steamReduction']) },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    steamReductionService = TestBed.inject(SteamReductionService);
    steamReductionService.baselineData = undefined;
    steamReductionService.modificationData = undefined;
    spyOn(steamReductionService, 'getResults').and.returnValue(makeResults());
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-reduction');
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

    it('initializes utility costs from settings', () => {
      createComponent();
      expect(component.steamUtilityCost).toBe(0.2);
      expect(component.naturalGasUtilityCost).toBe(0.01);
      expect(component.otherUtilityCost).toBe(0.05);
    });

    it('uses default utility costs when settings have none', () => {
      createComponent({ settings: { unitsOfMeasure: 'Imperial' } as Settings });
      expect(component.steamUtilityCost).toBe(0.12);
      expect(component.naturalGasUtilityCost).toBe(0.006);
    });

    it('builds one empty baseline entry when the service has no saved data', () => {
      spyOn(steamReductionService, 'emptyObject').and.callThrough();
      createComponent();
      expect(steamReductionService.emptyObject).toHaveBeenCalledWith(0, MOCK_SETTINGS, undefined, 0, 0.2, 0.01, 0.05);
      expect(component.baselineData.length).toBe(1);
      expect(component.modificationData).toBeUndefined();
      expect(component.modificationExists).toBe(false);
    });

    it('restores baseline and modification data saved on the service', () => {
      const baseline = [makeData(steamReductionService, 0)];
      const modification = [makeData(steamReductionService, 0), makeData(steamReductionService, 1)];
      steamReductionService.baselineData = baseline;
      steamReductionService.modificationData = modification;
      createComponent();
      expect(component.baselineData).toBe(baseline);
      expect(component.modificationData).toBe(modification);
      expect(component.modificationExists).toBe(true);
    });

    it('leaves modificationExists false when the saved modification data is empty', () => {
      steamReductionService.modificationData = [];
      createComponent();
      expect(component.modificationExists).toBe(false);
    });

    it('calculates results with the settings, baseline and modification data', () => {
      createComponent();
      expect(steamReductionService.getResults).toHaveBeenCalledWith(MOCK_SETTINGS, component.baselineData, undefined);
      expect(component.steamReductionResults).toEqual(makeResults());
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
      (steamReductionService.getResults as jasmine.Spy).calls.reset();
    });

    it('adds baseline equipment using the first entry utility settings and recalculates', () => {
      spyOn(steamReductionService, 'initObject').and.callThrough();
      component.baselineData[0].utilityType = 1;
      component.addBaselineEquipment();
      expect(steamReductionService.initObject).toHaveBeenCalledWith(1, MOCK_SETTINGS, undefined, 1, 0.2, 0.01, 0.05);
      expect(component.baselineData.length).toBe(2);
      expect(steamReductionService.getResults).toHaveBeenCalled();
    });

    it('removes baseline equipment by index and recalculates', () => {
      component.addBaselineEquipment();
      const second = component.baselineData[1];
      component.removeBaselineEquipment(0);
      expect(component.baselineData).toEqual([second]);
      expect(steamReductionService.getResults).toHaveBeenCalledTimes(2);
    });

    it('creates a modification as a copy of the baseline and selects it', () => {
      component.createModification();
      expect(component.modificationData).toEqual(component.baselineData);
      expect(component.modificationData).not.toBe(component.baselineData);
      expect(component.modificationExists).toBe(true);
      expect(component.baselineSelected).toBe(false);
    });

    it('creates a modification when adding modification equipment without one', () => {
      component.addModificationEquipment();
      expect(component.modificationData.length).toBe(1);
      expect(component.modificationExists).toBe(true);
    });

    it('adds modification equipment when a modification exists', () => {
      component.createModification();
      component.addModificationEquipment();
      expect(component.modificationData.length).toBe(2);
      expect(component.modificationData[1].name).toBe('Equipment #2');
    });

    it('keeps modificationExists while modification entries remain', () => {
      component.createModification();
      component.addModificationEquipment();
      component.removeModificationEquipment(0);
      expect(component.modificationData.length).toBe(1);
      expect(component.modificationExists).toBe(true);
    });

    it('clears modificationExists when the last modification entry is removed', () => {
      component.createModification();
      component.removeModificationEquipment(0);
      expect(component.modificationData.length).toBe(0);
      expect(component.modificationExists).toBe(false);
    });

    it('copies updated baseline data into the array entry and recalculates', () => {
      const updated = makeData(steamReductionService, 0, 'Renamed');
      updated.hoursPerYear = 4000;
      component.updateBaselineData(updated, 0);
      expect(component.baselineData[0].name).toBe('Renamed');
      expect(component.baselineData[0].hoursPerYear).toBe(4000);
      expect(steamReductionService.getResults).toHaveBeenCalled();
    });

    it('copies updated modification data into the array entry and recalculates', () => {
      component.createModification();
      const updated = makeData(steamReductionService, 0, 'Modified');
      component.updateModificationData(updated, 0);
      expect(component.modificationData[0].name).toBe('Modified');
      expect(component.baselineData[0].name).toBe('Equipment #1');
    });

    it('resets to an empty baseline and clears the modification', () => {
      component.createModification();
      component.btnResetData();
      expect(component.baselineData.length).toBe(1);
      expect(component.modificationData).toEqual([]);
      expect(component.modificationExists).toBe(false);
    });

    it('generates an example baseline and an other-method modification', () => {
      (steamReductionService.getResults as jasmine.Spy).and.returnValue(makeResults(2000));
      component.btnGenerateExample();
      expect(component.baselineData.length).toBe(1);
      expect(component.baselineData[0].utilityType).toBe(1);
      expect(component.modificationData.length).toBe(1);
      expect(component.modificationData[0].measurementMethod).toBe(3);
      expect(component.modificationData[0].otherMethodData.consumption).toBe(1900);
      expect(component.modificationExists).toBe(true);
    });

    it('emits the baseline and modification data on save', () => {
      const emitted: Array<SteamReductionTreasureHunt> = [];
      component.emitSave.subscribe((value: SteamReductionTreasureHunt) => emitted.push(value));
      component.createModification();
      component.save();
      expect(emitted).toEqual([{ baseline: component.baselineData, modification: component.modificationData, opportunityType: Treasure.steamReduction }]);
    });

    it('emits true on cancel', () => {
      const emitted: Array<boolean> = [];
      component.emitCancel.subscribe((value: boolean) => emitted.push(value));
      component.cancel();
      expect(emitted).toEqual([true]);
    });

    it('sets the selected tab and current field', () => {
      component.setTab('help');
      component.changeField('pressure');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('pressure');
    });

    it('selects baseline or modification from the small screen tabs', () => {
      component.setSmallScreenTab('modification');
      expect(component.baselineSelected).toBe(false);
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
      expect(component.baselineSelected).toBe(false);
      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBe(true);
    });
  });

  describe('template visibility', () => {
    it('hides the treasure hunt actions outside a treasure hunt', () => {
      createComponent();
      expect(query('.treasure-hunt-help')).toBeNull();
      expect(query('.fa-save')).toBeNull();
    });

    it('shows the treasure hunt actions in a treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      expect(query('.treasure-hunt-help')).not.toBeNull();
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
    });

    it('renders one baseline form per baseline entry', () => {
      createComponent();
      expect(baselineForms().length).toBe(1);
      component.addBaselineEquipment();
      fixture.detectChanges();
      expect(baselineForms().length).toBe(2);
    });

    it('shows the no-modification message and no modification forms when no modification exists', () => {
      createComponent();
      expect(modificationForms().length).toBe(0);
      expect(normalize(query('.no-data h3').textContent)).toBe('Once you have set up your baseline..');
    });

    it('shows one modification form per entry and hides the message when a modification exists', () => {
      createComponent();
      component.createModification();
      component.addModificationEquipment();
      fixture.detectChanges();
      expect(modificationForms().length).toBe(2);
      expect(query('.no-data')).toBeNull();
    });

    it('hides the modification forms after the last modification entry is removed', () => {
      createComponent();
      component.createModification();
      fixture.detectChanges();
      component.removeModificationEquipment(0);
      fixture.detectChanges();
      expect(modificationForms().length).toBe(0);
      expect(query('.no-data')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-steam-reduction-results')).not.toBeNull();
      expect(query('app-steam-reduction-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-steam-reduction-help')).not.toBeNull();
      expect(query('app-steam-reduction-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-steam-reduction-help')).toBeNull();
      expect(query('app-steam-reduction-results')).toBeNull();
    });
  });

  describe('list tracking', () => {
    it('keeps the DOM node of the remaining baseline entry when the first is removed', () => {
      createComponent();
      component.addBaselineEquipment();
      fixture.detectChanges();
      const secondNode = baselineForms()[1];
      component.removeBaselineEquipment(0);
      fixture.detectChanges();
      expect(baselineForms().length).toBe(1);
      expect(baselineForms()[0]).toBe(secondNode);
    });

    it('keeps the DOM node of the remaining modification entry when the first is removed', () => {
      createComponent();
      component.createModification();
      component.addModificationEquipment();
      fixture.detectChanges();
      const secondNode = modificationForms()[1];
      component.removeModificationEquipment(0);
      fixture.detectChanges();
      expect(modificationForms().length).toBe(1);
      expect(modificationForms()[0]).toBe(secondNode);
    });
  });
});
