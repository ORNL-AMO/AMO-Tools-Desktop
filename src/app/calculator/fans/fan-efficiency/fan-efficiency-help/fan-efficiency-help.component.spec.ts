import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FanEfficiencyHelpComponent } from './fan-efficiency-help.component';

const HELP_SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'fanType', heading: 'Fan Type' },
  { field: 'fanSpeed', heading: 'Fan Speed' },
  { field: 'inletPressure', heading: 'Inlet Pressure' },
  { field: 'outletPressure', heading: 'Outlet Pressure' },
  { field: 'flowRate', heading: 'Flow Rate' },
  { field: 'compressibilityFactor', heading: 'Compressibility Factor' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FanEfficiencyHelpComponent', () => {
  let component: FanEfficiencyHelpComponent;
  let fixture: ComponentFixture<FanEfficiencyHelpComponent>;

  function getSectionHeadings(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2 > h6'))
      .map((heading: HTMLElement) => normalize(heading.childNodes[0].textContent));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FanEfficiencyHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FanEfficiencyHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('always renders the calculator help header', () => {
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toContain('Fan Achievable Efficiency Help');
    });
  });

  describe('template visibility', () => {
    it('renders no field section when currentField is undefined', () => {
      expect(getSectionHeadings()).toEqual([]);
    });

    it('renders no field section when currentField matches no section', () => {
      fixture.componentRef.setInput('currentField', 'unknownField');
      fixture.detectChanges();
      expect(getSectionHeadings()).toEqual([]);
    });

    HELP_SECTIONS.forEach(section => {
      it(`renders only the ${section.heading} section when currentField is ${section.field}`, () => {
        fixture.componentRef.setInput('currentField', section.field);
        fixture.detectChanges();
        expect(getSectionHeadings()).toEqual([section.heading]);
      });
    });

    it('renders the fan type options table only in the fanType section', () => {
      fixture.componentRef.setInput('currentField', 'fanType');
      fixture.detectChanges();
      const rowHeaders = Array.from(fixture.nativeElement.querySelectorAll('table th'))
        .map((cell: HTMLElement) => normalize(cell.textContent));
      expect(rowHeaders).toEqual(['SWSI', 'DWDI']);

      fixture.componentRef.setInput('currentField', 'fanSpeed');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
  });
});
