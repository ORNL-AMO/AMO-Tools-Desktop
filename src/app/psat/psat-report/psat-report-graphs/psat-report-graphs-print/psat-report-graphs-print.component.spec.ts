import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PsatReportGraphsPrintComponent } from './psat-report-graphs-print.component';
import { Modification, Notes, PSAT } from '../../../../shared/models/psat';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS: Settings = { powerMeasurement: 'kW' } as Settings;

interface ChartDataEntry {
  name: string;
  valuesAndLabels: Array<{ value: number, label: string }>;
  barChartLabels: Array<string>;
  barChartValues: Array<number>;
  modification?: Modification;
  isValid: boolean;
}

function makeBaselineEntry(overrides: Partial<ChartDataEntry> = {}): ChartDataEntry {
  return {
    name: 'Baseline',
    valuesAndLabels: [{ value: 10, label: 'Motor Losses' }],
    barChartLabels: ['Energy Input', 'Motor Losses'],
    barChartValues: [150, 10],
    isValid: true,
    ...overrides,
  };
}

function makeModification(notes: Notes = {}): Modification {
  return { id: 'mod-1', notes, psat: {} as PSAT } as Modification;
}

function makeModificationEntry(overrides: Partial<ChartDataEntry> = {}): ChartDataEntry {
  return {
    name: 'Modification 1',
    valuesAndLabels: [{ value: 8, label: 'Motor Losses' }],
    barChartLabels: ['Energy Input', 'Motor Losses'],
    barChartValues: [140, 8],
    modification: makeModification(),
    isValid: true,
    ...overrides,
  };
}

describe('PsatReportGraphsPrintComponent', () => {
  let component: PsatReportGraphsPrintComponent;
  let fixture: ComponentFixture<PsatReportGraphsPrintComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PsatReportGraphsPrintComponent],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(PsatReportGraphsPrintComponent);
    component = fixture.componentInstance;
    component.settings = MOCK_SETTINGS;
    component.printSankey = false;
    component.psat = { name: 'Baseline' } as PSAT;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      component.allChartData = [makeBaselineEntry()];
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('builds a single scenario summary with no modification data when there are no modifications', () => {
      component.allChartData = [makeBaselineEntry()];
      fixture.detectChanges();

      expect(component.scenarioSummaries.length).toBe(1);
      expect(component.scenarioSummaries[0].modificationGraphData).toBeUndefined();
      expect(component.scenarioSummaries[0].notes).toEqual([]);
      expect(component.scenarioSummaries[0].baselineGraphData.name).toBe('Baseline');
    });

    it('builds one scenario summary per modification when modifications exist', () => {
      const modEntryA = makeModificationEntry({ name: 'Mod A' });
      const modEntryB = makeModificationEntry({ name: 'Mod B' });
      component.allChartData = [makeBaselineEntry(), modEntryA, modEntryB];
      fixture.detectChanges();

      expect(component.scenarioSummaries.length).toBe(2);
      expect(component.scenarioSummaries[0].modificationGraphData).toBe(modEntryA);
      expect(component.scenarioSummaries[1].modificationGraphData).toBe(modEntryB);
      expect(component.scenarioSummaries[0].baselineGraphData.name).toBe('Baseline');
    });

    it('collects modification notes in priority order: system basics, pump fluid, motor, field data', () => {
      const modEntry = makeModificationEntry({
        modification: makeModification({ pumpFluidNotes: 'Pump note', motorNotes: 'Motor note' }),
      });
      component.allChartData = [makeBaselineEntry(), modEntry];
      fixture.detectChanges();

      expect(component.scenarioSummaries[0].notes).toEqual(['Pump Fluid - Pump note']);
    });

    it('produces no notes when the modification has no notes set', () => {
      const modEntry = makeModificationEntry({ modification: makeModification({}) });
      component.allChartData = [makeBaselineEntry(), modEntry];
      fixture.detectChanges();

      expect(component.scenarioSummaries[0].notes).toEqual([]);
    });
  });

  describe('template visibility', () => {
    it('hides the scenario title when there is no modification data', () => {
      component.allChartData = [makeBaselineEntry()];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Scenario:');
    });

    it('shows the scenario title with the modification name when modification data exists', () => {
      component.allChartData = [makeBaselineEntry(), makeModificationEntry({ name: 'Mod A' })];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Scenario: Mod A');
    });

    it('hides the scenario notes block when there are no notes', () => {
      component.allChartData = [makeBaselineEntry(), makeModificationEntry({ modification: makeModification({}) })];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).not.toContain('Scenario Notes:');
    });

    it('shows the scenario notes block when notes exist', () => {
      const modEntry = makeModificationEntry({ modification: makeModification({ motorNotes: 'Motor note' }) });
      component.allChartData = [makeBaselineEntry(), modEntry];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Scenario Notes:');
      expect(fixture.nativeElement.textContent).toContain('Motor- Motor note');
    });

    it('shows the modification pie chart and bar chart when the modification is valid', () => {
      component.allChartData = [makeBaselineEntry(), makeModificationEntry({ isValid: true })];
      fixture.detectChanges();
      const pieCharts = fixture.nativeElement.querySelectorAll('app-plotly-pie-chart');
      expect(pieCharts.length).toBe(2); // baseline + modification
      expect(fixture.nativeElement.querySelector('app-plotly-bar-chart')).not.toBeNull();
      expect(fixture.nativeElement.textContent).not.toContain('Scenario Setup is Invalid');
    });

    it('shows the invalid-setup alert and hides the modification chart and bar chart when the modification is invalid', () => {
      component.allChartData = [makeBaselineEntry(), makeModificationEntry({ isValid: false })];
      fixture.detectChanges();
      const pieCharts = fixture.nativeElement.querySelectorAll('app-plotly-pie-chart');
      expect(pieCharts.length).toBe(1); // baseline only
      expect(fixture.nativeElement.querySelector('app-plotly-bar-chart')).toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Scenario Setup is Invalid');
    });

    it('shows the baseline pie chart even with no modification data', () => {
      component.allChartData = [makeBaselineEntry()];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-plotly-pie-chart').length).toBe(1);
      expect(fixture.nativeElement.querySelector('app-plotly-bar-chart')).toBeNull();
    });

    it('hides sankey diagrams when printSankey is false', () => {
      component.printSankey = false;
      component.allChartData = [makeBaselineEntry(), makeModificationEntry()];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-psat-sankey')).toBeNull();
    });

    it('shows the baseline sankey diagram, and the modification sankey when modification data exists, when printSankey is true', () => {
      component.printSankey = true;
      component.allChartData = [makeBaselineEntry(), makeModificationEntry()];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-psat-sankey').length).toBe(2);
    });

    it('shows only the baseline sankey diagram when printSankey is true but there is no modification data', () => {
      component.printSankey = true;
      component.allChartData = [makeBaselineEntry()];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('app-psat-sankey').length).toBe(1);
    });

    it('renders one print-graphs-container per scenario summary', () => {
      component.allChartData = [makeBaselineEntry(), makeModificationEntry({ name: 'Mod A' }), makeModificationEntry({ name: 'Mod B' })];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.print-graphs-container').length).toBe(2);
    });
  });
});
