import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LightingReplacementComponent } from './lighting-replacement.component';
import { LightingReplacementService } from './lighting-replacement.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { LightingReplacementData, LightingReplacementResults } from '../../../shared/models/lighting';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = { electricityCost: 0.1, defaultPanelTab: 'results' } as Settings;
const MOCK_OPERATING_HOURS = { hoursPerYear: 5000 } as OperatingHours;

function makeFixtureData(index: number): LightingReplacementData {
  return {
    name: 'Fixture #' + (index + 1),
    hoursPerYear: 8760,
    wattsPerLamp: 0,
    lampsPerFixture: 0,
    numberOfFixtures: 0,
    lumensPerLamp: 1,
    totalLighting: 0,
    electricityUse: 0,
    lampLife: 0,
    ballastFactor: 0,
    lumenDegradationFactor: 1,
    coefficientOfUtilization: 1,
    category: 0,
    type: 'Custom',
  };
}

function makeResults(totalEnergySavings: number = 0): LightingReplacementResults {
  const emptyResult = { totalElectricityUse: 0, totalLighting: 0, totalOperatingHours: 0, totalOperatingCosts: 0 };
  return {
    baselineResults: emptyResult,
    modificationResults: emptyResult,
    totalEnergySavings: totalEnergySavings,
    totalCostSavings: 0,
  };
}

