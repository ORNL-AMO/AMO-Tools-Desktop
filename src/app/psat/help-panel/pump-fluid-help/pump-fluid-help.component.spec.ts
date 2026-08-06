import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { PumpFluidHelpComponent } from './pump-fluid-help.component';
import { HelpPanelService } from '../help-panel.service';

// Every currentField value the template gates a help block on, paired with a
// substring unique to that block's heading so shown-state assertions can
// confirm the *correct* block rendered, not just *some* block.
const FIELD_BRANCHES: { field: string; heading: string }[] = [
  { field: 'pumpType', heading: 'Pump Type' },
  { field: 'specifiedPumpEfficiency', heading: 'Pump Efficiency' },
  { field: 'pumpRPM', heading: 'Pump Speed' },
  // 'Drive' alone is a substring of the specifiedDriveEfficiency block's
  // "Drive Efficiency" heading, so use a phrase unique to this block.
  { field: 'drive', heading: 'allows the user to define whether the pump is direct driven' },
  { field: 'specifiedDriveEfficiency', heading: 'Drive Efficiency' },
  { field: 'fluidType', heading: 'Fluid Type' },
  { field: 'fluidTemperature', heading: 'Fluid Temperature' },
  { field: 'specificGravity', heading: 'Specific Gravity' },
  { field: 'viscosity', heading: 'Kinematic Viscosity' },
  { field: 'stages', heading: 'Stages' },
];

describe('PumpFluidHelpComponent', () => {
  let component: PumpFluidHelpComponent;
  let fixture: ComponentFixture<PumpFluidHelpComponent>;
  let helpPanelService: HelpPanelService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PumpFluidHelpComponent],
      providers: [HelpPanelService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    helpPanelService = TestBed.inject(HelpPanelService);
    fixture = TestBed.createComponent(PumpFluidHelpComponent);
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
      helpPanelService.currentField.next('pumpType');
      expect(component.currentField).toBe('pumpType');
    });

    it('updates currentField again on a subsequent emission', () => {
      helpPanelService.currentField.next('pumpType');
      helpPanelService.currentField.next('stages');
      expect(component.currentField).toBe('stages');
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
      helpPanelService.currentField.next('pumpType');
      expect(component.currentField).toBeNull();
    });
  });
});
