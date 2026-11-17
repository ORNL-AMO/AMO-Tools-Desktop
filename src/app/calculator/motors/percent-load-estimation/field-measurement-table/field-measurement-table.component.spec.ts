import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FieldMeasurementTableComponent } from './field-measurement-table.component';
import { FieldMeasurementOutputs } from '../percent-load-estimation.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';

function makeResults(overrides: Partial<FieldMeasurementOutputs> = {}): FieldMeasurementOutputs {
  return {
    averageCurrent: 37,
    averageVoltage: 469.67,
    inputPower: 18.5,
    percentLoad: 52.4,
    maxVoltageDeviation: 3.33,
    voltageUnbalance: 0.7,
    ...overrides,
  };
}

describe('FieldMeasurementTableComponent', () => {
  let component: FieldMeasurementTableComponent;
  let fixture: ComponentFixture<FieldMeasurementTableComponent>;

  function getRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('tbody tr'));
  }

  function getValueCell(label: string): string {
    const row = getRows().find(tr => tr.querySelector('td').textContent.trim() === label);
    return row ? row.querySelectorAll('td')[1].textContent.trim() : null;
  }

  function createComponent(results: FieldMeasurementOutputs | undefined): void {
    fixture = TestBed.createComponent(FieldMeasurementTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('fieldMeasurementResults', results);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedPipesModule],
      declarations: [FieldMeasurementTableComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('template visibility', () => {
    it('renders no result rows when there are no results', () => {
      createComponent(undefined);
      expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('tbody')).toBeNull();
      expect(getRows().length).toBe(0);
    });

    it('renders the six result rows when results exist', () => {
      createComponent(makeResults());
      expect(getRows().length).toBe(6);
    });

    it('hides the rows again when results are cleared', () => {
      createComponent(makeResults());
      fixture.componentRef.setInput('fieldMeasurementResults', undefined);
      fixture.detectChanges();
      expect(getRows().length).toBe(0);
    });
  });

  describe('output rendering', () => {
    beforeEach(() => {
      createComponent(makeResults());
    });

    it('renders each result with its unit', () => {
      expect(getValueCell('Average Current')).toBe('37.000 A');
      expect(getValueCell('Average Voltage')).toBe('469.67 V');
      expect(getValueCell('Input Power')).toBe('18.500 kW');
      expect(getValueCell('Percent Load')).toBe('52 %');
      expect(getValueCell('Maximum Voltage Deviation from Average')).toBe('3.3300 V');
      expect(getValueCell('Voltage Unbalanced')).toBe('1 %');
    });

    it('renders updated results when the input changes', () => {
      fixture.componentRef.setInput('fieldMeasurementResults', makeResults({ percentLoad: 80, averageCurrent: 50 }));
      fixture.detectChanges();
      expect(getValueCell('Percent Load')).toBe('80 %');
      expect(getValueCell('Average Current')).toBe('50.000 A');
    });
  });
});
