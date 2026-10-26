import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { SystemDataFormComponent } from './system-data-form.component';
import { HelpPanelService } from '../../../help-panel/help-panel.service';
import { ModifyConditionsService } from '../../../modify-conditions/modify-conditions.service';
import { FanFieldDataWarnings, FanOperationsWarnings } from '../../../fsat-warning.service';
import { FSAT } from '../../../../shared/models/fans';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class StubSettingsLabelPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const MOCK_SETTINGS = { fanFlowRate: 'ft3/min', fanPressureMeasurement: 'inH2o' } as Settings;
const REQUIRED_MESSAGE = 'Value Required';
const MIN_MESSAGE = "Value can't be less than";
const MAX_MESSAGE = "Value can't be greater than";

interface FieldDataValues {
  flowRate?: number | null,
  inletPressure?: number | null,
  outletPressure?: number | null
}

interface OperationsValues {
  cost?: number | null,
  operatingHours?: number | null
}

function makeFieldDataForm(overrides: FieldDataValues = {}): UntypedFormGroup {
  const values: FieldDataValues = { flowRate: 1000, inletPressure: -1, outletPressure: 5, ...overrides };
  return new UntypedFormGroup({
    flowRate: new UntypedFormControl(values.flowRate, [Validators.required, Validators.min(0)]),
    inletPressure: new UntypedFormControl(values.inletPressure, [Validators.required]),
    outletPressure: new UntypedFormControl(values.outletPressure, [Validators.required, Validators.min(0)]),
  });
}

function makeOperationsForm(overrides: OperationsValues = {}): UntypedFormGroup {
  const values: OperationsValues = { cost: 0.06, operatingHours: 8000, ...overrides };
  return new UntypedFormGroup({
    cost: new UntypedFormControl(values.cost, [Validators.required, Validators.min(0)]),
    operatingHours: new UntypedFormControl(values.operatingHours, [Validators.required, Validators.min(0), Validators.max(8760)]),
  });
}

function makeFieldDataWarnings(outletPressureError: string | null = null): FanFieldDataWarnings {
  return {
    voltageError: null,
    ratedPowerError: null,
    suggestedVoltage: null,
    inletPressureError: null,
    outletPressureError,
    calcInletVelocityPressureError: null,
  };
}

function makeOperationsWarnings(costError: string | null = null): FanOperationsWarnings {
  return { costError };
}

function makeFsat(whatIfScenario: boolean = true): FSAT {
  return { modifications: [{ id: 'mod-1', fsat: { whatIfScenario } }] } as FSAT;
}

