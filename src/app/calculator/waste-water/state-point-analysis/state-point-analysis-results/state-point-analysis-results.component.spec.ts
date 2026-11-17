import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StatePointAnalysisResultsComponent } from './state-point-analysis-results.component';
import { StatePointAnalysisService } from '../state-point-analysis.service';
import { StatePointAnalysisOutput, StatePointAnalysisResults } from '../../../../shared/models/waste-water';
import { Settings } from '../../../../shared/models/settings';

function makeResults(overrides: Partial<StatePointAnalysisResults> = {}): StatePointAnalysisResults {
  return {
    SurfaceOverflow: 0,
    AppliedSolidsLoading: 0,
    TotalAreaClarifier: 0,
    RasConcentration: 0,
    UnderFlowRateX2: 0,
    UnderFlowRateY1: 0,
    OverFlowRateX2: 0,
    OverFlowRateY2: 0,
    StatePointX: 0,
    StatePointY: 0,
    ...overrides,
  };
}

function makeOutput(): StatePointAnalysisOutput {
  return {
    baseline: makeResults({ TotalAreaClarifier: 1234.4, SurfaceOverflow: 12.3, AppliedSolidsLoading: 0.1234, RasConcentration: 5000.5 }),
    modification: makeResults({ TotalAreaClarifier: 2000, SurfaceOverflow: 6.5, AppliedSolidsLoading: 0.05, RasConcentration: 4000 }),
    sviParameterName: 'SVIGN',
  };
}

// Row index in the results table (row 0 is the column header), the result key, and the
// formatted baseline/modification values from makeOutput(), plus each unit label variant.
const RESULT_ROWS: Array<{ row: number, key: keyof StatePointAnalysisResults, baseline: string, modification: string, imperial: string, metric: string }> = [
  { row: 1, key: 'TotalAreaClarifier', baseline: '1,234', modification: '2,000', imperial: '(ft2)', metric: '(m2)' },
  { row: 2, key: 'SurfaceOverflow', baseline: '12.3', modification: '6.5', imperial: '(gal/ft2d)', metric: '(L/m2d)' },
  { row: 3, key: 'AppliedSolidsLoading', baseline: '0.1234', modification: '0.05', imperial: '(lb/ft2d)', metric: '(kg/m2d)' },
  { row: 4, key: 'RasConcentration', baseline: '5,000.5', modification: '4,000', imperial: '(mg/L)', metric: '(mg/L)' },
];

describe('StatePointAnalysisResultsComponent', () => {
  let component: StatePointAnalysisResultsComponent;
  let fixture: ComponentFixture<StatePointAnalysisResultsComponent>;
  let serviceMock: { output: BehaviorSubject<StatePointAnalysisOutput> };

  function getCells(row: number): Array<string> {
    const rowEl: HTMLTableRowElement = fixture.nativeElement.querySelectorAll('table tr')[row];
    return Array.from(rowEl.querySelectorAll('td')).map(cell => cell.textContent.replace(/\s+/g, ' ').trim());
  }

  function render(unitsOfMeasure: string, modificationExists: boolean): void {
    const settings: Settings = { unitsOfMeasure: unitsOfMeasure };
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('modificationExists', modificationExists);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceMock = { output: new BehaviorSubject<StatePointAnalysisOutput>(makeOutput()) };
    await TestBed.configureTestingModule({
      declarations: [StatePointAnalysisResultsComponent],
      providers: [{ provide: StatePointAnalysisService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(StatePointAnalysisResultsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('reads the output from the service', () => {
      render('Imperial', true);
      expect(component.output).toBe(serviceMock.output.getValue());
    });
  });

  describe('output rendering', () => {
    RESULT_ROWS.forEach(({ row, key, baseline, modification }) => {
      it(`renders the baseline and modification ${key}`, () => {
        render('Imperial', true);
        const cells = getCells(row);
        expect(cells[1]).toBe(baseline);
        expect(cells[2]).toBe(modification);
      });

      it(`renders a dash for a zero baseline and modification ${key}`, () => {
        const output = makeOutput();
        output.baseline[key as string] = 0;
        output.modification[key as string] = 0;
        serviceMock.output.next(output);
        render('Imperial', true);
        const cells = getCells(row);
        expect(cells[1]).toBe('—');
        expect(cells[2]).toBe('—');
      });
    });

    it('renders updated values when the output changes', () => {
      render('Imperial', true);
      const output = makeOutput();
      output.baseline.TotalAreaClarifier = 50;
      serviceMock.output.next(output);
      fixture.detectChanges();
      expect(getCells(1)[1]).toBe('50');
    });
  });

  describe('template visibility', () => {
    RESULT_ROWS.forEach(({ row, key, imperial, metric }) => {
      it(`shows the imperial ${key} units only for imperial settings`, () => {
        render('Imperial', true);
        expect(getCells(row)[0]).toContain(imperial);
        if (imperial !== metric) {
          expect(getCells(row)[0]).not.toContain(metric);
        }
      });

      it(`shows the metric ${key} units only for metric settings`, () => {
        render('Metric', true);
        expect(getCells(row)[0]).toContain(metric);
        if (imperial !== metric) {
          expect(getCells(row)[0]).not.toContain(imperial);
        }
      });
    });

    it('shows the exportable results table when a modification exists', () => {
      render('Imperial', true);
      expect(fixture.nativeElement.querySelector('app-exportable-results-table')).not.toBeNull();
    });

    it('hides the exportable results table when no modification exists', () => {
      render('Imperial', false);
      expect(fixture.nativeElement.querySelector('app-exportable-results-table')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('copies the results table text for export', () => {
      render('Imperial', true);
      component.updateTableString();
      expect(component.tableString).toContain('Total Clarifier Area');
      expect(component.tableString).toContain('1,234');
    });
  });

  describe('destroy', () => {
    it('stops reading the output after destroy', () => {
      render('Imperial', true);
      const outputBeforeDestroy = component.output;
      fixture.destroy();
      serviceMock.output.next(makeOutput());
      expect(component.output).toBe(outputBeforeDestroy);
    });
  });
});
