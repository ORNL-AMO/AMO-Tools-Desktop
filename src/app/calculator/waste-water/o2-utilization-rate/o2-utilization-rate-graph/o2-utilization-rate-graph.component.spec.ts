import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { O2UtilizationRateGraphComponent } from './o2-utilization-rate-graph.component';
import { O2UtilizationDataPoints, O2UtilizationRateService } from '../o2-utilization-rate.service';

function makeDataPoints(): Array<O2UtilizationDataPoints> {
  return [
    { time: 0, dissolvedOxygen: 6 },
    { time: 30, dissolvedOxygen: 5 },
    { time: 60, dissolvedOxygen: 4 },
  ];
}

describe('O2UtilizationRateGraphComponent', () => {
  let component: O2UtilizationRateGraphComponent;
  let fixture: ComponentFixture<O2UtilizationRateGraphComponent>;
  let o2Service: O2UtilizationRateService;
  let plotlyServiceSpy: jasmine.SpyObj<PlotlyService>;

  beforeEach(async () => {
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot']);

    await TestBed.configureTestingModule({
      declarations: [O2UtilizationRateGraphComponent],
      providers: [
        O2UtilizationRateService,
        { provide: PlotlyService, useValue: plotlyServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    o2Service = TestBed.inject(O2UtilizationRateService);
    fixture = TestBed.createComponent(O2UtilizationRateGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function lastPlotArgs(): any[] {
    return plotlyServiceSpy.newPlot.calls.mostRecent().args as any[];
  }

  describe('initialization', () => {
    it('assigns the service data points', () => {
      expect(component.inputDataPoints).toBe(o2Service.inputDataPoints.getValue());
    });

    it('draws the graph into the chart element after the view initializes', () => {
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalled();
      expect(lastPlotArgs()[0]).toBe(component.o2UtilizationChart.nativeElement);
    });

    it('starts collapsed with grid lines shown', () => {
      expect(component.expanded).toBeFalse();
      expect(component.showGridLines).toBeTrue();
    });
  });

  describe('graph data', () => {
    it('passes time as x and dissolved oxygen as y', () => {
      plotlyServiceSpy.newPlot.calls.reset();
      o2Service.inputDataPoints.next(makeDataPoints());
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      const [, traces, layout] = lastPlotArgs();
      expect(traces[0].x).toEqual([0, 30, 60]);
      expect(traces[0].y).toEqual([6, 5, 4]);
      expect(layout.xaxis.tickvals).toEqual([0, 30, 60]);
    });

    it('redraws with updated data when the service emits again', () => {
      o2Service.inputDataPoints.next(makeDataPoints());
      o2Service.inputDataPoints.next([{ time: 10, dissolvedOxygen: 2 }]);
      const [, traces] = lastPlotArgs();
      expect(traces[0].x).toEqual([10]);
      expect(traces[0].y).toEqual([2]);
    });

    it('does not draw when the chart element is not available', () => {
      component.o2UtilizationChart = undefined;
      plotlyServiceSpy.newPlot.calls.reset();
      component.drawGraph();
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
    });
  });

  describe('user actions', () => {
    it('toggleGrid flips the grid lines and redraws without them', () => {
      plotlyServiceSpy.newPlot.calls.reset();
      component.toggleGrid();
      expect(component.showGridLines).toBeFalse();
      const [, , layout] = lastPlotArgs();
      expect(layout.xaxis.showgrid).toBeFalse();
      expect(layout.yaxis.showgrid).toBeFalse();
    });

    it('expandChart expands, hides tooltips, and redraws after a delay', fakeAsync(() => {
      component.hoverBtnExpand = true;
      component.displayExpandTooltip = true;
      plotlyServiceSpy.newPlot.calls.reset();
      component.expandChart();
      fixture.detectChanges();
      expect(component.expanded).toBeTrue();
      expect(component.hoverBtnExpand).toBeFalse();
      expect(component.displayExpandTooltip).toBeFalse();
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
      tick(100);
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(lastPlotArgs()[0]).toBe(query('.panel-chart-container .w-100.p-3 > div'));
    }));

    it('contractChart collapses, hides tooltips, and redraws after a delay', fakeAsync(() => {
      component.expanded = true;
      component.hoverBtnCollapse = true;
      component.displayCollapseTooltip = true;
      plotlyServiceSpy.newPlot.calls.reset();
      component.contractChart();
      expect(component.expanded).toBeFalse();
      expect(component.hoverBtnCollapse).toBeFalse();
      expect(component.displayCollapseTooltip).toBeFalse();
      tick(100);
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
    }));

    it('clicking the expand icon expands the chart', fakeAsync(() => {
      query('.fa-expand').click();
      fixture.detectChanges();
      tick(100);
      expect(component.expanded).toBeTrue();
    }));

    it('clicking the collapse icon collapses the chart', fakeAsync(() => {
      component.expanded = true;
      fixture.detectChanges();
      query('.fa-compress').click();
      tick(100);
      expect(component.expanded).toBeFalse();
    }));

    it('clicking the grid icon toggles the grid lines', () => {
      query('.fa-bar-chart').click();
      expect(component.showGridLines).toBeFalse();
    });
  });

  describe('tooltips', () => {
    const cases: Array<{ btnType: string, hover: keyof O2UtilizationRateGraphComponent, display: keyof O2UtilizationRateGraphComponent }> = [
      { btnType: 'btnExpandChart', hover: 'hoverBtnExpand', display: 'displayExpandTooltip' },
      { btnType: 'btnCollapseChart', hover: 'hoverBtnCollapse', display: 'displayCollapseTooltip' },
      { btnType: 'btnGridLines', hover: 'hoverBtnGridLines', display: 'displayGridLinesTooltip' },
    ];

    cases.forEach(({ btnType, hover, display }) => {
      it(`${btnType}: shows the tooltip when still hovering after the delay`, fakeAsync(() => {
        component.initTooltip(btnType);
        expect(component[hover]).toBeTrue();
        expect(component[display]).toBeFalse();
        tick(200);
        expect(component[display]).toBeTrue();
      }));

      it(`${btnType}: does not show the tooltip when hover ended before the delay`, fakeAsync(() => {
        component.initTooltip(btnType);
        component.hideTooltip(btnType);
        tick(200);
        expect(component[hover]).toBeFalse();
        expect(component[display]).toBeFalse();
      }));
    });
  });

  describe('template visibility', () => {
    it('shows the collapsed panel with grid and expand controls when not expanded', () => {
      expect(query('.tab-panel-background')).not.toBeNull();
      expect(query('.panel-chart-container')).toBeNull();
      expect(query('.fa-bar-chart')).not.toBeNull();
      expect(query('.fa-expand')).not.toBeNull();
      expect(query('.fa-compress')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.tab-panel-background app-simple-tooltip').length).toBe(2);
    });

    it('shows the expanded panel with only the collapse control when expanded', () => {
      component.expanded = true;
      fixture.detectChanges();
      expect(query('.panel-chart-container')).not.toBeNull();
      expect(query('.panel-chart-container').classList).toContain('expanded-chart');
      expect(query('.tab-panel-background')).toBeNull();
      expect(query('.fa-compress')).not.toBeNull();
      expect(query('.fa-expand')).toBeNull();
      expect(query('.fa-bar-chart')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('app-simple-tooltip').length).toBe(1);
    });

    it('renders exactly one chart element in either state', () => {
      expect(fixture.nativeElement.querySelectorAll('.tab-panel-background > .w-100').length).toBe(1);
      component.expanded = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.panel-chart-container .w-100.p-3 > div').length).toBe(1);
      expect(query('.tab-panel-background')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops redrawing on service changes after destroy', () => {
      fixture.destroy();
      plotlyServiceSpy.newPlot.calls.reset();
      o2Service.inputDataPoints.next(makeDataPoints());
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
    });
  });
});
