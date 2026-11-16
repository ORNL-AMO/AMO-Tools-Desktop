import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NemaEnergyEfficiencyHelpComponent } from './nema-energy-efficiency-help.component';

const FIELD_SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'frequency', heading: 'Line Frequency' },
  { field: 'horsePower', heading: 'Horse Power' },
  { field: 'motorRPM', heading: 'Motor RPM' },
  { field: 'efficiencyClass', heading: 'Efficiency Class' },
  { field: 'efficiency', heading: 'Efficiency' },
];

describe('NemaEnergyEfficiencyHelpComponent', () => {
  let fixture: ComponentFixture<NemaEnergyEfficiencyHelpComponent>;

  function getSectionHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.my-2 > h6'))
      .map((heading: HTMLElement) => heading.firstChild.textContent.trim());
  }

  function render(currentField: string): void {
    fixture.componentRef.setInput('currentField', currentField);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NemaEnergyEfficiencyHelpComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    fixture = TestBed.createComponent(NemaEnergyEfficiencyHelpComponent);
  });

  describe('template visibility', () => {
    it('renders only the general help when no field is focused', () => {
      render(undefined);
      expect(fixture.nativeElement.textContent).toContain('NEMA Energy Efficiency Help');
      expect(getSectionHeadings()).toEqual([]);
    });

    it('renders no field section for an unknown field', () => {
      render('unknownField');
      expect(getSectionHeadings()).toEqual([]);
    });

    FIELD_SECTIONS.forEach(({ field, heading }) => {
      it(`renders only the "${heading}" section when currentField is ${field}`, () => {
        render(field);
        expect(getSectionHeadings()).toEqual([heading]);
      });
    });

    it('renders the motor RPM range tables only for motorRPM', () => {
      render('motorRPM');
      const labels = Array.from(fixture.nativeElement.querySelectorAll('label.group-label'))
        .map((label: HTMLElement) => label.textContent.trim());
      expect(labels).toEqual(['Standard and Energy Efficient Motors', 'Premium Efficient Motors']);

      render('horsePower');
      expect(fixture.nativeElement.querySelectorAll('label.group-label').length).toBe(0);
    });

    it('renders the efficiency min/max table only for efficiency', () => {
      render('efficiency');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('td'))
        .map((cell: HTMLElement) => cell.textContent.trim());
      expect(cells).toEqual(['1%', '100%']);

      render('frequency');
      expect(fixture.nativeElement.querySelectorAll('td').length).toBe(0);
    });

    it('swaps the section when the focused field changes', () => {
      render('frequency');
      expect(getSectionHeadings()).toEqual(['Line Frequency']);
      render('efficiencyClass');
      expect(getSectionHeadings()).toEqual(['Efficiency Class']);
    });
  });
});
