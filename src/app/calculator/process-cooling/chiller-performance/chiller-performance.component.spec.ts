import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChillerPerformanceComponent } from './chiller-performance.component';
import { ChillerPerformanceService } from './chiller-performance.service';
import { WeatherBinsService } from '../../utilities/weather-bins/weather-bins.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { ChillerPerformanceInput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { Treasure } from '../../../shared/models/treasure-hunt';

const GLOBAL_SETTINGS = { unitsOfMeasure: 'Imperial', electricityCost: 0.066 } as Settings;
const INPUT_SETTINGS = { unitsOfMeasure: 'Metric', electricityCost: 0.1 } as Settings;

function makeInput(overrides: Partial<ChillerPerformanceInput> = {}): ChillerPerformanceInput {
  return {
    chillerType: 0,
    condenserCoolingType: 0,
    motorDriveType: 0,
    compressorConfigType: 0,
    ariCapacity: 1000,
    ariEfficiency: 0.676,
    maxCapacityRatio: 0.92,
    waterDeltaT: 10,
    waterFlowRate: 2400,
    operatingHours: 8760,
    baselineWaterSupplyTemp: 44,
    baselineWaterEnteringTemp: 85,
    modWaterSupplyTemp: 46,
    modWaterEnteringTemp: 80,
    electricityCost: 0.066,
    ...overrides,
  };
}

