import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { SteamPropertiesHelpComponent } from './steam-properties-help.component';
import { Settings } from '../../../../shared/models/settings';
import { ThermodynamicQuantity } from '../../../../shared/models/steam/steam-inputs';

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
} as Settings;

const RANGES = { minPressure: -14.696, maxPressure: 3185, minQuantityValue: 32, maxQuantityValue: 700 };

const QUANTITIES: Array<{ quantity: ThermodynamicQuantity, heading: string, description: string, unit: string | null }> = [
  { quantity: ThermodynamicQuantity.TEMPERATURE, heading: 'Temperature', description: 'The temperature at the inlet.', unit: 'F' },
  { quantity: ThermodynamicQuantity.ENTHALPY, heading: 'Specific Enthalpy', description: 'Specific Enthalpy (h)', unit: 'btuLb' },
  { quantity: ThermodynamicQuantity.ENTROPY, heading: 'Specific Entropy', description: 'Specific Entropy (s)', unit: 'btulbF' },
  { quantity: ThermodynamicQuantity.QUALITY, heading: 'Saturated Quality', description: 'Quality is the vapor mass percentage', unit: null },
];

describe('SteamPropertiesHelpComponent', () => {
  let fixture: ComponentFixture<SteamPropertiesHelpComponent>;

  function sections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function createComponent(currentField: string, quantity: ThermodynamicQuantity = ThermodynamicQuantity.TEMPERATURE): void {
    fixture = TestBed.createComponent(SteamPropertiesHelpComponent);
    fixture.componentRef.setInput('currentField', currentField);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('ranges', RANGES);
    fixture.componentRef.setInput('thermodynamicQuantity', quantity);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SteamPropertiesHelpComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('field sections', () => {
    it('shows no field section for an unknown field', () => {
      createComponent('other');
      expect(sections().length).toBe(0);
    });

    it('shows only the pressure section with its range', () => {
      createComponent('pressure');
      const shown = sections();
      expect(shown.length).toBe(1);
      expect(shown[0].querySelector('h6').textContent).toContain('Pressure');
      const cells = shown[0].querySelectorAll('td');
      expect(cells[0].textContent).toContain('-14.696');
      expect(cells[1].textContent).toContain('3185');
      expect(cells[0].querySelector('span').innerHTML).toBe('psig');
    });

    it('shows only the known variable section', () => {
      createComponent('thermodynamicQuantity');
      const shown = sections();
      expect(shown.length).toBe(1);
      expect(shown[0].textContent).toContain('Known Variable');
      expect(shown[0].querySelector('table')).toBeNull();
    });

    it('shows only the known value section with its range', () => {
      createComponent('quantityValue');
      const shown = sections();
      expect(shown.length).toBe(1);
      const cells = shown[0].querySelectorAll('td');
      expect(cells[0].textContent).toContain('32');
      expect(cells[1].textContent).toContain('700');
    });
  });

  describe('known value section by quantity', () => {
    QUANTITIES.forEach(testCase => {
      it(`shows only the ${testCase.heading} heading and description`, () => {
        createComponent('quantityValue', testCase.quantity);
        const heading = sections()[0].querySelector('h6');
        const headingSpans = Array.from(heading.querySelectorAll(':scope > span'));
        expect(headingSpans.length).toBe(1);
        expect(headingSpans[0].textContent.trim()).toBe(testCase.heading);
        const descriptionSpans = Array.from(heading.querySelectorAll('small > span'));
        expect(descriptionSpans.length).toBe(1);
        expect(descriptionSpans[0].textContent).toContain(testCase.description);
      });

      it(`${testCase.unit ? 'shows the ' + testCase.unit : 'hides the'} unit for ${testCase.heading}`, () => {
        createComponent('quantityValue', testCase.quantity);
        const units = Array.from(sections()[0].querySelectorAll('td span')).map(span => span.innerHTML);
        if (testCase.unit) {
          expect(units).toEqual([testCase.unit, testCase.unit]);
        } else {
          expect(units).toEqual([]);
        }
      });
    });
  });
});
