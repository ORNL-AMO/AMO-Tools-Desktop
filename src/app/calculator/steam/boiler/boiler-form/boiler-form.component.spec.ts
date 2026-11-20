import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { BoilerFormComponent } from './boiler-form.component';
import { BoilerService } from '../boiler.service';
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

function makeBoilerForm(): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    deaeratorPressure: [15, [Validators.required, Validators.min(-14), Validators.max(3200)]],
    combustionEfficiency: [85, [Validators.required, Validators.min(50), Validators.max(100)]],
    blowdownRate: [2, [Validators.required, Validators.min(0), Validators.max(25)]],
    steamPressure: [200, [Validators.required, Validators.min(-14), Validators.max(3200)]],
    thermodynamicQuantity: [0, Validators.required],
    quantityValue: [500, [Validators.required, Validators.min(32), Validators.max(1472)]],
    steamMassFlow: [45, [Validators.required, Validators.min(0)]]
  });
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('BoilerFormComponent', () => {
  let component: BoilerFormComponent;
  let fixture: ComponentFixture<BoilerFormComponent>;
  let form: UntypedFormGroup;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;
  let boilerServiceMock: Partial<BoilerService>;

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
    boilerServiceMock = { modalOpen: new BehaviorSubject<boolean>(false) };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [BoilerFormComponent, SettingsLabelStubPipe],
      providers: [
        { provide: SteamService, useValue: steamServiceSpy },
        { provide: BoilerService, useValue: boilerServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    form = makeBoilerForm();
    fixture = TestBed.createComponent(BoilerFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('boilerForm', form);
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
      component.focusField('blowdownRate');
      component.focusOut();
      expect(emitted).toEqual(['blowdownRate', 'default']);
    });

    it('emits the form through calculate', () => {
      const emitted: Array<UntypedFormGroup> = [];
      component.emitCalculate.subscribe((value: UntypedFormGroup) => emitted.push(value));
      component.calculate();
      expect(emitted).toEqual([form]);
    });

    it('opens the boiler efficiency modal and notifies the service', () => {
      component.openBoilerEfficiencyModal();
      expect(component.showBoilerEfficiencyModal).toBeTrue();
      expect(boilerServiceMock.modalOpen.value).toBeTrue();
    });

    it('closes the boiler efficiency modal and notifies the service', () => {
      component.openBoilerEfficiencyModal();
      component.closeBoilerEfficiencyModal();
      expect(component.showBoilerEfficiencyModal).toBeFalse();
      expect(boilerServiceMock.modalOpen.value).toBeFalse();
    });

    it('sets the efficiency, recalculates and closes the modal', () => {
      const emitted: Array<UntypedFormGroup> = [];
      component.emitCalculate.subscribe((value: UntypedFormGroup) => emitted.push(value));
      component.openBoilerEfficiencyModal();
      component.setBoilerEfficiencyAndClose(77);
      expect(form.controls.combustionEfficiency.value).toBe(77);
      expect(emitted).toEqual([form]);
      expect(component.showBoilerEfficiencyModal).toBeFalse();
      expect(boilerServiceMock.modalOpen.value).toBeFalse();
    });
  });

  describe('validator toggling', () => {
    it('resets the quantity value, applies the new range and recalculates', () => {
      const emitted: Array<UntypedFormGroup> = [];
      component.emitCalculate.subscribe((value: UntypedFormGroup) => emitted.push(value));
      form.controls.thermodynamicQuantity.setValue(1);
      component.setQuantityRanges();
      expect(steamServiceSpy.getQuantityRange).toHaveBeenCalledWith(MOCK_SETTINGS, 1);
      expect(form.controls.quantityValue.value).toBe(0);
      form.controls.quantityValue.setValue(2001);
      expect(form.controls.quantityValue.errors.max).toBeTruthy();
      form.controls.quantityValue.setValue(49);
      expect(form.controls.quantityValue.errors.min).toBeTruthy();
      form.controls.quantityValue.setValue(100);
      expect(form.controls.quantityValue.valid).toBeTrue();
      expect(emitted).toEqual([form]);
    });
  });

  describe('template visibility', () => {
    it('hides the boiler efficiency modal by default', () => {
      expect(fixture.nativeElement.querySelector('app-boiler-efficiency-modal')).toBeNull();
    });

    it('shows the boiler efficiency modal when opened', () => {
      component.openBoilerEfficiencyModal();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-boiler-efficiency-modal')).not.toBeNull();
    });

    it('hides the boiler efficiency modal again when closed', () => {
      component.openBoilerEfficiencyModal();
      fixture.detectChanges();
      component.closeBoilerEfficiencyModal();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-boiler-efficiency-modal')).toBeNull();
    });

    const FIELDS: Array<{ inputId: string, min: number, max?: number, minMessage: string, maxMessage?: string }> = [
      { inputId: 'deaeratorPressure', min: -15, max: 3201, minMessage: "Value can't be less than -14 psig.", maxMessage: "Value can't be greater than 3200 psig." },
      { inputId: 'combustionEfficiency', min: 49, max: 101, minMessage: "Value can't be less than 50 %.", maxMessage: "Value can't be greater than 100 %." },
      { inputId: 'blowdownRate', min: -1, max: 26, minMessage: "Value can't be less than 0 %.", maxMessage: "Value can't be greater than 25 %." },
      { inputId: 'steamPressure', min: -15, max: 3201, minMessage: "Value can't be less than -14 psig.", maxMessage: "Value can't be greater than 3200 psig." },
      { inputId: 'quantityValue', min: 31, max: 1473, minMessage: "Value can't be less than 32 F.", maxMessage: "Value can't be greater than 1472 F." },
      { inputId: 'steamMassFlow', min: -1, minMessage: "Value can't be less than 0 klb." },
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
