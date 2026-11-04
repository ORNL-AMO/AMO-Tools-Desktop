import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RatedMotorFormComponent } from './rated-motor-form.component';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { PsatService } from '../../../../psat/psat.service';
import { FanMotorService } from '../../../fan-motor/fan-motor.service';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { motorEfficiencyConstants } from '../../../../psat/psatConstants';
import { FSAT } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';

const MOCK_SETTINGS = {} as Settings;
const SPECIFIED_EFFICIENCY_CLASS = 3;

interface MotorFormValues {
  efficiencyClass?: number,
  specifiedEfficiency?: number | null,
  motorRatedPower?: number | null
}

function makeMotorForm(overrides: MotorFormValues = {}): UntypedFormGroup {
  const values: MotorFormValues = { efficiencyClass: 0, specifiedEfficiency: 90, motorRatedPower: 200, ...overrides };
  return new UntypedFormGroup({
    efficiencyClass: new UntypedFormControl(values.efficiencyClass),
    specifiedEfficiency: new UntypedFormControl(values.specifiedEfficiency, [Validators.required, Validators.min(0), Validators.max(100)]),
    motorRatedPower: new UntypedFormControl(values.motorRatedPower, [Validators.required]),
    motorRpm: new UntypedFormControl(1780, [Validators.required]),
    lineFrequency: new UntypedFormControl(60, [Validators.required]),
    motorRatedVoltage: new UntypedFormControl(460, [Validators.required]),
    fullLoadAmps: new UntypedFormControl(0),
  });
}

function makeFsat(): FSAT {
  return { modifications: [{ id: 'mod-1', fsat: { whatIfScenario: true } }] } as FSAT;
}

