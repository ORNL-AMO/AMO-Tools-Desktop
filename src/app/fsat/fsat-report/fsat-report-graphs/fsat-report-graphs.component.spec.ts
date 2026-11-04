import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, Input, NO_ERRORS_SCHEMA } from '@angular/core';

import { FsatReportGraphsComponent } from './fsat-report-graphs.component';
import { FsatChartsService, FsatGraphData } from '../../services/fsat-charts.service';
import { FSAT, FsatOutput, FsatValid, Modification } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';

@Component({ selector: 'app-plotly-pie-chart', template: '', standalone: false })
class PieChartStubComponent {
  @Input() valuesAndLabels: Array<{ value: number, label: string }>;
  @Input() valuesUnit: string;
}

@Component({ selector: 'app-plotly-bar-chart', template: '', standalone: false })
class BarChartStubComponent {
  @Input() barChartDataArray: Array<{ name: string }>;
  @Input() yAxisLabel: string;
  @Input() yValueUnit: string;
  @Input() hoverLabel: string;
}

@Component({ selector: 'app-fsat-report-graphs-print', template: '', standalone: false })
class PrintStubComponent {
  @Input() allChartData: Array<{ name: string }>;
  @Input() settings: Settings;
  @Input() printSankey: boolean;
  @Input() printGraphs: boolean;
  @Input() fsat: FSAT;
}

const VALID: FsatValid = {
  isValid: true,
  fluidValid: true,
  fanValid: true,
  motorValid: true,
  fieldDataValid: true,
  fsatOperationsValid: true,
};

function makeOutputs(motorPower: number): FsatOutput {
  return { motorPower } as FsatOutput;
}

function makeModification(name: string, motorPower: number, valid: FsatValid = VALID): Modification {
  return { id: name, fsat: { name, outputs: makeOutputs(motorPower), valid } as FSAT } as Modification;
}

