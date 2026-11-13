import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Directive, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LightingReplacementFormComponent } from './lighting-replacement-form.component';
import { LightingReplacementService } from '../lighting-replacement.service';
import { LightingReplacementData } from '../../../../shared/models/lighting';
import { LightingFixtureCategory, LightingFixtureData } from '../../../../tools-suite-api/lighting-suite-api.service';
import { LightingFixtureMaterial } from '../../../../shared/models/materials';

// Stands in for ngx-bootstrap's ModalDirective so the template's `#materialModal="bs-modal"` export resolves
// without pulling in the real modal loader.
@Directive({
  selector: '[bsModal]',
  exportAs: 'bs-modal',
  standalone: false,
})
class BsModalStubDirective {
  show = jasmine.createSpy('show');
  hide = jasmine.createSpy('hide');
}

const METAL_HALIDE_350: LightingFixtureData = {
  category: 'Metal Halide',
  type: '350-W Metal Halide',
  lampsPerFixture: 1,
  wattsPerLamp: 400,
  lumensPerLamp: 36000,
  lampLife: 20000,
  coefficientOfUtilization: 0.7,
  ballastFactor: 1,
  lumenDegradationFactor: 0.8,
};

const METAL_HALIDE_400: LightingFixtureData = {
  ...METAL_HALIDE_350,
  type: '400-W Metal Halide',
  wattsPerLamp: 458,
};

const CUSTOM_FIXTURE: LightingFixtureData = {
  ...METAL_HALIDE_350,
  category: 'Custom',
  type: 'My Custom Fixture',
  wattsPerLamp: 75,
};

function makeCategories(): Array<LightingFixtureCategory> {
  return [
    { category: 0, label: 'Custom', fixturesData: [CUSTOM_FIXTURE] },
    { category: 1, label: 'Metal Halide', fixturesData: [METAL_HALIDE_350, METAL_HALIDE_400] },
    { category: 2, label: 'Empty Category', fixturesData: [] },
  ];
}

function makeLightingData(overrides: Partial<LightingReplacementData> = {}): LightingReplacementData {
  return {
    name: 'Fixture #1',
    hoursPerYear: 8760,
    wattsPerLamp: METAL_HALIDE_350.wattsPerLamp,
    lampsPerFixture: METAL_HALIDE_350.lampsPerFixture,
    numberOfFixtures: 10,
    lumensPerLamp: METAL_HALIDE_350.lumensPerLamp,
    totalLighting: 0,
    electricityUse: 0,
    lampLife: METAL_HALIDE_350.lampLife,
    ballastFactor: METAL_HALIDE_350.ballastFactor,
    lumenDegradationFactor: METAL_HALIDE_350.lumenDegradationFactor,
    coefficientOfUtilization: METAL_HALIDE_350.coefficientOfUtilization,
    category: 1,
    type: METAL_HALIDE_350.type,
    ...overrides,
  };
}

// Mirrors LightingReplacementService.getFormFromObj so the validation-message branches render the same errors.
function makeLightingForm(data: LightingReplacementData): UntypedFormGroup {
  return new UntypedFormGroup({
    name: new UntypedFormControl(data.name, Validators.required),
    hoursPerYear: new UntypedFormControl(data.hoursPerYear, [Validators.required, Validators.min(0), Validators.max(8760)]),
    wattsPerLamp: new UntypedFormControl(data.wattsPerLamp, [Validators.required, Validators.min(0)]),
    lampsPerFixture: new UntypedFormControl(data.lampsPerFixture, [Validators.required, Validators.min(0)]),
    numberOfFixtures: new UntypedFormControl(data.numberOfFixtures, [Validators.required, Validators.min(0)]),
    lumensPerLamp: new UntypedFormControl(data.lumensPerLamp, [Validators.required, Validators.min(0)]),
    lampLife: new UntypedFormControl(data.lampLife),
    ballastFactor: new UntypedFormControl(data.ballastFactor, [Validators.required, Validators.min(.5), Validators.max(1.5)]),
    lumenDegradationFactor: new UntypedFormControl(data.lumenDegradationFactor, [Validators.required, Validators.min(.5), Validators.max(1)]),
    coefficientOfUtilization: new UntypedFormControl(data.coefficientOfUtilization, [Validators.required, Validators.min(.1), Validators.max(1)]),
    category: new UntypedFormControl(data.category),
    type: new UntypedFormControl(data.type),
  });
}

