import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FullLoadAmpsFormComponent } from './full-load-amps-form.component';
import { FLAMotorWarnings, FullLoadAmpsService } from '../full-load-amps.service';
import { PsatService } from '../../../../psat/psat.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { FanMotor } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

function makeMotor(overrides: Partial<FanMotor> = {}): FanMotor {
  return {
    lineFrequency: 60,
    motorRatedPower: 600,
    motorRpm: 1180,
    efficiencyClass: 1,
    specifiedEfficiency: 95,
    motorRatedVoltage: 470,
    fullLoadAmps: 683.25,
    ...overrides,
  };
}

function makeWarnings(overrides: Partial<FLAMotorWarnings> = {}): FLAMotorWarnings {
  return {
    rpmError: null,
    voltageError: null,
    efficiencyError: null,
    ratedPowerError: null,
    ...overrides,
  };
}

const SETTINGS = { powerMeasurement: 'hp', fanPowerMeasurement: 'hp' } as Settings;

describe('FullLoadAmpsFormComponent', () => {
  let component: FullLoadAmpsFormComponent;
  let fixture: ComponentFixture<FullLoadAmpsFormComponent>;
  let service: FullLoadAmpsService;
  let warningsSpy: jasmine.Spy;

  function formGroupOf(controlName: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[formControlName="${controlName}"]`)?.closest('.form-group');
  }

  function textsIn(controlName: string, selector: string): Array<string> {
    return Array.from(formGroupOf(controlName).querySelectorAll(selector))
      .map((el: HTMLElement) => el.textContent.replace(/\s+/g, ' ').trim());
  }

  function setValue(controlName: string, value: number, markDirty: boolean = true): void {
    const control = component.form.controls[controlName];
    control.setValue(value);
    if (markDirty) {
      control.markAsDirty();
    } else {
      control.markAsPristine();
    }
    fixture.detectChanges();
  }

  function setWarnings(overrides: Partial<FLAMotorWarnings>): void {
    component.warnings = makeWarnings(overrides);
    fixture.detectChanges();
  }

  function createWith(motor: FanMotor): void {
    service.fullLoadAmpsInputs.next(motor);
    fixture = TestBed.createComponent(FullLoadAmpsFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    const psatSpy = jasmine.createSpyObj('PsatService', ['estFLA']);
    const convertSpy = jasmine.createSpyObj('ConvertUnitsService', ['value']);

    await TestBed.configureTestingModule({
      declarations: [FullLoadAmpsFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FullLoadAmpsService,
        { provide: PsatService, useValue: psatSpy },
        { provide: ConvertUnitsService, useValue: convertSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(FullLoadAmpsService);
    warningsSpy = spyOn(service, 'checkMotorWarnings').and.returnValue(makeWarnings());
  });

  describe('initialization', () => {
    beforeEach(() => createWith(makeMotor()));

    it('builds the form from the current service inputs', () => {
      expect(component.form.controls.motorRatedPower.value).toBe(600);
      expect(component.form.controls.motorRpm.value).toBe(1180);
      expect(component.form.controls.efficiencyClass.value).toBe(1);
      expect(component.form.controls.motorRatedVoltage.value).toBe(470);
    });

    it('checks warnings against the current inputs and settings', () => {
      expect(warningsSpy).toHaveBeenCalledWith(jasmine.objectContaining({ motorRpm: 1180 }), SETTINGS);
    });

    it('pushes the form values back to the service inputs', () => {
      expect(service.fullLoadAmpsInputs.getValue()).toEqual(jasmine.objectContaining({
        motorRatedPower: 600,
        motorRpm: 1180,
        fullLoadAmps: undefined,
      }));
    });
  });

  describe('service observers', () => {
    beforeEach(() => createWith(makeMotor()));

    it('rebuilds the form from the inputs when data is reset', () => {
      service.fullLoadAmpsInputs.next(makeMotor({ motorRpm: 3000 }));
      service.resetData.next(true);
      expect(component.form.controls.motorRpm.value).toBe(3000);
    });

    it('rebuilds the form from the inputs when an example is generated', () => {
      service.fullLoadAmpsInputs.next(makeMotor({ motorRatedVoltage: 230 }));
      service.generateExample.next(true);
      expect(component.form.controls.motorRatedVoltage.value).toBe(230);
    });

    it('renders the full-load amps result and updates it on each emission', () => {
      service.fullLoadAmpsResult.next(683.25);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('683.25 A');

      service.fullLoadAmpsResult.next(120);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('120 A');
    });
  });

  describe('user actions', () => {
    beforeEach(() => createWith(makeMotor()));

    const LINE_FREQ_CASES: Array<[frequency: number, startRpm: number, expectedRpm: number]> = [
      [60, 1485, 1780],
      [60, 1200, 1200],
      [50, 1780, 1485],
      [50, 1200, 1200],
    ];
    LINE_FREQ_CASES.forEach(([frequency, startRpm, expectedRpm]) => {
      it(`sets rpm ${startRpm} -> ${expectedRpm} when line frequency changes to ${frequency}`, () => {
        component.form.controls.motorRpm.setValue(startRpm);
        component.form.controls.lineFrequency.setValue(frequency);
        component.changeLineFreq();
        expect(component.form.controls.motorRpm.value).toBe(expectedRpm);
        expect(service.fullLoadAmpsInputs.getValue().motorRpm).toBe(expectedRpm);
      });
    });

    it('recalculates through the service when the efficiency class changes', () => {
      const changeSpy = spyOn(service, 'changeEfficiencyClass').and.callThrough();
      component.form.controls.efficiencyClass.setValue(2);
      component.changeEfficiencyClass();
      expect(changeSpy).toHaveBeenCalledWith(component.form);
      expect(service.fullLoadAmpsInputs.getValue().efficiencyClass).toBe(2);
    });

    it('pushes edited values to the service and rechecks warnings on calculate', () => {
      warningsSpy.calls.reset();
      component.form.controls.motorRatedVoltage.setValue(230);
      component.calculate();
      expect(service.fullLoadAmpsInputs.getValue().motorRatedVoltage).toBe(230);
      expect(warningsSpy).toHaveBeenCalledWith(jasmine.objectContaining({ motorRatedVoltage: 230 }), SETTINGS);
    });
  });

  describe('validator toggling', () => {
    it('requires a specified efficiency between 0 and 100 when the efficiency class is specified', () => {
      createWith(makeMotor({ efficiencyClass: 3 }));
      const control = component.form.controls.specifiedEfficiency;
      control.setValue(null);
      expect(control.errors?.required).toBeTruthy();
      control.setValue(150);
      expect(control.errors?.max).toBeTruthy();
    });

    it('leaves the specified efficiency unconstrained for other efficiency classes', () => {
      createWith(makeMotor({ efficiencyClass: 1 }));
      const control = component.form.controls.specifiedEfficiency;
      control.setValue(null);
      expect(control.valid).toBeTrue();
    });
  });

  describe('template rendering', () => {
    it('lists the 50 Hz and 60 Hz line frequency options', () => {
      createWith(makeMotor());
      const options = Array.from(fixture.nativeElement.querySelectorAll('[formControlName="lineFrequency"] option'))
        .map((el: HTMLElement) => el.textContent.trim());
      expect(options).toEqual(['50 Hz', '60 Hz']);
    });

    it('lists every efficiency class option', () => {
      createWith(makeMotor());
      const options = Array.from(fixture.nativeElement.querySelectorAll('[formControlName="efficiencyClass"] option'))
        .map((el: HTMLElement) => el.textContent.trim());
      expect(options).toEqual(['Standard Efficiency', 'Energy Efficient', 'Premium Efficient', 'Specified']);
    });

    describe('specified efficiency field', () => {
      const HIDDEN_CLASSES: Array<number> = [0, 1, 2];
      HIDDEN_CLASSES.forEach(effClass => {
        it(`is hidden for efficiency class ${effClass}`, () => {
          createWith(makeMotor({ efficiencyClass: effClass }));
          expect(fixture.nativeElement.querySelector('[formControlName="specifiedEfficiency"]')).toBeNull();
        });
      });

      it('is shown for the specified efficiency class', () => {
        createWith(makeMotor({ efficiencyClass: 3 }));
        expect(fixture.nativeElement.querySelector('[formControlName="specifiedEfficiency"]')).not.toBeNull();
      });

      it('appears when the efficiency class is switched to specified', () => {
        createWith(makeMotor({ efficiencyClass: 1 }));
        component.form.controls.efficiencyClass.setValue(3);
        component.changeEfficiencyClass();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('[formControlName="specifiedEfficiency"]')).not.toBeNull();
      });

      it('shows no error message when the efficiency is valid', () => {
        createWith(makeMotor({ efficiencyClass: 3 }));
        expect(formGroupOf('specifiedEfficiency').querySelector('.alert-danger')).toBeNull();
      });

      it('shows no error message while the invalid efficiency is pristine', () => {
        createWith(makeMotor({ efficiencyClass: 3 }));
        setValue('specifiedEfficiency', null, false);
        expect(formGroupOf('specifiedEfficiency').querySelector('.alert-danger')).toBeNull();
      });

      const EFFICIENCY_ERRORS: Array<[value: number, message: string]> = [
        [null, 'Value Required'],
        [150, "Value can't be greater than 100 %."],
        [-5, "Value can't be less than 0 %."],
      ];
      EFFICIENCY_ERRORS.forEach(([value, message]) => {
        it(`shows only "${message}" for an efficiency of ${value}`, () => {
          createWith(makeMotor({ efficiencyClass: 3 }));
          setValue('specifiedEfficiency', value);
          expect(textsIn('specifiedEfficiency', '.alert-danger > span')).toEqual([message]);
        });
      });
    });

    describe('required messages', () => {
      const REQUIRED_FIELDS: Array<string> = ['motorRatedPower', 'motorRpm', 'motorRatedVoltage'];
      REQUIRED_FIELDS.forEach(field => {
        it(`shows "Value Required" for an empty, dirty ${field}`, () => {
          createWith(makeMotor());
          setValue(field, null);
          expect(textsIn(field, '.alert-danger')).toEqual(['Value Required']);
        });

        it(`hides "Value Required" for an empty, pristine ${field}`, () => {
          createWith(makeMotor());
          setValue(field, null, false);
          expect(textsIn(field, '.alert-danger')).toEqual([]);
        });

        it(`hides "Value Required" for a filled ${field}`, () => {
          createWith(makeMotor());
          expect(textsIn(field, '.alert-danger')).toEqual([]);
        });
      });
    });

    describe('warnings', () => {
      const WARNING_CASES: Array<[field: string, key: keyof FLAMotorWarnings, message: string]> = [
        ['motorRatedPower', 'ratedPowerError', 'Rated motor power is too small.'],
        ['motorRpm', 'rpmError', 'Motor RPM too small for selected efficiency class'],
        ['motorRatedVoltage', 'voltageError', 'Voltage must be greater than 200'],
      ];
      WARNING_CASES.forEach(([field, key, message]) => {
        it(`shows the ${key} warning for a dirty ${field}`, () => {
          createWith(makeMotor());
          setWarnings({ [key]: message });
          expect(textsIn(field, '.alert-warning')).toEqual([message]);
        });

        it(`hides the ${key} warning for a pristine ${field}`, () => {
          createWith(makeMotor());
          component.form.controls[field].markAsPristine();
          setWarnings({ [key]: message });
          expect(textsIn(field, '.alert-warning')).toEqual([]);
        });

        it(`hides the ${key} warning when there is no warning`, () => {
          createWith(makeMotor());
          setWarnings({});
          expect(textsIn(field, '.alert-warning')).toEqual([]);
        });
      });

      it('hides the rpm warning while the rpm is invalid', () => {
        createWith(makeMotor());
        setValue('motorRpm', null);
        setWarnings({ rpmError: 'Motor RPM too small for selected efficiency class' });
        expect(textsIn('motorRpm', '.alert-warning')).toEqual([]);
        expect(textsIn('motorRpm', '.alert-danger')).toEqual(['Value Required']);
      });

      it('shows the rated power warning alongside the required message when the power is empty', () => {
        createWith(makeMotor());
        setValue('motorRatedPower', null);
        setWarnings({ ratedPowerError: 'Rated motor power is too small.' });
        expect(textsIn('motorRatedPower', '.alert-warning')).toEqual(['Rated motor power is too small.']);
      });
    });
  });

  describe('destroy', () => {
    beforeEach(() => createWith(makeMotor()));

    it('stops rebuilding the form on reset after the component is destroyed', () => {
      const formBefore = component.form;
      fixture.destroy();
      service.fullLoadAmpsInputs.next(makeMotor({ motorRpm: 3000 }));
      service.resetData.next(true);
      expect(component.form).toBe(formBefore);
    });

    it('stops rebuilding the form on example generation after the component is destroyed', () => {
      const formBefore = component.form;
      fixture.destroy();
      service.generateExample.next(true);
      expect(component.form).toBe(formBefore);
    });
  });
});
