import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { ChillerPerformanceChartComponent } from './chiller-performance-chart.component';
import { ChillerPerformanceOutput } from '../../../../shared/models/chillers';

function makeOutput(overrides: Partial<ChillerPerformanceOutput> = {}): ChillerPerformanceOutput {
  return {
    baselineActualEfficiency: 0.6,
    baselineActualCapacity: 500,
    baselinePower: 300,
    baselineEnergy: 1200000,
    modActualEfficiency: 0.5,
    modActualCapacity: 520,
    modPower: 260,
    modEnergy: 1000000,
    savingsEnergy: 200000,
    baselineEnergyCost: 120000,
    modEnergyCost: 100000,
    annualCostSaving: 20000,
    ...overrides,
  };
}

describe('ChillerPerformanceChartComponent', () => {
  let component: ChillerPerformanceChartComponent;
  let fixture: ComponentFixture<ChillerPerformanceChartComponent>;
  let newPlotSpy: jasmine.Spy;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(output: ChillerPerformanceOutput = makeOutput()): void {
    fixture = TestBed.createComponent(ChillerPerformanceChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('output', output);
    fixture.detectChanges();
  }

  function lastNewPlotArgs(): Array<any> {
    return newPlotSpy.calls.mostRecent().args as Array<any>;
  }

  beforeEach(async () => {
    newPlotSpy = spyOn(Plotly, 'newPlot').and.returnValue(Promise.resolve() as any);
    spyOn(Plotly, 'purge');

    await TestBed.configureTestingModule({
      declarations: [ChillerPerformanceChartComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('chart data', () => {
    it('plots baseline and modification energy into the panel chart after init', fakeAsync(() => {
      createComponent();
      expect(newPlotSpy).not.toHaveBeenCalled();
      tick(100);
      expect(newPlotSpy).toHaveBeenCalledTimes(1);
      const [chartId, traces, layout] = lastNewPlotArgs();
      expect(chartId).toBe('tabPanelDiv');
      expect(traces.length).toBe(2);
      expect(traces[0].x).toEqual(['Baseline']);
      expect(traces[0].y).toEqual([1200000]);
      expect(traces[1].x).toEqual(['Modification']);
      expect(traces[1].y).toEqual([1000000]);
      expect(layout.yaxis.title.text).toBe('Energy Consumption (kWh)');
    }));

    it('re-plots with the new output when the output input changes', fakeAsync(() => {
      createComponent();
      tick(100);
      newPlotSpy.calls.reset();
      fixture.componentRef.setInput('output', makeOutput({ baselineEnergy: 50, modEnergy: 40 }));
      fixture.detectChanges();
      expect(newPlotSpy).toHaveBeenCalledTimes(1);
      const [, traces] = lastNewPlotArgs();
      expect(traces[0].y).toEqual([50]);
      expect(traces[1].y).toEqual([40]);
    }));

    it('does not re-plot on the first output change', fakeAsync(() => {
      createComponent();
      component.ngOnChanges({ output: new SimpleChange(undefined, makeOutput(), true) });
      expect(newPlotSpy).not.toHaveBeenCalled();
      tick(100);
    }));
  });

  describe('template visibility', () => {
    beforeEach(fakeAsync(() => {
      createComponent();
      tick(100);
    }));

    it('shows the expand button and tooltip and hides the expanded chart when collapsed', () => {
      expect(query('.fa-expand')).not.toBeNull();
      expect(query('.w-100.panel-chart-container app-simple-tooltip')).not.toBeNull();
      expect(query('.fa-compress')).toBeNull();
      expect(query('#expandedChartDiv')).toBeNull();
      expect(query('.expanded-chart app-simple-tooltip')).toBeNull();
    });

    it('shows the collapse button and expanded chart and hides the expand button when expanded', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      expect(query('.fa-compress')).not.toBeNull();
      expect(query('.expanded-chart app-simple-tooltip')).not.toBeNull();
      expect(query('#expandedChartDiv')).not.toBeNull();
      expect(query('.fa-expand')).toBeNull();
      expect(query('.w-100.panel-chart-container app-simple-tooltip')).toBeNull();
      tick(100);
    }));
  });

  describe('expand and collapse', () => {
    beforeEach(fakeAsync(() => {
      createComponent();
      tick(100);
      newPlotSpy.calls.reset();
    }));

    it('re-plots into the expanded chart div when expanded', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      expect(component.currentChartId).toBe('expandedChartDiv');
      expect(lastNewPlotArgs()[0]).toBe('expandedChartDiv');
    }));

    it('re-plots into the panel chart div when collapsed', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      component.contractChart();
      fixture.detectChanges();
      tick(100);
      expect(component.expanded).toBeFalse();
      expect(lastNewPlotArgs()[0]).toBe('tabPanelDiv');
      expect(query('.fa-expand')).not.toBeNull();
    }));

    it('collapses on Escape when expanded', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
      fixture.detectChanges();
      tick(100);
      expect(component.expanded).toBeFalse();
      expect(query('#expandedChartDiv')).toBeNull();
    }));

    it('ignores other keys when expanded', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
      expect(component.expanded).toBeTrue();
    }));
  });

  describe('tooltips', () => {
    beforeEach(fakeAsync(() => {
      createComponent();
      tick(100);
    }));

    it('displays the expand tooltip after hovering', fakeAsync(() => {
      component.initTooltip('btnExpandChart');
      tick(200);
      expect(component.displayExpandTooltip).toBeTrue();
    }));

    it('does not display the expand tooltip when hover ends before the delay', fakeAsync(() => {
      component.initTooltip('btnExpandChart');
      component.hideTooltip('btnExpandChart');
      tick(200);
      expect(component.displayExpandTooltip).toBeFalse();
    }));

    it('displays the collapse tooltip after hovering', fakeAsync(() => {
      component.initTooltip('btnCollapseChart');
      tick(200);
      expect(component.displayCollapseTooltip).toBeTrue();
    }));
  });
});
