import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerResultsComponent } from './cooling-tower-results.component';
import { CoolingTowerService } from '../cooling-tower.service';
import { Settings } from '../../../../shared/models/settings';
import { CoolingTowerOutput } from '../../../../shared/models/chillers';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

function makeOutput(overrides: Partial<CoolingTowerOutput> = {}): CoolingTowerOutput {
  return {
    wcBaseline: 1234.56,
    wcModification: 1000,
    waterSavings: 234.56,
    savingsPercentage: 19,
    annualCostSavings: 586,
    baselineCost: 3086,
    modificationCost: 2500,
    coolingTowerCaseResults: [],
    ...overrides,
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('CoolingTowerResultsComponent', () => {
  let component: CoolingTowerResultsComponent;
  let fixture: ComponentFixture<CoolingTowerResultsComponent>;
  let service: Partial<CoolingTowerService>;

  function getTables(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table'));
  }

  /** Value cell of the given row in the given table. */
  function valueCell(tableIndex: number, rowIndex: number): HTMLElement {
    return getTables()[tableIndex].querySelectorAll('tr')[rowIndex].querySelectorAll('td')[1] as HTMLElement;
  }

  function cellUnits(cell: HTMLElement): Array<string> {
    return Array.from(cell.querySelectorAll('span')).map(span => normalize(span.textContent));
  }

  function createComponent(settings: Settings, output: CoolingTowerOutput = makeOutput()): void {
    service.coolingTowerOutput.next(output);
    fixture = TestBed.createComponent(CoolingTowerResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    service = { coolingTowerOutput: new BehaviorSubject<CoolingTowerOutput>(undefined) };
    await TestBed.configureTestingModule({
      declarations: [CoolingTowerResultsComponent],
      providers: [{ provide: CoolingTowerService, useValue: service }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('takes the current output from the service', () => {
      const output = makeOutput();
      createComponent(IMPERIAL, output);
      expect(component.coolingTowerOutput).toBe(output);
    });
  });

  describe('output rendering', () => {
    it('renders the baseline, modification and savings values', () => {
      createComponent(IMPERIAL);
      expect(normalize(valueCell(0, 0).textContent)).toBe('$3,086');
      expect(normalize(valueCell(0, 1).firstChild.textContent)).toBe('1,234.6');
      expect(normalize(valueCell(1, 0).textContent)).toBe('$2,500');
      expect(normalize(valueCell(1, 1).firstChild.textContent)).toBe('1,000.0');
      expect(normalize(valueCell(2, 0).textContent)).toBe('$586');
      expect(normalize(valueCell(2, 1).firstChild.textContent)).toBe('234.6');
    });

    it('renders the new values when the output changes', () => {
      createComponent(IMPERIAL);
      service.coolingTowerOutput.next(makeOutput({ baselineCost: 10, wcBaseline: 2 }));
      fixture.detectChanges();
      expect(normalize(valueCell(0, 0).textContent)).toBe('$10');
      expect(normalize(valueCell(0, 1).firstChild.textContent)).toBe('2.0');
    });

    it('captures the first results table text for export', () => {
      createComponent(IMPERIAL);
      component.updateTableString();
      expect(component.savingsTableString).toBe(getTables()[0].innerText);
    });
  });

  describe('template visibility', () => {
    const unitCases: Array<{ settings: Settings, unit: string }> = [
      { settings: IMPERIAL, unit: 'kgal' },
      { settings: METRIC, unit: 'm3' },
    ];
    unitCases.forEach(testCase => {
      it(`shows only ${testCase.unit} consumption units for ${testCase.settings.unitsOfMeasure} settings`, () => {
        createComponent(testCase.settings);
        expect(cellUnits(valueCell(0, 1))).toEqual([testCase.unit]);
        expect(cellUnits(valueCell(1, 1))).toEqual([testCase.unit]);
        expect(cellUnits(valueCell(2, 1))).toEqual([testCase.unit]);
      });
    });
  });

  describe('destroy', () => {
    it('stops following the output after destroy', () => {
      const output = makeOutput();
      createComponent(IMPERIAL, output);
      fixture.destroy();
      service.coolingTowerOutput.next(makeOutput({ baselineCost: 1 }));
      expect(component.coolingTowerOutput).toBe(output);
    });
  });
});
