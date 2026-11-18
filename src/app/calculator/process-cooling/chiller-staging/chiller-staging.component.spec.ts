import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ChillerStagingComponent } from './chiller-staging.component';
import { ChillerStagingService } from './chiller-staging.service';
import { ChillerStagingFormService } from './chiller-staging-form.service';
import { ChillerCalculatorSuiteApiService } from '../../../tools-suite-api/chiller-calculator-suite-api.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ChillerStagingInput, ChillerStagingOutput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { ChillerStagingTreasureHunt, Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial', electricityCost: 0.1 } as Settings;
const GLOBAL_SETTINGS = { unitsOfMeasure: 'Metric', electricityCost: 0.2 } as Settings;

function makeInput(overrides: Partial<ChillerStagingInput> = {}): ChillerStagingInput {
  return {
    chillerType: 0,
    condenserCoolingType: 0,
    motorDriveType: 0,
    compressorConfigType: 1,
    electricityCost: 0.1,
    ariCapacity: 1000,
    ariEfficiency: 0.676,
    maxCapacityRatio: 1,
    coolingLoad: 0,
    operatingHours: 1,
    waterSupplyTemp: 42,
    waterEnteringTemp: 82.12,
    baselineLoadList: [300, 300],
    modLoadList: [600, 0],
    ...overrides,
  };
}

function makeSuiteOutput(): ChillerStagingOutput {
  return {
    baselineTotalPower: 10,
    baselineTotalEnergy: 100,
    modTotalPower: 8,
    modTotalEnergy: 80,
    savingsEnergy: 20,
    costSavings: 0,
    baselineCost: 0,
    modificationCost: 0,
    baselinePowerList: [5, 5],
    modPowerList: [8, 0],
  };
}

