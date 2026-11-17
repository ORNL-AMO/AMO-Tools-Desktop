import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SpecificSpeedFormComponent } from './specific-speed-form.component';
import { pumpTypesConstant } from '../../../../psat/psatConstants';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;

function makeSpeedForm(values: { pumpType?: number, pumpRPM?: number, flowRate?: number, head?: number } = {}): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    pumpType: [values.pumpType ?? 0, Validators.required],
    pumpRPM: [values.pumpRPM ?? 1780, [Validators.required, Validators.min(0)]],
    flowRate: [values.flowRate ?? 2000, [Validators.required, Validators.min(0)]],
    head: [values.head ?? 277, [Validators.required, Validators.min(0)]],
  });
}

const VALIDATED_FIELDS: Array<{ control: string, unit: (settings: Settings) => string }> = [
  { control: 'pumpRPM', unit: () => 'rpm' },
  { control: 'flowRate', unit: (settings) => settings.flowMeasurement },
  { control: 'head', unit: (settings) => settings.distanceMeasurement },
];

describe('SpecificSpeedFormComponent', () => {
  let component: SpecificSpeedFormComponent;
  let fixture: ComponentFixture<SpecificSpeedFormComponent>;
  let speedForm: UntypedFormGroup;

  function getFormGroup(control: string): HTMLElement {
    return fixture.nativeElement.querySelector(`[formControlName="${control}"]`).closest('.form-group');
  }

  function getErrorContainer(control: string): HTMLElement | null {
    return getFormGroup(control).querySelector(':scope > .alert-danger');
  }

  function getErrorMessages(control: string): Array<string> {
    const container = getErrorContainer(control);
    if (!container) {
      return [];
    }
    return Array.from(container.querySelectorAll('span')).map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function setDirtyValue(control: string, value: number): void {
    speedForm.controls[control].setValue(value);
    speedForm.controls[control].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpecificSpeedFormComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SpecificSpeedFormComponent);
    component = fixture.componentInstance;
    speedForm = makeSpeedForm();
    fixture.componentRef.setInput('speedForm', speedForm);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('copies the pump types constant', () => {
      expect(component.pumpTypes).toEqual(pumpTypesConstant);
      expect(component.pumpTypes).not.toBe(pumpTypesConstant);
    });
  });

  describe('pump type options', () => {
    it('renders one option per pump type, in order', () => {
      const options: Array<HTMLOptionElement> = Array.from(fixture.nativeElement.querySelectorAll('#pumpType option'));
      expect(options.map(option => option.textContent.trim())).toEqual(pumpTypesConstant.map(pumpType => pumpType.display));
    });

    it('selects the option matching the form value', () => {
      speedForm.controls.pumpType.setValue(pumpTypesConstant[2].value);
      fixture.detectChanges();
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#pumpType');
      expect(select.selectedIndex).toBe(2);
    });
  });

  describe('unit labels', () => {
    it('renders settings units next to flow rate and head', () => {
      expect(getFormGroup('flowRate').querySelector('.units').textContent.trim()).toBe('gpm');
      expect(getFormGroup('head').querySelector('.units').textContent.trim()).toBe('ft');
      expect(getFormGroup('pumpRPM').querySelector('.units').textContent.trim()).toBe('rpm');
    });
  });

  describe('template visibility: validation messages', () => {
    VALIDATED_FIELDS.forEach(({ control, unit }) => {
      describe(control, () => {
        it('hides the error container when the value is valid and pristine', () => {
          expect(getErrorContainer(control)).toBeNull();
        });

        it('hides the error container when the value is invalid but pristine', () => {
          speedForm.controls[control].setValue(null);
          fixture.detectChanges();
          expect(speedForm.controls[control].invalid).toBeTrue();
          expect(getErrorContainer(control)).toBeNull();
        });

        it('hides the error container when the value is dirty but valid', () => {
          setDirtyValue(control, 10);
          expect(getErrorContainer(control)).toBeNull();
        });

        it('shows only the required message when the dirty value is empty', () => {
          setDirtyValue(control, null);
          expect(getErrorMessages(control)).toEqual(['Value required.']);
        });

        it('shows only the min message when the dirty value is below zero', () => {
          setDirtyValue(control, -5);
          expect(getErrorMessages(control)).toEqual([`Value can't be less than 0 ${unit(MOCK_SETTINGS)}.`]);
        });

        it('hides the error container again once the value is corrected', () => {
          setDirtyValue(control, -5);
          setDirtyValue(control, 5);
          expect(getErrorContainer(control)).toBeNull();
        });
      });
    });
  });

  describe('user actions', () => {
    it('emits calculate when the pump type changes', () => {
      const calculateSpy = jasmine.createSpy('calculate');
      component.calculate.subscribe(calculateSpy);
      fixture.nativeElement.querySelector('#pumpType').dispatchEvent(new Event('change'));
      expect(calculateSpy).toHaveBeenCalledOnceWith(true);
    });

    ['pumpRPM', 'flowRate', 'head'].forEach(control => {
      it(`emits calculate on ${control} input`, () => {
        const calculateSpy = jasmine.createSpy('calculate');
        component.calculate.subscribe(calculateSpy);
        fixture.nativeElement.querySelector(`[formControlName="${control}"]`).dispatchEvent(new Event('input'));
        expect(calculateSpy).toHaveBeenCalledOnceWith(true);
      });
    });

    ['pumpType', 'pumpRPM', 'flowRate', 'head'].forEach(control => {
      it(`emits changeField "${control}" when ${control} is focused`, () => {
        const changeFieldSpy = jasmine.createSpy('changeField');
        component.changeField.subscribe(changeFieldSpy);
        fixture.nativeElement.querySelector(`[formControlName="${control}"]`).dispatchEvent(new Event('focus'));
        expect(changeFieldSpy).toHaveBeenCalledWith(control);
        expect(changeFieldSpy.calls.allArgs().every(args => args[0] === control)).toBeTrue();
      });
    });
  });
});
