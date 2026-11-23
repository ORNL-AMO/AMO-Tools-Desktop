import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { PipeInsulationReductionFormComponent } from './pipe-insulation-reduction-form.component';
import { PipeInsulationReductionService } from '../pipe-insulation-reduction.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { PipeInsulationReductionInput } from '../../../../shared/models/standalone';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial', fuelCost: 3.99, otherFuelCost: 5.5, electricityCost: 0.066 } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric', fuelCost: 3.99, otherFuelCost: 5.5, electricityCost: 0.066 } as Settings;

function makeInput(service: PipeInsulationReductionService, overrides: Partial<PipeInsulationReductionInput> = {}): PipeInsulationReductionInput {
  return {
    ...service.initObject(IMPERIAL_SETTINGS, undefined),
    pipeLength: 100,
    pipeTemperature: 300,
    ambientTemperature: 70,
    windVelocity: 2,
    systemEfficiency: 80,
    pipeEmissivity: 1,
    jacketEmissivity: 2,
    ...overrides
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('PipeInsulationReductionFormComponent', () => {
  let component: PipeInsulationReductionFormComponent;
  let fixture: ComponentFixture<PipeInsulationReductionFormComponent>;
  let service: PipeInsulationReductionService;
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
    return Array.from(query('#' + inputId).closest('.input-group').querySelectorAll('.units'))
      .map((unit: HTMLElement) => normalize(unit.textContent));
  }

  function createComponent(options: { isBaseline?: boolean, settings?: Settings, input?: Partial<PipeInsulationReductionInput> } = {}): void {
    const isBaseline = options.isBaseline ?? true;
    const settings = options.settings ?? IMPERIAL_SETTINGS;
    const data = makeInput(service, options.input);
    service.baselineData = data;
    service.modificationData = makeInput(service, { ...options.input, pipeEmissivity: 3, jacketEmissivity: 4 });
    form = service.getFormFromObj(isBaseline ? service.baselineData : service.modificationData, settings, isBaseline);
    fixture = TestBed.createComponent(PipeInsulationReductionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('isBaseline', isBaseline);
    fixture.componentRef.setInput('selected', true);
    fixture.detectChanges();
  }

  function setErrors(controlName: string, errors: ValidationErrors): void {
    form.controls[controlName].enable();
    form.controls[controlName].setErrors(errors);
    form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [PipeInsulationReductionFormComponent],
      providers: [
        PipeInsulationReductionService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: StandaloneService, useValue: jasmine.createSpyObj('StandaloneService', ['pipeInsulationReduction']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    service = TestBed.inject(PipeInsulationReductionService);
  });

  describe('initialization', () => {
    it('sets the baseline id string and energy unit', () => {
      createComponent();
      expect(component.idString).toBe('baseline');
      expect(component.energyUnit).toBe('MMBtu');
      expect(query('#operatingHours_baseline')).not.toBeNull();
    });

    it('sets the modification id string for a modification form', () => {
      createComponent({ isBaseline: false });
      expect(component.idString).toBe('modification');
      expect(query('#operatingHours_modification')).not.toBeNull();
    });
  });

  describe('option lists', () => {
    beforeEach(() => createComponent());

    it('renders the utility, heated/chilled, base material, insulation and jacket options', () => {
      expect(optionTexts('#utilityType_baseline')).toEqual(component.utilityOptions.map(o => o.name));
      expect(optionTexts('#heatedOrChilled_baseline')).toEqual(['Heated', 'Chilled']);
      expect(optionTexts('#pipeBaseMaterialSelection_baseline')).toEqual(component.pipeBaseMaterials.map(o => o.name));
      expect(optionTexts('#insulationMaterialSelection_baseline')).toEqual(component.insulationMaterials.map(o => o.name));
      expect(optionTexts('#pipeJacketMaterialSelection_baseline')).toEqual(component.pipeJacketMaterials.map(o => o.name));
    });

    it('renders the imperial pipe diameter list', () => {
      const options = optionTexts('#pipeDiameterSelection_baseline');
      expect(options.length).toBe(27);
      expect(options[0]).toBe('0.25 in');
      expect(options[26]).toBe('42 in');
    });

    it('renders the metric pipe diameter list', () => {
      fixture.destroy();
      createComponent({ settings: METRIC_SETTINGS });
      const options = optionTexts('#pipeDiameterSelection_baseline');
      expect(options.length).toBe(27);
      expect(options[0]).toBe('8 mm');
      expect(options[26]).toBe('1050 mm');
    });
  });

  describe('unit labels', () => {
    const CASES: Array<{ id: string, imperial: string, metric: string, input?: Partial<PipeInsulationReductionInput> }> = [
      { id: 'pipeLength', imperial: 'ft', metric: 'm' },
      { id: 'windVelocity', imperial: 'mph', metric: 'm/s' },
      { id: 'pipeTemperature', imperial: '℉', metric: '℃' },
      { id: 'ambientTemperature', imperial: '℉', metric: '℃' },
      { id: 'insulationThickness', imperial: 'in', metric: 'm', input: { insulationMaterialSelection: 1, insulationThickness: 2 } },
    ];

    CASES.forEach(c => {
      it(`shows only the imperial ${c.id} unit for imperial settings`, () => {
        createComponent({ input: c.input });
        expect(getUnits(c.id + '_baseline')).toEqual([c.imperial]);
      });

      it(`shows only the metric ${c.id} unit for metric settings`, () => {
        createComponent({ settings: METRIC_SETTINGS, input: c.input });
        expect(getUnits(c.id + '_baseline')).toEqual([c.metric]);
      });
    });
  });

  describe('error messages', () => {
    const CASES: Array<{ control: string, errors: ValidationErrors, expected: Array<string>, input?: Partial<PipeInsulationReductionInput> }> = [
      { control: 'operatingHours', errors: { required: true }, expected: ['Value required.'] },
      { control: 'operatingHours', errors: { max: { max: 8760 } }, expected: ["Value can't be greater than 8760."] },
      { control: 'operatingHours', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."] },
      { control: 'utilityCost', errors: { required: true }, expected: ['Value required.'] },
      { control: 'utilityCost', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."] },
      { control: 'systemEfficiency', errors: { required: true }, expected: ['Value required.'] },
      { control: 'systemEfficiency', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."] },
      { control: 'systemEfficiency', errors: { max: { max: 100 } }, expected: ["Value can't be more than 100."] },
      { control: 'pipeLength', errors: { required: true }, expected: ['Value required.'] },
      { control: 'pipeLength', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."] },
      { control: 'windVelocity', errors: { required: true }, expected: ['Value required.'] },
      { control: 'windVelocity', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."] },
      { control: 'pipeTemperature', errors: { required: true }, expected: ['Value required.'] },
      { control: 'pipeTemperature', errors: { min: { min: -200 } }, expected: ["Value can't be less than -200."] },
      { control: 'pipeTemperature', errors: { max: { max: 1700 } }, expected: ["Value can't be greater than 1700."] },
      { control: 'ambientTemperature', errors: { required: true }, expected: ['Value required.'] },
      { control: 'ambientTemperature', errors: { min: { min: -50 } }, expected: ["Value can't be less than -50."] },
      { control: 'insulationThickness', errors: { required: true }, expected: ['Value required.'], input: { insulationMaterialSelection: 1, insulationThickness: 2 } },
      { control: 'insulationThickness', errors: { min: { min: 0 } }, expected: ["Value can't be less than 0."], input: { insulationMaterialSelection: 1, insulationThickness: 2 } },
      { control: 'insulationThickness', errors: { max: { max: 1000000 } }, expected: ["Value can't be more than 1000000."], input: { insulationMaterialSelection: 1, insulationThickness: 2 } },
    ];

    CASES.forEach(c => {
      it(`shows ${JSON.stringify(c.expected)} for ${c.control} errors ${Object.keys(c.errors)}`, () => {
        createComponent({ input: c.input });
        setErrors(c.control, c.errors);
        expect(getErrorMessages(c.control + '_baseline')).toEqual(c.expected);
      });
    });

    ['operatingHours', 'utilityCost', 'systemEfficiency', 'pipeLength', 'windVelocity', 'pipeTemperature', 'ambientTemperature'].forEach(control => {
      it(`hides the ${control} error container when valid`, () => {
        createComponent();
        expect(getErrorContainer(control + '_baseline')).toBeNull();
      });

      it(`hides the ${control} error container when invalid but pristine`, () => {
        createComponent();
        form.controls[control].enable();
        form.controls[control].setErrors({ required: true });
        fixture.detectChanges();
        expect(getErrorContainer(control + '_baseline')).toBeNull();
      });
    });
  });

  describe('average temperature alert', () => {
    function alertBox(): HTMLElement | null {
      return query('.alert.alert-danger');
    }

    it('hides the alert when the average temperature has no errors', () => {
      createComponent();
      expect(alertBox()).toBeNull();
    });

    it('shows the alert with the imperial max message', () => {
      createComponent();
      form.controls.averageTemperature.setErrors({ max: { max: 206 } });
      fixture.detectChanges();
      expect(normalize(alertBox().textContent)).toBe(
        'The average of the ambient temperature and pipe temperature must be less than 206 ℉ for the selected insulation material.');
    });

    it('shows the alert with the metric unit', () => {
      createComponent({ settings: METRIC_SETTINGS });
      form.controls.averageTemperature.setErrors({ max: { max: 97 } });
      fixture.detectChanges();
      expect(normalize(alertBox().textContent)).toContain('must be less than 97 ℃ for the selected');
    });

    it('shows an empty alert box when errors exist but none is max', () => {
      createComponent();
      form.controls.averageTemperature.setErrors({ other: true });
      fixture.detectChanges();
      expect(alertBox()).not.toBeNull();
      expect(normalize(alertBox().textContent)).toBe('');
    });
  });

  describe('insulation thickness visibility', () => {
    it('hides insulation thickness when the insulation material is None', () => {
      createComponent();
      expect(query('#insulationThickness_baseline')).toBeNull();
    });

    it('shows insulation thickness when an insulation material is selected', () => {
      createComponent({ input: { insulationMaterialSelection: 2, insulationThickness: 1 } });
      expect(query('#insulationThickness_baseline')).not.toBeNull();
    });

    it('shows insulation thickness but no error container when it is valid', () => {
      createComponent({ input: { insulationMaterialSelection: 2, insulationThickness: 1 } });
      expect(getErrorContainer('insulationThickness_baseline')).toBeNull();
    });

    it('toggles visibility when the material changes', () => {
      createComponent();
      form.controls.insulationMaterialSelection.setValue(3);
      fixture.detectChanges();
      expect(query('#insulationThickness_baseline')).not.toBeNull();
      form.controls.insulationMaterialSelection.setValue(0);
      fixture.detectChanges();
      expect(query('#insulationThickness_baseline')).toBeNull();
    });
  });

  describe('emissivity display', () => {
    function emissivityValues(): Array<string> {
      return Array.from(fixture.nativeElement.querySelectorAll('.row .col-6.text-center span.small.bold'))
        .map((span: HTMLElement) => normalize(span.textContent));
    }

    it('shows the baseline pipe and jacket emissivity for the baseline form', () => {
      createComponent();
      expect(emissivityValues()).toEqual(['1', '2']);
    });

    it('shows the modification pipe emissivity in both rows for the modification form', () => {
      createComponent({ isBaseline: false });
      expect(emissivityValues()).toEqual(['3', '3']);
    });
  });

  describe('operating hours modal', () => {
    beforeEach(() => createComponent());

    it('is hidden by default', () => {
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('is shown after opening and hidden after closing', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('saves the operating hours, recalculates and closes', () => {
      const emitted: Array<boolean> = [];
      component.emitCalculate.subscribe(v => emitted.push(v));
      component.openOperatingHoursModal();
      component.updateOperatingHours({ hoursPerYear: 4000 } as any);
      expect(service.operatingHours).toEqual({ hoursPerYear: 4000 } as any);
      expect(form.controls.operatingHours.value).toBe(4000);
      expect(service.baselineData.operatingHours).toBe(4000);
      expect(emitted).toEqual([true]);
      expect(component.showOperatingHoursModal).toBe(false);
    });
  });

  describe('calculation', () => {
    it('stores baseline data and emits when the form is valid', () => {
      createComponent();
      const emitted: Array<boolean> = [];
      component.emitCalculate.subscribe(v => emitted.push(v));
      form.controls.pipeLength.setValue(250);
      component.calculate();
      expect(service.baselineData.pipeLength).toBe(250);
      expect(emitted).toEqual([true]);
    });

    it('stores modification data when not baseline', () => {
      createComponent({ isBaseline: false });
      form.controls.pipeLength.setValue(42);
      component.calculate();
      expect(service.modificationData.pipeLength).toBe(42);
    });

    it('does not emit when the form is invalid', () => {
      createComponent();
      const emitted: Array<boolean> = [];
      component.emitCalculate.subscribe(v => emitted.push(v));
      form.controls.pipeLength.setValue(null);
      component.calculate();
      expect(emitted).toEqual([]);
      expect(service.baselineData.pipeLength).toBe(100);
    });
  });

  describe('user actions', () => {
    it('emits the focused field', () => {
      createComponent();
      const emitted: Array<string> = [];
      component.emitChangeField.subscribe(v => emitted.push(v));
      component.focusField('pipeLength');
      expect(emitted).toEqual(['pipeLength']);
    });

    const UTILITY_CASES: Array<{ type: number, cost: number, unit: string }> = [
      { type: 0, cost: 3.99, unit: 'MMBtu' },
      { type: 1, cost: 5.5, unit: 'MMBtu' },
      { type: 2, cost: 0.066, unit: 'kWh' },
    ];
    UTILITY_CASES.forEach(c => {
      it(`sets utility cost ${c.cost} and unit ${c.unit} for utility type ${c.type}`, () => {
        createComponent();
        form.controls.utilityType.setValue(c.type);
        component.changeUtilityType();
        fixture.detectChanges();
        expect(form.controls.utilityCost.value).toBe(c.cost);
        expect(component.energyUnit).toBe(c.unit);
        expect(getUnits('utilityCost_baseline')).toEqual(['$/' + c.unit]);
      });
    });

    it('disables and resets the jacket material when insulation is set to None', () => {
      createComponent({ input: { insulationMaterialSelection: 2, pipeJacketMaterialSelection: 5 } });
      form.controls.insulationMaterialSelection.setValue(0);
      component.changeInsulationMaterial();
      expect(form.controls.pipeJacketMaterialSelection.value).toBe(0);
      expect(form.controls.pipeJacketMaterialSelection.disabled).toBe(true);
    });

    it('enables the jacket material when an insulation material is chosen', () => {
      createComponent();
      form.controls.insulationMaterialSelection.setValue(2);
      component.changeInsulationMaterial();
      expect(form.controls.pipeJacketMaterialSelection.enabled).toBe(true);
    });

    it('applies average temperature validation and shows the alert', () => {
      createComponent({ input: { insulationMaterialSelection: 6, insulationThickness: 1 } });
      form.controls.pipeTemperature.setValue(400);
      form.controls.ambientTemperature.setValue(100);
      component.updateAverageTempValidation();
      fixture.detectChanges();
      expect(form.controls.averageTemperature.value).toBe(250);
      expect(form.controls.averageTemperature.errors.max.max).toBe(206);
      expect(query('.alert.alert-danger')).not.toBeNull();
    });

    it('toggles the system efficiency max validator when heated/chilled changes', () => {
      createComponent();
      form.controls.systemEfficiency.setValue(150);
      form.controls.heatedOrChilled.setValue(1);
      component.updateHeatedOrChill();
      form.controls.systemEfficiency.updateValueAndValidity();
      expect(form.controls.systemEfficiency.valid).toBe(true);
      form.controls.heatedOrChilled.setValue(0);
      component.updateHeatedOrChill();
      form.controls.systemEfficiency.updateValueAndValidity();
      expect(form.controls.systemEfficiency.valid).toBe(false);
    });
  });

  describe('input changes', () => {
    it('patches utility type and cost from the baseline for a modification form', () => {
      createComponent({ isBaseline: false });
      fixture.componentRef.setInput('utilityType', 0);
      fixture.componentRef.setInput('utilityCost', 1);
      fixture.componentRef.setInput('heatedOrChilled', 0);
      fixture.detectChanges();
      fixture.componentRef.setInput('utilityType', 2);
      fixture.detectChanges();
      expect(form.controls.utilityType.value).toBe(2);
      expect(component.energyUnit).toBe('kWh');
      fixture.componentRef.setInput('utilityCost', 9);
      fixture.detectChanges();
      expect(form.controls.utilityCost.value).toBe(9);
      fixture.componentRef.setInput('heatedOrChilled', 1);
      fixture.detectChanges();
      expect(form.controls.heatedOrChilled.value).toBe(1);
    });
  });
});
