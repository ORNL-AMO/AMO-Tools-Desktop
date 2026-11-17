import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { PlotlyService } from 'angular-plotly.js';
import { AchievableEfficiencyGraphComponent } from './achievable-efficiency-graph.component';
import { AchievableEfficiencyService } from '../achievable-efficiency.service';
import { PsatService } from '../../../../psat/psat.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;

function makeEfficiencyForm(overrides: Partial<Record<string, number>> = {}): UntypedFormGroup {
  const values = {
    pumpType: 6,
    flowRate: 2000,
    rpm: 2000,
    kinematicViscosity: 1.107,
    stageCount: 1,
    head: 137,
    pumpEfficiency: 100,
    ...overrides,
  };
  return new UntypedFormGroup({
    pumpType: new UntypedFormControl(values.pumpType, Validators.required),
    flowRate: new UntypedFormControl(values.flowRate, [Validators.required, Validators.min(0)]),
    rpm: new UntypedFormControl(values.rpm, Validators.required),
    kinematicViscosity: new UntypedFormControl(values.kinematicViscosity, [Validators.required, Validators.min(0)]),
    stageCount: new UntypedFormControl(values.stageCount, [Validators.required, Validators.min(1)]),
    head: new UntypedFormControl(values.head, [Validators.required, Validators.min(0.1)]),
    pumpEfficiency: new UntypedFormControl(values.pumpEfficiency, Validators.required),
  });
}

function makePlotlyChart() {
  return { on: jasmine.createSpy('on') };
}

