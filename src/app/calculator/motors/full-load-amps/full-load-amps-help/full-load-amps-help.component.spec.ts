import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FullLoadAmpsHelpComponent } from './full-load-amps-help.component';
import { FullLoadAmpsService } from '../full-load-amps.service';

// currentField value -> heading text that identifies its help block.
const HELP_HEADINGS: Array<[field: string, heading: string]> = [
  ['lineFrequency', 'Line Frequency'],
  ['motorRatedPower', 'Motor Rated Power'],
  ['motorRpm', 'Motor RPM'],
  ['efficiencyClass', 'Efficiency Class'],
  ['specifiedEfficiency', 'Efficiency'],
  ['motorRatedVoltage', 'Rated Voltage'],
  ['fullLoadAmps', 'Full Load Amps'],
];

describe('FullLoadAmpsHelpComponent', () => {
  let component: FullLoadAmpsHelpComponent;
  let fixture: ComponentFixture<FullLoadAmpsHelpComponent>;
  let currentField: BehaviorSubject<string>;

  function getFieldHelpBlocks(): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll('.help-info > .my-2'));
  }

  function showField(field: string): void {
    currentField.next(field);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    currentField = new BehaviorSubject<string>('default');
    const serviceMock = { currentField } as Partial<FullLoadAmpsService>;

    await TestBed.configureTestingModule({
      declarations: [FullLoadAmpsHelpComponent],
      providers: [{ provide: FullLoadAmpsService, useValue: serviceMock }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FullLoadAmpsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('takes the current field from the service', () => {
      expect(component.currentField).toBe('default');
    });
  });

  describe('template visibility', () => {
    it('shows only the general help when the default field is focused', () => {
      expect(fixture.nativeElement.textContent).toContain('Full-Load Amps Help');
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    it('shows no field help block for an unrecognized field', () => {
      showField('someOtherField');
      expect(getFieldHelpBlocks().length).toBe(0);
    });

    HELP_HEADINGS.forEach(([field, heading]) => {
      it(`shows only the ${field} help block when ${field} is focused`, () => {
        showField(field);
        const blocks = getFieldHelpBlocks();
        expect(blocks.length).toBe(1);
        expect(blocks[0].querySelector('h6').textContent.trim().startsWith(heading)).toBeTrue();
      });
    });

    it('switches help blocks when the focused field changes', () => {
      showField('motorRpm');
      showField('motorRatedVoltage');
      const blocks = getFieldHelpBlocks();
      expect(blocks.length).toBe(1);
      expect(blocks[0].textContent).toContain('Rated Voltage');
    });
  });

  describe('destroy', () => {
    it('stops tracking the current field after the component is destroyed', () => {
      showField('motorRpm');
      fixture.destroy();
      currentField.next('motorRatedVoltage');
      expect(component.currentField).toBe('motorRpm');
    });
  });
});
