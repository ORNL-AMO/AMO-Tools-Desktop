import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlotlyService } from 'angular-plotly.js';
import { StatePointAnalysisGraphComponent } from './state-point-analysis-graph.component';
import { StatePointAnalysisService } from '../state-point-analysis.service';
import { StatePointAnalysisGraphService } from '../state-point-analysis-graph.service';
import { StatePointAnalysisOutput, StatePointAnalysisResults } from '../../../../shared/models/waste-water';
import { Settings } from '../../../../shared/models/settings';

function makeResults(overrides: Partial<StatePointAnalysisResults> = {}): StatePointAnalysisResults {
  return {
    SurfaceOverflow: 10,
    AppliedSolidsLoading: 1,
    TotalAreaClarifier: 100,
    RasConcentration: 5000,
    UnderFlowRateX2: 8,
    UnderFlowRateY1: 20,
    OverFlowRateX2: 6,
    OverFlowRateY2: 15,
    StatePointX: 3,
    StatePointY: 9,
    ...overrides,
  };
}

function makeOutput(withModification: boolean = true): StatePointAnalysisOutput {
  return {
    baseline: makeResults({ graphData: [[1, 2], [3, 4], [5, 6]] }),
    modification: withModification ? makeResults({ StatePointX: 4, StatePointY: 7 }) : undefined,
    sviParameterName: 'VoK',
  };
}