describe('SystemDataFormComponent', () => {
  let component: SystemDataFormComponent;
  let fixture: ComponentFixture<SystemDataFormComponent>;
  let fsat: FSAT;

  interface ComponentSetup {
    baselineForm?: UntypedFormGroup,
    modificationForm?: UntypedFormGroup,
    baselineOperationsForm?: UntypedFormGroup,
    modificationOperationsForm?: UntypedFormGroup,
    baselineWarnings?: FanFieldDataWarnings,
    modificationWarnings?: FanFieldDataWarnings,
    baselineOperationsWarnings?: FanOperationsWarnings,
    modificationOperationsWarnings?: FanOperationsWarnings,
    isVFD?: boolean
  }

  function createComponent(setup: ComponentSetup = {}): void {
    fixture = TestBed.createComponent(SystemDataFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', MOCK_SETTINGS);
    fixture.componentRef.setInput('exploreModIndex', 0);
    fixture.componentRef.setInput('fsat', fsat);
    fixture.componentRef.setInput('baselineForm', setup.baselineForm ?? makeFieldDataForm());
    fixture.componentRef.setInput('modificationForm', setup.modificationForm ?? makeFieldDataForm());
    fixture.componentRef.setInput('baselineOperationsForm', setup.baselineOperationsForm ?? makeOperationsForm());
    fixture.componentRef.setInput('modificationOperationsForm', setup.modificationOperationsForm ?? makeOperationsForm());
    fixture.componentRef.setInput('baselineWarnings', setup.baselineWarnings ?? makeFieldDataWarnings());
    fixture.componentRef.setInput('modificationWarnings', setup.modificationWarnings ?? makeFieldDataWarnings());
    fixture.componentRef.setInput('baselineOperationsWarnings', setup.baselineOperationsWarnings ?? makeOperationsWarnings());
    fixture.componentRef.setInput('modificationOperationsWarnings', setup.modificationOperationsWarnings ?? makeOperationsWarnings());
    fixture.componentRef.setInput('isVFD', setup.isVFD ?? false);
    fixture.detectChanges();
  }

  /** @returns the list item containing the label with the given `for` attribute, or null when it is not rendered */
  function getItem(labelFor: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(`[for="${labelFor}"]`)?.closest('li') ?? null;
  }

  function getFlowItem(): HTMLElement | null {
    return getItem('baselineFlowRate');
  }

  function getInletItem(): HTMLElement | null {
    return getItem('baselinePressure');
  }

  function getOutletItem(): HTMLElement | null {
    return getItem('baselineOutletPressure');
  }

  function getCostItem(): HTMLElement | null {
    return getItem('baselineCost');
  }

  function getHoursItem(): HTMLElement | null {
    return getItem('baselineOperatingHours');
  }

  function getForm(item: HTMLElement, side: 'baseline' | 'modification'): HTMLElement {
    return item.querySelectorAll('form')[side === 'baseline' ? 0 : 1];
  }

  function getErrors(form: HTMLElement): string[] {
    return Array.from(form.querySelectorAll('.alert-danger > span')).map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function getWarning(form: HTMLElement): HTMLElement | null {
    return form.querySelector('.alert-warning');
  }

  function dirty(form: UntypedFormGroup, controlName: string): UntypedFormGroup {
    form.controls[controlName].markAsDirty();
    return form;
  }

  beforeEach(async () => {
    fsat = makeFsat();

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ReactiveFormsModule],
      declarations: [SystemDataFormComponent, StubSettingsLabelPipe],
      providers: [HelpPanelService, ModifyConditionsService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('flags a flow rate opportunity when the modification flow rate differs from baseline', () => {
      createComponent({ modificationForm: makeFieldDataForm({ flowRate: 900 }) });
      expect(fsat.modifications[0].exploreOppsShowFlowRate.hasOpportunity).toBeTrue();
    });

    it('flags no flow rate opportunity when the modification flow rate matches baseline', () => {
      createComponent();
      expect(fsat.modifications[0].exploreOppsShowFlowRate.hasOpportunity).toBeFalse();
    });

    it('flags a pressure opportunity when the inlet pressure differs from baseline', () => {
      createComponent({ modificationForm: makeFieldDataForm({ inletPressure: -2 }) });
      expect(fsat.modifications[0].exploreOppsShowReducePressure.hasOpportunity).toBeTrue();
    });

    it('flags a pressure opportunity when the outlet pressure differs from baseline', () => {
      createComponent({ modificationForm: makeFieldDataForm({ outletPressure: 4 }) });
      expect(fsat.modifications[0].exploreOppsShowReducePressure.hasOpportunity).toBeTrue();
    });

    it('flags no pressure opportunity when both pressures match baseline', () => {
      createComponent();
      expect(fsat.modifications[0].exploreOppsShowReducePressure.hasOpportunity).toBeFalse();
    });

    it('flags an operational data opportunity when only the cost differs', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm({ cost: 0.05 }) });
      expect(component.showCost).toBeTrue();
      expect(component.showOperatingHours).toBeFalse();
      expect(fsat.modifications[0].exploreOppsShowOpData.hasOpportunity).toBeTrue();
    });

    it('flags an operational data opportunity when only the operating hours differ', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm({ operatingHours: 7000 }) });
      expect(component.showCost).toBeFalse();
      expect(component.showOperatingHours).toBeTrue();
      expect(fsat.modifications[0].exploreOppsShowOpData.hasOpportunity).toBeTrue();
    });

    it('flags no operational data opportunity when cost and operating hours match baseline', () => {
      createComponent();
      expect(fsat.modifications[0].exploreOppsShowOpData.hasOpportunity).toBeFalse();
    });

    it('re-evaluates opportunities when isVFD changes after the first change detection', () => {
      const modificationForm: UntypedFormGroup = makeFieldDataForm();
      createComponent({ modificationForm });
      expect(fsat.modifications[0].exploreOppsShowFlowRate.hasOpportunity).toBeFalse();

      modificationForm.controls.flowRate.setValue(900);
      fixture.componentRef.setInput('isVFD', true);
      fixture.detectChanges();

      expect(fsat.modifications[0].exploreOppsShowFlowRate.hasOpportunity).toBeTrue();
    });

    it('re-evaluates opportunities when exploreModIndex changes after the first change detection', () => {
      const modificationForm: UntypedFormGroup = makeFieldDataForm();
      createComponent({ modificationForm });
      fsat.modifications.push(JSON.parse(JSON.stringify(fsat.modifications[0])));

      modificationForm.controls.flowRate.setValue(900);
      fixture.componentRef.setInput('exploreModIndex', 1);
      fixture.detectChanges();

      expect(fsat.modifications[1].exploreOppsShowFlowRate.hasOpportunity).toBeTrue();
    });
  });

  describe('template visibility: flow rate and pressure checkboxes', () => {
    it('shows the flow rate and pressure checkboxes with their display text when isVFD is false', () => {
      createComponent({ isVFD: false });
      expect(fixture.nativeElement.querySelector('#modifyFlowRate')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('#modifyPressure')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('label[for="modifyFlowRate"]').textContent).toContain('Reduce System Flow Rate');
      expect(fixture.nativeElement.querySelector('label[for="modifyPressure"]').textContent).toContain('Reduce System Pressure');
    });

    it('hides the flow rate and pressure checkboxes when isVFD is true', () => {
      createComponent({ isVFD: true });
      expect(fixture.nativeElement.querySelector('#modifyFlowRate')).toBeNull();
      expect(fixture.nativeElement.querySelector('#modifyPressure')).toBeNull();
    });
  });

  describe('template visibility: flow rate item', () => {
    it('hides the flow rate item when there is no flow rate opportunity', () => {
      createComponent();
      expect(getFlowItem()).toBeNull();
    });

    it('shows the flow rate item when there is a flow rate opportunity and isVFD is false', () => {
      createComponent({ modificationForm: makeFieldDataForm({ flowRate: 900 }) });
      expect(getFlowItem()).not.toBeNull();
      expect(getFlowItem().querySelectorAll('form').length).toBe(2);
    });

    it('hides the flow rate item when there is a flow rate opportunity but isVFD is true', () => {
      createComponent({ modificationForm: makeFieldDataForm({ flowRate: 900 }), isVFD: true });
      expect(fsat.modifications[0].exploreOppsShowFlowRate.hasOpportunity).toBeTrue();
      expect(getFlowItem()).toBeNull();
    });

    it('hides flow rate errors when both values are valid', () => {
      createComponent({ modificationForm: makeFieldDataForm({ flowRate: 900 }) });
      expect(getFlowItem().querySelector('.alert-danger')).toBeNull();
    });

    it('hides flow rate errors when the values are invalid but pristine', () => {
      createComponent({ baselineForm: makeFieldDataForm({ flowRate: null }), modificationForm: makeFieldDataForm({ flowRate: -1 }) });
      expect(getFlowItem().querySelector('.alert-danger')).toBeNull();
    });

    it('shows only "Value Required" for the baseline flow rate when it is empty and dirty', () => {
      createComponent({ baselineForm: dirty(makeFieldDataForm({ flowRate: null }), 'flowRate'), modificationForm: makeFieldDataForm({ flowRate: 900 }) });
      const errors: string[] = getErrors(getForm(getFlowItem(), 'baseline'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(REQUIRED_MESSAGE);
      expect(getErrors(getForm(getFlowItem(), 'modification'))).toEqual([]);
    });

    it('shows only the min message for the baseline flow rate when below minimum and dirty', () => {
      createComponent({ baselineForm: dirty(makeFieldDataForm({ flowRate: -1 }), 'flowRate'), modificationForm: makeFieldDataForm({ flowRate: 900 }) });
      const errors: string[] = getErrors(getForm(getFlowItem(), 'baseline'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(MIN_MESSAGE);
    });

    it('shows only "Value Required" for the modification flow rate when it is empty and dirty', () => {
      createComponent({ modificationForm: dirty(makeFieldDataForm({ flowRate: null }), 'flowRate') });
      const errors: string[] = getErrors(getForm(getFlowItem(), 'modification'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(REQUIRED_MESSAGE);
      expect(getErrors(getForm(getFlowItem(), 'baseline'))).toEqual([]);
    });

    it('shows only the min message for the modification flow rate when below minimum and dirty', () => {
      createComponent({ modificationForm: dirty(makeFieldDataForm({ flowRate: -1 }), 'flowRate') });
      const errors: string[] = getErrors(getForm(getFlowItem(), 'modification'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(MIN_MESSAGE);
    });
  });

  describe('template visibility: pressure items', () => {
    it('hides the inlet and outlet pressure items when there is no pressure opportunity', () => {
      createComponent();
      expect(getInletItem()).toBeNull();
      expect(getOutletItem()).toBeNull();
    });

    it('shows the inlet and outlet pressure items when there is a pressure opportunity and isVFD is false', () => {
      createComponent({ modificationForm: makeFieldDataForm({ inletPressure: -2 }) });
      expect(getInletItem()).not.toBeNull();
      expect(getOutletItem()).not.toBeNull();
    });

    it('hides the inlet and outlet pressure items when there is a pressure opportunity but isVFD is true', () => {
      createComponent({ modificationForm: makeFieldDataForm({ inletPressure: -2 }), isVFD: true });
      expect(fsat.modifications[0].exploreOppsShowReducePressure.hasOpportunity).toBeTrue();
      expect(getInletItem()).toBeNull();
      expect(getOutletItem()).toBeNull();
    });

    it('hides the baseline inlet pressure error when it is invalid but pristine', () => {
      createComponent({ baselineForm: makeFieldDataForm({ inletPressure: null }), modificationForm: makeFieldDataForm({ inletPressure: -2 }) });
      expect(getInletItem().querySelector('.alert-danger')).toBeNull();
    });

    it('hides the modification inlet pressure error when it is invalid but pristine', () => {
      createComponent({ modificationForm: makeFieldDataForm({ inletPressure: null }) });
      expect(getInletItem().querySelector('.alert-danger')).toBeNull();
    });

    it('shows "Value Required" for only the baseline inlet pressure when it is empty and dirty', () => {
      createComponent({ baselineForm: dirty(makeFieldDataForm({ inletPressure: null }), 'inletPressure'), modificationForm: makeFieldDataForm({ inletPressure: -2 }) });
      expect(getErrors(getForm(getInletItem(), 'baseline')).length).toBe(1);
      expect(getErrors(getForm(getInletItem(), 'baseline'))[0]).toContain(REQUIRED_MESSAGE);
      expect(getErrors(getForm(getInletItem(), 'modification'))).toEqual([]);
    });

    it('shows "Value Required" for only the modification inlet pressure when it is empty and dirty', () => {
      createComponent({ modificationForm: dirty(makeFieldDataForm({ inletPressure: null }), 'inletPressure') });
      expect(getErrors(getForm(getInletItem(), 'modification')).length).toBe(1);
      expect(getErrors(getForm(getInletItem(), 'modification'))[0]).toContain(REQUIRED_MESSAGE);
      expect(getErrors(getForm(getInletItem(), 'baseline'))).toEqual([]);
    });

    it('hides outlet pressure errors and warnings when the values are valid and no warning exists', () => {
      createComponent({ modificationForm: makeFieldDataForm({ outletPressure: 4 }) });
      expect(getOutletItem().querySelector('.alert-danger')).toBeNull();
      expect(getOutletItem().querySelector('.alert-warning')).toBeNull();
    });

    it('hides outlet pressure errors when the values are invalid but pristine', () => {
      createComponent({ baselineForm: makeFieldDataForm({ outletPressure: null }), modificationForm: makeFieldDataForm({ outletPressure: -3 }) });
      expect(getOutletItem().querySelector('.alert-danger')).toBeNull();
    });

    it('shows "Value Required" and no warning for the baseline outlet pressure when it is empty and dirty', () => {
      createComponent({
        baselineForm: dirty(makeFieldDataForm({ outletPressure: null }), 'outletPressure'),
        modificationForm: makeFieldDataForm({ outletPressure: 4 }),
        baselineWarnings: makeFieldDataWarnings('Baseline outlet warning'),
      });
      const form: HTMLElement = getForm(getOutletItem(), 'baseline');
      expect(getErrors(form).length).toBe(1);
      expect(getErrors(form)[0]).toContain(REQUIRED_MESSAGE);
      expect(getWarning(form)).toBeNull();
    });

    it('shows the baseline outlet warning message when a warning exists and the control is valid and dirty', () => {
      createComponent({
        baselineForm: dirty(makeFieldDataForm(), 'outletPressure'),
        modificationForm: makeFieldDataForm({ outletPressure: 4 }),
        baselineWarnings: makeFieldDataWarnings('Baseline outlet warning'),
      });
      const warning: HTMLElement = getWarning(getForm(getOutletItem(), 'baseline'));
      expect(warning).not.toBeNull();
      expect(warning.textContent).toContain('Baseline outlet warning');
    });

    it('hides the baseline outlet warning when the control is pristine', () => {
      createComponent({
        modificationForm: makeFieldDataForm({ outletPressure: 4 }),
        baselineWarnings: makeFieldDataWarnings('Baseline outlet warning'),
      });
      expect(getWarning(getForm(getOutletItem(), 'baseline'))).toBeNull();
    });

    it('shows only "Value Required" for the modification outlet pressure when it is empty and dirty', () => {
      createComponent({ modificationForm: dirty(makeFieldDataForm({ outletPressure: null }), 'outletPressure') });
      const errors: string[] = getErrors(getForm(getOutletItem(), 'modification'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(REQUIRED_MESSAGE);
      expect(getErrors(getForm(getOutletItem(), 'baseline'))).toEqual([]);
    });

    it('shows only the "usually not less than zero" message for the modification outlet pressure when below minimum and dirty', () => {
      createComponent({ modificationForm: dirty(makeFieldDataForm({ outletPressure: -3 }), 'outletPressure') });
      const errors: string[] = getErrors(getForm(getOutletItem(), 'modification'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('Outlet pressure is usually not less than zero');
    });
  });

  describe('template visibility: operational data checkbox and items', () => {
    it('always shows the operational data checkbox, even without an opportunity or when isVFD is true', () => {
      createComponent({ isVFD: true });
      expect(fixture.nativeElement.querySelector('#showSystemData')).not.toBeNull();
    });

    it('hides the cost and operating hours items when there is no operational data opportunity', () => {
      createComponent();
      expect(getCostItem()).toBeNull();
      expect(getHoursItem()).toBeNull();
    });

    it('shows the cost and operating hours items when there is an operational data opportunity', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm({ cost: 0.05 }) });
      expect(getCostItem()).not.toBeNull();
      expect(getHoursItem()).not.toBeNull();
    });

    it('shows the cost and operating hours items regardless of isVFD', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm({ cost: 0.05 }), isVFD: true });
      expect(getCostItem()).not.toBeNull();
      expect(getHoursItem()).not.toBeNull();
    });
  });

  describe('template visibility: cost errors and warnings', () => {
    const costOverride: OperationsValues = { cost: 0.05 };

    it('hides cost errors and warnings when the values are valid and no warning exists', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm(costOverride) });
      expect(getCostItem().querySelector('.alert-danger')).toBeNull();
      expect(getCostItem().querySelector('.alert-warning')).toBeNull();
    });

    it('hides cost errors when the values are invalid but pristine', () => {
      createComponent({ baselineOperationsForm: makeOperationsForm({ cost: null }), modificationOperationsForm: makeOperationsForm({ cost: -1 }) });
      expect(getCostItem().querySelector('.alert-danger')).toBeNull();
    });

    it('shows only "Value Required" for the baseline cost when it is empty and dirty', () => {
      createComponent({ baselineOperationsForm: dirty(makeOperationsForm({ cost: null }), 'cost'), modificationOperationsForm: makeOperationsForm(costOverride) });
      const errors: string[] = getErrors(getForm(getCostItem(), 'baseline'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(REQUIRED_MESSAGE);
      expect(getErrors(getForm(getCostItem(), 'modification'))).toEqual([]);
    });

    it('shows only the min message for the baseline cost when below minimum and dirty', () => {
      createComponent({ baselineOperationsForm: dirty(makeOperationsForm({ cost: -1 }), 'cost'), modificationOperationsForm: makeOperationsForm(costOverride) });
      const errors: string[] = getErrors(getForm(getCostItem(), 'baseline'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(MIN_MESSAGE);
    });

    it('shows only "Value Required" for the modification cost when it is empty and dirty', () => {
      createComponent({ modificationOperationsForm: dirty(makeOperationsForm({ cost: null }), 'cost') });
      const errors: string[] = getErrors(getForm(getCostItem(), 'modification'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(REQUIRED_MESSAGE);
      expect(getErrors(getForm(getCostItem(), 'baseline'))).toEqual([]);
    });

    it('shows only the min message for the modification cost when below minimum and dirty', () => {
      createComponent({ modificationOperationsForm: dirty(makeOperationsForm({ cost: -1 }), 'cost') });
      const errors: string[] = getErrors(getForm(getCostItem(), 'modification'));
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain(MIN_MESSAGE);
    });

    it('shows the baseline cost warning only when a warning exists and the control is valid and dirty', () => {
      createComponent({
        baselineOperationsForm: makeOperationsForm(),
        modificationOperationsForm: makeOperationsForm(costOverride),
        baselineOperationsWarnings: makeOperationsWarnings('Baseline cost warning'),
      });
      expect(getWarning(getForm(getCostItem(), 'baseline'))).toBeNull();

      component.baselineOperationsForm.controls.cost.markAsDirty();
      fixture.detectChanges();

      expect(getWarning(getForm(getCostItem(), 'baseline')).textContent).toContain('Baseline cost warning');
      expect(getWarning(getForm(getCostItem(), 'modification'))).toBeNull();
    });

    it('shows the modification cost warning only when a warning exists and the control is valid and dirty', () => {
      createComponent({
        modificationOperationsForm: makeOperationsForm(costOverride),
        modificationOperationsWarnings: makeOperationsWarnings('Modification cost warning'),
      });
      expect(getWarning(getForm(getCostItem(), 'modification'))).toBeNull();

      component.modificationOperationsForm.controls.cost.markAsDirty();
      fixture.detectChanges();

      expect(getWarning(getForm(getCostItem(), 'modification')).textContent).toContain('Modification cost warning');
      expect(getWarning(getForm(getCostItem(), 'baseline'))).toBeNull();
    });

    it('hides the cost warning when the control is invalid', () => {
      createComponent({
        modificationOperationsForm: dirty(makeOperationsForm({ cost: -1 }), 'cost'),
        modificationOperationsWarnings: makeOperationsWarnings('Modification cost warning'),
      });
      expect(getWarning(getForm(getCostItem(), 'modification'))).toBeNull();
    });
  });

  describe('template visibility: operating hours errors', () => {
    const hoursOverride: OperationsValues = { operatingHours: 7000 };

    it('hides operating hours errors when the values are valid', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm(hoursOverride) });
      expect(getHoursItem().querySelector('.alert-danger')).toBeNull();
    });

    it('hides operating hours errors when the values are invalid but pristine', () => {
      createComponent({ baselineOperationsForm: makeOperationsForm({ operatingHours: null }), modificationOperationsForm: makeOperationsForm({ operatingHours: 9000 }) });
      expect(getHoursItem().querySelector('.alert-danger')).toBeNull();
    });

    const hoursErrorCases: Array<{ description: string, value: number | null, message: string }> = [
      { description: 'is empty', value: null, message: REQUIRED_MESSAGE },
      { description: 'exceeds the maximum', value: 9000, message: MAX_MESSAGE },
      { description: 'is below the minimum', value: -1, message: MIN_MESSAGE },
    ];

    hoursErrorCases.forEach(({ description, value, message }) => {
      it(`shows only the "${message}" baseline error when the baseline operating hours ${description} and is dirty`, () => {
        createComponent({
          baselineOperationsForm: dirty(makeOperationsForm({ operatingHours: value }), 'operatingHours'),
          modificationOperationsForm: makeOperationsForm(hoursOverride),
        });
        const errors: string[] = getErrors(getForm(getHoursItem(), 'baseline'));
        expect(errors.length).toBe(1);
        expect(errors[0]).toContain(message);
        expect(getErrors(getForm(getHoursItem(), 'modification'))).toEqual([]);
      });

      it(`shows only the "${message}" modification error when the modification operating hours ${description} and is dirty`, () => {
        createComponent({ modificationOperationsForm: dirty(makeOperationsForm({ operatingHours: value }), 'operatingHours') });
        const errors: string[] = getErrors(getForm(getHoursItem(), 'modification'));
        expect(errors.length).toBe(1);
        expect(errors[0]).toContain(message);
        expect(getErrors(getForm(getHoursItem(), 'baseline'))).toEqual([]);
      });
    });
  });

  describe('operating hours modal', () => {
    const hoursOverride: OperationsValues = { operatingHours: 7000 };

    it('hides the operating hours modal initially', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm(hoursOverride) });
      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).toBeNull();
    });

    it('shows the operating hours modal after the calculator link is clicked', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm(hoursOverride) });

      getHoursItem().querySelector<HTMLElement>('a.click-link').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).not.toBeNull();
    });

    it('hides the operating hours modal after it is closed', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm(hoursOverride) });
      component.openOperatingHoursModal();
      fixture.detectChanges();

      component.closeOperatingHoursModal();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).toBeNull();
    });

    it('saves the selected operating hours, emits, and hides the modal', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm(hoursOverride) });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));
      component.openOperatingHoursModal();
      fixture.detectChanges();
      const selectedHours: OperatingHours = { hoursPerYear: 6500, daysPerWeek: 5 };

      component.updateOperatingHours(selectedHours);
      fixture.detectChanges();

      expect(fsat.modifications[0].fsat.operatingHours).toBe(selectedHours);
      expect(component.modificationOperationsForm.controls.operatingHours.value).toBe(6500);
      expect(emitted).toEqual([true]);
      expect(fixture.nativeElement.querySelector('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('toggleFlowRate', () => {
    it('resets the modification flow rate to baseline and emits when the opportunity is unchecked', () => {
      createComponent({ modificationForm: makeFieldDataForm({ flowRate: 900 }) });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      fsat.modifications[0].exploreOppsShowFlowRate.hasOpportunity = false;
      component.toggleFlowRate();

      expect(component.modificationForm.controls.flowRate.value).toBe(1000);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when the opportunity is checked', () => {
      createComponent({ modificationForm: makeFieldDataForm({ flowRate: 900 }) });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.toggleFlowRate();

      expect(component.modificationForm.controls.flowRate.value).toBe(900);
      expect(emitted).toEqual([]);
    });
  });

  describe('togglePressure', () => {
    it('resets the modification pressures to baseline and emits when the opportunity is unchecked', () => {
      createComponent({ modificationForm: makeFieldDataForm({ inletPressure: -2, outletPressure: 4 }) });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      fsat.modifications[0].exploreOppsShowReducePressure.hasOpportunity = false;
      component.togglePressure();

      expect(component.modificationForm.controls.inletPressure.value).toBe(-1);
      expect(component.modificationForm.controls.outletPressure.value).toBe(5);
      expect(emitted).toEqual([true]);
    });

    it('does nothing when the opportunity is checked', () => {
      createComponent({ modificationForm: makeFieldDataForm({ inletPressure: -2, outletPressure: 4 }) });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.togglePressure();

      expect(component.modificationForm.controls.inletPressure.value).toBe(-2);
      expect(emitted).toEqual([]);
    });
  });

  describe('toggleSystemData', () => {
    it('resets the modification cost and operating hours to baseline and emits once per field when unchecked', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm({ cost: 0.05, operatingHours: 7000 }) });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      fsat.modifications[0].exploreOppsShowOpData.hasOpportunity = false;
      component.toggleSystemData();

      expect(component.modificationOperationsForm.controls.cost.value).toBe(0.06);
      expect(component.modificationOperationsForm.controls.operatingHours.value).toBe(8000);
      expect(component.showCost).toBeFalse();
      expect(component.showOperatingHours).toBeFalse();
      expect(emitted).toEqual([true, true]);
    });

    it('does nothing when the opportunity is checked', () => {
      createComponent({ modificationOperationsForm: makeOperationsForm({ cost: 0.05, operatingHours: 7000 }) });
      const emitted: boolean[] = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));

      component.toggleSystemData();

      expect(component.modificationOperationsForm.controls.cost.value).toBe(0.05);
      expect(component.modificationOperationsForm.controls.operatingHours.value).toBe(7000);
      expect(emitted).toEqual([]);
    });
  });

  describe('pressure modal links', () => {
    beforeEach(() => createComponent({ modificationForm: makeFieldDataForm({ inletPressure: -2 }) }));

    it('emits showPressureModal with "inlet" when Estimate Inlet Pressure is clicked', () => {
      const emitted: string[] = [];
      component.showPressureModal.subscribe((value: string) => emitted.push(value));

      getInletItem().querySelector<HTMLElement>('a.click-link').click();

      expect(emitted).toEqual(['inlet']);
    });

    it('emits showPressureModal with "outlet" when Estimate Outlet Pressure is clicked', () => {
      const emitted: string[] = [];
      component.showPressureModal.subscribe((value: string) => emitted.push(value));

      getOutletItem().querySelector<HTMLElement>('a.click-link').click();

      expect(emitted).toEqual(['outlet']);
    });
  });
});
