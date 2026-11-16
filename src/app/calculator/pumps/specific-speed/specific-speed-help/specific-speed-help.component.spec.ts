import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SpecificSpeedHelpComponent } from './specific-speed-help.component';

const FIELD_HEADINGS: Array<{ field: string, heading: string }> = [
  { field: 'pumpType', heading: 'Pump Type' },
  { field: 'pumpRPM', heading: 'Pump Speed' },
  { field: 'flowRate', heading: 'Flow Rate' },
  { field: 'head', heading: 'Head' },
];

describe('SpecificSpeedHelpComponent', () => {
  let fixture: ComponentFixture<SpecificSpeedHelpComponent>;

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
      declarations: [SpecificSpeedHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecificSpeedHelpComponent);
  });

  describe('template visibility', () => {
    it('always renders the general help heading', () => {
      render(undefined);
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Specific Speed Help');
    });

    it('renders no field section when no field is focused', () => {
      render(undefined);
      expect(getFieldSections().length).toBe(0);
    });

    it('renders no field section for an unknown field', () => {
      render('notAField');
      expect(getFieldSections().length).toBe(0);
    });

    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`renders only the "${heading}" section when currentField is "${field}"`, () => {
        render(field);
        const sections = getFieldSections();
        expect(sections.length).toBe(1);
        expect(getSectionHeading(sections[0])).toBe(heading);
      });
    });

    it('renders the pump type reference tables only for the pumpType field', () => {
      render('pumpType');
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(3);
      render('pumpRPM');
      expect(fixture.nativeElement.querySelectorAll('table').length).toBe(0);
    });

    it('swaps sections when currentField changes', () => {
      render('flowRate');
      expect(getSectionHeading(getFieldSections()[0])).toBe('Flow Rate');
      render('head');
      expect(getFieldSections().length).toBe(1);
      expect(getSectionHeading(getFieldSections()[0])).toBe('Head');
    });
  });
});
