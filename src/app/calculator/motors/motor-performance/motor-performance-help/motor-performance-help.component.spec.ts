import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MotorPerformanceHelpComponent } from './motor-performance-help.component';

const FIELD_HEADINGS: Array<{ field: string, heading: string }> = [
  { field: 'frequency', heading: 'Line Frequency' },
  { field: 'horsePower', heading: 'Motor Power' },
  { field: 'motorRPM', heading: 'Motor RPM' },
  { field: 'efficiencyClass', heading: 'Efficiency Class' },
  { field: 'motorVoltage', heading: 'Voltage' },
  { field: 'fullLoadAmps', heading: 'Full-Load Amps' },
];

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('MotorPerformanceHelpComponent', () => {
  let component: MotorPerformanceHelpComponent;
  let fixture: ComponentFixture<MotorPerformanceHelpComponent>;

  function getFieldBlocks(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  function getBlockHeading(block: HTMLElement): string {
    const heading = block.querySelector('h6');
    return normalize(heading.firstChild.textContent);
  }

  function render(currentField: string): void {
    fixture.componentRef.setInput('currentField', currentField);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MotorPerformanceHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MotorPerformanceHelpComponent);
    component = fixture.componentInstance;
  });

  describe('initialization', () => {
    it('creates the component and always renders the general help header', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(normalize(fixture.nativeElement.querySelector('h5').textContent)).toContain('Motor Performance Help');
    });
  });

  describe('template visibility', () => {
    it('renders no field help when no field is focused', () => {
      fixture.detectChanges();
      expect(getFieldBlocks().length).toBe(0);
    });

    it('renders no field help for an unknown field', () => {
      render('sizeMargin');
      expect(getFieldBlocks().length).toBe(0);
    });

    FIELD_HEADINGS.forEach(({ field, heading }) => {
      it(`renders only the ${heading} help when ${field} is focused`, () => {
        render(field);
        const blocks = getFieldBlocks();
        expect(blocks.length).toBe(1);
        expect(getBlockHeading(blocks[0])).toBe(heading);
      });
    });

    it('renders the motor RPM limit tables only with the motor RPM help', () => {
      render('motorRPM');
      const labels = Array.from(fixture.nativeElement.querySelectorAll('.group-label'))
        .map((label: HTMLElement) => normalize(label.textContent));
      expect(labels).toEqual(['Standard and Energy Efficient Motors', 'Premium Efficient Motors']);

      render('frequency');
      expect(fixture.nativeElement.querySelectorAll('.group-label').length).toBe(0);
    });

    it('renders the efficiency help block twice when efficiency is focused', () => {
      render('efficiency');
      const blocks = getFieldBlocks();
      expect(blocks.length).toBe(2);
      blocks.forEach(block => {
        expect(getBlockHeading(block)).toBe('Efficiency');
        const cells = Array.from(block.querySelectorAll('td')).map((cell: HTMLElement) => normalize(cell.textContent));
        expect(cells).toEqual(['1%', '100%']);
      });
    });

    it('swaps the rendered help when the focused field changes', () => {
      render('frequency');
      expect(getBlockHeading(getFieldBlocks()[0])).toBe('Line Frequency');
      render('fullLoadAmps');
      const blocks = getFieldBlocks();
      expect(blocks.length).toBe(1);
      expect(getBlockHeading(blocks[0])).toBe('Full-Load Amps');
    });
  });
});
