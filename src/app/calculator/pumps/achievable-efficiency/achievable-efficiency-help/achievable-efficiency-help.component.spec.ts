import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AchievableEfficiencyHelpComponent } from './achievable-efficiency-help.component';

const FIELD_HEADINGS: Array<{ field: string, heading: string }> = [
  { field: 'pumpType', heading: 'Pump Type' },
  { field: 'flowRate', heading: 'Flow Rate' },
  { field: 'rpm', heading: 'RPM' },
  { field: 'kinematicViscosity', heading: 'Kinematic Viscosity' },
  { field: 'stageCount', heading: 'Stage Count' },
  { field: 'head', heading: 'Head' },
  { field: 'pumpEfficiency', heading: 'Pump Efficiency' },
];

describe('AchievableEfficiencyHelpComponent', () => {
  let fixture: ComponentFixture<AchievableEfficiencyHelpComponent>;

  function getFieldSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > div.my-2'));
  }

  function getSectionHeading(section: HTMLElement): string {
    return section.querySelector('h6').firstChild.textContent.trim();
  }

  function render(currentField: string): void {
    fixture.componentRef.setInput('currentField', currentField);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AchievableEfficiencyHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AchievableEfficiencyHelpComponent);
  });

  describe('template visibility', () => {
    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`shows only the ${heading} section when currentField is '${field}'`, () => {
        render(field);
        const sections = getFieldSections();
        expect(sections.length).toBe(1);
        expect(getSectionHeading(sections[0])).toBe(heading);
      });
    });

    it('always shows the calculator title', () => {
      render(undefined);
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Pump Achievable Efficiency Help');
    });

    it('shows no field section when currentField is unset', () => {
      render(undefined);
      expect(getFieldSections().length).toBe(0);
    });

    it('shows no field section for an unknown field', () => {
      render('unknownField');
      expect(getFieldSections().length).toBe(0);
    });

    it('shows the pump type reference tables only with the Pump Type section', () => {
      render('pumpType');
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(3);
      render('flowRate');
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(0);
    });

    it('switches sections when currentField changes', () => {
      render('rpm');
      expect(getSectionHeading(getFieldSections()[0])).toBe('RPM');
      render('head');
      const sections = getFieldSections();
      expect(sections.length).toBe(1);
      expect(getSectionHeading(sections[0])).toBe('Head');
    });
  });
});
