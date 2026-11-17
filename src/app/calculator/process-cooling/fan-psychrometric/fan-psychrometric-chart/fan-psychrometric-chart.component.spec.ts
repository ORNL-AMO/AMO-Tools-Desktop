import { ComponentFixture, TestBed, fakeAsync, flush, flushMicrotasks, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';
import { FanPsychrometricChartComponent } from './fan-psychrometric-chart.component';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { GasDensityFormService } from '../../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { TraceData } from '../../../../shared/models/plotting';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial', fanTemperatureMeasurement: 'F' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric', fanTemperatureMeasurement: 'C' } as Settings;

function makeInputData(overrides: Partial<BaseGasDensity> = {}): BaseGasDensity {
  return { dryBulbTemp: 100, barometricPressure: 29.92, inputType: 'wetBulb', wetBulbTemp: 90 , ...overrides } as BaseGasDensity;
}

function makeResults(overrides: Partial<PsychrometricResults> = {}): PsychrometricResults {
  return { humidityRatio: 0.03, relativeHumidity: 70, wetBulbTemp: 90, ...overrides } as PsychrometricResults;
}

function makePointTrace(x: number, y: number, color: string = 'red'): TraceData {
  return {
    x: [x],
    y: [y],
    name: '',
    type: 'scatter',
    mode: 'markers',
    line: { color: color },
  } as TraceData;
}

function makePlotlyChart() {
  return { on: jasmine.createSpy('on') };
}

describe('FanPsychrometricChartComponent', () => {
  let component: FanPsychrometricChartComponent;
  let fixture: ComponentFixture<FanPsychrometricChartComponent>;
  let plotlyServiceSpy: jasmine.SpyObj<PlotlyService>;
  let gasDensityFormServiceSpy: jasmine.SpyObj<GasDensityFormService>;
  let fanPsychrometricServiceSpy: jasmine.SpyObj<FanPsychrometricService>;
  let lastPlotlyChart: { on: jasmine.Spy };

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getSummaryRows(): Array<HTMLElement> {
    const summaryTable: HTMLElement = fixture.nativeElement.querySelectorAll('table')[0];
    return Array.from(summaryTable.querySelectorAll('tr:not(.no-border)'));
  }

  function getCopyRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.hidden-copy-table tr:not(.no-border)'));
  }

  function getCellTexts(row: HTMLElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => cell.textContent.trim());
  }

  function lastNewPlotArgs(): Array<any> {
    return plotlyServiceSpy.newPlot.calls.mostRecent().args as Array<any>;
  }

  function setFormValid(valid: boolean): void {
    gasDensityFormServiceSpy.getGasDensityFormFromObj.and.returnValue({ valid: valid } as UntypedFormGroup);
  }

  function createComponent(selectedDataPoints: Array<TraceData> = [], settings: Settings = IMPERIAL_SETTINGS): void {
    fixture = TestBed.createComponent(FanPsychrometricChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('gasDensityForm', new UntypedFormGroup({}));
    fixture.componentRef.setInput('selectedDataPoints', selectedDataPoints);
    fixture.detectChanges();
  }

  function renderInitialChart(): void {
    tick(100);
    flushMicrotasks();
  }

  beforeEach(async () => {
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot']);
    plotlyServiceSpy.newPlot.and.callFake(() => {
      lastPlotlyChart = makePlotlyChart();
      return Promise.resolve(lastPlotlyChart) as any;
    });
    gasDensityFormServiceSpy = jasmine.createSpyObj('GasDensityFormService', ['getGasDensityFormFromObj']);
    setFormValid(false);
    fanPsychrometricServiceSpy = jasmine.createSpyObj(
      'FanPsychrometricService',
      ['getDefaultData', 'calcDensityRelativeHumidity', 'calcDensityWetBulb'],
      {
        calculatedBaseGasDensity: new BehaviorSubject<PsychrometricResults>(makeResults()),
        baseGasDensityData: new BehaviorSubject<BaseGasDensity>(makeInputData()),
        selectedDataPoints: new BehaviorSubject<Array<TraceData>>([]),
      }
    );
    fanPsychrometricServiceSpy.getDefaultData.and.callFake(() => makeInputData());
    fanPsychrometricServiceSpy.calcDensityRelativeHumidity.and.callFake(() => makeResults({ humidityRatio: 0.02 }));
    fanPsychrometricServiceSpy.calcDensityWetBulb.and.callFake(() => makeResults({ humidityRatio: 0.01 }));

    await TestBed.configureTestingModule({
      declarations: [FanPsychrometricChartComponent],
      providers: [
        { provide: PlotlyService, useValue: plotlyServiceSpy },
        { provide: FanPsychrometricService, useValue: fanPsychrometricServiceSpy },
        { provide: GasDensityFormService, useValue: gasDensityFormServiceSpy },
        { provide: ConvertUnitsService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('reads the calculated results and input data from the service', fakeAsync(() => {
      createComponent();
      expect(component.psychrometricResults).toEqual(makeResults());
      expect(component.inputData).toEqual(makeInputData());
      flush();
    }));

    it('plots into the panel chart div after the initial resize', fakeAsync(() => {
      createComponent();
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
      renderInitialChart();
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(lastNewPlotArgs()[0]).toBe(component.panelChartDiv.nativeElement);
      flush();
    }));

    it('uses imperial units in the data summary headers', fakeAsync(() => {
      createComponent([], IMPERIAL_SETTINGS);
      const headers = Array.from(fixture.nativeElement.querySelectorAll('table')[0].querySelectorAll('th'))
        .map((th: HTMLElement) => th.textContent.trim());
      expect(headers).toEqual(['Key', 'Dry Bulb Temperature ℉', 'Humidity Ratio (lbv/lba)']);
      flush();
    }));

    it('uses metric units in the data summary headers', fakeAsync(() => {
      createComponent([], METRIC_SETTINGS);
      const headers = Array.from(fixture.nativeElement.querySelectorAll('table')[0].querySelectorAll('th'))
        .map((th: HTMLElement) => th.textContent.trim());
      expect(headers).toEqual(['Key', 'Dry Bulb Temperature ℃', 'Humidity Ratio (kgv/kga)']);
      flush();
    }));
  });

  describe('chart data', () => {
    it('passes only the selected points when the input form is invalid', fakeAsync(() => {
      const points = [makePointTrace(80, 0.01), makePointTrace(90, 0.02)];
      createComponent(points);
      renderInitialChart();
      const [, traceData] = lastNewPlotArgs();
      expect(traceData).toEqual(points);
      expect(fanPsychrometricServiceSpy.calcDensityRelativeHumidity).not.toHaveBeenCalled();
      flush();
    }));

    it('adds the user point when the form is valid and results exist', fakeAsync(() => {
      setFormValid(true);
      createComponent();
      renderInitialChart();
      const [, traceData] = lastNewPlotArgs();
      const userPoint = traceData.find((trace: TraceData) => trace.mode === 'markers' && trace.line.color === 'black');
      expect(userPoint.x).toEqual([100]);
      expect(userPoint.y).toEqual([0.03]);
      expect(traceData.some((trace: TraceData) => trace.name === 'Relative Humidity' && trace.line.color === 'blue')).toBeTrue();
      expect(traceData.some((trace: TraceData) => trace.name === 'Wet Bulb' && trace.line.color === 'red')).toBeTrue();
      flush();
    }));

    it('omits the user point when the input has no dry bulb temperature', fakeAsync(() => {
      setFormValid(true);
      fanPsychrometricServiceSpy.baseGasDensityData.next(makeInputData({ dryBulbTemp: undefined }));
      createComponent();
      renderInitialChart();
      const [, traceData] = lastNewPlotArgs();
      expect(traceData.some((trace: TraceData) => trace.mode === 'markers')).toBeFalse();
      expect(traceData.some((trace: TraceData) => trace.name === 'Relative Humidity')).toBeTrue();
      flush();
    }));

    it('re-plots when new results are calculated', fakeAsync(() => {
      createComponent();
      renderInitialChart();
      plotlyServiceSpy.newPlot.calls.reset();
      fanPsychrometricServiceSpy.calculatedBaseGasDensity.next(makeResults({ humidityRatio: 0.05 }));
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(component.psychrometricResults.humidityRatio).toBe(0.05);
      flush();
    }));
  });

  describe('data summary rows', () => {
    it('renders no point rows when nothing is selected', fakeAsync(() => {
      createComponent([]);
      expect(getSummaryRows().length).toBe(0);
      expect(getCopyRows().length).toBe(0);
      flush();
    }));

    it('renders one row per selected point in both tables', fakeAsync(() => {
      createComponent([makePointTrace(80, 0.011), makePointTrace(95, 0.025)]);
      const rows = getSummaryRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[0])).toEqual(['', '80', '0.011', 'Delete']);
      expect(getCellTexts(rows[1])).toEqual(['', '95', '0.025', 'Delete']);
      const copyRows = getCopyRows();
      expect(copyRows.length).toBe(2);
      expect(getCellTexts(copyRows[1])).toEqual(['95', '0.025']);
      flush();
    }));

    it('deletes the clicked point, re-plots, and saves to the service', fakeAsync(() => {
      const first = makePointTrace(80, 0.011);
      const second = makePointTrace(95, 0.025);
      const points = [first, second];
      createComponent(points);
      renderInitialChart();
      plotlyServiceSpy.newPlot.calls.reset();

      (getSummaryRows()[0].querySelector('.delete-row a') as HTMLElement).click();
      fixture.detectChanges();
      flushMicrotasks();

      expect(points).toEqual([second]);
      expect(getSummaryRows().length).toBe(1);
      expect(getCellTexts(getSummaryRows()[0])[1]).toBe('95');
      expect(getCopyRows().length).toBe(1);
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(fanPsychrometricServiceSpy.selectedDataPoints.getValue()).toBe(points);
      flush();
    }));

    it('adds a row for a clicked chart point and saves it', fakeAsync(() => {
      const points: Array<TraceData> = [];
      createComponent(points);
      renderInitialChart();
      const clickHandler = lastPlotlyChart.on.calls.mostRecent().args[1];
      expect(lastPlotlyChart.on.calls.mostRecent().args[0]).toBe('plotly_click');

      clickHandler({ points: [{ x: 70, y: 0.0123456, fullData: { name: 'Wet Bulb' } }] });
      fixture.detectChanges();
      flushMicrotasks();

      expect(points.length).toBe(1);
      expect(points[0].x).toEqual([70]);
      expect(points[0].y).toEqual([0.012]);
      expect(points[0].name).toBe('Wet Bulb');
      expect(getCellTexts(getSummaryRows()[0]).slice(1, 3)).toEqual(['70', '0.012']);
      expect(fanPsychrometricServiceSpy.selectedDataPoints.getValue()).toBe(points);
      flush();
    }));

    it('builds the copy string from the hidden table', fakeAsync(() => {
      createComponent([makePointTrace(80, 0.011)]);
      component.updateTableString();
      expect(component.dataSummaryTableString).toContain('80');
      expect(component.dataSummaryTableString).not.toContain('Delete');
      flush();
    }));
  });

  describe('expand and collapse', () => {
    function expand(): void {
      (query('.fa-expand') as HTMLElement).click();
      fixture.detectChanges();
      tick(200);
      flushMicrotasks();
    }

    it('shows the expand control and hides the expanded panel by default', fakeAsync(() => {
      createComponent();
      expect(query('.fa-expand')).not.toBeNull();
      expect(query('.tab-panel-background app-simple-tooltip')).not.toBeNull();
      expect(query('.fa-compress')).toBeNull();
      expect(query('.panel-chart-container app-simple-tooltip')).toBeNull();
      expect(query('.panel-chart-container .w-75')).toBeNull();
      flush();
    }));

    it('shows the collapse control and expanded panel when expanded', fakeAsync(() => {
      createComponent();
      renderInitialChart();
      expand();
      expect(component.expanded).toBeTrue();
      expect(query('.fa-compress')).not.toBeNull();
      expect(query('.panel-chart-container app-simple-tooltip')).not.toBeNull();
      expect(query('.panel-chart-container .w-75')).not.toBeNull();
      expect(query('.fa-expand')).toBeNull();
      expect(query('.tab-panel-background app-simple-tooltip')).toBeNull();
      flush();
    }));

    it('plots into the expanded chart div when expanded', fakeAsync(() => {
      createComponent();
      renderInitialChart();
      expand();
      expect(lastNewPlotArgs()[0]).toBe(component.expandedChartDiv.nativeElement);
      flush();
    }));

    it('collapses from the compress control', fakeAsync(() => {
      createComponent();
      renderInitialChart();
      expand();
      (query('.fa-compress') as HTMLElement).click();
      fixture.detectChanges();
      tick(200);
      flushMicrotasks();
      expect(component.expanded).toBeFalse();
      expect(query('.fa-expand')).not.toBeNull();
      expect(query('.fa-compress')).toBeNull();
      expect(lastNewPlotArgs()[0]).toBe(component.panelChartDiv.nativeElement);
      flush();
    }));

    it('collapses on Escape when expanded', fakeAsync(() => {
      createComponent();
      renderInitialChart();
      expand();
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
      fixture.detectChanges();
      expect(component.expanded).toBeFalse();
      expect(query('.fa-compress')).toBeNull();
      flush();
    }));

    it('ignores other keys when expanded', fakeAsync(() => {
      createComponent();
      renderInitialChart();
      expand();
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
      fixture.detectChanges();
      expect(component.expanded).toBeTrue();
      flush();
    }));
  });

  describe('destroy', () => {
    it('stops re-plotting on new results after destroy', fakeAsync(() => {
      createComponent();
      renderInitialChart();
      plotlyServiceSpy.newPlot.calls.reset();
      fixture.destroy();
      fanPsychrometricServiceSpy.calculatedBaseGasDensity.next(makeResults({ humidityRatio: 0.09 }));
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
      expect(component.psychrometricResults.humidityRatio).toBe(0.03);
      flush();
    }));
  });
});
