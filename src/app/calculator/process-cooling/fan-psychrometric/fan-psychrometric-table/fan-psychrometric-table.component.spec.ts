import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FanPsychrometricTableComponent } from './fan-psychrometric-table.component';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { PsychrometricResults } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial', fanTemperatureMeasurement: 'F' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric', fanTemperatureMeasurement: 'C' } as Settings;

function makeResult(overrides: Partial<PsychrometricResults> = {}): PsychrometricResults {
  return {
    dryBulbTemp: 123,
    relativeHumidity: 88.123,
    wetBulbTemp: 119,
    dewPoint: 118.27,
    enthalpy: 101.44,
    ...overrides,
  } as PsychrometricResults;
}

describe('FanPsychrometricTableComponent', () => {
  let component: FanPsychrometricTableComponent;
  let fixture: ComponentFixture<FanPsychrometricTableComponent>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getBodyRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table tbody tr'));
  }

  function getCellTexts(row: HTMLElement): Array<string> {
    return Array.from(row.querySelectorAll('td')).map((cell: HTMLElement) => cell.textContent.trim());
  }

  function getEnthalpyHeader(): HTMLElement {
    return fixture.nativeElement.querySelectorAll('table thead th')[4];
  }

  function createComponent(inputs: { settings?: Settings, resultData?: Array<PsychrometricResults>, psychrometricResults?: PsychrometricResults } = {}): void {
    fixture = TestBed.createComponent(FanPsychrometricTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', inputs.settings ?? IMPERIAL_SETTINGS);
    fixture.componentRef.setInput('resultData', inputs.resultData ?? []);
    fixture.componentRef.setInput('psychrometricResults', inputs.psychrometricResults);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FanPsychrometricTableComponent],
      imports: [SharedPipesModule],
      providers: [
        ConvertUnitsService,
        { provide: FanPsychrometricService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('enthalpy units', () => {
    it('shows btu/lb for imperial settings', () => {
      createComponent({ settings: IMPERIAL_SETTINGS });
      const spans = Array.from(getEnthalpyHeader().querySelectorAll('span')).map((span: HTMLElement) => span.textContent.trim());
      expect(spans).toEqual(['h', 'btu/lb']);
    });

    it('shows kJ/kg for metric settings', () => {
      createComponent({ settings: METRIC_SETTINGS });
      const spans = Array.from(getEnthalpyHeader().querySelectorAll('span')).map((span: HTMLElement) => span.textContent.trim());
      expect(spans).toEqual(['h', 'kJ/kg']);
    });
  });

  describe('result rows', () => {
    it('shows a single placeholder row when there are no results', () => {
      createComponent({ resultData: [] });
      const rows = getBodyRows();
      expect(rows.length).toBe(1);
      expect(getCellTexts(rows[0])).toEqual(['—', '—', '—', '—', '—', '—']);
      expect(query('.delete-row')).toBeNull();
    });

    it('renders one formatted row per result without the placeholder', () => {
      createComponent({ resultData: [makeResult(), makeResult({ dryBulbTemp: 80, relativeHumidity: 50 })] });
      const rows = getBodyRows();
      expect(rows.length).toBe(2);
      expect(getCellTexts(rows[0])).toEqual(['123', '88.12', '119', '118.3', '101.4', 'Delete']);
      expect(getCellTexts(rows[1])[0]).toBe('80');
      expect(getCellTexts(rows[1])[1]).toBe('50');
    });

    it('returns to the placeholder row after the last result is deleted', () => {
      createComponent({ resultData: [makeResult()] });
      (query('.delete-row') as HTMLElement).click();
      fixture.detectChanges();
      const rows = getBodyRows();
      expect(rows.length).toBe(1);
      expect(getCellTexts(rows[0])[0]).toBe('—');
    });
  });

  describe('user actions', () => {
    it('disables Create Row when there is no current result', () => {
      createComponent({ psychrometricResults: undefined });
      expect((query('.btn-add-row') as HTMLButtonElement).disabled).toBeTrue();
    });

    it('enables Create Row when there is a current result', () => {
      createComponent({ psychrometricResults: makeResult() });
      expect((query('.btn-add-row') as HTMLButtonElement).disabled).toBeFalse();
    });

    it('adds the current result as a row when Create Row is clicked', () => {
      const resultData: Array<PsychrometricResults> = [];
      const current = makeResult();
      createComponent({ resultData: resultData, psychrometricResults: current });
      (query('.btn-add-row') as HTMLElement).click();
      fixture.detectChanges();
      expect(resultData).toEqual([current]);
      expect(getBodyRows().length).toBe(1);
      expect(getCellTexts(getBodyRows()[0])[0]).toBe('123');
    });

    it('deletes the clicked row only', () => {
      const first = makeResult({ dryBulbTemp: 1 });
      const second = makeResult({ dryBulbTemp: 2 });
      const third = makeResult({ dryBulbTemp: 3 });
      const resultData = [first, second, third];
      createComponent({ resultData: resultData });
      (getBodyRows()[1].querySelector('.delete-row') as HTMLElement).click();
      fixture.detectChanges();
      expect(resultData).toEqual([first, third]);
      expect(getBodyRows().map(row => getCellTexts(row)[0])).toEqual(['1', '3']);
    });

    it('builds the copy string without the Delete labels', () => {
      createComponent({ resultData: [makeResult()] });
      component.updateTableString();
      expect(component.tableString).toContain('123');
      expect(component.tableString).not.toContain('Delete');
    });
  });
});
