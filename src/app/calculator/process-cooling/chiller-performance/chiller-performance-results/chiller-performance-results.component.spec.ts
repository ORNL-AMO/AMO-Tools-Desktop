import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChillerPerformanceResultsComponent } from './chiller-performance-results.component';
import { ChillerPerformanceService } from '../chiller-performance.service';
import { ChillerPerformanceOutput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

function makeOutput(overrides: Partial<ChillerPerformanceOutput> = {}): ChillerPerformanceOutput {
  return {
    baselineActualCapacity: 500.123,
    baselineActualEfficiency: 0.61234,
    baselinePower: 300.5,
    baselineEnergy: 1200000.25,
    baselineEnergyCost: 120000,
    modActualCapacity: 520.456,
    modActualEfficiency: 0.51234,
    modPower: 260.25,
    modEnergy: 1000000.5,
    modEnergyCost: 100000,
    savingsEnergy: 200000.4,
    annualCostSaving: 20000,
    ...overrides,
  };
}

function makeZeroOutput(): ChillerPerformanceOutput {
  return {
    baselineActualCapacity: 0,
    baselineActualEfficiency: 0,
    baselinePower: 0,
    baselineEnergy: 0,
    baselineEnergyCost: 0,
    modActualCapacity: 0,
    modActualEfficiency: 0,
    modPower: 0,
    modEnergy: 0,
    modEnergyCost: 0,
    savingsEnergy: 0,
    annualCostSaving: 0,
  };
}

// [table index, row index, label, expected value text]
const VALUE_CASES: Array<[number, number, string, string]> = [
  [0, 0, 'Actual Chiller Capacity', '500.12'],
  [0, 1, 'Actual Chiller Efficiency', '0.6123 kW/ton'],
  [0, 2, 'Power Consumption', '300.5'],
  [0, 3, 'Energy Consumption', '1,200,000.25 kWh'],
  [0, 4, 'Energy Cost', '$120,000'],
  [1, 0, 'Actual Chiller Capacity', '520.46'],
  [1, 1, 'Actual Chiller Efficiency', '0.5123 kW/ton'],
  [1, 2, 'Power Consumption', '260.25'],
  [1, 3, 'Energy Consumption', '1,000,000.5 kWh'],
  [1, 4, 'Energy Cost', '$100,000'],
  [2, 0, 'Annual Energy Savings', '200,000 kWh'],
  [2, 1, 'Annual Energy Cost Savings', '$20,000'],
];

// [table index, row index, imperial unit, metric unit]
const UNIT_CASES: Array<[number, number, string, string]> = [
  [0, 0, 'tons', 'kW'],
  [0, 2, 'hp', 'kW'],
  [1, 0, 'tons', 'kW'],
  [1, 2, 'hp', 'kW'],
];

describe('ChillerPerformanceResultsComponent', () => {
  let component: ChillerPerformanceResultsComponent;
  let fixture: ComponentFixture<ChillerPerformanceResultsComponent>;
  let outputSubject: BehaviorSubject<ChillerPerformanceOutput>;

  function getTables(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  function getCells(tableIndex: number, rowIndex: number): Array<HTMLElement> {
    const row = getTables()[tableIndex].querySelectorAll('tbody tr')[rowIndex];
    return Array.from(row.querySelectorAll('td'));
  }

  function getValueCellText(tableIndex: number, rowIndex: number): string {
    return getCells(tableIndex, rowIndex)[1].textContent.replace(/\s+/g, ' ').trim();
  }

  function createComponent(settings: Settings = IMPERIAL_SETTINGS): void {
    fixture = TestBed.createComponent(ChillerPerformanceResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    outputSubject = new BehaviorSubject<ChillerPerformanceOutput>(undefined);
    const chillerPerformanceService: Partial<ChillerPerformanceService> = { chillerPerformanceOutput: outputSubject };

    await TestBed.configureTestingModule({
      declarations: [ChillerPerformanceResultsComponent],
      providers: [{ provide: ChillerPerformanceService, useValue: chillerPerformanceService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('without output', () => {
    beforeEach(() => createComponent());

    it('hides all result tables but keeps the group labels, chart, and export table', () => {
      expect(getTables().length).toBe(0);
      expect(fixture.nativeElement.querySelectorAll('label.group-label').length).toBe(3);
      expect(fixture.nativeElement.querySelector('app-chiller-performance-chart')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-exportable-results-table')).not.toBeNull();
    });
  });

  describe('with output', () => {
    beforeEach(() => {
      outputSubject.next(makeOutput());
      createComponent();
    });

    it('shows the baseline, modification, and savings tables', () => {
      expect(getTables().length).toBe(3);
      expect(getTables()[0].querySelectorAll('tbody tr').length).toBe(5);
      expect(getTables()[1].querySelectorAll('tbody tr').length).toBe(5);
      expect(getTables()[2].querySelectorAll('tbody tr').length).toBe(2);
    });

    VALUE_CASES.forEach(([tableIndex, rowIndex, label, expected]) => {
      it(`shows the value for table ${tableIndex} ${label}`, () => {
        const cells = getCells(tableIndex, rowIndex);
        expect(cells.length).toBe(2);
        expect(cells[0].textContent.trim()).toBe(label);
        expect(getValueCellText(tableIndex, rowIndex)).toContain(expected);
        expect(getValueCellText(tableIndex, rowIndex)).not.toContain('—');
      });
    });

    it('updates rendered values when the output changes', () => {
      outputSubject.next(makeOutput({ savingsEnergy: 12345 }));
      fixture.detectChanges();
      expect(getValueCellText(2, 0)).toBe('12,345 kWh');
    });
  });

  describe('with zero output', () => {
    beforeEach(() => {
      outputSubject.next(makeZeroOutput());
      createComponent();
    });

    VALUE_CASES.forEach(([tableIndex, rowIndex, label]) => {
      it(`shows dashes for table ${tableIndex} ${label}`, () => {
        const cells = getCells(tableIndex, rowIndex);
        expect(cells.length).toBe(2);
        expect(getValueCellText(tableIndex, rowIndex)).toBe('— —');
        expect(cells[1].querySelectorAll('span').length).toBe(0);
      });
    });
  });

  describe('units', () => {
    UNIT_CASES.forEach(([tableIndex, rowIndex, imperial, metric]) => {
      it(`shows ${imperial} for imperial in table ${tableIndex} row ${rowIndex}`, () => {
        outputSubject.next(makeOutput());
        createComponent(IMPERIAL_SETTINGS);
        const spans = Array.from(getCells(tableIndex, rowIndex)[1].querySelectorAll('span'));
        expect(spans.map(span => span.textContent.trim())).toEqual([imperial]);
      });

      it(`shows ${metric} for metric in table ${tableIndex} row ${rowIndex}`, () => {
        outputSubject.next(makeOutput());
        createComponent(METRIC_SETTINGS);
        const spans = Array.from(getCells(tableIndex, rowIndex)[1].querySelectorAll('span'));
        expect(spans.map(span => span.textContent.trim())).toEqual([metric]);
      });
    });

    it('shows no unit span for other unit systems', () => {
      outputSubject.next(makeOutput());
      createComponent({ unitsOfMeasure: 'Other' } as Settings);
      expect(getCells(0, 0)[1].querySelectorAll('span').length).toBe(0);
    });
  });

  describe('copy table string', () => {
    it('concatenates the text of all three tables', () => {
      outputSubject.next(makeOutput());
      createComponent();
      component.updateTable0String();
      const tables = getTables();
      expect(component.table0String).toBe(tables[0].innerText + tables[1].innerText + tables[2].innerText);
    });
  });

  describe('destroy', () => {
    it('stops following output after destroy', () => {
      const first = makeOutput();
      outputSubject.next(first);
      createComponent();
      fixture.destroy();
      outputSubject.next(makeZeroOutput());
      expect(component.output).toBe(first);
    });
  });
});
