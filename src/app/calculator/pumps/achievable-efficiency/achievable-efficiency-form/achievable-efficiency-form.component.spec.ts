import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { AchievableEfficiencyFormComponent } from './achievable-efficiency-form.component';
import { PsatWarningService } from '../../../../psat/psat-warning.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { notWholeNumberMsg, pumpTypesConstant } from '../../../../psat/psatConstants';
import { WholeNumberValidator } from '../../../../shared/validators/whole-number';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = { flowMeasurement: 'gpm', distanceMeasurement: 'ft' } as Settings;

function makeEfficiencyForm(overrides: Partial<Record<string, number>> = {}): UntypedFormGroup {
  const values = {
    pumpType: 6,
    flowRate: 2000,
    rpm: 2000,
    kinematicViscosity: 1.107,
    stageCount: 1,
    head: 137,
    pumpEfficiency: 100,
    ...overrides,
  };
  return new UntypedFormGroup({
    pumpType: new UntypedFormControl(values.pumpType, Validators.required),
    flowRate: new UntypedFormControl(values.flowRate, [Validators.required, Validators.min(0)]),
    rpm: new UntypedFormControl(values.rpm, Validators.required),
    kinematicViscosity: new UntypedFormControl(values.kinematicViscosity, [Validators.required, Validators.min(0)]),
    stageCount: new UntypedFormControl(values.stageCount, [Validators.required, Validators.min(1), WholeNumberValidator.wholeNumber()]),
    head: new UntypedFormControl(values.head, [Validators.required, Validators.min(0.1)]),
    pumpEfficiency: new UntypedFormControl(values.pumpEfficiency, Validators.required),
  });
}