describe('RatedMotorFormComponent', () => {
  let component: RatedMotorFormComponent;
  let fixture: ComponentFixture<RatedMotorFormComponent>;
  let fsat: FSAT;
  let psatServiceSpy: jasmine.SpyObj<PsatService>;
  let fanMotorServiceSpy: jasmine.SpyObj<FanMotorService>;
  let convertUnitsServiceSpy: jasmine.SpyObj<ConvertUnitsService>;

  function createComponent(baselineForm: UntypedFormGroup, modificationForm: UntypedFormGroup): void {
    fixture = TestBed.createComponent(RatedMotorFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('exploreModIndex', 0);
    fixture.componentRef.setInput('fsat', fsat);
    fixture.componentRef.setInput('baselineForm', baselineForm);
    fixture.componentRef.setInput('modificationForm', modificationForm);
    fixture.detectChanges();
  }

  function getEfficiencyClassItem(): HTMLElement | undefined {
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('li'));
    return items.find(item => item.querySelector('[for="baselineMotorDrive"]'));
  }

  function getMotorEfficiencyItem(): HTMLElement | undefined {
    const items: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('li'));
    return items.find(item => item.querySelector('[for="baselineMotorEfficiency"], [for="modificationMotorEfficiency"]'));
  }

  function getBaselineEfficiencyForm(): HTMLElement | null {
    return getMotorEfficiencyItem()?.querySelector('[for="baselineMotorEfficiency"]')?.closest('form') ?? null;
  }

  function getModificationEfficiencyForm(): HTMLElement | null {
    return getMotorEfficiencyItem()?.querySelector('[for="modificationMotorEfficiency"]')?.closest('form') ?? null;
  }

  function getErrorMessages(form: HTMLElement): string[] {
    return Array.from(form.querySelectorAll('.alert-danger > span')).map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function showEfficiencyClassOpportunity(): void {
    fsat.modifications[0].exploreOppsShowMotor.hasOpportunity = true;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    fsat = makeFsat();
    psatServiceSpy = jasmine.createSpyObj('PsatService', ['estFLA']);
    fanMotorServiceSpy = jasmine.createSpyObj('FanMotorService', ['getEfficiencyValidators']);
    fanMotorServiceSpy.getEfficiencyValidators.and.returnValue([]);
    convertUnitsServiceSpy = jasmine.createSpyObj('ConvertUnitsService', ['getUnit']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ReactiveFormsModule],
      declarations: [RatedMotorFormComponent],
      providers: [
        HelpPanelService,
        ModifyConditionsService,
        { provide: PsatService, useValue: psatServiceSpy },
        { provide: FanMotorService, useValue: fanMotorServiceSpy },
        { provide: ConvertUnitsService, useValue: convertUnitsServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('creates the component and populates the efficiency class options', () => {
      createComponent(makeMotorForm(), makeMotorForm());
      expect(component).toBeTruthy();
      expect(component.efficiencyClasses).toBe(motorEfficiencyConstants);
    });

    it('flags an efficiency class opportunity when the classes differ', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(fsat.modifications[0].exploreOppsShowMotor.hasOpportunity).toBeTrue();
    });

    it('flags no efficiency class opportunity when the classes match', () => {
      createComponent(makeMotorForm({ efficiencyClass: 1 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(fsat.modifications[0].exploreOppsShowMotor.hasOpportunity).toBeFalse();
    });

    it('flags a motor efficiency opportunity when the baseline class is specified', () => {
      createComponent(makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }), makeMotorForm({ efficiencyClass: 1 }));
      expect(fsat.modifications[0].exploreOppsShowMotorEff.hasOpportunity).toBeTrue();
    });

    it('flags a motor efficiency opportunity and enables the specified efficiency when the modification class is specified', () => {
      const modificationForm: UntypedFormGroup = makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS });
      createComponent(makeMotorForm({ efficiencyClass: 1 }), modificationForm);
      expect(fsat.modifications[0].exploreOppsShowMotorEff.hasOpportunity).toBeTrue();
      expect(modificationForm.controls.specifiedEfficiency.enabled).toBeTrue();
    });

    it('flags no motor efficiency opportunity, defaults efficiency to 90 and disables the modification field when neither class is specified', () => {
      const baselineForm: UntypedFormGroup = makeMotorForm({ efficiencyClass: 1, specifiedEfficiency: 75 });
      const modificationForm: UntypedFormGroup = makeMotorForm({ efficiencyClass: 2, specifiedEfficiency: 75 });
      createComponent(baselineForm, modificationForm);
      expect(fsat.modifications[0].exploreOppsShowMotorEff.hasOpportunity).toBeFalse();
      expect(baselineForm.controls.specifiedEfficiency.value).toBe(90);
      expect(modificationForm.controls.specifiedEfficiency.value).toBe(90);
      expect(modificationForm.controls.specifiedEfficiency.disabled).toBeTrue();
    });

    it('re-evaluates opportunities when exploreModIndex changes after the first change detection', () => {
      const modificationForm: UntypedFormGroup = makeMotorForm({ efficiencyClass: 1 });
      createComponent(makeMotorForm({ efficiencyClass: 1 }), modificationForm);
      fsat.modifications.push(JSON.parse(JSON.stringify(fsat.modifications[0])));

      modificationForm.controls.efficiencyClass.setValue(2);
      fixture.componentRef.setInput('exploreModIndex', 1);
      fixture.detectChanges();

      expect(fsat.modifications[1].exploreOppsShowMotor.hasOpportunity).toBeTrue();
    });
  });

  describe('template visibility: efficiency class checkbox', () => {
    it('always shows the checkbox with the opportunity display text, even without an opportunity', () => {
      createComponent(makeMotorForm({ efficiencyClass: 1 }), makeMotorForm({ efficiencyClass: 1 }));
      const label: HTMLElement = fixture.nativeElement.querySelector('label[for="modifyEfficiencyClass"]');
      expect(fixture.nativeElement.querySelector('#modifyEfficiencyClass')).not.toBeNull();
      expect(label.textContent).toContain('Install More Efficient Motor');
    });
  });

  describe('template visibility: efficiency class item', () => {
    it('hides the efficiency class item when the classes match', () => {
      createComponent(makeMotorForm({ efficiencyClass: 1 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(getEfficiencyClassItem()).toBeUndefined();
    });

    it('shows the efficiency class item when the classes differ', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(getEfficiencyClassItem()).toBeDefined();
    });

    it('shows the baseline efficiency class display name', () => {
      createComponent(makeMotorForm({ efficiencyClass: 2 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(getEfficiencyClassItem().querySelector('.baseline-value-input').textContent).toContain('Premium Efficient');
    });

    it('shows the "Baseline" prefix on the baseline label', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(getEfficiencyClassItem().querySelector('label.baseline-value-label span')).not.toBeNull();
    });

    it('shows the modification efficiency class select with one option per efficiency class', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1 }));
      const select: HTMLSelectElement = getEfficiencyClassItem().querySelector('select#modificationEfficiencyClass');
      expect(select).not.toBeNull();
      expect(select.querySelectorAll('option').length).toBe(motorEfficiencyConstants.length);
    });
  });

  describe('template visibility: motor efficiency item', () => {
    it('hides the motor efficiency item when neither class is specified', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(getMotorEfficiencyItem()).toBeUndefined();
    });

    it('hides the motor efficiency item when a class is specified but the efficiency class opportunity is off', () => {
      createComponent(makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }), makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }));
      expect(fsat.modifications[0].exploreOppsShowMotorEff.hasOpportunity).toBeTrue();
      expect(fsat.modifications[0].exploreOppsShowMotor.hasOpportunity).toBeFalse();
      expect(getMotorEfficiencyItem()).toBeUndefined();
    });

    it('hides the motor efficiency item when a class is specified but the motor efficiency opportunity is off', () => {
      createComponent(makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }), makeMotorForm({ efficiencyClass: 1 }));
      fsat.modifications[0].exploreOppsShowMotorEff.hasOpportunity = false;
      fixture.detectChanges();
      expect(getMotorEfficiencyItem()).toBeUndefined();
    });

    it('shows only the baseline motor efficiency when only the baseline class is specified', () => {
      createComponent(makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: 88 }), makeMotorForm({ efficiencyClass: 1 }));
      expect(getMotorEfficiencyItem()).toBeDefined();
      expect(getBaselineEfficiencyForm()).not.toBeNull();
      expect(getBaselineEfficiencyForm().querySelector('.baseline-value-input').textContent).toContain('88%');
      expect(getModificationEfficiencyForm()).toBeNull();
    });

    it('shows only the modification motor efficiency input when only the modification class is specified', () => {
      createComponent(makeMotorForm({ efficiencyClass: 1 }), makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }));
      expect(getMotorEfficiencyItem()).toBeDefined();
      expect(getBaselineEfficiencyForm()).toBeNull();
      expect(getModificationEfficiencyForm()).not.toBeNull();
      expect(getModificationEfficiencyForm().querySelector('#modificationMotorEfficiency')).not.toBeNull();
    });

    it('shows both motor efficiency forms when both classes are specified and the efficiency class opportunity is on', () => {
      createComponent(makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }), makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }));
      showEfficiencyClassOpportunity();
      expect(getBaselineEfficiencyForm()).not.toBeNull();
      expect(getModificationEfficiencyForm()).not.toBeNull();
    });
  });

  describe('template visibility: motor efficiency errors', () => {
    it('hides motor efficiency errors when both values are valid', () => {
      createComponent(makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }), makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }));
      showEfficiencyClassOpportunity();
      expect(getMotorEfficiencyItem().querySelector('.alert-danger')).toBeNull();
    });

    it('hides motor efficiency errors when the values are invalid but pristine', () => {
      createComponent(
        makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: null }),
        makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: null })
      );
      showEfficiencyClassOpportunity();
      expect(getMotorEfficiencyItem().querySelector('.alert-danger')).toBeNull();
    });

    const efficiencyErrorCases: Array<{ description: string, value: number | null, message: string }> = [
      { description: 'is empty', value: null, message: 'Value Required' },
      { description: 'exceeds the maximum', value: 101, message: "Value can't be greater than 100 %." },
      { description: 'is below the minimum', value: -1, message: "Value can't be less than 0 %." },
    ];

    efficiencyErrorCases.forEach(({ description, value, message }) => {
      it(`shows only the "${message}" baseline error when the baseline motor efficiency ${description} and is dirty`, () => {
        const baselineForm: UntypedFormGroup = makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: value });
        baselineForm.controls.specifiedEfficiency.markAsDirty();
        createComponent(baselineForm, makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }));
        showEfficiencyClassOpportunity();

        expect(getErrorMessages(getBaselineEfficiencyForm())).toEqual([message]);
        expect(getErrorMessages(getModificationEfficiencyForm())).toEqual([]);
      });

      it(`shows only the "${message}" modification error when the modification motor efficiency ${description} and is dirty`, () => {
        const modificationForm: UntypedFormGroup = makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: value });
        modificationForm.controls.specifiedEfficiency.markAsDirty();
        createComponent(makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS }), modificationForm);
        showEfficiencyClassOpportunity();

        expect(getErrorMessages(getModificationEfficiencyForm())).toEqual([message]);
        expect(getErrorMessages(getBaselineEfficiencyForm())).toEqual([]);
      });
    });
  });

  describe('toggleEfficiencyClass', () => {
    it('resets the modification class to baseline and emits when the opportunity is unchecked', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 2 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      fsat.modifications[0].exploreOppsShowMotor.hasOpportunity = false;
      component.toggleEfficiencyClass();

      expect(component.modificationForm.controls.efficiencyClass.value).toBe(0);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when the opportunity is checked', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 2 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.toggleEfficiencyClass();

      expect(component.modificationForm.controls.efficiencyClass.value).toBe(2);
      expect(emitted).toEqual([]);
    });
  });

  describe('toggleMotorEfficiency', () => {
    it('resets the modification efficiency to baseline and emits when the opportunity is unchecked', () => {
      createComponent(
        makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: 88 }),
        makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: 95 })
      );
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      fsat.modifications[0].exploreOppsShowMotorEff.hasOpportunity = false;
      component.toggleMotorEfficiency();

      expect(component.modificationForm.controls.specifiedEfficiency.value).toBe(88);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when the opportunity is checked', () => {
      createComponent(
        makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: 88 }),
        makeMotorForm({ efficiencyClass: SPECIFIED_EFFICIENCY_CLASS, specifiedEfficiency: 95 })
      );
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.toggleMotorEfficiency();

      expect(component.modificationForm.controls.specifiedEfficiency.value).toBe(95);
      expect(emitted).toEqual([]);
    });
  });

  describe('setEfficiencyClasses', () => {
    it('requests validators for both classes, applies them, marks both class controls dirty and emits', () => {
      const modificationValidators: ValidatorFn[] = [Validators.required];
      const baselineValidators: ValidatorFn[] = [Validators.min(1)];
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1 }));
      fanMotorServiceSpy.getEfficiencyValidators.and.returnValues(modificationValidators, baselineValidators);
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.setEfficiencyClasses();

      expect(fanMotorServiceSpy.getEfficiencyValidators.calls.allArgs()).toEqual([[1], [0]]);
      expect(component.modificationForm.controls.efficiencyClass.hasValidator(modificationValidators[0])).toBeTrue();
      expect(component.baselineForm.controls.efficiencyClass.hasValidator(baselineValidators[0])).toBeTrue();
      expect(component.modificationForm.controls.efficiencyClass.dirty).toBeTrue();
      expect(component.baselineForm.controls.efficiencyClass.dirty).toBeTrue();
      expect(emitted).toEqual([true]);
    });
  });

  describe('getModificationFLA', () => {
    it('estimates the full load amps from the modification form, patches it and emits when the form is valid', () => {
      psatServiceSpy.estFLA.and.returnValue(123.4);
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1, specifiedEfficiency: 92 }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.getModificationFLA();

      expect(psatServiceSpy.estFLA).toHaveBeenCalledWith(200, 1780, 60, 1, 90, 460, MOCK_SETTINGS);
      expect(component.modificationForm.controls.fullLoadAmps.value).toBe(123.4);
      expect(emitted).toEqual([true]);
    });

    it('skips the estimate but still emits when a required modification field is invalid', () => {
      createComponent(makeMotorForm({ efficiencyClass: 0 }), makeMotorForm({ efficiencyClass: 1, motorRatedPower: null }));
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.getModificationFLA();

      expect(psatServiceSpy.estFLA).not.toHaveBeenCalled();
      expect(emitted).toEqual([true]);
    });
  });
});
