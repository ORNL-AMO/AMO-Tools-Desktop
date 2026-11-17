import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanPsychrometricComponent } from './fan-psychrometric.component';
import { FanPsychrometricService } from './fan-psychrometric.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SettingsService } from '../../../settings/settings.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { BaseGasDensity, PsychrometricResults } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { TraceData } from '../../../shared/models/plotting';

const GLOBAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const INPUT_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;
const FAN_SETTINGS = { unitsOfMeasure: 'Imperial', fanTemperatureMeasurement: 'F' } as Settings;

function makeInputData(overrides: Partial<BaseGasDensity> = {}): BaseGasDensity {
  return { dryBulbTemp: 100, barometricPressure: 29.92, inputType: 'wetBulb', ...overrides } as BaseGasDensity;
}

function makeResults(overrides: Partial<PsychrometricResults> = {}): PsychrometricResults {
  return { humidityRatio: 0.03, relativeHumidity: 70, ...overrides } as PsychrometricResults;
}

const TABS: Array<{ tab: string, selector: string }> = [
  { tab: 'results', selector: 'app-fan-psychrometric-results' },
  { tab: 'chart', selector: 'app-fan-psychrometric-chart' },
  { tab: 'help', selector: 'app-fan-psychrometric-help' },
];

describe('FanPsychrometricComponent', () => {
  let component: FanPsychrometricComponent;
  let fixture: ComponentFixture<FanPsychrometricComponent>;
  let fanPsychrometricServiceSpy: jasmine.SpyObj<FanPsychrometricService>;
  let settingsServiceSpy: jasmine.SpyObj<SettingsService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;
  let settingsDbService: Partial<SettingsDbService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getPanelTabLinks(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'));
  }

  function createComponent(settings?: Settings): void {
    fixture = TestBed.createComponent(FanPsychrometricComponent);
    component = fixture.componentInstance;
    if (settings !== undefined) {
      fixture.componentRef.setInput('settings', settings);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    fanPsychrometricServiceSpy = jasmine.createSpyObj(
      'FanPsychrometricService',
      ['getDefaultData', 'getExampleData', 'calculateBaseGasDensity'],
      {
        baseGasDensityData: new BehaviorSubject<BaseGasDensity>(undefined),
        resetData: new BehaviorSubject<boolean>(undefined),
        generateExample: new BehaviorSubject<boolean>(undefined),
        calculatedBaseGasDensity: new BehaviorSubject<PsychrometricResults>(undefined),
        selectedDataPoints: new BehaviorSubject<Array<TraceData>>([]),
        disabledChartTab: new BehaviorSubject<boolean>(true),
      }
    );
    fanPsychrometricServiceSpy.getDefaultData.and.callFake(() => makeInputData({ dryBulbTemp: undefined }));
    fanPsychrometricServiceSpy.getExampleData.and.callFake(() => makeInputData({ dryBulbTemp: 123 }));
    settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['setFanUnits']);
    settingsServiceSpy.setFanUnits.and.returnValue(FAN_SETTINGS);
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    settingsDbService = { globalSettings: { ...GLOBAL_SETTINGS } as Settings };

    await TestBed.configureTestingModule({
      declarations: [FanPsychrometricComponent],
      providers: [
        { provide: FanPsychrometricService, useValue: fanPsychrometricServiceSpy },
        { provide: SettingsDbService, useValue: settingsDbService },
        { provide: SettingsService, useValue: settingsServiceSpy },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PC-psychrometric');
    });

    it('applies fan units to the global settings when no settings input is given', () => {
      createComponent();
      expect(settingsServiceSpy.setFanUnits).toHaveBeenCalledWith(settingsDbService.globalSettings);
      expect(component.settings).toBe(FAN_SETTINGS);
    });

    it('applies fan units to the settings input when given', () => {
      createComponent(INPUT_SETTINGS);
      expect(settingsServiceSpy.setFanUnits).toHaveBeenCalledWith(INPUT_SETTINGS);
    });

    it('pushes the default data to the service and calculates', () => {
      createComponent();
      expect(fanPsychrometricServiceSpy.getDefaultData).toHaveBeenCalledWith(FAN_SETTINGS);
      expect(fanPsychrometricServiceSpy.baseGasDensityData.getValue()).toEqual(makeInputData({ dryBulbTemp: undefined }));
      expect(fanPsychrometricServiceSpy.calculateBaseGasDensity).toHaveBeenCalledWith(FAN_SETTINGS);
    });

    it('defaults to the results tab', () => {
      createComponent();
      expect(component.tabSelect).toBe('results');
    });

    it('uses the default panel tab from global settings', () => {
      settingsDbService.globalSettings.defaultPanelTab = 'help';
      createComponent();
      expect(component.tabSelect).toBe('help');
    });

    it('follows the chart tab disabled state from the service', () => {
      createComponent();
      expect(component.disabledChartTab).toBeTrue();
      fanPsychrometricServiceSpy.disabledChartTab.next(false);
      expect(component.disabledChartTab).toBeFalse();
    });

    it('follows the selected data points from the service', () => {
      createComponent();
      const points = [{ x: [1], y: [2] } as TraceData];
      fanPsychrometricServiceSpy.selectedDataPoints.next(points);
      expect(component.selectedDataPoints).toBe(points);
    });
  });

  describe('settings visibility', () => {
    it('renders the calculator when settings exist', () => {
      createComponent();
      expect(query('.calculator-container')).not.toBeNull();
      expect(query('app-fan-psychrometric-form')).not.toBeNull();
    });

    it('renders nothing when no settings are resolved', () => {
      settingsServiceSpy.setFanUnits.and.returnValue(undefined);
      createComponent();
      expect(query('.calculator-container')).toBeNull();
      expect(query('app-fan-psychrometric-form')).toBeNull();
    });
  });

  describe('panel tabs', () => {
    TABS.forEach(testCase => {
      it(`shows only the ${testCase.tab} panel when the ${testCase.tab} tab is selected`, () => {
        createComponent();
        component.setTab(testCase.tab);
        fixture.detectChanges();
        TABS.forEach(other => {
          const element = query(other.selector);
          if (other.tab === testCase.tab) {
            expect(element).withContext(other.selector).not.toBeNull();
          } else {
            expect(element).withContext(other.selector).toBeNull();
          }
        });
      });
    });

    it('shows no panel for an unknown tab', () => {
      createComponent();
      component.setTab('other');
      fixture.detectChanges();
      TABS.forEach(tab => expect(query(tab.selector)).withContext(tab.selector).toBeNull());
    });

    it('switches panels from the tab links', () => {
      createComponent();
      const links = getPanelTabLinks();
      expect(links.map(link => link.textContent.trim())).toEqual(['Results', 'Chart', 'Help']);
      links[1].click();
      fixture.detectChanges();
      expect(query('app-fan-psychrometric-chart')).not.toBeNull();
      expect(query('app-fan-psychrometric-results')).toBeNull();
      links[2].click();
      fixture.detectChanges();
      expect(query('app-fan-psychrometric-help')).not.toBeNull();
      expect(query('app-fan-psychrometric-chart')).toBeNull();
    });

    it('switches the small screen tab', () => {
      createComponent();
      component.setSmallScreenTab('details');
      expect(component.smallScreenTab).toBe('details');
    });
  });

  describe('calculated results', () => {
    it('copies barometric pressure and dry bulb temp from the input data', () => {
      createComponent();
      fanPsychrometricServiceSpy.baseGasDensityData.next(makeInputData({ dryBulbTemp: 77, barometricPressure: 28 }));
      const results = makeResults();
      fanPsychrometricServiceSpy.calculatedBaseGasDensity.next(results);
      expect(component.psychrometricResults).toBe(results);
      expect(results.dryBulbTemp).toBe(77);
      expect(results.barometricPressure).toBe(28);
    });

    it('keeps the previous results when an empty result arrives', () => {
      createComponent();
      const results = makeResults();
      fanPsychrometricServiceSpy.calculatedBaseGasDensity.next(results);
      fanPsychrometricServiceSpy.calculatedBaseGasDensity.next(undefined);
      expect(component.psychrometricResults).toBe(results);
    });

    it('recalculates whenever the input data changes', () => {
      createComponent();
      fanPsychrometricServiceSpy.calculateBaseGasDensity.calls.reset();
      fanPsychrometricServiceSpy.baseGasDensityData.next(makeInputData());
      expect(fanPsychrometricServiceSpy.calculateBaseGasDensity).toHaveBeenCalledTimes(1);
    });
  });

  describe('user actions', () => {
    it('Generate Example pushes the example data and returns to results', () => {
      createComponent();
      component.setTab('help');
      (query('.btn-primary.btn-form') as HTMLElement).click();
      fixture.detectChanges();
      expect(fanPsychrometricServiceSpy.getExampleData).toHaveBeenCalledWith(FAN_SETTINGS);
      expect(fanPsychrometricServiceSpy.baseGasDensityData.getValue().dryBulbTemp).toBe(123);
      expect(fanPsychrometricServiceSpy.generateExample.getValue()).toBeTrue();
      expect(fanPsychrometricServiceSpy.disabledChartTab.getValue()).toBeFalse();
      expect(component.tabSelect).toBe('results');
      expect(query('app-fan-psychrometric-results')).not.toBeNull();
    });

    it('Reset Data restores defaults, clears results, and disables the chart tab', () => {
      createComponent();
      fanPsychrometricServiceSpy.calculatedBaseGasDensity.next(makeResults());
      component.resultData = [makeResults()];
      component.setTab('chart');
      fanPsychrometricServiceSpy.disabledChartTab.next(false);

      (query('.btn-danger.btn-form') as HTMLElement).click();
      fixture.detectChanges();

      expect(fanPsychrometricServiceSpy.resetData.getValue()).toBeTrue();
      expect(fanPsychrometricServiceSpy.baseGasDensityData.getValue()).toEqual(makeInputData({ dryBulbTemp: undefined }));
      expect(component.resultData).toEqual([]);
      expect(component.psychrometricResults).toBeUndefined();
      expect(component.selectedDataPoints).toEqual([]);
      expect(component.disabledChartTab).toBeTrue();
      expect(component.tabSelect).toBe('results');
    });
  });

  describe('destroy', () => {
    it('stops recalculating after destroy', fakeAsync(() => {
      createComponent();
      flush();
      const savedRows = [makeResults()];
      component.resultData = savedRows;
      fixture.destroy();
      fanPsychrometricServiceSpy.calculateBaseGasDensity.calls.reset();
      fanPsychrometricServiceSpy.baseGasDensityData.next(makeInputData());
      fanPsychrometricServiceSpy.resetData.next(true);
      expect(fanPsychrometricServiceSpy.calculateBaseGasDensity).not.toHaveBeenCalled();
      expect(component.resultData).toBe(savedRows);
    }));
  });
});
