import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CalculateOutletPressureHelpComponent } from './calculate-outlet-pressure-help.component';

const FIELD_HEADINGS: Array<{ field: string; heading: string }> = [
  { field: 'outletSystemEffectLoss', heading: 'Fan Outlet System Effect Equivalent Loss' },
  { field: 'outletDamperLoss', heading: 'Outlet Damper Loss' },
  { field: 'outletDuctworkLoss', heading: 'Outlet Ductwork Loss' },
  { field: 'airTreatmentLoss', heading: 'Air Treatment Loss' },
  { field: 'systemDamperLoss', heading: 'System Damper Loss' },
  { field: 'processRequirementsFixed', heading: 'Process Requirements (Discharge Side - Fixed)' },
  { field: 'processRequirements', heading: 'Process Requirements (Discharge Side - Variable)' },
];

describe('CalculateOutletPressureHelpComponent', () => {
  let component: CalculateOutletPressureHelpComponent;
  let fixture: ComponentFixture<CalculateOutletPressureHelpComponent>;

  function getSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2'));
  }

  function showField(field: string): void {
    component.currentField = field;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalculateOutletPressureHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculateOutletPressureHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('maps an inletLoss currentField to the outlet system effect section on init', () => {
      component.currentField = 'inletLoss';
      fixture.detectChanges();
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].querySelector('h6').textContent.trim().startsWith('Fan Outlet System Effect Equivalent Loss')).toBeTrue();
    });
  });

  describe('template visibility', () => {
    it('renders the panel heading and diagram with no field section when currentField is not a known field', () => {
      showField('unknownField');
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Estimate Outlet Pressure');
      expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
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

    it('hides the previous section and shows the new one when currentField changes', () => {
      showField(FIELD_HEADINGS[0].field);
      showField(FIELD_HEADINGS[1].field);
      const sections = getSections();
      expect(sections.length).toBe(1);
      expect(sections[0].querySelector('h6').textContent.trim().startsWith(FIELD_HEADINGS[1].heading)).toBeTrue();
    });
  });
});
