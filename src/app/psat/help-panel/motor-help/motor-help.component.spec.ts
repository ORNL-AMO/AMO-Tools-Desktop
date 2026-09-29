import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MotorHelpComponent } from './motor-help.component';
import { HelpPanelService } from '../help-panel.service';
import { PsatService } from '../../psat.service';

// Every currentField value the template gates a help block on, paired with a
// substring unique to that block's heading so shown-state assertions can
// confirm the *correct* block rendered, not just *some* block.
const FIELD_BRANCHES: { field: string; heading: string }[] = [
  { field: 'lineFrequency', heading: 'Line Frequency' },
  { field: 'horsePower', heading: 'Motor Power' },
  // 'Motor RPM' also appears inside the fullLoadAmps block's body text, so use
  // a phrase unique to the motorRPM block itself.
  { field: 'motorRPM', heading: 'nameplate speed of the motor' },
  { field: 'efficiencyClass', heading: 'Efficiency Class' },
  // Plain 'Efficiency' is a substring of 'Efficiency Class', so use a phrase
  // unique to this block's body text.
  { field: 'efficiency', heading: 'ratio between the amount of mechanical work' },
  // 'Rated Voltage' also appears inside the fullLoadAmps block's body text, so
  // use a phrase unique to the motorVoltage block itself.
  { field: 'motorVoltage', heading: 'motor design (nameplate) voltage' },
  { field: 'fullLoadAmps', heading: 'Full Load Amps' },
];

describe('MotorHelpComponent', () => {
  let component: MotorHelpComponent;
  let fixture: ComponentFixture<MotorHelpComponent>;
  let helpPanelService: HelpPanelService;
  let psatServiceStub: Pick<PsatService, 'flaRange'>;

  beforeEach(async () => {
    // MotorHelpComponent injects PsatService but never calls any of its
    // methods from ngOnInit or the template (getFlaMin/getFlaMax are unused
    // dead code that only read the flaRange property) -- jasmine.createSpyObj
    // requires at least one method/property name, and there are none to spy
    // on here, so a plain stub satisfies DI instead.
    psatServiceStub = { flaRange: { flaMin: 0, flaMax: 0 } };

    await TestBed.configureTestingModule({
      declarations: [MotorHelpComponent],
      providers: [
        HelpPanelService,
        { provide: PsatService, useValue: psatServiceStub },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    helpPanelService = TestBed.inject(HelpPanelService);
    fixture = TestBed.createComponent(MotorHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('starts with currentField unset', () => {
      expect(component.currentField).toBeNull();
    });
  });

  describe('observeCurrentFieldChange', () => {
    it('sets currentField from the help panel service when it emits', () => {
      helpPanelService.currentField.next('lineFrequency');
      expect(component.currentField).toBe('lineFrequency');
    });

    it('updates currentField again on a subsequent emission', () => {
      helpPanelService.currentField.next('lineFrequency');
      helpPanelService.currentField.next('fullLoadAmps');
      expect(component.currentField).toBe('fullLoadAmps');
    });
  });

  describe('template visibility', () => {
    it('renders no help block when currentField does not match any known field', () => {
      expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(0);
    });

    FIELD_BRANCHES.forEach(({ field, heading }) => {
      it(`shows only the ${field} help block when currentField is ${field}`, () => {
        helpPanelService.currentField.next(field);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(1);
        expect(fixture.nativeElement.textContent).toContain(heading);
      });
    });
  });

  describe('destroy', () => {
    it('stops updating currentField after the component is destroyed', () => {
      fixture.destroy();
      helpPanelService.currentField.next('lineFrequency');
      expect(component.currentField).toBeNull();
    });
  });
});
