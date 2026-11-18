import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerBasinResultsComponent } from './cooling-tower-basin-results.component';
import { CoolingTowerBasinService } from '../cooling-tower-basin.service';
import {
  CoolingTowerBasinOutput, CoolingTowerBasinResult, WeatherBinnedChartData, WeatherBinnedResult,
} from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const DASH = '— —';

function makeResult(overrides: Partial<CoolingTowerBasinResult> = {}): CoolingTowerBasinResult {
  return {
    baselinePower: 12.345,
    baselineEnergy: 1000,
    modPower: 6.5,
    modEnergy: 500,
    savingsEnergy: 500,
    baselineEnergyCost: 100,
    modEnergyCost: 50,
    annualCostSaving: 50,
    ...overrides,
  };
}

function makeEmptyResult(): CoolingTowerBasinResult {
  return {
    baselinePower: 0, baselineEnergy: 0, modPower: 0, modEnergy: 0, savingsEnergy: 0,
    baselineEnergyCost: 0, modEnergyCost: 0, annualCostSaving: 0,
  };
}

function makeBin(caseName: string, operatingHours: number, results: CoolingTowerBasinResult = makeResult()): WeatherBinnedResult {
  return { caseName, operatingHours, results };
}

const CHART_DATA = { barChartDataArray: [], yValueUnit: 'kWh', yAxisLabel: 'Energy', parameterUnit: 'F' } as WeatherBinnedChartData;

function makeWeatherOutput(overrides: Partial<CoolingTowerBasinOutput> = {}): CoolingTowerBasinOutput {
  return {
    results: makeResult(),
    totalResults: makeResult({ baselineEnergy: 2000, savingsEnergy: 750 }),
    weatherBinnedResults: [makeBin('Bin A', 100), makeBin('Bin B', 200, makeResult({ baselinePower: 3 }))],
    weatherBinnedChartData: CHART_DATA,
    ...overrides,
  };
}

