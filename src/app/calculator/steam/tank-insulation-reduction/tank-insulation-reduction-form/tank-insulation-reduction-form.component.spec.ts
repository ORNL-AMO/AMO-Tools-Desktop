import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { formatNumber } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TankInsulationReductionFormComponent } from './tank-insulation-reduction-form.component';
import { TankInsulationReductionService } from '../tank-insulation-reduction.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { TankInsulationReductionInput } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial', fuelCost: 3.99, otherFuelCost: 5, electricityCost: 0.066, energyResultUnit: 'MMBtu' } as Settings;
const METRIC_SETTINGS = { ...IMPERIAL_SETTINGS, unitsOfMeasure: 'Metric', energyResultUnit: 'GJ' } as Settings;

const IMPERIAL_CONDUCTIVITY_UNIT = 'Btu/(hr * ft * ℉)';

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function fmt(value: number): string {
  return formatNumber(value, 'en-US', '.0-6');
}

interface RenderOptions {
  settings?: Settings;
  isBaseline?: boolean;
  insulationMaterialSelection?: number;
  data?: Partial<TankInsulationReductionInput>;
}

describe('TankInsulationReductionFormComponent', () => {
  let component: TankInsulationReductionFormComponent;
  let fixture: ComponentFixture<TankInsulationReductionFormComponent>;
  let tankService: TankInsulationReductionService;

  function render(options: RenderOptions = {}): void {
    const settings = options.settings || IMPERIAL_SETTINGS;
    const isBaseline = options.isBaseline !== undefined ? options.isBaseline : true;
    tankService.baselineData = tankService.generateExample(IMPERIAL_SETTINGS, true);
    tankService.modificationData = tankService.generateExample(IMPERIAL_SETTINGS, false);
    tankService.modificationData.tankEmissivity = 0.123;
    tankService.modificationData.tankConductivity = 1.5;
    tankService.modificationData.insulationConductivity = 0.25;
    tankService.modificationData.jacketEmissivity = 0.456;
    const data = isBaseline ? tankService.baselineData : tankService.modificationData;
    if (options.insulationMaterialSelection !== undefined) {
      data.insulationMaterialSelection = options.insulationMaterialSelection;
    }
    Object.assign(data, options.data || {});

    fixture = TestBed.createComponent(TankInsulationReductionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('form', tankService.getFormFromObj(data, isBaseline));
    fixture.componentRef.setInput('isBaseline', isBaseline);
    fixture.componentRef.setInput('selected', true);
    fixture.componentRef.setInput('utilityType', 0);
    fixture.componentRef.setInput('heatedOrChilled', 0);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function inputExists(id: string): boolean {
    return query('#' + id) !== null;
  }

  function getFormGroup(inputId: string): HTMLElement {
    return query('#' + inputId).closest('.form-group');
  }

  function getErrorContainer(inputId: string): HTMLElement | null {
    return getFormGroup(inputId).querySelector('.alert-danger');
  }

  function getErrorMessages(inputId: string): Array<string> {
    const container = getErrorContainer(inputId);
    if (!container) {
      return [];
    }
    return Array.from(container.children).map((child: HTMLElement) => normalize(child.textContent));
  }

  function getWarning(inputId: string): string | null {
    const warning = getFormGroup(inputId).querySelector('.alert-warning');
    return warning ? normalize(warning.textContent) : null;
  }

  function getUnitAddons(inputId: string): Array<string> {
    return Array.from(query('#' + inputId).closest('.input-group').querySelectorAll('.input-group-addon:not(.op-hour-addon)'))
      .map((addon: HTMLElement) => normalize(addon.textContent));
  }

  function getRowValues(label: string): Array<string> {
    const rows: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('form .row'));
    return rows.filter(r => normalize(r.querySelector('label').textContent) === label)
      .map(r => normalize(r.querySelector('.text-center').textContent));
  }

  function setDirtyValue(controlName: string, value: any): void {
    component.form.controls[controlName].setValue(value);
    component.form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TankInsulationReductionFormComponent],
      providers: [
        ConvertUnitsService,
        { provide: StandaloneService, useValue: jasmine.createSpyObj('StandaloneService', ['tankInsulationReduction']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    tankService = TestBed.inject(TankInsulationReductionService);
  });

  describe('initialization', () => {
    it('sets the baseline id string and energy unit', () => {
      spyOn(tankService, 'getEnergyUnit').and.callThrough();
      render({ isBaseline: true });
      expect(component.idString).toBe('baseline');
      expect(tankService.getEnergyUnit).toHaveBeenCalledWith(0, IMPERIAL_SETTINGS);
      expect(component.energyUnit).toBe('MMBtu');
    });

    it('sets the modification id string', () => {
      render({ isBaseline: false });
      expect(component.idString).toBe('modification');
    });

    it('sets the electricity energy unit for an electricity utility', () => {
      render({ data: { utilityType: 2 } });
      expect(component.energyUnit).toBe('kWh');
    });
  });

  describe('input changes', () => {
    it('patches the utility type and recalculates when the utility type input changes', () => {
      render({ isBaseline: false });
      const emitted: Array<boolean> = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));
      fixture.componentRef.setInput('utilityType', 2);
      fixture.detectChanges();
      expect(component.form.controls.utilityType.value).toBe(2);
      expect(component.form.controls.utilityCost.value).toBe(0.066);
      expect(component.energyUnit).toBe('kWh');
      expect(emitted).toEqual([true]);
    });

    it('patches heated/chilled and updates system efficiency validators when the input changes', () => {
      render({ isBaseline: false });
      fixture.componentRef.setInput('heatedOrChilled', 1);
      fixture.detectChanges();
      expect(component.form.controls.heatedOrChilled.value).toBe(1);
      component.form.controls.systemEfficiency.setValue(150);
      expect(component.form.controls.systemEfficiency.errors).toBeNull();
    });
  });

  describe('observers and calculation', () => {
    const UTILITY_COSTS: Array<{ isBaseline: boolean, type: number, cost: number }> = [
      { isBaseline: true, type: 0, cost: 3.99 },
      { isBaseline: false, type: 0, cost: 3.99 },
      { isBaseline: true, type: 1, cost: 5 },
      { isBaseline: false, type: 1, cost: 5 },
      { isBaseline: true, type: 2, cost: 0.066 },
      { isBaseline: true, type: 3, cost: 5 },
    ];
    UTILITY_COSTS.forEach(entry => {
      it(`sets the ${entry.isBaseline ? 'baseline' : 'modification'} utility cost for utility type ${entry.type}`, () => {
        render({ isBaseline: entry.isBaseline });
        component.form.controls.utilityType.setValue(entry.type);
        component.changeUtilityType();
        expect(component.form.controls.utilityCost.value).toBe(entry.cost);
      });
    });

    it('updates baseline service data and emits when the baseline form is valid', () => {
      render({ isBaseline: true });
      const emitted: Array<boolean> = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));
      component.form.controls.tankHeight.setValue(75);
      component.calculate();
      expect(tankService.baselineData.tankHeight).toBe(75);
      expect(emitted).toEqual([true]);
    });

    it('updates modification service data and emits when the modification form is valid', () => {
      render({ isBaseline: false });
      const baselineHeight = tankService.baselineData.tankHeight;
      const emitted: Array<boolean> = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));
      component.form.controls.tankHeight.setValue(80);
      component.calculate();
      expect(tankService.modificationData.tankHeight).toBe(80);
      expect(tankService.baselineData.tankHeight).toBe(baselineHeight);
      expect(emitted).toEqual([true]);
    });

    it('does not update service data or emit when the form is invalid', () => {
      render({ isBaseline: true });
      const emitted: Array<boolean> = [];
      component.emitCalculate.subscribe((value: boolean) => emitted.push(value));
      component.form.controls.tankHeight.setValue(null);
      component.calculate();
      expect(tankService.baselineData.tankHeight).toBe(50);
      expect(emitted).toEqual([]);
    });

    it('disables and resets the jacket material when insulation is set to none', () => {
      render({ isBaseline: false });
      component.form.controls.insulationMaterialSelection.setValue(0);
      component.changeInsulationMaterial();
      expect(component.form.controls.jacketMaterialSelection.value).toBe(0);
      expect(component.form.controls.jacketMaterialSelection.disabled).toBe(true);
    });

    it('enables the jacket material when insulation is selected', () => {
      render({ isBaseline: true });
      component.form.controls.insulationMaterialSelection.setValue(2);
      component.changeInsulationMaterial();
      expect(component.form.controls.jacketMaterialSelection.enabled).toBe(true);
    });
  });

  describe('validator toggling', () => {
    it('applies heated surface temperature limits and warning text', () => {
      render({ isBaseline: false });
      component.updateValidators();
      const control = component.form.controls.surfaceTemperature;
      control.setValue(79);
      expect(control.errors.min).toBeTruthy();
      control.setValue(301);
      expect(control.errors.max).toBeTruthy();
      control.setValue(150);
      expect(control.errors).toBeNull();
      expect(component.surfaceTemperatureGreaterThanWarning).toBe('Value must be greater than Average Ambient Temperature 80');
      expect(component.surfaceTemperatureLessThanWarning).toBe('Value must be less than Internal Tank Temperature 300');
    });

    it('applies chilled surface temperature limits and warning text', () => {
      render({ isBaseline: true, insulationMaterialSelection: 2, data: { heatedOrChilled: 1, tankTemperature: 40, surfaceTemperature: 60 } });
      component.updateValidators();
      const control = component.form.controls.surfaceTemperature;
      control.setValue(39);
      expect(control.errors.min).toBeTruthy();
      control.setValue(81);
      expect(control.errors.max).toBeTruthy();
      expect(component.surfaceTemperatureGreaterThanWarning).toBe('Value must be greater than Internal Tank Temperature 40');
      expect(component.surfaceTemperatureLessThanWarning).toBe('Value must be less than Average Ambient Temperature 80');
    });

    it('clears surface temperature validators when there is no insulation', () => {
      render({ isBaseline: true });
      component.updateValidators();
      component.form.controls.surfaceTemperature.setValue(null);
      expect(component.form.controls.surfaceTemperature.errors).toBeNull();
    });

    it('limits system efficiency to 100 for heated tanks', () => {
      render({ isBaseline: true });
      component.form.controls.systemEfficiency.setValue(101);
      expect(component.form.controls.systemEfficiency.errors.max).toBeTruthy();
    });

    it('removes the system efficiency max for chilled tanks', () => {
      render({ isBaseline: true });
      component.form.controls.heatedOrChilled.setValue(1);
      component.updateHeatedOrChill();
      component.form.controls.systemEfficiency.setValue(150);
      expect(component.form.controls.systemEfficiency.errors).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      render();
    });

    it('emits the focused field name', () => {
      const emitted: Array<string> = [];
      component.emitChangeField.subscribe((value: string) => emitted.push(value));
      component.focusField('tankHeight');
      expect(emitted).toEqual(['tankHeight']);
    });

    it('updates the operating hours from the modal and closes it', () => {
      component.openOperatingHoursModal();
      const opHours = { hoursPerYear: 5000 } as OperatingHours;
      component.updateOperatingHours(opHours);
      expect(tankService.operatingHours).toBe(opHours);
      expect(component.form.controls.operatingHours.value).toBe(5000);
      expect(tankService.baselineData.operatingHours).toBe(5000);
      expect(component.showOperatingHoursModal).toBe(false);
    });

    it('converts conductivity from imperial to metric', () => {
      expect(component.convertConductivity(1)).toBeCloseTo(1.7307, 3);
    });
  });

  describe('template visibility: insulation sections', () => {
    it('shows the insulation conductivity row and hides custom conductivity, thickness and surface temperature for no insulation', () => {
      render({ insulationMaterialSelection: 0 });
      expect(getRowValues('Conductivity').length).toBe(2);
      expect(inputExists('customInsulationConductivity_baseline')).toBe(false);
      expect(inputExists('insulationThickness_baseline')).toBe(false);
      expect(inputExists('surfaceTemperaturebaseline')).toBe(false);
    });

    it('shows the insulation conductivity row, thickness and surface temperature for a listed material', () => {
      render({ insulationMaterialSelection: 22 });
      expect(getRowValues('Conductivity').length).toBe(2);
      expect(inputExists('customInsulationConductivity_baseline')).toBe(false);
      expect(inputExists('insulationThickness_baseline')).toBe(true);
      expect(inputExists('surfaceTemperaturebaseline')).toBe(true);
    });

    it('shows custom conductivity instead of the insulation conductivity row for a custom material', () => {
      render({ insulationMaterialSelection: 1 });
      expect(getRowValues('Conductivity').length).toBe(1);
      expect(inputExists('customInsulationConductivity_baseline')).toBe(true);
      expect(inputExists('insulationThickness_baseline')).toBe(true);
      expect(inputExists('surfaceTemperaturebaseline')).toBe(true);
    });

    it('updates the insulation sections when the insulation selection changes', () => {
      render({ insulationMaterialSelection: 0 });
      component.form.controls.insulationMaterialSelection.setValue(1);
      fixture.detectChanges();
      expect(inputExists('customInsulationConductivity_baseline')).toBe(true);
      expect(inputExists('insulationThickness_baseline')).toBe(true);
    });
  });

  describe('template visibility: material property rows', () => {
    it('shows baseline emissivity values from the service baseline data', () => {
      render({ isBaseline: true });
      expect(getRowValues('Emissivity')).toEqual([
        String(tankService.baselineData.tankEmissivity),
        String(tankService.baselineData.jacketEmissivity)
      ]);
    });

    it('shows modification emissivity values from the service modification data', () => {
      render({ isBaseline: false });
      expect(getRowValues('Emissivity')).toEqual(['0.123', '0.456']);
    });

    it('shows imperial baseline conductivities', () => {
      render({ isBaseline: true });
      expect(getRowValues('Conductivity')).toEqual([
        `${fmt(tankService.baselineData.tankConductivity)} ${IMPERIAL_CONDUCTIVITY_UNIT}`,
        `${fmt(tankService.baselineData.insulationConductivity)} ${IMPERIAL_CONDUCTIVITY_UNIT}`
      ]);
    });

    it('shows metric baseline conductivities', () => {
      render({ isBaseline: true, settings: METRIC_SETTINGS });
      expect(getRowValues('Conductivity')).toEqual([
        `${fmt(component.convertConductivity(tankService.baselineData.tankConductivity))} W/mK`,
        `${fmt(component.convertConductivity(tankService.baselineData.insulationConductivity))} W/mK`
      ]);
    });

    it('shows imperial modification conductivities', () => {
      render({ isBaseline: false });
      expect(getRowValues('Conductivity')).toEqual([`1.5 ${IMPERIAL_CONDUCTIVITY_UNIT}`, `0.25 ${IMPERIAL_CONDUCTIVITY_UNIT}`]);
    });

    it('shows metric modification conductivities', () => {
      render({ isBaseline: false, settings: METRIC_SETTINGS });
      expect(getRowValues('Conductivity')).toEqual([
        `${fmt(component.convertConductivity(1.5))} W/mK`,
        `${fmt(component.convertConductivity(0.25))} W/mK`
      ]);
    });
  });

  describe('template visibility: field errors', () => {
    const FIELDS: Array<{ inputId: string, control: string }> = [
      { inputId: 'operatingHours_baseline', control: 'operatingHours' },
      { inputId: 'utilityCost_baseline', control: 'utilityCost' },
      { inputId: 'systemEfficiency_baseline', control: 'systemEfficiency' },
      { inputId: 'tankHeight_baseline', control: 'tankHeight' },
      { inputId: 'tankDiameter_baseline', control: 'tankDiameter' },
      { inputId: 'tankThickness_baseline', control: 'tankThickness' },
      { inputId: 'tankTemperature_baseline', control: 'tankTemperature' },
      { inputId: 'ambientTemperature_baseline', control: 'ambientTemperature' },
      { inputId: 'insulationThickness_baseline', control: 'insulationThickness' },
      { inputId: 'customInsulationConductivity_baseline', control: 'customInsulationConductivity' },
    ];

    FIELDS.forEach(field => {
      it(`hides the ${field.control} error container when valid`, () => {
        render({ insulationMaterialSelection: 1 });
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`hides the ${field.control} error container when invalid but pristine`, () => {
        render({ insulationMaterialSelection: 1 });
        component.form.controls[field.control].setValue(null);
        fixture.detectChanges();
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`shows only the required message for ${field.control} when empty and dirty`, () => {
        render({ insulationMaterialSelection: 1 });
        setDirtyValue(field.control, null);
        expect(getErrorMessages(field.inputId)).toEqual(['Value required.']);
      });
    });

    const MIN_MAX: Array<{ inputId: string, control: string, value: number, message: string }> = [
      { inputId: 'operatingHours_baseline', control: 'operatingHours', value: -1, message: "Value can't be less than 0." },
      { inputId: 'operatingHours_baseline', control: 'operatingHours', value: 9000, message: "Value can't be greater than 8760." },
      { inputId: 'utilityCost_baseline', control: 'utilityCost', value: -1, message: "Value can't be less than 0." },
      { inputId: 'systemEfficiency_baseline', control: 'systemEfficiency', value: -1, message: "Value can't be less than 0." },
      { inputId: 'systemEfficiency_baseline', control: 'systemEfficiency', value: 101, message: "Value can't be more than 100." },
      { inputId: 'tankHeight_baseline', control: 'tankHeight', value: -1, message: "Value can't be less than 0." },
      { inputId: 'tankDiameter_baseline', control: 'tankDiameter', value: -1, message: "Value can't be less than 0." },
      { inputId: 'tankThickness_baseline', control: 'tankThickness', value: -1, message: "Value can't be less than 0." },
      { inputId: 'insulationThickness_baseline', control: 'insulationThickness', value: -1, message: "Value can't be less than 0." },
      { inputId: 'insulationThickness_baseline', control: 'insulationThickness', value: 2000000, message: "Value can't be more than 1000000." },
      { inputId: 'customInsulationConductivity_baseline', control: 'customInsulationConductivity', value: -1, message: "Value can't be less than 0." },
    ];

    MIN_MAX.forEach(entry => {
      it(`shows only "${entry.message}" for ${entry.control} = ${entry.value}`, () => {
        render({ insulationMaterialSelection: 1 });
        setDirtyValue(entry.control, entry.value);
        expect(getErrorMessages(entry.inputId)).toEqual([entry.message]);
      });
    });
  });

  describe('template visibility: surface temperature errors', () => {
    it('hides the error container when the surface temperature is valid', () => {
      render({ insulationMaterialSelection: 22 });
      expect(getErrorContainer('surfaceTemperaturebaseline')).toBeNull();
    });

    it('shows the error container without dirtying, with no message for the initial greaterThan validator', () => {
      render({ insulationMaterialSelection: 22 });
      component.form.controls.surfaceTemperature.setValue(50);
      fixture.detectChanges();
      expect(getErrorContainer('surfaceTemperaturebaseline')).not.toBeNull();
      expect(getErrorMessages('surfaceTemperaturebaseline')).toEqual([]);
    });

    it('shows the required message', () => {
      render({ insulationMaterialSelection: 22 });
      component.updateValidators();
      component.form.controls.surfaceTemperature.setValue(null);
      fixture.detectChanges();
      expect(getErrorMessages('surfaceTemperaturebaseline')).toEqual(['Value required.']);
    });

    const SURFACE_CASES: Array<{ settings: Settings, value: number, message: string }> = [
      { settings: IMPERIAL_SETTINGS, value: 50, message: 'Value must be greater than Average Ambient Temperature 80 ℉' },
      { settings: IMPERIAL_SETTINGS, value: 400, message: 'Value must be less than Internal Tank Temperature 300 ℉' },
      { settings: METRIC_SETTINGS, value: 50, message: 'Value must be greater than Average Ambient Temperature 80 ℃' },
      { settings: METRIC_SETTINGS, value: 400, message: 'Value must be less than Internal Tank Temperature 300 ℃' },
    ];
    SURFACE_CASES.forEach(entry => {
      it(`shows "${entry.message}" for ${entry.value}`, () => {
        render({ insulationMaterialSelection: 22, settings: entry.settings });
        component.updateValidators();
        component.form.controls.surfaceTemperature.setValue(entry.value);
        fixture.detectChanges();
        expect(getErrorMessages('surfaceTemperaturebaseline')).toEqual([entry.message]);
      });
    });
  });

  describe('template visibility: warnings', () => {
    const WARNINGS: Array<{ inputId: string, control: string, property: 'tankThicknessWarning' | 'insulationThicknessWarning' }> = [
      { inputId: 'tankThickness_baseline', control: 'tankThickness', property: 'tankThicknessWarning' },
      { inputId: 'insulationThickness_baseline', control: 'insulationThickness', property: 'insulationThicknessWarning' },
    ];

    WARNINGS.forEach(entry => {
      it(`hides the ${entry.control} warning when there is no warning`, () => {
        render({ insulationMaterialSelection: 22 });
        setDirtyValue(entry.control, 1);
        expect(getWarning(entry.inputId)).toBeNull();
      });

      it(`hides the ${entry.control} warning when pristine`, () => {
        render({ insulationMaterialSelection: 22 });
        component[entry.property] = 'Check thickness';
        fixture.detectChanges();
        expect(getWarning(entry.inputId)).toBeNull();
      });

      it(`hides the ${entry.control} warning when invalid`, () => {
        render({ insulationMaterialSelection: 22 });
        component[entry.property] = 'Check thickness';
        setDirtyValue(entry.control, -1);
        expect(getWarning(entry.inputId)).toBeNull();
      });

      it(`shows the ${entry.control} warning when valid and dirty`, () => {
        render({ insulationMaterialSelection: 22 });
        component[entry.property] = 'Check thickness';
        setDirtyValue(entry.control, 1);
        expect(getWarning(entry.inputId)).toBe('Check thickness');
      });
    });
  });

  describe('template visibility: units', () => {
    it('shows the energy unit for utility cost', () => {
      render();
      expect(getUnitAddons('utilityCost_baseline')).toEqual(['$/MMBtu']);
    });

    const FIELD_UNITS: Array<{ inputId: string, imperial: string, metric: string }> = [
      { inputId: 'tankHeight_baseline', imperial: 'ft', metric: 'm' },
      { inputId: 'tankDiameter_baseline', imperial: 'ft', metric: 'm' },
      { inputId: 'tankThickness_baseline', imperial: 'ft', metric: 'm' },
      { inputId: 'tankTemperature_baseline', imperial: '℉', metric: '℃' },
      { inputId: 'ambientTemperature_baseline', imperial: '℉', metric: '℃' },
      { inputId: 'customInsulationConductivity_baseline', imperial: IMPERIAL_CONDUCTIVITY_UNIT, metric: 'W/mK' },
      { inputId: 'insulationThickness_baseline', imperial: 'ft', metric: 'm' },
      { inputId: 'surfaceTemperaturebaseline', imperial: '℉', metric: '℃' },
    ];

    FIELD_UNITS.forEach(entry => {
      [{ settings: IMPERIAL_SETTINGS, unit: entry.imperial }, { settings: METRIC_SETTINGS, unit: entry.metric }].forEach(variant => {
        it(`shows ${variant.unit} for ${entry.inputId} (${variant.settings.unitsOfMeasure})`, () => {
          render({ insulationMaterialSelection: 1, settings: variant.settings });
          expect(getUnitAddons(entry.inputId)).toEqual([variant.unit]);
        });
      });
    });
  });

  describe('template visibility: dropdown options', () => {
    it('renders the utility and heated/chilled options', () => {
      render();
      const optionText = (id: string) => Array.from(query('#' + id).querySelectorAll('option')).map((o: HTMLElement) => normalize(o.textContent));
      expect(optionText('utilityType_baseline')).toEqual(['Natural Gas', 'Other Fuel', 'Electricity', 'Steam']);
      expect(optionText('heatedOrChilled_baseline')).toEqual(['Heated', 'Chilled']);
      expect(optionText('tankMaterialSelection_baseline').length).toBe(component.tankMaterials.length);
      expect(optionText('insulationMaterialSelection_baseline').length).toBe(component.insulationMaterials.length);
      expect(optionText('jacketMaterialSelection_baseline').length).toBe(component.jacketMaterials.length);
    });
  });

  describe('template visibility: operating hours modal', () => {
    it('hides the operating hours modal by default', () => {
      render();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('shows the operating hours modal when opened and hides it when closed', () => {
      render();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });
});
