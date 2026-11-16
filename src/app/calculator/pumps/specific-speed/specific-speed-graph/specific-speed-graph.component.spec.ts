import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PlotlyService } from 'angular-plotly.js';
import { SpecificSpeedGraphComponent } from './specific-speed-graph.component';
import { SpecificSpeedService } from '../specific-speed.service';
import { PsatService } from '../../../../psat/psat.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { TraceData } from '../../../../shared/models/plotting';

const EFFICIENCY_CORRECTION = 2;
const VERTICAL_TURBINE = 9;

function makeSpeedForm(values: { pumpType?: number, pumpRPM?: number, flowRate?: number, head?: number } = {}): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    pumpType: [values.pumpType ?? 0, Validators.required],
    pumpRPM: [values.pumpRPM ?? 1780, [Validators.required, Validators.min(0)]],
    flowRate: [values.flowRate ?? 2000, [Validators.required, Validators.min(0)]],
    head: [values.head ?? 277, [Validators.required, Validators.min(0)]],
  });
}

function expectedSpecificSpeed(form: UntypedFormGroup): number {
  const { pumpRPM, flowRate, head } = form.value;
  return Math.round(pumpRPM * Math.pow(flowRate, 0.5) / Math.pow(head, 0.75));
}

function makePlotlyChart() {
  return { on: jasmine.createSpy('on') };
}

