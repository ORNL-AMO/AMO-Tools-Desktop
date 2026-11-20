import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormGroup, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { HeaderFormComponent } from './header-form.component';
import { SteamService } from '../../steam.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../settings/settings.service';
import { ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;

function makeInletForm(thermodynamicQuantity: number = 0): FormGroup {
  return new UntypedFormBuilder().group({
    pressure: [100, [Validators.required, Validators.min(0), Validators.max(3000)]],
    thermodynamicQuantity: [thermodynamicQuantity, [Validators.required]],
    quantityValue: [400, [Validators.required, Validators.min(32), Validators.max(1472)]],
    massFlow: [10, [Validators.required, Validators.min(0), Validators.max(5000)]]
  });
}

const FIELDS: Array<{ field: string, min: number, max: number, unit: string }> = [
  { field: 'pressure', min: 0, max: 3000, unit: 'psig' },
  { field: 'massFlow', min: 0, max: 5000, unit: 'klb/hr' },
];

describe('HeaderFormComponent', () => {
  let component: HeaderFormComponent;
  let fixture: ComponentFixture<HeaderFormComponent>;
  let steamServiceSpy: jasmine.SpyObj<SteamService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string, root: HTMLElement = fixture.nativeElement): HTMLElement[] {
    return Array.from(root.querySelectorAll(selector));
  }

  function normalize(text: string): string {
    return text.trim().replace(/\s+/g, ' ').replace(/ \./g, '.');
  }

  function errorBlock(field: string): HTMLElement | null {
    const input = query(`#${field}`);
    const group = input.closest('.form-group') as HTMLElement;
    return group.querySelector('.alert-danger');
  }

  function setDirty(field: string, value: any): void {
    component.inletForm.controls[field].setValue(value);
    component.inletForm.controls[field].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(form: FormGroup = makeInletForm()): void {
    fixture = TestBed.createComponent(HeaderFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('inletForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('index', 2);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 10, max: 20 });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedPipesModule],
      declarations: [HeaderFormComponent],
      providers: [
        ConvertUnitsService,
        { provide: SteamService, useValue: steamServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('loads the thermodynamic quantity options', () => {
      createComponent();
      expect(component.thermoOptions).toBe(ThermodynamicQuantityOptions);
    });

    it('renders the inlet label with the index', () => {
      createComponent();
      expect(query('.group-label').textContent.trim()).toBe('Inlet 2');
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('emits the form on calculate', () => {
      const emitted = [];
      component.emitCalculate.subscribe(form => emitted.push(form));
      component.calculate();
      expect(emitted).toEqual([component.inletForm]);
    });

    it('emits the focused field', () => {
      const emitted = [];
      component.emitChangeField.subscribe(field => emitted.push(field));
      component.focusField('pressure');
      component.focusOut();
      expect(emitted).toEqual(['pressure', 'default']);
    });

    it('resets quantityValue with the new range validators and emits on quantity change', () => {
      const emitted = [];
      component.emitCalculate.subscribe(form => emitted.push(form));
      component.inletForm.controls.thermodynamicQuantity.setValue(1);
      component.setQuantityRanges();
      expect(steamServiceSpy.getQuantityRange).toHaveBeenCalledWith(MOCK_SETTINGS, 1);
      expect(component.inletForm.controls.quantityValue.value).toBe(0);
      component.inletForm.controls.quantityValue.setValue(25);
      expect(component.inletForm.controls.quantityValue.errors.max).toBeTruthy();
      component.inletForm.controls.quantityValue.setValue(15);
      expect(component.inletForm.controls.quantityValue.valid).toBeTrue();
      expect(emitted.length).toBe(1);
    });
  });

  describe('thermodynamic quantity options', () => {
    it('renders one option per thermodynamic quantity', () => {
      createComponent();
      expect(queryAll('#thermodynamicQuantity option').map(o => o.textContent.trim()))
        .toEqual(ThermodynamicQuantityOptions.map(o => o.display));
    });
  });

  describe('quantity unit', () => {
    [
      { quantity: 0, unit: '℉' },
      { quantity: 1, unit: 'btu/lb' },
      { quantity: 2, unit: 'btu/lb-℉' },
    ].forEach(({ quantity, unit }) => {
      it(`shows the unit addon for quantity ${quantity}`, () => {
        createComponent(makeInletForm(quantity));
        const addon = query('#quantityValue + .input-group-addon');
        expect(addon).not.toBeNull();
        expect(addon.textContent.trim().toLowerCase()).toBe(unit.toLowerCase());
      });
    });

    it('hides the unit addon for quality', () => {
      createComponent(makeInletForm(3));
      expect(query('#quantityValue + .input-group-addon')).toBeNull();
    });
  });

  FIELDS.forEach(({ field, min, max, unit }) => {
    describe(`${field} validation messages`, () => {
      beforeEach(() => createComponent());

      it('hides the error block while pristine', () => {
        component.inletForm.controls[field].setValue(null);
        fixture.detectChanges();
        expect(errorBlock(field)).toBeNull();
      });

      it('hides the error block for a valid dirty value', () => {
        setDirty(field, 1);
        expect(errorBlock(field)).toBeNull();
      });

      it('shows only the required message', () => {
        setDirty(field, null);
        expect(queryAll(':scope > span', errorBlock(field)).map(s => normalize(s.textContent))).toEqual(['Value Required']);
      });

      it('shows only the max message', () => {
        setDirty(field, max + 1);
        expect(queryAll(':scope > span', errorBlock(field)).map(s => normalize(s.textContent)))
          .toEqual([`Value can't be greater than ${max} ${unit}.`]);
      });

      it('shows only the min message', () => {
        setDirty(field, min - 1);
        expect(queryAll(':scope > span', errorBlock(field)).map(s => normalize(s.textContent)))
          .toEqual([`Value can't be less than ${min} ${unit}.`]);
      });
    });
  });

  describe('quantityValue validation messages', () => {
    function messages(): string[] {
      return queryAll('.input-group .alert-danger > span').map(s => normalize(s.textContent));
    }

    it('hides the error block while pristine', () => {
      createComponent();
      expect(query('.input-group .alert-danger')).toBeNull();
    });

    it('hides the error block for a valid dirty value', () => {
      createComponent();
      setDirty('quantityValue', 100);
      expect(query('.input-group .alert-danger')).toBeNull();
    });

    it('shows only the required message', () => {
      createComponent();
      setDirty('quantityValue', null);
      expect(messages()).toEqual(['Value Required']);
    });

    it('shows the max message with the unit for temperature', () => {
      createComponent();
      setDirty('quantityValue', 2000);
      expect(messages()).toEqual(['Value can\'t be greater than 1472 ℉.']);
    });

    it('shows the min message with the unit for temperature', () => {
      createComponent();
      setDirty('quantityValue', 0);
      expect(messages()).toEqual(['Value can\'t be less than 32 ℉.']);
    });

    it('shows the max message without a unit for quality', () => {
      createComponent(makeInletForm(3));
      setDirty('quantityValue', 2000);
      expect(messages()).toEqual(['Value can\'t be greater than 1472.']);
      expect(queryAll('.input-group .alert-danger > span > span').length).toBe(0);
    });

    it('shows the min message without a unit for quality', () => {
      createComponent(makeInletForm(3));
      setDirty('quantityValue', 0);
      expect(messages()).toEqual(['Value can\'t be less than 32.']);
      expect(queryAll('.input-group .alert-danger > span > span').length).toBe(0);
    });
  });
});
