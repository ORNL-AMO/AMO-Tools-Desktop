import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { HeatLossResultsComponent } from './heat-loss-results.component';
import { Settings } from '../../../../shared/models/settings';
import { HeatLossOutput } from '../../../../shared/models/steam/steam-outputs';

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

function makeResults(qualities: Array<number>): HeatLossOutput {
  return {
    inletQuality: qualities[0],
    outletQuality: qualities[1],
    heatLoss: 1.26,
    inletPressure: 200.04,
    outletPressure: 199.96
  } as HeatLossOutput;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('HeatLossResultsComponent', () => {
  let component: HeatLossResultsComponent;
  let fixture: ComponentFixture<HeatLossResultsComponent>;

  function getRow(label: string): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('tr'))
      .find((tr: HTMLElement) => normalize(tr.querySelector('td').textContent).startsWith(label)) as HTMLElement;
  }

  function getRowCells(label: string): Array<string> {
    return Array.from(getRow(label).querySelectorAll('td')).slice(1).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  function render(results: HeatLossOutput): void {
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HeatLossResultsComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HeatLossResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('percentHeatLoss', 2.04);
  });

  describe('output rendering', () => {
    it('renders the percent loss, heat loss and result values', () => {
      render(makeResults([1, 1]));
      expect(getRowCells('Percent Loss')).toEqual(['2 %']);
      expect(getRowCells('Heat Loss')).toEqual(['1.3 MMBtu']);
      expect(getRowCells('Pressure')).toEqual(['200', '200']);
    });

    it('updates the table string from the rendered table', () => {
      render(makeResults([1, 1]));
      component.updateTable0String();
      expect(component.table0String).toContain('Outlet Steam');
    });
  });

  describe('template visibility', () => {
    const QUALITY_CASES: Array<{ qualities: Array<number>, expected: Array<string> }> = [
      { qualities: [0, 0], expected: ['Liquid', 'Liquid'] },
      { qualities: [1, 1], expected: ['Gas', 'Gas'] },
      { qualities: [0.46, 0.5], expected: ['0.5', '0.5'] },
      { qualities: [1, 0.25], expected: ['Gas', '0.3'] },
      { qualities: [0, 1], expected: ['Liquid', 'Gas'] },
    ];

    QUALITY_CASES.forEach(qualityCase => {
      it(`renders phase cells ${qualityCase.expected.join(', ')} for qualities ${qualityCase.qualities.join(', ')}`, () => {
        render(makeResults(qualityCase.qualities));
        expect(getRowCells('Phase')).toEqual(qualityCase.expected);
      });
    });

    it('renders exactly one phase span per cell', () => {
      render(makeResults([1, 0.25]));
      Array.from(getRow('Phase').querySelectorAll('td')).slice(1).forEach((cell: HTMLElement) => {
        expect(cell.querySelectorAll('span').length).toBe(1);
      });
    });
  });
});