describe('CoolingTowerBasinResultsComponent', () => {
  let component: CoolingTowerBasinResultsComponent;
  let fixture: ComponentFixture<CoolingTowerBasinResultsComponent>;
  let serviceStub: Partial<CoolingTowerBasinService>;
  let output: BehaviorSubject<CoolingTowerBasinOutput>;
  let isShowingWeatherResults: BehaviorSubject<boolean>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getTables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  function getGroupLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label.group-label'))
      .map((label: HTMLElement) => label.textContent.trim());
  }

  function getValueCells(row: HTMLTableRowElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).slice(1).map((cell: HTMLElement) => cell.textContent.trim());
  }

  function getRowValues(table: HTMLTableElement, label: string): Array<string> {
    const row = Array.from(table.querySelectorAll('tr'))
      .find((tr: HTMLTableRowElement) => tr.querySelector('td').textContent.trim() === label) as HTMLTableRowElement;
    return getValueCells(row);
  }

  function createComponent(inputs: { inTreasureHunt?: boolean, showWeather?: boolean, output?: CoolingTowerBasinOutput } = {}): void {
    output.next(inputs.output ?? { results: makeResult() });
    isShowingWeatherResults.next(inputs.showWeather);
    fixture = TestBed.createComponent(CoolingTowerBasinResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    output = new BehaviorSubject<CoolingTowerBasinOutput>(undefined);
    isShowingWeatherResults = new BehaviorSubject<boolean>(undefined);
    serviceStub = {
      coolingTowerBasinOutput: output,
      isShowingWeatherResults,
      selectedWeatherBinResult: undefined,
    };

    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [CoolingTowerBasinResultsComponent],
      providers: [{ provide: CoolingTowerBasinService, useValue: serviceStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('calculated results block', () => {
    it('renders baseline, modification and savings tables with the export table', () => {
      createComponent();
      expect(getGroupLabels()).toEqual(['Baseline', 'Modification', 'Savings']);
      expect(getTables().length).toBe(3);
      expect(query('app-exportable-results-table')).not.toBeNull();
      expect(query('app-cooling-weather-chart')).toBeNull();
    });

    it('renders formatted values when results are non-zero', () => {
      createComponent();
      const [baseline, modification, savings] = getTables();
      expect(getRowValues(baseline, 'Power Consumption')[0].replace(/\s+/g, ' ')).toBe('12.35 kW');
      expect(getRowValues(baseline, 'Energy Consumption')).toEqual(['1,000 kWh']);
      expect(getRowValues(baseline, 'Energy Cost')).toEqual(['$100']);
      expect(getRowValues(modification, 'Power Consumption')[0]).toContain('6.5');
      expect(getRowValues(modification, 'Power Consumption')[0]).toContain('kW');
      expect(getRowValues(modification, 'Energy Consumption')).toEqual(['500 kWh']);
      expect(getRowValues(modification, 'Energy Cost')).toEqual(['$50']);
      expect(getRowValues(savings, 'Annual Energy Savings')).toEqual(['500 kWh']);
      expect(getRowValues(savings, 'Annual Energy Cost Savings')).toEqual(['$50']);
    });

    it('renders dashes for every zero result', () => {
      createComponent({ output: { results: makeEmptyResult() } });
      const cells = getTables().flatMap((table: HTMLTableElement) =>
        Array.from(table.querySelectorAll('tr')).flatMap((row: HTMLTableRowElement) => getValueCells(row)));
      expect(cells.length).toBe(8);
      cells.forEach(cell => expect(cell).toBe(DASH));
    });

    it('is hidden when weather results are showing', () => {
      createComponent({ showWeather: true });
      expect(getTables().length).toBe(0);
      expect(query('app-exportable-results-table')).toBeNull();
    });

    it('is hidden in a treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      expect(getTables().length).toBe(0);
    });

    it('is hidden without results', () => {
      createComponent({ output: { results: undefined } });
      expect(getTables().length).toBe(0);
      expect(getGroupLabels()).toEqual([]);
    });

    it('builds the copy string from all three tables', () => {
      createComponent();
      component.updateTable0String();
      expect(component.table0String).toContain('Power Consumption');
      expect(component.table0String).toContain('Annual Energy Cost Savings');
    });
  });

  describe('weather binned results block', () => {
    it('renders chart, total results, bin selector and bin tables when weather results are showing', () => {
      createComponent({ showWeather: true, output: makeWeatherOutput() });
      expect(query('app-cooling-weather-chart')).not.toBeNull();
      expect(getGroupLabels()).toEqual(['Total Annual Results', 'Baseline', 'Modification', 'Bin Savings']);
      expect(getTables().length).toBe(4);
      expect(query('select#selectedWeatherBinResult')).not.toBeNull();
    });

    it('renders in a treasure hunt even when weather results are not toggled on', () => {
      createComponent({ inTreasureHunt: true, output: makeWeatherOutput() });
      expect(query('app-cooling-weather-chart')).not.toBeNull();
      expect(getTables().length).toBe(4);
    });

    it('is hidden without chart data', () => {
      createComponent({ showWeather: true, output: makeWeatherOutput({ weatherBinnedChartData: undefined }) });
      expect(query('app-cooling-weather-chart')).toBeNull();
      expect(getTables().length).toBe(0);
    });

    it('is hidden when neither weather results nor treasure hunt are active', () => {
      createComponent({ showWeather: false, output: makeWeatherOutput() });
      expect(query('app-cooling-weather-chart')).toBeNull();
      expect(getGroupLabels()).toEqual(['Baseline', 'Modification', 'Savings']);
    });

    it('hides the total results table without total results', () => {
      createComponent({ showWeather: true, output: makeWeatherOutput({ totalResults: undefined }) });
      expect(getGroupLabels()[0]).toBe('Total Annual Results');
      expect(getTables().length).toBe(3);
    });

    it('renders total result values and dashes', () => {
      createComponent({
        showWeather: true,
        output: makeWeatherOutput({ totalResults: makeResult({ modEnergy: 0, annualCostSaving: 0 }) }),
      });
      const total = getTables()[0];
      expect(getRowValues(total, 'Baseline Energy Consumption')).toEqual(['1,000 kWh']);
      expect(getRowValues(total, 'Baseline Energy Cost')).toEqual(['$100']);
      expect(getRowValues(total, 'Modification Energy Consumption')).toEqual([DASH]);
      expect(getRowValues(total, 'Modification Energy Cost')).toEqual(['$50']);
      expect(getRowValues(total, 'Annual Energy Savings')).toEqual(['500 kWh']);
      expect(getRowValues(total, 'Annual Energy Cost Savings')).toEqual([DASH]);
    });

    it('hides the bin selector and bin tables without weather binned results', () => {
      createComponent({ showWeather: true, output: makeWeatherOutput({ weatherBinnedResults: [] }) });
      expect(query('select#selectedWeatherBinResult')).toBeNull();
      expect(getGroupLabels()).toEqual(['Total Annual Results']);
      expect(getTables().length).toBe(1);
    });
  });

  describe('weather bin selection', () => {
    function getOptions(): Array<HTMLOptionElement> {
      return Array.from(fixture.nativeElement.querySelectorAll('select#selectedWeatherBinResult option'));
    }

    it('renders one option per bin in order', () => {
      createComponent({ showWeather: true, output: makeWeatherOutput() });
      expect(getOptions().map(option => option.textContent)).toEqual(['Bin A', 'Bin B']);
    });

    it('selects the first bin by default and shows its header', () => {
      createComponent({ showWeather: true, output: makeWeatherOutput() });
      expect(component.selectedWeatherBinResult.caseName).toBe('Bin A');
      expect(query('.header.bold').textContent.trim()).toBe('Bin A - 100 hrs');
    });

    it('uses the bin previously selected on the service', () => {
      const weatherOutput = makeWeatherOutput();
      serviceStub.selectedWeatherBinResult = weatherOutput.weatherBinnedResults[1];
      createComponent({ showWeather: true, output: weatherOutput });
      expect(query('.header.bold').textContent.trim()).toBe('Bin B - 200 hrs');
    });

    it('stores the selected bin on the service', () => {
      const weatherOutput = makeWeatherOutput();
      createComponent({ showWeather: true, output: weatherOutput });
      component.selectedWeatherBinResult = weatherOutput.weatherBinnedResults[1];
      component.setSelectedWeatherResult();
      expect(serviceStub.selectedWeatherBinResult).toBe(weatherOutput.weatherBinnedResults[1]);
    });

    it('renders the selected bin values and dashes', () => {
      createComponent({
        showWeather: true,
        output: makeWeatherOutput({
          weatherBinnedResults: [makeBin('Bin A', 100, makeResult({ baselineEnergy: 0, modPower: 0, savingsEnergy: 0 }))],
        }),
      });
      const [, baseline, modification, savings] = getTables();
      expect(getRowValues(baseline, 'Power Consumption')[0]).toContain('12.35');
      expect(getRowValues(baseline, 'Energy Consumption')).toEqual([DASH]);
      expect(getRowValues(modification, 'Power Consumption')).toEqual([DASH]);
      expect(getRowValues(modification, 'Energy Consumption')).toEqual(['500 kWh']);
      expect(getRowValues(savings, 'Annual Energy Savings')).toEqual([DASH]);
    });

    it('renders the selected bin values when all are non-zero', () => {
      createComponent({ showWeather: true, output: makeWeatherOutput() });
      const [, baseline, modification, savings] = getTables();
      expect(getRowValues(baseline, 'Energy Consumption')).toEqual(['1,000 kWh']);
      expect(getRowValues(modification, 'Power Consumption')[0]).toContain('6.5');
      expect(getRowValues(savings, 'Annual Energy Savings')).toEqual(['500 kWh']);
    });

    it('renders dashes in every bin cell when the bin results are empty', () => {
      createComponent({
        showWeather: true,
        output: makeWeatherOutput({ weatherBinnedResults: [makeBin('Bin A', 100, makeEmptyResult())] }),
      });
      const binCells = getTables().slice(1).flatMap((table: HTMLTableElement) =>
        Array.from(table.querySelectorAll('tr')).flatMap((row: HTMLTableRowElement) => getValueCells(row)));
      expect(binCells.length).toBe(5);
      binCells.forEach(cell => expect(cell).toBe(DASH));
    });
  });

  describe('observers', () => {
    it('switches from calculated to weather results when the service toggles', () => {
      createComponent({ output: makeWeatherOutput() });
      expect(query('app-cooling-weather-chart')).toBeNull();
      isShowingWeatherResults.next(true);
      fixture.detectChanges();
      expect(query('app-cooling-weather-chart')).not.toBeNull();
      expect(getGroupLabels()).toEqual(['Total Annual Results', 'Baseline', 'Modification', 'Bin Savings']);
    });

    it('re-renders when a new output arrives', () => {
      createComponent();
      output.next({ results: makeResult({ baselineEnergy: 4321 }) });
      fixture.detectChanges();
      expect(getRowValues(getTables()[0], 'Energy Consumption')).toEqual(['4,321 kWh']);
    });
  });

  describe('destroy', () => {
    it('unsubscribes from the service subjects', () => {
      createComponent();
      fixture.destroy();
      expect(output.observed).toBeFalse();
      expect(isShowingWeatherResults.observed).toBeFalse();
    });
  });
});
