import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { SaturatedPropertiesChartComponent } from './saturated-properties-chart.component';
import { SaturatedPropertiesService } from '../../saturated-properties.service';
import { SaturatedPropertiesConversionService } from '../../saturated-properties-conversion.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { SaturatedPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';

// Units matching the chart defaults, so no isobar conversion runs.
const MOCK_SETTINGS = {
  steamPressureMeasurement: 'MPaa',
  steamTemperatureMeasurement: 'C',
  steamSpecificEntropyMeasurement: 'kJkgK',
  steamSpecificEnthalpyMeasurement: 'kJkg',
} as Settings;

function makeOutput(temperature: number = 180): SaturatedPropertiesOutput {
  return {
    saturatedPressure: 1,
    saturatedTemperature: temperature,
    liquidEnthalpy: 762,
    gasEnthalpy: 2777,
    evaporationEnthalpy: 2015,
    liquidEntropy: 2.14,
    gasEntropy: 6.58,
    evaporationEntropy: 4.44,
    liquidVolume: 0.0011,
    gasVolume: 0.194,
    evaporationVolume: 0.193,
  };
}

describe('SaturatedPropertiesChartComponent', () => {
  let component: SaturatedPropertiesChartComponent;
  let fixture: ComponentFixture<SaturatedPropertiesChartComponent>;
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
    fixture = TestBed.createComponent(SaturatedPropertiesChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('saturatedPropertiesOutput', makeOutput());
    fixture.componentRef.setInput('validPlot', validPlot);
    fixture.componentRef.setInput('toggleReset', false);
    fixture.detectChanges();
    flush();
  }

  beforeEach(async () => {
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot', 'update']);
    await TestBed.configureTestingModule({
      declarations: [SaturatedPropertiesChartComponent],
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
    it('plots into the panel div with the saturation segment after view init', fakeAsync(() => {
      createComponent();
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalled();
      expect(plotlyServiceSpy.newPlot.calls.mostRecent().args[0] as HTMLElement).toBe(query('#tabPanelDiv'));
      const segment = lastTrace(plotlyServiceSpy.newPlot);
      expect(segment.x).toEqual([2.14, 6.58]);
      expect(segment.y).toEqual([180, 180]);
      expect(component.entropyChart.existingPoint).toBeTrue();
    }));

    it('plots only the dome and isobars when the plot is not valid', fakeAsync(() => {
      createComponent(false);
      expect(component.entropyChart.existingPoint).toBeFalsy();
      expect(lastTrace(plotlyServiceSpy.newPlot).name).toBe('Saturated');
    }));

    it('replaces the segment when the output changes', fakeAsync(() => {
      createComponent();
      const traceCount = component.entropyChart.data.length;
      fixture.componentRef.setInput('saturatedPropertiesOutput', makeOutput(200));
      fixture.detectChanges();
      expect(plotlyServiceSpy.update).toHaveBeenCalled();
      expect(lastTrace(plotlyServiceSpy.update).y).toEqual([200, 200]);
      expect(component.entropyChart.data.length).toBe(traceCount);
    }));

    it('removes the segment when reset toggles', fakeAsync(() => {
      createComponent();
      const traceCount = component.entropyChart.data.length;
      fixture.componentRef.setInput('toggleReset', true);
      fixture.detectChanges();
      expect(component.entropyChart.existingPoint).toBeFalse();
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