describe('AchievableEfficiencyGraphComponent', () => {
  let component: AchievableEfficiencyGraphComponent;
  let fixture: ComponentFixture<AchievableEfficiencyGraphComponent>;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let plotlyServiceSpy: jasmine.SpyObj<PlotlyService>;
  let achievableEfficiencyService: AchievableEfficiencyService;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getSummaryRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.data-summary tbody tr:not(.no-border)'));
  }

  function getCopyRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.hidden-copy-table tbody tr:not(.no-border)'));
  }

  function getCellTexts(row: HTMLElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => cell.textContent.trim());
  }

  function getDeleteLink(row: HTMLElement): HTMLElement | null {
    return row.querySelector('.delete-row a');
  }

  function getInvalidMessage(): HTMLElement | null {
    return query('.data-summary .alert-danger');
  }

  function setEfficiencyResult(average: number, max: number): void {
    psatServiceSpy.pumpEfficiency.and.returnValue({ average: average, max: max } as any);
  }

  function createComponent(efficiencyForm: UntypedFormGroup = makeEfficiencyForm()): void {
    fixture = TestBed.createComponent(AchievableEfficiencyGraphComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('efficiencyForm', efficiencyForm);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('toggleCalculate', true);
    fixture.detectChanges();
  }

  function lastNewPlotArgs(): Array<any> {
    return plotlyServiceSpy.newPlot.calls.mostRecent().args as Array<any>;
  }

  beforeEach(async () => {
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['pumpEfficiency', 'roundVal']);
    psatServiceSpy.roundVal.and.callFake((val: number) => val);
    setEfficiencyResult(0.7, 0.8);
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot']);
    plotlyServiceSpy.newPlot.and.callFake(() => Promise.resolve(makePlotlyChart()) as any);
    const convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['value']);

    await TestBed.configureTestingModule({
      declarations: [AchievableEfficiencyGraphComponent],
      providers: [
        AchievableEfficiencyService,
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PlotlyService, useValue: plotlyServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    achievableEfficiencyService = TestBed.inject(AchievableEfficiencyService);
  });

  describe('initialization', () => {
    beforeEach(() => createComponent());

    it('sets the x axis title from the flow measurement', () => {
      expect(component.xAxisTitle).toBe('Flow Rate (gpm)');
      expect(query('.data-summary th:nth-child(2)').textContent.trim()).toBe('Flow Rate (gpm)');
    });

    it('plots into the panel chart div with the line and point traces', () => {
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      const [element, traceData, layout] = lastNewPlotArgs();
      expect(element).toBe(query('#tabPanelDiv'));
      expect(traceData.length).toBe(4);
      expect(traceData[2].x).toEqual([2000]);
      expect(traceData[2].y).toEqual([80]);
      expect(traceData[3].x).toEqual([2000]);
      expect(traceData[3].y).toEqual([70]);
      expect(layout.xaxis.title.text).toBe('Flow Rate (gpm)');
    });

    it('builds max and average line data at or below 100%', () => {
      const [, traceData] = lastNewPlotArgs();
      expect(traceData[0].x.length).toBeGreaterThan(0);
      expect(traceData[0].y.every((y: number) => y === 80)).toBeTrue();
      expect(traceData[1].y.every((y: number) => y === 70)).toBeTrue();
    });

    it('passes the form values to the efficiency calculation', () => {
      expect(psatServiceSpy.pumpEfficiency).toHaveBeenCalledWith(6, 2000, 2000, 1.107, 1, 137, 100, MOCK_SETTINGS);
    });

    it('saves the chart state to the service', () => {
      expect(achievableEfficiencyService.selectedDataPoints.getValue()).toBe(component.selectedDataPoints);
      expect(achievableEfficiencyService.efficiencyChart.getValue()).toBe(component.efficiencyChart);
    });
  });

  describe('data summary rows', () => {
    it('renders one row for the operating point when efficiency is valid', () => {
      createComponent();
      const rows = getSummaryRows();
      expect(rows.length).toBe(1);
      expect(getCellTexts(rows[0]).slice(1, 3)).toEqual(['2000', '70 - 80']);
    });

    it('mirrors the rows in the hidden copy table', () => {
      createComponent();
      const rows = getCopyRows();
      expect(rows.length).toBe(1);
      expect(getCellTexts(rows[0])).toEqual(['2000', '70 - 80']);
    });

    it('hides the delete link for the operating point when efficiency is valid', () => {
      createComponent();
      expect(getDeleteLink(getSummaryRows()[0])).toBeNull();
    });

    it('adds a row with a delete link for a clicked chart point', () => {
      createComponent();
      component.createDataPoints({ points: [{ x: 500 }] });
      fixture.detectChanges();

      const rows = getSummaryRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[1]).slice(1, 3)).toEqual(['500', '70 - 80']);
      expect(getDeleteLink(rows[0])).toBeNull();
      expect(getDeleteLink(rows[1]).textContent.trim()).toBe('Delete');
      expect(getCopyRows().length).toBe(2);
    });

    it('plots the clicked point traces', () => {
      createComponent();
      component.createDataPoints({ points: [{ x: 500 }] });
      const [, traceData] = lastNewPlotArgs();
      expect(traceData.length).toBe(6);
      expect(traceData[4].x).toEqual([500]);
      expect(traceData[4].y).toEqual([80]);
      expect(traceData[5].y).toEqual([70]);
    });

    it('removes the row and its traces when Delete is clicked', () => {
      createComponent();
      component.createDataPoints({ points: [{ x: 500 }] });
      component.createDataPoints({ points: [{ x: 900 }] });
      fixture.detectChanges();
      expect(getSummaryRows().length).toBe(3);

      getDeleteLink(getSummaryRows()[1]).click();
      fixture.detectChanges();

      const rows = getSummaryRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[1])[1]).toBe('900');
      const [, traceData] = lastNewPlotArgs();
      expect(traceData.length).toBe(6);
      expect(traceData[4].x).toEqual([900]);
    });
  });

  describe('invalid efficiency', () => {
    beforeEach(() => {
      createComponent();
      setEfficiencyResult(-0.1, 0.8);
      fixture.componentRef.setInput('toggleCalculate', false);
      fixture.detectChanges();
    });

    it('shows the invalid efficiency message', () => {
      expect(component.validEfficiency).toBeFalse();
      expect(getInvalidMessage().textContent.trim()).toBe('Efficiency at specified points is below zero; please check data inputs.');
    });

    it('renders no operating point row', () => {
      expect(getSummaryRows().length).toBe(0);
    });

    it('shows the delete link on the first row while efficiency is invalid', () => {
      component.selectedDataPoints.push({ id: 'a', x: 10, y: 20, avgMaxEffColumn: '1 - 2' });
      fixture.detectChanges();
      expect(getDeleteLink(getSummaryRows()[0])).not.toBeNull();
    });

    it('hides the invalid message once efficiency becomes valid', () => {
      setEfficiencyResult(0.7, 0.8);
      fixture.componentRef.setInput('toggleCalculate', true);
      fixture.detectChanges();
      expect(component.validEfficiency).toBeTrue();
      expect(getInvalidMessage()).toBeNull();
      expect(getSummaryRows().length).toBe(1);
    });
  });

  describe('recalculation', () => {
    beforeEach(() => createComponent());

    it('re-renders with new results when an input changes and the form is valid', () => {
      plotlyServiceSpy.newPlot.calls.reset();
      setEfficiencyResult(0.5, 0.6);
      fixture.componentRef.setInput('toggleCalculate', false);
      fixture.detectChanges();

      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      const [, traceData] = lastNewPlotArgs();
      expect(traceData[2].y).toEqual([60]);
      expect(getCellTexts(getSummaryRows()[0])[2]).toBe('50 - 60');
    });

    it('resets clicked points when the chart is recalculated', () => {
      component.createDataPoints({ points: [{ x: 500 }] });
      fixture.componentRef.setInput('toggleResetData', true);
      fixture.detectChanges();
      expect(getSummaryRows().length).toBe(1);
    });

    it('does not re-render when the form is invalid', () => {
      const form = makeEfficiencyForm();
      form.controls.rpm.setValue(null);
      plotlyServiceSpy.newPlot.calls.reset();
      fixture.componentRef.setInput('efficiencyForm', form);
      fixture.detectChanges();
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
    });
  });

  describe('expand and collapse', () => {
    beforeEach(() => createComponent());

    it('shows the expand control and hides the expanded chart by default', () => {
      expect(query('.fa-expand')).not.toBeNull();
      expect(query('.fa-compress')).toBeNull();
      expect(query('#expandedChartDiv')).toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.tab-panel-background app-simple-tooltip').length).toBe(2);
    });

    it('swaps to the collapse control and plots into the expanded div when expanded', fakeAsync(() => {
      query('.fa-expand').click();
      fixture.detectChanges();
      plotlyServiceSpy.newPlot.calls.reset();
      tick(100);

      expect(query('.fa-expand')).toBeNull();
      expect(query('.fa-compress')).not.toBeNull();
      expect(query('#expandedChartDiv')).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('.tab-panel-background app-simple-tooltip').length).toBe(1);
      expect(lastNewPlotArgs()[0]).toBe(query('#expandedChartDiv'));
    }));

    it('collapses back to the panel chart when the collapse control is clicked', fakeAsync(() => {
      query('.fa-expand').click();
      fixture.detectChanges();
      tick(100);

      query('.fa-compress').click();
      fixture.detectChanges();
      tick(100);

      expect(component.expanded).toBeFalse();
      expect(query('.fa-compress')).toBeNull();
      expect(query('#expandedChartDiv')).toBeNull();
      expect(lastNewPlotArgs()[0]).toBe(query('#tabPanelDiv'));
    }));

    it('collapses on Escape while expanded', fakeAsync(() => {
      component.expandChart();
      fixture.detectChanges();
      tick(100);

      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
      fixture.detectChanges();
      tick(100);

      expect(component.expanded).toBeFalse();
      expect(query('#expandedChartDiv')).toBeNull();
    }));
  });

  describe('grid toggle', () => {
    beforeEach(() => createComponent());

    it('toggles grid lines on both axes and re-plots', () => {
      plotlyServiceSpy.newPlot.calls.reset();
      query('.fa-bar-chart').click();
      const [, , layout] = lastNewPlotArgs();
      expect(layout.xaxis.showgrid).toBeFalse();
      expect(layout.yaxis.showgrid).toBeFalse();
    });
  });
});
