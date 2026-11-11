import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { environment } from '../../../../environments/environment';

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
    // Field help has a heading; always-visible documentation links share the
    // spacing class but are independent of the selected field.
    it('keeps calculation documentation links available with and without a selected field', () => {
      const expectedPaths = [
        'group__pump__result__calculator',
        'group__fluid__power__calculator',
        'group__mover__efficiency__calculator',
        'group__optimal__pump__shaft__power__calculator',
      ];

      for (const field of ['unrecognized-field', 'pumpType']) {
        helpPanelService.currentField.next(field);
        fixture.detectChanges();

        const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('.my-2 > a[target="_blank"]'));
        expect(links.map(link => link.getAttribute('href')))
          .toEqual(expectedPaths.map(path => environment.measurDocsUrl + path));
        links.forEach(link => {
          expect(link.relList.contains('noopener')).toBeTrue();
          expect(link.relList.contains('noreferrer')).toBeTrue();
        });
      }
    });

    it('renders no field help block when currentField does not match any known field', () => {
      expect(fixture.nativeElement.querySelectorAll('.my-2 > h6').length).toBe(0);
    });

    FIELD_BRANCHES.forEach(({ field, heading }) => {
      it(`shows only the ${field} help block when currentField is ${field}`, () => {
        helpPanelService.currentField.next(field);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.my-2 > h6').length).toBe(1);
        expect(fixture.nativeElement.querySelector('.my-2 > h6').parentElement.textContent).toContain(heading);
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
