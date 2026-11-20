import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DeaeratorFormComponent } from './deaerator-form.component';
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

function makeDeaeratorForm(waterQuantity: number = 0, steamQuantity: number = 0): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    deaeratorPressure: [14, [Validators.required, Validators.min(-14), Validators.max(3200)]],
    ventRate: [0.1, [Validators.required, Validators.min(0), Validators.max(10)]],
    feedwaterMassFlow: [400, [Validators.required, Validators.min(0)]],
    waterPressure: [14, [Validators.required, Validators.min(-14), Validators.max(3200)]],
    waterThermodynamicQuantity: [waterQuantity, Validators.required],
    waterQuantityValue: [98, [Validators.required, Validators.min(32), Validators.max(1472)]],
    steamPressure: [20, [Validators.required, Validators.min(-14), Validators.max(3200)]],
    steamThermodynamicQuantity: [steamQuantity, Validators.required],
    steamQuantityValue: [260, [Validators.required, Validators.min(32), Validators.max(1472)]]
  });
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('DeaeratorFormComponent', () => {
  let component: DeaeratorFormComponent;
  let fixture: ComponentFixture<DeaeratorFormComponent>;
  let form: UntypedFormGroup;
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

  function getUnitAddon(inputId: string): HTMLElement | null {
    return fixture.nativeElement.querySelector('#' + inputId).closest('.input-group').querySelector('.input-group-addon');
  }

  function setDirtyValue(controlName: string, value: number | null): void {
    form.controls[controlName].setValue(value);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(newForm: UntypedFormGroup): void {
    form = newForm;
    fixture = TestBed.createComponent(DeaeratorFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('deaeratorForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 50, max: 2000 });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DeaeratorFormComponent, SettingsLabelStubPipe],
      providers: [{ provide: SteamService, useValue: steamServiceSpy }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    createComponent(makeDeaeratorForm());
  });

  describe('initialization', () => {
    it('assigns the thermodynamic quantity options', () => {
      expect(component.thermoOptions).toBe(ThermodynamicQuantityOptions);
    });

    ['waterThermodynamicQuantity', 'steamThermodynamicQuantity'].forEach(selectId => {
      it(`renders one ${selectId} option per thermodynamic quantity`, () => {
        const options = Array.from(fixture.nativeElement.querySelectorAll(`#${selectId} option`))
          .map((option: HTMLElement) => normalize(option.textContent));
        expect(options).toEqual(ThermodynamicQuantityOptions.map(option => option.display));
      });
    });
  });

  describe('user actions', () => {
    it('emits the focused field name and default on focus out', () => {
      const emitted: Array<string> = [];
      component.emitChangeField.subscribe((value: string) => emitted.push(value));
      component.focusField('ventRate');
      component.focusOut();
      expect(emitted).toEqual(['ventRate', 'default']);
    });

    it('emits the form through calculate', () => {
      const emitted: Array<UntypedFormGroup> = [];
      component.emitCalculate.subscribe((value: UntypedFormGroup) => emitted.push(value));
      component.calculate();
      expect(emitted).toEqual([form]);
    });
  });

  describe('validator toggling', () => {
    const QUANTITY_FIELDS = [
      { method: 'setWaterQuantityRanges', quantity: 'waterThermodynamicQuantity', value: 'waterQuantityValue' },
      { method: 'setSteamQuantityRanges', quantity: 'steamThermodynamicQuantity', value: 'steamQuantityValue' },
    ];

    QUANTITY_FIELDS.forEach(field => {
      it(`${field.method} resets the value, applies the new range and recalculates`, () => {
        const emitted: Array<UntypedFormGroup> = [];
        component.emitCalculate.subscribe((value: UntypedFormGroup) => emitted.push(value));
        form.controls[field.quantity].setValue(1);
        component[field.method]();
        expect(steamServiceSpy.getQuantityRange).toHaveBeenCalledWith(MOCK_SETTINGS, 1);
        expect(form.controls[field.value].value).toBe(0);
        form.controls[field.value].setValue(2001);
        expect(form.controls[field.value].errors.max).toBeTruthy();
        form.controls[field.value].setValue(49);
        expect(form.controls[field.value].errors.min).toBeTruthy();
        form.controls[field.value].setValue(100);
        expect(form.controls[field.value].valid).toBeTrue();
        expect(emitted).toEqual([form]);
      });
    });
  });

  describe('template visibility', () => {
    const FIELDS: Array<{ inputId: string, min: number, max?: number, minMessage: string, maxMessage?: string }> = [
      { inputId: 'deaeratorPressure', min: -15, max: 3201, minMessage: "Value can't be less than -14 psig.", maxMessage: "Value can't be greater than 3200 psig." },
      { inputId: 'ventRate', min: -1, max: 11, minMessage: "Value can't be less than 0 %.", maxMessage: "Value can't be greater than 10 %." },
      { inputId: 'feedwaterMassFlow', min: -1, minMessage: "Value can't be less than 0 klb.", },
      { inputId: 'waterPressure', min: -15, max: 3201, minMessage: "Value can't be less than -14 psig.", maxMessage: "Value can't be greater than 3200 psig." },
      { inputId: 'steamPressure', min: -15, max: 3201, minMessage: "Value can't be less than -14 psig.", maxMessage: "Value can't be greater than 3200 psig." },
      { inputId: 'waterQuantityValue', min: 31, max: 1473, minMessage: "Value can't be less than 32 F.", maxMessage: "Value can't be greater than 1472 F." },
      { inputId: 'steamQuantityValue', min: 31, max: 1473, minMessage: "Value can't be less than 32 F.", maxMessage: "Value can't be greater than 1472 F." },
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

    const QUANTITY_UNITS = [
      { quantity: 'waterThermodynamicQuantity', value: 'waterQuantityValue' },
      { quantity: 'steamThermodynamicQuantity', value: 'steamQuantityValue' },
    ];
    const UNIT_CASES = [
      { quantity: 0, unit: 'F' },
      { quantity: 1, unit: 'btuLb' },
      { quantity: 2, unit: 'btulbF' },
    ];

    QUANTITY_UNITS.forEach(field => {
      UNIT_CASES.forEach(unitCase => {
        it(`shows the ${unitCase.unit} unit for ${field.value} when quantity is ${unitCase.quantity}`, () => {
          form.controls[field.quantity].setValue(unitCase.quantity);
          fixture.detectChanges();
          expect(normalize(getUnitAddon(field.value).innerHTML)).toBe(unitCase.unit);
        });
      });

      it(`hides the ${field.value} unit when quantity is quality (3)`, () => {
        form.controls[field.quantity].setValue(3);
        fixture.detectChanges();
        expect(getUnitAddon(field.value)).toBeNull();
      });

      it(`shows the unit inside the ${field.value} min/max messages when quantity is not quality`, () => {
        setDirtyValue(field.value, 2000);
        const message = getErrorContainer(field.value).children[0];
        expect(message.querySelector('span')).not.toBeNull();
      });

      it(`hides the unit inside the ${field.value} max message when quantity is quality (3)`, () => {
        form.controls[field.quantity].setValue(3);
        setDirtyValue(field.value, 2000);
        expect(getErrorMessages(field.value)).toEqual(["Value can't be greater than 1472 ."]);
        expect(getErrorContainer(field.value).children[0].querySelector('span')).toBeNull();
      });

      it(`hides the unit inside the ${field.value} min message when quantity is quality (3)`, () => {
        form.controls[field.quantity].setValue(3);
        setDirtyValue(field.value, 0);
        expect(getErrorMessages(field.value)).toEqual(["Value can't be less than 32 ."]);
        expect(getErrorContainer(field.value).children[0].querySelector('span')).toBeNull();
      });
    });
  });
});
