import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReplaceExistingHelpComponent } from './replace-existing-help.component';

const FIELD_HEADINGS: Array<{ field: string, heading: string }> = [
  { field: 'operatingHours', heading: 'Operating Hours' },
  { field: 'motorSize', heading: 'Motor Size' },
  { field: 'existingEfficiency', heading: 'Efficiency of Existing Motor' },
  { field: 'load', heading: 'Load' },
  { field: 'electricityCost', heading: 'Electricity Cost' },
  { field: 'newEfficiency', heading: 'Efficiency of New Motor' },
  { field: 'purchaseCost', heading: 'Purchase Cost' },
  { field: 'rewindEfficiencyLoss', heading: 'Rewind Efficiency Loss' },
  { field: 'rewindCost', heading: 'Cost of Rewind' },
];

describe('ReplaceExistingHelpComponent', () => {
  let component: ReplaceExistingHelpComponent;
  let fixture: ComponentFixture<ReplaceExistingHelpComponent>;

  function getFieldSections(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('div.my-2'));
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
      declarations: [ReplaceExistingHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ReplaceExistingHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component', () => {
      render(undefined);
      expect(component).toBeTruthy();
    });

    it('always renders the calculator description', () => {
      render(undefined);
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Replace Existing Motor - Efficiency Upgrade');
    });
  });

  describe('template visibility', () => {
    it('renders no field help when no field is focused', () => {
      render(undefined);
      expect(getFieldSections().length).toBe(0);
    });

    it('renders no field help for an unknown field', () => {
      render('notAField');
      expect(getFieldSections().length).toBe(0);
    });

    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`renders only the ${field} help when ${field} is focused`, () => {
        render(field);
        const sections = getFieldSections();
        expect(sections.length).toBe(1);
        expect(getSectionHeading(sections[0])).toBe(heading);
      });
    });

    it('renders the operating hours range table only for operatingHours', () => {
      render('operatingHours');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('td'))
        .map((cell: HTMLElement) => cell.textContent.trim());
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);

      render('motorSize');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
  });
});
