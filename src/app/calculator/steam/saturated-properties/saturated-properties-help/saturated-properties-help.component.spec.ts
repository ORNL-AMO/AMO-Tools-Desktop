import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { SaturatedPropertiesHelpComponent } from './saturated-properties-help.component';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = { steamPressureMeasurement: 'psig', steamTemperatureMeasurement: 'F' } as Settings;
const RANGES = { minTemp: 32, maxTemp: 705.1, minPressure: -14.696, maxPressure: 3185.4 };

const SECTIONS: Array<{ field: string, heading: string, min: string, max: string, unit: string }> = [
  { field: 'saturatedPressure', heading: 'Saturated Pressure', min: '-14.696', max: '3185.4', unit: 'psig' },
  { field: 'saturatedTemperature', heading: 'Saturated Temperature', min: '32', max: '705.1', unit: 'F' },
];

describe('SaturatedPropertiesHelpComponent', () => {
  let fixture: ComponentFixture<SaturatedPropertiesHelpComponent>;

  function sections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function createComponent(currentField: string): void {
    fixture = TestBed.createComponent(SaturatedPropertiesHelpComponent);
    fixture.componentRef.setInput('currentField', currentField);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('ranges', RANGES);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaturatedPropertiesHelpComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('always shows the help header', () => {
    createComponent('pressure');
    expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Saturated Properties Help');
  });

  it('shows no field section for an unrelated field', () => {
    createComponent('pressureOrTemperature');
    expect(sections().length).toBe(0);
  });

  SECTIONS.forEach(section => {
    it(`shows only the ${section.heading} section with its range when ${section.field} is focused`, () => {
      createComponent(section.field);
      const shown = sections();
      expect(shown.length).toBe(1);
      expect(shown[0].querySelector('h6').textContent).toContain(section.heading);
      const cells = shown[0].querySelectorAll('td');
      expect(cells[0].textContent).toContain(section.min);
      expect(cells[1].textContent).toContain(section.max);
      expect(cells[0].querySelector('span').innerHTML).toBe(section.unit);
    });
  });

  it('switches sections when the focused field changes', () => {
    createComponent('saturatedPressure');
    fixture.componentRef.setInput('currentField', 'saturatedTemperature');
    fixture.detectChanges();
    const shown = sections();
    expect(shown.length).toBe(1);
    expect(shown[0].textContent).toContain('Saturated Temperature');
  });
});
