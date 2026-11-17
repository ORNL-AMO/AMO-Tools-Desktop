import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StatePointAnalysisComponent } from './state-point-analysis.component';
import { StatePointAnalysisService } from './state-point-analysis.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { StatePointAnalysisInput, StatePointAnalysisOutput } from '../../../shared/models/waste-water';
import { Settings } from '../../../shared/models/settings';

const GLOBAL_SETTINGS: Settings = { unitsOfMeasure: 'Imperial' };

function makeInput(): StatePointAnalysisInput {
  return {
    sviParameter: 1,
    sviValue: 150,
    numberOfClarifiers: 2,
    areaOfClarifier: 900,
    diameter: 0,
    isUserDefinedArea: true,
    MLSS: 2.5,
    influentFlow: 1,
    rasFlow: 0.7,
    sludgeSettlingVelocity: 375,
  };
}

function makeOutput(): StatePointAnalysisOutput {
  return { baseline: undefined, modification: undefined, sviParameterName: 'SVIGN' };
}

function makeServiceMock(baseline: StatePointAnalysisInput) {
  return {
    baselineData: new BehaviorSubject<StatePointAnalysisInput>(baseline),
    modificationData: new BehaviorSubject<StatePointAnalysisInput>(undefined),
    output: new BehaviorSubject<StatePointAnalysisOutput>(undefined),
    resetData: new BehaviorSubject<boolean>(undefined),
    initDefaultEmptyOutput: jasmine.createSpy('initDefaultEmptyOutput'),
    initDefaultEmptyInputs: jasmine.createSpy('initDefaultEmptyInputs'),
    initModification: jasmine.createSpy('initModification'),
    generateExampleData: jasmine.createSpy('generateExampleData'),
    calculate: jasmine.createSpy('calculate'),
  };
}

