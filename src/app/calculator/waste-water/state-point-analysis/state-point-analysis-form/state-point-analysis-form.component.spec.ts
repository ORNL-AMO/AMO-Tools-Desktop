import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { StatePointAnalysisFormComponent } from './state-point-analysis-form.component';
import { StatePointAnalysisService } from '../state-point-analysis.service';
import { StatePointAnalysisFormService } from '../state-point-analysis-form.service';
import { StatePointAnalysisInput } from '../../../../shared/models/waste-water';
import { Settings } from '../../../../shared/models/settings';

const SVI_PARAMETERS: Array<{ value: number, display: string }> = [
  { value: 0, display: 'SVISN' },
  { value: 1, display: 'SVIGN' },
  { value: 2, display: 'SVIGS' },
  { value: 3, display: 'SVISS' },
  { value: 4, display: 'VoK' },
];

function makeInput(overrides: Partial<StatePointAnalysisInput> = {}): StatePointAnalysisInput {
  return {
    sviParameter: 1,
    sviValue: 150,
    numberOfClarifiers: 2,
    areaOfClarifier: 900,
    diameter: 30,
    isUserDefinedArea: true,
    MLSS: 2.5,
    influentFlow: 1,
    rasFlow: 0.7,
    sludgeSettlingVelocity: 375,
    ...overrides,
  };
}

function makeServiceMock(baseline: StatePointAnalysisInput, modification?: StatePointAnalysisInput) {
  return {
    baselineData: new BehaviorSubject<StatePointAnalysisInput>(baseline),
    modificationData: new BehaviorSubject<StatePointAnalysisInput>(modification),
    resetData: new BehaviorSubject<boolean>(undefined),
    generateExample: new BehaviorSubject<boolean>(undefined),
    currentField: new BehaviorSubject<string>('default'),
    sviParameters: SVI_PARAMETERS,
    calculateArea: jasmine.createSpy('calculateArea').and.returnValue(706.86),
  };
}

// Controls that share the "Value Required" / "Value can't be negative" error pattern.
// sludgeSettlingVelocity only renders for the VoK parameter (4).
const STANDARD_ERROR_FIELDS: Array<{ control: string, inputOverrides?: Partial<StatePointAnalysisInput> }> = [
  { control: 'sviValue' },
  { control: 'sludgeSettlingVelocity', inputOverrides: { sviParameter: 4 } },
  { control: 'numberOfClarifiers' },
  { control: 'areaOfClarifier' },
  { control: 'MLSS' },
  { control: 'influentFlow' },
  { control: 'rasFlow' },
];

// Controls the modification form keeps in sync with (and locks to) the baseline.
const BASELINE_LOCKED_CONTROLS = ['sviParameter', 'sviValue', 'sludgeSettlingVelocity', 'numberOfClarifiers',
  'areaOfClarifier', 'diameter', 'isUserDefinedArea', 'MLSS'];

