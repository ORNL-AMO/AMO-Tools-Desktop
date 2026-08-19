import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PsatReportGraphsComponent } from './psat-report-graphs.component';
import { PsatChartsService } from '../../services/psat-charts.service';
import { PSAT, PsatOutputs, PsatValid, Modification } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

const MOCK_SETTINGS: Settings = { powerMeasurement: 'kW' } as Settings;

function makeValid(overrides: Partial<PsatValid> = {}): PsatValid {
  return { isValid: true, pumpFluidValid: true, motorValid: true, fieldDataValid: true, ...overrides };
}

function makeOutputs(overrides: Partial<PsatOutputs> = {}): PsatOutputs {
  return {
    motor_power: 150,
    motor_efficiency: 95,
    motor_shaft_power: 140,
    mover_shaft_power: 135,
    pump_efficiency: 80,
    ...overrides,
  };
}

function makeModification(outputs: PsatOutputs, name = 'Modification 1', validOverrides: Partial<PsatValid> = {}): Modification {
  return {
    id: 'mod-1',
    psat: { name, outputs, valid: makeValid(validOverrides) },
  } as Modification;
}

function makePsat(outputs: PsatOutputs, modifications: Modification[] = []): PSAT {
  return { name: 'Baseline', outputs, modifications } as PSAT;
}

describe('PsatReportGraphsComponent', () => {
  let component: PsatReportGraphsComponent;
  let fixture: ComponentFixture<PsatReportGraphsComponent>;
  let chartsServiceSpy: jasmine.SpyObj<PsatChartsService>;

  beforeEach(() => {
    chartsServiceSpy = jasmine.createSpyObj('PsatChartsService', ['computeOutputGraphData']);
    chartsServiceSpy.computeOutputGraphData.and.callFake((outputs: PsatOutputs) => ({
      energyInput: outputs.motor_power,
      motorLoss: 10,
      driveLoss: 5,
      pumpLoss: 3,
      usefulOutput: outputs.motor_power - 18,
    }));

    TestBed.configureTestingModule({
      declarations: [PsatReportGraphsComponent],
      providers: [
        { provide: PsatChartsService, useValue: chartsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(PsatReportGraphsComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
    component.psat = makePsat(makeOutputs());
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('sets the bar chart y-axis label', () => {
      fixture.detectChanges();
      expect(component.barChartYAxisLabel).toBe('Power (kW)');
    });

    it('builds baseline chart data from the psat outputs via the charts service', () => {
      fixture.detectChanges();
      expect(chartsServiceSpy.computeOutputGraphData).toHaveBeenCalledWith(component.psat.outputs, MOCK_SETTINGS);
      expect(component.allChartData.length).toBe(1);
      expect(component.selectedBaselineData).toBe(component.allChartData[0]);
      expect(component.selectedBaselineData.valuesAndLabels).toEqual([
        { value: 10, label: 'Motor Losses' },
        { value: 5, label: 'Drive Losses' },
        { value: 3, label: 'Pump Losses' },
        { value: 132, label: 'Useful Output' },
      ]);
      expect(component.selectedBaselineData.barChartValues).toEqual([150, 10, 5, 3, 132]);
    });

    it('does not set selectedModificationData when there are no modifications', () => {
      fixture.detectChanges();
      expect(component.selectedModificationData).toBeUndefined();
    });

    it('adds one chart data entry per modification and selects the first as selectedModificationData', () => {
      const modOutputs = makeOutputs({ motor_power: 200 });
      component.psat = makePsat(makeOutputs(), [makeModification(modOutputs, 'Mod A')]);
      fixture.detectChanges();

      expect(component.allChartData.length).toBe(2);
      expect(component.allChartData[1].name).toBe('Mod A');
      expect(component.selectedModificationData).toBe(component.allChartData[1]);
      expect(chartsServiceSpy.computeOutputGraphData).toHaveBeenCalledWith(modOutputs, MOCK_SETTINGS);
    });

    it('marks a modification chart entry invalid when the modification psat is invalid', () => {
      const mod = makeModification(makeOutputs(), 'Invalid Mod', { isValid: false });
      component.psat = makePsat(makeOutputs(), [mod]);
      fixture.detectChanges();

      expect(component.allChartData[1].isValid).toBeFalse();
    });
  });

  describe('getValueArray', () => {
    it('returns the loss and useful-output values computed by the charts service', () => {
      fixture.detectChanges();
      const outputs = makeOutputs({ motor_power: 300 });
      expect(component.getValueArray(outputs)).toEqual([10, 5, 3, 282]);
    });
  });

  describe('template visibility', () => {
    it('shows the interactive graph layout when printView is false', () => {
      component.printView = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#selectedBaselineData')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-psat-report-graphs-print')).toBeNull();
    });

    it('shows the print component and hides the interactive layout when printView is true', () => {
      component.printView = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#selectedBaselineData')).toBeNull();
      expect(fixture.nativeElement.querySelector('app-psat-report-graphs-print')).not.toBeNull();
    });

    it('shows the baseline pie chart when selectedBaselineData is valid', () => {
      component.printView = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-plotly-pie-chart')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Invalid Baseline');
    });

    it('shows the invalid-baseline alert instead of the pie chart when the selected entry is invalid', () => {
      // The baseline dropdown can select any chart-data entry, including an invalid modification's.
      component.psat = makePsat(makeOutputs(), [makeModification(makeOutputs(), 'Invalid Mod', { isValid: false })]);
      fixture.detectChanges();
      component.selectedBaselineData = component.allChartData[1];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-plotly-pie-chart')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Invalid Baseline');
    });

    it('hides the modification column when there is no selectedModificationData', () => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#selectedModificationData')).toBeNull();
    });

    it('shows the modification column and bar chart when selectedModificationData is valid', () => {
      component.psat = makePsat(makeOutputs(), [makeModification(makeOutputs())]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#selectedModificationData')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-plotly-bar-chart')).not.toBeNull();
    });

    it('hides the bar chart when selectedModificationData is invalid, but still shows the modification column', () => {
      component.psat = makePsat(makeOutputs(), [makeModification(makeOutputs(), 'Invalid Mod', { isValid: false })]);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('#selectedModificationData')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-plotly-bar-chart')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Invalid Baseline');
    });
  });
});
