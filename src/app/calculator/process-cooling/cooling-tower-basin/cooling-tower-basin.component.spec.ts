import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerBasinComponent } from './cooling-tower-basin.component';
import { CoolingTowerBasinService } from './cooling-tower-basin.service';
import { WeatherBinsInput, WeatherBinsService, WeatherDataSourceView } from '../../utilities/weather-bins/weather-bins.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { AnalyticsService } from '../../../shared/analytics/analytics.service';
import { CoolingTowerBasinInput } from '../../../shared/models/chillers';
import { Settings } from '../../../shared/models/settings';
import { Treasure } from '../../../shared/models/treasure-hunt';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeInput(overrides: Partial<CoolingTowerBasinInput> = {}): CoolingTowerBasinInput {
  return {
    ratedCapacity: 1000, ratedTempSetPoint: 40, ratedTempDryBulb: 0, ratedWindSpeed: 15, panLossRatio: 0.011,
    operatingTempDryBulb: 28, operatingWindSpeed: 10, operatingHours: 1000, baselineTempSetPoint: 40,
    modTempSetPoint: 35, electricityCost: 0.066,
    ...overrides,
  };
}

function makeWeatherData(totalDataPoints: number, binParameterCount: number = 0): WeatherBinsInput {
  return {
    totalDataPoints,
    binParameters: Array.from({ length: binParameterCount }, () => ({})),
  } as unknown as WeatherBinsInput;
}

const WEATHER_RESULT_CASES: Array<{ name: string, data: WeatherBinsInput, alert: boolean, bar: boolean, heat: boolean, table: boolean }> = [
  { name: 'no data points', data: makeWeatherData(0), alert: true, bar: false, heat: false, table: false },
  { name: 'data with no bin parameters', data: makeWeatherData(10, 0), alert: false, bar: false, heat: false, table: true },
  { name: 'data with one bin parameter', data: makeWeatherData(10, 1), alert: false, bar: true, heat: false, table: true },
  { name: 'data with two bin parameters', data: makeWeatherData(10, 2), alert: false, bar: false, heat: true, table: true },
];

