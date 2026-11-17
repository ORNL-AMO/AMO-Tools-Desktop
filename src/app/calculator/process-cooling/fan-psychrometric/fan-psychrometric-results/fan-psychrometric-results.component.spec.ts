import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanPsychrometricResultsComponent } from './fan-psychrometric-results.component';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { BaseGasDensity, PsychrometricResults } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  fanTemperatureMeasurement: 'F',
  densityMeasurement: 'lbscf',
  fanBarometricPressure: 'inHg',
  fanPressureMeasurement: 'inH2o',
} as Settings;
const METRIC_SETTINGS = {
  unitsOfMeasure: 'Metric',
  fanTemperatureMeasurement: 'C',
  densityMeasurement: 'kgNm3',
  fanBarometricPressure: 'kPa',
  fanPressureMeasurement: 'Pa',
} as Settings;

function makeResults(overrides: Partial<PsychrometricResults> = {}): PsychrometricResults {
  return {
    relativeHumidity: 88.16,
    wetBulbTemp: 119.04,
    dewPoint: 118.27,
    enthalpy: 101.44,
    gasDensity: 0.0547,
    specificVolume: 18.278,
    saturationPressure: 3.7364,
    saturatedHumidity: 0.10321,
    absolutePressure: 361.12,
    saturationDegree: 0.8781,
    humidityRatio: 0.09063,
    ...overrides,
  } as PsychrometricResults;
}

function makeInputData(overrides: Partial<BaseGasDensity> = {}): BaseGasDensity {
  return { dryBulbTemp: 123, barometricPressure: 26.57, inputType: 'wetBulb', ...overrides } as BaseGasDensity;
}

function makeFanPsychrometricService(): Partial<FanPsychrometricService> {
  return {
    calculatedBaseGasDensity: new BehaviorSubject<PsychrometricResults>(undefined),
    baseGasDensityData: new BehaviorSubject<BaseGasDensity>(makeInputData()),
    checkWarnings: jasmine.createSpy('checkWarnings').and.callFake(FanPsychrometricService.prototype.checkWarnings),
  };
}

// Row order in the results table, with the formatted value for makeResults() + makeInputData().
const RESULT_ROWS: Array<{ field: keyof PsychrometricResults, label: string, value: string }> = [
  { field: 'dryBulbTemp', label: 'Dry Bulb', value: '123' },
  { field: 'relativeHumidity', label: 'Relative Humidity (%)', value: '88.2' },
  { field: 'wetBulbTemp', label: 'Wet Bulb', value: '119' },
  { field: 'dewPoint', label: 'Dew Point', value: '118.3' },
  { field: 'enthalpy', label: 'Enthalpy', value: '101.4' },
  { field: 'gasDensity', label: 'Air Density', value: '0.05470' },
  { field: 'specificVolume', label: 'Specific Volume', value: '18.28' },
  { field: 'barometricPressure', label: 'Barometric Pressure', value: '26.57' },
  { field: 'saturationPressure', label: 'Saturation Pressure', value: '3.736' },
  { field: 'saturatedHumidity', label: 'Saturated Humidity Ratio', value: '0.103' },
  { field: 'absolutePressure', label: 'Absolute Pressure', value: '361.12' },
  { field: 'saturationDegree', label: 'Degree of Saturation', value: '0.878' },
  { field: 'humidityRatio', label: 'Humidity Ratio', value: '0.0906' },
];

