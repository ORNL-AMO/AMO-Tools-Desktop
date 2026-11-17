import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import * as Plotly from 'plotly.js-dist';
import { CoolingTowerFanChartComponent } from './cooling-tower-fan-chart.component';
import { ChillerPerformanceOutput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

// The template binds a CoolingTowerFanOutput to an input typed as ChillerPerformanceOutput.
function makeOutput(baselinePower: number = 40, modPower: number = 25): ChillerPerformanceOutput {
  return { baselinePower, modPower } as unknown as ChillerPerformanceOutput;
}

describe('CoolingTowerFanChartComponent', () => {
  let component: CoolingTowerFanChartComponent;
  let fixture: ComponentFixture<CoolingTowerFanChartComponent>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function createComponent(settings: Settings = IMPERIAL, output: ChillerPerformanceOutput = makeOutput()): void {
    fixture = TestBed.createComponent(CoolingTowerFanChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('output', output);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoolingTowerFanChartComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('with chart rendering stubbed', () => {
    let renderSpy: jasmine.Spy;

    // Chart timers must flush inside each test: once a spec ends its spy is removed and a late timer
    // would call real Plotly against a detached element.
    beforeEach(() => {
      createComponent();
      renderSpy = spyOn(component, 'initRenderChart');
    });

    function init(): void {
      fixture.detectChanges();
      tick(100);
    }

    describe('initialization', () => {
      it('renders the chart after the initial resize delay', fakeAsync(() => {
        fixture = TestBed.createComponent(CoolingTowerFanChartComponent);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('settings', IMPERIAL);
        fixture.componentRef.setInput('output', makeOutput());
        const spy = spyOn(component, 'initRenderChart');
        fixture.detectChanges();
        expect(spy).not.toHaveBeenCalled();
        tick(100);
        expect(spy).toHaveBeenCalledTimes(1);
      }));

      it('starts collapsed on the tab panel chart', fakeAsync(() => {
        init();
        expect(component.expanded).toBeFalsy();
        expect(component.currentChartId).toBe('tabPanelDiv');
        flush();
      }));
    });

    describe('output changes', () => {
      it('re-renders when the output changes after the first change', fakeAsync(() => {
        init();
        renderSpy.calls.reset();
        fixture.componentRef.setInput('output', makeOutput(50, 30));
        fixture.detectChanges();
        expect(renderSpy).toHaveBeenCalledTimes(1);
        flush();
      }));

      it('does not re-render when only settings change', fakeAsync(() => {
        init();
        renderSpy.calls.reset();
        fixture.componentRef.setInput('settings', METRIC);
        fixture.detectChanges();
        expect(renderSpy).not.toHaveBeenCalled();
        flush();
      }));
    });

    describe('template visibility', () => {
      it('shows the expand control and hides the expanded chart when collapsed', fakeAsync(() => {
        init();
        expect(query('.fa-expand')).not.toBeNull();
        expect(fixture.nativeElement.querySelectorAll('app-simple-tooltip').length).toBe(1);
        expect(query('.fa-compress')).toBeNull();
        expect(query('#expandedChartDiv')).toBeNull();
        expect(query('#tabPanelDiv')).not.toBeNull();
        flush();
      }));

      it('shows the collapse control and expanded chart after expanding', fakeAsync(() => {
        init();
        (query('.fa-expand') as HTMLElement).click();
        fixture.detectChanges();
        expect(component.expanded).toBeTrue();
        expect(query('.fa-compress')).not.toBeNull();
        expect(query('#expandedChartDiv')).not.toBeNull();
        expect(query('.fa-expand')).toBeNull();
        expect(fixture.nativeElement.querySelectorAll('app-simple-tooltip').length).toBe(1);
        expect(query('.expanded-chart app-simple-tooltip')).not.toBeNull();
        expect(query('#tabPanelDiv')).not.toBeNull();
        flush();
      }));

      it('returns to the collapsed layout after clicking collapse', fakeAsync(() => {
        init();
        component.expandChart();
        fixture.detectChanges();
        (query('.fa-compress') as HTMLElement).click();
        fixture.detectChanges();
        expect(component.expanded).toBeFalse();
        expect(query('.fa-compress')).toBeNull();
        expect(query('#expandedChartDiv')).toBeNull();
        expect(query('.fa-expand')).not.toBeNull();
        flush();
      }));
    });

    describe('user actions', () => {
      it('switches to the expanded chart id and re-renders after expanding', fakeAsync(() => {
        init();
        renderSpy.calls.reset();
        component.expandChart();
        fixture.detectChanges();
        tick(100);
        expect(component.currentChartId).toBe('expandedChartDiv');
        expect(renderSpy).toHaveBeenCalledTimes(1);
      }));

      it('switches back to the tab panel chart id after collapsing', fakeAsync(() => {
        init();
        component.expandChart();
        fixture.detectChanges();
        tick(100);
        renderSpy.calls.reset();
        component.contractChart();
        fixture.detectChanges();
        tick(100);
        expect(component.currentChartId).toBe('tabPanelDiv');
        expect(renderSpy).toHaveBeenCalledTimes(1);
      }));

      it('collapses an expanded chart on Escape', fakeAsync(() => {
        init();
        component.expandChart();
        fixture.detectChanges();
        document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
        fixture.detectChanges();
        expect(component.expanded).toBeFalse();
        expect(query('.fa-compress')).toBeNull();
        flush();
      }));

      it('ignores other keys while expanded', fakeAsync(() => {
        init();
        component.expandChart();
        document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
        expect(component.expanded).toBeTrue();
        flush();
      }));

      it('displays the expand tooltip only while still hovering', fakeAsync(() => {
        init();
        component.initTooltip('btnExpandChart');
        tick(200);
        expect(component.displayExpandTooltip).toBeTrue();
        component.hideTooltip('btnExpandChart');
        expect(component.displayExpandTooltip).toBeFalse();
        component.initTooltip('btnExpandChart');
        component.hideTooltip('btnExpandChart');
        tick(200);
        expect(component.displayExpandTooltip).toBeFalse();
      }));

      it('displays the collapse tooltip only while still hovering', fakeAsync(() => {
        init();
        component.initTooltip('btnCollapseChart');
        tick(200);
        expect(component.displayCollapseTooltip).toBeTrue();
        component.hideTooltip('btnCollapseChart');
        expect(component.displayCollapseTooltip).toBeFalse();
      }));
    });
  });

  describe('chart data', () => {
    let newPlotSpy: jasmine.Spy;

    function getPlotArgs(): Array<any> {
      return newPlotSpy.calls.mostRecent().args;
    }

    beforeEach(() => {
      spyOn(Plotly, 'purge');
      newPlotSpy = spyOn(Plotly, 'newPlot');
    });

    it('plots baseline and modification power on the tab panel chart', () => {
      createComponent(IMPERIAL, makeOutput(40, 25));
      component.initRenderChart();
      const [chartId, traces] = getPlotArgs();
      expect(chartId).toBe('tabPanelDiv');
      expect(traces.map(trace => trace.x)).toEqual([['Baseline'], ['Modification']]);
      expect(traces.map(trace => trace.y)).toEqual([[40], [25]]);
    });

    it('labels power in hp for imperial settings', () => {
      createComponent(IMPERIAL, makeOutput());
      component.initRenderChart();
      expect(getPlotArgs()[2].yaxis.title.text).toBe('Power Consumption (hp)');
    });

    it('labels power in kW for metric settings', () => {
      createComponent(METRIC, makeOutput());
      component.initRenderChart();
      expect(getPlotArgs()[2].yaxis.title.text).toBe('Power Consumption (kW)');
    });

    it('plots updated output after the output changes', fakeAsync(() => {
      createComponent(IMPERIAL, makeOutput(40, 25));
      fixture.detectChanges();
      tick(100);
      expect(getPlotArgs()[1].map(trace => trace.y)).toEqual([[40], [25]]);
      fixture.componentRef.setInput('output', makeOutput(60, 10));
      fixture.detectChanges();
      expect(getPlotArgs()[1].map(trace => trace.y)).toEqual([[60], [10]]);
    }));

    it('plots on the expanded chart when expanded', fakeAsync(() => {
      createComponent(IMPERIAL, makeOutput(40, 25));
      fixture.detectChanges();
      tick(100);
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      expect(getPlotArgs()[0]).toBe('expandedChartDiv');
      expect(getPlotArgs()[1].map(trace => trace.y)).toEqual([[40], [25]]);
    }));
  });
});
