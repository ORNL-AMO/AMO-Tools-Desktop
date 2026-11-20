import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SteamPropertiesFormComponent } from './steam-properties-form.component';
import { Settings } from '../../../../shared/models/settings';
import { SteamPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { ThermodynamicQuantity } from '../../../../shared/models/steam/steam-inputs';
import { GreaterThanValidator } from '../../../../shared/validators/greater-than';

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
  steamSpecificVolumeMeasurement: 'ft3lb',
} as Settings;

const RANGES = { minPressure: -14.696, maxPressure: 3185, minQuantityValue: 32, maxQuantityValue: 700 };

function makeOutput(quality: number = 1): SteamPropertiesOutput {
  return {
    pressure: 100.12345,
    temperature: 337.987,
    specificEnthalpy: 1188.333,
    specificEntropy: 1.60321,
    quality: quality,
    specificVolume: 4.43219,
  };
}

function makeForm(quantity: number = ThermodynamicQuantity.TEMPERATURE, pressure: any = 100, quantityValue: any = 300): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    pressure: [pressure, [Validators.required, GreaterThanValidator.greaterThan(RANGES.minPressure), Validators.max(RANGES.maxPressure)]],
    thermodynamicQuantity: [quantity, Validators.required],
    quantityValue: [quantityValue, [Validators.required, Validators.min(RANGES.minQuantityValue), Validators.max(RANGES.maxQuantityValue)]],
  });
}

