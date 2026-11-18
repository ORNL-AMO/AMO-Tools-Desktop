import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChillerStagingResultsComponent } from './chiller-staging-results.component';
import { ChillerStagingService } from '../chiller-staging.service';
import { ChillerStagingOutput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const DASHES = '— —';

function makeOutput(overrides: Partial<ChillerStagingOutput> = {}): ChillerStagingOutput {
  return {
    baselineTotalPower: 1234.567,
    baselineTotalEnergy: 2000.5,
    modTotalPower: 900.25,
    modTotalEnergy: 1500.75,
    savingsEnergy: 499.6,
    costSavings: 4321.4,
    baselineCost: 10000.4,
    modificationCost: 5678.9,
    baselinePowerList: [100, 200],
    modPowerList: [150, 0],
    chillerLoadResults: [
      { baseline: 100.123, modification: 150 },
      { baseline: 200, modification: 0 },
    ],
    ...overrides,
  };
}

const TOTAL_ROWS: Array<{ label: string, field: keyof ChillerStagingOutput, expected: string }> = [
  { label: 'Total Baseline Power Consumption', field: 'baselineTotalPower', expected: '1,234.57 kW' },
  { label: 'Total Baseline Energy Consumption', field: 'baselineTotalEnergy', expected: '2,000.5 kWh' },
  { label: 'Total Baseline Energy Cost', field: 'baselineCost', expected: '$10,000' },
  { label: 'Total Modification Power Consumption', field: 'modTotalPower', expected: '900.25 kW' },
  { label: 'Total Modification Energy Consumption', field: 'modTotalEnergy', expected: '1,500.75 kWh' },
  { label: 'Total Modification Energy Cost', field: 'modificationCost', expected: '$5,679' },
  { label: 'Annual Energy Savings', field: 'savingsEnergy', expected: '500 kWh' },
  { label: 'Annual Energy Cost Savings', field: 'costSavings', expected: '$4,321' },
];

describe('ChillerStagingResultsComponent', () => {
  let component: ChillerStagingResultsComponent;
  let fixture: ComponentFixture<ChillerStagingResultsComponent>;
  let chillerStagingOutput: BehaviorSubject<ChillerStagingOutput>;

  function groupLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label.group-label'))
      .map((label: HTMLElement) => label.textContent.trim());
  }

  function rowValueCells(row: HTMLTableRowElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).slice(1).map(td => td.textContent.trim());
  }

  function rowsByLabel(label: string): Array<HTMLTableRowElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('tr'))
      .filter((row: HTMLTableRowElement) => row.querySelector('td')?.textContent.trim() === label) as Array<HTMLTableRowElement>;
  }

  function render(output: ChillerStagingOutput): void {
    chillerStagingOutput.next(output);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    chillerStagingOutput = new BehaviorSubject<ChillerStagingOutput>(undefined);
    const chillerStagingService: Partial<ChillerStagingService> = { chillerStagingOutput };

    await TestBed.configureTestingModule({
      declarations: [ChillerStagingResultsComponent],
      providers: [{ provide: ChillerStagingService, useValue: chillerStagingService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChillerStagingResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('modificationExists', false);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('should render nothing while there is no output', () => {
      expect(component.output).toBeUndefined();
      expect(fixture.nativeElement.querySelector('label')).toBeNull();
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('should assign the output emitted by the service', () => {
      const output = makeOutput();
      chillerStagingOutput.next(output);
      expect(component.output).toBe(output);
    });
  });

  describe('per-chiller results', () => {
    it('should render one labelled table per chiller followed by the totals table', () => {
      render(makeOutput());
      expect(groupLabels()).toEqual([
        'Chiller 1 Power Consumption',
        'Chiller 2 Power Consumption',
        'Total Consumption and Savings',
      ]);
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(3);
    });

    it('should render the value when truthy and dashes when zero', () => {
      render(makeOutput());
      expect(rowsByLabel('Baseline Power Consumption').map(rowValueCells)).toEqual([['100.12 kW'], ['200 kW']]);
      expect(rowsByLabel('Modification Power Consumption').map(rowValueCells)).toEqual([['150 kW'], [DASHES]]);
    });

    it('should render dashes for a zero baseline', () => {
      render(makeOutput({ chillerLoadResults: [{ baseline: 0, modification: 5 }] }));
      expect(rowsByLabel('Baseline Power Consumption').map(rowValueCells)).toEqual([[DASHES]]);
      expect(rowsByLabel('Modification Power Consumption').map(rowValueCells)).toEqual([['5 kW']]);
    });

    it('should render no chiller tables when there are no chiller results', () => {
      render(makeOutput({ chillerLoadResults: [] }));
      expect(groupLabels()).toEqual(['Total Consumption and Savings']);
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(1);
    });

    it('should update the chiller tables when a new output arrives', () => {
      render(makeOutput());
      render(makeOutput({ chillerLoadResults: [{ baseline: 7, modification: 8 }, { baseline: 9, modification: 10 }, { baseline: 11, modification: 12 }] }));
      expect(groupLabels().length).toBe(4);
      expect(rowsByLabel('Baseline Power Consumption').map(rowValueCells)).toEqual([['7 kW'], ['9 kW'], ['11 kW']]);
    });
  });

  describe('totals table', () => {
    TOTAL_ROWS.forEach(row => {
      it(`should render ${row.field} when truthy`, () => {
        render(makeOutput());
        expect(rowsByLabel(row.label).map(rowValueCells)).toEqual([[row.expected]]);
      });

      it(`should render dashes when ${row.field} is zero`, () => {
        render(makeOutput({ [row.field]: 0 }));
        expect(rowsByLabel(row.label).map(rowValueCells)).toEqual([[DASHES]]);
      });
    });

    it('should hide everything again when the output is cleared', () => {
      render(makeOutput());
      render(undefined);
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
      expect(groupLabels()).toEqual([]);
    });
  });

  describe('destroy', () => {
    it('should stop following the output after destroy', () => {
      const output = makeOutput();
      render(output);
      fixture.destroy();
      chillerStagingOutput.next(makeOutput({ costSavings: 1 }));
      expect(component.output).toBe(output);
    });
  });
});
