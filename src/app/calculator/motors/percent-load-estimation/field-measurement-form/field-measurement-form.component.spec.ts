import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldMeasurementFormComponent } from './field-measurement-form.component';
import { FieldMeasurementInputs, PercentLoadEstimationService } from '../percent-load-estimation.service';

function makeInputs(overrides: Partial<FieldMeasurementInputs> = {}): FieldMeasurementInputs {
  return {
    phase1Voltage: 467,
    phase1Amps: 36,
    phase2Voltage: 473,
    phase2Amps: 38,
    phase3Voltage: 469,
    phase3Amps: 37,
    ratedVoltage: 460,
    ratedCurrent: 72.1,
    powerFactor: 77,
    ...overrides,
  };
}

describe('FieldMeasurementFormComponent', () => {
  let component: FieldMeasurementFormComponent;
  let fixture: ComponentFixture<FieldMeasurementFormComponent>;
  let service: PercentLoadEstimationService;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getFormGroup(controlName: string): HTMLElement {
    return query(`input[formControlName="${controlName}"]`).closest('.form-group') as HTMLElement;
  }

  function getErrorTexts(controlName: string): Array<string> {
    const alert = getFormGroup(controlName).querySelector('.alert-danger');
    if (!alert) {
      return null;
    }
    return Array.from(alert.querySelectorAll('span')).map(span => span.textContent.trim());
  }

  function setDirtyValue(controlName: string, value: number | null): void {
    component.form.controls[controlName].setValue(value);
    component.form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(data: FieldMeasurementInputs = makeInputs()): void {
    fixture = TestBed.createComponent(FieldMeasurementFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FieldMeasurementFormComponent],
      providers: [PercentLoadEstimationService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    service = TestBed.inject(PercentLoadEstimationService);
  });

  describe('initialization', () => {
    it('builds the form from the input data', () => {
      const getFormSpy = spyOn(service, 'getFieldMeasurementFormFromObj').and.callThrough();
      const data = makeInputs();
      createComponent(data);
      expect(getFormSpy).toHaveBeenCalledWith(data);
      expect(component.form.controls.powerFactor.value).toBe(77);
      expect(component.form.controls.phase2Voltage.value).toBe(473);
      expect(component.form.controls.ratedCurrent.value).toBe(72.1);
    });

    it('renders the form values into the inputs', () => {
      createComponent();
      expect((query('input[formControlName="phase1Amps"]') as HTMLInputElement).value).toBe('36');
      expect((query('input[formControlName="ratedVoltage"]') as HTMLInputElement).value).toBe('460');
    });

    it('rebuilds the form when the data input changes', () => {
      createComponent();
      const firstForm = component.form;
      fixture.componentRef.setInput('data', makeInputs({ powerFactor: 90 }));
      fixture.detectChanges();
      expect(component.form).not.toBe(firstForm);
      expect(component.form.controls.powerFactor.value).toBe(90);
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      createComponent();
    });

    it('calculate emits the data read back from the form', () => {
      const emitSpy = spyOn(component.emitCalculate, 'emit');
      component.form.controls.phase1Amps.setValue(40);
      component.calculate();
      expect(emitSpy).toHaveBeenCalledWith(makeInputs({ phase1Amps: 40 }));
      expect(component.data).toEqual(makeInputs({ phase1Amps: 40 }));
    });

    it('typing into a field triggers a calculation', () => {
      const emitSpy = spyOn(component.emitCalculate, 'emit');
      const input = query('input[formControlName="ratedVoltage"]') as HTMLInputElement;
      input.value = '480';
      input.dispatchEvent(new Event('input'));
      expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ ratedVoltage: 480 }));
    });
  });

  describe('template visibility', () => {
    beforeEach(() => {
      createComponent();
    });

    describe('power factor errors', () => {
      it('shows no error block when the value is valid', () => {
        setDirtyValue('powerFactor', 50);
        expect(getErrorTexts('powerFactor')).toBeNull();
      });

      it('shows no error block when the value is invalid but pristine', () => {
        component.form.controls.powerFactor.setValue(150);
        fixture.detectChanges();
        expect(component.form.controls.powerFactor.invalid).toBeTrue();
        expect(getErrorTexts('powerFactor')).toBeNull();
      });

      const cases: Array<{ name: string, value: number | null, expected: Array<string> }> = [
        { name: 'required', value: null, expected: ['Value required.'] },
        { name: 'max', value: 150, expected: ['Value cannot exceed 100%'] },
        { name: 'min', value: -5, expected: ['Value cannot be less than 0%'] },
      ];
      cases.forEach(testCase => {
        it(`shows only the ${testCase.name} message when the value is dirty and ${testCase.name}-invalid`, () => {
          setDirtyValue('powerFactor', testCase.value);
          expect(getErrorTexts('powerFactor')).toEqual(testCase.expected);
        });
      });
    });

    ['ratedCurrent', 'ratedVoltage'].forEach(controlName => {
      describe(`${controlName} errors`, () => {
        it('shows no error block when the value is valid', () => {
          setDirtyValue(controlName, 10);
          expect(getErrorTexts(controlName)).toBeNull();
        });

        it('shows no error block when the value is missing but pristine', () => {
          component.form.controls[controlName].setValue(null);
          fixture.detectChanges();
          expect(getErrorTexts(controlName)).toBeNull();
        });

        it('shows the required message when the value is dirty and missing', () => {
          setDirtyValue(controlName, null);
          expect(getErrorTexts(controlName)).toEqual(['Value required.']);
        });
      });
    });

    it('shows the error block but no message when rated current is dirty and below the minimum', () => {
      setDirtyValue('ratedCurrent', -1);
      expect(getErrorTexts('ratedCurrent')).toEqual([]);
    });
  });
});