describe('StatePointAnalysisFormComponent', () => {
  let component: StatePointAnalysisFormComponent;
  let fixture: ComponentFixture<StatePointAnalysisFormComponent>;
  let serviceMock: ReturnType<typeof makeServiceMock>;

  function setup(options: { isBaseline?: boolean, selected?: boolean, unitsOfMeasure?: string,
    baseline?: StatePointAnalysisInput, modification?: StatePointAnalysisInput } = {}): void {
    serviceMock = makeServiceMock(options.baseline ?? makeInput(), options.modification);
    fixture = TestBed.createComponent(StatePointAnalysisFormComponent);
    component = fixture.componentInstance;
    const settings: Settings = { unitsOfMeasure: options.unitsOfMeasure ?? 'Imperial' };
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('isBaseline', options.isBaseline ?? true);
    fixture.componentRef.setInput('selected', options.selected ?? true);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  function formGroupFor(control: string): HTMLElement {
    return query(`[formControlName="${control}"]`).closest('.form-group') as HTMLElement;
  }

  function errorTexts(control: string): Array<string> {
    return Array.from(formGroupFor(control).querySelectorAll('.alert-danger'))
      .map((el: HTMLElement) => normalize(el.textContent));
  }

  function setDirtyValue(control: string, value: number): void {
    component.form.controls[control].setValue(value);
    component.form.controls[control].markAsDirty();
    fixture.detectChanges();
  }

  function areaFormGroup(): HTMLElement {
    return Array.from(fixture.nativeElement.querySelectorAll('.form-group'))
      .find((group: HTMLElement) => normalize(group.querySelector('label').textContent).startsWith('Clarifier Area')) as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatePointAnalysisFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        StatePointAnalysisFormService,
        // Resolved lazily, so each test's setup() can build its own mock before the component is created.
        { provide: StatePointAnalysisService, useFactory: () => serviceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('builds the baseline form from the baseline data', () => {
      setup();
      expect(component.form.getRawValue()).toEqual(makeInput());
      expect(component.idString).toBe('baseline_undefined');
    });

    it('builds the modification form from the modification data', () => {
      setup({ isBaseline: false, modification: makeInput({ influentFlow: 0.9 }) });
      expect(component.form.controls.influentFlow.value).toBe(0.9);
      expect(component.idString).toBe('modification_undefined');
    });

    it('builds an empty form when no modification data exists', () => {
      setup({ isBaseline: false });
      expect(component.form.controls.sviValue.value).toBe(0);
      expect(component.form.controls.sviParameter.value).toBe(1);
    });

    it('reads the SVI parameters from the service', () => {
      setup();
      expect(component.sviParameters).toBe(SVI_PARAMETERS);
    });
  });

  describe('reactive observers', () => {
    it('rebuilds the form from the service data on reset', () => {
      setup();
      serviceMock.baselineData.next(makeInput({ MLSS: 9 }));
      serviceMock.resetData.next(true);
      expect(component.form.controls.MLSS.value).toBe(9);
    });

    it('rebuilds the form from the service data when an example is generated', () => {
      setup();
      serviceMock.baselineData.next(makeInput({ rasFlow: 3 }));
      serviceMock.generateExample.next(true);
      expect(component.form.controls.rasFlow.value).toBe(3);
    });

    it('copies the baseline-locked values into the modification when the baseline changes', () => {
      setup({ isBaseline: false, modification: makeInput({ influentFlow: 0.9 }) });
      serviceMock.baselineData.next(makeInput({ MLSS: 4, numberOfClarifiers: 5, influentFlow: 2 }));
      expect(component.form.controls.MLSS.value).toBe(4);
      expect(component.form.controls.numberOfClarifiers.value).toBe(5);
      expect(component.form.controls.influentFlow.value).toBe(0.9);
    });

    it('does not follow baseline changes in the baseline form', () => {
      setup();
      const form = component.form;
      serviceMock.baselineData.next(makeInput({ MLSS: 4 }));
      expect(component.form).toBe(form);
    });
  });

  describe('validator toggling (enable/disable)', () => {
    it('enables every baseline control when selected', () => {
      setup({ selected: true });
      expect(component.form.enabled).toBeTrue();
    });

    it('disables every control when not selected', () => {
      setup({ selected: false });
      expect(component.form.disabled).toBeTrue();
    });

    it('re-enables the form when it becomes selected', () => {
      setup({ selected: false });
      component.selected = true;
      component.ngOnChanges({ selected: new SimpleChange(false, true, false) });
      expect(component.form.enabled).toBeTrue();
    });

    it('disables the form when it becomes deselected', () => {
      setup({ selected: true });
      component.selected = false;
      component.ngOnChanges({ selected: new SimpleChange(true, false, false) });
      expect(component.form.disabled).toBeTrue();
    });

    it('locks the baseline-driven modification controls but leaves the flows editable', () => {
      setup({ isBaseline: false, selected: true, modification: makeInput() });
      BASELINE_LOCKED_CONTROLS.forEach(control => {
        expect(component.form.controls[control].disabled).withContext(control).toBeTrue();
      });
      expect(component.form.controls.influentFlow.enabled).toBeTrue();
      expect(component.form.controls.rasFlow.enabled).toBeTrue();
    });
  });

  describe('user actions', () => {
    it('sends the baseline form values to the baseline data', () => {
      setup();
      component.form.controls.MLSS.setValue(7);
      component.calculate();
      expect(serviceMock.baselineData.getValue()).toEqual(makeInput({ MLSS: 7 }));
    });

    it('sends the modification form values to the modification data', () => {
      setup({ isBaseline: false, modification: makeInput() });
      component.form.controls.influentFlow.setValue(0.5);
      component.calculate();
      expect(serviceMock.modificationData.getValue().influentFlow).toBe(0.5);
    });

    it('reports the focused field', () => {
      setup();
      component.focusField('MLSS');
      expect(serviceMock.currentField.getValue()).toBe('MLSS');
    });

    it('reports the SVI value field as K when the VoK parameter is selected', () => {
      setup({ baseline: makeInput({ sviParameter: 4 }) });
      component.focusField('sviValue');
      expect(serviceMock.currentField.getValue()).toBe('kValue');
    });

    it('switches to diameter entry and calculates the area from the diameter', () => {
      setup();
      component.showHideInputField();
      expect(component.form.controls.isUserDefinedArea.value).toBeFalse();
      expect(serviceMock.calculateArea).toHaveBeenCalledWith(30);
      expect(serviceMock.baselineData.getValue().areaOfClarifier).toBe(706.86);
    });

    it('switches back to area entry without recalculating the area', () => {
      setup({ baseline: makeInput({ isUserDefinedArea: false }) });
      component.showHideInputField();
      expect(component.form.controls.isUserDefinedArea.value).toBeTrue();
      expect(serviceMock.calculateArea).not.toHaveBeenCalled();
      expect(serviceMock.baselineData.getValue().isUserDefinedArea).toBeTrue();
    });

    it('recalculates the area when the diameter changes in diameter entry mode', () => {
      setup({ baseline: makeInput({ isUserDefinedArea: false }) });
      component.form.controls.diameter.setValue(40);
      component.save();
      expect(serviceMock.calculateArea).toHaveBeenCalledWith(40);
      expect(component.form.controls.areaOfClarifier.value).toBe(706.86);
    });

    it('does not calculate the area on save in area entry mode', () => {
      setup();
      component.save();
      expect(serviceMock.calculateArea).not.toHaveBeenCalled();
    });
  });

  describe('template visibility', () => {
    it('lists every SVI parameter option', () => {
      setup();
      const options = Array.from(fixture.nativeElement.querySelectorAll('select[formControlName="sviParameter"] option'))
        .map((option: HTMLElement) => normalize(option.textContent));
      expect(options).toEqual(['SVISN', 'SVIGN', 'SVIGS', 'SVISS', 'VoK']);
    });

    it('labels the SVI value with the parameter name for a non-VoK parameter', () => {
      setup({ baseline: makeInput({ sviParameter: 2 }) });
      expect(normalize(formGroupFor('sviValue').querySelector('label').textContent)).toBe('SVIGS');
    });

    it('labels the SVI value as K for the VoK parameter', () => {
      setup({ baseline: makeInput({ sviParameter: 4 }) });
      expect(normalize(formGroupFor('sviValue').querySelector('label').textContent)).toBe('K');
    });

    it('shows the Vo field for the VoK parameter', () => {
      setup({ baseline: makeInput({ sviParameter: 4 }) });
      expect(query('[formControlName="sludgeSettlingVelocity"]')).not.toBeNull();
    });

    it('hides the Vo field for a non-VoK parameter', () => {
      setup({ baseline: makeInput({ sviParameter: 1 }) });
      expect(query('[formControlName="sludgeSettlingVelocity"]')).toBeNull();
    });

    describe('validation messages', () => {
      STANDARD_ERROR_FIELDS.forEach(({ control, inputOverrides }) => {
        it(`hides ${control} errors while the field is pristine, even when invalid`, () => {
          setup({ baseline: makeInput({ ...inputOverrides, [control]: -1 }) });
          expect(component.form.controls[control].invalid).toBeTrue();
          expect(errorTexts(control)).toEqual([]);
        });

        it(`shows only the required error for an empty dirty ${control}`, () => {
          setup({ baseline: makeInput(inputOverrides) });
          setDirtyValue(control, null);
          expect(errorTexts(control)).toEqual(['Value Required']);
        });

        it(`shows only the negative-value error for a negative dirty ${control}`, () => {
          setup({ baseline: makeInput(inputOverrides) });
          setDirtyValue(control, -1);
          expect(errorTexts(control)).toEqual(["Value can't be negative"]);
        });

        it(`shows no ${control} errors for a valid dirty value`, () => {
          setup({ baseline: makeInput(inputOverrides) });
          setDirtyValue(control, 5);
          expect(errorTexts(control)).toEqual([]);
        });
      });

      it('shows clarifier area errors in diameter entry mode too', () => {
        setup({ baseline: makeInput({ isUserDefinedArea: false }) });
        component.form.controls.areaOfClarifier.setValue(-1);
        component.form.controls.areaOfClarifier.markAsDirty();
        fixture.detectChanges();
        const errors = Array.from(areaFormGroup().querySelectorAll('.alert-danger')).map((el: HTMLElement) => normalize(el.textContent));
        expect(errors).toEqual(["Value can't be negative"]);
      });
    });

    describe('clarifier area entry mode', () => {
      it('shows the area input and the auto-calculate link in area entry mode', () => {
        setup();
        const links = Array.from(areaFormGroup().querySelectorAll('a.click-link')).map((a: HTMLElement) => normalize(a.textContent));
        expect(links).toEqual(['Auto Calculate From Diameter']);
        expect(query('[formControlName="areaOfClarifier"]')).not.toBeNull();
        expect(query('[formControlName="diameter"]')).toBeNull();
        expect(areaFormGroup().querySelector('.bold')).toBeNull();
      });

      it('shows the diameter input, calculated area, and define-area link in diameter entry mode', () => {
        setup({ baseline: makeInput({ isUserDefinedArea: false, areaOfClarifier: 706.858 }) });
        const links = Array.from(areaFormGroup().querySelectorAll('a.click-link')).map((a: HTMLElement) => normalize(a.textContent));
        expect(links).toEqual(['Define Clarifier Area']);
        expect(query('[formControlName="areaOfClarifier"]')).toBeNull();
        expect(query('[formControlName="diameter"]')).not.toBeNull();
        expect(normalize(areaFormGroup().querySelector('.bold').textContent)).toBe('706.86 ft2');
      });

      it('shows dashes for a missing calculated area', () => {
        setup({ baseline: makeInput({ isUserDefinedArea: false, areaOfClarifier: 0 }) });
        expect(normalize(areaFormGroup().querySelector('.bold').textContent)).toBe('— — ft2');
      });

      it('shows the calculated area in square meters for metric settings', () => {
        setup({ unitsOfMeasure: 'Metric', baseline: makeInput({ isUserDefinedArea: false, areaOfClarifier: 50 }) });
        expect(normalize(areaFormGroup().querySelector('.bold').textContent)).toBe('50 m2');
      });
    });

    describe('diameter validation messages', () => {
      function diameterErrorText(): string {
        const outer = formGroupFor('diameter').querySelector('.input-group > span.alert-danger');
        return outer ? normalize(outer.textContent) : null;
      }

      it('hides diameter errors while the field is pristine', () => {
        setup({ baseline: makeInput({ isUserDefinedArea: false, diameter: -1 }) });
        expect(diameterErrorText()).toBeNull();
      });

      it('shows only the required error for an empty dirty diameter', () => {
        setup({ baseline: makeInput({ isUserDefinedArea: false }) });
        setDirtyValue('diameter', null);
        expect(diameterErrorText()).toBe('Value Required');
      });

      it('shows the minimum error in feet for imperial settings', () => {
        setup({ baseline: makeInput({ isUserDefinedArea: false }) });
        setDirtyValue('diameter', -1);
        expect(diameterErrorText()).toBe("Value can't be less than 0 ft.");
      });

      it('shows the minimum error in meters for metric settings', () => {
        setup({ unitsOfMeasure: 'Metric', baseline: makeInput({ isUserDefinedArea: false }) });
        setDirtyValue('diameter', -1);
        expect(diameterErrorText()).toBe("Value can't be less than 0 m.");
      });
    });

    describe('units', () => {
      function unitsFor(control: string): string {
        return normalize(formGroupFor(control).querySelector('.units').textContent);
      }

      it('shows imperial units for imperial settings', () => {
        setup({ unitsOfMeasure: 'Imperial' });
        expect(unitsFor('areaOfClarifier')).toBe('ft2');
        expect(unitsFor('influentFlow')).toBe('Mg/d');
        expect(unitsFor('rasFlow')).toBe('Mg/d');
        expect(formGroupFor('areaOfClarifier').querySelectorAll('.units').length).toBe(1);
        expect(formGroupFor('influentFlow').querySelectorAll('.units').length).toBe(1);
        expect(formGroupFor('rasFlow').querySelectorAll('.units').length).toBe(1);
      });

      it('shows metric units for metric settings', () => {
        setup({ unitsOfMeasure: 'Metric' });
        expect(unitsFor('areaOfClarifier')).toBe('m2');
        expect(unitsFor('influentFlow')).toBe('m3d');
        expect(unitsFor('rasFlow')).toBe('m3d');
        expect(formGroupFor('areaOfClarifier').querySelectorAll('.units').length).toBe(1);
        expect(formGroupFor('influentFlow').querySelectorAll('.units').length).toBe(1);
        expect(formGroupFor('rasFlow').querySelectorAll('.units').length).toBe(1);
      });

      it('shows the diameter in feet for imperial settings', () => {
        setup({ unitsOfMeasure: 'Imperial', baseline: makeInput({ isUserDefinedArea: false }) });
        expect(Array.from(formGroupFor('diameter').querySelectorAll('.units')).map((el: HTMLElement) => normalize(el.textContent))).toEqual(['ft']);
      });

      it('shows the diameter in meters for metric settings', () => {
        setup({ unitsOfMeasure: 'Metric', baseline: makeInput({ isUserDefinedArea: false }) });
        expect(Array.from(formGroupFor('diameter').querySelectorAll('.units')).map((el: HTMLElement) => normalize(el.textContent))).toEqual(['m']);
      });
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form on reset or example after destroy', () => {
      setup();
      const form = component.form;
      fixture.destroy();
      serviceMock.resetData.next(true);
      serviceMock.generateExample.next(true);
      expect(component.form).toBe(form);
    });

    it('stops following baseline changes in the modification form after destroy', () => {
      setup({ isBaseline: false, modification: makeInput() });
      const form = component.form;
      fixture.destroy();
      serviceMock.baselineData.next(makeInput({ MLSS: 4 }));
      expect(component.form).toBe(form);
    });
  });
});
