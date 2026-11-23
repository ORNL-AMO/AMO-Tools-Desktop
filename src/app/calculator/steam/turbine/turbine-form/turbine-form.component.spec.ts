import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { TurbineFormComponent } from './turbine-form.component';
import { TurbineService } from '../turbine.service';
import { SteamService } from '../../steam.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string, suffix?: string): string {
    return value + (suffix || '');
  }
}

const MOCK_SETTINGS = {
  steamPressureMeasurement: 'psig',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF',
  steamMassFlowMeasurement: 'klb',
  steamPowerMeasurement: 'kW',
} as Settings;

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\s+\./g, '.').trim();
}

describe('TurbineFormComponent', () => {
  let component: TurbineFormComponent;
  let fixture: ComponentFixture<TurbineFormComponent>;
  let turbineService: TurbineService;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let form: UntypedFormGroup;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function optionTexts(selector: string): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector + ' option')).map((o: HTMLElement) => normalize(o.textContent));
  }

  function getErrorContainer(inputId: string): HTMLElement | null {
    return query('#' + inputId).closest('.form-group').querySelector('.alert-danger');
  }

  function getErrorMessages(inputId: string): Array<string> {
    const container = getErrorContainer(inputId);
    return container ? Array.from(container.children).map((child: HTMLElement) => normalize(child.textContent)) : [];
  }

  function getUnits(inputId: string): Array<string> {
    return Array.from(query('#' + inputId).closest('.input-group').querySelectorAll(':scope > .units'))
      .map((unit: HTMLElement) => normalize(unit.textContent));
  }

  function createComponent(solveFor: number = 0, patch: { [key: string]: any } = {}): void {
    form = solveFor === 1 ? turbineService.initIsentropicForm(MOCK_SETTINGS) : turbineService.initOutletForm(MOCK_SETTINGS);
    form.patchValue(patch);
    fixture = TestBed.createComponent(TurbineFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('turbineForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  function setErrors(controlName: string, errors: ValidationErrors): void {
    form.controls[controlName].setErrors(errors);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange', 'turbine']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 0, max: 1000 });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TurbineFormComponent, SettingsLabelStubPipe],
      providers: [
        TurbineService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: steamServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    turbineService = TestBed.inject(TurbineService);
  });

  describe('initialization', () => {
    it('assigns thermo options and emits calculate with the form', () => {
      form = turbineService.initOutletForm(MOCK_SETTINGS);
      fixture = TestBed.createComponent(TurbineFormComponent);
      component = fixture.componentInstance;
      const emitted: Array<UntypedFormGroup> = [];
      component.emitCalculate.subscribe(v => emitted.push(v));
      fixture.componentRef.setInput('turbineForm', form);
      fixture.componentRef.setInput('settings', MOCK_SETTINGS);
      fixture.detectChanges();
      expect(component.thermoOptions).toBe(ThermodynamicQuantityOptions);
      expect(emitted).toEqual([form]);
    });
  });

  describe('option lists', () => {
    it('renders solve for, inlet quantity and turbine property options', () => {
      createComponent();
      expect(optionTexts('#solveFor')).toEqual(['Outlet Properties', 'Isentropic Efficiency']);
      expect(optionTexts('#inletQuantity')).toEqual(['Temperature', 'Enthalpy', 'Entropy', 'Quality']);
      expect(optionTexts('#turbineProperty')).toEqual(['Mass Flow', 'Power Out']);
    });

    it('renders outlet quantity options when solving for isentropic efficiency', () => {
      createComponent(1);
      expect(optionTexts('#outletQuantity')).toEqual(['Temperature', 'Enthalpy', 'Entropy', 'Quality']);
    });
  });

  describe('solve for visibility', () => {
    it('shows isentropic efficiency and hides outlet quantity when solving for outlet properties', () => {
      createComponent(0);
      expect(query('#isentropicEfficiency')).not.toBeNull();
      expect(query('#outletQuantity')).toBeNull();
      expect(query('#outletQuantityValue')).toBeNull();
    });

    it('hides isentropic efficiency and shows outlet quantity when solving for isentropic efficiency', () => {
      createComponent(1);
      expect(query('#isentropicEfficiency')).toBeNull();
      expect(query('#outletQuantity')).not.toBeNull();
      expect(query('#outletQuantityValue')).not.toBeNull();
    });
  });

  describe('quantity unit labels', () => {
    const CASES: Array<{ quantity: number, units: Array<string> }> = [
      { quantity: 0, units: ['F'] },
      { quantity: 1, units: ['btuLb'] },
      { quantity: 2, units: ['btulbF'] },
      { quantity: 3, units: [] },
    ];

    CASES.forEach(c => {
      it(`shows ${JSON.stringify(c.units)} for inlet quantity ${c.quantity}`, () => {
        createComponent(0, { inletQuantity: c.quantity });
        expect(getUnits('inletQuantityValue')).toEqual(c.units);
      });

      it(`shows ${JSON.stringify(c.units)} for outlet quantity ${c.quantity}`, () => {
        createComponent(1, { outletQuantity: c.quantity });
        expect(getUnits('outletQuantityValue')).toEqual(c.units);
      });
    });
  });

  describe('turbine property labels', () => {
    function labels(): Array<string> {
      return Array.from(fixture.nativeElement.querySelectorAll('label[for="massFlowOrPowerOut"]')).map((l: HTMLElement) => normalize(l.textContent));
    }

    it('shows the mass flow label and unit for mass flow', () => {
      createComponent(0, { turbineProperty: 0 });
      expect(labels()).toEqual(['Mass Flow']);
      expect(getUnits('massFlowOrPowerOut')).toEqual(['klb/hr']);
    });

    it('shows the power out label and unit for power out', () => {
      createComponent(0, { turbineProperty: 1 });
      expect(labels()).toEqual(['Power Out']);
      expect(getUnits('massFlowOrPowerOut')).toEqual(['kW']);
    });

    it('shows neither label for an unknown property', () => {
      createComponent(0, { turbineProperty: 2 });
      expect(labels()).toEqual([]);
      expect(getUnits('massFlowOrPowerOut')).toEqual([]);
    });
  });

  describe('error messages', () => {
    const CASES: Array<{ control: string, solveFor?: number, patch?: { [key: string]: any }, errors: ValidationErrors, expected: Array<string> }> = [
      { control: 'inletPressure', errors: { required: true }, expected: ['Value Required'] },
      { control: 'inletPressure', errors: { max: { max: 3200 } }, expected: ["Value can't be greater than 3200 psig."] },
      { control: 'inletPressure', errors: { min: { min: -14 } }, expected: ["Value can't be less than -14 psig."] },
      { control: 'inletQuantityValue', errors: { required: true }, expected: ['Value Required'] },
      { control: 'inletQuantityValue', errors: { max: { max: 1000 } }, expected: ["Value can't be greater than 1000 F."] },
      { control: 'inletQuantityValue', errors: { min: { min: 5 } }, expected: ["Value can't be less than 5 F."] },
      { control: 'inletQuantityValue', patch: { inletQuantity: 3 }, errors: { max: { max: 1 } }, expected: ["Value can't be greater than 1."] },
      { control: 'inletQuantityValue', patch: { inletQuantity: 3 }, errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."] },
      { control: 'massFlowOrPowerOut', errors: { required: true }, expected: ['Value Required'] },
      { control: 'massFlowOrPowerOut', errors: { max: { max: 10000 } }, expected: ["Value can't be greater than 10000 klb/hr."] },
      { control: 'massFlowOrPowerOut', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0 klb/hr."] },
      { control: 'massFlowOrPowerOut', patch: { turbineProperty: 1 }, errors: { max: { max: 10000 } }, expected: ["Value can't be greater than 10000 kW."] },
      { control: 'massFlowOrPowerOut', patch: { turbineProperty: 1 }, errors: { min: { min: 0 } }, expected: ["Value can't be less than 0 kW."] },
      { control: 'isentropicEfficiency', errors: { required: true }, expected: ['Value Required'] },
      { control: 'isentropicEfficiency', errors: { max: { max: 100 } }, expected: ["Value can't be greater than 100 %."] },
      { control: 'isentropicEfficiency', errors: { min: { min: 20 } }, expected: ["Value can't be less than 20 %."] },
      { control: 'generatorEfficiency', errors: { required: true }, expected: ['Value Required'] },
      { control: 'generatorEfficiency', errors: { max: { max: 100 } }, expected: ["Value can't be greater than 100 %."] },
      { control: 'generatorEfficiency', errors: { min: { min: 50 } }, expected: ["Value can't be less than 50 %."] },
      { control: 'outletSteamPressure', errors: { required: true }, expected: ['Value Required'] },
      { control: 'outletSteamPressure', errors: { max: { max: 3200 } }, expected: ["Value can't be greater than 3200 psig."] },
      { control: 'outletSteamPressure', errors: { min: { min: -14 } }, expected: ["Value can't be less than -14 psig."] },
      { control: 'outletQuantityValue', solveFor: 1, errors: { required: true }, expected: ['Value Required'] },
      { control: 'outletQuantityValue', solveFor: 1, errors: { max: { max: 1000 } }, expected: ["Value can't be greater than 1000 F."] },
      { control: 'outletQuantityValue', solveFor: 1, errors: { min: { min: 5 } }, expected: ["Value can't be less than 5 F."] },
      { control: 'outletQuantityValue', solveFor: 1, patch: { outletQuantity: 3 }, errors: { max: { max: 1 } }, expected: ["Value can't be greater than 1."] },
      { control: 'outletQuantityValue', solveFor: 1, patch: { outletQuantity: 3 }, errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."] },
    ];

    CASES.forEach(c => {
      it(`shows ${JSON.stringify(c.expected)} for ${c.control} ${JSON.stringify(c.patch || {})} errors ${Object.keys(c.errors)}`, () => {
        createComponent(c.solveFor ?? 0, c.patch);
        setErrors(c.control, c.errors);
        expect(getErrorMessages(c.control)).toEqual(c.expected);
      });
    });

    it('omits the unit span inside quality errors', () => {
      createComponent(0, { inletQuantity: 3 });
      setErrors('inletQuantityValue', { max: { max: 1 } });
      expect(getErrorContainer('inletQuantityValue').querySelectorAll(':scope > span > span').length).toBe(0);
    });

    it('renders the unit span inside temperature errors', () => {
      createComponent(0, { inletQuantity: 0 });
      setErrors('inletQuantityValue', { max: { max: 1 } });
      expect(getErrorContainer('inletQuantityValue').querySelectorAll(':scope > span > span').length).toBe(1);
    });

    ['inletPressure', 'inletQuantityValue', 'massFlowOrPowerOut', 'isentropicEfficiency', 'generatorEfficiency', 'outletSteamPressure'].forEach(control => {
      it(`hides the ${control} error container when valid`, () => {
        createComponent();
        expect(getErrorContainer(control)).toBeNull();
      });

      it(`hides the ${control} error container when invalid but pristine`, () => {
        createComponent();
        form.controls[control].setErrors({ required: true });
        fixture.detectChanges();
        expect(getErrorContainer(control)).toBeNull();
      });
    });

    it('hides the outlet quantity value error container when valid', () => {
      createComponent(1);
      expect(getErrorContainer('outletQuantityValue')).toBeNull();
    });
  });

  describe('validator toggling', () => {
    it('requires isentropic efficiency and clears outlet quantity validators for outlet properties', () => {
      createComponent(0);
      form.controls.isentropicEfficiency.setValue(null);
      form.controls.outletQuantityValue.setValue(5000);
      expect(form.controls.isentropicEfficiency.valid).toBe(false);
      expect(form.controls.outletQuantityValue.valid).toBe(true);
    });

    it('requires outlet quantity and clears isentropic efficiency validators for isentropic efficiency', () => {
      createComponent(0);
      form.controls.solveFor.setValue(1);
      component.setValidators();
      form.controls.isentropicEfficiency.setValue(null);
      form.controls.outletQuantityValue.setValue(5000);
      expect(form.controls.isentropicEfficiency.valid).toBe(true);
      expect(form.controls.outletQuantityValue.valid).toBe(false);
    });

    it('defaults empty quantity values to 0', () => {
      createComponent(0, { inletQuantityValue: null, outletQuantityValue: null });
      expect(form.controls.inletQuantityValue.value).toBe(0);
      expect(form.controls.outletQuantityValue.value).toBe(0);
    });

    it('uses the selected quantity ranges', () => {
      createComponent(0, { inletQuantity: 2 });
      expect(steamServiceSpy.getQuantityRange).toHaveBeenCalledWith(MOCK_SETTINGS, 2);
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('emits the focused field and default on focus out', () => {
      const emitted: Array<string> = [];
      component.emitChangeField.subscribe(v => emitted.push(v));
      component.focusField('inletPressure');
      component.focusOut();
      expect(emitted).toEqual(['inletPressure', 'default']);
    });

    it('returns the option display and unit', () => {
      expect(component.getOptionDisplay(1)).toBe('Enthalpy');
      expect(component.getOptionDisplayUnit(0)).toBe('F');
      expect(component.getOptionDisplayUnit(3)).toBeUndefined();
    });
  });
});
