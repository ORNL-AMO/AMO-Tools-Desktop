import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { SteamPropertiesPhChartComponent } from './steam-properties-ph-chart.component';
import { SaturatedPropertiesService } from '../../saturated-properties.service';
import { SaturatedPropertiesConversionService } from '../../saturated-properties-conversion.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';

// Units matching the chart defaults, so no isotherm conversion runs.
const MOCK_SETTINGS = {
  steamPressureMeasurement: 'MPaa',
  steamTemperatureMeasurement: 'C',
  steamSpecificEntropyMeasurement: 'kJkgK',
  steamSpecificEnthalpyMeasurement: 'kJkg',
} as Settings;

function makeOutput(pressure: number = 1): SteamPropertiesOutput {
  return {
    pressure: pressure,
    temperature: 180,
    specificEnthalpy: 2777,
    specificEntropy: 6.58,
    quality: 1,
    specificVolume: 0.194,
  };
}

describe('SteamPropertiesPhChartComponent', () => {
  let component: SteamPropertiesPhChartComponent;
  let fixture: ComponentFixture<SteamPropertiesPhChartComponent>;
  let plotlyServiceSpy: jasmine.SpyObj<PlotlyService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function tooltipMessages(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('app-simple-tooltip')).map((el: any) => el.message);
  }

  function lastTrace(spy: jasmine.Spy): any {
    const data = spy.calls.mostRecent().args[1];
    return data[data.length - 1];
  }

  function createComponent(validPlot: boolean = true): void {
    fixture = TestBed.createComponent(SteamPropertiesPhChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('steamPropertiesOutput', makeOutput());
    fixture.componentRef.setInput('validPlot', validPlot);
    fixture.componentRef.setInput('toggleReset', false);
    fixture.detectChanges();
    flush();
  }

  beforeEach(async () => {
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot', 'update']);
    await TestBed.configureTestingModule({
      declarations: [SteamPropertiesPhChartComponent],
      providers: [
        SaturatedPropertiesService,
        SaturatedPropertiesConversionService,
        ConvertUnitsService,
        { provide: PlotlyService, useValue: plotlyServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('collapsed vs expanded rendering', () => {
    it('shows the expand control and hides the expanded chart while collapsed', fakeAsync(() => {
      createComponent();
      expect(query('.fa-expand')).toBeTruthy();
      expect(query('.fa-compress')).toBeNull();
      expect(query('#expandedChartDiv')).toBeNull();
      expect(tooltipMessages()).toEqual(['Toggle graph grid lines', 'Expand graph']);
    }));

    it('shows the collapse control and expanded chart and hides the expand control while expanded', fakeAsync(() => {
      createComponent();
      component.expanded = true;
      fixture.detectChanges();
      expect(query('.fa-compress')).toBeTruthy();
      expect(query('#expandedChartDiv')).toBeTruthy();
      expect(query('.fa-expand')).toBeNull();
      expect(tooltipMessages()).toEqual(['Collapse graph', 'Toggle graph grid lines']);
    }));
  });

  describe('chart data', () => {
    it('plots into the panel div with the state point after view init', fakeAsync(() => {
      createComponent();
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalled();
      expect(plotlyServiceSpy.newPlot.calls.mostRecent().args[0] as HTMLElement).toBe(query('#tabPanelDiv'));
      const point = lastTrace(plotlyServiceSpy.newPlot);
      expect(point.x).toEqual([2777]);
      expect(point.y[0]).toBeCloseTo(1, 6);
      expect(component.enthalpyChart.existingPoint).toBeTrue();
    }));

    it('plots only the dome and isobars when the plot is not valid', fakeAsync(() => {
      createComponent(false);
      expect(component.enthalpyChart.existingPoint).toBeFalsy();
      expect(lastTrace(plotlyServiceSpy.newPlot).name).toBe('Saturated');
    }));

    it('replaces the segment when the output changes', fakeAsync(() => {
      createComponent();
      const traceCount = component.enthalpyChart.data.length;
      fixture.componentRef.setInput('steamPropertiesOutput', makeOutput(2));
      fixture.detectChanges();
      expect(plotlyServiceSpy.update).toHaveBeenCalled();
      expect(lastTrace(plotlyServiceSpy.update).y[0]).toBeCloseTo(2, 6);
      expect(component.enthalpyChart.data.length).toBe(traceCount);
    }));

    it('removes the segment when reset toggles', fakeAsync(() => {
      createComponent();
      const traceCount = component.enthalpyChart.data.length;
      fixture.componentRef.setInput('toggleReset', true);
      fixture.detectChanges();
      expect(component.enthalpyChart.existingPoint).toBeFalse();
      expect(plotlyServiceSpy.update.calls.mostRecent().args[1].length).toBe(traceCount - 1);
    }));

    it('toggles the grid lines', fakeAsync(() => {
      createComponent();
      query('.fa-bar-chart').click();
      const layout = plotlyServiceSpy.update.calls.mostRecent().args[2];
      expect(layout.xaxis.showgrid).toBeFalse();
      expect(layout.yaxis.showgrid).toBeFalse();
    }));
  });

  describe('expand and collapse actions', () => {
    it('re-plots into the expanded div when expanded', fakeAsync(() => {
      createComponent();
      query('.fa-expand').click();
      fixture.detectChanges();
      flush();
      expect(component.expanded).toBeTrue();
      expect(plotlyServiceSpy.newPlot.calls.mostRecent().args[0] as HTMLElement).toBe(query('#expandedChartDiv'));
    }));

    it('re-plots into the panel div when collapsed', fakeAsync(() => {
      createComponent();
      component.expanded = true;
      fixture.detectChanges();
      query('.fa-compress').click();
      fixture.detectChanges();
      flush();
      expect(component.expanded).toBeFalse();
      expect(plotlyServiceSpy.newPlot.calls.mostRecent().args[0] as HTMLElement).toBe(query('#tabPanelDiv'));
    }));

    it('collapses on Escape while expanded', fakeAsync(() => {
      createComponent();
      component.expanded = true;
      fixture.detectChanges();
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
      fixture.detectChanges();
      flush();
      expect(component.expanded).toBeFalse();
      expect(query('.fa-expand')).toBeTruthy();
    }));
  });

  describe('tooltips', () => {
    it('shows the expand tooltip after hovering and hides it on leave', fakeAsync(() => {
      createComponent();
      query('.fa-expand').dispatchEvent(new Event('mouseenter'));
      flush();
      expect(component.displayExpandTooltip).toBeTrue();
      query('.fa-expand').dispatchEvent(new Event('mouseleave'));
      expect(component.displayExpandTooltip).toBeFalse();
    }));
  });
});
