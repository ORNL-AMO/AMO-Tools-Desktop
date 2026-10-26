import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FanFieldDataHelpComponent } from './fan-field-data-help.component';

const FIELD_HEADINGS: Array<{ field: string; heading: string }> = [
  { field: 'operatingHours', heading: 'Operating Hours' },
  { field: 'inletPressure', heading: 'Inlet Pressure' },
  { field: 'outletPressure', heading: 'Outlet Pressure' },
  { field: 'flowRate', heading: 'Flow Rate' },
  { field: 'compressibilityFactor', heading: 'Compressibility Factor' },
  { field: 'cost', heading: 'Cost' },
  { field: 'loadEstimatedMethod', heading: 'Load Estimation Method' },
  { field: 'motorPower', heading: 'Motor Power or Motor Current' },
  { field: 'measuredVoltage', heading: 'Measured Voltage' },
  { field: 'modMeasuredVoltage', heading: 'Measured Voltage' },
  { field: 'implementationCosts', heading: 'Implementation Costs' },
];

describe('FanFieldDataHelpComponent', () => {
  let component: FanFieldDataHelpComponent;
  let fixture: ComponentFixture<FanFieldDataHelpComponent>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function showField(field: string): void {
    component.currentField = field;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FanFieldDataHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanFieldDataHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });
  });

  describe('template visibility', () => {
    it('renders the panel heading with no field section when currentField is not a known field', () => {
      showField('unknownField');
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Field Data Help');
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

    it('shows the modification warning only for modMeasuredVoltage', () => {
      showField('measuredVoltage');
      expect(fixture.nativeElement.querySelector('.alert-warning')).toBeNull();

      showField('modMeasuredVoltage');
      expect(fixture.nativeElement.querySelector('.alert-warning')).not.toBeNull();
    });

    it('hides the previous section and shows the new one when currentField changes', () => {
      showField('operatingHours');
      showField('flowRate');
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].querySelector('h6').textContent.trim().startsWith('Flow Rate')).toBeTrue();
    });
  });
});
