import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TankInsulationReductionResultsComponent } from './tank-insulation-reduction-results.component';
import { Settings } from '../../../../shared/models/settings';
import { TankInsulationReductionResults } from '../../../../shared/models/standalone';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

function makeResults(withModification: boolean = true, energyUnit: string = 'MMBtu'): TankInsulationReductionResults {
  return {
    baselineResults: { heatLoss: 10, annualHeatLoss: 1234.5678, energyCost: 5000 },
    modificationResults: withModification ? { heatLoss: 4, annualHeatLoss: 400.25, energyCost: 1500.5 } : undefined,
    annualHeatSavings: 834.3178,
    annualCostSavings: 3499.5,
    energyUnit: energyUnit
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('TankInsulationReductionResultsComponent', () => {
  let component: TankInsulationReductionResultsComponent;
  let fixture: ComponentFixture<TankInsulationReductionResultsComponent>;

  function render(results: TankInsulationReductionResults, modificationExists: boolean = true): void {
    fixture.componentRef.setInput('settings', IMPERIAL_SETTINGS);
    fixture.componentRef.setInput('modificationExists', modificationExists);
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
  }

  function getRowCells(label: string): Array<string> {
    const rows: Array<HTMLTableRowElement> = Array.from(fixture.nativeElement.querySelectorAll('table tr'));
    const row = rows.find(tr => normalize(tr.cells[0].textContent) === label);
    return Array.from(row.cells).slice(1).map(cell => normalize(cell.textContent));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TankInsulationReductionResultsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TankInsulationReductionResultsComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      render(makeResults());
      expect(component).toBeTruthy();
    });
  });

  describe('result rendering', () => {
    it('renders baseline, modification and savings values with the energy unit', () => {
      render(makeResults());
      expect(getRowCells('Heat Loss')).toEqual(['1,234.568 MMBtu', '400.25 MMBtu']);
      expect(getRowCells('Energy Cost')).toEqual(['$5,000.00', '$1,500.50']);
      expect(getRowCells('Annual Energy Savings')).toEqual(['834.318 MMBtu']);
      expect(getRowCells('Annual Cost Savings')).toEqual(['$3,499.50']);
    });

    it('renders the energy unit from the results', () => {
      render(makeResults(true, 'kWh'));
      expect(getRowCells('Heat Loss')).toEqual(['1,234.568 kWh', '400.25 kWh']);
      expect(getRowCells('Annual Energy Savings')).toEqual(['834.318 kWh']);
    });

    it('renders dashes in the modification and savings cells when there are no modification results', () => {
      render(makeResults(false), false);
      expect(getRowCells('Heat Loss')).toEqual(['1,234.568 MMBtu', '—']);
      expect(getRowCells('Energy Cost')).toEqual(['$5,000.00', '—']);
      expect(getRowCells('Annual Energy Savings')).toEqual(['—']);
      expect(getRowCells('Annual Cost Savings')).toEqual(['—']);
    });

    it('updates the rendered values when the results input changes', () => {
      render(makeResults());
      const updated = makeResults();
      updated.baselineResults.annualHeatLoss = 99;
      fixture.componentRef.setInput('results', updated);
      fixture.detectChanges();
      expect(getRowCells('Heat Loss')).toEqual(['99 MMBtu', '400.25 MMBtu']);
    });
  });

  describe('user actions', () => {
    it('copies the table text into table0String', () => {
      render(makeResults());
      component.updateTable0String();
      expect(component.table0String).toBe(component.copyTable0.nativeElement.innerText);
      expect(component.table0String).toContain('Heat Loss');
    });
  });
});
