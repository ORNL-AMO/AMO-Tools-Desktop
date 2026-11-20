import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FlashTankFormComponent } from './flash-tank-form.component';
import { SteamService } from '../../steam.service';
import { Settings } from '../../../../shared/models/settings';
import { ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb'
} as Settings;

function makeFlashTankForm(): FormGroup {
  return new FormBuilder().group({
    inletWaterPressure: [200, [Validators.required, Validators.min(-14), Validators.max(3200)]],
    thermodynamicQuantity: [0, Validators.required],
    quantityValue: [400, [Validators.required, Validators.min(32), Validators.max(1472)]],
    inletWaterMassFlow: [30, [Validators.required, Validators.min(0)]],
    tankPressure: [50, [Validators.required, Validators.min(-14), Validators.max(3200)]]
  });
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FlashTankFormComponent', () => {
  let component: FlashTankFormComponent;
  let fixture: ComponentFixture<FlashTankFormComponent>;
  let form: FormGroup;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;

  function getErrorContainer(inputId: string): HTMLElement | null {
    return fixture.nativeElement.querySelector('#' + inputId).closest('.form-group').querySelector('.alert-danger');
  }

  function getErrorMessages(inputId: string): Array<string> {
    const container = getErrorContainer(inputId);
    if (!container) {
      return [];
    }
    return Array.from(container.children).map((child: HTMLElement) => normalize(child.textContent));
  }

  function getUnitAddon(): HTMLElement | null {
    return fixture.nativeElement.querySelector('#quantityValue').closest('.input-group').querySelector('.input-group-addon');
  }

  function setDirtyValue(controlName: string, value: number | null): void {
    form.controls[controlName].setValue(value);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 50, max: 2000 });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FlashTankFormComponent, SettingsLabelStubPipe],
      providers: [{ provide: SteamService, useValue: steamServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    form = makeFlashTankForm();
    fixture = TestBed.createComponent(FlashTankFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('flashTankForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  });

  describe('initialization', () => {
    it('assigns the thermodynamic quantity options', () => {
      expect(component.thermoOptions).toBe(ThermodynamicQuantityOptions);
    });

    it('renders one option per thermodynamic quantity', () => {
      const options = Array.from(fixture.nativeElement.querySelectorAll('#thermodynamicQuantity option'))
        .map((option: HTMLElement) => normalize(option.textContent));
      expect(options).toEqual(ThermodynamicQuantityOptions.map(option => option.display));
    });
  });

  describe('user actions', () => {
    it('emits the focused field name and default on focus out', () => {
      const emitted: Array<string> = [];
      component.emitChangeField.subscribe((value: string) => emitted.push(value));
      component.focusField('tankPressure');
      component.focusOut();
      expect(emitted).toEqual(['tankPressure', 'default']);
    });

    it('emits the form through calculate', () => {
      const emitted: Array<FormGroup> = [];
      component.emitCalculate.subscribe((value: FormGroup) => emitted.push(value));
      component.calculate();
      expect(emitted).toEqual([form]);
    });
  });

  describe('validator toggling', () => {
    it('applies the new quantity range without resetting the value and recalculates', () => {
      const emitted: Array<FormGroup> = [];
      component.emitCalculate.subscribe((value: FormGroup) => emitted.push(value));
      form.controls.thermodynamicQuantity.setValue(1);
      component.setQuantityRanges();
      expect(steamServiceSpy.getQuantityRange).toHaveBeenCalledWith(MOCK_SETTINGS, 1);
      expect(form.controls.quantityValue.value).toBe(400);
      expect(form.controls.quantityValue.valid).toBeTrue();
      form.controls.quantityValue.setValue(2001);
      expect(form.controls.quantityValue.errors.max).toBeTruthy();
      form.controls.quantityValue.setValue(49);
      expect(form.controls.quantityValue.errors.min).toBeTruthy();
      expect(emitted).toEqual([form]);
    });

    it('revalidates the current value immediately against the new range', () => {
      steamServiceSpy.getQuantityRange.and.returnValue({ min: 0, max: 1 });
      component.setQuantityRanges();
      expect(form.controls.quantityValue.errors.max).toBeTruthy();
    });
  });

  describe('template visibility', () => {
    const FIELDS: Array<{ inputId: string, min: number, max?: number, minMessage: string, maxMessage?: string }> = [
      { inputId: 'inletWaterPressure', min: -15, max: 3201, minMessage: "Value can't be less than -14 psig.", maxMessage: "Value can't be greater than 3200 psig." },
      { inputId: 'quantityValue', min: 31, max: 1473, minMessage: "Value can't be less than 32 F.", maxMessage: "Value can't be greater than 1472 F." },
      { inputId: 'inletWaterMassFlow', min: -1, minMessage: "Value can't be less than 0 klb." },
      { inputId: 'tankPressure', min: -15, max: 3201, minMessage: "Value can't be less than -14 psig.", maxMessage: "Value can't be greater than 3200 psig." },
    ];

    FIELDS.forEach(field => {
      it(`hides the ${field.inputId} error container when the value is valid`, () => {
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`hides the ${field.inputId} error container when the value is invalid but pristine`, () => {
        form.controls[field.inputId].setValue(null);
        fixture.detectChanges();
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`shows only the required message for ${field.inputId} when empty and dirty`, () => {
        setDirtyValue(field.inputId, null);
        expect(getErrorMessages(field.inputId)).toEqual(['Value Required']);
      });

      it(`shows only the min message for ${field.inputId} below its minimum`, () => {
        setDirtyValue(field.inputId, field.min);
        expect(getErrorMessages(field.inputId)).toEqual([field.minMessage]);
      });

      if (field.max !== undefined) {
        it(`shows only the max message for ${field.inputId} above its maximum`, () => {
          setDirtyValue(field.inputId, field.max);
          expect(getErrorMessages(field.inputId)).toEqual([field.maxMessage]);
        });
      }
    });

    [
      { quantity: 0, unit: 'F' },
      { quantity: 1, unit: 'btuLb' },
      { quantity: 2, unit: 'btulbF' },
    ].forEach(unitCase => {
      it(`shows the ${unitCase.unit} quantity unit when quantity is ${unitCase.quantity}`, () => {
        form.controls.thermodynamicQuantity.setValue(unitCase.quantity);
        fixture.detectChanges();
        expect(normalize(getUnitAddon().innerHTML)).toBe(unitCase.unit);
      });
    });

    it('hides the quantity unit when quantity is quality (3)', () => {
      form.controls.thermodynamicQuantity.setValue(3);
      fixture.detectChanges();
      expect(getUnitAddon()).toBeNull();
    });

    it('hides the unit inside the quantity max message when quantity is quality (3)', () => {
      form.controls.thermodynamicQuantity.setValue(3);
      setDirtyValue('quantityValue', 2000);
      expect(getErrorMessages('quantityValue')).toEqual(["Value can't be greater than 1472 ."]);
      expect(getErrorContainer('quantityValue').children[0].querySelector('span')).toBeNull();
    });

    it('hides the unit inside the quantity min message when quantity is quality (3)', () => {
      form.controls.thermodynamicQuantity.setValue(3);
      setDirtyValue('quantityValue', 0);
      expect(getErrorMessages('quantityValue')).toEqual(["Value can't be less than 32 ."]);
      expect(getErrorContainer('quantityValue').children[0].querySelector('span')).toBeNull();
    });
  });
});
