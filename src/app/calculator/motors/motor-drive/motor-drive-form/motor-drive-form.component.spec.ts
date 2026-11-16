import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MotorDriveFormComponent } from './motor-drive-form.component';
import { MotorDriveService } from '../motor-drive.service';
import { MotorDriveInputs } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

function makeInputs(overrides: Partial<MotorDriveInputs> = {}): MotorDriveInputs {
  return {
    motorPower: 5,
    annualOperatingHours: 8760,
    averageMotorLoad: 50,
    electricityCost: 0.066,
    baselineDriveType: 0,
    modificationDriveType: 2,
    ...overrides,
  };
}

function makeSettings(unitsOfMeasure: string): Settings {
  return { unitsOfMeasure: unitsOfMeasure } as Settings;
}

// Fields whose error block has both a required and a min message.
const MIN_FIELDS: Array<string> = ['annualOperatingHours', 'electricityCost', 'motorPower'];

describe('MotorDriveFormComponent', () => {
  let component: MotorDriveFormComponent;
  let fixture: ComponentFixture<MotorDriveFormComponent>;
  let service: MotorDriveService;
  let form: UntypedFormGroup;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  // The error block is the .alert-danger sibling inside the field's .form-group.
  function getErrorBlock(field: string): HTMLElement | null {
    const input = query(`[formControlName="${field}"]`);
    return input.closest('.form-group').querySelector('.alert-danger');
  }

  function getErrorMessages(field: string): Array<string> {
    const block = getErrorBlock(field);
    if (!block) {
      return [];
    }
    return Array.from(block.querySelectorAll('span'))
      .map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function setDirtyValue(field: string, value: number | null): void {
    form.controls[field].setValue(value);
    form.controls[field].markAsDirty();
    fixture.detectChanges();
  }

  function getUnitsText(): Array<string> {
    const input = query('[formControlName="motorPower"]');
    return Array.from(input.parentElement.querySelectorAll('.units'))
      .map((span: HTMLElement) => span.textContent.trim());
  }

  function createComponent(unitsOfMeasure: string = 'Imperial'): void {
    fixture = TestBed.createComponent(MotorDriveFormComponent);
    component = fixture.componentInstance;
    form = service.getFormFromObj(makeInputs());
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('settings', makeSettings(unitsOfMeasure));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [MotorDriveFormComponent],
      providers: [MotorDriveService, UntypedFormBuilder],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(MotorDriveService);
  });

  describe('initialization', () => {
    beforeEach(() => createComponent());

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('renders the form values in the inputs', () => {
      expect((query('#motorPower') as HTMLInputElement).value).toBe('5');
      expect((query('#annualOperatingHours') as HTMLInputElement).value).toBe('8760');
    });
  });

  describe('drive type options', () => {
    beforeEach(() => createComponent());

    ['baselineDriveType', 'modificationDriveType'].forEach((field: string) => {
      it(`renders every drive type as an option of ${field}`, () => {
        const options = Array.from(query(`#${field}`).querySelectorAll('option'))
          .map((option: HTMLElement) => option.textContent.trim());
        expect(options).toEqual(['V Belt Drive', 'Notched V Belt Drive', 'Synchronous Belt Drive', 'Direct Drive']);
      });
    });

    it('selects the option matching the form value', () => {
      expect((query('#baselineDriveType') as HTMLSelectElement).selectedIndex).toBe(0);
      expect((query('#modificationDriveType') as HTMLSelectElement).selectedIndex).toBe(2);
    });
  });

  describe('motor power units', () => {
    it('shows hp for imperial settings', () => {
      createComponent('Imperial');
      expect(getUnitsText()).toEqual(['hp']);
    });

    it('shows kW for metric settings', () => {
      createComponent('Metric');
      expect(getUnitsText()).toEqual(['kW']);
    });
  });

  describe('validation messages', () => {
    beforeEach(() => createComponent());

    ['annualOperatingHours', 'electricityCost', 'motorPower', 'averageMotorLoad'].forEach((field: string) => {
      it(`hides the ${field} error block when the value is valid`, () => {
        setDirtyValue(field, 10);
        expect(getErrorBlock(field)).toBeNull();
      });

      it(`hides the ${field} error block when invalid but pristine`, () => {
        form.controls[field].setValue(null);
        fixture.detectChanges();
        expect(form.controls[field].invalid).toBeTrue();
        expect(getErrorBlock(field)).toBeNull();
      });
    });

    MIN_FIELDS.forEach((field: string) => {
      it(`shows only the required message for ${field} when it is empty`, () => {
        setDirtyValue(field, null);
        expect(getErrorMessages(field)).toEqual(['Value required.']);
      });

      it(`shows only the min message for ${field} when it is negative`, () => {
        setDirtyValue(field, -1);
        expect(getErrorMessages(field)).toEqual(['Value cannot not be less than 0.']);
      });
    });

    it('shows the required message for averageMotorLoad when it is empty', () => {
      setDirtyValue('averageMotorLoad', null);
      expect(getErrorMessages('averageMotorLoad')).toEqual(['Value required.']);
    });

    // The input's min/max attributes add Angular min/max validators, but the template only has a
    // required message, so an out-of-range value shows an empty error block.
    [-1, 101].forEach((value: number) => {
      it(`shows an empty averageMotorLoad error block for out-of-range value ${value}`, () => {
        setDirtyValue('averageMotorLoad', value);
        expect(getErrorBlock('averageMotorLoad')).not.toBeNull();
        expect(getErrorMessages('averageMotorLoad')).toEqual([]);
      });
    });
  });

  describe('operating hours modal', () => {
    beforeEach(() => createComponent());

    it('is hidden initially', () => {
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('is shown after opening it', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
    });

    it('is hidden after closing it', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('stores the operating hours, patches the form, recalculates, and closes on save', () => {
      const emitted: Array<MotorDriveInputs> = [];
      component.emitCalculate.subscribe((data: MotorDriveInputs) => emitted.push(data));
      const hours = { hoursPerYear: 4000 } as OperatingHours;
      component.openOperatingHoursModal();
      fixture.detectChanges();

      component.updateOperatingHours(hours);
      fixture.detectChanges();

      expect(service.operatingHours).toBe(hours);
      expect(form.controls.annualOperatingHours.value).toBe(4000);
      expect(emitted).toEqual([makeInputs({ annualOperatingHours: 4000 })]);
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('calculation trigger', () => {
    beforeEach(() => createComponent());

    it('emits the current form values on calculate', () => {
      const emitted: Array<MotorDriveInputs> = [];
      component.emitCalculate.subscribe((data: MotorDriveInputs) => emitted.push(data));

      form.controls.motorPower.setValue(20);
      component.calculate();
      form.controls.motorPower.setValue(30);
      component.calculate();

      expect(emitted).toEqual([makeInputs({ motorPower: 20 }), makeInputs({ motorPower: 30 })]);
    });
  });
});