describe('ChillerPerformanceComponent', () => {
  let component: ChillerPerformanceComponent;
  let fixture: ComponentFixture<ChillerPerformanceComponent>;
  let chillerPerformanceServiceSpy: jasmine.SpyObj<ChillerPerformanceService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let inputSubject: BehaviorSubject<ChillerPerformanceInput>;
  let resetData: BehaviorSubject<boolean>;
  let generateExample: BehaviorSubject<boolean>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(inputs: { settings?: Settings, inTreasureHunt?: boolean } = {}): void {
    fixture = TestBed.createComponent(ChillerPerformanceComponent);
    component = fixture.componentInstance;
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    fixture.detectChanges();
    tick(100);
  }

  beforeEach(async () => {
    inputSubject = new BehaviorSubject<ChillerPerformanceInput>(undefined);
    resetData = new BehaviorSubject<boolean>(undefined);
    generateExample = new BehaviorSubject<boolean>(undefined);
    chillerPerformanceServiceSpy = jasmine.createSpyObj('ChillerPerformanceService',
      ['initDefaultEmptyInputs', 'initDefaultEmptyOutputs', 'calculate', 'generateExampleData'],
      { chillerPerformanceInput: inputSubject, resetData: resetData, generateExample: generateExample });
    chillerPerformanceServiceSpy.initDefaultEmptyInputs.and.callFake(() => inputSubject.next(makeInput({ ariCapacity: 0 })));
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    const settingsDbService: Partial<SettingsDbService> = { globalSettings: GLOBAL_SETTINGS };
    const weatherBinsService: Partial<WeatherBinsService> = {};

    await TestBed.configureTestingModule({
      declarations: [ChillerPerformanceComponent],
      providers: [
        { provide: ChillerPerformanceService, useValue: chillerPerformanceServiceSpy },
        { provide: WeatherBinsService, useValue: weatherBinsService },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event', fakeAsync(() => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PC-chiller-performance');
    }));

    it('uses global settings when no settings input is given', fakeAsync(() => {
      createComponent();
      expect(component.settings).toBe(GLOBAL_SETTINGS);
    }));

    it('keeps the settings input when given', fakeAsync(() => {
      createComponent({ settings: INPUT_SETTINGS });
      expect(component.settings).toBe(INPUT_SETTINGS);
    }));

    it('initializes default inputs and outputs when the service has no input', fakeAsync(() => {
      createComponent();
      expect(chillerPerformanceServiceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(GLOBAL_SETTINGS);
      expect(chillerPerformanceServiceSpy.initDefaultEmptyOutputs).toHaveBeenCalled();
    }));

    it('keeps existing inputs when the service already has input', fakeAsync(() => {
      const existing = makeInput();
      inputSubject.next(existing);
      createComponent();
      expect(chillerPerformanceServiceSpy.initDefaultEmptyInputs).not.toHaveBeenCalled();
      expect(component.chillerPerformanceInput).toBe(existing);
    }));

    it('defaults to the results and form tabs', fakeAsync(() => {
      createComponent();
      expect(component.tabSelect).toBe('results');
      expect(component.smallScreenTab).toBe('form');
    }));
  });

  describe('calculation triggers', () => {
    it('calculates with the settings when the input is initialized', fakeAsync(() => {
      createComponent({ settings: INPUT_SETTINGS });
      expect(chillerPerformanceServiceSpy.calculate).toHaveBeenCalledWith(INPUT_SETTINGS);
    }));

    it('recalculates when the input changes', fakeAsync(() => {
      createComponent();
      chillerPerformanceServiceSpy.calculate.calls.reset();
      const updated = makeInput({ ariCapacity: 1500 });
      inputSubject.next(updated);
      expect(component.chillerPerformanceInput).toBe(updated);
      expect(chillerPerformanceServiceSpy.calculate).toHaveBeenCalledTimes(1);
    }));

    it('does not calculate when the input is cleared', fakeAsync(() => {
      createComponent();
      chillerPerformanceServiceSpy.calculate.calls.reset();
      inputSubject.next(undefined);
      expect(chillerPerformanceServiceSpy.calculate).not.toHaveBeenCalled();
    }));
  });

  describe('user actions', () => {
    beforeEach(fakeAsync(() => createComponent()));

    it('resets data to default inputs and signals reset', () => {
      chillerPerformanceServiceSpy.initDefaultEmptyInputs.calls.reset();
      component.btnResetData();
      expect(chillerPerformanceServiceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(GLOBAL_SETTINGS);
      expect(resetData.getValue()).toBeTrue();
    });

    it('generates example data and signals generate example', () => {
      component.btnGenerateExample();
      expect(chillerPerformanceServiceSpy.generateExampleData).toHaveBeenCalledWith(GLOBAL_SETTINGS);
      expect(generateExample.getValue()).toBeTrue();
    });

    it('emits the treasure hunt opportunity on save', () => {
      const saveSpy = jasmine.createSpy('emitSave');
      component.emitSave.subscribe(saveSpy);
      component.save();
      expect(saveSpy).toHaveBeenCalledWith({ chillerPerformanceData: component.chillerPerformanceInput, opportunityType: Treasure.chillerPerformance });
    });

    it('emits cancel', () => {
      const cancelSpy = jasmine.createSpy('emitCancel');
      component.emitCancel.subscribe(cancelSpy);
      component.cancel();
      expect(cancelSpy).toHaveBeenCalledWith(true);
    });

    it('sets the small screen tab', () => {
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('template visibility', () => {
    it('hides the treasure hunt actions outside treasure hunt', fakeAsync(() => {
      createComponent({ inTreasureHunt: false });
      expect(query('.fa-save')).toBeNull();
      expect(query('.fa-times')).toBeNull();
      expect(query('.treasure-hunt-help')).toBeNull();
    }));

    it('shows the treasure hunt actions in treasure hunt', fakeAsync(() => {
      createComponent({ inTreasureHunt: true });
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
      expect(query('.treasure-hunt-help')).not.toBeNull();
    }));

    it('emits save when the treasure hunt save action is clicked', fakeAsync(() => {
      createComponent({ inTreasureHunt: true });
      const saveSpy = jasmine.createSpy('emitSave');
      component.emitSave.subscribe(saveSpy);
      (query('.fa-save').parentElement as HTMLElement).click();
      expect(saveSpy).toHaveBeenCalled();
    }));

    it('shows the form, buttons, and results tab content by default', fakeAsync(() => {
      createComponent();
      expect(query('app-chiller-performance-form')).not.toBeNull();
      expect(query('button.btn-danger').textContent.trim()).toBe('Reset Data');
      expect(query('button.btn-primary').textContent.trim()).toBe('Generate Example');
      expect(query('app-chiller-performance-results')).not.toBeNull();
      expect(query('app-chiller-performance-help')).toBeNull();
    }));

    it('shows help and hides results on the help tab', fakeAsync(() => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-chiller-performance-help')).not.toBeNull();
      expect(query('app-chiller-performance-results')).toBeNull();
    }));

    it('returns to results from the help tab', fakeAsync(() => {
      createComponent();
      component.setTab('help');
      fixture.detectChanges();
      component.setTab('results');
      fixture.detectChanges();
      expect(query('app-chiller-performance-results')).not.toBeNull();
      expect(query('app-chiller-performance-help')).toBeNull();
    }));

    it('hides form, buttons, results, and help when the weather tab is displayed', fakeAsync(() => {
      createComponent();
      component.displayWeatherTab = true;
      fixture.detectChanges();
      expect(query('app-chiller-performance-form')).toBeNull();
      expect(query('button.btn-danger')).toBeNull();
      expect(query('app-chiller-performance-results')).toBeNull();
      expect(query('app-chiller-performance-help')).toBeNull();
      expect(query('.panel-tab-item')).not.toBeNull();
    }));

    it('hides help on the help tab when the weather tab is displayed', fakeAsync(() => {
      createComponent();
      component.setTab('help');
      component.displayWeatherTab = true;
      fixture.detectChanges();
      expect(query('app-chiller-performance-help')).toBeNull();
    }));
  });

  describe('destroy', () => {
    it('stores the current input back to the service outside treasure hunt', fakeAsync(() => {
      const existing = makeInput();
      inputSubject.next(existing);
      createComponent({ inTreasureHunt: false });
      fixture.destroy();
      expect(inputSubject.getValue()).toBe(existing);
    }));

    it('clears the service input in treasure hunt', fakeAsync(() => {
      inputSubject.next(makeInput());
      createComponent({ inTreasureHunt: true });
      fixture.destroy();
      expect(inputSubject.getValue()).toBeUndefined();
    }));

    it('stops recalculating after destroy', fakeAsync(() => {
      inputSubject.next(makeInput());
      createComponent();
      fixture.destroy();
      chillerPerformanceServiceSpy.calculate.calls.reset();
      inputSubject.next(makeInput({ ariCapacity: 5 }));
      expect(chillerPerformanceServiceSpy.calculate).not.toHaveBeenCalled();
    }));
  });
});
