import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BoilerResultsComponent } from './boiler-results.component';
import { Settings } from '../../../../shared/models/settings';
import { BoilerInput } from '../../../../shared/models/steam/steam-inputs';
import { BoilerOutput } from '../../../../shared/models/steam/steam-outputs';

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

const MOCK_INPUT = { blowdownRate: 2, combustionEfficiency: 85 } as BoilerInput;

function makeResults(qualities: Array<number>): BoilerOutput {
  return {
    feedwaterQuality: qualities[0],
    blowdownQuality: qualities[1],
    steamQuality: qualities[2],
    boilerEnergy: 50.25,
    fuelEnergy: 59.11
  } as BoilerOutput;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('BoilerResultsComponent', () => {
  let component: BoilerResultsComponent;
  let fixture: ComponentFixture<BoilerResultsComponent>;

  function getRow(label: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('tr'))
      .find((tr: HTMLElement) => normalize(tr.querySelector('td').textContent) === label) as HTMLElement;
  }

  function getRowCells(label: string): Array<string> {
    return Array.from(getRow(label).querySelectorAll('td')).slice(1).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function render(results: BoilerOutput): void {
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoilerResultsComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(BoilerResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('inputData', MOCK_INPUT);
  });

  describe('output rendering', () => {
    it('renders the input and result summary values', () => {
      render(makeResults([0, 0, 1]));
      expect(getRowCells('Blowdown Rate')).toEqual(['2 %']);
      expect(getRowCells('Combustion Efficiency')).toEqual(['85 %']);
      expect(getRowCells('Boiler Energy')).toEqual(['50.3 MMBtu']);
      expect(getRowCells('Fuel Energy')).toEqual(['59.1 MMBtu']);
    });

    it('updates the table string from the rendered table', () => {
      render(makeResults([0, 0, 1]));
      component.updateTable0String();
      expect(component.table0String).toContain('Feedwater');
    });
  });

  describe('template visibility', () => {
    const QUALITY_CASES: Array<{ qualities: Array<number>, expected: Array<string> }> = [
      { qualities: [0, 0, 0], expected: ['Liquid', 'Liquid', 'Liquid'] },
      { qualities: [1, 1, 1], expected: ['Gas', 'Gas', 'Gas'] },
      { qualities: [0.456, 0.5, 0.25], expected: ['0.46', '0.5', '0.25'] },
      { qualities: [0, 0.5, 1], expected: ['Liquid', '0.5', 'Gas'] },
    ];

    QUALITY_CASES.forEach(qualityCase => {
      it(`renders saturated cells ${qualityCase.expected.join(', ')} for qualities ${qualityCase.qualities.join(', ')}`, () => {
        render(makeResults(qualityCase.qualities));
        expect(getRowCells('Saturated')).toEqual(qualityCase.expected);
      });
    });

    it('renders exactly one quality span per cell', () => {
      render(makeResults([0, 0.5, 1]));
      Array.from(getRow('Saturated').querySelectorAll('td')).slice(1).forEach((cell: HTMLElement) => {
        expect(cell.querySelectorAll('span').length).toBe(1);
      });
    });
  });
});
