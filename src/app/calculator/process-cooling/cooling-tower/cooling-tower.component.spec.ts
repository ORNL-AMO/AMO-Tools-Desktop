import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CoolingTowerComponent } from './cooling-tower.component';
import { CoolingTowerFormComponent } from './cooling-tower-form/cooling-tower-form.component';
import { CoolingTowerService } from './cooling-tower.service';
import { ChillerService } from '../chiller.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { Settings } from '../../../shared/models/settings';
import { OperatingHours } from '../../../shared/models/operations';
import { CoolingTowerData } from '../../../shared/models/chillers';
import { CoolingTowerMakeupWaterTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

const GLOBAL_SETTINGS = { unitsOfMeasure: 'Imperial', defaultPanelTab: 'help' } as Settings;
const MOCK_OPERATING_HOURS = { hoursPerYear: 5000 } as OperatingHours;

function makeData(index: number, overrides: Partial<CoolingTowerData> = {}): CoolingTowerData {
  return {
    name: 'Case #' + (index + 1),
    operationalHours: 5000,
    flowRate: 1,
    userDefinedCoolingLoad: true,
    waterCost: 0,
    temperatureDifference: 0,
    coolingLoad: 0,
    lossCorrectionFactor: 85,
    hasDriftEliminator: 0,
    driftLossFactor: .2,
    cyclesOfConcentration: 1,
    ...overrides,
  };
}

describe('CoolingTowerComponent', () => {
  let component: CoolingTowerComponent;
  let fixture: ComponentFixture<CoolingTowerComponent>;
  let service: CoolingTowerService;
  let settingsDbServiceSpy: jasmine.SpyObj<SettingsDbService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  async function configure(extraDeclarations: Array<Type<unknown>> = []): Promise<void> {
    settingsDbServiceSpy = jasmine.createSpyObj('SettingsDbService', ['getByDirectoryId'], { globalSettings: GLOBAL_SETTINGS });
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);

    await TestBed.configureTestingModule({
      declarations: [CoolingTowerComponent, ...extraDeclarations],
      imports: [ReactiveFormsModule],
      providers: [
        CoolingTowerService,
        { provide: ChillerService, useValue: jasmine.createSpyObj('ChillerService', ['coolingTowerMakeupWater']) },
        { provide: ConvertUnitsService, useValue: jasmine.createSpyObj('ConvertUnitsService', ['value']) },
        { provide: SettingsDbService, useValue: settingsDbServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(CoolingTowerService);
    // The suite calculation is out of scope here; publish empty outputs so child forms can subscribe safely.
    spyOn(service, 'calculate').and.callFake(() => service.initDefaultEmptyOutputs());
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getPanels(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.calculator-panel-container'));
  }

  function getBaselineForms(): Array<HTMLElement> {
    return Array.from(getPanels()[0].querySelectorAll('app-cooling-tower-form'));
  }

  function getModificationForms(): Array<HTMLElement> {
    return Array.from(getPanels()[1].querySelectorAll('app-cooling-tower-form'));
  }

  function getAddModificationButton(): HTMLElement | null {
    return Array.from(getPanels()[1].querySelectorAll('button'))
      .find((button: HTMLElement) => button.textContent.includes('Add Modified Condition')) as HTMLElement ?? null;
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, settings?: Settings } = {}): void {
    fixture = TestBed.createComponent(CoolingTowerComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('operatingHours', MOCK_OPERATING_HOURS);
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    fixture.detectChanges();
  }

  describe('with stubbed child forms', () => {
    beforeEach(async () => {
      await configure();
    });

    describe('initialization', () => {
      it('sends the analytics event', () => {
        createComponent();
        expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PC-cooling-tower');
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

      it('creates one baseline case when the service has no saved data', () => {
        spyOn(service, 'initDefaultEmptyInputs').and.callThrough();
        createComponent({ inTreasureHunt: false });
        expect(service.initDefaultEmptyInputs).toHaveBeenCalledWith(0, GLOBAL_SETTINGS, MOCK_OPERATING_HOURS, false);
        expect(component.baselineData).toEqual([makeData(0)]);
        expect(component.modificationData).toBeUndefined();
        expect(component.modificationExists).toBeFalse();
      });

      it('restores saved baseline and modification data from the service', () => {
        const baseline = [makeData(0), makeData(1)];
        const modification = [makeData(0, { name: 'Saved Mod' })];
        service.baselineData.next(baseline);
        service.modificationData.next(modification);
        spyOn(service, 'initDefaultEmptyInputs').and.callThrough();
        createComponent();
        expect(service.initDefaultEmptyInputs).not.toHaveBeenCalled();
        expect(component.baselineData).toBe(baseline);
        expect(component.modificationData).toBe(modification);
        expect(component.modificationExists).toBeTrue();
      });

      it('calculates results with the active settings', () => {
        createComponent();
        expect(service.calculate).toHaveBeenCalledWith(GLOBAL_SETTINGS);
      });
    });

    describe('reactive observers', () => {
      beforeEach(() => {
        createComponent();
      });

      it('takes new baseline data from the service, reselects the baseline and recalculates', () => {
        component.setModificationSelected();
        (service.calculate as jasmine.Spy).calls.reset();
        const baseline = [makeData(0, { name: 'Updated' })];
        service.baselineData.next(baseline);
        expect(component.baselineData).toBe(baseline);
        expect(component.baselineSelected).toBeTrue();
        expect(service.calculate).toHaveBeenCalledTimes(1);
      });

      it('takes new modification data from the service and recalculates', () => {
        (service.calculate as jasmine.Spy).calls.reset();
        const modification = [makeData(0, { name: 'Mod' })];
        service.modificationData.next(modification);
        expect(component.modificationData).toBe(modification);
        expect(service.calculate).toHaveBeenCalledTimes(1);
      });
    });

    describe('user actions', () => {
      beforeEach(() => {
        createComponent({ inTreasureHunt: false });
      });

      it('addCase appends a baseline case only while no modification exists', () => {
        spyOn(service, 'addCase').and.callThrough();
        component.addCase();
        expect(service.addCase).toHaveBeenCalledWith(GLOBAL_SETTINGS, MOCK_OPERATING_HOURS, false, false);
        expect(component.baselineData.map(data => data.name)).toEqual(['Case #1', 'Case #2']);
        expect(component.modificationData).toBeUndefined();
      });

      it('addCase appends to both lists once a modification exists', () => {
        component.createModification();
        component.addCase();
        expect(component.baselineData.length).toBe(2);
        expect(component.modificationData.length).toBe(2);
      });

      it('createModification copies the baseline and selects the modification panel', () => {
        component.createModification();
        expect(component.modificationData).toEqual(component.baselineData);
        expect(component.modificationData[0]).not.toBe(component.baselineData[0]);
        expect(component.modificationExists).toBeTrue();
        expect(component.baselineSelected).toBeFalse();
      });

      it('btnResetData signals a reset, restores one baseline case and removes the modification', () => {
        const resets: Array<boolean> = [];
        service.resetData.subscribe(value => resets.push(value));
        component.createModification();
        component.addCase();
        component.btnResetData();
        expect(resets[resets.length - 1]).toBeTrue();
        expect(component.baselineData).toEqual([makeData(0)]);
        expect(component.modificationData).toBeUndefined();
        expect(component.modificationExists).toBeFalse();
      });

      it('btnGenerateExample loads the example and selects the baseline', () => {
        spyOn(service, 'generateExampleData').and.callThrough();
        component.setModificationSelected();
        component.btnGenerateExample();
        expect(service.generateExampleData).toHaveBeenCalledWith(GLOBAL_SETTINGS);
        expect(component.baselineData[0].flowRate).toBe(2500);
        expect(component.modificationData[0].hasDriftEliminator).toBe(1);
        expect(component.modificationExists).toBeTrue();
        expect(component.baselineSelected).toBeTrue();
      });

      it('save emits the baseline and modification as a cooling tower makeup treasure', () => {
        const emitted: Array<CoolingTowerMakeupWaterTreasureHunt> = [];
        component.emitSave.subscribe(value => emitted.push(value));
        component.createModification();
        component.save();
        expect(emitted).toEqual([{ baseline: component.baselineData, modification: component.modificationData, opportunityType: Treasure.coolingTowerMakeup }]);
      });

      it('cancel emits true', () => {
        const emitted: Array<boolean> = [];
        component.emitCancel.subscribe(value => emitted.push(value));
        component.cancel();
        expect(emitted).toEqual([true]);
      });

      it('setTab updates the selected panel tab', () => {
        component.setTab('results');
        expect(component.tabSelect).toBe('results');
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

    describe('template visibility', () => {
      it('hides the treasure hunt actions outside a treasure hunt', () => {
        createComponent({ inTreasureHunt: false });
        expect(query('.fa-save')).toBeNull();
        expect(query('.fa-times')).toBeNull();
        expect(query('.treasure-hunt-help')).toBeNull();
      });

      it('shows the treasure hunt actions in a treasure hunt', () => {
        createComponent({ inTreasureHunt: true });
        expect(query('.fa-save')).not.toBeNull();
        expect(query('.fa-times')).not.toBeNull();
        expect(query('.treasure-hunt-help')).not.toBeNull();
      });

      it('renders one baseline form per baseline case', () => {
        createComponent();
        expect(getBaselineForms().length).toBe(1);
        component.addCase();
        fixture.detectChanges();
        expect(getBaselineForms().length).toBe(2);
      });

      it('removes the deleted baseline form rather than the last one', () => {
        createComponent();
        component.addCase();
        fixture.detectChanges();
        const secondForm = getBaselineForms()[1];

        service.removeCase(0);
        fixture.detectChanges();

        // Items are tracked by identity, so the remaining case keeps its existing form instance.
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
        component.addCase();
        fixture.detectChanges();
        expect(getAddModificationButton()).toBeNull();
        expect(getModificationForms().length).toBe(2);
      });

      it('removes the deleted modification form rather than the last one', () => {
        createComponent();
        component.createModification();
        component.addCase();
        fixture.detectChanges();
        const secondForm = getModificationForms()[1];

        service.removeCase(0);
        fixture.detectChanges();

        expect(getModificationForms().length).toBe(1);
        expect(getModificationForms()[0]).toBe(secondForm);
      });

      it('shows the prompt again after the data is reset', () => {
        createComponent();
        component.createModification();
        fixture.detectChanges();
        component.btnResetData();
        fixture.detectChanges();
        expect(getAddModificationButton()).not.toBeNull();
        expect(getModificationForms().length).toBe(0);
      });

      const tabCases: Array<{ tab: string, results: boolean, help: boolean }> = [
        { tab: 'results', results: true, help: false },
        { tab: 'help', results: false, help: true },
        { tab: 'other', results: false, help: false },
      ];
      tabCases.forEach(testCase => {
        it(`on the "${testCase.tab}" tab shows results=${testCase.results} and help=${testCase.help}`, () => {
          createComponent();
          component.setTab(testCase.tab);
          fixture.detectChanges();
          expect(query('app-cooling-tower-results') !== null).toBe(testCase.results);
          expect(query('app-cooling-tower-help') !== null).toBe(testCase.help);
        });
      });
    });

    describe('destroy', () => {
      it('saves the baseline and modification to the service outside a treasure hunt', () => {
        createComponent({ inTreasureHunt: false });
        component.createModification();
        const baseline = component.baselineData;
        const modification = component.modificationData;
        fixture.destroy();
        expect(service.baselineData.getValue()).toBe(baseline);
        expect(service.modificationData.getValue()).toBe(modification);
      });

      it('clears the saved data in the service inside a treasure hunt', () => {
        createComponent({ inTreasureHunt: true });
        component.createModification();
        fixture.destroy();
        expect(service.baselineData.getValue()).toBeUndefined();
        expect(service.modificationData.getValue()).toBeUndefined();
      });

      it('stops reacting to service data after destroy', () => {
        createComponent();
        fixture.destroy();
        (service.calculate as jasmine.Spy).calls.reset();
        const baseline = [makeData(0, { name: 'After destroy' })];
        service.baselineData.next(baseline);
        service.modificationData.next([makeData(0)]);
        expect(service.calculate).not.toHaveBeenCalled();
        expect(component.baselineData).not.toBe(baseline);
      });
    });
  });

  describe('list tracking with real child forms', () => {
    beforeEach(async () => {
      await configure([CoolingTowerFormComponent]);
    });

    function getFormName(form: HTMLElement): string {
      return form.querySelector('label.group-label').textContent.replace('+Remove Case', '').trim();
    }

    it('keeps the remaining baseline form and its values when the first case is deleted', () => {
      createComponent();
      component.addCase();
      fixture.detectChanges();
      const secondForm = getBaselineForms()[1];
      expect(getBaselineForms().map(getFormName)).toEqual(['Case #1', 'Case #2']);

      service.removeCase(0);
      fixture.detectChanges();

      expect(getBaselineForms().length).toBe(1);
      expect(getBaselineForms()[0]).toBe(secondForm);
      expect(getFormName(getBaselineForms()[0])).toBe('Case #2');
    });

    it('keeps the remaining modification form and its values when the first case is deleted', () => {
      createComponent();
      component.createModification();
      component.addCase();
      fixture.detectChanges();
      const secondForm = getModificationForms()[1];
      expect(getModificationForms().map(getFormName)).toEqual(['Case #1', 'Case #2']);

      service.removeCase(0);
      fixture.detectChanges();

      expect(getModificationForms().length).toBe(1);
      expect(getModificationForms()[0]).toBe(secondForm);
      expect(getFormName(getModificationForms()[0])).toBe('Case #2');
    });
  });
});
