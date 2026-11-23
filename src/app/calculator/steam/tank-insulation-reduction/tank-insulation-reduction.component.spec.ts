import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TankInsulationReductionComponent } from './tank-insulation-reduction.component';
import { TankInsulationReductionService } from './tank-insulation-reduction.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../standalone.service';
import { Settings } from '../../../shared/models/settings';
import { TankInsulationReductionResults } from '../../../shared/models/standalone';
import { TankInsulationReductionTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';
import { OperatingHours } from '../../../shared/models/operations';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', fuelCost: 3.99, otherFuelCost: 5, energyResultUnit: 'MMBtu' } as Settings;

function makeResults(): TankInsulationReductionResults {
  return {
    baselineResults: { heatLoss: 10, annualHeatLoss: 100, energyCost: 400 },
    modificationResults: { heatLoss: 5, annualHeatLoss: 50, energyCost: 200 },
    annualHeatSavings: 50,
    annualCostSavings: 200,
    energyUnit: 'MMBtu'
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('TankInsulationReductionComponent', () => {
  let component: TankInsulationReductionComponent;
  let fixture: ComponentFixture<TankInsulationReductionComponent>;
  let tankService: TankInsulationReductionService;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbServiceMock: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function baselineForm(): HTMLElement | null {
    return query('.calculator-panel-container:not(.modification) app-tank-insulation-reduction-form');
  }

  function modificationForm(): HTMLElement | null {
    return query('.calculator-panel-container.modification app-tank-insulation-reduction-form');
  }

  function createComponent(inputs: { [key: string]: any } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(TankInsulationReductionComponent);
    component = fixture.componentInstance;
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbServiceMock = { globalSettings: { ...MOCK_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      declarations: [TankInsulationReductionComponent],
      providers: [
        ConvertUnitsService,
        { provide: StandaloneService, useValue: jasmine.createSpyObj('StandaloneService', ['tankInsulationReduction']) },
        { provide: SettingsDbService, useValue: settingsDbServiceMock },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    tankService = TestBed.inject(TankInsulationReductionService);
    tankService.baselineData = undefined;
    tankService.modificationData = undefined;
    spyOn(tankService, 'getResults').and.returnValue(makeResults());
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-STEAM-tank-insulation-reduction');
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

    it('initializes baseline data and form when the service has none', () => {
      const opHours = { hoursPerYear: 4000 } as OperatingHours;
      spyOn(tankService, 'initObject').and.callThrough();
      createComponent({ settings: MOCK_SETTINGS, operatingHours: opHours });
      expect(tankService.initObject).toHaveBeenCalledWith(MOCK_SETTINGS, opHours);
      expect(component.baselineForm.controls.operatingHours.value).toBe(4000);
      expect(component.modificationForm).toBeUndefined();
      expect(component.modificationExists).toBe(false);
    });

    it('builds forms from baseline and modification data saved on the service', () => {
      tankService.baselineData = tankService.generateExample(MOCK_SETTINGS, true);
      tankService.modificationData = tankService.generateExample(MOCK_SETTINGS, false);
      createComponent();
      expect(component.baselineForm.controls.tankHeight.value).toBe(50);
      expect(component.modificationForm).toBeDefined();
      expect(component.modificationExists).toBe(true);
    });

    it('calculates results with the settings and service data', () => {
      createComponent();
      expect(tankService.getResults).toHaveBeenCalledWith(MOCK_SETTINGS, tankService.baselineData, undefined);
      expect(component.tankInsulationReductionResults).toEqual(makeResults());
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
      (tankService.getResults as jasmine.Spy).calls.reset();
    });

    it('creates a modification from a copy of the baseline and selects it', () => {
      component.createModification();
      expect(tankService.modificationData).toEqual(tankService.baselineData);
      expect(tankService.modificationData).not.toBe(tankService.baselineData);
      expect(component.modificationExists).toBe(true);
      expect(component.baselineSelected).toBe(false);
      expect(component.baselineForm.disabled).toBe(true);
      expect(tankService.getResults).toHaveBeenCalled();
    });

    it('enables the modification form except utility type and heated/chilled when selected', () => {
      component.createModification();
      expect(component.modificationForm.controls.tankHeight.enabled).toBe(true);
      expect(component.modificationForm.controls.utilityType.disabled).toBe(true);
      expect(component.modificationForm.controls.heatedOrChilled.disabled).toBe(true);
    });

    it('disables the jacket material when insulation is none on modification select', () => {
      component.createModification();
      expect(component.modificationForm.controls.jacketMaterialSelection.disabled).toBe(true);
    });

    it('keeps the jacket material enabled when insulation is set on modification select', () => {
      component.createModification();
      component.modificationForm.controls.insulationMaterialSelection.setValue(2);
      component.setModificationSelected();
      expect(component.modificationForm.controls.jacketMaterialSelection.enabled).toBe(true);
    });

    it('only disables the baseline form when selecting modification without one', () => {
      component.setModificationSelected();
      expect(component.baselineSelected).toBe(false);
      expect(component.baselineForm.disabled).toBe(true);
      expect(component.modificationForm).toBeUndefined();
    });

    it('re-enables the baseline and disables the modification when baseline is selected', () => {
      component.createModification();
      component.setBaselineSelected();
      expect(component.baselineSelected).toBe(true);
      expect(component.baselineForm.controls.tankHeight.enabled).toBe(true);
      expect(component.baselineForm.controls.jacketMaterialSelection.disabled).toBe(true);
      expect(component.modificationForm.disabled).toBe(true);
    });

    it('keeps the baseline jacket material enabled when insulation is set', () => {
      component.baselineForm.controls.insulationMaterialSelection.setValue(3);
      component.setBaselineSelected();
      expect(component.baselineForm.controls.jacketMaterialSelection.enabled).toBe(true);
    });

    it('resets baseline data and clears the modification', () => {
      component.createModification();
      component.baselineForm.controls.tankHeight.setValue(99);
      component.btnResetData();
      expect(component.baselineForm.controls.tankHeight.value).toBe(0);
      expect(tankService.modificationData).toBeNull();
      expect(component.modificationForm).toBeUndefined();
      expect(component.modificationExists).toBe(false);
      expect(component.baselineSelected).toBe(true);
      expect(tankService.getResults).toHaveBeenCalled();
    });

    it('generates example baseline and modification and selects the baseline', () => {
      component.btnGenerateExample();
      expect(component.baselineForm.controls.tankHeight.value).toBe(50);
      expect(component.modificationForm).toBeDefined();
      expect(component.modificationExists).toBe(true);
      expect(component.baselineSelected).toBe(true);
      expect(component.modificationForm.disabled).toBe(true);
      expect(tankService.getResults).toHaveBeenCalledWith(MOCK_SETTINGS, tankService.baselineData, tankService.modificationData);
    });

    it('emits the service data on save', () => {
      const emitted: Array<TankInsulationReductionTreasureHunt> = [];
      component.emitSave.subscribe((value: TankInsulationReductionTreasureHunt) => emitted.push(value));
      component.createModification();
      component.save();
      expect(emitted).toEqual([{ baseline: tankService.baselineData, modification: tankService.modificationData, opportunityType: Treasure.tankInsulation }]);
    });

    it('emits true on cancel', () => {
      const emitted: Array<boolean> = [];
      component.emitCancel.subscribe((value: boolean) => emitted.push(value));
      component.cancel();
      expect(emitted).toEqual([true]);
    });

    it('sets the selected tab and current field', () => {
      component.setTab('help');
      component.changeField('tankHeight');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('tankHeight');
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

    it('always renders the baseline form', () => {
      createComponent();
      expect(baselineForm()).not.toBeNull();
    });

    it('shows the no-modification message and hides the modification form when no modification exists', () => {
      createComponent();
      expect(modificationForm()).toBeNull();
      expect(normalize(query('.no-data h3').textContent)).toBe('Once you have set up your baseline..');
    });

    it('shows the modification form and hides the message when a modification exists', () => {
      createComponent();
      component.createModification();
      fixture.detectChanges();
      expect(modificationForm()).not.toBeNull();
      expect(query('.no-data')).toBeNull();
    });

    it('hides the modification form again after reset', () => {
      createComponent();
      component.createModification();
      fixture.detectChanges();
      component.btnResetData();
      fixture.detectChanges();
      expect(modificationForm()).toBeNull();
      expect(query('.no-data')).not.toBeNull();
    });

    it('shows results and hides help on the results tab', () => {
      createComponent();
      expect(query('app-tank-insulation-reduction-results')).not.toBeNull();
      expect(query('app-tank-insulation-reduction-help')).toBeNull();
    });

    it('shows help and hides results on the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-tank-insulation-reduction-help')).not.toBeNull();
      expect(query('app-tank-insulation-reduction-results')).toBeNull();
    });

    it('hides both panels on an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      expect(query('app-tank-insulation-reduction-help')).toBeNull();
      expect(query('app-tank-insulation-reduction-results')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('clears the service data on destroy in a treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      component.createModification();
      fixture.destroy();
      expect(tankService.baselineData).toBeUndefined();
      expect(tankService.modificationData).toBeUndefined();
    });

    it('keeps the service data on destroy outside a treasure hunt', () => {
      createComponent();
      component.createModification();
      const baseline = tankService.baselineData;
      fixture.destroy();
      expect(tankService.baselineData).toBe(baseline);
      expect(tankService.modificationData).toBeDefined();
    });
  });
});
