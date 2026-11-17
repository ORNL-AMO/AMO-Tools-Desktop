import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReplaceExistingResultsComponent } from './replace-existing-results.component';
import { ReplaceExistingResults } from '../../../../shared/models/calculators';

function makeResults(): ReplaceExistingResults {
  return {
    existingEnergyUse: 10000,
    existingEmissionOutput: undefined,
    newEnergyUse: 8000,
    newEnergyCost: 800,
    existingEnergyCost: 1000,
    newEmissionOutput: undefined,
    annualEnergySavings: 2000,
    costSavings: 200,
    simplePayback: 1.5,
    percentSavings: 20,
    rewoundEnergyUse: 11000,
    rewoundEmissionOutput: undefined,
    rewoundEnergyCost: 1100,
    incrementalSunkCost: 500,
    incrementalAnnualEnergySavings: 3000,
    incrementalCostDifference: 700,
    incrementalEnergyCostSavings: 300,
    incrementalSimplePayback: 2,
  };
}

describe('ReplaceExistingResultsComponent', () => {
  let component: ReplaceExistingResultsComponent;
  let fixture: ComponentFixture<ReplaceExistingResultsComponent>;

  function getTables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  // Per-cell text so whitespace inside the template doesn't matter.
  function getRowCells(table: HTMLTableElement, rowIndex: number): Array<string> {
    const row = table.querySelectorAll('tr')[rowIndex];
    return Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => cell.textContent.trim());
  }

  function getGroupLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label.group-label'))
      .map((label: HTMLElement) => label.textContent.trim());
  }

  function render(inTreasureHunt: boolean): void {
    fixture.componentRef.setInput('results', makeResults());
    fixture.componentRef.setInput('inTreasureHunt', inTreasureHunt);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReplaceExistingResultsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplaceExistingResultsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('keeps two columns outside treasure hunt', () => {
      render(false);
      expect(component.numCols).toBe(2);
    });

    it('uses one column in treasure hunt', () => {
      render(true);
      expect(component.numCols).toBe(1);
    });
  });

  describe('standalone calculator (not in treasure hunt)', () => {
    beforeEach(() => {
      render(false);
    });

    it('hides the percent savings graph', () => {
      expect(fixture.nativeElement.querySelector('app-percent-graph')).toBeNull();
    });

    it('renders the rewound motor column header', () => {
      expect(getRowCells(getTables()[0], 0)).toEqual(['', 'Existing Motor', 'Rewound Motor', 'New Motor']);
    });

    it('renders existing, rewound and new energy use and cost', () => {
      expect(getRowCells(getTables()[0], 1)).toEqual(['Energy Use', '10,000 kWh/yr', '11,000 kWh/yr', '8,000 kWh/yr']);
      expect(getRowCells(getTables()[0], 2)).toEqual(['Energy Cost', '$1,000 /yr', '$1,100 /yr', '$800 /yr']);
    });

    it('renders rewound and new savings and payback', () => {
      expect(getRowCells(getTables()[0], 3)).toEqual(['', 'Annual Energy Savings', '-1,000 kWh', '2,000 kWh']);
      expect(getRowCells(getTables()[0], 4)).toEqual(['', 'Cost Savings', '-$100 /yr', '$200 /yr']);
      expect(getRowCells(getTables()[0], 5)).toEqual(['', 'Simple Payback', '—', '1.5 yrs']);
    });

    it('renders the replace vs rewind incremental analysis table', () => {
      expect(getGroupLabels()).toEqual(['Savings Compared to Existing Motor', 'Replace vs. Rewind - Incremental Savings Analysis']);
      const incrementalTable = getTables()[1];
      expect(getTables().length).toBe(2);
      expect(getRowCells(incrementalTable, 0)).toEqual(['Sunk Cost', '$500.00']);
      expect(getRowCells(incrementalTable, 1)).toEqual(['Annual Energy Savings', '3,000 kWh']);
      expect(getRowCells(incrementalTable, 2)).toEqual(['Cost Difference', '$700']);
      expect(getRowCells(incrementalTable, 3)).toEqual(['Energy Cost Savings', '$300 /yr']);
      expect(getRowCells(incrementalTable, 4)).toEqual(['Simple Payback', '2 yrs']);
    });

    it('renders an exportable table for each results table', () => {
      expect(fixture.nativeElement.querySelectorAll('app-exportable-results-table').length).toBe(2);
    });
  });

  describe('in treasure hunt', () => {
    beforeEach(() => {
      render(true);
    });

    it('shows the percent savings graph', () => {
      expect(fixture.nativeElement.querySelector('app-percent-graph')).not.toBeNull();
      expect(fixture.nativeElement.textContent).toContain('Percent Savings');
    });

    it('omits the rewound motor column', () => {
      const table = getTables()[0];
      expect(getRowCells(table, 0)).toEqual(['', 'Existing Motor', 'New Motor']);
      expect(getRowCells(table, 1)).toEqual(['Energy Use', '10,000 kWh/yr', '8,000 kWh/yr']);
      expect(getRowCells(table, 2)).toEqual(['Energy Cost', '$1,000 /yr', '$800 /yr']);
    });

    it('renders only the new motor savings and payback', () => {
      const table = getTables()[0];
      expect(getRowCells(table, 3)).toEqual(['', 'Annual Energy Savings', '2,000 kWh']);
      expect(getRowCells(table, 4)).toEqual(['', 'Cost Savings', '$200 /yr']);
      expect(getRowCells(table, 5)).toEqual(['', 'Simple Payback', '1.5 yrs']);
    });

    it('hides the incremental analysis table, label and its exportable table', () => {
      expect(getTables().length).toBe(1);
      expect(getGroupLabels()).toEqual(['Savings Compared to Existing Motor']);
      expect(fixture.nativeElement.querySelectorAll('app-exportable-results-table').length).toBe(1);
    });
  });

  describe('user actions', () => {
    it('copies the savings table text into tableString', () => {
      render(false);
      component.updateTableString();
      expect(component.tableString).toContain('Existing Motor');
      expect(component.tableString).toContain('Simple Payback');
    });

    it('copies the incremental table text into table2String', () => {
      render(false);
      component.updateTable2String();
      expect(component.table2String).toContain('Sunk Cost');
    });
  });
});
