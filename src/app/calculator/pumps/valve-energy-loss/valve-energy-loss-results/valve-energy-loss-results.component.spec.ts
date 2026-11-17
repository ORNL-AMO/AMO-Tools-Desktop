import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ValveEnergyLossResultsComponent } from './valve-energy-loss-results.component';
import { ValveEnergyLossService } from '../valve-energy-loss.service';
import { ValveEnergyLossOutputs, ValveEnergyLossResults } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;
const EMPTY_CELL = '— —';

function makeOutputs(overrides: Partial<ValveEnergyLossOutputs> = {}): ValveEnergyLossOutputs {
  return {
    headLoss: 10,
    powerLossFrictional: 8,
    powerLossElectrical: 6,
    annualEnergyLoss: 5000,
    annualEnergyCost: 250,
    ...overrides,
  };
}

function makeEmptyOutputs(): ValveEnergyLossOutputs {
  return { headLoss: 0, powerLossFrictional: 0, powerLossElectrical: 0, annualEnergyLoss: 0, annualEnergyCost: 0 };
}

function makeResults(baseline: ValveEnergyLossOutputs, modification: ValveEnergyLossOutputs): ValveEnergyLossResults {
  return { baselineOutputs: baseline, modificationOutputs: modification };
}

const MODIFICATION_OUTPUTS: ValveEnergyLossOutputs = {
  headLoss: 4,
  powerLossFrictional: 3,
  powerLossElectrical: 2,
  annualEnergyLoss: 1000,
  annualEnergyCost: 50,
};

interface RowCase {
  key: keyof ValveEnergyLossOutputs;
  label: string;
  baselineImperial: string;
  baselineMetric: string;
  modificationImperial: string;
  reductionImperial: string;
  reductionMetric: string;
}

// Expected value-cell text per row, with makeOutputs() as baseline and MODIFICATION_OUTPUTS as modification.
const ROWS: Array<RowCase> = [
  {
    key: 'headLoss', label: 'Head Loss',
    baselineImperial: '10 ft', baselineMetric: '10 m', modificationImperial: '4 ft',
    reductionImperial: '6 ft', reductionMetric: '6 m',
  },
  {
    key: 'powerLossFrictional', label: 'Friction Losses',
    baselineImperial: '8 hp', baselineMetric: '8 kW', modificationImperial: '3 hp',
    reductionImperial: '5 hp', reductionMetric: '5 kW',
  },
  {
    key: 'powerLossElectrical', label: 'Electrical Loss',
    baselineImperial: '6 kW', baselineMetric: '6 kW', modificationImperial: '2 kW',
    reductionImperial: '4 kW', reductionMetric: '4 kW',
  },
  {
    key: 'annualEnergyLoss', label: 'Annual Energy Usage',
    baselineImperial: '5,000 kWh', baselineMetric: '5,000 kWh', modificationImperial: '1,000 kWh',
    reductionImperial: '4,000 kWh', reductionMetric: '4,000 kWh',
  },
  {
    key: 'annualEnergyCost', label: 'Annual Energy Cost',
    baselineImperial: '$250.00', baselineMetric: '$250.00', modificationImperial: '$50.00',
    reductionImperial: '$200.00', reductionMetric: '$200.00',
  },
];

