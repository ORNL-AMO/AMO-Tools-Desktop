import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { FanSystemChecklistChartComponent } from './fan-system-checklist-chart.component';
import { FanSystemChecklistOutput, FanSystemChecklistResult } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeResult(name: string, scores: { motorPower: number, operatingHours: number, controls: number, system: number, production: number }): FanSystemChecklistResult {
  return {
    name: name,
    priority: 'Low',
    motorPowerScore: scores.motorPower,
    operatingHoursScore: scores.operatingHours,
    controlsScore: scores.controls,
    systemScore: scores.system,
    productionScore: scores.production,
    totalScore: scores.motorPower + scores.operatingHours + scores.controls + scores.system + scores.production,
    hasMotorPowerPriority: false,
    notes: ''
  };
}

function makeOutput(): FanSystemChecklistOutput {
  return {
    equipmentResults: [
      makeResult('Fan A', { motorPower: 1, operatingHours: 1, controls: 2, system: 0, production: 3 }),
      makeResult('Fan B', { motorPower: 0, operatingHours: 0, controls: 1, system: 1, production: 0 }),
    ]
  };
}

describe('FanSystemChecklistChartComponent', () => {
  let component: FanSystemChecklistChartComponent;
  let fixture: ComponentFixture<FanSystemChecklistChartComponent>;
  let plotlyServiceSpy: jasmine.SpyObj<PlotlyService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function lastPlotArgs(): Array<any> {
    return plotlyServiceSpy.newPlot.calls.mostRecent().args;
  }

  beforeEach(async () => {
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot']);

    await TestBed.configureTestingModule({
      declarations: [FanSystemChecklistChartComponent],
      providers: [{ provide: PlotlyService, useValue: plotlyServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanSystemChecklistChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('output', makeOutput());
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('renders the chart into the panel div after view init', () => {
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(lastPlotArgs()[0]).toBe(query('#tabPanelDiv'));
    });
  });

  describe('chart data', () => {
    it('passes one stacked bar trace per score category with equipment names on x', () => {
      const traces = lastPlotArgs()[1];
      expect(traces.map(trace => trace.name)).toEqual(['Motor Power', 'Operating Hours', 'Control', 'System', 'Production']);
      traces.forEach(trace => {
        expect(trace.x).toEqual(['Fan A', 'Fan B']);
        expect(trace.type).toBe('bar');
      });
      expect(traces.map(trace => trace.y)).toEqual([[1, 0], [1, 0], [2, 1], [0, 1], [3, 0]]);
    });

    it('passes one total score annotation per equipment', () => {
      const annotations = lastPlotArgs()[2].annotations;
      expect(annotations.map(a => ({ x: a.x, text: a.text }))).toEqual([{ x: 'Fan A', text: '7' }, { x: 'Fan B', text: '2' }]);
      expect(annotations[0].y).toBeCloseTo(7 * 1.05);
    });

    it('passes no traces or annotations when the output has no equipment results', () => {
      fixture.componentRef.setInput('output', { equipmentResults: undefined });
      fixture.detectChanges();
      expect(lastPlotArgs()[1]).toEqual([]);
      expect(lastPlotArgs()[2].annotations).toEqual([]);
    });

    it('re-renders with updated data when the output input changes', () => {
      plotlyServiceSpy.newPlot.calls.reset();
      fixture.componentRef.setInput('output', { equipmentResults: [makeResult('Fan C', { motorPower: 2, operatingHours: 0, controls: 0, system: 0, production: 0 })] });
      fixture.detectChanges();
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(lastPlotArgs()[1][0].x).toEqual(['Fan C']);
    });

    it('does not re-render on the first output change', () => {
      plotlyServiceSpy.newPlot.calls.reset();
      component.ngOnChanges({ output: new SimpleChange(undefined, makeOutput(), true) });
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
    });
  });

  describe('expand and collapse', () => {
    it('renders into the expanded div after expanding', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      expect(lastPlotArgs()[0]).toBe(query('#expandedChartDiv'));
    }));

    it('renders back into the panel div after collapsing', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      component.contractChart();
      fixture.detectChanges();
      tick(100);
      expect(lastPlotArgs()[0]).toBe(query('#tabPanelDiv'));
    }));

    it('collapses on Escape when expanded', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      component.closeExpandedGraph({ code: 'Escape' });
      tick(100);
      expect(component.expanded).toBeFalse();
    }));

    it('ignores other keys when expanded', fakeAsync(() => {
      component.expandChart();
      tick(100);
      component.closeExpandedGraph({ code: 'Enter' });
      expect(component.expanded).toBeTrue();
    }));
  });

  describe('template visibility', () => {
    it('shows the expand button and tooltip and hides the expanded view when collapsed', () => {
      expect(query('.fa-expand')).not.toBeNull();
      expect(query('.col-md-12 app-simple-tooltip')).not.toBeNull();
      expect(query('.fa-compress')).toBeNull();
      expect(query('#expandedChartDiv')).toBeNull();
    });

    it('shows the collapse button and expanded view and hides the expand button and tooltip when expanded', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);
      expect(query('.fa-compress')).not.toBeNull();
      expect(query('.col-12 app-simple-tooltip')).not.toBeNull();
      expect(query('#expandedChartDiv')).not.toBeNull();
      expect(query('.fa-expand')).toBeNull();
      expect(query('.col-md-12 app-simple-tooltip')).toBeNull();
    }));
  });

  describe('tooltips', () => {
    it('displays the expand tooltip when still hovered after the delay', fakeAsync(() => {
      component.initTooltip('btnExpandChart');
      tick(200);
      expect(component.displayExpandTooltip).toBeTrue();
    }));

    it('does not display the expand tooltip when the hover ended before the delay', fakeAsync(() => {
      component.initTooltip('btnExpandChart');
      component.hideTooltip('btnExpandChart');
      tick(200);
      expect(component.displayExpandTooltip).toBeFalse();
    }));

    it('displays the collapse tooltip when still hovered after the delay', fakeAsync(() => {
      component.initTooltip('btnCollapseChart');
      tick(200);
      expect(component.displayCollapseTooltip).toBeTrue();
    }));
  });
});