type ErrorCase = [controlName: string, value: number | null, expectedMessage: string];

const ALWAYS_VISIBLE_ERROR_CASES: Array<ErrorCase> = [
  ['hoursPerYear', null, 'Value required.'],
  ['hoursPerYear', 9000, "Value can't be greater than 8760."],
  ['hoursPerYear', -1, "Value can't be less than 0."],
  ['wattsPerLamp', null, 'Value required.'],
  ['wattsPerLamp', -1, "Value can't be less than 0."],
  ['ballastFactor', null, 'Value required.'],
  ['ballastFactor', 0.1, "Value can't be less than 0.5."],
  ['ballastFactor', 2, "Value can't be greater than 1.5."],
  ['lampsPerFixture', null, 'Value required.'],
  ['lampsPerFixture', -1, "Value can't be less than 0."],
  ['numberOfFixtures', null, 'Value required.'],
  ['numberOfFixtures', -1, "Value can't be less than 0."],
];

const DETAIL_ERROR_CASES: Array<ErrorCase> = [
  ['lumensPerLamp', null, 'Value required.'],
  ['lumensPerLamp', -1, "Value can't be less than 0."],
  ['coefficientOfUtilization', null, 'Value required.'],
  ['coefficientOfUtilization', 0.05, "Value can't be less than 0.1."],
  ['coefficientOfUtilization', 2, "Value can't be greater than 1."],
  ['lumenDegradationFactor', null, 'Value required.'],
  ['lumenDegradationFactor', 0.1, "Value can't be less than 0.5."],
  ['lumenDegradationFactor', 2, "Value can't be greater than 1."],
];

const DETAIL_CONTROLS = ['lumensPerLamp', 'coefficientOfUtilization', 'lumenDegradationFactor'];

