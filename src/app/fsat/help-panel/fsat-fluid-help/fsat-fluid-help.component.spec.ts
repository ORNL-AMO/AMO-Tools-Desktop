import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FsatFluidHelpComponent } from './fsat-fluid-help.component';

const FIELD_HEADINGS: Array<{ field: string; heading: string }> = [
  { field: 'barometricPressure', heading: 'Barometric Pressure' },
  { field: 'gasType', heading: 'Gas Type' },
  { field: 'specificHeatRatio', heading: 'Specific Heat Ratio' },
  { field: 'inputType', heading: 'Method to Establish Gas Density' },
  { field: 'dryBulbTemp', heading: 'Dry Bulb Temperature' },
  { field: 'staticPressure', heading: 'Static Pressure' },
  { field: 'wetBulbTemp', heading: 'Wet Bulb Temperature' },
  { field: 'specificGravity', heading: 'Specific Gravity' },
  { field: 'specificHeatGas', heading: 'Specific Heat Gas (Cp)' },
  { field: 'relativeHumidity', heading: 'Relative Humidity' },
  { field: 'dewPoint', heading: 'Dew Point' },
  { field: 'gasDensity', heading: 'Gas Density' },
];

describe('FsatFluidHelpComponent', () => {
  let component: FsatFluidHelpComponent;
  let fixture: ComponentFixture<FsatFluidHelpComponent>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function showField(field: string): void {
    component.currentField = field;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FsatFluidHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FsatFluidHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('template visibility', () => {
    it('renders no field section when currentField is not a known field', () => {
      showField('unknownField');
      expect(getSections().length).toBe(0);
    });

    it('renders no field section when currentField is undefined', () => {
      fixture.detectChanges();
      expect(getSections().length).toBe(0);
    });

    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`shows only the ${heading} section when currentField is ${field}`, () => {
        showField(field);
        const sections = getSections();
        expect(sections.length).toBe(1);
        expect(sections[0].querySelector('h6').textContent.trim().startsWith(heading)).toBeTrue();
      });
    });

    it('shows the specific heat ratio flue gas image only for specificHeatRatio', () => {
      showField('gasType');
      expect(fixture.nativeElement.querySelector('img')).toBeNull();

      showField('specificHeatRatio');
      expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
    });

    it('hides the previous section and shows the new one when currentField changes', () => {
      showField('barometricPressure');
      showField('dewPoint');
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].querySelector('h6').textContent.trim().startsWith('Dew Point')).toBeTrue();
    });
  });
});
