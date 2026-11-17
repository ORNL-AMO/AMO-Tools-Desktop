import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerFanResultsComponent } from './cooling-tower-fan-results.component';
import { CoolingTowerFanService } from '../cooling-tower-fan.service';
import { CoolingTowerFanOutput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';

const DASHES = '— —';

function makeOutput(overrides: Partial<CoolingTowerFanOutput> = {}): CoolingTowerFanOutput {
  return {
    baselinePower: 12.345,
    baselineEnergy: 1234.567,
    modPower: 6.789,
    modEnergy: 678.912,
    savingsEnergy: 555.655,
    baselineEnergyCost: 1500.4,
    modEnergyCost: 800.6,
    annualCostSaving: 699.8,
    ...overrides,
  };
}

function makeZeroOutput(): CoolingTowerFanOutput {
  return {
    baselinePower: 0,
    baselineEnergy: 0,
    modPower: 0,
    modEnergy: 0,
    savingsEnergy: 0,
    baselineEnergyCost: 0,
    modEnergyCost: 0,
    annualCostSaving: 0,
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('CoolingTowerFanResultsComponent', () => {
  let component: CoolingTowerFanResultsComponent;
  let fixture: ComponentFixture<CoolingTowerFanResultsComponent>;
  let coolingTowerFanService: Partial<CoolingTowerFanService>;

  function getTables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  /** Value cell text of each row, per table. */
  function getValueCells(tableIndex: number): Array<string> {
    const rows = Array.from(getTables()[tableIndex].querySelectorAll('tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      expect(cells.length).toBe(2);
      return normalize(cells[1].textContent);
    });
  }

  function createComponent(settings: Settings, output?: CoolingTowerFanOutput): void {
    coolingTowerFanService.coolingTowerFanOutput.next(output);
    fixture = TestBed.createComponent(CoolingTowerFanResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    coolingTowerFanService = { coolingTowerFanOutput: new BehaviorSubject<CoolingTowerFanOutput>(undefined) };

    await TestBed.configureTestingModule({
      declarations: [CoolingTowerFanResultsComponent],
      providers: [{ provide: CoolingTowerFanService, useValue: coolingTowerFanService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('subscribes to the service output', () => {
      const output = makeOutput();
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, output);
      expect(component.output).toBe(output);
    });

    it('always renders the chart, group labels, and export table', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings);
      expect(fixture.nativeElement.querySelector('app-cooling-tower-fan-chart')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-exportable-results-table')).not.toBeNull();
      const labels = Array.from(fixture.nativeElement.querySelectorAll('.group-label'))
        .map((label: HTMLElement) => label.textContent.trim());
      expect(labels).toEqual(['Baseline', 'Modification', 'Savings']);
    });
  });

  describe('template visibility', () => {
    it('hides all result tables without output', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings);
      expect(getTables().length).toBe(0);
    });

    it('shows three result tables with output', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, makeOutput());
      expect(getTables().length).toBe(3);
    });

    it('renders imperial values', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, makeOutput());
      expect(getValueCells(0)).toEqual(['12.35 hp', '1,234.57 kWh', '$1,500']);
      expect(getValueCells(1)).toEqual(['6.79 hp', '678.91 kWh', '$801']);
      expect(getValueCells(2)).toEqual(['555.655 kWh', '$700']);
    });

    it('renders metric power units', () => {
      createComponent({ unitsOfMeasure: 'Metric' } as Settings, makeOutput());
      expect(getValueCells(0)[0]).toBe('12.35 kW');
      expect(getValueCells(1)[0]).toBe('6.79 kW');
    });

    it('renders power without a unit for an unknown unit system', () => {
      createComponent({ unitsOfMeasure: 'Other' } as Settings, makeOutput());
      expect(getValueCells(0)[0]).toBe('12.35');
      expect(getValueCells(1)[0]).toBe('6.79');
    });

    it('renders dashes for every zero value', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, makeZeroOutput());
      expect(getValueCells(0)).toEqual([DASHES, DASHES, DASHES]);
      expect(getValueCells(1)).toEqual([DASHES, DASHES, DASHES]);
      expect(getValueCells(2)).toEqual([DASHES, DASHES]);
    });

    const ZERO_FIELD_CASES: Array<{ field: keyof CoolingTowerFanOutput, table: number, row: number }> = [
      { field: 'baselinePower', table: 0, row: 0 },
      { field: 'baselineEnergy', table: 0, row: 1 },
      { field: 'baselineEnergyCost', table: 0, row: 2 },
      { field: 'modPower', table: 1, row: 0 },
      { field: 'modEnergy', table: 1, row: 1 },
      { field: 'modEnergyCost', table: 1, row: 2 },
      { field: 'savingsEnergy', table: 2, row: 0 },
      { field: 'annualCostSaving', table: 2, row: 1 },
    ];

    ZERO_FIELD_CASES.forEach(({ field, table, row }) => {
      it(`renders dashes only for a zero ${field}`, () => {
        createComponent({ unitsOfMeasure: 'Imperial' } as Settings, makeOutput({ [field]: 0 }));
        const allCells = [0, 1, 2].map(index => getValueCells(index));
        allCells.forEach((cells, tableIndex) => {
          cells.forEach((cell, rowIndex) => {
            if (tableIndex === table && rowIndex === row) {
              expect(cell).toBe(DASHES);
            } else {
              expect(cell).not.toBe(DASHES);
            }
          });
        });
      });
    });
  });

  describe('output observer', () => {
    it('updates the rendered values when a new output is emitted', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, makeOutput());
      coolingTowerFanService.coolingTowerFanOutput.next(makeOutput({ baselinePower: 20 }));
      fixture.detectChanges();
      expect(getValueCells(0)[0]).toBe('20 hp');
    });

    it('hides the tables when the output is cleared', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, makeOutput());
      coolingTowerFanService.coolingTowerFanOutput.next(undefined);
      fixture.detectChanges();
      expect(getTables().length).toBe(0);
    });
  });

  describe('copy table', () => {
    it('builds the table string from all three tables', () => {
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, makeOutput());
      component.updateTable0String();
      const tables = getTables();
      expect(component.table0String).toBe(tables[0].innerText + tables[1].innerText + tables[2].innerText);
      expect(component.table0String).toContain('Annual Energy Savings');
    });
  });

  describe('destroy', () => {
    it('stops updating output after destroy', () => {
      const output = makeOutput();
      createComponent({ unitsOfMeasure: 'Imperial' } as Settings, output);
      fixture.destroy();
      coolingTowerFanService.coolingTowerFanOutput.next(makeOutput({ baselinePower: 99 }));
      expect(component.output).toBe(output);
    });
  });
});