describe('FanPsychrometricResultsComponent', () => {
  let component: FanPsychrometricResultsComponent;
  let fixture: ComponentFixture<FanPsychrometricResultsComponent>;
  let fanPsychrometricService: Partial<FanPsychrometricService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getRows(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('table tbody tr'));
  }

  function getValueText(rowIndex: number): string {
    return getRows()[rowIndex].querySelectorAll('td')[1].textContent.trim();
  }

  function getUnitSpans(rowIndex: number): Array<string> {
    return Array.from(getRows()[rowIndex].querySelectorAll('td')[0].querySelectorAll('span'))
      .map((span: HTMLElement) => span.textContent.trim());
  }

  function getWarnings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.alert-warning'))
      .map((warning: HTMLElement) => warning.textContent.trim());
  }

  function emitResults(results: PsychrometricResults): void {
    fanPsychrometricService.calculatedBaseGasDensity.next(results);
    fixture.detectChanges();
  }

  function createComponent(settings: Settings = IMPERIAL_SETTINGS): void {
    fixture = TestBed.createComponent(FanPsychrometricResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('resultDataTable', []);
    fixture.componentRef.setInput('psychrometricResultsTable', undefined);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    fanPsychrometricService = makeFanPsychrometricService();

    await TestBed.configureTestingModule({
      declarations: [FanPsychrometricResultsComponent],
      imports: [SharedPipesModule],
      providers: [
        ConvertUnitsService,
        { provide: FanPsychrometricService, useValue: fanPsychrometricService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('checks warnings for the initial (empty) results', () => {
      createComponent();
      expect(fanPsychrometricService.checkWarnings).toHaveBeenCalledWith(undefined);
      expect(component.psychrometricResults).toBeUndefined();
    });

    it('copies barometric pressure and dry bulb temp from the input data onto the results', () => {
      createComponent();
      emitResults(makeResults());
      expect(component.psychrometricResults.barometricPressure).toBe(26.57);
      expect(component.psychrometricResults.dryBulbTemp).toBe(123);
    });

    it('always renders the saved results table child', () => {
      createComponent();
      expect(query('app-fan-psychrometric-table')).not.toBeNull();
    });
  });

  describe('result values', () => {
    it('shows a dash in every row when there are no results', () => {
      createComponent();
      expect(getRows().length).toBe(RESULT_ROWS.length);
      RESULT_ROWS.forEach((row, index) => expect(getValueText(index)).withContext(row.label).toBe('—'));
    });

    RESULT_ROWS.forEach((row, index) => {
      it(`shows the formatted ${row.field} value`, () => {
        createComponent();
        emitResults(makeResults());
        expect(getRows()[index].querySelector('td').textContent.trim()).toContain(row.label);
        expect(getValueText(index)).toBe(row.value);
      });
    });

    RESULT_ROWS.filter(row => row.field !== 'dryBulbTemp' && row.field !== 'barometricPressure').forEach(row => {
      it(`shows a dash for a zero ${row.field} while other values render`, () => {
        createComponent();
        emitResults(makeResults({ [row.field]: 0 }));
        const index = RESULT_ROWS.indexOf(row);
        expect(getValueText(index)).toBe('—');
        const otherIndex = index === 1 ? 2 : 1;
        expect(getValueText(otherIndex)).toBe(RESULT_ROWS[otherIndex].value);
      });
    });

    it('shows a dash for dry bulb and barometric pressure when the input data has none', () => {
      fanPsychrometricService.baseGasDensityData.next(makeInputData({ dryBulbTemp: 0, barometricPressure: 0 }));
      createComponent();
      emitResults(makeResults());
      expect(getValueText(0)).toBe('—');
      expect(getValueText(7)).toBe('—');
      expect(getValueText(1)).toBe('88.2');
    });

    it('updates the values when new results arrive', () => {
      createComponent();
      emitResults(makeResults());
      emitResults(makeResults({ relativeHumidity: 40.04 }));
      expect(getValueText(1)).toBe('40');
    });
  });

  describe('unit labels', () => {
    it('shows imperial enthalpy and specific volume units', () => {
      createComponent(IMPERIAL_SETTINGS);
      expect(getUnitSpans(4)).toEqual(['(btu/lb)']);
      expect(getUnitSpans(6)).toEqual(['(ft3/lb)']);
    });

    it('shows metric enthalpy and specific volume units', () => {
      createComponent(METRIC_SETTINGS);
      expect(getUnitSpans(4)).toEqual(['(kJ/kg)']);
      expect(getUnitSpans(6)).toEqual(['(m3/kg)']);
    });
  });

  describe('warnings', () => {
    it('shows no warnings and the table for valid results', () => {
      createComponent();
      emitResults(makeResults());
      expect(getWarnings()).toEqual([]);
      expect(query('table')).not.toBeNull();
    });

    it('shows the humidity ratio warning and hides the table', () => {
      createComponent();
      emitResults(makeResults({ humidityRatio: -1 }));
      expect(getWarnings()).toEqual(['Data is producing a negative Humidity Ratio. Please review data']);
      expect(query('table')).toBeNull();
    });

    it('shows the saturation pressure warning and hides the table', () => {
      createComponent();
      emitResults(makeResults({ saturationPressure: -1 }));
      expect(getWarnings()).toEqual(['Data is producing a negative Saturation Pressure. Please review data']);
      expect(query('table')).toBeNull();
    });

    it('shows both warnings when both values are negative', () => {
      createComponent();
      emitResults(makeResults({ humidityRatio: -1, saturationPressure: -1 }));
      expect(getWarnings()).toEqual([
        'Data is producing a negative Humidity Ratio. Please review data',
        'Data is producing a negative Saturation Pressure. Please review data',
      ]);
    });

    it('restores the table when the warning clears', () => {
      createComponent();
      emitResults(makeResults({ humidityRatio: -1 }));
      emitResults(makeResults());
      expect(getWarnings()).toEqual([]);
      expect(query('table')).not.toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops following calculated results after destroy', () => {
      createComponent();
      (fanPsychrometricService.checkWarnings as jasmine.Spy).calls.reset();
      fixture.destroy();
      fanPsychrometricService.calculatedBaseGasDensity.next(makeResults());
      expect(fanPsychrometricService.checkWarnings).not.toHaveBeenCalled();
      expect(component.psychrometricResults).toBeUndefined();
    });
  });
});
