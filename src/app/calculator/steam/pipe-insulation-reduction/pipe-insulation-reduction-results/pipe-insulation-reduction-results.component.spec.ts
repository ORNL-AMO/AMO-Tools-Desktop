import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PipeInsulationReductionResultsComponent } from './pipe-insulation-reduction-results.component';
import { PipeInsulationReductionResults } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

function makeResults(heatedOrChilled: number = 0, withModification: boolean = true): PipeInsulationReductionResults {
  return {
    baselineResults: { heatLength: 1, annualHeatLoss: 1500, energyCost: 6000, energySourceType: 0, heatedOrChilled: heatedOrChilled },
    modificationResults: withModification ? { heatLength: 1, annualHeatLoss: 500, energyCost: 2000, energySourceType: 0, heatedOrChilled: heatedOrChilled } : undefined,
    annualHeatSavings: 1000,
    annualCostSavings: 4000,
    energyUnit: 'MMBtu'
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('PipeInsulationReductionResultsComponent', () => {
  let component: PipeInsulationReductionResultsComponent;
  let fixture: ComponentFixture<PipeInsulationReductionResultsComponent>;

  function createComponent(results: PipeInsulationReductionResults): void {
    fixture = TestBed.createComponent(PipeInsulationReductionResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', { unitsOfMeasure: 'Imperial' } as Settings);
    fixture.componentRef.setInput('results', results);
    fixture.componentRef.setInput('modificationExists', true);
    fixture.detectChanges();
  }

  function rowCells(rowIndex: number): Array<string> {
    const row = fixture.nativeElement.querySelectorAll('table tbody tr')[rowIndex];
    return Array.from(row.querySelectorAll(':scope > td')).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PipeInsulationReductionResultsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('heat loss / gain label', () => {
    it('labels the first row Heat Loss when heated', () => {
      createComponent(makeResults(0));
      expect(rowCells(1)[0]).toBe('Heat Loss');
      expect(rowCells(1).length).toBe(3);
    });

    it('labels the first row Heat Gain when chilled', () => {
      createComponent(makeResults(1));
      expect(rowCells(1)[0]).toBe('Heat Gain');
      expect(rowCells(1).length).toBe(3);
    });
  });

  describe('modification results', () => {
    it('renders modification values and savings when modification results exist', () => {
      createComponent(makeResults(0, true));
      expect(rowCells(1).slice(1)).toEqual(['1,500 MMBtu', '500 MMBtu']);
      expect(rowCells(2).slice(1)).toEqual(['$6,000', '$2,000']);
      expect(rowCells(3).slice(1)).toEqual(['1,000 MMBtu']);
      expect(rowCells(4).slice(1)).toEqual(['$4,000']);
    });

    it('renders dashes when modification results are missing', () => {
      createComponent(makeResults(0, false));
      expect(rowCells(1).slice(1)).toEqual(['1,500 MMBtu', '—']);
      expect(rowCells(2).slice(1)).toEqual(['$6,000', '—']);
      expect(rowCells(3).slice(1)).toEqual(['—']);
      expect(rowCells(4).slice(1)).toEqual(['—']);
    });
  });

  describe('copy table', () => {
    it('captures the table text', () => {
      createComponent(makeResults());
      component.updateTable0String();
      expect(component.table0String).toContain('Baseline');
    });
  });
});