describe('LightingReplacementComponent', () => {
  let component: LightingReplacementComponent;
  let fixture: ComponentFixture<LightingReplacementComponent>;
  let serviceSpy: jasmine.SpyObj<LightingReplacementService>;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getPanels(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.calculator-panel-container'));
  }

  function getBaselineForms(): Array<HTMLElement> {
    return Array.from(getPanels()[0].querySelectorAll('app-lighting-replacement-form'));
  }

  function getModificationForms(): Array<HTMLElement> {
    return Array.from(getPanels()[1].querySelectorAll('app-lighting-replacement-form'));
  }

  function getAddModificationButton(): HTMLElement | null {
    return Array.from(getPanels()[1].querySelectorAll('button'))
      .find((button: HTMLElement) => button.textContent.includes('Add Modified Condition')) as HTMLElement ?? null;
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, operatingHours?: OperatingHours } = {}): void {
    fixture = TestBed.createComponent(LightingReplacementComponent);
    component = fixture.componentInstance;
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    if (inputs.operatingHours !== undefined) {
      fixture.componentRef.setInput('operatingHours', inputs.operatingHours);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('LightingReplacementService', ['initObject', 'getResults', 'generateExample']);
    serviceSpy.baselineData = undefined;
    serviceSpy.modificationData = undefined;
    serviceSpy.baselineElectricityCost = undefined;
    serviceSpy.modificationElectricityCost = undefined;
    serviceSpy.showAdditionalDetails = false;
    serviceSpy.initObject.and.callFake((index: number) => makeFixtureData(index));
    serviceSpy.getResults.and.returnValue(makeResults());
    serviceSpy.generateExample.and.callFake((isBaseline: boolean) => ({
      ...makeFixtureData(0),
      name: isBaseline ? 'Example Baseline' : 'Example Modification',
    }));

    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', [], { globalSettings: MOCK_SETTINGS });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [LightingReplacementComponent],
      providers: [
        { provide: LightingReplacementService, useValue: serviceSpy },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(() => {
      createComponent({ operatingHours: MOCK_OPERATING_HOURS });
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('sends the analytics event', () => {
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-lighting-replacement');
    });

    it('uses the global default panel tab and settings', () => {
      expect(component.tabSelect).toBe('results');
      expect(component.settings).toBe(MOCK_SETTINGS);
    });

    it('creates a single baseline fixture from the operating hours when the service has no data', () => {
      expect(serviceSpy.initObject).toHaveBeenCalledWith(0, MOCK_OPERATING_HOURS);
      expect(component.baselineData).toEqual([makeFixtureData(0)]);
      expect(component.modificationExists).toBeFalse();
    });

    it('defaults both electricity costs to the settings electricity cost', () => {
      expect(component.baselineElectricityCost).toBe(0.1);
      expect(component.modificationElectricityCost).toBe(0.1);
    });

    it('calculates results for the initial data', () => {
      expect(serviceSpy.getResults).toHaveBeenCalledWith(jasmine.objectContaining({
        baseline: component.baselineData,
        baselineElectricityCost: 0.1,
        opportunityType: Treasure.lightingReplacement,
      }));
      expect(component.lightingReplacementResults).toEqual(makeResults());
    });
  });

  describe('initialization from saved service data', () => {
    it('restores baseline, modification, and electricity costs from the service', () => {
      const savedBaseline = [makeFixtureData(0)];
      const savedModification = [makeFixtureData(0), makeFixtureData(1)];
      serviceSpy.baselineData = savedBaseline;
      serviceSpy.modificationData = savedModification;
      serviceSpy.baselineElectricityCost = 0.2;
      serviceSpy.modificationElectricityCost = 0.15;
      createComponent();
      expect(component.baselineData).toBe(savedBaseline);
      expect(component.modificationData).toBe(savedModification);
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineElectricityCost).toBe(0.2);
      expect(component.modificationElectricityCost).toBe(0.15);
    });

    it('does not mark a modification as existing when the saved modification list is empty', () => {
      serviceSpy.modificationData = [];
      createComponent();
      expect(component.modificationExists).toBeFalse();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
    });

    it('addBaselineFixture appends a fixture and recalculates', () => {
      serviceSpy.getResults.calls.reset();
      component.addBaselineFixture();
      expect(serviceSpy.initObject).toHaveBeenCalledWith(1, undefined);
      expect(component.baselineData.length).toBe(2);
      expect(serviceSpy.getResults).toHaveBeenCalled();
    });

    it('removeBaselineFixture removes the fixture at the index', () => {
      component.addBaselineFixture();
      component.removeBaselineFixture(0);
      expect(component.baselineData.map(data => data.name)).toEqual(['Fixture #2']);
    });

    it('createModification copies the baseline and selects the modification', () => {
      component.createModification();
      expect(component.modificationData).toEqual(component.baselineData);
      expect(component.modificationData).not.toBe(component.baselineData);
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineSelected).toBeFalse();
    });

    it('addModificationFixture appends a modification fixture', () => {
      component.createModification();
      component.addModificationFixture();
      expect(component.modificationData.length).toBe(2);
    });

    it('removeModificationFixture clears modificationExists when the last modification is removed', () => {
      component.createModification();
      component.removeModificationFixture(0);
      expect(component.modificationData.length).toBe(0);
      expect(component.modificationExists).toBeFalse();
    });

    it('removeModificationFixture keeps modificationExists while modifications remain', () => {
      component.createModification();
      component.addModificationFixture();
      component.removeModificationFixture(0);
      expect(component.modificationExists).toBeTrue();
    });

    it('btnResetData restores a single baseline fixture and removes the modification', () => {
      component.addBaselineFixture();
      component.createModification();
      serviceSpy.showAdditionalDetails = true;
      component.btnResetData();
      expect(component.baselineData).toEqual([makeFixtureData(0)]);
      expect(component.modificationData).toEqual([]);
      expect(component.modificationExists).toBeFalse();
      expect(serviceSpy.showAdditionalDetails).toBeFalse();
    });

    it('btnGenerateExample loads the example baseline and modification', () => {
      component.btnGenerateExample();
      expect(component.baselineData.map(data => data.name)).toEqual(['Example Baseline']);
      expect(component.modificationData.map(data => data.name)).toEqual(['Example Modification']);
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineElectricityCost).toBe(0.062);
      expect(component.modificationElectricityCost).toBe(0.062);
      expect(serviceSpy.showAdditionalDetails).toBeTrue();
    });

    it('setTab and changeField/focusField update the selected tab and current field', () => {
      component.setTab('help');
      component.changeField('electricityCost');
      expect(component.tabSelect).toBe('help');
      expect(component.currentField).toBe('electricityCost');
      component.focusField('wattsPerLamp');
      expect(component.currentField).toBe('wattsPerLamp');
    });

    it('setBaselineSelected and setModificationSelected toggle baselineSelected', () => {
      component.setModificationSelected();
      expect(component.baselineSelected).toBeFalse();
      component.setBaselineSelected();
      expect(component.baselineSelected).toBeTrue();
    });

    it('setSmallScreenTab selects baseline or modification by tab', () => {
      component.setSmallScreenTab('modification');
      expect(component.smallScreenTab).toBe('modification');
      expect(component.baselineSelected).toBeFalse();
      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBeTrue();
      component.setSmallScreenTab('details');
      expect(component.baselineSelected).toBeTrue();
    });

    it('save emits the treasure hunt object', () => {
      const emitSpy = spyOn(component.emitSave, 'emit');
      component.save();
      expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        baseline: component.baselineData,
        opportunityType: Treasure.lightingReplacement,
      }));
    });

    it('cancel emits true', () => {
      const emitSpy = spyOn(component.emitCancel, 'emit');
      component.cancel();
      expect(emitSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('calculation triggers', () => {
    beforeEach(() => {
      createComponent();
    });

    it('updateBaselineData copies the emitted fixture into the baseline and recalculates', () => {
      serviceSpy.getResults.and.returnValue(makeResults(500));
      component.updateBaselineData({ ...makeFixtureData(0), name: 'Renamed', wattsPerLamp: 100 }, 0);
      expect(component.baselineData[0].name).toBe('Renamed');
      expect(component.baselineData[0].wattsPerLamp).toBe(100);
      expect(component.lightingReplacementResults.totalEnergySavings).toBe(500);
    });

    it('updateModificationData copies the emitted fixture into the modification and recalculates', () => {
      component.createModification();
      serviceSpy.getResults.and.returnValue(makeResults(750));
      component.updateModificationData({ ...makeFixtureData(0), numberOfFixtures: 12 }, 0);
      expect(component.modificationData[0].numberOfFixtures).toBe(12);
      expect(component.lightingReplacementResults.totalEnergySavings).toBe(750);
    });

    it('passes updated electricity costs to the results calculation', () => {
      component.baselineElectricityCost = 0.25;
      component.getResults();
      expect(serviceSpy.getResults).toHaveBeenCalledWith(jasmine.objectContaining({ baselineElectricityCost: 0.25 }));
    });
  });

  describe('template visibility', () => {
    describe('treasure hunt actions', () => {
      it('hides the save/cancel actions outside treasure hunt', () => {
        createComponent();
        expect(query('.treasure-hunt-help')).toBeNull();
        expect(query('.action-item')).toBeNull();
      });

      it('shows the save/cancel actions in treasure hunt', () => {
        createComponent({ inTreasureHunt: true });
        expect(query('.treasure-hunt-help')).not.toBeNull();
        expect(fixture.nativeElement.querySelectorAll('.action-item').length).toBe(2);
      });
    });

    describe('baseline fixtures', () => {
      beforeEach(() => {
        createComponent();
      });

      it('renders one baseline form per baseline fixture', () => {
        expect(getBaselineForms().length).toBe(1);
        component.addBaselineFixture();
        fixture.detectChanges();
        expect(getBaselineForms().length).toBe(2);
      });

      it('renders no baseline forms when all baseline fixtures are removed', () => {
        component.removeBaselineFixture(0);
        fixture.detectChanges();
        expect(getBaselineForms().length).toBe(0);
      });
    });

    describe('modification panel', () => {
      beforeEach(() => {
        createComponent();
      });

      it('shows the add-modification prompt and hides modification forms when no modification exists', () => {
        expect(getAddModificationButton()).not.toBeNull();
        expect(getPanels()[1].querySelector('.add-fixture')).toBeNull();
        expect(getPanels()[1].querySelector('input[name="modificationElectricityCost"]')).toBeNull();
        expect(getModificationForms().length).toBe(0);
      });

      it('shows the modification forms and hides the prompt when a modification exists', () => {
        component.createModification();
        fixture.detectChanges();
        expect(getAddModificationButton()).toBeNull();
        expect(getPanels()[1].querySelector('.add-fixture')).not.toBeNull();
        expect(getPanels()[1].querySelector('input[name="modificationElectricityCost"]')).not.toBeNull();
        expect(getModificationForms().length).toBe(1);
      });

      it('renders one modification form per modification fixture', () => {
        component.createModification();
        component.addModificationFixture();
        fixture.detectChanges();
        expect(getModificationForms().length).toBe(2);
      });

      it('returns to the add-modification prompt when the last modification is removed', () => {
        component.createModification();
        fixture.detectChanges();
        component.removeModificationFixture(0);
        fixture.detectChanges();
        expect(getAddModificationButton()).not.toBeNull();
        expect(getModificationForms().length).toBe(0);
      });
    });

    describe('results/help tabs', () => {
      beforeEach(() => {
        createComponent();
      });

      it('shows results and hides help on the results tab', () => {
        expect(query('app-lighting-replacement-results')).not.toBeNull();
        expect(query('app-lighting-replacement-help')).toBeNull();
      });

      it('shows help and hides results on the help tab', () => {
        component.setTab('help');
        fixture.detectChanges();
        expect(query('app-lighting-replacement-help')).not.toBeNull();
        expect(query('app-lighting-replacement-results')).toBeNull();
      });

      it('shows neither panel for an unrecognized tab', () => {
        component.setTab('other');
        fixture.detectChanges();
        expect(query('app-lighting-replacement-help')).toBeNull();
        expect(query('app-lighting-replacement-results')).toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('persists the calculator data to the service when not in treasure hunt', () => {
      createComponent();
      component.createModification();
      component.baselineElectricityCost = 0.3;
      serviceSpy.showAdditionalDetails = true;
      fixture.destroy();
      expect(serviceSpy.baselineData).toBe(component.baselineData);
      expect(serviceSpy.modificationData).toBe(component.modificationData);
      expect(serviceSpy.baselineElectricityCost).toBe(0.3);
      expect(serviceSpy.showAdditionalDetails).toBeFalse();
    });

    it('clears the calculator data on the service when in treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      component.createModification();
      fixture.destroy();
      expect(serviceSpy.baselineData).toBeUndefined();
      expect(serviceSpy.modificationData).toBeUndefined();
      expect(serviceSpy.baselineElectricityCost).toBeUndefined();
      expect(serviceSpy.modificationElectricityCost).toBeUndefined();
    });
  });
});