describe('AchievableEfficiencyFormComponent', () => {
  let component: AchievableEfficiencyFormComponent;
  let fixture: ComponentFixture<AchievableEfficiencyFormComponent>;
  let psatWarningServiceSpy: jasmine.SpyObj<PsatWarningService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;
  let form: UntypedFormGroup;

  function getFormGroup(controlId: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${controlId}`).closest('.form-group');
  }

  function getError(controlId: string): HTMLElement | null {
    return getFormGroup(controlId).querySelector('.alert-danger');
  }

  function getWarning(controlId: string): HTMLElement | null {
    return getFormGroup(controlId).querySelector('.alert-warning');
  }

  function getErrorMessages(controlId: string): Array<string> {
    const error = getError(controlId);
    if (!error) {
      return [];
    }
    return Array.from(error.children).map((child: HTMLElement) => child.textContent.replace(/\s+/g, ' ').trim());
  }

  function setDirtyValue(controlName: string, value: number | string): void {
    form.controls[controlName].setValue(value);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(efficiencyForm: UntypedFormGroup = makeEfficiencyForm()): void {
    form = efficiencyForm;
    fixture = TestBed.createComponent(AchievableEfficiencyFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('efficiencyForm', form);
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    psatWarningServiceSpy = jasmine.createSpyObj('PsatWarningService', ['checkFlowRate']);
    psatWarningServiceSpy.checkFlowRate.and.returnValue(null);
    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['getUnit']);
    convertUnitsServiceSpy.getUnit.and.returnValue({ unit: { name: { display: '(gpm)' } } } as any);

    await TestBed.configureTestingModule({
      declarations: [AchievableEfficiencyFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: PsatWarningService, useValue: psatWarningServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    beforeEach(() => createComponent());

    it('copies the pump type options from the constant', () => {
      expect(component.pumpTypes).toEqual(pumpTypesConstant);
      expect(component.pumpTypes).not.toBe(pumpTypesConstant);
    });

    it('checks the flow rate warning with the form values and settings', () => {
      expect(psatWarningServiceSpy.checkFlowRate).toHaveBeenCalledWith(6, 2000, MOCK_SETTINGS);
      expect(component.flowRateWarning).toBeNull();
    });

    it('renders the flow rate display unit without parentheses', () => {
      const unit: HTMLElement = getFormGroup('flowRate').querySelector('.units');
      expect(unit.innerHTML).toBe('gpm');
      expect(convertUnitsServiceSpy.getUnit).toHaveBeenCalledWith('gpm');
    });
  });

  describe('pump type options', () => {
    beforeEach(() => createComponent());

    it('renders one option per pump type in order', () => {
      const options: Array<HTMLOptionElement> = Array.from(fixture.nativeElement.querySelectorAll('#pumpType option'));
      expect(options.length).toBe(pumpTypesConstant.length);
      options.forEach((option, index) => {
        expect(option.textContent).toBe(pumpTypesConstant[index].display);
      });
    });

    it('selects the option matching the form value', () => {
      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#pumpType');
      const selected = select.options[select.selectedIndex];
      const expected = pumpTypesConstant.find(pumpType => pumpType.value === 6);
      expect(selected.textContent).toBe(expected.display);
    });
  });

  describe('flow rate validation', () => {
    beforeEach(() => createComponent());

    it('hides the error while the control is valid', () => {
      setDirtyValue('flowRate', 100);
      expect(getError('flowRate')).toBeNull();
    });

    it('hides the error while an invalid control is pristine', () => {
      form.controls.flowRate.setValue(null);
      fixture.detectChanges();
      expect(getError('flowRate')).toBeNull();
    });

    it('shows only the required message when empty and dirty', () => {
      setDirtyValue('flowRate', null);
      expect(getErrorMessages('flowRate')).toEqual(['Value required.']);
    });

    it('shows only the min message when below the minimum', () => {
      setDirtyValue('flowRate', -1);
      expect(getErrorMessages('flowRate')).toEqual(["Value can't be less than 0 gpm."]);
    });

    it('shows only the max message when above a max validator', () => {
      form.controls.flowRate.setValidators([Validators.required, Validators.max(10)]);
      setDirtyValue('flowRate', 20);
      expect(getErrorMessages('flowRate')).toEqual(["Value can't be greater than 10 gpm."]);
    });
  });

  describe('flow rate warning', () => {
    beforeEach(() => {
      psatWarningServiceSpy.checkFlowRate.and.returnValue('Flow rate out of range');
      createComponent();
    });

    it('shows the warning when set, valid, and dirty', () => {
      form.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(getWarning('flowRate').textContent).toBe('Flow rate out of range');
    });

    it('hides the warning while the control is pristine', () => {
      form.controls.flowRate.markAsPristine();
      fixture.detectChanges();
      expect(getWarning('flowRate')).toBeNull();
    });

    it('hides the warning while the control is invalid', () => {
      setDirtyValue('flowRate', -1);
      expect(getWarning('flowRate')).toBeNull();
      expect(getError('flowRate')).not.toBeNull();
    });

    it('hides the warning when the service returns null', () => {
      psatWarningServiceSpy.checkFlowRate.and.returnValue(null);
      component.emitChange();
      form.controls.flowRate.markAsDirty();
      fixture.detectChanges();
      expect(getWarning('flowRate')).toBeNull();
    });
  });

  describe('rpm validation', () => {
    beforeEach(() => createComponent());

    it('hides the error while valid', () => {
      setDirtyValue('rpm', 1800);
      expect(getError('rpm')).toBeNull();
    });

    it('hides the error while invalid and pristine', () => {
      form.controls.rpm.setValue(null);
      fixture.detectChanges();
      expect(getError('rpm')).toBeNull();
    });

    it('shows the required message when empty and dirty', () => {
      setDirtyValue('rpm', null);
      expect(getErrorMessages('rpm')).toEqual(['Value required.']);
    });
  });

  describe('kinematic viscosity validation', () => {
    beforeEach(() => createComponent());

    it('hides the error while valid', () => {
      setDirtyValue('kinematicViscosity', 2);
      expect(getError('kinematicViscosity')).toBeNull();
    });

    it('hides the error while invalid and pristine', () => {
      form.controls.kinematicViscosity.setValue(-1);
      fixture.detectChanges();
      expect(getError('kinematicViscosity')).toBeNull();
    });

    it('shows only the required message when empty and dirty', () => {
      setDirtyValue('kinematicViscosity', null);
      expect(getErrorMessages('kinematicViscosity')).toEqual(['Value required.']);
    });

    it('shows only the min message when below the minimum', () => {
      setDirtyValue('kinematicViscosity', -1);
      expect(getErrorMessages('kinematicViscosity')).toEqual(["Value can't be less than 0 cSt."]);
    });
  });

  describe('stage count validation', () => {
    beforeEach(() => createComponent());

    it('hides the error while valid', () => {
      expect(getError('stageCount')).toBeNull();
    });

    it('shows the error even while pristine', () => {
      form.controls.stageCount.setValue(0);
      fixture.detectChanges();
      expect(form.controls.stageCount.pristine).toBeTrue();
      expect(getErrorMessages('stageCount')).toEqual(["Value can't be less than 1."]);
    });

    it('shows only the required message when empty', () => {
      setDirtyValue('stageCount', null);
      expect(getErrorMessages('stageCount')).toEqual(['Value required.']);
    });

    it('shows only the whole number message for a fraction', () => {
      setDirtyValue('stageCount', 2.5);
      expect(getErrorMessages('stageCount')).toEqual([notWholeNumberMsg]);
    });

    it('shows both min and whole number messages for a fraction below one', () => {
      setDirtyValue('stageCount', 0.5);
      expect(getErrorMessages('stageCount')).toEqual(["Value can't be less than 1.", notWholeNumberMsg]);
    });
  });

  describe('stage count warning', () => {
    beforeEach(() => createComponent());

    it('hides the multistage warning below 15 stages', () => {
      setDirtyValue('stageCount', 14);
      expect(getWarning('stageCount')).toBeNull();
    });

    it('shows the multistage warning at 15 stages', () => {
      setDirtyValue('stageCount', 15);
      expect(getWarning('stageCount').textContent.trim()).toBe('Multistage pumps usually have less than 15 impellers.');
    });
  });

  describe('head validation', () => {
    beforeEach(() => createComponent());

    it('renders the distance unit', () => {
      expect(getFormGroup('head').querySelector('.units').innerHTML).toBe('ft');
    });

    it('hides the error while valid', () => {
      setDirtyValue('head', 50);
      expect(getError('head')).toBeNull();
    });

    it('hides the error while invalid and pristine', () => {
      form.controls.head.setValue(0);
      fixture.detectChanges();
      expect(getError('head')).toBeNull();
    });

    it('shows only the required message when empty and dirty', () => {
      setDirtyValue('head', null);
      expect(getErrorMessages('head')).toEqual(['Value required.']);
    });

    it('shows only the min message with the distance unit when below the minimum', () => {
      setDirtyValue('head', 0);
      expect(getErrorMessages('head')).toEqual(["Value can't be less than 0.1 ft."]);
    });
  });

  describe('user actions', () => {
    beforeEach(() => createComponent());

    it('emitChange re-checks warnings and emits calculate', () => {
      const calculateSpy = jasmine.createSpy('calculate');
      component.calculate.subscribe(calculateSpy);
      psatWarningServiceSpy.checkFlowRate.calls.reset();
      psatWarningServiceSpy.checkFlowRate.and.returnValue('warn');
      form.controls.flowRate.setValue(10);

      component.emitChange();

      expect(psatWarningServiceSpy.checkFlowRate).toHaveBeenCalledWith(6, 10, MOCK_SETTINGS);
      expect(component.flowRateWarning).toBe('warn');
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('typing in an input emits calculate', () => {
      const calculateSpy = jasmine.createSpy('calculate');
      component.calculate.subscribe(calculateSpy);
      const input: HTMLInputElement = fixture.nativeElement.querySelector('#rpm');
      input.value = '1500';
      input.dispatchEvent(new Event('input'));
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('focusField emits the field name', () => {
      const changeFieldSpy = jasmine.createSpy('changeField');
      component.changeField.subscribe(changeFieldSpy);
      component.focusField('head');
      expect(changeFieldSpy).toHaveBeenCalledWith('head');
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => createComponent());

    it('emits calculate when toggleExampleData changes after the first change', () => {
      const calculateSpy = jasmine.createSpy('calculate');
      component.calculate.subscribe(calculateSpy);
      component.ngOnChanges({ toggleExampleData: new SimpleChange(true, false, false) });
      expect(calculateSpy).toHaveBeenCalledWith(true);
    });

    it('does not emit calculate on the first toggleExampleData change', () => {
      const calculateSpy = jasmine.createSpy('calculate');
      component.calculate.subscribe(calculateSpy);
      component.ngOnChanges({ toggleExampleData: new SimpleChange(undefined, true, true) });
      expect(calculateSpy).not.toHaveBeenCalled();
    });

    it('does not emit calculate for other input changes', () => {
      const calculateSpy = jasmine.createSpy('calculate');
      component.calculate.subscribe(calculateSpy);
      component.ngOnChanges({ settings: new SimpleChange(undefined, MOCK_SETTINGS, false) });
      expect(calculateSpy).not.toHaveBeenCalled();
    });
  });
});
