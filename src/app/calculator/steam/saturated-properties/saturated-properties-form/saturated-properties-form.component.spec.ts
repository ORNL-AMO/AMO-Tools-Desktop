import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { SaturatedPropertiesFormComponent } from './saturated-properties-form.component';
import { Settings } from '../../../../shared/models/settings';
import { SaturatedPropertiesOutput } from '../../../../shared/models/steam/steam-outputs';
import { SteamPressureOrTemp } from '../../../../shared/models/steam/steam-inputs';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = {
  pressureMeasurement: 'psi',
  temperatureMeasurement: 'F',
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamSpecificVolumeMeasurement: 'ft3lb',
} as Settings;

const RANGES = { minTemp: 32, maxTemp: 705, minPressure: -14, maxPressure: 3185 };

function makeOutput(): SaturatedPropertiesOutput {
  return {
    saturatedPressure: 101.23456,
    saturatedTemperature: 337.987,
    liquidEnthalpy: 308.555,
    gasEnthalpy: 1188.333,
    evaporationEnthalpy: 879.777,
    liquidEntropy: 0.48765,
    gasEntropy: 1.60321,
    evaporationEntropy: 1.11555,
    liquidVolume: 0.01788,
    gasVolume: 4.43219,
    evaporationVolume: 4.41431,
  };
}

function makeForm(pressureOrTemperature: number, pressure: any = 100, temperature: any = 300): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    pressureOrTemperature: [pressureOrTemperature, Validators.required],
    saturatedPressure: [pressure, [Validators.required, Validators.min(RANGES.minPressure), Validators.max(RANGES.maxPressure)]],
    saturatedTemperature: [temperature],
  });
}

// Displayed results, in template order, with their formatted values for makeOutput().
const RESULT_ROWS: Array<{ label: string, text: string }> = [
  { label: 'Pressure', text: '101.2346' },
  { label: 'Temperature', text: '337.99' },
  { label: 'Liquid Specific Enthalpy', text: '308.56' },
  { label: 'Liquid Specific Entropy', text: '0.4877' },
  { label: 'Liquid Specific Volume', text: '0.0179' },
  { label: 'Gas Specific Enthalpy', text: '1,188.33' },
  { label: 'Gas Specific Entropy', text: '1.6032' },
  { label: 'Gas Specific Volume', text: '4.4322' },
  { label: 'Evaporation Specific Enthalpy', text: '879.78' },
  { label: 'Evaporation Specific Entropy', text: '1.1156' },
  { label: 'Evaporation Specific Volume', text: '4.4143' },
];

