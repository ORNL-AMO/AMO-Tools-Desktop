import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FanPsychrometricHelpComponent } from './fan-psychrometric-help.component';
import { FanPsychrometricService } from '../fan-psychrometric.service';

function makeFanPsychrometricService(): Partial<FanPsychrometricService> {
  return { currentField: new BehaviorSubject<string>('default') };
}

const HELP_SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'inputType', heading: 'Method to Establish Gas Density' },
  { field: 'dryBulbTemp', heading: 'Dry Bulb Temp' },
  { field: 'barometricPressure', heading: 'Barometric Pressure' },
  { field: 'relativeHumidity', heading: 'Relative Humidity' },
  { field: 'wetBulbTemp', heading: 'Wet Bulb Temp' },
  { field: 'dewPoint', heading: 'Dew Point' },
  { field: 'gasDensity', heading: 'Gas Density' },
  { field: 'altitude', heading: 'Altitude' },
];

describe('FanPsychrometricHelpComponent', () => {
  let component: FanPsychrometricHelpComponent;
  let fixture: ComponentFixture<FanPsychrometricHelpComponent>;
  let fanPsychrometricService: Partial<FanPsychrometricService>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > div.my-2'));
  }

  function getSectionHeading(section: HTMLElement): string {
    return section.querySelector('h6').firstChild.textContent.trim();
  }

  function setField(field: string): void {
    fanPsychrometricService.currentField.next(field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    fanPsychrometricService = makeFanPsychrometricService();

    await TestBed.configureTestingModule({
      declarations: [FanPsychrometricHelpComponent],
      providers: [
        { provide: FanPsychrometricService, useValue: fanPsychrometricService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanPsychrometricHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('reads the current field from the service', () => {
      expect(component.currentField).toBe('default');
    });

    it('always renders the calculator help header', () => {
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Psychrometric Calculator Help');
    });
  });

  describe('template visibility', () => {
    it('shows no field section for the default field', () => {
      expect(getSections().length).toBe(0);
    });

    it('shows no field section for an unknown field', () => {
      setField('specificHeatGas');
      expect(getSections().length).toBe(0);
    });

    HELP_SECTIONS.forEach(testCase => {
      it(`shows only the ${testCase.heading} section when ${testCase.field} is focused`, () => {
        setField(testCase.field);
        const sections = getSections();
        expect(sections.length).toBe(1);
        expect(getSectionHeading(sections[0])).toBe(testCase.heading);
      });
    });

    it('renders the gas density method table for inputType', () => {
      setField('inputType');
      const methods = Array.from(fixture.nativeElement.querySelectorAll('table tr td.w-25'))
        .map((cell: HTMLElement) => cell.textContent.trim());
      expect(methods).toEqual(['Relative Humidity %', 'Wet Bulb Temperature', 'Dew Point']);
    });

    it('switches sections when the focused field changes', () => {
      setField('dewPoint');
      setField('altitude');
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(getSectionHeading(sections[0])).toBe('Altitude');
    });
  });

  describe('destroy', () => {
    it('stops following the current field after destroy', () => {
      fixture.destroy();
      fanPsychrometricService.currentField.next('altitude');
      expect(component.currentField).toBe('default');
    });
  });
});