describe('CoolingTowerBasinComponent', () => {
  let component: CoolingTowerBasinComponent;
  let fixture: ComponentFixture<CoolingTowerBasinComponent>;
  let serviceSpy: jasmine.SpyObj<CoolingTowerBasinService>;
  let weatherStub: Partial<WeatherBinsService>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getHeaderTabs(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.header .clickable-tab'));
  }

  function getSmallTabLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.small-tab-select a.nav-link'))
      .map((link: HTMLElement) => link.textContent.trim());
  }

  function getPanelTabLink(label: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('.panel-tab-item a'))
      .find((link: HTMLElement) => link.textContent.trim() === label) as HTMLElement;
  }

  function getButton(label: string): HTMLButtonElement | undefined {
    return Array.from(fixture.nativeElement.querySelectorAll('button'))
      .find((button: HTMLButtonElement) => button.textContent.trim() === label) as HTMLButtonElement;
  }

  function getHelpPanel(): HTMLElement {
    return query('.help-panel');
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, settings?: Settings } = {}): void {
    fixture = TestBed.createComponent(CoolingTowerBasinComponent);
    component = fixture.componentInstance;
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    if (inputs.settings !== undefined) {
      fixture.componentRef.setInput('settings', inputs.settings);
    }
    fixture.detectChanges();
  }

  function showWeatherTab(): void {
    getHeaderTabs()[1].click();
    fixture.detectChanges();
  }

  function selectPanelTab(label: string): void {
    getPanelTabLink(label).click();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('CoolingTowerBasinService', [
      'initDefaultEmptyInputs', 'initDefaultEmptyOutputs', 'setHasWeatherBinsData', 'setAsWeatherIntegratedCalculator',
      'resetWeatherIntegratedCalculator', 'calculate', 'generateExampleData',
    ]);
    serviceSpy.coolingTowerBasinInput = new BehaviorSubject<CoolingTowerBasinInput>(undefined);
    serviceSpy.hasWeatherBinsData = new BehaviorSubject<boolean>(false);
    serviceSpy.isShowingWeatherResults = new BehaviorSubject<boolean>(false);
    serviceSpy.resetData = new BehaviorSubject<boolean>(undefined);
    serviceSpy.generateExample = new BehaviorSubject<boolean>(undefined);

    weatherStub = {
      inputData: new BehaviorSubject<WeatherBinsInput>(makeWeatherData(0)),
      weatherDataSourceView: new BehaviorSubject<WeatherDataSourceView>('lookup'),
    };
    analyticsServiceSpy = jasmine.createSpyObj('AnalyticsService', ['sendEvent']);
    const settingsDbStub: Partial<SettingsDbService> = { globalSettings: MOCK_SETTINGS };

    await TestBed.configureTestingModule({
      declarations: [CoolingTowerBasinComponent],
      providers: [
        { provide: CoolingTowerBasinService, useValue: serviceSpy },
        { provide: WeatherBinsService, useValue: weatherStub },
        { provide: SettingsDbService, useValue: settingsDbStub },
        { provide: AnalyticsService, useValue: analyticsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('sends the analytics event and uses global settings', () => {
      createComponent();
      expect(analyticsServiceSpy.sendEvent).toHaveBeenCalledWith('calculator-PC-cooling-tower-basin');
      expect(component.settings).toBe(MOCK_SETTINGS);
      expect(serviceSpy.setAsWeatherIntegratedCalculator).toHaveBeenCalled();
    });

    it('keeps provided settings', () => {
      const settings = { unitsOfMeasure: 'Metric' } as Settings;
      createComponent({ settings });
      expect(component.settings).toBe(settings);
    });

    it('initializes default inputs and outputs when the service has no input', () => {
      createComponent();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(serviceSpy.initDefaultEmptyOutputs).toHaveBeenCalled();
      expect(serviceSpy.setHasWeatherBinsData).not.toHaveBeenCalled();
    });

    it('keeps existing input and refreshes weather bin availability', () => {
      serviceSpy.coolingTowerBasinInput.next(makeInput());
      createComponent();
      expect(serviceSpy.initDefaultEmptyInputs).not.toHaveBeenCalled();
      expect(serviceSpy.setHasWeatherBinsData).toHaveBeenCalled();
    });

    it('reads the weather data source view', () => {
      weatherStub.weatherDataSourceView.next('file');
      createComponent();
      expect(component.weatherDataSourceView).toBe('file');
    });
  });

  describe('observers and calculation triggers', () => {
    it('calculates when an input is published', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      serviceSpy.coolingTowerBasinInput.next(makeInput());
      expect(serviceSpy.calculate).toHaveBeenCalledWith(MOCK_SETTINGS);
    });

    it('does not calculate when the input is cleared', () => {
      createComponent();
      serviceSpy.calculate.calls.reset();
      serviceSpy.coolingTowerBasinInput.next(undefined);
      expect(serviceSpy.calculate).not.toHaveBeenCalled();
    });

    it('turns weather results off and recalculates when weather data is empty', () => {
      createComponent();
      component.isShowingWeatherResults = true;
      serviceSpy.calculate.calls.reset();
      weatherStub.inputData.next(makeWeatherData(0));
      expect(component.isShowingWeatherResults).toBeFalse();
      expect(serviceSpy.isShowingWeatherResults.getValue()).toBeFalse();
      expect(serviceSpy.calculate).toHaveBeenCalled();
    });

    it('keeps weather results on when weather data has points', () => {
      createComponent();
      component.isShowingWeatherResults = true;
      weatherStub.inputData.next(makeWeatherData(10));
      expect(component.isShowingWeatherResults).toBeTrue();
    });

    it('turns weather results off when weather bins data becomes unavailable', () => {
      serviceSpy.hasWeatherBinsData.next(true);
      createComponent();
      component.isShowingWeatherResults = true;
      serviceSpy.hasWeatherBinsData.next(false);
      expect(component.isShowingWeatherResults).toBeFalse();
    });

    it('marks weather results as showing when calculating in a treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      serviceSpy.coolingTowerBasinInput.next(makeInput());
      expect(serviceSpy.isShowingWeatherResults.getValue()).toBeTrue();
    });
  });

  describe('treasure hunt actions', () => {
    it('hides save and cancel outside a treasure hunt', () => {
      createComponent();
      expect(query('.fa-save')).toBeNull();
      expect(query('.treasure-hunt-help')).toBeNull();
    });

    it('shows save and cancel in a treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      expect(query('.fa-save')).not.toBeNull();
      expect(query('.fa-times')).not.toBeNull();
      expect(query('.treasure-hunt-help')).not.toBeNull();
    });

    it('emits the treasure on save', () => {
      const input = makeInput();
      serviceSpy.coolingTowerBasinInput.next(input);
      createComponent({ inTreasureHunt: true });
      const saveSpy = spyOn(component.emitSave, 'emit');
      (query('.fa-save').parentElement as HTMLElement).click();
      expect(saveSpy).toHaveBeenCalledWith({
        coolingTowerBasinData: input,
        weatherData: weatherStub.inputData.getValue(),
        opportunityType: Treasure.coolingTowerBasin,
      });
    });

    it('emits cancel', () => {
      createComponent({ inTreasureHunt: true });
      const cancelSpy = spyOn(component.emitCancel, 'emit');
      (query('.fa-times').parentElement as HTMLElement).click();
      expect(cancelSpy).toHaveBeenCalledWith(true);
    });
  });

  describe('calculator / weather tab switching', () => {
    it('shows the calculator form by default', () => {
      createComponent();
      expect(getSmallTabLabels()).toEqual(['Cooling Tower Basin Data', 'Details']);
      expect(query('app-cooling-tower-basin-form')).not.toBeNull();
      expect(query('app-weather-station-lookup')).toBeNull();
      expect(query('app-bins-form')).toBeNull();
    });

    it('shows the weather forms when the weather tab is selected', () => {
      createComponent();
      showWeatherTab();
      expect(component.displayWeatherTab).toBeTrue();
      expect(getSmallTabLabels()).toEqual(['Weather Data', 'Details']);
      expect(query('app-cooling-tower-basin-form')).toBeNull();
      expect(query('app-weather-station-lookup')).not.toBeNull();
      expect(query('app-data-setup-form')).not.toBeNull();
      expect(query('app-bins-form')).not.toBeNull();
      expect(getButton('Reset Data')).toBeUndefined();
    });

    it('returns to the calculator form from the weather tab', () => {
      createComponent();
      showWeatherTab();
      getHeaderTabs()[0].click();
      fixture.detectChanges();
      expect(query('app-cooling-tower-basin-form')).not.toBeNull();
      expect(query('app-weather-station-lookup')).toBeNull();
    });

    it('sets the weather data source', () => {
      createComponent();
      showWeatherTab();
      getButton('Upload').click();
      expect(component.weatherDataSourceView).toBe('file');
      expect(weatherStub.weatherDataSourceView.getValue()).toBe('file');
    });
  });

  describe('form buttons', () => {
    it('resets data', () => {
      createComponent();
      serviceSpy.initDefaultEmptyInputs.calls.reset();
      getButton('Reset Data').click();
      expect(serviceSpy.initDefaultEmptyInputs).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(serviceSpy.resetData.getValue()).toBeTrue();
    });

    it('generates an example', () => {
      createComponent();
      getButton('Generate Example').click();
      expect(serviceSpy.generateExampleData).toHaveBeenCalledWith(MOCK_SETTINGS);
      expect(serviceSpy.generateExample.getValue()).toBeTrue();
    });
  });

  describe('calculator help panel', () => {
    it('shows results with the weather toggle by default', () => {
      createComponent();
      expect(getHelpPanel().querySelector('app-cooling-tower-basin-results')).not.toBeNull();
      expect(getButton('See calculated results')).toBeDefined();
      expect(getHelpPanel().querySelector('app-cooling-tower-basin-help')).toBeNull();
    });

    it('hides the weather toggle in a treasure hunt but keeps results', () => {
      createComponent({ inTreasureHunt: true });
      expect(getHelpPanel().querySelector('app-cooling-tower-basin-results')).not.toBeNull();
      expect(getButton('See calculated results')).toBeUndefined();
      expect(getButton('See weather binned results')).toBeUndefined();
    });

    it('disables the weather binned results button without weather bins data', () => {
      createComponent();
      expect(getButton('See weather binned results').disabled).toBeTrue();
    });

    it('enables the weather binned results button with weather bins data', () => {
      serviceSpy.hasWeatherBinsData.next(true);
      createComponent();
      expect(getButton('See weather binned results').disabled).toBeFalse();
    });

    it('toggles weather results and recalculates', () => {
      serviceSpy.hasWeatherBinsData.next(true);
      createComponent();
      serviceSpy.calculate.calls.reset();
      getButton('See weather binned results').click();
      expect(component.isShowingWeatherResults).toBeTrue();
      expect(serviceSpy.isShowingWeatherResults.getValue()).toBeTrue();
      expect(serviceSpy.calculate).toHaveBeenCalledWith(MOCK_SETTINGS);
      getButton('See calculated results').click();
      expect(component.isShowingWeatherResults).toBeFalse();
    });

    it('shows help instead of results on the help tab', () => {
      createComponent();
      selectPanelTab('Help');
      expect(getHelpPanel().querySelector('app-cooling-tower-basin-help')).not.toBeNull();
      expect(getHelpPanel().querySelector('app-cooling-tower-basin-results')).toBeNull();
      expect(getButton('See calculated results')).toBeUndefined();
    });

    it('does not show weather help or charts on the calculator tab', () => {
      createComponent();
      expect(getHelpPanel().querySelector('app-weather-bins-help')).toBeNull();
      expect(getHelpPanel().querySelector('.alert-warning')).toBeNull();
    });
  });

  describe('weather help panel', () => {
    it('hides calculator results and help', () => {
      createComponent();
      showWeatherTab();
      expect(getHelpPanel().querySelector('app-cooling-tower-basin-results')).toBeNull();
      expect(getHelpPanel().querySelector('app-cooling-tower-basin-help')).toBeNull();
    });

    it('shows weather help on the help tab', () => {
      createComponent();
      showWeatherTab();
      selectPanelTab('Help');
      expect(getHelpPanel().querySelector('app-weather-bins-help')).not.toBeNull();
      expect(getHelpPanel().querySelector('.alert-warning')).toBeNull();
      expect(getHelpPanel().querySelector('app-weather-bins-table')).toBeNull();
    });

    WEATHER_RESULT_CASES.forEach(({ name, data, alert, bar, heat, table }) => {
      it(`renders results for ${name}`, () => {
        weatherStub.inputData.next(data);
        createComponent();
        showWeatherTab();
        const panel = getHelpPanel();
        expect(panel.querySelector('app-weather-bins-help')).toBeNull();
        expect(!!panel.querySelector('.alert-warning')).toBe(alert);
        expect(!!panel.querySelector('app-weather-bins-bar-chart')).toBe(bar);
        expect(!!panel.querySelector('app-weather-bins-heat-map')).toBe(heat);
        expect(!!panel.querySelector('app-weather-bins-table')).toBe(table);
      });
    });
  });

  describe('destroy', () => {
    it('keeps the input on the service outside a treasure hunt', () => {
      const input = makeInput();
      serviceSpy.coolingTowerBasinInput.next(input);
      createComponent();
      fixture.destroy();
      expect(serviceSpy.coolingTowerBasinInput.getValue()).toBe(input);
      expect(serviceSpy.resetWeatherIntegratedCalculator).toHaveBeenCalled();
    });

    it('clears the input on the service in a treasure hunt', () => {
      serviceSpy.coolingTowerBasinInput.next(makeInput());
      createComponent({ inTreasureHunt: true });
      fixture.destroy();
      expect(serviceSpy.coolingTowerBasinInput.getValue()).toBeUndefined();
    });

    it('unsubscribes from service and weather subjects', () => {
      createComponent();
      fixture.destroy();
      expect(serviceSpy.coolingTowerBasinInput.observed).toBeFalse();
      expect(serviceSpy.hasWeatherBinsData.observed).toBeFalse();
      expect(weatherStub.inputData.observed).toBeFalse();
    });
  });
});
