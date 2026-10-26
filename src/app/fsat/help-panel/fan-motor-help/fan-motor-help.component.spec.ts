import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { FanMotorHelpComponent } from './fan-motor-help.component';

const FIELD_HEADINGS: Array<{ field: string; heading: string }> = [
  { field: 'lineFrequency', heading: 'Line Frequency' },
  { field: 'motorRatedPower', heading: 'Motor Rated Power' },
  { field: 'motorRPM', heading: 'Motor RPM' },
  { field: 'efficiencyClass', heading: 'Efficiency Class' },
  { field: 'specifiedEfficiency', heading: 'Efficiency' },
  { field: 'motorVoltage', heading: 'Rated Voltage' },
  { field: 'fullLoadAmps', heading: 'Full Load Amps' },
];

describe('FanMotorHelpComponent', () => {
  let component: FanMotorHelpComponent;
  let fixture: ComponentFixture<FanMotorHelpComponent>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function showField(field: string): void {
    component.currentField = field;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FanMotorHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanMotorHelpComponent);
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
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Motor Help');
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

    it('shows both motor efficiency rpm tables only for motorRPM', () => {
      showField('lineFrequency');
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(0);

      showField('motorRPM');
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(2);
    });

    it('hides the previous section and shows the new one when currentField changes', () => {
      showField('lineFrequency');
      showField('fullLoadAmps');
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].querySelector('h6').textContent.trim().startsWith('Full Load Amps')).toBeTrue();
    });
  });
});
