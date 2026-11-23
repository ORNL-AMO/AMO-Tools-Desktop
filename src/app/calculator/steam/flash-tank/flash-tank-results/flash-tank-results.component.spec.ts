import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FlashTankResultsComponent } from './flash-tank-results.component';
import { Settings } from '../../../../shared/models/settings';
import { FlashTankOutput } from '../../../../shared/models/steam/steam-outputs';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
  steamEnergyMeasurement: 'MMBtu'
} as Settings;

function makeResults(qualities: Array<number>): FlashTankOutput {
  return {
    inletWaterQuality: qualities[0],
    outletGasQuality: qualities[1],
    outletLiquidQuality: qualities[2],
    inletWaterPressure: 200.456,
    outletGasPressure: 50,
    outletLiquidPressure: 50
  } as FlashTankOutput;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FlashTankResultsComponent', () => {
  let component: FlashTankResultsComponent;
  let fixture: ComponentFixture<FlashTankResultsComponent>;

  function getRow(label: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('tr'))
      .find((tr: HTMLElement) => normalize(tr.querySelector('td').textContent).startsWith(label)) as HTMLElement;
  }

  function getRowCells(label: string): Array<string> {
    return Array.from(getRow(label).querySelectorAll('td')).slice(1).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function render(results: FlashTankOutput): void {
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlashTankResultsComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FlashTankResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
  });

  describe('output rendering', () => {
    it('renders the result values with their units', () => {
      render(makeResults([1, 1, 0]));
      expect(normalize(getRow('Pressure').querySelector('td').textContent)).toBe('Pressure (psig)');
      expect(getRowCells('Pressure')).toEqual(['200.46', '50', '50']);
    });

    it('updates the table string from the rendered table', () => {
      render(makeResults([1, 1, 0]));
      component.updateTable0String();
      expect(component.table0String).toContain('Steam Out');
    });
  });

  describe('template visibility', () => {
    const QUALITY_CASES: Array<{ qualities: Array<number>, expected: Array<string> }> = [
      { qualities: [0, 0, 0], expected: ['Liquid', 'Liquid', 'Liquid'] },
      { qualities: [1, 1, 1], expected: ['Gas', 'Gas', 'Gas'] },
      { qualities: [0.456, 0.5, 0.25], expected: ['0.46', '0.5', '0.25'] },
      { qualities: [0.5, 1, 0], expected: ['0.5', 'Gas', 'Liquid'] },
    ];

    QUALITY_CASES.forEach(qualityCase => {
      it(`renders quality cells ${qualityCase.expected.join(', ')} for qualities ${qualityCase.qualities.join(', ')}`, () => {
        render(makeResults(qualityCase.qualities));
        expect(getRowCells('Quality')).toEqual(qualityCase.expected);
      });
    });

    it('renders exactly one quality span per cell', () => {
      render(makeResults([0.5, 1, 0]));
      Array.from(getRow('Quality').querySelectorAll('td')).slice(1).forEach((cell: HTMLElement) => {
        expect(cell.querySelectorAll('span').length).toBe(1);
      });
    });
  });
});