describe('SaturatedPropertiesFormComponent', () => {
  let component: SaturatedPropertiesFormComponent;
  let fixture: ComponentFixture<SaturatedPropertiesFormComponent>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function resultValues(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.text-center strong'))
      .map((el: HTMLElement) => el.textContent.trim());
  }

  function createComponent(form: UntypedFormGroup): void {
    fixture = TestBed.createComponent(SaturatedPropertiesFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('saturatedPropertiesForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('output', makeOutput());
    fixture.componentRef.setInput('ranges', RANGES);
    fixture.detectChanges();
  }

  function setControl(name: string, value: any): void {
    const control = component.saturatedPropertiesForm.controls[name];
    control.setValue(value);
    control.markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SaturatedPropertiesFormComponent, SettingsLabelStubPipe],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization and validators', () => {
    it('in pressure mode requires the pressure in range and clears temperature validators', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE, 100, ''));
      const form = component.saturatedPropertiesForm;
      expect(form.controls.saturatedTemperature.valid).toBeTrue();
      form.controls.saturatedPressure.setValue(RANGES.maxPressure + 1);
      expect(form.controls.saturatedPressure.errors.max).toBeTruthy();
    });

    it('in temperature mode requires the temperature in range and clears pressure validators', () => {
      createComponent(makeForm(SteamPressureOrTemp.TEMPERATURE, '', 300));
      const form = component.saturatedPropertiesForm;
      expect(form.controls.saturatedPressure.valid).toBeTrue();
      form.controls.saturatedTemperature.setValue(RANGES.minTemp - 1);
      expect(form.controls.saturatedTemperature.errors.min).toBeTruthy();
    });

    it('switches validators when the mode changes and setValidators runs', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE, 100, ''));
      const form = component.saturatedPropertiesForm;
      form.controls.pressureOrTemperature.setValue(SteamPressureOrTemp.TEMPERATURE);
      component.setValidators();
      form.controls.saturatedTemperature.updateValueAndValidity();
      expect(form.controls.saturatedTemperature.errors.required).toBeTruthy();
      expect(form.controls.saturatedPressure.validator).toBeNull();
    });
  });

  describe('input visibility by mode', () => {
    it('shows only the pressure input in pressure mode', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE));
      expect(query('#saturatedPressure')).toBeTruthy();
      expect(query('#saturatedTemperature')).toBeNull();
    });

    it('shows only the temperature input in temperature mode', () => {
      createComponent(makeForm(SteamPressureOrTemp.TEMPERATURE));
      expect(query('#saturatedPressure')).toBeNull();
      expect(query('#saturatedTemperature')).toBeTruthy();
    });

    it('swaps the inputs when the mode control changes', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE));
      component.saturatedPropertiesForm.controls.pressureOrTemperature.setValue(SteamPressureOrTemp.TEMPERATURE);
      fixture.detectChanges();
      expect(query('#saturatedPressure')).toBeNull();
      expect(query('#saturatedTemperature')).toBeTruthy();
    });
  });

  describe('pressure validation messages', () => {
    beforeEach(() => createComponent(makeForm(SteamPressureOrTemp.PRESSURE)));

    it('hides the error block while the pressure is valid', () => {
      setControl('saturatedPressure', 100);
      expect(query('.alert-danger')).toBeNull();
    });

    it('hides the error block while an invalid pressure is pristine', () => {
      component.saturatedPropertiesForm.controls.saturatedPressure.setValue('');
      fixture.detectChanges();
      expect(query('.alert-danger')).toBeNull();
    });

    const cases = [
      { name: 'required', value: '', text: 'Value Required' },
      { name: 'max', value: RANGES.maxPressure + 1, text: `Value can't be greater than ${RANGES.maxPressure}` },
      { name: 'min', value: RANGES.minPressure - 1, text: `Value can't be less than ${RANGES.minPressure}` },
    ];
    cases.forEach(testCase => {
      it(`shows only the ${testCase.name} message`, () => {
        setControl('saturatedPressure', testCase.value);
        const block = query('.alert-danger');
        expect(block).toBeTruthy();
        expect(block.children.length).toBe(1);
        expect(block.textContent).toContain(testCase.text);
      });
    });

    it('shows the general pressure unit next to range errors', () => {
      setControl('saturatedPressure', RANGES.maxPressure + 1);
      expect(query('.alert-danger span span').innerHTML).toBe('psi');
    });
  });

  describe('temperature validation messages', () => {
    beforeEach(() => createComponent(makeForm(SteamPressureOrTemp.TEMPERATURE)));

    it('hides the error block while the temperature is valid', () => {
      setControl('saturatedTemperature', 300);
      expect(query('.alert-danger')).toBeNull();
    });

    it('hides the error block while an invalid temperature is pristine', () => {
      component.saturatedPropertiesForm.controls.saturatedTemperature.setValue('');
      fixture.detectChanges();
      expect(query('.alert-danger')).toBeNull();
    });

    const cases = [
      { name: 'required', value: '', text: 'Value Required' },
      { name: 'max', value: RANGES.maxTemp + 1, text: `Value can't be greater than ${RANGES.maxTemp}` },
      { name: 'min', value: RANGES.minTemp - 1, text: `Value can't be less than ${RANGES.minTemp}` },
    ];
    cases.forEach(testCase => {
      it(`shows only the ${testCase.name} message`, () => {
        setControl('saturatedTemperature', testCase.value);
        const block = query('.alert-danger');
        expect(block).toBeTruthy();
        expect(block.children.length).toBe(1);
        expect(block.textContent).toContain(testCase.text);
      });
    });

    it('shows the general temperature unit next to range errors', () => {
      setControl('saturatedTemperature', RANGES.minTemp - 1);
      expect(query('.alert-danger span span').innerHTML).toBe('F');
    });
  });

  describe('results display', () => {
    it('shows every formatted result while the form is valid', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE));
      const values = resultValues();
      expect(values.length).toBe(RESULT_ROWS.length);
      RESULT_ROWS.forEach((row, index) => {
        expect(values[index]).withContext(row.label).toContain(row.text);
        expect(values[index]).withContext(row.label).not.toContain('—');
      });
    });

    it('shows a dash for every result while the form is invalid', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE, ''));
      const values = resultValues();
      expect(values.length).toBe(RESULT_ROWS.length);
      values.forEach((value, index) => expect(value).withContext(RESULT_ROWS[index].label).toBe('—'));
    });

    it('switches from values to dashes when the form becomes invalid', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE));
      setControl('saturatedPressure', '');
      expect(resultValues().every(value => value === '—')).toBeTrue();
    });
  });

  describe('user actions', () => {
    it('emits the form on calculate and keeps the output when valid', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE));
      spyOn(component.emitCalculate, 'emit');
      component.calculate();
      expect(component.emitCalculate.emit).toHaveBeenCalledWith(component.saturatedPropertiesForm);
      expect(component.output.saturatedPressure).toBe(101.23456);
    });

    it('zeroes the output and emits the form on calculate when invalid', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE, ''));
      spyOn(component.emitCalculate, 'emit');
      component.calculate();
      expect(component.emitCalculate.emit).toHaveBeenCalledWith(component.saturatedPropertiesForm);
      expect(component.output.saturatedPressure).toBe(0);
      expect(component.output.gasVolume).toBe(0);
    });

    it('calculates when the pressure input changes', () => {
      createComponent(makeForm(SteamPressureOrTemp.PRESSURE));
      spyOn(component.emitCalculate, 'emit');
      query('#saturatedPressure').dispatchEvent(new Event('input'));
      expect(component.emitCalculate.emit).toHaveBeenCalled();
    });

    it('emits the focused field name', () => {
      createComponent(makeForm(SteamPressureOrTemp.TEMPERATURE));
      spyOn(component.emitChangeField, 'emit');
      query('#saturatedTemperature').dispatchEvent(new Event('focus'));
      expect(component.emitChangeField.emit).toHaveBeenCalledWith('saturatedTemperature');
    });
  });
});