describe('ChillerStagingComponent', () => {
  let component: ChillerStagingComponent;
  let fixture: ComponentFixture<ChillerStagingComponent>;
  let chillerStagingService: ChillerStagingService;
  let suiteApiSpy: jasmine.SpyObj<ChillerCalculatorSuiteApiService>;
  let analyticsSpy: jasmine.SpyObj<AnalyticsService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function findButton(text: string): HTMLButtonElement {
    return Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: HTMLButtonElement) => button.textContent.trim() === text) as HTMLButtonElement;
  }

  function createComponent(inputs: { settings?: Settings, inTreasureHunt?: boolean } = { settings: MOCK_SETTINGS }): void {
    fixture = TestBed.createComponent(ChillerStagingComponent);
    component = fixture.componentInstance;
    // resizeTabs measures real DOM heights after a timeout; not relevant to these tests
    spyOn(component, 'resizeTabs');
    Object.keys(inputs).forEach(key => fixture.componentRef.setInput(key, inputs[key]));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    suiteApiSpy = jasmine.createSpyObj('ChillerCalculatorSuiteApiService', ['chillerStagingEfficiency']);
    suiteApiSpy.chillerStagingEfficiency.and.callFake(() => makeSuiteOutput());
    analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    const settingsDbService: Partial<SettingsDbService> = { globalSettings: GLOBAL_SETTINGS };

    await TestBed.configureTestingModule({
      declarations: [ChillerStagingComponent],
      providers: [
        ChillerStagingService,
        ChillerStagingFormService,
        ConvertUnitsService,
        { provide: ChillerCalculatorSuiteApiService, useValue: suiteApiSpy },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: AnalyticsService, useValue: analyticsSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    chillerStagingService = TestBed.inject(ChillerStagingService);
  });

  describe('initialization', () => {
    it('should send the analytics event', () => {
      createComponent();
      expect(analyticsSpy.sendEvent).toHaveBeenCalledWith('calculator-PC-chiller-staging');
    });

    it('should fall back to the global settings when no settings input is given', () => {
      createComponent({});
      expect(component.settings).toBe(GLOBAL_SETTINGS);
      expect(chillerStagingService.chillerStagingInput.getValue().electricityCost).toBe(0.2);
    });

    it('should seed empty inputs and calculate when the service has no input', () => {
      createComponent();
      const input = chillerStagingService.chillerStagingInput.getValue();
      expect(input.baselineLoadList).toEqual([0]);
      expect(input.electricityCost).toBe(0.1);
      expect(component.chillerStagingInput).toEqual(input);
      expect(suiteApiSpy.chillerStagingEfficiency).toHaveBeenCalled();
      expect(chillerStagingService.chillerStagingOutput.getValue()).toBeDefined();
    });

    it('should keep an existing service input', () => {
      const existing = makeInput();
      chillerStagingService.chillerStagingInput.next(existing);
      createComponent();
      expect(component.chillerStagingInput).toBe(existing);
    });
  });

  describe('input observer / calculation trigger', () => {
    it('should recalculate and publish the output whenever a new input arrives', () => {
      createComponent();
      suiteApiSpy.chillerStagingEfficiency.calls.reset();
      chillerStagingService.chillerStagingInput.next(makeInput({ electricityCost: 0.5 }));
      expect(suiteApiSpy.chillerStagingEfficiency).toHaveBeenCalledTimes(1);
      const output = chillerStagingService.chillerStagingOutput.getValue();
      expect(output.chillerLoadResults).toEqual([{ baseline: 5, modification: 8 }, { baseline: 5, modification: 0 }]);
      expect(output.baselineCost).toBe(50);

      chillerStagingService.chillerStagingInput.next(makeInput({ electricityCost: 1 }));
      expect(chillerStagingService.chillerStagingOutput.getValue().baselineCost).toBe(100);
    });

    it('should not recalculate when the input is cleared', () => {
      createComponent();
      suiteApiSpy.chillerStagingEfficiency.calls.reset();
      chillerStagingService.chillerStagingInput.next(undefined);
      expect(component.chillerStagingInput).toBeUndefined();
      expect(suiteApiSpy.chillerStagingEfficiency).not.toHaveBeenCalled();
    });
  });

  describe('treasure hunt header', () => {
    it('should hide the save/cancel actions outside treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: false });
      expect(query('.treasure-hunt-help')).toBeNull();
      expect(query('.fa-save')).toBeNull();
      expect(query('.fa-times')).toBeNull();
    });

    it('should show the save/cancel actions in treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      expect(query('.treasure-hunt-help')).not.toBeNull();
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
    });

    it('should emit the current input when save is clicked', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      const input = makeInput();
      chillerStagingService.chillerStagingInput.next(input);
      const emitted: Array<ChillerStagingTreasureHunt> = [];
      component.emitSave.subscribe(value => emitted.push(value));
      (query('.fa-save').parentElement as HTMLElement).click();
      expect(emitted).toEqual([{ chillerStagingData: input, opportunityType: Treasure.chillerStaging }]);
    });

    it('should emit cancel when cancel is clicked', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      const emitted: Array<boolean> = [];
      component.emitCancel.subscribe(value => emitted.push(value));
      (query('.fa-times').parentElement as HTMLElement).click();
      expect(emitted).toEqual([true]);
    });
  });

  describe('results/help tabs', () => {
    it('should show results and hide help by default', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
      expect(query('app-chiller-staging-results')).not.toBeNull();
      expect(query('app-chiller-staging-help')).toBeNull();
    });

    it('should show help and hide results after selecting the help tab', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-chiller-staging-results')).toBeNull();
      expect(query('app-chiller-staging-help')).not.toBeNull();
    });

    it('should show results again after switching back', () => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      component.setTab('results');
      fixture.detectChanges();
      expect(query('app-chiller-staging-results')).not.toBeNull();
      expect(query('app-chiller-staging-help')).toBeNull();
    });

    it('should always render the form', () => {
      createComponent();
      expect(query('app-chiller-staging-form')).not.toBeNull();
    });

    it('should track the small screen tab', () => {
      createComponent();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('user actions', () => {
    it('should reset to empty inputs and signal a reset', () => {
      chillerStagingService.chillerStagingInput.next(makeInput());
      createComponent();
      findButton('Reset Data').click();
      const input = chillerStagingService.chillerStagingInput.getValue();
      expect(input.ariCapacity).toBe(0);
      expect(input.baselineLoadList).toEqual([0]);
      expect(chillerStagingService.resetData.getValue()).toBeTrue();
    });

    it('should load the example inputs and signal it', () => {
      createComponent();
      findButton('Generate Example').click();
      const input = chillerStagingService.chillerStagingInput.getValue();
      expect(input.ariCapacity).toBe(1000);
      expect(input.baselineLoadList).toEqual([300, 300, 300]);
      expect(chillerStagingService.generateExample.getValue()).toBeTrue();
    });
  });

  describe('destroy', () => {
    it('should keep the input in the service outside treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: false });
      const input = makeInput();
      chillerStagingService.chillerStagingInput.next(input);
      fixture.destroy();
      expect(chillerStagingService.chillerStagingInput.getValue()).toBe(input);
    });

    it('should clear the service input in treasure hunt', () => {
      createComponent({ settings: MOCK_SETTINGS, inTreasureHunt: true });
      chillerStagingService.chillerStagingInput.next(makeInput());
      fixture.destroy();
      expect(chillerStagingService.chillerStagingInput.getValue()).toBeUndefined();
    });

    it('should stop recalculating after destroy', () => {
      createComponent();
      fixture.destroy();
      suiteApiSpy.chillerStagingEfficiency.calls.reset();
      chillerStagingService.chillerStagingInput.next(makeInput());
      expect(suiteApiSpy.chillerStagingEfficiency).not.toHaveBeenCalled();
    });
  });
});