describe('StatePointAnalysisGraphComponent', () => {
  let component: StatePointAnalysisGraphComponent;
  let fixture: ComponentFixture<StatePointAnalysisGraphComponent>;
  let serviceMock: { output: BehaviorSubject<StatePointAnalysisOutput> };
  let plotlySpy: jasmine.SpyObj<PlotlyService>;

  function query(selector: string): any {
    return fixture.nativeElement.querySelector(selector);
  }

  function count(selector: string): number {
    return fixture.nativeElement.querySelectorAll(selector).length;
  }

  function render(unitsOfMeasure: string = 'Imperial'): void {
    const settings: Settings = { unitsOfMeasure: unitsOfMeasure };
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('modificationExists', true);
    fixture.detectChanges();
  }

  function lastPlottedTraces(): Array<any> {
    return plotlySpy.newPlot.calls.mostRecent().args[1] as Array<any>;
  }

  beforeEach(async () => {
    serviceMock = { output: new BehaviorSubject<StatePointAnalysisOutput>(makeOutput()) };
    plotlySpy = jasmine.createSpyObj('PlotlyService', ['newPlot', 'update']);

    await TestBed.configureTestingModule({
      declarations: [StatePointAnalysisGraphComponent],
      providers: [
        StatePointAnalysisGraphService,
        { provide: StatePointAnalysisService, useValue: serviceMock },
        { provide: PlotlyService, useValue: plotlySpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StatePointAnalysisGraphComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('plots the current output into the panel chart', () => {
      render();
      expect(plotlySpy.newPlot).toHaveBeenCalledTimes(1);
      expect(plotlySpy.newPlot.calls.mostRecent().args[0]).toBe(query('#tabPanelDiv'));
    });

    it('does not plot when the service has no output', () => {
      serviceMock.output.next(undefined);
      render();
      expect(plotlySpy.newPlot).not.toHaveBeenCalled();
    });
  });

  describe('calculation triggers and output rendering', () => {
    it('passes the baseline flux curve as the SVI parameter trace', () => {
      render();
      const svi = lastPlottedTraces()[0];
      expect(svi.name).toBe('VoK');
      expect(svi.x).toEqual([1, 3, 5]);
      expect(svi.y).toEqual([2, 4, 6]);
    });

    it('passes baseline and modification underflow, overflow, and state point traces', () => {
      render();
      const names = lastPlottedTraces().map(trace => trace.name);
      expect(names).toEqual([
        'VoK',
        'Underflow Rate (Baseline)', 'Overflow Rate (Baseline)', 'State Point (Baseline)',
        'Underflow Rate (Modification)', 'Overflow Rate (Modification)', 'State Point (Modification)',
      ]);
      expect(lastPlottedTraces()[3].x).toEqual([3]);
      expect(lastPlottedTraces()[3].y).toEqual([9]);
      expect(lastPlottedTraces()[6].x).toEqual([4]);
      expect(lastPlottedTraces()[6].y).toEqual([7]);
    });

    it('passes only baseline traces when the output has no modification', () => {
      serviceMock.output.next(makeOutput(false));
      render();
      expect(lastPlottedTraces().map(trace => trace.name)).toEqual([
        'VoK', 'Underflow Rate (Baseline)', 'Overflow Rate (Baseline)', 'State Point (Baseline)',
      ]);
    });

    it('re-plots with updated data when the output changes', () => {
      render();
      const output = makeOutput();
      output.baseline.StatePointX = 11;
      serviceMock.output.next(output);
      expect(plotlySpy.newPlot).toHaveBeenCalledTimes(2);
      expect(lastPlottedTraces()[3].x).toEqual([11]);
    });

    it('labels the flux axis in imperial units for imperial settings', () => {
      render('Imperial');
      expect(component.spaGraph.layout.yaxis.title.text).toBe('Solids Flux (lb/ft<sup>2</sup>d)');
    });

    it('labels the flux axis in metric units for metric settings', () => {
      render('Metric');
      expect(component.spaGraph.layout.yaxis.title.text).toBe('Solids Flux (kg/m<sup>2</sup>d)');
    });
  });

  describe('user actions', () => {
    it('toggles the grid lines on the panel chart', () => {
      render();
      component.toggleGrid();
      expect(component.spaGraph.layout.xaxis.showgrid).toBeFalse();
      expect(component.spaGraph.layout.yaxis.showgrid).toBeFalse();
      expect(plotlySpy.update.calls.mostRecent().args[0]).toBe(query('#tabPanelDiv'));
    });

    it('re-plots into the expanded chart after expanding', fakeAsync(() => {
      render();
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      expect(component.expanded).toBeTrue();
      expect(plotlySpy.newPlot.calls.mostRecent().args[0]).toBe(query('#expandedChartDiv'));
    }));

    it('re-plots into the panel chart after contracting', fakeAsync(() => {
      render();
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      component.contractChart();
      fixture.detectChanges();
      tick(200);
      expect(component.expanded).toBeFalse();
      expect(plotlySpy.newPlot.calls.mostRecent().args[0]).toBe(query('#tabPanelDiv'));
    }));

    it('contracts the expanded chart on Escape', fakeAsync(() => {
      render();
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
      tick(200);
      expect(component.expanded).toBeFalse();
    }));
  });

  describe('template visibility', () => {
    it('shows only the panel chart controls when collapsed', () => {
      render();
      expect(query('#expandedChartDiv')).toBeNull();
      expect(query('.fa-compress')).toBeNull();
      expect(count('.fa-expand')).toBe(1);
      expect(count('.fa-bar-chart')).toBe(1);
      expect(count('app-simple-tooltip')).toBe(2);
    });

    it('shows the expanded chart and collapse control, and hides every expand control, when expanded', () => {
      render();
      component.expanded = true;
      fixture.detectChanges();
      expect(query('#expandedChartDiv')).not.toBeNull();
      expect(query('.fa-compress')).not.toBeNull();
      expect(count('.fa-expand')).toBe(0);
      expect(count('.fa-bar-chart')).toBe(2);
      // collapse + expanded grid + panel grid
      expect(count('app-simple-tooltip')).toBe(3);
    });

    it('always renders the results table', () => {
      render();
      expect(query('app-state-point-analysis-results')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops plotting new output after destroy', () => {
      render();
      plotlySpy.newPlot.calls.reset();
      fixture.destroy();
      serviceMock.output.next(makeOutput());
      expect(plotlySpy.newPlot).not.toHaveBeenCalled();
    });
  });
});
