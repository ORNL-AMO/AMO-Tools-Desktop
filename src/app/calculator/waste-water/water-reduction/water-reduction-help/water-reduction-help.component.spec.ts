import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { WaterReductionHelpComponent } from './water-reduction-help.component';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;

// Each field-specific help block, keyed by the currentField value that shows it.
const HELP_SECTIONS: Array<{ field: string, heading: string }> = [
  { field: 'waterType', heading: 'Water Type' },
  { field: 'operationHours', heading: 'Annual Operating Hours' },
  { field: 'waterCost', heading: 'Water Cost' },
  { field: 'measurementMethod', heading: 'Method of Measurement' },
  { field: 'meterReading', heading: 'Meter Reading' },
  { field: 'initialMeterReading', heading: 'Initial Meter Reading' },
  { field: 'finalMeterReading', heading: 'Final Meter Reading' },
  { field: 'elapsedTime', heading: 'Elapsed Time' },
  { field: 'bucketVolume', heading: 'Bucket Volume' },
  { field: 'bucketFillTime', heading: 'Bucket Fill Time' },
  { field: 'consumption', heading: 'Consumption' },
];

describe('WaterReductionHelpComponent', () => {
  let component: WaterReductionHelpComponent;
  let fixture: ComponentFixture<WaterReductionHelpComponent>;

  // The heading text of each field-specific help block currently rendered (the first text node of its h6).
  function getFieldHeadings(): Array<string> {
    const blocks: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('.help-info > div.my-2'));
    return blocks
      .map(block => block.querySelector('h6'))
      .filter(h6 => h6 && h6.firstChild && h6.firstChild.nodeType === Node.TEXT_NODE)
      .map(h6 => h6.firstChild.textContent.trim())
      .filter(text => text.length > 0);
  }

  function render(currentField: string): void {
    fixture.componentRef.setInput('currentField', currentField);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WaterReductionHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(WaterReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('isWastewater', false);
  });

  describe('initialization', () => {
    it('creates the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('always shows the general help and the documentation link', () => {
      render(undefined);
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Water/Wastewater Reduction Help');
      const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.click-link');
      expect(link.getAttribute('href')).toBe(component.docsLink + 'group__water__reduction__calculator');
    });
  });

  describe('template visibility', () => {
    it('shows no field-specific help when no field is focused', () => {
      render(undefined);
      expect(getFieldHeadings()).toEqual([]);
    });

    it('shows no field-specific help for an unknown field', () => {
      render('isWastewater');
      expect(getFieldHeadings()).toEqual([]);
    });

    HELP_SECTIONS.forEach(section => {
      it(`shows only the "${section.heading}" help when currentField is "${section.field}"`, () => {
        render(section.field);
        expect(getFieldHeadings()).toEqual([section.heading]);
      });
    });

    it('shows the operating hours range table only with the operating hours help', () => {
      render('operationHours');
      const cells: Array<string> = Array.from(fixture.nativeElement.querySelectorAll('table td'))
        .map((cell: HTMLElement) => cell.textContent.trim());
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);

      render('waterCost');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });

    it('switches help blocks when the focused field changes', () => {
      render('bucketVolume');
      expect(getFieldHeadings()).toEqual(['Bucket Volume']);
      render('elapsedTime');
      expect(getFieldHeadings()).toEqual(['Elapsed Time']);
    });
  });
});
