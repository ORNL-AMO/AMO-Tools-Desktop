import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { FieldDataHelpComponent } from './field-data-help.component';
import { HelpPanelService } from '../help-panel.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatWarningService } from '../../psat-warning.service';
import { PSAT, PsatInputs } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

const MOCK_PSAT_INPUTS: PsatInputs = {
  operating_hours: 8760,
  fluidType: 'water',
  fluidTemperature: 60,
  pump_style: 1,
};

const MOCK_PSAT: PSAT = { inputs: MOCK_PSAT_INPUTS };

// Fields where the same heading text ("Measured Voltage") is used by two
// different blocks (measuredVoltage / modMeasuredVoltage), so those two are
// verified separately below rather than through the generic branch loop.
const FIELD_BRANCHES: { field: string; heading: string }[] = [
  { field: 'flowRate', heading: 'estimate the optimal pump' },
  { field: 'head', heading: 'head calculation panel' },
  { field: 'loadEstimatedMethod', heading: 'can either be one of two choices' },
  { field: 'motorPower', heading: 'permanently-installed power meter' },
  { field: 'optimizeCalculation', heading: 'Optimize Calculation' },
  { field: 'kinematicViscosity', heading: 'Kinematic Viscosity' },
  { field: 'fixedSpecificSpeed', heading: 'Fixed Specific Speed' },
  { field: 'implementationCosts', heading: 'Implementation Costs' },
];

describe('FieldDataHelpComponent', () => {
  let component: FieldDataHelpComponent;
  let fixture: ComponentFixture<FieldDataHelpComponent>;
  let helpPanelService: HelpPanelService;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;

  function configureTestBed() {
    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['value', 'from', 'to', 'getUnit']);
    convertUnitsServiceSpy.value.and.returnValue(convertUnitsServiceSpy);
    convertUnitsServiceSpy.from.and.returnValue(convertUnitsServiceSpy);
    convertUnitsServiceSpy.to.and.returnValue(75);
    convertUnitsServiceSpy.getUnit.and.returnValue({ unit: { name: { display: '(gpm)' } } } as any);

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['getFlowRateMinMax']);
    psatWarningServiceSpy.getFlowRateMinMax.and.returnValue({ min: 50, max: 200 });

    return TestBed.configureTestingModule({
      declarations: [FieldDataHelpComponent],
      providers: [
        HelpPanelService,
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  beforeEach(async () => {
    await configureTestBed();

    helpPanelService = TestBed.inject(HelpPanelService);
    fixture = TestBed.createComponent(FieldDataHelpComponent);
    component = fixture.componentInstance;
    // Legacy @Input properties -- ngOnInit reads psat/settings synchronously,
    // so they must be assigned before the first detectChanges() runs it.
    component.psat = MOCK_PSAT;
    component.settings = { flowMeasurement: 'gpm' } as Settings;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('uses the flow rate range as-is when flowMeasurement is already gpm', () => {
      expect(psatWarningServiceSpy.getFlowRateMinMax).toHaveBeenCalledWith(MOCK_PSAT_INPUTS.pump_style);
      expect(convertUnitsServiceSpy.value).not.toHaveBeenCalled();
      expect(component.minFlowRate).toBe(50);
      expect(component.maxFlowRate).toBe(200);
    });

    it('converts the flow rate range from gpm when flowMeasurement is not gpm', async () => {
      TestBed.resetTestingModule();
      await configureTestBed();
      psatWarningServiceSpy.getFlowRateMinMax.and.returnValue({ min: 50, max: 200 });
      convertUnitsServiceSpy.to.and.returnValue(75);

      const otherFixture = TestBed.createComponent(FieldDataHelpComponent);
      const otherComponent = otherFixture.componentInstance;
      otherComponent.psat = MOCK_PSAT;
      otherComponent.settings = { flowMeasurement: 'M3/min' } as Settings;
      otherFixture.detectChanges();

      expect(convertUnitsServiceSpy.value).toHaveBeenCalledWith(50);
      expect(convertUnitsServiceSpy.value).toHaveBeenCalledWith(200);
      expect(convertUnitsServiceSpy.from).toHaveBeenCalledWith('gpm');
      expect(convertUnitsServiceSpy.to).toHaveBeenCalledWith('M3/min');
      expect(otherComponent.minFlowRate).toBe(75);
      expect(otherComponent.maxFlowRate).toBe(75);
    });
  });

  describe('observeCurrentFieldChange', () => {
    it('sets currentField from the help panel service when it emits', () => {
      helpPanelService.currentField.next('flowRate');
      expect(component.currentField).toBe('flowRate');
    });

    it('updates currentField again on a subsequent emission', () => {
      helpPanelService.currentField.next('flowRate');
      helpPanelService.currentField.next('head');
      expect(component.currentField).toBe('head');
    });
  });

  describe('template visibility', () => {
    // Field help has a heading; always-visible documentation links share the
    // spacing class but are independent of the selected field.
    it('keeps calculation documentation links available with and without a selected field', () => {
      const expectedPaths = [
        'group__motor__power__calculator',
        'group__motor__shaft__power__calculator',
        'group__mover__shaft__power__calculator',
        'group__optimal__motor__shaft__power__calculator',
        'group__optimal__motor__power__calculator',
      ];

      for (const field of ['unrecognized-field', 'flowRate']) {
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

    it('renders the computed min/max flow rate and unit when currentField is flowRate', () => {
      helpPanelService.currentField.next('flowRate');
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('50.00');
      expect(fixture.nativeElement.textContent).toContain('200.00');
      expect(fixture.nativeElement.textContent).toContain('gpm');
    });

    it('shows the non-modification Measured Voltage block (without the what-if warning) when currentField is measuredVoltage', () => {
      helpPanelService.currentField.next('measuredVoltage');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.my-2 > h6').length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain('Measured Voltage');
      expect(fixture.nativeElement.textContent).not.toContain('For what-if modifications');
    });

    it('shows the modification Measured Voltage block (with the what-if warning) when currentField is modMeasuredVoltage', () => {
      helpPanelService.currentField.next('modMeasuredVoltage');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.my-2 > h6').length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain('Measured Voltage');
      expect(fixture.nativeElement.textContent).toContain('For what-if modifications');
    });
  });

  describe('destroy', () => {
    it('stops updating currentField after the component is destroyed', () => {
      fixture.destroy();
      helpPanelService.currentField.next('flowRate');
      expect(component.currentField).toBeNull();
    });
  });
});