describe('SteamPropertiesFormComponent', () => {
  let component: SteamPropertiesFormComponent;
  let fixture: ComponentFixture<SteamPropertiesFormComponent>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function inputGroup(index: number): HTMLElement {
    return fixture.nativeElement.querySelectorAll('form > .form-group')[index];
  }

  function createComponent(form: UntypedFormGroup = makeForm(), output: SteamPropertiesOutput = makeOutput()): void {
    fixture = TestBed.createComponent(SteamPropertiesFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('steamPropertiesForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('steamPropertiesOutput', output);
    fixture.detectChanges();
  }

  function setControl(name: string, value: any): void {
    const control = component.steamPropertiesForm.controls[name];
    control.setValue(value);
    control.markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SteamPropertiesFormComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('pressure validation messages', () => {
    beforeEach(() => createComponent());

    it('hides the error block while the pressure is valid', () => {
      setControl('pressure', 100);
      expect(inputGroup(0).querySelector('.alert-danger')).toBeNull();
    });

    it('hides the error block while an invalid pressure is pristine', () => {
      component.steamPropertiesForm.controls.pressure.setValue('');
      fixture.detectChanges();
      expect(inputGroup(0).querySelector('.alert-danger')).toBeNull();
    });

    const cases = [
      { name: 'required', value: '', text: 'Value Required' },
      { name: 'max', value: RANGES.maxPressure + 1, text: `Value can't be greater than ${RANGES.maxPressure} psig.` },
      { name: 'greaterThan', value: -20, text: `Value must be greater than ${RANGES.minPressure} psig.` },
    ];
    cases.forEach(testCase => {
      it(`shows only the ${testCase.name} message`, () => {
        setControl('pressure', testCase.value);
        const block = inputGroup(0).querySelector('.alert-danger');
        expect(block).toBeTruthy();
        expect(block.children.length).toBe(1);
        expect(block.textContent.replace(/\s+/g, ' ')).toContain(testCase.text);
      });
    });
  });

  describe('known quantity unit', () => {
    const cases = [
      { quantity: ThermodynamicQuantity.TEMPERATURE, unit: 'F' },
      { quantity: ThermodynamicQuantity.ENTHALPY, unit: 'btuLb' },
      { quantity: ThermodynamicQuantity.ENTROPY, unit: 'btulbF' },
    ];
    cases.forEach(testCase => {
      it(`shows the ${testCase.unit} unit addon for quantity ${testCase.quantity}`, () => {
        createComponent(makeForm(testCase.quantity));
        const addon = inputGroup(1).querySelector('.input-group-addon');
        expect(addon).toBeTruthy();
        expect(addon.innerHTML).toBe(testCase.unit);
      });
    });

    it('hides the unit addon for quality', () => {
      createComponent(makeForm(ThermodynamicQuantity.QUALITY));
      expect(inputGroup(1).querySelector('.input-group-addon')).toBeNull();
    });
  });

  describe('known quantity validation messages', () => {
    it('hides the error block while the value is valid', () => {
      createComponent();
      setControl('quantityValue', 300);
      expect(inputGroup(1).querySelector('.alert-danger')).toBeNull();
    });

    it('hides the error block while an invalid value is pristine', () => {
      createComponent();
      component.steamPropertiesForm.controls.quantityValue.setValue('');
      fixture.detectChanges();
      expect(inputGroup(1).querySelector('.alert-danger')).toBeNull();
    });

    const cases = [
      { name: 'required', value: '', text: 'Value Required' },
      { name: 'max', value: RANGES.maxQuantityValue + 1, text: `Value can't be greater than ${RANGES.maxQuantityValue}` },
      { name: 'min', value: RANGES.minQuantityValue - 1, text: `Value can't be less than ${RANGES.minQuantityValue}` },
    ];
    cases.forEach(testCase => {
      it(`shows only the ${testCase.name} message`, () => {
        createComponent();
        setControl('quantityValue', testCase.value);
        const block = inputGroup(1).querySelector('.alert-danger');
        expect(block).toBeTruthy();
        expect(block.children.length).toBe(1);
        expect(block.textContent.replace(/\s+/g, ' ')).toContain(testCase.text);
      });
    });

    [{ name: 'max', value: RANGES.maxQuantityValue + 1 }, { name: 'min', value: RANGES.minQuantityValue - 1 }].forEach(testCase => {
      it(`shows the unit in the ${testCase.name} message for a non-quality quantity`, () => {
        createComponent(makeForm(ThermodynamicQuantity.TEMPERATURE));
        setControl('quantityValue', testCase.value);
        const unit = inputGroup(1).querySelector('.alert-danger > span > span');
        expect(unit).toBeTruthy();
        expect(unit.innerHTML).toBe('F');
      });

      it(`hides the unit in the ${testCase.name} message for quality`, () => {
        createComponent(makeForm(ThermodynamicQuantity.QUALITY));
        setControl('quantityValue', testCase.value);
        const block = inputGroup(1).querySelector('.alert-danger');
        expect(block).toBeTruthy();
        expect(block.children.length).toBe(1);
        expect(block.querySelector(':scope > span > span')).toBeNull();
      });
    });
  });

  describe('results display', () => {
    it('shows the formatted numeric results', () => {
      createComponent();
      const values = Array.from(fixture.nativeElement.querySelectorAll('div.text-center.bold'))
        .map((el: HTMLElement) => el.textContent.trim());
      expect(values[0]).toContain('100.1235');
      expect(values[1]).toContain('337.99');
      expect(values[2]).toContain('1,188.33');
      expect(values[3]).toContain('1.6032');
      expect(values[5]).toContain('4.4322');
    });

    const qualityCases = [
      { quality: 0, text: 'Liquid' },
      { quality: 1, text: 'Gas' },
      { quality: 0.456, text: '0.46' },
    ];
    qualityCases.forEach(testCase => {
      it(`shows only "${testCase.text}" for quality ${testCase.quality}`, () => {
        createComponent(makeForm(), makeOutput(testCase.quality));
        const qualityCell = fixture.nativeElement.querySelectorAll('div.text-center.bold')[4] as HTMLElement;
        const spans = qualityCell.querySelectorAll('span');
        expect(spans.length).toBe(1);
        expect(spans[0].textContent.trim()).toBe(testCase.text);
      });
    });
  });

  describe('user actions', () => {
    it('clears the value, emits the new quantity and zeroes the output when the quantity changes', () => {
      createComponent();
      spyOn(component.emitQuantityChange, 'emit');
      component.steamPropertiesForm.controls.thermodynamicQuantity.setValue(ThermodynamicQuantity.ENTHALPY);
      query('#thermodynamicQuantity').dispatchEvent(new Event('change'));
      expect(component.steamPropertiesForm.controls.quantityValue.value).toBe('');
      expect(component.emitQuantityChange.emit).toHaveBeenCalledWith(ThermodynamicQuantity.ENTHALPY);
      expect(component.steamPropertiesOutput.pressure).toBe(0);
    });

    it('emits the form and keeps the output on calculate when valid', () => {
      createComponent();
      spyOn(component.emitCalculate, 'emit');
      query('#pressure').dispatchEvent(new Event('input'));
      expect(component.emitCalculate.emit).toHaveBeenCalledWith(component.steamPropertiesForm);
      expect(component.steamPropertiesOutput.pressure).toBe(100.12345);
    });

    it('zeroes the output and emits the form on calculate when invalid', () => {
      createComponent(makeForm(ThermodynamicQuantity.TEMPERATURE, ''));
      spyOn(component.emitCalculate, 'emit');
      component.calculate();
      expect(component.emitCalculate.emit).toHaveBeenCalledWith(component.steamPropertiesForm);
      expect(component.steamPropertiesOutput.temperature).toBe(0);
    });

    it('emits the focused field name', () => {
      createComponent();
      spyOn(component.changeField, 'emit');
      query('#quantityValue').dispatchEvent(new Event('focus'));
      expect(component.changeField.emit).toHaveBeenCalledWith('quantityValue');
    });
  });
});