describe('LightingReplacementFormComponent', () => {
  let component: LightingReplacementFormComponent;
  let fixture: ComponentFixture<LightingReplacementFormComponent>;
  let serviceSpy: jasmine.SpyObj<LightingReplacementService>;
  let categories$: BehaviorSubject<Array<LightingFixtureCategory>>;
  let selectedFixtureTypes: BehaviorSubject<Array<LightingFixtureData>>;
  let mockData: LightingReplacementData;
  let mockForm: UntypedFormGroup;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): Array<HTMLElement> {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  function errorTextFor(controlName: string): string | null {
    const input = query(`[formControlName="${controlName}"]`);
    const alert = input.closest('.form-group').querySelector('.alert-danger');
    return alert ? normalize(alert.textContent) : null;
  }

  function makeDirtyWithValue(controlName: string, value: number | string | null): void {
    mockForm.controls[controlName].setValue(value);
    mockForm.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  async function createComponent(options: { data?: LightingReplacementData, selected?: boolean, isBaseline?: boolean, showAdditionalDetails?: boolean } = {}) {
    mockData = options.data ?? makeLightingData();
    mockForm = makeLightingForm(mockData);
    serviceSpy.getFormFromObj.and.returnValue(mockForm);
    serviceSpy.showAdditionalDetails = options.showAdditionalDetails ?? false;

    fixture = TestBed.createComponent(LightingReplacementFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', mockData);
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('isBaseline', options.isBaseline ?? true);
    fixture.componentRef.setInput('selected', options.selected ?? true);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    categories$ = new BehaviorSubject<Array<LightingFixtureCategory>>(makeCategories());
    selectedFixtureTypes = new BehaviorSubject<Array<LightingFixtureData>>(undefined);

    serviceSpy = jasmine.createSpyObj('LightingReplacementService', [
      'getFormFromObj',
      'loadLightingFixtureCategories',
      'getObjFromForm',
    ]);
    serviceSpy.lightingFixtureCategories$ = categories$;
    serviceSpy.selectedFixtureTypes = selectedFixtureTypes;
    serviceSpy.operatingHours = undefined;
    serviceSpy.getObjFromForm.and.callFake((form: UntypedFormGroup) => ({ ...form.getRawValue(), totalLighting: 0, electricityUse: 0 }));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [LightingReplacementFormComponent, BsModalStubDirective],
      providers: [
        { provide: LightingReplacementService, useValue: serviceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('creates the component', () => {
      expect(component).toBeTruthy();
    });

    it('builds the form from the data input via the service', () => {
      expect(serviceSpy.getFormFromObj).toHaveBeenCalledWith(mockData);
      expect(component.form).toBe(mockForm);
    });

    it('loads the fixture categories and assigns fixture types for the form category', () => {
      expect(serviceSpy.loadLightingFixtureCategories).toHaveBeenCalled();
      expect(component.lightingFixtureCategories).toEqual(makeCategories());
      expect(component.fixtureTypes).toEqual([METAL_HALIDE_350, METAL_HALIDE_400]);
    });

    it('publishes the selected category fixture types to the service', () => {
      expect(selectedFixtureTypes.value).toEqual([METAL_HALIDE_350, METAL_HALIDE_400]);
    });

    it('builds a baseline idString from the index', () => {
      expect(component.idString).toBe('baseline_0');
    });

    it('reads displayDetails from the service', () => {
      expect(component.displayDetails).toBeFalse();
    });

    it('leaves the form enabled when selected', () => {
      expect(mockForm.enabled).toBeTrue();
    });
  });

  describe('initialization variants', () => {
    it('builds a modification idString when not baseline', async () => {
      await createComponent({ isBaseline: false });
      expect(component.idString).toBe('modification_0');
    });

    it('disables the form when not selected', async () => {
      await createComponent({ selected: false });
      expect(mockForm.disabled).toBeTrue();
    });

    it('sets displayDetails from showAdditionalDetails on the service', async () => {
      await createComponent({ showAdditionalDetails: true });
      expect(component.displayDetails).toBeTrue();
    });

    it('does not assign categories while the service has not loaded them', async () => {
      categories$.next(undefined);
      await createComponent();
      expect(component.lightingFixtureCategories).toBeUndefined();
      expect(component.fixtureTypes).toBeUndefined();
    });
  });

  describe('selected input changes', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('disables the form when selected changes to false', () => {
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      expect(mockForm.disabled).toBeTrue();
    });

    it('re-enables the form when selected changes back to true', () => {
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(mockForm.enabled).toBeTrue();
    });
  });

  describe('fixture difference indicators', () => {
    it('does not flag a difference when the form matches the selected fixture type', async () => {
      await createComponent();
      expect(component.indicateFixtureTypeDiff).toBeFalse();
    });

    it('flags a difference when a field differs from the selected fixture type', async () => {
      await createComponent({ data: makeLightingData({ wattsPerLamp: 999 }) });
      expect(component.indicateWattsPerLampDiff).toBeTrue();
      expect(component.indicateFixtureTypeDiff).toBeTrue();
    });

    it('does not flag a difference for the custom category', async () => {
      await createComponent({ data: makeLightingData({ category: 0, type: CUSTOM_FIXTURE.type, wattsPerLamp: 999 }) });
      expect(component.indicateFixtureTypeDiff).toBeFalse();
    });
  });

  describe('user actions', () => {
    beforeEach(async () => {
      await createComponent();
    });

    it('calculate emits the object built from the form', () => {
      const emitSpy = spyOn(component.emitCalculate, 'emit');
      mockForm.controls.numberOfFixtures.setValue(20);
      component.calculate();
      expect(serviceSpy.getObjFromForm).toHaveBeenCalledWith(mockForm);
      expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ numberOfFixtures: 20 }));
    });

    it('removeFixture emits the fixture index', () => {
      const emitSpy = spyOn(component.emitRemoveFixture, 'emit');
      component.removeFixture();
      expect(emitSpy).toHaveBeenCalledWith(0);
    });

    it('focusField publishes fixture types and emits the field name', () => {
      const emitSpy = spyOn(component.emitFocusField, 'emit');
      selectedFixtureTypes.next(undefined);
      component.focusField('wattsPerLamp');
      expect(selectedFixtureTypes.value).toEqual([METAL_HALIDE_350, METAL_HALIDE_400]);
      expect(emitSpy).toHaveBeenCalledWith('wattsPerLamp');
    });

    it('editFixtureName and doneEditingName toggle isEditingName', () => {
      component.editFixtureName();
      expect(component.isEditingName).toBeTrue();
      component.doneEditingName();
      expect(component.isEditingName).toBeFalse();
    });

    it('openOperatingHoursModal and closeOperatingHoursModal toggle the modal flag', () => {
      component.openOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeTrue();
      component.closeOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeFalse();
    });

    it('updateOperatingHours stores the hours, patches the form, emits, and closes the modal', () => {
      const emitSpy = spyOn(component.emitCalculate, 'emit');
      const opHours = { hoursPerYear: 4000 } as any;
      component.openOperatingHoursModal();
      component.updateOperatingHours(opHours);
      expect(serviceSpy.operatingHours).toBe(opHours);
      expect(mockForm.controls.hoursPerYear.value).toBe(4000);
      expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ hoursPerYear: 4000 }));
      expect(component.showOperatingHoursModal).toBeFalse();
    });

    it('setCategory switches fixture types and clears fixture properties', () => {
      const emitSpy = spyOn(component.emitCalculate, 'emit');
      mockForm.controls.category.setValue(2);
      component.setCategory();
      expect(component.fixtureTypes).toEqual([]);
      expect(selectedFixtureTypes.value).toEqual([]);
      expect(mockForm.controls.type.value).toBe('');
      expect(mockForm.controls.wattsPerLamp.value).toBeUndefined();
      expect(mockForm.controls.lumensPerLamp.value).toBe(1);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('setProperties copies the selected fixture type values into the form', () => {
      mockForm.controls.type.setValue(METAL_HALIDE_400.type);
      component.setProperties();
      expect(mockForm.controls.wattsPerLamp.value).toBe(METAL_HALIDE_400.wattsPerLamp);
    });

    it('setProperties leaves the form unchanged when the type is not found', () => {
      mockForm.controls.type.setValue('Unknown type');
      component.setProperties();
      expect(mockForm.controls.wattsPerLamp.value).toBe(METAL_HALIDE_350.wattsPerLamp);
    });

    it('showDetails and hideDetails toggle displayDetails', () => {
      component.showDetails();
      expect(component.displayDetails).toBeTrue();
      component.hideDetails();
      expect(component.displayDetails).toBeFalse();
    });

    it('showMaterialModal opens the material modal', () => {
      component.showMaterialModal(true);
      expect(component.editExistingMaterial).toBeTrue();
      expect(component.showModal).toBeTrue();
      expect((component.materialModal as any).show).toHaveBeenCalled();
    });

    it('hideMaterialModal with a result selects the custom fixture and applies its properties', () => {
      const material = { name: 'My Custom Fixture', type: '' } as LightingFixtureMaterial;
      component.showMaterialModal(false);
      component.hideMaterialModal(material);
      expect(mockForm.controls.category.value).toBe(0);
      expect(mockForm.controls.type.value).toBe(CUSTOM_FIXTURE.type);
      expect(mockForm.controls.wattsPerLamp.value).toBe(CUSTOM_FIXTURE.wattsPerLamp);
      expect(component.showModal).toBeFalse();
      expect((component.materialModal as any).hide).toHaveBeenCalled();
    });

    it('hideMaterialModal without a result only closes the modal', () => {
      component.showMaterialModal(false);
      component.hideMaterialModal();
      expect(mockForm.controls.category.value).toBe(1);
      expect(component.showModal).toBeFalse();
    });
  });

  describe('template visibility', () => {
    describe('fixture name', () => {
      beforeEach(async () => {
        await createComponent();
      });

      it('shows the read-only name label when not editing', () => {
        expect(query('label.group-label.bold')).not.toBeNull();
        expect(query('label.group-label.bold').textContent).toContain('Fixture #1');
        expect(query('#equipmentName')).toBeNull();
      });

      it('shows the name input when editing', () => {
        component.editFixtureName();
        fixture.detectChanges();
        expect(query('#equipmentName')).not.toBeNull();
        expect(query('label.group-label.bold')).toBeNull();
      });

      it('hides the name error while the invalid name is pristine', () => {
        component.editFixtureName();
        mockForm.controls.name.setValue('');
        fixture.detectChanges();
        expect(query('#equipmentName').closest('label').querySelector('.alert-danger')).toBeNull();
      });

      it('shows the required name error when the name is cleared', () => {
        component.editFixtureName();
        makeDirtyWithValue('name', '');
        const alert = query('#equipmentName').closest('label').querySelector('.alert-danger');
        expect(normalize(alert.textContent)).toBe('Please enter a name.');
      });
    });

    describe('fixture category and type', () => {
      beforeEach(async () => {
        await createComponent();
      });

      it('renders one category option per fixture category', () => {
        const options = queryAll('[formControlName="category"] option');
        expect(options.map(option => normalize(option.textContent))).toEqual(['Custom', 'Metal Halide', 'Empty Category']);
      });

      it('renders no category options before categories are loaded', async () => {
        categories$.next(undefined);
        await createComponent();
        expect(queryAll('[formControlName="category"] option').length).toBe(0);
      });

      it('shows the fixture type select with one option per type when the category has types', () => {
        const options = queryAll('[formControlName="type"] option');
        expect(options.map(option => normalize(option.textContent))).toEqual([METAL_HALIDE_350.type, METAL_HALIDE_400.type]);
      });

      it('hides the fixture type select when the category has no types', () => {
        mockForm.controls.category.setValue(2);
        component.setCategory();
        fixture.detectChanges();
        expect(query('[formControlName="type"]')).toBeNull();
      });

      it('hides the fixture type select when fixture types are not set', () => {
        component.fixtureTypes = undefined;
        fixture.detectChanges();
        expect(query('[formControlName="type"]')).toBeNull();
      });
    });

    describe('lamp life', () => {
      it('shows lamp life when the category has types and lamp life has a value', async () => {
        await createComponent();
        const lampLife = query('.form-group.help-text');
        expect(lampLife).not.toBeNull();
        expect(normalize(lampLife.textContent)).toContain('20,000 hrs');
      });

      it('hides lamp life when the category has types but lamp life is empty', async () => {
        await createComponent({ data: makeLightingData({ lampLife: 0 }) });
        expect(component.fixtureTypes.length).toBeGreaterThan(0);
        expect(query('.form-group.help-text')).toBeNull();
      });

      it('hides lamp life when the category has no types even if lamp life has a value', async () => {
        await createComponent({ data: makeLightingData({ category: 2 }) });
        expect(mockForm.controls.lampLife.value).toBe(20000);
        expect(query('.form-group.help-text')).toBeNull();
      });
    });

    describe('validation messages for always-visible fields', () => {
      beforeEach(async () => {
        await createComponent();
      });

      it('shows no error messages while the form is valid', () => {
        expect(queryAll('.alert-danger').length).toBe(0);
      });

      it('hides error messages while an invalid field is still pristine', () => {
        ALWAYS_VISIBLE_ERROR_CASES.forEach(([controlName, value]) => mockForm.controls[controlName].setValue(value));
        fixture.detectChanges();
        expect(queryAll('.alert-danger').length).toBe(0);
      });

      ALWAYS_VISIBLE_ERROR_CASES.forEach(([controlName, value, expectedMessage]) => {
        it(`shows only "${expectedMessage}" for ${controlName} = ${value}`, () => {
          makeDirtyWithValue(controlName, value);
          expect(errorTextFor(controlName)).toBe(expectedMessage);
        });
      });
    });

    describe('lighting level details', () => {
      it('shows the "Show" link and hides detail fields when details are collapsed', async () => {
        await createComponent();
        const links = queryAll('a.click-link.small').map(link => normalize(link.textContent));
        expect(links).toContain('Show Lighting Level Details +');
        expect(links).not.toContain('Hide Lighting Level Details -');
        DETAIL_CONTROLS.forEach(controlName => expect(query(`[formControlName="${controlName}"]`)).toBeNull());
      });

      it('shows the "Hide" link and detail fields when details are expanded', async () => {
        await createComponent();
        component.showDetails();
        fixture.detectChanges();
        const links = queryAll('a.click-link.small').map(link => normalize(link.textContent));
        expect(links).toContain('Hide Lighting Level Details -');
        expect(links).not.toContain('Show Lighting Level Details +');
        DETAIL_CONTROLS.forEach(controlName => expect(query(`[formControlName="${controlName}"]`)).not.toBeNull());
      });

      it('collapses detail fields again after hideDetails', async () => {
        await createComponent({ showAdditionalDetails: true });
        component.hideDetails();
        fixture.detectChanges();
        DETAIL_CONTROLS.forEach(controlName => expect(query(`[formControlName="${controlName}"]`)).toBeNull());
      });

      describe('validation messages for detail fields', () => {
        beforeEach(async () => {
          await createComponent({ showAdditionalDetails: true });
        });

        it('hides detail error messages while invalid detail fields are pristine', () => {
          DETAIL_ERROR_CASES.forEach(([controlName, value]) => mockForm.controls[controlName].setValue(value));
          fixture.detectChanges();
          expect(queryAll('.alert-danger').length).toBe(0);
        });

        DETAIL_ERROR_CASES.forEach(([controlName, value, expectedMessage]) => {
          it(`shows only "${expectedMessage}" for ${controlName} = ${value}`, () => {
            makeDirtyWithValue(controlName, value);
            expect(errorTextFor(controlName)).toBe(expectedMessage);
          });
        });
      });
    });

    describe('modals', () => {
      beforeEach(async () => {
        await createComponent();
      });

      it('hides the custom fixture material form until the material modal is shown', () => {
        expect(query('app-lighting-fixtures-material')).toBeNull();
      });

      it('shows the custom fixture material form when the material modal is shown', () => {
        component.showMaterialModal(false);
        fixture.detectChanges();
        expect(query('app-lighting-fixtures-material')).not.toBeNull();
      });

      it('hides the operating hours modal by default', () => {
        expect(query('app-operating-hours-modal')).toBeNull();
      });

      it('shows the operating hours modal when opened', () => {
        component.openOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).not.toBeNull();
      });

      it('hides the operating hours modal again when closed', () => {
        component.openOperatingHoursModal();
        fixture.detectChanges();
        component.closeOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).toBeNull();
      });
    });
  });

  describe('destroy', () => {
    it('stops reacting to fixture category updates after the component is destroyed', async () => {
      await createComponent();
      fixture.destroy();
      categories$.next([{ category: 1, label: 'Metal Halide', fixturesData: [] }]);
      expect(component.fixtureTypes).toEqual([METAL_HALIDE_350, METAL_HALIDE_400]);
    });
  });
});
