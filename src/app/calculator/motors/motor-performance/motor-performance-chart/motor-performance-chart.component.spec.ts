import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PlotlyService } from 'angular-plotly.js';
import { MotorPerformanceChartComponent } from './motor-performance-chart.component';
import { MotorPerformanceChartService, MotorPoint } from '../motor-performance-chart.service';
import { PsatService } from '../../../../psat/psat.service';
import { Settings } from '../../../../shared/models/settings';
import { TraceCoordinates } from '../../../../shared/models/plotting';
import { graphColors } from '../../../../shared/graphColors';

const MOCK_SETTINGS = { powerMeasurement: 'hp' } as Settings;

function makePerformanceForm(horsePower: number = 200): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    frequency: [60, [Validators.required]],
    horsePower: [horsePower, [Validators.required]],
    motorRPM: [1780, [Validators.required]],
    efficiencyClass: [1, [Validators.required]],
    motorVoltage: [460, [Validators.required]],
    fullLoadAmps: [225.4, [Validators.required]],
    sizeMargin: [1, [Validators.required]],
    efficiency: [0, [Validators.min(0), Validators.max(100)]],
  });
}

function makeLineData(): Array<TraceCoordinates> {
  return [
    { x: [0.25, 0.5, 0.75], y: [40, 60, 80] },
    { x: [0.25, 0.5, 0.75], y: [55, 70, 82] },
    { x: [0.25, 0.5, 0.75], y: [88, 93, 95] },
  ];
}