describe('ValveEnergyLossResultsComponent', () => {
  let component: ValveEnergyLossResultsComponent;
  let fixture: ComponentFixture<ValveEnergyLossResultsComponent>;
  let results: BehaviorSubject<ValveEnergyLossResults>;

  function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  function getTables(): Array<HTMLTableElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  function getLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label.group-label'))
      .map((label: HTMLElement) => label.textContent.trim());
  }

  function getExportTables(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('app-exportable-results-table'));
  }

  // Each row renders exactly one value cell after its label cell.
  function getRowCells(table: HTMLTableElement, label: string): Array<string> {
    const row = Array.from(table.querySelectorAll('tr'))
      .find((tr: HTMLElement) => tr.querySelector('td').textContent.trim() === label);
    return Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function createComponent(settings: Settings, modificationExists: boolean, output: ValveEnergyLossResults): void {
    results.next(output);
    fixture = TestBed.createComponent(ValveEnergyLossResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('modificationExists', modificationExists);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    results = new BehaviorSubject<ValveEnergyLossResults>(undefined);
    const serviceMock = { results } as Partial<ValveEnergyLossService>;

    await TestBed.configureTestingModule({
      declarations: [ValveEnergyLossResultsComponent],
      providers: [{ provide: ValveEnergyLossService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('subscribes to the service results', () => {
      const output = makeResults(makeOutputs(), MODIFICATION_OUTPUTS);
      createComponent(IMPERIAL_SETTINGS, false, output);
      expect(component).toBeTruthy();
      expect(component.output).toBe(output);
    });

    it('re-renders when the service emits new results', () => {
      createComponent(IMPERIAL_SETTINGS, false, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
      results.next(makeResults(makeOutputs({ headLoss: 20 }), MODIFICATION_OUTPUTS));
      fixture.detectChanges();
      expect(getRowCells(getTables()[0], 'Head Loss')).toEqual(['Head Loss', '20 ft']);
    });
  });

  describe('modification sections', () => {
    it('renders only the baseline table and export when no modification exists', () => {
      createComponent(IMPERIAL_SETTINGS, false, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
      expect(getLabels()).toEqual(['Baseline Results']);
      expect(getTables().length).toBe(1);
      expect(getExportTables().length).toBe(1);
    });

    it('renders baseline, modification, and reduction tables with exports when a modification exists', () => {
      createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
      expect(getLabels()).toEqual(['Baseline Results', 'Modification Results', 'Reductions']);
      expect(getTables().length).toBe(3);
      expect(getExportTables().length).toBe(3);
    });

    it('hides the modification sections when modificationExists becomes false', () => {
      createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
      fixture.componentRef.setInput('modificationExists', false);
      fixture.detectChanges();
      expect(getTables().length).toBe(1);
      expect(getExportTables().length).toBe(1);
    });
  });

  describe('baseline table', () => {
    ROWS.forEach(row => {
      it(`renders the ${row.label} value with Imperial units`, () => {
        createComponent(IMPERIAL_SETTINGS, false, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
        expect(getRowCells(getTables()[0], row.label)).toEqual([row.label, row.baselineImperial]);
      });

      it(`renders the ${row.label} value with Metric units`, () => {
        createComponent(METRIC_SETTINGS, false, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
        expect(getRowCells(getTables()[0], row.label)).toEqual([row.label, row.baselineMetric]);
      });

      it(`renders a dash placeholder for ${row.label} when the value is 0`, () => {
        createComponent(IMPERIAL_SETTINGS, false, makeResults(makeOutputs({ [row.key]: 0 }), MODIFICATION_OUTPUTS));
        expect(getRowCells(getTables()[0], row.label)).toEqual([row.label, EMPTY_CELL]);
      });
    });

    it('renders dash placeholders for every row with default empty outputs', () => {
      createComponent(IMPERIAL_SETTINGS, false, makeResults(makeEmptyOutputs(), makeEmptyOutputs()));
      ROWS.forEach(row => {
        expect(getRowCells(getTables()[0], row.label)).toEqual([row.label, EMPTY_CELL]);
      });
    });

    it('renders no unit span for unit-converted rows when unitsOfMeasure is neither Imperial nor Metric', () => {
      createComponent({ unitsOfMeasure: 'Other' } as Settings, false, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
      expect(getRowCells(getTables()[0], 'Head Loss')).toEqual(['Head Loss', '10']);
      expect(getRowCells(getTables()[0], 'Friction Losses')).toEqual(['Friction Losses', '8']);
    });
  });

  describe('modification table', () => {
    ROWS.forEach(row => {
      it(`renders the modification ${row.label} value`, () => {
        createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
        expect(getRowCells(getTables()[1], row.label)).toEqual([row.label, row.modificationImperial]);
      });

      it(`renders a dash placeholder for modification ${row.label} when the value is 0`, () => {
        createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs(), { ...MODIFICATION_OUTPUTS, [row.key]: 0 }));
        expect(getRowCells(getTables()[1], row.label)).toEqual([row.label, EMPTY_CELL]);
      });
    });

    it('renders Metric units for head loss and friction losses', () => {
      createComponent(METRIC_SETTINGS, true, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
      expect(getRowCells(getTables()[1], 'Head Loss')).toEqual(['Head Loss', '4 m']);
      expect(getRowCells(getTables()[1], 'Friction Losses')).toEqual(['Friction Losses', '3 kW']);
    });
  });

  describe('reductions table', () => {
    ROWS.forEach(row => {
      it(`renders the ${row.label} reduction with Imperial units`, () => {
        createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
        expect(getRowCells(getTables()[2], row.label)).toEqual([row.label, row.reductionImperial]);
      });

      it(`renders the ${row.label} reduction with Metric units`, () => {
        createComponent(METRIC_SETTINGS, true, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
        expect(getRowCells(getTables()[2], row.label)).toEqual([row.label, row.reductionMetric]);
      });

      it(`renders a dash placeholder for the ${row.label} reduction when the modification value is 0`, () => {
        createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs(), { ...MODIFICATION_OUTPUTS, [row.key]: 0 }));
        expect(getRowCells(getTables()[2], row.label)).toEqual([row.label, EMPTY_CELL]);
      });
    });

    it('renders the reduction when only the baseline value is 0', () => {
      createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs({ headLoss: 0 }), MODIFICATION_OUTPUTS));
      expect(getRowCells(getTables()[2], 'Head Loss')).toEqual(['Head Loss', '-4 ft']);
    });
  });

  describe('copy table strings', () => {
    it('updates each table string from the rendered table text', () => {
      createComponent(IMPERIAL_SETTINGS, true, makeResults(makeOutputs(), MODIFICATION_OUTPUTS));
      component.updateTable0String();
      component.updateTable1String();
      component.updateTable2String();
      expect(component.table0String).toBe(getTables()[0].innerText);
      expect(component.table1String).toBe(getTables()[1].innerText);
      expect(component.table2String).toBe(getTables()[2].innerText);
      expect(component.table0String).toContain('Head Loss');
    });
  });

  describe('destroy', () => {
    it('stops updating output after destroy', () => {
      const output = makeResults(makeOutputs(), MODIFICATION_OUTPUTS);
      createComponent(IMPERIAL_SETTINGS, false, output);
      fixture.destroy();
      results.next(makeResults(makeEmptyOutputs(), makeEmptyOutputs()));
      expect(component.output).toBe(output);
    });
  });
});
