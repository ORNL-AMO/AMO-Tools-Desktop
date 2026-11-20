import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { BlowdownRateFormComponent } from './blowdown-rate-form.component';
import { BoilerBlowdownRateInputs, BoilerBlowdownRateService } from '../boiler-blowdown-rate.service';
import { SteamService } from '../../steam.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string, suffix?: string): string {
    return (value ?? '') + (suffix || '');
  }
}

const MOCK_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  steamMassFlowMeasurement: 'klb',
  steamTemperatureMeasurement: 'F',
  steamEnergyMeasurement: 'MMBtu',
  steamVolumeMeasurement: 'gal',
  fuelCost: 5,
  otherFuelCost: 7,
  waterCost: 0.003,
} as Settings;

function makeInputs(overrides: Partial<BoilerBlowdownRateInputs> = {}): BoilerBlowdownRateInputs {
  return {
    steamFlow: 100,
    steamTemperature: 500,
    feedwaterConductivity: 400,
    blowdownConductivity: 4000,
    makeupWaterTemperature: 50,
    fuelCost: 5,
    waterCost: 0.003,
    operatingHours: 8000,
    boilerEfficiency: 80,
    boilerUtilityType: 'Natural Gas',
    ...overrides
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').replace(/\s+\./g, '.').trim();
}

describe('BlowdownRateFormComponent', () => {
  let component: BlowdownRateFormComponent;
  let fixture: ComponentFixture<BlowdownRateFormComponent>;
  let service: BoilerBlowdownRateService;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getErrorContainer(inputId: string): HTMLElement | null {
    return query('#' + inputId).closest('.form-group').querySelector('.alert-danger');
  }

  function getErrorMessages(inputId: string): Array<string> {
    const container = getErrorContainer(inputId);
    return container ? Array.from(container.children).map((child: HTMLElement) => normalize(child.textContent)) : [];
  }

  function groupLabels(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label.group-label')).map((l: HTMLElement) => normalize(l.textContent));
  }

  function createComponent(options: { isBaseline?: boolean, inTreasureHunt?: boolean, disabled?: boolean, showBoiler?: boolean, showOperations?: boolean } = {}): void {
    service.baselineInputs.next(makeInputs());
    service.modificationInputs.next(makeInputs({ steamFlow: 50 }));
    service.showBoiler.next(options.showBoiler ?? true);
    service.showOperations.next(options.showOperations ?? true);
    fixture = TestBed.createComponent(BlowdownRateFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('isBaseline', options.isBaseline ?? true);
    fixture.componentRef.setInput('disabled', options.disabled ?? false);
    fixture.componentRef.setInput('inTreasureHunt', options.inTreasureHunt ?? false);
    fixture.detectChanges();
  }

  function setErrors(form: UntypedFormGroup, controlName: string, errors: ValidationErrors): void {
    form.controls[controlName].setErrors(errors);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [BlowdownRateFormComponent, SettingsLabelStubPipe],
      providers: [
        BoilerBlowdownRateService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: SteamService, useValue: jasmine.createSpyObj('SteamService', ['saturatedProperties', 'steamProperties']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    service = TestBed.inject(BoilerBlowdownRateService);
  });

  describe('initialization', () => {
    it('builds the baseline forms from the baseline inputs', () => {
      createComponent();
      expect(component.idString).toBe('baseline_');
      expect(component.boilerForm.controls.steamFlow.value).toBe(100);
      expect(query('#baseline_feedwaterConductivity')).not.toBeNull();
    });

    it('builds the modification forms from the modification inputs', () => {
      createComponent({ isBaseline: false });
      expect(component.idString).toBe('modification_');
      expect(component.boilerForm.controls.steamFlow.value).toBe(50);
      expect(query('#modification_feedwaterConductivity')).not.toBeNull();
    });

    it('disables the forms when created disabled', () => {
      createComponent({ disabled: true });
      expect(component.conductivityForm.disabled).toBe(true);
      expect(component.boilerForm.disabled).toBe(true);
      expect(component.operationsForm.disabled).toBe(true);
    });

    it('forces boiler and operations open in treasure hunt', () => {
      createComponent({ inTreasureHunt: true, showBoiler: false, showOperations: false });
      expect(component.showBoiler).toBe(true);
      expect(component.showOperations).toBe(true);
    });
  });

  describe('observers', () => {
    it('rebuilds the forms when setForms emits', () => {
      createComponent();
      service.baselineInputs.next(makeInputs({ steamFlow: 321 }));
      service.setForms.next(true);
      expect(component.boilerForm.controls.steamFlow.value).toBe(321);
    });

    it('tracks the operating hours', () => {
      createComponent();
      service.operatingHours.next({ hoursPerYear: 100 } as any);
      expect(component.operatingHours).toEqual({ hoursPerYear: 100 } as any);
    });

    it('toggles forms when the disabled input changes', () => {
      createComponent();
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.boilerForm.disabled).toBe(true);
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();
      expect(component.boilerForm.enabled).toBe(true);
    });
  });

  describe('section visibility', () => {
    it('shows boiler and operations forms when toggled on', () => {
      createComponent({ showBoiler: true, showOperations: true });
      expect(query('#baseline_steamFlow')).not.toBeNull();
      expect(query('#baseline_fuelCost')).not.toBeNull();
    });

    it('hides boiler and operations forms when toggled off', () => {
      createComponent({ showBoiler: false, showOperations: false });
      expect(query('#baseline_steamFlow')).toBeNull();
      expect(query('#baseline_fuelCost')).toBeNull();
    });

    it('shows the boiler form while hiding the operations form', () => {
      createComponent({ showBoiler: true, showOperations: false });
      expect(query('#baseline_steamFlow')).not.toBeNull();
      expect(query('#baseline_fuelCost')).toBeNull();
    });

    it('updates visibility when the service toggles change', () => {
      createComponent({ showBoiler: false, showOperations: false });
      service.showBoiler.next(true);
      fixture.detectChanges();
      expect(query('#baseline_steamFlow')).not.toBeNull();
    });
  });

  describe('group labels and toggle icons', () => {
    it('shows minus icons for open baseline sections outside treasure hunt', () => {
      createComponent({ showBoiler: true, showOperations: true });
      expect(groupLabels()).toEqual(['Conductivity Readings', 'Boiler', 'Operations']);
      expect(fixture.nativeElement.querySelectorAll('.remove-curve').length).toBe(2);
      expect(fixture.nativeElement.querySelectorAll('.add-curve').length).toBe(0);
    });

    it('shows plus icons for closed baseline sections outside treasure hunt', () => {
      createComponent({ showBoiler: false, showOperations: false });
      expect(fixture.nativeElement.querySelectorAll('.remove-curve').length).toBe(0);
      expect(fixture.nativeElement.querySelectorAll('.add-curve').length).toBe(2);
    });

    it('shows one of each icon when only the boiler is open', () => {
      createComponent({ showBoiler: true, showOperations: false });
      expect(fixture.nativeElement.querySelectorAll('.remove-curve').length).toBe(1);
      expect(fixture.nativeElement.querySelectorAll('.add-curve').length).toBe(1);
    });

    it('shows no icons on the modification form', () => {
      createComponent({ isBaseline: false, showBoiler: true, showOperations: false });
      expect(groupLabels()).toEqual(['Conductivity Readings', 'Boiler', 'Operations']);
      expect(fixture.nativeElement.querySelectorAll('.remove-curve, .add-curve').length).toBe(0);
    });

    it('shows plain labels with no icons in treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      expect(groupLabels()).toEqual(['Conductivity Readings', 'Boiler', 'Operations']);
      expect(fixture.nativeElement.querySelectorAll('.remove-curve, .add-curve').length).toBe(0);
    });
  });

  describe('treasure hunt utility type', () => {
    it('hides the utility type select outside treasure hunt', () => {
      createComponent();
      expect(query('#boilerUtilityType')).toBeNull();
    });

    it('shows the utility type select in treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      const options = Array.from(fixture.nativeElement.querySelectorAll('#boilerUtilityType option')).map((o: HTMLElement) => normalize(o.textContent));
      expect(options).toEqual(['Natural Gas', 'Other Gas']);
    });

    it('sets the fuel cost from the utility type', () => {
      createComponent({ inTreasureHunt: true });
      component.operationsForm.controls.boilerUtilityType.setValue('Other Fuel');
      component.setUtilityType();
      expect(component.operationsForm.controls.fuelCost.value).toBe(7);
      expect(service.baselineInputs.getValue().fuelCost).toBe(7);
    });
  });

  describe('error messages', () => {
    type FormKey = 'conductivityForm' | 'boilerForm' | 'operationsForm';
    const CASES: Array<{ form: FormKey, control: string, errors: ValidationErrors, expected: Array<string> }> = [
      { form: 'conductivityForm', control: 'feedwaterConductivity', errors: { required: true }, expected: ['Value Required'] },
      { form: 'conductivityForm', control: 'feedwaterConductivity', errors: { max: { max: 9000 } }, expected: ["Value can't be greater than 9000 μS/cm."] },
      { form: 'conductivityForm', control: 'feedwaterConductivity', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0 μS/cm."] },
      { form: 'conductivityForm', control: 'blowdownConductivity', errors: { required: true }, expected: ['Value Required'] },
      { form: 'conductivityForm', control: 'blowdownConductivity', errors: { max: { max: 9000 } }, expected: ["Value can't be greater than 9000 μS/cm."] },
      { form: 'conductivityForm', control: 'blowdownConductivity', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0 μS/cm."] },
      { form: 'boilerForm', control: 'steamFlow', errors: { required: true }, expected: ['Value Required'] },
      { form: 'boilerForm', control: 'steamFlow', errors: { max: { max: 100000 } }, expected: ["Value can't be greater than 100000 klb."] },
      { form: 'boilerForm', control: 'steamFlow', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0 klb."] },
      { form: 'boilerForm', control: 'steamTemperature', errors: { required: true }, expected: ['Value Required'] },
      { form: 'boilerForm', control: 'steamTemperature', errors: { max: { max: 1472 } }, expected: ["Value can't be greater than 1472 F."] },
      { form: 'boilerForm', control: 'steamTemperature', errors: { min: { min: 32 } }, expected: ["Value can't be less than 32 F."] },
      { form: 'boilerForm', control: 'boilerEfficiency', errors: { required: true }, expected: ['Value Required'] },
      { form: 'boilerForm', control: 'boilerEfficiency', errors: { max: { max: 100 } }, expected: ["Value can't be greater than 100 %."] },
      { form: 'boilerForm', control: 'boilerEfficiency', errors: { min: { min: 50 } }, expected: ["Value can't be less than 50 %."] },
      { form: 'operationsForm', control: 'fuelCost', errors: { required: true }, expected: ['Value Required'] },
      { form: 'operationsForm', control: 'fuelCost', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0 $/MMBtu"] },
      { form: 'operationsForm', control: 'waterCost', errors: { required: true }, expected: ['Value Required'] },
      { form: 'operationsForm', control: 'waterCost', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0 $/gal"] },
      { form: 'operationsForm', control: 'makeupWaterTemperature', errors: { required: true }, expected: ['Value Required'] },
      { form: 'operationsForm', control: 'makeupWaterTemperature', errors: { max: { max: 160 } }, expected: ["Value can't be greater than 160 F."] },
      { form: 'operationsForm', control: 'makeupWaterTemperature', errors: { min: { min: 40 } }, expected: ["Value can't be less than 40 F."] },
    ];

    CASES.forEach(c => {
      it(`shows ${JSON.stringify(c.expected)} for ${c.control} errors ${Object.keys(c.errors)}`, () => {
        createComponent();
        setErrors(component[c.form], c.control, c.errors);
        expect(getErrorMessages('baseline_' + c.control)).toEqual(c.expected);
      });
    });

    ['feedwaterConductivity', 'blowdownConductivity', 'steamFlow', 'steamTemperature', 'boilerEfficiency', 'operatingHours', 'fuelCost', 'waterCost', 'makeupWaterTemperature']
      .forEach(control => {
        it(`hides the ${control} error container when valid`, () => {
          createComponent();
          expect(getErrorContainer('baseline_' + control)).toBeNull();
        });
      });

    it('throws when rendering operating hours errors because the template references an undefined form', () => {
      createComponent();
      component.operationsForm.controls.operatingHours.setErrors({ max: { max: 8760 } });
      component.operationsForm.controls.operatingHours.markAsDirty();
      expect(() => fixture.detectChanges()).toThrowError(TypeError);
    });
  });

  describe('modals', () => {
    beforeEach(() => createComponent());

    it('hides both modals by default', () => {
      expect(query('app-operating-hours-modal')).toBeNull();
      expect(query('app-boiler-efficiency-modal')).toBeNull();
    });

    it('shows and hides the operating hours modal', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('saves operating hours from the modal', () => {
      component.openOperatingHoursModal();
      component.updateOperatingHours({ hoursPerYear: 4000 } as any);
      expect(service.baselineInputs.getValue().operatingHours).toBe(4000);
      expect(service.operatingHours.getValue()).toEqual({ hoursPerYear: 4000 } as any);
      expect(component.showOperatingHoursModal).toBe(false);
    });

    it('shows the boiler efficiency modal and flags the modal open', () => {
      component.openBoilerEfficiencyModal();
      fixture.detectChanges();
      expect(query('app-boiler-efficiency-modal')).not.toBeNull();
      expect(service.modalOpen.getValue()).toBe(true);
    });

    it('sets the boiler efficiency and closes the modal', () => {
      component.openBoilerEfficiencyModal();
      component.setBoilerEfficiencyAndClose(91);
      fixture.detectChanges();
      expect(component.boilerForm.controls.boilerEfficiency.value).toBe(91);
      expect(query('app-boiler-efficiency-modal')).toBeNull();
      expect(service.modalOpen.getValue()).toBe(false);
    });
  });

  describe('user actions', () => {
    it('saves each form into the baseline inputs', () => {
      createComponent();
      component.conductivityForm.controls.feedwaterConductivity.setValue(1);
      component.saveConductivity();
      component.boilerForm.controls.steamFlow.setValue(2);
      component.saveBoiler();
      component.operationsForm.controls.waterCost.setValue(3);
      component.saveOperations();
      const inputs = service.baselineInputs.getValue();
      expect(inputs.feedwaterConductivity).toBe(1);
      expect(inputs.steamFlow).toBe(2);
      expect(inputs.waterCost).toBe(3);
    });

    it('saves each form into the modification inputs', () => {
      createComponent({ isBaseline: false });
      component.boilerForm.controls.steamFlow.setValue(9);
      component.saveBoiler();
      expect(service.modificationInputs.getValue().steamFlow).toBe(9);
      expect(service.baselineInputs.getValue().steamFlow).toBe(100);
    });

    it('updates the current field on focus and focus out', () => {
      createComponent();
      component.focusField('steamFlow');
      expect(service.currentField.getValue()).toBe('steamFlow');
      component.focusOut();
      expect(service.currentField.getValue()).toBe('default');
    });

    it('opening operations also opens the boiler', () => {
      createComponent({ showBoiler: false, showOperations: false });
      component.toggleOperations();
      expect(service.showOperations.getValue()).toBe(true);
      expect(service.showBoiler.getValue()).toBe(true);
    });

    it('closing operations leaves the boiler open', () => {
      createComponent();
      component.toggleOperations();
      expect(service.showOperations.getValue()).toBe(false);
      expect(service.showBoiler.getValue()).toBe(true);
    });

    it('closing the boiler also closes operations', () => {
      createComponent();
      component.toggleBoiler();
      expect(service.showBoiler.getValue()).toBe(false);
      expect(service.showOperations.getValue()).toBe(false);
    });

    it('opening the boiler leaves operations closed', () => {
      createComponent({ showBoiler: false, showOperations: false });
      component.toggleBoiler();
      expect(service.showBoiler.getValue()).toBe(true);
      expect(service.showOperations.getValue()).toBe(false);
    });
  });

  describe('destroy', () => {
    it('stops reacting to service emissions after destroy', () => {
      createComponent();
      fixture.destroy();
      service.showBoiler.next(false);
      service.operatingHours.next({ hoursPerYear: 1 } as any);
      expect(component.showBoiler).toBe(true);
      expect(component.operatingHours).toBeUndefined();
    });
  });
});
