import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { FeedwaterFormComponent } from './feedwater-form.component';
import { SteamService } from '../../steam.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { Settings } from '../../../../shared/models/settings';
import { SteamImperialDefaults } from '../../../../settings/settings.service';
import { ThermodynamicQuantityOptions } from '../../../../shared/models/steam/steam-inputs';

const MOCK_SETTINGS = { ...SteamImperialDefaults } as Settings;

function makeFeedwaterForm(feedwaterThermodynamicQuantity: number = 0): UntypedFormGroup {
  return new UntypedFormBuilder().group({
    feedwaterPressure: [100, [Validators.required, Validators.min(0), Validators.max(3000)]],
    feedwaterThermodynamicQuantity: [feedwaterThermodynamicQuantity, Validators.required],
    feedwaterQuantityValue: [400, [Validators.required, Validators.min(32), Validators.max(1472)]],
    desuperheatingTemp: [300, [Validators.required, Validators.min(212), Validators.max(1472)]],
  });
}

const FIELDS: Array<{ field: string, min: number, max: number, unit: string }> = [
  { field: 'feedwaterPressure', min: 0, max: 3000, unit: 'psig' },
  { field: 'desuperheatingTemp', min: 212, max: 1472, unit: '℉' },
];

describe('FeedwaterFormComponent', () => {
  let component: FeedwaterFormComponent;
  let fixture: ComponentFixture<FeedwaterFormComponent>;
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
    return query(`#${field}`).closest('.form-group').querySelector('.alert-danger');
  }

  function messages(block: HTMLElement): string[] {
    return queryAll(':scope > span', block).map(s => normalize(s.textContent));
  }

  function setDirty(field: string, value: any): void {
    component.feedwaterForm.controls[field].setValue(value);
    component.feedwaterForm.controls[field].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(form: UntypedFormGroup = makeFeedwaterForm()): void {
    fixture = TestBed.createComponent(FeedwaterFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('feedwaterForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    steamServiceSpy = jasmine.createSpyObj('SteamService', ['getQuantityRange']);
    steamServiceSpy.getQuantityRange.and.returnValue({ min: 10, max: 20 });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SharedPipesModule],
      declarations: [FeedwaterFormComponent],
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
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('emits the form on calculate', () => {
      const emitted = [];
      component.emitCalculate.subscribe(form => emitted.push(form));
      component.calculate();
      expect(emitted).toEqual([component.feedwaterForm]);
    });

    it('emits the focused field', () => {
      const emitted = [];
      component.emitChangeField.subscribe(field => emitted.push(field));
      component.focusField('desuperheatingTemp');
      component.focusOut();
      expect(emitted).toEqual(['desuperheatingTemp', 'default']);
    });

    it('resets the quantity value with the new range validators and emits on quantity change', () => {
      const emitted = [];
      component.emitCalculate.subscribe(form => emitted.push(form));
      component.feedwaterForm.controls.feedwaterThermodynamicQuantity.setValue(2);
      component.setQuantityRanges();
      expect(steamServiceSpy.getQuantityRange).toHaveBeenCalledWith(MOCK_SETTINGS, 2);
      expect(component.feedwaterForm.controls.feedwaterQuantityValue.value).toBe(0);
      component.feedwaterForm.controls.feedwaterQuantityValue.setValue(25);
      expect(component.feedwaterForm.controls.feedwaterQuantityValue.errors.max).toBeTruthy();
      expect(emitted.length).toBe(1);
    });
  });

  describe('thermodynamic quantity', () => {
    it('renders one option per thermodynamic quantity', () => {
      createComponent();
      expect(queryAll('#feedwaterThermodynamicQuantity option').map(o => o.textContent.trim()))
        .toEqual(ThermodynamicQuantityOptions.map(o => o.display));
    });

    ThermodynamicQuantityOptions.forEach(option => {
      it(`labels the quantity value with ${option.display}`, () => {
        createComponent(makeFeedwaterForm(option.value));
        expect(query('label[for="feedwaterQuantityValue"]').textContent.trim()).toBe(`${option.display} Value`);
      });
    });

    [0, 1, 2].forEach(quantity => {
      it(`shows the unit addon for quantity ${quantity}`, () => {
        createComponent(makeFeedwaterForm(quantity));
        expect(query('#feedwaterQuantityValue + .input-group-addon')).not.toBeNull();
      });
    });

    it('hides the unit addon for quality', () => {
      createComponent(makeFeedwaterForm(3));
      expect(query('#feedwaterQuantityValue + .input-group-addon')).toBeNull();
    });
  });

  FIELDS.forEach(({ field, min, max, unit }) => {
    describe(`${field} validation messages`, () => {
      beforeEach(() => createComponent());

      it('hides the error block while pristine', () => {
        component.feedwaterForm.controls[field].setValue(null);
        fixture.detectChanges();
        expect(errorBlock(field)).toBeNull();
      });

      it('hides the error block for a valid dirty value', () => {
        setDirty(field, min + 1);
        expect(errorBlock(field)).toBeNull();
      });

      it('shows only the required message', () => {
        setDirty(field, null);
        expect(messages(errorBlock(field))).toEqual(['Value Required']);
      });

      it('shows only the max message', () => {
        setDirty(field, max + 1);
        expect(messages(errorBlock(field))).toEqual([`Value can't be greater than ${max} ${unit}.`]);
      });

      it('shows only the min message', () => {
        setDirty(field, min - 1);
        expect(messages(errorBlock(field))).toEqual([`Value can't be less than ${min} ${unit}.`]);
      });
    });
  });

  describe('feedwaterQuantityValue validation messages', () => {
    const field = 'feedwaterQuantityValue';

    it('hides the error block while pristine', () => {
      createComponent();
      component.feedwaterForm.controls[field].setValue(null);
      fixture.detectChanges();
      expect(errorBlock(field)).toBeNull();
    });

    it('hides the error block for a valid dirty value', () => {
      createComponent();
      setDirty(field, 100);
      expect(errorBlock(field)).toBeNull();
    });

    it('shows only the required message', () => {
      createComponent();
      setDirty(field, null);
      expect(messages(errorBlock(field))).toEqual(['Value Required']);
    });

    it('shows the max message with the unit for temperature', () => {
      createComponent();
      setDirty(field, 2000);
      expect(messages(errorBlock(field))).toEqual(['Value can\'t be greater than 1472 ℉.']);
    });

    it('shows the min message with the unit for temperature', () => {
      createComponent();
      setDirty(field, 0);
      expect(messages(errorBlock(field))).toEqual(['Value can\'t be less than 32 ℉.']);
    });

    it('shows the max message without a unit for quality', () => {
      createComponent(makeFeedwaterForm(3));
      setDirty(field, 2000);
      expect(messages(errorBlock(field))).toEqual(['Value can\'t be greater than 1472.']);
      expect(queryAll(':scope > span > span', errorBlock(field)).length).toBe(0);
    });

    it('shows the min message without a unit for quality', () => {
      createComponent(makeFeedwaterForm(3));
      setDirty(field, 0);
      expect(messages(errorBlock(field))).toEqual(['Value can\'t be less than 32.']);
      expect(queryAll(':scope > span > span', errorBlock(field)).length).toBe(0);
    });
  });
});