function makeFsat(modifications?: Modification[]): FSAT {
  return { name: 'Baseline Fan', outputs: makeOutputs(100), valid: VALID, modifications } as FSAT;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FsatReportGraphsComponent', () => {
  let component: FsatReportGraphsComponent;
  let fixture: ComponentFixture<FsatReportGraphsComponent>;
  let chartsServiceSpy: jasmine.SpyObj<FsatChartsService>;
  const settings = { powerMeasurement: 'kW' } as Settings;

  function findStubs(tagName: string): DebugElement[] {
    return fixture.debugElement.queryAll(el => el.name === tagName);
  }

  function pieCharts(): PieChartStubComponent[] {
    return findStubs('app-plotly-pie-chart').map(el => el.componentInstance as PieChartStubComponent);
  }

  function barCharts(): BarChartStubComponent[] {
    return findStubs('app-plotly-bar-chart').map(el => el.componentInstance as BarChartStubComponent);
  }

  function render(fsat: FSAT, inputs: { printView?: boolean, printSankey?: boolean, printGraphs?: boolean } = {}) {
    component.fsat = fsat;
    component.settings = settings;
    component.printView = inputs.printView;
    component.printSankey = inputs.printSankey;
    component.printGraphs = inputs.printGraphs;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    chartsServiceSpy = jasmine.createSpyObj('FsatChartsService', ['computeOutputGraphData']);
    chartsServiceSpy.computeOutputGraphData.and.callFake((outputs: FsatOutput): Omit<FsatGraphData, 'name'> => ({
      energyInput: outputs.motorPower,
      motorLoss: outputs.motorPower * 0.1,
      driveLoss: outputs.motorPower * 0.2,
      fanLoss: outputs.motorPower * 0.3,
      usefulOutput: outputs.motorPower * 0.4,
    }));

    await TestBed.configureTestingModule({
      declarations: [FsatReportGraphsComponent, PieChartStubComponent, BarChartStubComponent, PrintStubComponent],
      providers: [{ provide: FsatChartsService, useValue: chartsServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatReportGraphsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and computes graph data for the baseline', () => {
      const fsat = makeFsat([]);
      render(fsat);

      expect(component).toBeTruthy();
      expect(chartsServiceSpy.computeOutputGraphData).toHaveBeenCalledWith(fsat.outputs, settings);
      expect(component.allChartData.length).toBe(1);
      expect(component.selectedBaselineData).toBe(component.allChartData[0]);
      expect(component.selectedModificationData).toBeUndefined();
    });

    it('computes graph data for every modification and selects the first one', () => {
      const first = makeModification('Mod A', 80);
      const second = makeModification('Mod B', 60);
      render(makeFsat([first, second]));

      expect(chartsServiceSpy.computeOutputGraphData).toHaveBeenCalledWith(first.fsat.outputs, settings);
      expect(chartsServiceSpy.computeOutputGraphData).toHaveBeenCalledWith(second.fsat.outputs, settings);
      expect(component.allChartData.map(data => data.name)).toEqual(['Baseline Fan', 'Mod A', 'Mod B']);
      expect(component.selectedModificationData).toBe(component.allChartData[1]);
    });

    it('builds the chart data values and labels from the computed graph data', () => {
      render(makeFsat([]));

      expect(component.allChartData[0].valuesAndLabels).toEqual([
        { value: 10, label: 'Motor Losses' },
        { value: 20, label: 'Drive Losses' },
        { value: 30, label: 'Fan Losses' },
        { value: 40, label: 'Useful Output' },
      ]);
      expect(component.allChartData[0].barChartLabels).toEqual(['Energy Input', 'Motor Losses', 'Drive Losses', 'Fan Losses', 'Useful Output']);
      expect(component.allChartData[0].barChartValues).toEqual([100, 10, 20, 30, 40]);
    });
  });

  describe('template visibility: print view', () => {
    it('shows the charts and hides the print component when not in print view', () => {
      render(makeFsat([]), { printView: false });

      expect(findStubs('app-plotly-pie-chart').length).toBe(1);
      expect(findStubs('app-fsat-report-graphs-print').length).toBe(0);
    });

    it('shows only the print component with the chart data and print options in print view', () => {
      const fsat = makeFsat([makeModification('Mod A', 80)]);
      render(fsat, { printView: true, printSankey: true, printGraphs: false });

      expect(findStubs('app-plotly-pie-chart').length).toBe(0);
      expect(findStubs('app-plotly-bar-chart').length).toBe(0);
      expect(fixture.nativeElement.querySelector('select')).toBeNull();
      const print = findStubs('app-fsat-report-graphs-print');
      expect(print.length).toBe(1);
      const printComponent = print[0].componentInstance as PrintStubComponent;
      expect(printComponent.allChartData).toBe(component.allChartData);
      expect(printComponent.fsat).toBe(fsat);
      expect(printComponent.settings).toBe(settings);
      expect(printComponent.printSankey).toBeTrue();
      expect(printComponent.printGraphs).toBeFalse();
    });
  });

  describe('template visibility: baseline column', () => {
    it('lists one option per scenario in the baseline selector', () => {
      render(makeFsat([makeModification('Mod A', 80), makeModification('Mod B', 60)]));

      const options = Array.from(fixture.nativeElement.querySelectorAll('#selectedBaselineData option')) as HTMLElement[];
      expect(options.map(option => normalize(option.textContent))).toEqual(['Baseline Fan', 'Mod A', 'Mod B']);
    });

    it('lists only the baseline in the selector when there are no modifications', () => {
      render(makeFsat([]));

      expect(fixture.nativeElement.querySelectorAll('#selectedBaselineData option').length).toBe(1);
    });

    it('passes the selected baseline data to the first pie chart', () => {
      render(makeFsat([makeModification('Mod A', 80)]));

      expect(pieCharts()[0].valuesAndLabels).toBe(component.selectedBaselineData.valuesAndLabels);
      expect(pieCharts()[0].valuesUnit).toBe('kW');
    });
  });

  describe('template visibility: modification column', () => {
    it('hides the modification selector, pie chart, and bar chart when there are no modifications', () => {
      render(makeFsat([]));

      expect(fixture.nativeElement.querySelector('#selectedModificationData')).toBeNull();
      expect(pieCharts().length).toBe(1);
      expect(barCharts().length).toBe(0);
    });

    it('hides the modification column when modifications is undefined', () => {
      render(makeFsat(undefined));

      expect(fixture.nativeElement.querySelector('#selectedModificationData')).toBeNull();
      expect(barCharts().length).toBe(0);
    });

    it('lists one option per scenario in the modification selector', () => {
      render(makeFsat([makeModification('Mod A', 80), makeModification('Mod B', 60)]));

      const options = Array.from(fixture.nativeElement.querySelectorAll('#selectedModificationData option')) as HTMLElement[];
      expect(options.map(option => normalize(option.textContent))).toEqual(['Baseline Fan', 'Mod A', 'Mod B']);
    });

    it('shows the modification pie chart and bar chart and no alert for a valid modification', () => {
      render(makeFsat([makeModification('Mod A', 80)]));

      expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
      const pies = pieCharts();
      expect(pies.length).toBe(2);
      expect(pies[1].valuesAndLabels).toBe(component.selectedModificationData.valuesAndLabels);
      const bars = barCharts();
      expect(bars.length).toBe(1);
      expect(bars[0].barChartDataArray).toEqual([component.selectedBaselineData, component.selectedModificationData]);
      expect(bars[0].yAxisLabel).toBe('Power (kW)');
      expect(bars[0].yValueUnit).toBe('kW');
      expect(bars[0].hoverLabel).toBe('Power');
    });

    it('hides the modification pie chart and bar chart and shows the alert for an invalid modification', () => {
      const invalid: FsatValid = { ...VALID, isValid: false, fluidValid: false, fieldDataValid: false, fanValid: false, motorValid: false };
      render(makeFsat([makeModification('Mod A', 80, invalid)]));

      expect(pieCharts().length).toBe(1);
      expect(barCharts().length).toBe(0);
      const text = normalize(fixture.nativeElement.querySelector('.alert-danger').textContent);
      expect(text).toContain('Invalid modification');
      expect(text).toContain('Errors found in Fluid');
      expect(text).toContain('Errors found in Field Data');
      expect(text).toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
    });

    it('lists only the failing sections in the invalid modification alert', () => {
      const invalid: FsatValid = { ...VALID, isValid: false, fanValid: false };
      render(makeFsat([makeModification('Mod A', 80, invalid)]));

      const text = normalize(fixture.nativeElement.querySelector('.alert-danger').textContent);
      expect(text).not.toContain('Errors found in Fluid');
      expect(text).not.toContain('Errors found in Field Data');
      expect(text).toContain('Errors found in Fan Setup');
      expect(text).not.toContain('Errors found in Motor');
    });
  });
});
