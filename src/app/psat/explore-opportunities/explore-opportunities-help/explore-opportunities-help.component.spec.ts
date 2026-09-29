import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ExploreOpportunitiesHelpComponent } from './explore-opportunities-help.component';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { PsatWarningService } from '../../psat-warning.service';
import { PSAT, PsatInputs } from '../../../shared/models/psat';
import { Settings } from '../../../shared/models/settings';

function makePsatInputs(overrides: Partial<PsatInputs> = {}): PsatInputs {
  return {
    operating_hours: 8760,
    fluidType: 'water',
    fluidTemperature: 60,
    pump_style: 1,
    ...overrides,
  };
}

function makePsat(hasModifications: boolean): PSAT {
  return {
    inputs: makePsatInputs(),
    modifications: hasModifications ? [{ id: 'mod-1' }] : [],
  };
}

// Each entry maps a currentField value to a unique heading/body substring
// used to confirm only that field's help block renders.
const FIELD_BRANCHES: { field: string; text: string }[] = [
  { field: 'systemData', text: 'Within the System Data tab you can modify Cost, Flow Rate, and Head.' },
  { field: 'modifyCost', text: 'Per unit cost of electricity' },
  { field: 'head', text: 'Head, Flow Rate, and Specific Gravity are used to calculate fluid power' },
  { field: 'motorRatedData', text: 'Within the Motor Rated Data tab you can edit Motor Rated Power' },
  { field: 'motorRatedPower', text: 'Motor Power represents the rated power for the motor.' },
  { field: 'efficiencyClass', text: 'Efficiency Class is the classification of efficiency' },
  { field: 'motorEfficiency', text: 'Motor efficiency is the ratio between the amount of mechanical work' },
  { field: 'pumpData', text: 'Within the Pump Data tab you can edit Pump Speed, Pump Type' },
  { field: 'operatingFraction', text: 'Operating Fraction represents the fraction of calender hours' },
  { field: 'pumpType', text: 'Pump Type represents what style of pump is being used' },
  { field: 'drive', text: 'This drop-down selection menu allows the user to define whether the pump is direct driven' },
  { field: 'pumpSpecified', text: 'Efficiency of the pump in the modified scenario calculations.' },
  { field: 'modifyCalculationMethod', text: 'This enables the tool to replace the modified condition' },
  { field: 'kinematicViscosity', text: 'Kinematic Viscosity is the viscosity of the fluid being pumped' },
  { field: 'fixedSpecificSpeed', text: 'The Fixed specific speed switch allows the user to specify' },
];

describe('ExploreOpportunitiesHelpComponent', () => {
  let component: ExploreOpportunitiesHelpComponent;
  let fixture: ComponentFixture<ExploreOpportunitiesHelpComponent>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;

  function configureTestBed() {
    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['value', 'from', 'to']);
    convertUnitsServiceSpy.value.and.returnValue(convertUnitsServiceSpy);
    convertUnitsServiceSpy.from.and.returnValue(convertUnitsServiceSpy);
    convertUnitsServiceSpy.to.and.returnValue(75);

    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['getFlowRateMinMax']);
    psatWarningServiceSpy.getFlowRateMinMax.and.returnValue({ min: 50, max: 200 });

    return TestBed.configureTestingModule({
      declarations: [ExploreOpportunitiesHelpComponent],
      providers: [
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  beforeEach(async () => {
    await configureTestBed();

    fixture = TestBed.createComponent(ExploreOpportunitiesHelpComponent);
    component = fixture.componentInstance;
    component.psat = makePsat(true);
    component.settings = { flowMeasurement: 'gpm' } as Settings;
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('uses the flow rate range as-is when flowMeasurement is already gpm', () => {
      expect(psatWarningServiceSpy.getFlowRateMinMax).toHaveBeenCalledWith(component.psat.inputs.pump_style);
      expect(convertUnitsServiceSpy.value).not.toHaveBeenCalled();
      expect(component.minFlowRate).toBe(50);
      expect(component.maxFlowRate).toBe(200);
    });

    it('converts the flow rate range from gpm when flowMeasurement is not gpm', async () => {
      TestBed.resetTestingModule();
      await configureTestBed();
      psatWarningServiceSpy.getFlowRateMinMax.and.returnValue({ min: 50, max: 200 });
      convertUnitsServiceSpy.to.and.returnValue(75);

      const otherFixture = TestBed.createComponent(ExploreOpportunitiesHelpComponent);
      const otherComponent = otherFixture.componentInstance;
      otherComponent.psat = makePsat(true);
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

  describe('ngOnChanges', () => {
    it('recomputes minFlowRate and maxFlowRate when the psat input changes', () => {
      psatWarningServiceSpy.getFlowRateMinMax.and.returnValue({ min: 10, max: 900 });

      component.ngOnChanges({ psat: new SimpleChange(undefined, component.psat, false) });

      expect(component.minFlowRate).toBe(10);
      expect(component.maxFlowRate).toBe(900);
    });
  });

  describe('template visibility', () => {
    it('shows the no-modifications guidance when there are no modifications', () => {
      component.psat = makePsat(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain("consider the effects of changing your pump");
    });

    it('hides the no-modifications guidance when modifications exist', () => {
      expect(fixture.nativeElement.textContent).not.toContain("consider the effects of changing your pump");
    });

    it('renders no field-specific help block when currentField does not match any known field', () => {
      expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(0);
    });

    FIELD_BRANCHES.forEach(({ field, text }) => {
      it(`shows only the ${field} help block when currentField is ${field}`, () => {
        component.currentField = field;
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(1);
        expect(fixture.nativeElement.textContent).toContain(text);
      });
    });

    it('renders the computed min/max flow rate and unit when currentField is flowRate', () => {
      component.currentField = 'flowRate';
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.my-2').length).toBe(1);
      expect(fixture.nativeElement.textContent).toContain('50.00');
      expect(fixture.nativeElement.textContent).toContain('200.00');
      expect(fixture.nativeElement.textContent).toContain('gpm');
    });
  });
});
