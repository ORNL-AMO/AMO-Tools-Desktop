import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { DeaeratorResultsComponent } from './deaerator-results.component';
import { Settings } from '../../../../shared/models/settings';
import { DeaeratorOutput } from '../../../../shared/models/steam/steam-outputs';

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

function makeResults(qualities: Array<number>): DeaeratorOutput {
  return {
    inletWaterQuality: qualities[0],
    inletSteamQuality: qualities[1],
    ventedSteamQuality: qualities[2],
    feedwaterQuality: qualities[3],
    inletWaterPressure: 14.123,
    inletSteamPressure: 20,
    ventedSteamPressure: 14,
    feedwaterPressure: 14
  } as DeaeratorOutput;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('DeaeratorResultsComponent', () => {
  let component: DeaeratorResultsComponent;
  let fixture: ComponentFixture<DeaeratorResultsComponent>;

  function getRowCells(label: string): Array<string> {
    const row = Array.from(fixture.nativeElement.querySelectorAll('tr'))
      .find((tr: HTMLElement) => normalize(tr.querySelector('td').textContent).startsWith(label)) as HTMLElement;
    return Array.from(row.querySelectorAll('td')).slice(1).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function render(results: DeaeratorOutput): void {
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeaeratorResultsComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(DeaeratorResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
  });

  describe('output rendering', () => {
    it('renders the result values with their units', () => {
      render(makeResults([0, 1, 1, 0]));
      expect(normalize(fixture.nativeElement.querySelectorAll('tr')[1].querySelector('td').textContent)).toBe('Pressure (psig)');
      expect(getRowCells('Pressure')).toEqual(['14.12', '20', '14', '14']);
    });

    it('updates the table string from the rendered table', () => {
      render(makeResults([0, 1, 1, 0]));
      component.updateTable0String();
      expect(component.table0String).toContain('Inlet Water');
    });
  });

  describe('template visibility', () => {
    const QUALITY_CASES: Array<{ qualities: Array<number>, expected: Array<string> }> = [
      { qualities: [0, 0, 0, 0], expected: ['Liquid', 'Liquid', 'Liquid', 'Liquid'] },
      { qualities: [1, 1, 1, 1], expected: ['Gas', 'Gas', 'Gas', 'Gas'] },
      { qualities: [0.456, 0.5, 0.25, 0.75], expected: ['0.46', '0.5', '0.25', '0.75'] },
      { qualities: [0, 1, 0.5, 0], expected: ['Liquid', 'Gas', '0.5', 'Liquid'] },
    ];

    QUALITY_CASES.forEach(qualityCase => {
      it(`renders quality cells ${qualityCase.expected.join(', ')} for qualities ${qualityCase.qualities.join(', ')}`, () => {
        render(makeResults(qualityCase.qualities));
        expect(getRowCells('Quality')).toEqual(qualityCase.expected);
      });
    });

    it('renders exactly one quality span per cell', () => {
      render(makeResults([0, 1, 0.5, 0]));
      const row = Array.from(fixture.nativeElement.querySelectorAll('tr'))
        .find((tr: HTMLElement) => normalize(tr.querySelector('td').textContent) === 'Quality') as HTMLElement;
      Array.from(row.querySelectorAll('td')).slice(1).forEach((cell: HTMLElement) => {
        expect(cell.querySelectorAll('span').length).toBe(1);
      });
    });
  });
});
