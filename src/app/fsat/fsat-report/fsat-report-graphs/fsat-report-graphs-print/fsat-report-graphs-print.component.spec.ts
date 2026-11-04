import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, Input, NO_ERRORS_SCHEMA } from '@angular/core';

import { FsatReportGraphsPrintComponent } from './fsat-report-graphs-print.component';
import { FSAT, FsatValid, Modification, Notes } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

@Component({ selector: 'app-plotly-pie-chart', template: '', standalone: false })
class PieChartStubComponent {
  @Input() valuesAndLabels: Array<{ value: number, label: string }>;
  @Input() valuesUnit: string;
  @Input() isPrint: boolean;
}

@Component({ selector: 'app-plotly-bar-chart', template: '', standalone: false })
class BarChartStubComponent {
  @Input() barChartDataArray: Array<{ name: string }>;
  @Input() yAxisLabel: string;
  @Input() hoverLabel: string;
  @Input() isPrint: boolean;
}

@Component({ selector: 'app-fsat-sankey', template: '', standalone: false })
class SankeyStubComponent {
  @Input() fsat: FSAT;
  @Input() settings: Settings;
  @Input() isBaseline: boolean;
  @Input() printView: boolean;
}

interface ChartData {
  name: string;
  valuesAndLabels: Array<{ value: number, label: string }>;
  barChartLabels: Array<string>;
  barChartValues: Array<number>;
  modification?: Modification;
  valid?: FsatValid;
}

const VALID: FsatValid = {
  isValid: true,
  fluidValid: true,
  fanValid: true,
  motorValid: true,
  fieldDataValid: true,
  fsatOperationsValid: true,
};

function makeChartData(name: string, seed: number, modification?: Modification, valid: FsatValid = VALID): ChartData {
  return {
    name,
    valuesAndLabels: [{ value: seed, label: 'Motor Losses' }, { value: seed + 1, label: 'Useful Output' }],
    barChartLabels: ['Energy Input', 'Motor Losses'],
    barChartValues: [seed + 2, seed + 3],
    modification,
    valid,
  };
}

