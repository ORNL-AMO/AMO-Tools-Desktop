import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WaterReductionResultsComponent } from './water-reduction-results.component';
import { Settings } from '../../../../shared/models/settings';
import { WaterReductionResults } from '../../../../shared/models/standalone';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

function makeResults(baselineWaterUse: number = 1000, modificationWaterUse: number = 600): WaterReductionResults {
  return {
    baselineResults: { waterUse: baselineWaterUse, waterCost: 5000, annualWaterSavings: 0, costSavings: 0 },
    modificationResults: { waterUse: modificationWaterUse, waterCost: 3000, annualWaterSavings: 0, costSavings: 0 },
    annualWaterSavings: baselineWaterUse - modificationWaterUse,
    annualCostSavings: 2000,
  };
}

describe('WaterReductionResultsComponent', () => {
  let component: WaterReductionResultsComponent;
  let fixture: ComponentFixture<WaterReductionResultsComponent>;

  function getRows(): Array<HTMLTableRowElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table tr'));
  }

  // Cell texts of a row, whitespace-collapsed.
  function getCells(rowIndex: number): Array<string> {
    return Array.from(getRows()[rowIndex].querySelectorAll('td'))
      .map((cell: HTMLElement) => cell.textContent.replace(/\s+/g, ' ').trim());
  }

  function detectChanges(): void {
    fixture.detectChanges();
  }

  function render(inputs: { modificationExists: boolean, settings?: Settings, isWastewater?: boolean, results?: WaterReductionResults }): void {
    fixture.componentRef.setInput('settings', inputs.settings ?? IMPERIAL_SETTINGS);
    fixture.componentRef.setInput('waterReductionResults', inputs.results ?? makeResults());
    fixture.componentRef.setInput('modificationExists', inputs.modificationExists);
    if (inputs.isWastewater !== undefined) {
      fixture.componentRef.setInput('isWastewater', inputs.isWastewater);
    }
    detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaterReductionResultsComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WaterReductionResultsComponent);
    component = fixture.componentInstance;
  });

  describe('user actions', () => {
    it('fills tableString from the rendered table when the exportable table requests it', () => {
      render({ modificationExists: true });
      fixture.nativeElement.querySelector('app-exportable-results-table').dispatchEvent(new Event('updateTableString'));
      expect(component.tableString).toContain('Water Use');
      expect(component.tableString).toContain('1,000');
    });
  });

  describe('calculation output rendering', () => {
    it('exports the current results, not the previous ones, after the results change', () => {
      render({ modificationExists: true });
      fixture.componentRef.setInput('waterReductionResults', makeResults(2500, 600));
      detectChanges();
      component.updateTableString();
      expect(component.tableString).toContain('2,500');
      expect(component.tableString).not.toContain('1,000');
    });

    it('renders the updated values when results change', () => {
      render({ modificationExists: true });
      fixture.componentRef.setInput('waterReductionResults', makeResults(2500, 700));
      detectChanges();
      expect(getCells(1)).toEqual(['Water Use', '2,500 kgal/yr', '700 kgal/yr']);
      expect(getCells(3)).toEqual(['Annual Water Savings', '1,800 kgal/yr']);
    });
  });

  describe('template visibility', () => {
    describe('without a modification', () => {
      beforeEach(() => {
        render({ modificationExists: false });
      });

      it('shows the baseline values and dashes for every modification and savings cell', () => {
        expect(getCells(1)).toEqual(['Water Use', '1,000 kgal/yr', '—']);
        expect(getCells(2)).toEqual(['Water Cost', '$5,000 /yr', '—']);
        expect(getCells(3)).toEqual(['Annual Water Savings', '—']);
        expect(getCells(4)).toEqual(['Cost Savings', '—']);
      });

      it('hides the exportable results table', () => {
        expect(fixture.nativeElement.querySelector('app-exportable-results-table')).toBeNull();
      });
    });

    describe('with a modification', () => {
      beforeEach(() => {
        render({ modificationExists: true });
      });

      it('shows the modification values and savings', () => {
        expect(getCells(1)).toEqual(['Water Use', '1,000 kgal/yr', '600 kgal/yr']);
        expect(getCells(2)).toEqual(['Water Cost', '$5,000 /yr', '$3,000 /yr']);
        expect(getCells(3)).toEqual(['Annual Water Savings', '400 kgal/yr']);
        expect(getCells(4)).toEqual(['Cost Savings', '$2,000 /yr']);
      });

      it('shows the exportable results table', () => {
        expect(fixture.nativeElement.querySelector('app-exportable-results-table')).not.toBeNull();
      });
    });

    it('shows metric units when the settings are metric', () => {
      render({ modificationExists: true, settings: METRIC_SETTINGS });
      expect(getCells(1)).toEqual(['Water Use', '1,000 m3/yr', '600 m3/yr']);
      expect(getCells(3)).toEqual(['Annual Water Savings', '400 m3/yr']);
      expect(getRows()[1].querySelectorAll('sup').length).toBe(2);
    });

    it('shows metric units on the baseline only when there is no modification', () => {
      render({ modificationExists: false, settings: METRIC_SETTINGS });
      expect(getCells(1)).toEqual(['Water Use', '1,000 m3/yr', '—']);
    });

    it('shows the water cost labels when isWastewater is false', () => {
      render({ modificationExists: true, isWastewater: false });
      expect(getCells(2)[0]).toBe('Water Cost');
      expect(getCells(4)[0]).toBe('Cost Savings');
    });

    it('shows the wastewater cost labels when isWastewater is true', () => {
      render({ modificationExists: true, isWastewater: true });
      expect(getCells(2)[0]).toBe('Wastewater Disposal Cost');
      expect(getCells(4)[0]).toBe('Disposal Cost Savings');
    });

    it('toggles from dashes to values when a modification is added', () => {
      render({ modificationExists: false });
      expect(getCells(3)).toEqual(['Annual Water Savings', '—']);
      fixture.componentRef.setInput('modificationExists', true);
      detectChanges();
      expect(getCells(3)).toEqual(['Annual Water Savings', '400 kgal/yr']);
    });
  });
});
