import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { HeadToolFormComponent } from './head-tool-form.component';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = {
  distanceMeasurement: 'ft',
  flowMeasurement: 'gpm',
  pressureMeasurement: 'psi',
} as Settings;

const VALID_VALUES = {
  specificGravity: 1,
  flowRate: 2000,
  suctionPipeDiameter: 12,
  suctionGuagePressure: 5,
  suctionGuageElevation: 10,
  suctionLineLossCoefficients: 0.5,
  dischargePipeDiameter: 12,
  dischargeGaugePressure: 124,
  dischargeGaugeElevation: 10,
  dischargeLineLossCoefficients: 1,
};

// Mirrors HeadToolService.initHeadToolForm validators
function makeHeadToolForm(overrides: Partial<typeof VALID_VALUES> = {}): UntypedFormGroup {
  const values = { ...VALID_VALUES, ...overrides };
  const requiredMin = [Validators.required, Validators.min(0)];
  return new UntypedFormGroup({
    suctionPipeDiameter: new UntypedFormControl(values.suctionPipeDiameter, requiredMin),
    suctionGuagePressure: new UntypedFormControl(values.suctionGuagePressure, Validators.required),
    suctionGuageElevation: new UntypedFormControl(values.suctionGuageElevation, Validators.required),
    suctionLineLossCoefficients: new UntypedFormControl(values.suctionLineLossCoefficients, Validators.required),
    dischargePipeDiameter: new UntypedFormControl(values.dischargePipeDiameter, requiredMin),
    dischargeGaugePressure: new UntypedFormControl(values.dischargeGaugePressure, Validators.required),
    dischargeGaugeElevation: new UntypedFormControl(values.dischargeGaugeElevation, Validators.required),
    dischargeLineLossCoefficients: new UntypedFormControl(values.dischargeLineLossCoefficients, Validators.required),
    specificGravity: new UntypedFormControl(values.specificGravity, requiredMin),
    flowRate: new UntypedFormControl(values.flowRate, requiredMin),
  });
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('HeadToolFormComponent', () => {
  let component: HeadToolFormComponent;
  let fixture: ComponentFixture<HeadToolFormComponent>;
  let calculateSpy: jasmine.Spy;

  function createComponent(form: UntypedFormGroup = makeHeadToolForm(), settings: Settings = MOCK_SETTINGS): void {
    fixture = TestBed.createComponent(HeadToolFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('headToolForm', form);
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('inAssessment', false);
    calculateSpy = spyOn(component.calculate, 'emit');
    fixture.detectChanges();
  }

  function getErrorBlock(controlName: string): HTMLElement | null {
    const input: HTMLElement = fixture.nativeElement.querySelector('#' + controlName);
    return input.closest('.form-group').querySelector('.alert-danger');
  }

  function getErrorMessages(controlName: string): Array<string> {
    const block = getErrorBlock(controlName);
    if (!block) {
      return [];
    }
    return Array.from(block.querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent));
  }

  function enterValue(controlName: string, value: number): void {
    const control = component.headToolForm.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    component.calc();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [HeadToolFormComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('uses inches as the small unit for imperial distance', () => {
      createComponent();
      expect(component.smallUnit).toBe('in');
    });

    it('uses millimeters as the small unit for metric distance', () => {
      createComponent(makeHeadToolForm(), { ...MOCK_SETTINGS, distanceMeasurement: 'm' } as Settings);
      expect(component.smallUnit).toBe('mm');
    });

    it('emits calculate on init when the form is valid', () => {
      createComponent();
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('does not emit calculate on init when the form is invalid', () => {
      createComponent(makeHeadToolForm({ flowRate: null }));
      expect(calculateSpy).not.toHaveBeenCalled();
    });

    it('renders units from settings', () => {
      createComponent();
      const units = Array.from(fixture.nativeElement.querySelectorAll('.units')).map((el: HTMLElement) => el.textContent.trim());
      expect(units).toEqual(['gpm', 'in', 'psi', 'ft', 'in', 'psi', 'ft']);
    });
  });

  describe('calc', () => {
    it('emits calculate for a valid form', () => {
      createComponent();
      calculateSpy.calls.reset();
      enterValue('flowRate', 100);
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    // The template's min="0.1" attribute adds a min validator, so a zero diameter
    // invalidates the form and calc() never reaches the diameter checks
    it('does not emit for a zero suction diameter and leaves diameterError unset', () => {
      createComponent();
      calculateSpy.calls.reset();
      enterValue('suctionPipeDiameter', 0);
      expect(component.headToolForm.controls.suctionPipeDiameter.errors.min).toBeTruthy();
      expect(component.diameterError).toBeNull();
      expect(calculateSpy).not.toHaveBeenCalled();
    });

    it('sets diameterError for zero and negative suction diameters and clears it when fixed', () => {
      createComponent();
      component.headToolForm.controls.suctionPipeDiameter.setValue(0);
      expect(component.checkPipeDiameterSuction()).toBeFalse();
      expect(component.diameterError).toBe('Cannot have 0 diameter');
      component.headToolForm.controls.suctionPipeDiameter.setValue(-1);
      expect(component.checkPipeDiameterSuction()).toBeFalse();
      expect(component.diameterError).toBe('Cannot have negative diameter');
      component.headToolForm.controls.suctionPipeDiameter.setValue(3);
      expect(component.checkPipeDiameterSuction()).toBeTrue();
      expect(component.diameterError).toBeNull();
    });

    it('does not emit for a zero discharge diameter and leaves diameterErrorOut unset', () => {
      createComponent();
      calculateSpy.calls.reset();
      enterValue('dischargePipeDiameter', 0);
      expect(component.headToolForm.controls.dischargePipeDiameter.errors.min).toBeTruthy();
      expect(component.diameterErrorOut).toBeNull();
      expect(calculateSpy).not.toHaveBeenCalled();
    });

    it('sets diameterErrorOut for zero and negative discharge diameters and clears it when fixed', () => {
      createComponent();
      component.headToolForm.controls.dischargePipeDiameter.setValue(0);
      expect(component.checkPipeDiameterDischarge()).toBeFalse();
      expect(component.diameterErrorOut).toBe('Cannot have 0 diameter');
      component.headToolForm.controls.dischargePipeDiameter.setValue(-1);
      expect(component.checkPipeDiameterDischarge()).toBeFalse();
      expect(component.diameterErrorOut).toBe('Cannot have negative diameter');
      component.headToolForm.controls.dischargePipeDiameter.setValue(3);
      expect(component.checkPipeDiameterDischarge()).toBeTrue();
      expect(component.diameterErrorOut).toBeNull();
    });

    it('sets pressureError when suction pressure exceeds discharge pressure and clears it otherwise', () => {
      createComponent();
      enterValue('suctionGuagePressure', 200);
      expect(component.pressureError).toBe('Suction Pressure cannot be greater than Discharge Pressure');
      enterValue('suctionGuagePressure', 1);
      expect(component.pressureError).toBeNull();
    });
  });

  describe('user actions', () => {
    it('focusField emits changeField with the field name', () => {
      createComponent();
      const emitted: string[] = [];
      component.changeField.subscribe(value => emitted.push(value));
      component.focusField('flowRate');
      expect(emitted).toEqual(['flowRate']);
    });
  });

  describe('template visibility', () => {
    const ALL_FIELDS = Object.keys(VALID_VALUES);

    it('shows no error blocks for a valid form', () => {
      createComponent();
      ALL_FIELDS.forEach(name => expect(getErrorBlock(name)).withContext(name).toBeNull());
    });

    it('hides the error block for an invalid but pristine control', () => {
      createComponent(makeHeadToolForm({ flowRate: null }));
      expect(component.headToolForm.controls.flowRate.invalid).toBeTrue();
      expect(getErrorBlock('flowRate')).toBeNull();
    });

    it('hides the error block for a dirty but valid control', () => {
      createComponent();
      enterValue('flowRate', 5);
      expect(getErrorBlock('flowRate')).toBeNull();
    });

    const requiredCases = ALL_FIELDS.filter(name => name !== 'dischargeGaugePressure');
    requiredCases.forEach(name => {
      it(`shows only "Value required." for an empty ${name}`, () => {
        createComponent();
        enterValue(name, null);
        expect(getErrorMessages(name)).toEqual(['Value required.']);
      });
    });

    it('shows required and pressure errors for an empty dischargeGaugePressure', () => {
      createComponent();
      enterValue('dischargeGaugePressure', null);
      expect(getErrorMessages('dischargeGaugePressure')).toEqual([
        'Value required.',
        'Suction Pressure cannot be greater than Discharge Pressure',
      ]);
    });

    it('shows the min error for a negative specificGravity', () => {
      createComponent();
      enterValue('specificGravity', -1);
      expect(getErrorMessages('specificGravity')).toEqual(["Value can't be less than 0."]);
    });

    it('shows the min error with flow units for a negative flowRate', () => {
      createComponent();
      enterValue('flowRate', -1);
      expect(getErrorMessages('flowRate')).toEqual(["Value can't be less than 0 gpm."]);
    });

    // calc() only runs the diameter checks when the form is valid, so entering an
    // invalid diameter alone leaves diameterError unset
    [0, -1].forEach(value => {
      it(`shows only the min error for a suctionPipeDiameter of ${value}`, () => {
        createComponent();
        enterValue('suctionPipeDiameter', value);
        expect(getErrorMessages('suctionPipeDiameter')).toEqual(["Value can't be less than 0 in."]);
      });

      it(`shows only the min error for a dischargePipeDiameter of ${value}`, () => {
        createComponent();
        enterValue('dischargePipeDiameter', value);
        expect(getErrorMessages('dischargePipeDiameter')).toEqual(["Value can't be less than 0 in."]);
      });
    });

    it('shows diameterError with the min error in an invalid suctionPipeDiameter block', () => {
      createComponent();
      enterValue('suctionPipeDiameter', -1);
      component.diameterError = 'Cannot have negative diameter';
      fixture.detectChanges();
      expect(getErrorMessages('suctionPipeDiameter')).toEqual([
        'Cannot have negative diameter',
        "Value can't be less than 0 in.",
      ]);
    });

    it('shows the min error with diameterErrorOut in an invalid dischargePipeDiameter block', () => {
      createComponent();
      enterValue('dischargePipeDiameter', -1);
      component.diameterErrorOut = 'Cannot have negative diameter';
      fixture.detectChanges();
      expect(getErrorMessages('dischargePipeDiameter')).toEqual([
        "Value can't be less than 0 in.",
        'Cannot have negative diameter',
      ]);
    });

    it('hides diameterError when its control is valid', () => {
      createComponent();
      component.diameterError = 'Cannot have 0 diameter';
      component.diameterErrorOut = 'Cannot have 0 diameter';
      fixture.detectChanges();
      expect(getErrorBlock('suctionPipeDiameter')).toBeNull();
      expect(getErrorBlock('dischargePipeDiameter')).toBeNull();
    });

    it('shows the pressure error inside an invalid suctionGuagePressure block when pressureError is set', () => {
      createComponent();
      enterValue('suctionGuagePressure', null);
      component.pressureError = 'Suction Pressure cannot be greater than Discharge Pressure';
      fixture.detectChanges();
      expect(getErrorMessages('suctionGuagePressure')).toEqual([
        'Suction Pressure cannot be greater than Discharge Pressure',
        'Value required.',
      ]);
    });

    it('shows the pressure error only in the invalid block, not in a valid one', () => {
      createComponent();
      enterValue('suctionGuagePressure', 200);
      expect(component.pressureError).not.toBeNull();
      expect(getErrorBlock('suctionGuagePressure')).toBeNull();
      expect(getErrorBlock('dischargeGaugePressure')).toBeNull();
    });
  });
});