function makeMotorPoint(pointColor: string, shaftLoad: number, current: number, power: number, efficiency: number): MotorPoint {
  return { pointColor: pointColor, shaftLoad: shaftLoad, current: current, power: power, efficiency: efficiency, x: shaftLoad, y: current };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('MotorPerformanceChartComponent', () => {
  let component: MotorPerformanceChartComponent;
  let fixture: ComponentFixture<MotorPerformanceChartComponent>;
  let chartService: MotorPerformanceChartService;
  let plotlyServiceSpy: jasmine.SpyObj<PlotlyService>;
  let plotlyChartSpy: jasmine.SpyObj<{ on: (event: string, handler: (data: any) => void) => void }>;
  let form: UntypedFormGroup;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function getSummaryRows(): Array<HTMLElement> {
    return queryAll('.data-summary tbody tr').slice(1);
  }

  function getCopyRows(): Array<HTMLElement> {
    return queryAll('.hidden-copy-table tbody tr').slice(1);
  }

  function getCellTexts(row: HTMLElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function lastPlotTraces(): Array<any> {
    return plotlyServiceSpy.newPlot.calls.mostRecent().args[1] as Array<any>;
  }

  function createComponent(): void {
    form = makePerformanceForm();
    fixture = TestBed.createComponent(MotorPerformanceChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('performanceForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('toggleCalculate', false);
    fixture.detectChanges();
  }

  function addPoints(points: Array<MotorPoint>): void {
    component.selectedDataPoints = points;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    plotlyChartSpy = jasmine.createSpyObj('PlotlyChart', ['on']);
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot']);
    plotlyServiceSpy.newPlot.and.returnValue(Promise.resolve(plotlyChartSpy));

    await TestBed.configureTestingModule({
      declarations: [MotorPerformanceChartComponent],
      providers: [
        MotorPerformanceChartService,
        { provide: PsatService, useValue: jasmine.createSpyObj('PsatService', ['motorPerformance']) },
        { provide: PlotlyService, useValue: plotlyServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    chartService = TestBed.inject(MotorPerformanceChartService);
    chartService.initChart();
    spyOn(chartService, 'buildLineData').and.callFake(() => makeLineData());
    spyOn(chartService, 'initChart').and.callThrough();
  });

  describe('initialization', () => {
    beforeEach(() => {
      createComponent();
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds the line data from the form and settings', () => {
      expect(chartService.buildLineData).toHaveBeenCalledWith(form, MOCK_SETTINGS);
    });

    it('plots the three performance curves into the panel chart div', () => {
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(plotlyServiceSpy.newPlot.calls.mostRecent().args[0]).toBe(query('#tabPanelDiv') as HTMLDivElement);
      const traces = lastPlotTraces();
      expect(traces.map(trace => trace.name)).toEqual(['Current (FLA)', 'Power Factor', 'Efficiency']);
      expect(traces.map(trace => trace.line.color)).toEqual([graphColors[0], graphColors[1], graphColors[2]]);
      expect(traces[0].x).toEqual([0.25, 0.5, 0.75]);
      expect(traces[2].y).toEqual([88, 93, 95]);
    });

    it('starts with no selected data points and saves the chart state to the service', () => {
      expect(component.selectedDataPoints).toEqual([]);
      expect(chartService.performanceChart.getValue()).toBe(component.performanceChart);
      expect(chartService.selectedDataPoints.getValue()).toBe(component.selectedDataPoints);
    });
  });

  describe('calculation triggers', () => {
    beforeEach(() => {
      createComponent();
      plotlyServiceSpy.newPlot.calls.reset();
      (chartService.buildLineData as jasmine.Spy).calls.reset();
    });

    it('re-plots with the new form values when toggleCalculate changes and the form is valid', () => {
      form.controls.horsePower.setValue(250);
      fixture.componentRef.setInput('toggleCalculate', true);
      fixture.detectChanges();
      expect(chartService.initChart).toHaveBeenCalled();
      expect(chartService.buildLineData).toHaveBeenCalledWith(form, MOCK_SETTINGS);
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
    });

    it('does not re-plot when toggleCalculate changes and the form is invalid', () => {
      form.controls.horsePower.setValue(null);
      fixture.componentRef.setInput('toggleCalculate', true);
      fixture.detectChanges();
      expect(chartService.buildLineData).not.toHaveBeenCalled();
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
    });

    it('clears previously selected points when the chart re-renders', () => {
      addPoints([makeMotorPoint('#111111', 50, 60, 70, 93)]);
      fixture.componentRef.setInput('toggleCalculate', true);
      fixture.detectChanges();
      expect(component.selectedDataPoints).toEqual([]);
      expect(getSummaryRows().length).toBe(0);
    });
  });

  describe('selecting points', () => {
    let clickHandler: (data: any) => void;

    beforeEach(async () => {
      createComponent();
      await fixture.whenStable();
      clickHandler = plotlyChartSpy.on.calls.mostRecent().args[1];
      plotlyServiceSpy.newPlot.calls.reset();
    });

    it('registers a plotly click handler on the rendered chart', () => {
      expect(plotlyChartSpy.on.calls.mostRecent().args[0]).toBe('plotly_click');
    });

    it('adds a summary row and three point markers for the clicked shaft load', () => {
      clickHandler({ points: [{ pointIndex: 1, x: 0.5, y: 60 }] });
      fixture.detectChanges();
      const markerColor = graphColors[3 % graphColors.length];
      expect(component.selectedDataPoints.length).toBe(1);
      expect(component.selectedDataPoints[0]).toEqual(jasmine.objectContaining({
        pointColor: markerColor, shaftLoad: 50, current: 60, power: 70, efficiency: 93,
      }));
      const markers = lastPlotTraces().slice(3);
      expect(markers.map(trace => trace.marker.color)).toEqual([markerColor, markerColor, markerColor]);
      expect(markers.map(trace => trace.y[0])).toEqual([60, 70, 93]);
      expect(getSummaryRows().length).toBe(1);
      expect(chartService.selectedDataPoints.getValue()).toBe(component.selectedDataPoints);
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
      plotlyServiceSpy.newPlot.calls.reset();
    });

    it('deleteDataPoint removes the point and its markers and re-plots', () => {
      const first = makeMotorPoint('#111111', 25, 40, 55, 88);
      const second = makeMotorPoint('#222222', 50, 60, 70, 93);
      component.dataPointTraces = [
        chartService.getTraceDataFromPoint(first),
        chartService.getTraceDataFromPoint(second),
      ];
      addPoints([first, second]);
      component.deleteDataPoint(first, 0);
      fixture.detectChanges();
      expect(component.selectedDataPoints).toEqual([second]);
      expect(component.dataPointTraces.map(trace => trace.marker.color)).toEqual(['#222222']);
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(getSummaryRows().map(row => getCellTexts(row)[1])).toEqual(['50.0']);
    });

    it('toggleGrid flips both axis grids and re-plots', () => {
      component.toggleGrid();
      expect(component.performanceChart.layout.xaxis.showgrid).toBeFalse();
      expect(component.performanceChart.layout.yaxis.showgrid).toBeFalse();
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      component.toggleGrid();
      expect(component.performanceChart.layout.xaxis.showgrid).toBeTrue();
    });

    it('updateTableString copies the hidden data summary table text', () => {
      addPoints([makeMotorPoint('#111111', 50, 60, 70, 93)]);
      component.updateTableString();
      expect(component.dataSummaryTableString).toContain('Motor Shaft Load (%)');
    });

    it('expandChart re-plots into the expanded chart div', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      expect(plotlyServiceSpy.newPlot.calls.mostRecent().args[0]).toBe(query('#expandedChartDiv') as HTMLDivElement);
    }));

    it('contractChart re-plots into the panel chart div', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      component.contractChart();
      fixture.detectChanges();
      tick(200);
      expect(component.expanded).toBeFalse();
      expect(plotlyServiceSpy.newPlot.calls.mostRecent().args[0]).toBe(query('#tabPanelDiv') as HTMLDivElement);
    }));

    it('Escape collapses an expanded chart', fakeAsync(() => {
      component.expandChart();
      tick(100);
      component.closeExpandedGraph({ code: 'Escape' });
      tick(200);
      expect(component.expanded).toBeFalse();
    }));

    it('other keys leave an expanded chart expanded', fakeAsync(() => {
      component.expandChart();
      tick(100);
      component.closeExpandedGraph({ code: 'Enter' });
      expect(component.expanded).toBeTrue();
    }));
  });

  describe('template: expanded chart', () => {
    beforeEach(() => {
      createComponent();
    });

    it('hides the expanded chart and collapse button while collapsed', () => {
      expect(query('#expandedChartDiv')).toBeNull();
      expect(query('.fa-compress')).toBeNull();
    });

    it('shows the expand button and its tooltip while collapsed', () => {
      expect(queryAll('.fa-expand').length).toBe(1);
      expect(queryAll('app-simple-tooltip').length).toBe(2);
    });

    it('shows the expanded chart and collapse button while expanded', () => {
      component.expanded = true;
      fixture.detectChanges();
      expect(query('#expandedChartDiv')).not.toBeNull();
      expect(queryAll('.fa-compress').length).toBe(1);
    });

    it('hides every expand button and its tooltip while expanded', () => {
      component.expanded = true;
      fixture.detectChanges();
      expect(queryAll('.fa-expand').length).toBe(0);
      expect(queryAll('.fa-bar-chart').length).toBe(2);
      expect(queryAll('app-simple-tooltip').length).toBe(3);
    });
  });

  describe('template: data summary rows', () => {
    beforeEach(() => {
      createComponent();
    });

    it('renders only the header rows when no points are selected', () => {
      expect(getSummaryRows().length).toBe(0);
      expect(getCopyRows().length).toBe(0);
    });

    it('renders one formatted summary row per selected point', () => {
      addPoints([
        makeMotorPoint('#111111', 25.125, 40.26, 55.04, 88.47),
        makeMotorPoint('#222222', 50, 60, 70, 93),
      ]);
      const rows = getSummaryRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[0])).toEqual(['', '25.125', '40.3', '55.0', '88.5', 'Delete']);
      expect(getCellTexts(rows[1])).toEqual(['', '50.0', '60.0', '70.0', '93.0', 'Delete']);
    });

    it('renders one rounded copy-table row per selected point', () => {
      addPoints([
        makeMotorPoint('#111111', 25.125, 40.26, 55.04, 88.47),
        makeMotorPoint('#222222', 50, 60, 70, 93),
      ]);
      const rows = getCopyRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[0])).toEqual(['25.125', '40', '55', '88']);
      expect(getCellTexts(rows[1])).toEqual(['50', '60', '70', '93']);
    });

    it('deletes the clicked row through the Delete link', () => {
      const first = makeMotorPoint('#111111', 25, 40, 55, 88);
      const second = makeMotorPoint('#222222', 50, 60, 70, 93);
      component.dataPointTraces = [];
      addPoints([first, second]);
      spyOn(component, 'deleteDataPoint').and.callThrough();
      (getSummaryRows()[1].querySelector('.delete-row a') as HTMLElement).click();
      expect(component.deleteDataPoint).toHaveBeenCalledWith(second, 1);
    });
  });
});
