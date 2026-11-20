import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { TurbineResultsComponent } from './turbine-results.component';
import { TurbineOutput } from '../../../../shared/models/steam/steam-outputs';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string, suffix?: string): string {
    return (value ?? '') + (suffix || '');
  }
}

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
  steamPowerMeasurement: 'kW',
  steamEnergyMeasurement: 'MMBtu',
} as Settings;

function makeResults(inletQuality: number, outletIdealQuality: number, outletQuality: number): TurbineOutput {
  return {
    energyOut: 1, generatorEfficiency: 95, inletEnergyFlow: 2, inletPressure: 3, inletQuality: inletQuality,
    inletSpecificEnthalpy: 4, inletSpecificEntropy: 5, inletTemperature: 6, isentropicEfficiency: 70, massFlow: 7,
    outletEnergyFlow: 8, outletPressure: 9, outletQuality: outletQuality, outletSpecificEnthalpy: 10, outletSpecificEntropy: 11,
    outletTemperature: 12, powerOut: 13, inletVolume: 0, outletVolume: 0, outletIdealPressure: 14, outletIdealTemperature: 15,
    outletIdealSpecificEnthalpy: 16, outletIdealSpecificEntropy: 17, outletIdealQuality: outletIdealQuality, outletIdealVolume: 0
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('TurbineResultsComponent', () => {
  let component: TurbineResultsComponent;
  let fixture: ComponentFixture<TurbineResultsComponent>;

  function createComponent(results: TurbineOutput): void {
    fixture = TestBed.createComponent(TurbineResultsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('results', results);
    fixture.detectChanges();
  }

  function phaseCells(): Array<string> {
    const rows: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('table tbody tr'));
    const phaseRow = rows.find(row => normalize(row.querySelector('td').textContent) === 'Phase');
    return Array.from(phaseRow.querySelectorAll('td')).slice(1).map((cell: HTMLElement) => normalize(cell.textContent));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurbineResultsComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('phase display', () => {
    it('shows Liquid for quality 0', () => {
      createComponent(makeResults(0, 0, 0));
      expect(phaseCells()).toEqual(['Liquid', 'Liquid', 'Liquid']);
    });

    it('shows Gas for quality 1', () => {
      createComponent(makeResults(1, 1, 1));
      expect(phaseCells()).toEqual(['Gas', 'Gas', 'Gas']);
    });

    it('shows the quality value for mixed phases', () => {
      createComponent(makeResults(0.5, 0.25, 0.756));
      expect(phaseCells()).toEqual(['0.5', '0.25', '0.76']);
    });

    it('shows each column independently', () => {
      createComponent(makeResults(0, 1, 0.3));
      expect(phaseCells()).toEqual(['Liquid', 'Gas', '0.3']);
    });
  });

  describe('result rendering', () => {
    it('renders summary values', () => {
      createComponent(makeResults(1, 1, 1));
      const firstRows = Array.from(fixture.nativeElement.querySelectorAll('table tbody tr')).slice(0, 4)
        .map((row: HTMLElement) => normalize(row.querySelectorAll('td')[1].textContent));
      expect(firstRows).toEqual(['70 %', '1 MMBtu/hr', '95 %', '13 kW']);
    });

    it('captures the table text for copy', () => {
      createComponent(makeResults(1, 1, 1));
      component.updateTable0String();
      expect(component.table0String).toContain('Isentropic Efficiency');
    });
  });
});