describe('StatePointAnalysisComponent', () => {
  let component: StatePointAnalysisComponent;
  let fixture: ComponentFixture<StatePointAnalysisComponent>;
  let serviceMock: ReturnType<typeof makeServiceMock>;
  let analyticsSpy: jasmine.SpyObj<AnalyticsService>;

  function setup(options: { settings?: Settings, inTreasureHunt?: boolean, baseline?: StatePointAnalysisInput } = {}): void {
    serviceMock = makeServiceMock('baseline' in options ? options.baseline : makeInput());
    fixture = TestBed.createComponent(StatePointAnalysisComponent);
    component = fixture.componentInstance;
    if (options.settings) {
      fixture.componentRef.setInput('settings', options.settings);
    }
    fixture.componentRef.setInput('inTreasureHunt', options.inTreasureHunt ?? false);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  function count(selector: string): number {
    return fixture.nativeElement.querySelectorAll(selector).length;
  }

  beforeEach(async () => {
    analyticsSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    await TestBed.configureTestingModule({
      declarations: [StatePointAnalysisComponent],
      providers: [
        // Resolved lazily, so each test's setup() can build its own mock before the component is created.
        { provide: StatePointAnalysisService, useFactory: () => serviceMock },
        { provide: SettingsDbService, useValue: { globalSettings: GLOBAL_SETTINGS } },
        { provide: AnalyticsService, useValue: analyticsSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the calculator analytics event', () => {
      setup();
      expect(analyticsSpy.sendEvent).toHaveBeenCalledWith('calculator-WW-state-point-analysis');
    });

    it('falls back to the global settings when none are provided', () => {
      setup();
      expect(component.settings).toBe(GLOBAL_SETTINGS);
    });

    it('keeps provided settings', () => {
      const settings: Settings = { unitsOfMeasure: 'Metric' };
      setup({ settings });
      expect(component.settings).toBe(settings);
    });

    it('initializes default inputs and output when no baseline data exists', () => {
      setup({ baseline: undefined });
      expect(serviceMock.initDefaultEmptyOutput).toHaveBeenCalled();
      expect(serviceMock.initDefaultEmptyInputs).toHaveBeenCalled();
    });

    it('keeps existing baseline data', () => {
      setup();
      expect(serviceMock.initDefaultEmptyOutput).not.toHaveBeenCalled();
      expect(serviceMock.initDefaultEmptyInputs).not.toHaveBeenCalled();
    });

    it('calculates with the settings for the initial baseline and modification data', () => {
      setup();
      expect(serviceMock.calculate).toHaveBeenCalledTimes(2);
      expect(serviceMock.calculate).toHaveBeenCalledWith(GLOBAL_SETTINGS);
    });

    it('starts without a modification and with the baseline and graph selected', () => {
      setup();
      expect(component.modificationExists).toBeFalse();
      expect(component.baselineSelected).toBeTrue();
      expect(component.tabSelect).toBe('graph');
      expect(component.smallScreenTab).toBe('baseline');
    });
  });

  describe('reactive observers', () => {
    it('recalculates and reselects the baseline when the baseline data changes', () => {
      setup();
      component.baselineSelected = false;
      serviceMock.calculate.calls.reset();
      serviceMock.baselineData.next(makeInput());
      expect(component.baselineSelected).toBeTrue();
      expect(serviceMock.calculate).toHaveBeenCalledOnceWith(GLOBAL_SETTINGS);
    });

    it('recalculates when the modification data changes', () => {
      setup();
      serviceMock.calculate.calls.reset();
      serviceMock.modificationData.next(makeInput());
      expect(serviceMock.calculate).toHaveBeenCalledOnceWith(GLOBAL_SETTINGS);
    });

    it('keeps the latest output', () => {
      setup();
      const output = makeOutput();
      serviceMock.output.next(output);
      expect(component.output).toBe(output);
    });

    it('ignores an empty output', () => {
      setup();
      const output = makeOutput();
      serviceMock.output.next(output);
      serviceMock.output.next(undefined);
      expect(component.output).toBe(output);
    });
  });

  describe('user actions', () => {
    it('creates a modification, selects it, and recalculates', () => {
      setup();
      serviceMock.calculate.calls.reset();
      component.createModification();
      expect(serviceMock.initModification).toHaveBeenCalled();
      expect(component.modificationExists).toBeTrue();
      expect(component.baselineSelected).toBeFalse();
      expect(serviceMock.calculate).toHaveBeenCalledOnceWith(GLOBAL_SETTINGS);
    });

    it('resets the data and removes the modification', () => {
      setup();
      component.createModification();
      component.btnResetData();
      expect(component.modificationExists).toBeFalse();
      expect(serviceMock.initDefaultEmptyInputs).toHaveBeenCalled();
      expect(serviceMock.resetData.getValue()).toBeTrue();
    });

    it('generates example data with a modification and selects the baseline', () => {
      setup();
      component.baselineSelected = false;
      component.btnGenerateExample();
      expect(component.modificationExists).toBeTrue();
      expect(serviceMock.generateExampleData).toHaveBeenCalledWith(GLOBAL_SETTINGS);
      expect(component.baselineSelected).toBeTrue();
    });

    it('resets the output when the fuel type changes', () => {
      setup();
      component.changeFuelType();
      expect(serviceMock.initDefaultEmptyOutput).toHaveBeenCalled();
    });

    it('selects the help tab', () => {
      setup();
      component.setTab('help');
      expect(component.tabSelect).toBe('help');
    });

    it('selects the modification from the small-screen modification tab', () => {
      setup();
      component.setSmallScreenTab('modification');
      expect(component.smallScreenTab).toBe('modification');
      expect(component.baselineSelected).toBeFalse();
    });

    it('selects the baseline from the small-screen baseline tab', () => {
      setup();
      component.baselineSelected = false;
      component.setSmallScreenTab('baseline');
      expect(component.baselineSelected).toBeTrue();
    });

    it('keeps the selection on the small-screen details tab', () => {
      setup();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
      expect(component.baselineSelected).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('shows the treasure hunt actions in a treasure hunt', () => {
      setup({ inTreasureHunt: true });
      expect(query('.treasure-hunt-help')).not.toBeNull();
      expect(query('.fa-save')).not.toBeNull();
    });

    it('hides the treasure hunt actions outside a treasure hunt', () => {
      setup({ inTreasureHunt: false });
      expect(query('.treasure-hunt-help')).toBeNull();
      expect(query('.fa-save')).toBeNull();
    });

    it('shows the add-modification prompt and only the baseline form without a modification', () => {
      setup();
      expect(query('.no-data')).not.toBeNull();
      expect(count('app-state-point-analysis-form')).toBe(1);
    });

    it('shows the modification form and hides the prompt once a modification exists', () => {
      setup();
      component.createModification();
      fixture.detectChanges();
      expect(query('.no-data')).toBeNull();
      expect(count('app-state-point-analysis-form')).toBe(2);
      expect(query('.modification app-state-point-analysis-form')).not.toBeNull();
    });

    it('shows the graph and hides the help on the graph tab', () => {
      setup();
      expect(query('app-state-point-analysis-graph')).not.toBeNull();
      expect(query('app-state-point-analysis-help')).toBeNull();
    });

    it('shows the help and hides the graph on the help tab', () => {
      setup();
      component.setTab('help');
      fixture.detectChanges();
      expect(query('app-state-point-analysis-help')).not.toBeNull();
      expect(query('app-state-point-analysis-graph')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops recalculating and tracking output after destroy', () => {
      setup();
      const output = component.output;
      serviceMock.calculate.calls.reset();
      fixture.destroy();
      serviceMock.baselineData.next(makeInput());
      serviceMock.modificationData.next(makeInput());
      serviceMock.output.next(makeOutput());
      expect(serviceMock.calculate).not.toHaveBeenCalled();
      expect(component.output).toBe(output);
    });
  });
});