function makeModification(name: string, notes?: Notes): Modification {
  return { id: name, fsat: { name, notes } as FSAT } as Modification;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FsatReportGraphsPrintComponent', () => {
  let component: FsatReportGraphsPrintComponent;
  let fixture: ComponentFixture<FsatReportGraphsPrintComponent>;
  const settings = { powerMeasurement: 'kW' } as Settings;
  const baselineFsat = { name: 'Baseline Fan' } as FSAT;

  function findStubs(tagName: string): DebugElement[] {
    return fixture.debugElement.queryAll(el => el.name === tagName);
  }

  function render(allChartData: ChartData[], printSankey = false) {
    component.allChartData = allChartData;
    component.settings = settings;
    component.fsat = baselineFsat;
    component.printSankey = printSankey;
    fixture.detectChanges();
  }

  function pages(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.print-graphs-container'));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FsatReportGraphsPrintComponent, PieChartStubComponent, BarChartStubComponent, SankeyStubComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatReportGraphsPrintComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and builds a single baseline summary when there are no modifications', () => {
      const baseline = makeChartData('Baseline Fan', 10);
      render([baseline]);

      expect(component).toBeTruthy();
      expect(component.scenarioSummaries.length).toBe(1);
      expect(component.scenarioSummaries[0].modificationGraphData).toBeUndefined();
      expect(component.scenarioSummaries[0].notes).toEqual([]);
      expect(component.scenarioSummaries[0].baselineGraphData.name).toBe('Baseline');
      expect(component.scenarioSummaries[0].baselineGraphData.valuesAndLabels).toBe(baseline.valuesAndLabels);
    });

    it('builds one summary per modification, each compared against the baseline', () => {
      const baseline = makeChartData('Baseline Fan', 10);
      const modA = makeChartData('Mod A', 20, makeModification('Mod A'));
      const modB = makeChartData('Mod B', 30, makeModification('Mod B'));
      render([baseline, modA, modB]);

      expect(component.scenarioSummaries.map(summary => summary.modificationGraphData)).toEqual([modA, modB]);
      component.scenarioSummaries.forEach(summary => {
        expect(summary.baselineGraphData.valuesAndLabels).toBe(baseline.valuesAndLabels);
      });
    });

    it('collects the modification notes with section labels', () => {
      render([
        makeChartData('Baseline Fan', 10),
        makeChartData('Mod A', 20, makeModification('Mod A', {
          fieldDataNotes: 'field', fanMotorNotes: 'motor', fanSetupNotes: 'setup', fluidNotes: 'fluid',
        })),
      ]);

      expect(component.scenarioSummaries[0].notes).toEqual([
        'Field Data - field',
        'Fan Motor - motor',
        'Fan Setup - setup',
        'Fluid - fluid',
      ]);
    });

    it('collects no notes for a modification without notes', () => {
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, makeModification('Mod A'))]);

      expect(component.scenarioSummaries[0].notes).toEqual([]);
    });
  });

  describe('template visibility: scenario pages (ngFor)', () => {
    it('renders one page for the baseline when there are no modifications', () => {
      render([makeChartData('Baseline Fan', 10)]);

      expect(pages().length).toBe(1);
    });

    it('renders one page per modification', () => {
      render([
        makeChartData('Baseline Fan', 10),
        makeChartData('Mod A', 20, makeModification('Mod A')),
        makeChartData('Mod B', 30, makeModification('Mod B')),
      ]);

      expect(pages().length).toBe(2);
      const titles = pages().map(page => normalize(page.querySelector('.print-page-title').textContent));
      expect(titles).toEqual(['Scenario: Mod A', 'Scenario: Mod B']);
    });
  });

  describe('template visibility: scenario title and notes', () => {
    it('hides the scenario title for the baseline-only page', () => {
      render([makeChartData('Baseline Fan', 10)]);

      expect(fixture.nativeElement.querySelector('.print-page-title')).toBeNull();
    });

    it('hides the notes section when the modification has no notes', () => {
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, makeModification('Mod A'))]);

      expect(fixture.nativeElement.querySelector('.print-mod-notes')).toBeNull();
    });

    it('shows one list item per note', () => {
      render([
        makeChartData('Baseline Fan', 10),
        makeChartData('Mod A', 20, makeModification('Mod A', { fluidNotes: 'fluid', fanMotorNotes: 'motor' })),
      ]);

      const notes = fixture.nativeElement.querySelector('.print-mod-notes');
      expect(normalize(notes.querySelector('.h3').textContent)).toBe('Scenario Notes:');
      const items = Array.from(notes.querySelectorAll('li')) as HTMLElement[];
      expect(items.map(li => normalize(li.textContent))).toEqual(['Fan Motor - motor', 'Fluid - fluid']);
    });
  });

  describe('template visibility: pie charts and alerts', () => {
    it('shows only the baseline pie chart, in print mode, for the baseline-only page', () => {
      const baseline = makeChartData('Baseline Fan', 10);
      render([baseline]);

      const pies = findStubs('app-plotly-pie-chart').map(el => el.componentInstance as PieChartStubComponent);
      expect(pies.length).toBe(1);
      expect(pies[0].valuesAndLabels).toBe(baseline.valuesAndLabels);
      expect(pies[0].valuesUnit).toBe('kW');
      expect(pies[0].isPrint).toBeTrue();
      expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    });

    it('shows baseline and modification pie charts and no alert for a valid modification', () => {
      const baseline = makeChartData('Baseline Fan', 10);
      const mod = makeChartData('Mod A', 20, makeModification('Mod A'));
      render([baseline, mod]);

      const pies = findStubs('app-plotly-pie-chart').map(el => el.componentInstance as PieChartStubComponent);
      expect(pies.length).toBe(2);
      expect(pies[0].valuesAndLabels).toBe(baseline.valuesAndLabels);
      expect(pies[1].valuesAndLabels).toBe(mod.valuesAndLabels);
      expect(fixture.nativeElement.querySelector('.alert-danger')).toBeNull();
    });

    it('shows the modification name beside its pie chart', () => {
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, makeModification('Mod A'))]);

      const titles = Array.from(fixture.nativeElement.querySelectorAll('.print-pie-width .h3')) as HTMLElement[];
      expect(titles.map(title => normalize(title.textContent))).toEqual(['Baseline', 'Mod A']);
    });

    it('shows the invalid alert listing every failing section instead of the modification pie chart', () => {
      const invalid: FsatValid = { ...VALID, isValid: false, fluidValid: false, fieldDataValid: false, fanValid: false, motorValid: false };
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, makeModification('Mod A'), invalid)]);

      expect(findStubs('app-plotly-pie-chart').length).toBe(1);
      const text = normalize(fixture.nativeElement.querySelector('.alert-danger').textContent);
      expect(text).toContain('Invalid modification');
      expect(text).toContain('Errors found in Fluid');
      expect(text).toContain('Errors found in Field Data');
      expect(text).toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
    });

    it('lists only the failing sections in the invalid alert', () => {
      const invalid: FsatValid = { ...VALID, isValid: false, motorValid: false, fieldDataValid: false };
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, makeModification('Mod A'), invalid)]);

      const text = normalize(fixture.nativeElement.querySelector('.alert-danger').textContent);
      expect(text).not.toContain('Errors found in Fluid');
      expect(text).toContain('Errors found in Field Data');
      expect(text).not.toContain('Errors found in Fan Setup');
      expect(text).toContain('Errors found in Motor');
    });
  });

  describe('template visibility: bar chart', () => {
    it('hides the bar chart for the baseline-only page', () => {
      render([makeChartData('Baseline Fan', 10)]);

      expect(findStubs('app-plotly-bar-chart').length).toBe(0);
    });

    it('shows the bar chart comparing baseline and modification for a valid modification', () => {
      const mod = makeChartData('Mod A', 20, makeModification('Mod A'));
      render([makeChartData('Baseline Fan', 10), mod]);

      const bars = findStubs('app-plotly-bar-chart').map(el => el.componentInstance as BarChartStubComponent);
      expect(bars.length).toBe(1);
      expect(bars[0].barChartDataArray.map(data => data.name)).toEqual(['Baseline', 'Mod A']);
      expect(bars[0].yAxisLabel).toBe('Power (kW)');
      expect(bars[0].hoverLabel).toBe('Power');
      expect(bars[0].isPrint).toBeTrue();
    });

    it('hides the bar chart for an invalid modification', () => {
      const invalid: FsatValid = { ...VALID, isValid: false, fluidValid: false };
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, makeModification('Mod A'), invalid)]);

      expect(findStubs('app-plotly-bar-chart').length).toBe(0);
    });
  });

  describe('template visibility: sankey diagrams', () => {
    it('hides the sankey diagrams when printSankey is false', () => {
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, makeModification('Mod A'))], false);

      expect(findStubs('app-fsat-sankey').length).toBe(0);
    });

    it('shows only the baseline sankey for the baseline-only page', () => {
      render([makeChartData('Baseline Fan', 10)], true);

      const sankeys = findStubs('app-fsat-sankey').map(el => el.componentInstance as SankeyStubComponent);
      expect(sankeys.length).toBe(1);
      expect(sankeys[0].fsat).toBe(baselineFsat);
      expect(sankeys[0].settings).toBe(settings);
      expect(sankeys[0].isBaseline).toBeTrue();
      expect(sankeys[0].printView).toBeTrue();
    });

    it('shows baseline and modification sankeys for each modification page', () => {
      const modA = makeModification('Mod A');
      const modB = makeModification('Mod B');
      render([makeChartData('Baseline Fan', 10), makeChartData('Mod A', 20, modA), makeChartData('Mod B', 30, modB)], true);

      const sankeys = findStubs('app-fsat-sankey').map(el => el.componentInstance as SankeyStubComponent);
      expect(sankeys.length).toBe(4);
      expect(sankeys.map(sankey => sankey.isBaseline)).toEqual([true, false, true, false]);
      expect(sankeys[1].fsat).toBe(modA.fsat);
      expect(sankeys[3].fsat).toBe(modB.fsat);
    });
  });
});