describe('SpecificSpeedGraphComponent', () => {
  let component: SpecificSpeedGraphComponent;
  let fixture: ComponentFixture<SpecificSpeedGraphComponent>;
  let specificSpeedService: SpecificSpeedService;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let plotlyServiceSpy: jasmine.SpyObj<PlotlyService>;
  let speedForm: UntypedFormGroup;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getSummaryRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.data-summary tr')).slice(1) as Array<HTMLElement>;
  }

  function getCopyRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.hidden-copy-table tr')).slice(1) as Array<HTMLElement>;
  }

  function getCellTexts(row: HTMLElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => cell.textContent.trim());
  }

  function getDeleteLink(row: HTMLElement): HTMLElement | null {
    return row.querySelector('.delete-row a');
  }

  function lastPlottedTraces(): Array<TraceData> {
    return plotlyServiceSpy.newPlot.calls.mostRecent().args[1] as Array<TraceData>;
  }

  function lastPlottedElement(): HTMLElement {
    return plotlyServiceSpy.newPlot.calls.mostRecent().args[0] as HTMLElement;
  }

  function createComponent(form: UntypedFormGroup = makeSpeedForm()): void {
    speedForm = form;
    fixture = TestBed.createComponent(SpecificSpeedGraphComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('speedForm', speedForm);
    fixture.componentRef.setInput('resetData', true);
    fixture.componentRef.setInput('toggleCalculate', true);
    fixture.detectChanges();
  }

  function addSelectedPoint(x: number, y: number): void {
    component.createDataPoint({ points: [{ x, y }] });
    fixture.detectChanges();
  }

  beforeEach(async () => {
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['achievableEfficiency']);
    psatServiceSpy.achievableEfficiency.and.returnValue(EFFICIENCY_CORRECTION);
    plotlyServiceSpy = jasmine.createSpyObj('PlotlyService', ['newPlot']);
    plotlyServiceSpy.newPlot.and.callFake(() => Promise.resolve(makePlotlyChart()) as any);

    await TestBed.configureTestingModule({
      declarations: [SpecificSpeedGraphComponent],
      imports: [ReactiveFormsModule],
      providers: [
        SpecificSpeedService,
        { provide: ConvertUnitsService, useValue: jasmine.createSpyObj('ConvertUnitsService', ['value', 'roundVal']) },
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: PlotlyService, useValue: plotlyServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    specificSpeedService = TestBed.inject(SpecificSpeedService);
  });

  describe('initialization', () => {
    it('stores the current pump type from the form', () => {
      createComponent(makeSpeedForm({ pumpType: 3 }));
      expect(component.currentPumpType).toBe(3);
    });

    it('plots the line trace and the current specific speed point into the panel div', () => {
      createComponent();
      const specificSpeed = expectedSpecificSpeed(speedForm);
      const traces = lastPlottedTraces();
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
      expect(lastPlottedElement()).toBe(query('#tabPanelDiv'));
      expect(traces.length).toBe(2);
      expect(traces[0].x[0]).toBe(680);
      expect(traces[0].y.every(y => y === EFFICIENCY_CORRECTION)).toBeTrue();
      expect(traces[1].x).toEqual([specificSpeed]);
      expect(traces[1].y).toEqual([EFFICIENCY_CORRECTION]);
      expect(traces[1].name).toBe('Current Specific Speed');
      expect(psatServiceSpy.achievableEfficiency).toHaveBeenCalledWith(0, specificSpeed);
    });

    it('starts the line trace at the vertical turbine range for pump type 9', () => {
      createComponent(makeSpeedForm({ pumpType: VERTICAL_TURBINE }));
      expect(lastPlottedTraces()[0].x[0]).toBe(1720);
    });

    it('excludes line points whose efficiency correction exceeds 5.5', () => {
      psatServiceSpy.achievableEfficiency.and.callFake((pumpType: number, speed: number) => speed < 1000 ? 6 : 1);
      createComponent();
      const lineX = lastPlottedTraces()[0].x as Array<number>;
      expect(lineX.length).toBeGreaterThan(0);
      expect(lineX.every(x => x >= 1000)).toBeTrue();
    });

    it('publishes the chart and selected points to the service', () => {
      createComponent();
      expect(specificSpeedService.specificSpeedChart.getValue()).toBe(component.specificSpeedChart);
      expect(specificSpeedService.selectedDataPoints.getValue()).toBe(component.selectedDataPoints);
    });
  });

  describe('template: data summary rows', () => {
    it('renders the current specific speed as the only row', () => {
      createComponent();
      const rows = getSummaryRows();
      expect(rows.length).toBe(1);
      expect(getCellTexts(rows[0]).slice(1, 3)).toEqual([String(expectedSpecificSpeed(speedForm)), String(EFFICIENCY_CORRECTION)]);
    });

    it('hides the delete link on the current-speed row when the speed is valid', () => {
      createComponent();
      expect(component.validCurrentSpeed).toBeTrue();
      expect(getDeleteLink(getSummaryRows()[0])).toBeNull();
    });

    // pumpRPM 0 and head 0 give 0/0 = NaN, an invalid current specific speed
    function makeCurrentSpeedInvalid(): void {
      speedForm.controls.pumpRPM.setValue(0);
      speedForm.controls.head.setValue(0);
    }

    it('renders no rows and no current point when re-rendered with an invalid specific speed', () => {
      createComponent();
      makeCurrentSpeedInvalid();
      fixture.componentRef.setInput('resetData', false);
      fixture.detectChanges();
      expect(component.validCurrentSpeed).toBeFalse();
      expect(getSummaryRows().length).toBe(0);
      expect(getCopyRows().length).toBe(0);
      expect(lastPlottedTraces().length).toBe(1);
    });

    it('shows the delete link on the first row when the specific speed becomes invalid', () => {
      createComponent();
      makeCurrentSpeedInvalid();
      fixture.componentRef.setInput('toggleCalculate', false);
      fixture.detectChanges();
      const rows = getSummaryRows();
      expect(component.validCurrentSpeed).toBeFalse();
      expect(rows.length).toBe(1);
      expect(getDeleteLink(rows[0])).not.toBeNull();
    });

    it('shows the delete link on a clicked first row when the specific speed is invalid', () => {
      createComponent();
      makeCurrentSpeedInvalid();
      fixture.componentRef.setInput('resetData', false);
      fixture.detectChanges();
      addSelectedPoint(1000, 3);
      const rows = getSummaryRows();
      expect(rows.length).toBe(1);
      expect(getCellTexts(rows[0]).slice(1, 3)).toEqual(['1000', '3']);
      expect(getDeleteLink(rows[0])).not.toBeNull();
    });

    it('adds a row with a delete link for each clicked point', () => {
      createComponent();
      addSelectedPoint(1000, 3);
      addSelectedPoint(2000, 4);
      const rows = getSummaryRows();
      expect(rows.length).toBe(3);
      expect(getCellTexts(rows[1]).slice(1, 3)).toEqual(['1000', '3']);
      expect(getCellTexts(rows[2]).slice(1, 3)).toEqual(['2000', '4']);
      expect(getDeleteLink(rows[0])).toBeNull();
      expect(getDeleteLink(rows[1])).not.toBeNull();
      expect(getDeleteLink(rows[2])).not.toBeNull();
    });

    it('plots a marker trace for each clicked point', () => {
      createComponent();
      addSelectedPoint(1000, 3);
      const traces = lastPlottedTraces();
      expect(traces.length).toBe(3);
      expect(traces[2].x).toEqual([1000]);
      expect(traces[2].y).toEqual([3]);
      expect(traces[2].marker.color).toBe(component.selectedDataPoints[1].pointColor);
    });

    it('mirrors every row into the hidden copy table', () => {
      createComponent();
      addSelectedPoint(1000, 3);
      const copyRows = getCopyRows();
      expect(copyRows.length).toBe(2);
      expect(getCellTexts(copyRows[0])).toEqual([String(expectedSpecificSpeed(speedForm)), String(EFFICIENCY_CORRECTION)]);
      expect(getCellTexts(copyRows[1])).toEqual(['1000', '3']);
    });

    it('updates the table string from the hidden copy table', () => {
      createComponent();
      addSelectedPoint(1000, 3);
      component.updateTableString();
      expect(component.dataSummaryTableString).toContain('1000');
      expect(component.dataSummaryTableString).toContain('Efficiency Correction (%)');
    });

    it('removes the row and its trace when Delete is clicked', () => {
      createComponent();
      addSelectedPoint(1000, 3);
      addSelectedPoint(2000, 4);
      getDeleteLink(getSummaryRows()[1]).click();
      fixture.detectChanges();
      const rows = getSummaryRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[1]).slice(1, 3)).toEqual(['2000', '4']);
      expect(getCopyRows().length).toBe(2);
      expect(lastPlottedTraces().map(trace => trace.x[0])).not.toContain(1000);
      expect(specificSpeedService.selectedDataPoints.getValue().length).toBe(2);
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => createComponent());

    it('re-renders from fresh chart data when resetData changes', () => {
      addSelectedPoint(1000, 3);
      spyOn(specificSpeedService, 'initChartData').and.callThrough();
      fixture.componentRef.setInput('resetData', false);
      fixture.detectChanges();
      expect(specificSpeedService.initChartData).toHaveBeenCalled();
      expect(getSummaryRows().length).toBe(1);
      expect(lastPlottedTraces().length).toBe(2);
    });

    it('updates the current point when toggleCalculate changes with a valid form', () => {
      addSelectedPoint(1000, 3);
      speedForm.controls.pumpRPM.setValue(3560);
      fixture.componentRef.setInput('toggleCalculate', false);
      fixture.detectChanges();
      const rows = getSummaryRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[0])[1]).toBe(String(expectedSpecificSpeed(speedForm)));
      expect(lastPlottedTraces()[1].x).toEqual([expectedSpecificSpeed(speedForm)]);
    });

    it('re-renders the chart when switching to a vertical turbine', () => {
      addSelectedPoint(1000, 3);
      speedForm.controls.pumpType.setValue(VERTICAL_TURBINE);
      fixture.componentRef.setInput('toggleCalculate', false);
      fixture.detectChanges();
      expect(lastPlottedTraces()[0].x[0]).toBe(1720);
      expect(component.currentPumpType).toBe(VERTICAL_TURBINE);
    });

    it('re-renders the chart when switching away from a vertical turbine', () => {
      speedForm.controls.pumpType.setValue(VERTICAL_TURBINE);
      fixture.componentRef.setInput('toggleCalculate', false);
      fixture.detectChanges();
      speedForm.controls.pumpType.setValue(1);
      fixture.componentRef.setInput('toggleCalculate', true);
      fixture.detectChanges();
      expect(lastPlottedTraces()[0].x[0]).toBe(680);
      expect(component.currentPumpType).toBe(1);
    });

    it('does nothing when toggleCalculate changes with an invalid form', () => {
      plotlyServiceSpy.newPlot.calls.reset();
      speedForm.controls.head.setValue(null);
      fixture.componentRef.setInput('toggleCalculate', false);
      fixture.detectChanges();
      expect(plotlyServiceSpy.newPlot).not.toHaveBeenCalled();
    });
  });

  describe('template: expand and collapse', () => {
    beforeEach(() => createComponent());

    it('shows the expand button and hides the expanded chart by default', () => {
      expect(query('.fa-expand')).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('app-simple-tooltip').length).toBe(2);
      expect(query('.fa-compress')).toBeNull();
      expect(query('#expandedChartDiv')).toBeNull();
    });

    it('swaps to the expanded chart and plots into it when expanded', fakeAsync(() => {
      query('.fa-expand').click();
      fixture.detectChanges();
      tick(100);
      expect(component.expanded).toBeTrue();
      expect(query('.fa-expand')).toBeNull();
      expect(query('.fa-compress')).not.toBeNull();
      expect(query('#expandedChartDiv')).not.toBeNull();
      expect(fixture.nativeElement.querySelectorAll('app-simple-tooltip').length).toBe(2);
      expect(lastPlottedElement()).toBe(query('#expandedChartDiv'));
    }));

    it('returns to the panel chart when collapsed', fakeAsync(() => {
      query('.fa-expand').click();
      fixture.detectChanges();
      tick(100);
      query('.fa-compress').click();
      fixture.detectChanges();
      tick(100);
      expect(component.expanded).toBeFalse();
      expect(query('#expandedChartDiv')).toBeNull();
      expect(query('.fa-expand')).not.toBeNull();
      expect(lastPlottedElement()).toBe(query('#tabPanelDiv'));
    }));

    it('collapses on Escape while expanded', fakeAsync(() => {
      query('.fa-expand').click();
      fixture.detectChanges();
      tick(100);
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
      fixture.detectChanges();
      tick(100);
      expect(component.expanded).toBeFalse();
      expect(query('#expandedChartDiv')).toBeNull();
    }));
  });

  describe('toggleGrid', () => {
    it('flips both axes grid lines and replots', () => {
      createComponent();
      const showGrid = component.specificSpeedChart.layout.xaxis.showgrid;
      plotlyServiceSpy.newPlot.calls.reset();
      query('.fa-bar-chart').click();
      expect(component.specificSpeedChart.layout.xaxis.showgrid).toBe(!showGrid);
      expect(component.specificSpeedChart.layout.yaxis.showgrid).toBe(!showGrid);
      expect(plotlyServiceSpy.newPlot).toHaveBeenCalledTimes(1);
    });
  });

  describe('destroy', () => {
    it('stops listening for Escape after destroy', fakeAsync(() => {
      createComponent();
      component.expandChart();
      tick(100);
      const contractSpy = spyOn(component, 'contractChart');
      fixture.destroy();
      document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape' }));
      expect(contractSpy).not.toHaveBeenCalled();
    }));
  });
});
