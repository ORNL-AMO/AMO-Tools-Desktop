import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MotorDriveHelpComponent } from './motor-drive-help.component';

// currentField value -> heading text that identifies its help block.
const HELP_HEADINGS: Array<[field: string, heading: string]> = [
  ['motorPower', 'Motor Power'],
  ['annualOperatingHours', 'Annual Operating Hours'],
  ['averageMotorLoad', 'Average Motor Load'],
  ['electricityCost', 'Electricity Cost'],
];

describe('MotorDriveHelpComponent', () => {
  let component: MotorDriveHelpComponent;
  let fixture: ComponentFixture<MotorDriveHelpComponent>;

  function getFieldHelpBlocks(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  function showField(field: string): void {
    fixture.componentRef.setInput('currentField', field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MotorDriveHelpComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MotorDriveHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('always shows the general help text', () => {
      expect(fixture.nativeElement.querySelector('h5').textContent).toContain('Motor Drive Comparison Help');
    });
  });

  describe('template visibility', () => {
    it('shows no field help block when no field is focused', () => {
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    it('shows no field help block for an unknown field', () => {
      showField('driveType');
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    HELP_HEADINGS.forEach(([field, heading]) => {
      it(`shows only the ${field} help block when ${field} is focused`, () => {
        showField(field);
        const blocks = getFieldHelpBlocks();
        expect(blocks.length).toBe(1);
        expect(blocks[0].querySelector('h6').textContent).toContain(heading);
      });
    });

    it('shows the operating hours range table only for annualOperatingHours', () => {
      showField('annualOperatingHours');
      const cells = Array.from(fixture.nativeElement.querySelectorAll('td'))
        .map((cell: HTMLElement) => cell.textContent.trim());
      expect(cells).toEqual(['0 hrs/yr', '8760 hrs/yr']);

      showField('motorPower');
      expect(fixture.nativeElement.querySelector('table')).toBeNull();
    });
  });
});
