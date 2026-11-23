import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SteamReductionFormComponent } from './steam-reduction-form.component';
import { SteamReductionService } from '../steam-reduction.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { SteamReductionData, SteamReductionResult } from '../../../../shared/models/standalone';
import { OperatingHours } from '../../../../shared/models/operations';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

const IMPERIAL_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  steamTemperatureMeasurement: 'F',
  steamSpecificEnthalpyMeasurement: 'btuLb',
  steamSpecificEntropyMeasurement: 'btulbF'
} as Settings;
const METRIC_SETTINGS = {
  unitsOfMeasure: 'Metric',
  steamTemperatureMeasurement: 'C',
  steamSpecificEnthalpyMeasurement: 'kJkg',
  steamSpecificEntropyMeasurement: 'kJkgK'
} as Settings;
const OTHER_SETTINGS = { ...IMPERIAL_SETTINGS, unitsOfMeasure: 'Other' } as Settings;

const INDIVIDUAL_RESULT: SteamReductionResult = { energyUse: 1234.4, steamUse: 56.78912, energyCost: 10 };

function makeData(settings: Settings, measurementMethod: number = 0): SteamReductionData {
  const data = new SteamReductionService(null, null, null).initObject(0, settings, undefined, 0, 0.2, 0.01, 0.05);
  data.measurementMethod = measurementMethod;
  return data;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

interface RenderOptions {
  settings?: Settings;
  data?: SteamReductionData;
  index?: number;
  isBaseline?: boolean;
  selected?: boolean;
}

describe('SteamReductionFormComponent', () => {
  let component: SteamReductionFormComponent;
  let fixture: ComponentFixture<SteamReductionFormComponent>;
  let steamReductionService: SteamReductionService;

  function render(options: RenderOptions = {}): void {
    const settings = options.settings || IMPERIAL_SETTINGS;
    fixture = TestBed.createComponent(SteamReductionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.componentRef.setInput('data', options.data || makeData(settings));
    fixture.componentRef.setInput('index', options.index !== undefined ? options.index : 0);
    fixture.componentRef.setInput('isBaseline', options.isBaseline !== undefined ? options.isBaseline : true);
    fixture.componentRef.setInput('selected', options.selected !== undefined ? options.selected : true);
    fixture.componentRef.setInput('utilityType', 0);
    fixture.componentRef.setInput('utilityCost', 0.2);
    fixture.detectChanges();
  }

  function renderMethod(method: number, settings: Settings = IMPERIAL_SETTINGS): void {
    render({ settings: settings, data: makeData(settings, method) });
  }

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function inputExists(id: string): boolean {
    return query('#' + id) !== null;
  }

  function getErrorContainer(inputId: string): HTMLElement | null {
    return query('#' + inputId).closest('.form-group').querySelector('.alert-danger');
  }

  function getErrorMessages(inputId: string): Array<string> {
    const container = getErrorContainer(inputId);
    if (!container) {
      return [];
    }
    return Array.from(container.children).map((child: HTMLElement) => normalize(child.textContent));
  }

  function getUnitAddons(inputId: string): Array<string> {
    return Array.from(query('#' + inputId).closest('.input-group').querySelectorAll('.input-group-addon:not(.op-hour-addon)'))
      .map((addon: HTMLElement) => normalize(addon.textContent));
  }

  function getRowValue(label: string): string | null {
    const rows: Array<HTMLElement> = Array.from(fixture.nativeElement.querySelectorAll('form .row'));
    const row = rows.find(r => normalize(r.querySelector('label').textContent) === label);
    return row ? normalize(row.querySelector('.text-center').textContent) : null;
  }

  function setDirtyValue(controlName: string, value: any): void {
    component.form.controls[controlName].setValue(value);
    component.form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SteamReductionFormComponent, SettingsLabelStubPipe],
      providers: [
        ConvertUnitsService,
        { provide: StandaloneService, useValue: jasmine.createSpyObj('StandaloneService', ['steamReduction']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    steamReductionService = TestBed.inject(SteamReductionService);
    spyOn(steamReductionService, 'calculateIndividualEquipment').and.returnValue({ ...INDIVIDUAL_RESULT });
  });

  describe('initialization', () => {
    it('builds the baseline id string and form from the data', () => {
      spyOn(steamReductionService, 'getFormFromObj').and.callThrough();
      const data = makeData(IMPERIAL_SETTINGS);
      render({ data: data, index: 0, isBaseline: true });
      expect(component.idString).toBe('baseline_0');
      expect(steamReductionService.getFormFromObj).toHaveBeenCalledWith(data, 0, true, IMPERIAL_SETTINGS);
      expect(component.form.controls.name.value).toBe('Equipment #1');
    });

    it('builds the modification id string', () => {
      render({ index: 2, isBaseline: false });
      expect(component.idString).toBe('modification_2');
    });

    it('calculates the individual result on init', () => {
      const data = makeData(IMPERIAL_SETTINGS);
      render({ data: data });
      expect(steamReductionService.calculateIndividualEquipment).toHaveBeenCalledWith(data, IMPERIAL_SETTINGS);
      expect(component.individualResults).toEqual(INDIVIDUAL_RESULT);
    });

    it('disables the form when not selected', () => {
      render({ selected: false });
      expect(component.form.disabled).toBe(true);
    });

    it('keeps the form enabled when selected', () => {
      render({ selected: true });
      expect(component.form.controls.name.enabled).toBe(true);
    });
  });

  describe('input changes', () => {
    it('disables the form when deselected', () => {
      render();
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      expect(component.form.disabled).toBe(true);
    });

    it('re-enables the baseline first entry including utility fields when selected again', () => {
      render({ selected: false });
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.form.controls.name.enabled).toBe(true);
      expect(component.form.controls.utilityType.enabled).toBe(true);
      expect(component.form.controls.utilityCost.enabled).toBe(true);
    });

    it('re-enables a modification entry with utility fields still disabled', () => {
      render({ selected: false, isBaseline: false });
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.form.controls.name.enabled).toBe(true);
      expect(component.form.controls.utilityType.disabled).toBe(true);
      expect(component.form.controls.utilityCost.disabled).toBe(true);
    });

    it('patches the utility type and its cost when the utility type input changes', () => {
      render();
      const emitted: Array<SteamReductionData> = [];
      component.emitCalculate.subscribe((value: SteamReductionData) => emitted.push(value));
      fixture.componentRef.setInput('utilityType', 1);
      fixture.detectChanges();
      expect(component.form.controls.utilityType.value).toBe(1);
      expect(component.form.controls.utilityCost.value).toBe(0.01);
      expect(emitted.length).toBe(1);
    });

    it('patches the utility cost when the utility cost input changes', () => {
      render();
      fixture.componentRef.setInput('utilityCost', 0.75);
      fixture.detectChanges();
      expect(component.form.controls.utilityCost.value).toBe(0.75);
    });
  });

  describe('observers and calculation', () => {
    beforeEach(() => {
      render();
      (steamReductionService.calculateIndividualEquipment as jasmine.Spy).calls.reset();
    });

    it('emits the data from the form and recalculates when the form is valid', () => {
      const emitted: Array<SteamReductionData> = [];
      component.emitCalculate.subscribe((value: SteamReductionData) => emitted.push(value));
      component.form.controls.operatingHours.setValue(4000);
      component.calculate();
      expect(emitted.length).toBe(1);
      expect(emitted[0].hoursPerYear).toBe(4000);
      expect(component.data.hoursPerYear).toBe(4000);
      expect(steamReductionService.calculateIndividualEquipment).toHaveBeenCalled();
    });

    it('does not emit or recalculate when the form is invalid', () => {
      const emitted: Array<SteamReductionData> = [];
      component.emitCalculate.subscribe((value: SteamReductionData) => emitted.push(value));
      component.form.controls.operatingHours.setValue(null);
      component.calculate();
      expect(emitted).toEqual([]);
      expect(steamReductionService.calculateIndividualEquipment).not.toHaveBeenCalled();
    });

    const UTILITY_COSTS: Array<{ type: number, cost: number }> = [
      { type: 0, cost: 0.2 },
      { type: 1, cost: 0.01 },
      { type: 2, cost: 0.05 },
    ];
    UTILITY_COSTS.forEach(entry => {
      it(`sets the utility cost from the data for utility type ${entry.type}`, () => {
        component.form.controls.utilityType.setValue(entry.type);
        component.changeUtilityType();
        expect(component.form.controls.utilityCost.value).toBe(entry.cost);
      });
    });

    it('resets system efficiency and applies validators when the measurement method changes', () => {
      component.form.controls.systemEfficiency.setValue(50);
      component.form.controls.measurementMethod.setValue(3);
      component.changeMeasurementMethod();
      expect(component.form.controls.systemEfficiency.value).toBe(100);
      expect(component.data.systemEfficiency).toBe(100);
      component.form.controls.consumption.setValue(null);
      component.form.controls.consumption.updateValueAndValidity();
      expect(component.form.controls.consumption.errors.required).toBeTruthy();
    });
  });

  describe('validator toggling', () => {
    const STEAM_VARIABLE_RANGES: Array<{ settings: Settings, option: number, min: number, max: number }> = [
      { settings: IMPERIAL_SETTINGS, option: 0, min: 32, max: 1472 },
      { settings: METRIC_SETTINGS, option: 0, min: 0, max: 800 },
      { settings: IMPERIAL_SETTINGS, option: 3, min: 0, max: 1 },
      { settings: OTHER_SETTINGS, option: 0, min: 0, max: 1472 },
    ];

    STEAM_VARIABLE_RANGES.forEach(range => {
      it(`applies ${range.min}-${range.max} to steamVariable for option ${range.option} (${range.settings.unitsOfMeasure})`, () => {
        render({ settings: range.settings });
        component.form.controls.steamVariableOption.setValue(range.option);
        component.changeSteamVariableOption();
        const control = component.form.controls.steamVariable;
        expect(control.value).toBe(0);
        control.setValue(range.min - 0.5);
        expect(control.errors.min).toBeTruthy();
        control.setValue(range.max + 0.5);
        expect(control.errors.max).toBeTruthy();
        control.setValue(range.min);
        expect(control.errors).toBeNull();
      });
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      render();
    });

    it('toggles name editing', () => {
      component.editEquipmentName();
      expect(component.isEditingName).toBe(true);
      component.doneEditingName();
      expect(component.isEditingName).toBe(false);
    });

    it('emits the index on remove', () => {
      const emitted: Array<number> = [];
      component.emitRemoveEquipment.subscribe((value: number) => emitted.push(value));
      component.removeEquipment();
      expect(emitted).toEqual([0]);
    });

    it('emits the focused field name', () => {
      const emitted: Array<string> = [];
      component.emitChangeField.subscribe((value: string) => emitted.push(value));
      component.focusField('pressure');
      expect(emitted).toEqual(['pressure']);
    });

    it('updates the operating hours from the modal and closes it', () => {
      component.openOperatingHoursModal();
      const opHours = { hoursPerYear: 5000 } as OperatingHours;
      component.updateOperatingHours(opHours);
      expect(steamReductionService.operatingHours).toBe(opHours);
      expect(component.form.controls.operatingHours.value).toBe(5000);
      expect(component.data.hoursPerYear).toBe(5000);
      expect(component.showOperatingHoursModal).toBe(false);
    });

    it('returns the display unit for each steam variable option', () => {
      expect(component.getOptionDisplayUnit(0)).toBe('F');
      expect(component.getOptionDisplayUnit(1)).toBe('btuLb');
      expect(component.getOptionDisplayUnit(2)).toBe('btulbF');
      expect(component.getOptionDisplayUnit(3)).toBeUndefined();
    });
  });

  describe('template visibility: header', () => {
    it('shows the name label and hides the name input when not editing', () => {
      render();
      expect(normalize(query('label.group-label').textContent)).toBe('Equipment #1');
      expect(query('#equipmentName')).toBeNull();
    });

    it('shows the name input and hides the name label when editing', () => {
      render();
      component.editEquipmentName();
      fixture.detectChanges();
      expect(query('#equipmentName')).not.toBeNull();
      expect(query('.btn-edit-name.fa-pencil')).toBeNull();
      expect(query('.btn-edit-name.fa-save')).not.toBeNull();
    });

    it('hides the name error when the name is valid', () => {
      render();
      component.editEquipmentName();
      fixture.detectChanges();
      expect(query('label.group-label .alert-danger')).toBeNull();
    });

    it('shows the name required error when the name is empty and dirty', () => {
      render();
      component.editEquipmentName();
      setDirtyValue('name', '');
      expect(normalize(query('label.group-label .alert-danger').textContent)).toBe('Please enter a name.');
    });

    const REMOVE_CASES: Array<{ isBaseline: boolean, index: number, shown: boolean }> = [
      { isBaseline: true, index: 0, shown: false },
      { isBaseline: true, index: 1, shown: true },
      { isBaseline: false, index: 0, shown: true },
      { isBaseline: false, index: 1, shown: true },
    ];
    REMOVE_CASES.forEach(entry => {
      it(`${entry.shown ? 'shows' : 'hides'} the remove icon for ${entry.isBaseline ? 'baseline' : 'modification'} index ${entry.index}`, () => {
        render({ isBaseline: entry.isBaseline, index: entry.index });
        expect(query('.fa-times-circle-o') !== null).toBe(entry.shown);
      });
    });
  });

  describe('template visibility: dropdown options', () => {
    it('renders the utility, steam variable and measurement options', () => {
      render();
      const optionText = (id: string) => Array.from(query('#' + id).querySelectorAll('option')).map((o: HTMLElement) => normalize(o.textContent));
      expect(optionText('utilityType_baseline_0')).toEqual(['Steam', 'Natural Gas', 'Other']);
      expect(optionText('steamVariableOption_baseline_0')).toEqual(['Temperature', 'Quality']);
      expect(optionText('measurementMethod_baseline_0')).toEqual(['Flow Meter Method', 'Mass Flow of Air', 'Mass Flow of Water', 'Offsheet / Other Method']);
    });
  });

  describe('template visibility: measurement method sections', () => {
    const SECTIONS: Array<{ method: number, present: Array<string>, absent: Array<string> }> = [
      {
        method: 0,
        present: ['flowMeterFlowRate_baseline_0', 'systemEfficiency_baseline_0', 'units_baseline_0'],
        absent: ['airIsNameplate_baseline_0', 'waterNameplateFlowRate_baseline_0', 'consumption_baseline_0']
      },
      {
        method: 1,
        present: ['airIsNameplate_baseline_0', 'airInletTemperature_baseline_0', 'airOutletTemperature_baseline_0', 'systemEfficiency_baseline_0', 'units_baseline_0'],
        absent: ['flowMeterFlowRate_baseline_0', 'waterNameplateFlowRate_baseline_0', 'consumption_baseline_0']
      },
      {
        method: 2,
        present: ['waterNameplateFlowRate_baseline_0', 'waterInletTemperature_baseline_0', 'waterOutletTemperature_baseline_0', 'systemEfficiency_baseline_0', 'units_baseline_0'],
        absent: ['flowMeterFlowRate_baseline_0', 'airIsNameplate_baseline_0', 'consumption_baseline_0']
      },
      {
        method: 3,
        present: ['consumption_baseline_0'],
        absent: ['flowMeterFlowRate_baseline_0', 'airIsNameplate_baseline_0', 'waterNameplateFlowRate_baseline_0', 'systemEfficiency_baseline_0', 'units_baseline_0']
      },
    ];

    SECTIONS.forEach(section => {
      it(`renders only the method ${section.method} fields`, () => {
        renderMethod(section.method);
        section.present.forEach(id => expect(inputExists(id)).withContext(id).toBe(true));
        section.absent.forEach(id => expect(inputExists(id)).withContext(id).toBe(false));
      });
    });

    it('switches sections when the measurement method value changes', () => {
      renderMethod(0);
      component.form.controls.measurementMethod.setValue(3);
      fixture.detectChanges();
      expect(inputExists('flowMeterFlowRate_baseline_0')).toBe(false);
      expect(inputExists('consumption_baseline_0')).toBe(true);
    });

    it('shows measured air fields and hides nameplate air flow when air is measured', () => {
      renderMethod(1);
      expect(inputExists('areaOfDuct_baseline_0')).toBe(true);
      expect(inputExists('airVelocity_baseline_0')).toBe(true);
      expect(inputExists('airFlow_baseline_0')).toBe(false);
    });

    it('shows nameplate air flow and hides measured air fields when air is nameplate', () => {
      renderMethod(1);
      component.form.controls.airIsNameplate.setValue(true);
      fixture.detectChanges();
      expect(inputExists('areaOfDuct_baseline_0')).toBe(false);
      expect(inputExists('airVelocity_baseline_0')).toBe(false);
      expect(inputExists('airFlow_baseline_0')).toBe(true);
    });

    it('hides both air measurement variants when the measurement method is not air', () => {
      renderMethod(0);
      component.form.controls.airIsNameplate.setValue(true);
      fixture.detectChanges();
      expect(inputExists('airFlow_baseline_0')).toBe(false);
      expect(inputExists('areaOfDuct_baseline_0')).toBe(false);
    });
  });

  describe('template visibility: steam variable', () => {
    const LABELS: Array<{ option: number, label: string, unit: string | null }> = [
      { option: 0, label: 'Temperature', unit: 'F' },
      { option: 1, label: 'Specific Enthalpy', unit: 'btuLb' },
      { option: 2, label: 'Specific Entropy', unit: 'btulbF' },
      { option: 3, label: 'Quality', unit: null },
    ];

    LABELS.forEach(entry => {
      it(`renders only the ${entry.label} label for option ${entry.option}`, () => {
        render();
        component.form.controls.steamVariableOption.setValue(entry.option);
        fixture.detectChanges();
        const labels = Array.from(fixture.nativeElement.querySelectorAll('label[for="steamVariable_baseline_0"]'))
          .map((label: HTMLElement) => normalize(label.textContent));
        expect(labels).toEqual([entry.label]);
        const addon = query('.calc-addon-group .input-group-addon');
        expect(addon ? normalize(addon.textContent) : null).toBe(entry.unit);
      });
    });

    it('shows the required message', () => {
      render();
      setDirtyValue('steamVariable', null);
      expect(getErrorMessages('steamVariable_baseline_0')).toEqual(['Value Required']);
    });

    it('shows the min message with the unit for temperature', () => {
      render();
      setDirtyValue('steamVariable', 10);
      expect(getErrorMessages('steamVariable_baseline_0')).toEqual(["Value can't be less than 32 F."]);
    });

    it('shows the max message with the unit for temperature', () => {
      render();
      component.changeSteamVariableOption();
      setDirtyValue('steamVariable', 2000);
      expect(getErrorMessages('steamVariable_baseline_0')).toEqual(["Value can't be greater than 1472 F ."]);
    });

    it('shows the max message without a unit for quality', () => {
      render();
      component.form.controls.steamVariableOption.setValue(3);
      component.changeSteamVariableOption();
      setDirtyValue('steamVariable', 2);
      expect(getErrorMessages('steamVariable_baseline_0')).toEqual(["Value can't be greater than 1 ."]);
    });

    it('shows the min message without a unit for quality', () => {
      render();
      component.form.controls.steamVariableOption.setValue(3);
      component.changeSteamVariableOption();
      setDirtyValue('steamVariable', -1);
      expect(getErrorMessages('steamVariable_baseline_0')).toEqual(["Value can't be less than 0 ."]);
    });
  });

  describe('template visibility: field errors', () => {
    const FIELDS: Array<{ method: number, inputId: string, control: string, required: string, setup?: () => void }> = [
      { method: 0, inputId: 'operatingHours_baseline_0', control: 'operatingHours', required: 'Value required.' },
      { method: 0, inputId: 'utilityCost_baseline_0', control: 'utilityCost', required: 'Value required.' },
      { method: 0, inputId: 'pressure_baseline_0', control: 'pressure', required: 'Value required.' },
      { method: 0, inputId: 'feedWaterTemperature_baseline_0', control: 'feedWaterTemperature', required: 'Value required.' },
      { method: 0, inputId: 'systemEfficiency_baseline_0', control: 'systemEfficiency', required: 'Value required.' },
      { method: 0, inputId: 'boilerEfficiency_baseline_0', control: 'boilerEfficiency', required: 'Value required.' },
      { method: 0, inputId: 'flowMeterFlowRate_baseline_0', control: 'flowMeterFlowRate', required: 'Value required.' },
      { method: 0, inputId: 'units_baseline_0', control: 'units', required: 'Value required.' },
      { method: 1, inputId: 'areaOfDuct_baseline_0', control: 'airMeasuredAreaOfDuct', required: 'Value required.' },
      { method: 1, inputId: 'airVelocity_baseline_0', control: 'airMeasuredAirVelocity', required: 'Value required.' },
      { method: 1, inputId: 'airInletTemperature_baseline_0', control: 'airInletTemperature', required: 'Value required.' },
      { method: 1, inputId: 'airOutletTemperature_baseline_0', control: 'airOutletTemperature', required: 'Value required.' },
      { method: 2, inputId: 'waterNameplateFlowRate_baseline_0', control: 'waterNameplateFlowRate', required: 'Value required.' },
      { method: 2, inputId: 'waterInletTemperature_baseline_0', control: 'waterInletTemperature', required: 'Value required.' },
      { method: 2, inputId: 'waterOutletTemperature_baseline_0', control: 'waterOutletTemperature', required: 'Value required.' },
      { method: 3, inputId: 'consumption_baseline_0', control: 'consumption', required: 'Value required.' },
    ];

    FIELDS.forEach(field => {
      it(`hides the ${field.control} error container when valid`, () => {
        renderMethod(field.method);
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`hides the ${field.control} error container when invalid but pristine`, () => {
        renderMethod(field.method);
        component.form.controls[field.control].setValue(null);
        fixture.detectChanges();
        expect(getErrorContainer(field.inputId)).toBeNull();
      });

      it(`shows only the required message for ${field.control} when empty and dirty`, () => {
        renderMethod(field.method);
        setDirtyValue(field.control, null);
        expect(getErrorMessages(field.inputId)).toEqual([field.required]);
      });
    });

    it('shows the required message for nameplate air flow', () => {
      renderMethod(1);
      component.form.controls.airIsNameplate.setValue(true);
      component.changeMeasurementMethod();
      setDirtyValue('airNameplateFlowRate', null);
      expect(getErrorMessages('airFlow_baseline_0')).toEqual(['Value required.']);
    });

    const MIN_MAX: Array<{ method: number, inputId: string, control: string, value: number, message: string }> = [
      { method: 0, inputId: 'operatingHours_baseline_0', control: 'operatingHours', value: -1, message: "Value can't be less than 0." },
      { method: 0, inputId: 'operatingHours_baseline_0', control: 'operatingHours', value: 9000, message: "Value can't be greater than 8760." },
      { method: 0, inputId: 'utilityCost_baseline_0', control: 'utilityCost', value: -1, message: "Value can't be less than 0." },
      { method: 0, inputId: 'pressure_baseline_0', control: 'pressure', value: -1, message: "Value can't be less than 0." },
      { method: 0, inputId: 'feedWaterTemperature_baseline_0', control: 'feedWaterTemperature', value: 10, message: "Value can't be less than 32." },
      { method: 0, inputId: 'systemEfficiency_baseline_0', control: 'systemEfficiency', value: -1, message: "Value can't be less than 0." },
      { method: 0, inputId: 'systemEfficiency_baseline_0', control: 'systemEfficiency', value: 101, message: "Value can't be more than 100." },
      { method: 0, inputId: 'boilerEfficiency_baseline_0', control: 'boilerEfficiency', value: -1, message: "Value can't be less than 0." },
      { method: 0, inputId: 'flowMeterFlowRate_baseline_0', control: 'flowMeterFlowRate', value: -1, message: "Value can't be less than 0." },
      { method: 0, inputId: 'units_baseline_0', control: 'units', value: -1, message: "Value can't be less than 0." },
      { method: 1, inputId: 'airVelocity_baseline_0', control: 'airMeasuredAirVelocity', value: -1, message: "Value can't be less than 0." },
      { method: 2, inputId: 'waterNameplateFlowRate_baseline_0', control: 'waterNameplateFlowRate', value: -1, message: "Value can't be less than 0." },
      { method: 3, inputId: 'consumption_baseline_0', control: 'consumption', value: -1, message: "Value can't be less than 0." },
    ];

    MIN_MAX.forEach(entry => {
      it(`shows only "${entry.message}" for ${entry.control} = ${entry.value}`, () => {
        renderMethod(entry.method);
        setDirtyValue(entry.control, entry.value);
        expect(getErrorMessages(entry.inputId)).toEqual([entry.message]);
      });
    });

    it('shows only the min message for nameplate air flow below 0', () => {
      renderMethod(1);
      component.form.controls.airIsNameplate.setValue(true);
      component.changeMeasurementMethod();
      setDirtyValue('airNameplateFlowRate', -1);
      expect(getErrorMessages('airFlow_baseline_0')).toEqual(["Value can't be less than 0."]);
    });

    it('shows an error container with no message for a negative duct area (template checks greaterThan, validator sets min)', () => {
      renderMethod(1);
      setDirtyValue('airMeasuredAreaOfDuct', -1);
      expect(getErrorContainer('areaOfDuct_baseline_0')).not.toBeNull();
      expect(getErrorMessages('areaOfDuct_baseline_0')).toEqual([]);
    });

    it('hides utility cost errors on a modification entry because the control is disabled', () => {
      render({ isBaseline: false });
      setDirtyValue('utilityCost', null);
      expect(getErrorContainer('utilityCost_modification_0')).toBeNull();
    });

    it('hides errors when the form is disabled', () => {
      render({ selected: false });
      setDirtyValue('operatingHours', null);
      expect(getErrorContainer('operatingHours_baseline_0')).toBeNull();
    });
  });

  describe('template visibility: units', () => {
    const UTILITY_COST_UNITS: Array<{ settings: Settings, type: number, unit: string }> = [
      { settings: IMPERIAL_SETTINGS, type: 0, unit: '$/ klb' },
      { settings: METRIC_SETTINGS, type: 0, unit: '$/ tonne' },
      { settings: IMPERIAL_SETTINGS, type: 1, unit: '$/ MMBtu' },
      { settings: METRIC_SETTINGS, type: 2, unit: '$/ GJ' },
    ];
    UTILITY_COST_UNITS.forEach(entry => {
      it(`shows ${entry.unit} for utility type ${entry.type} (${entry.settings.unitsOfMeasure})`, () => {
        render({ settings: entry.settings });
        component.form.controls.utilityType.setValue(entry.type);
        fixture.detectChanges();
        expect(getUnitAddons('utilityCost_baseline_0')).toEqual([entry.unit]);
      });
    });

    const FIELD_UNITS: Array<{ method: number, inputId: string, imperial: string, metric: string, nameplate?: boolean }> = [
      { method: 0, inputId: 'pressure_baseline_0', imperial: 'psig', metric: 'barg' },
      { method: 0, inputId: 'feedWaterTemperature_baseline_0', imperial: '℉', metric: '℃' },
      { method: 0, inputId: 'flowMeterFlowRate_baseline_0', imperial: 'lb/hr', metric: 'kg/hr' },
      { method: 1, inputId: 'areaOfDuct_baseline_0', imperial: 'ft2', metric: 'cm2' },
      { method: 1, inputId: 'airVelocity_baseline_0', imperial: 'ft/min', metric: 'm/min' },
      { method: 1, inputId: 'airFlow_baseline_0', imperial: 'ft3/min', metric: 'L/s', nameplate: true },
      { method: 1, inputId: 'airInletTemperature_baseline_0', imperial: '℉', metric: '℃' },
      { method: 1, inputId: 'airOutletTemperature_baseline_0', imperial: '℉', metric: '℃' },
      { method: 2, inputId: 'waterNameplateFlowRate_baseline_0', imperial: 'gpm', metric: 'L/s' },
      { method: 2, inputId: 'waterInletTemperature_baseline_0', imperial: '℉', metric: '℃' },
      { method: 2, inputId: 'waterOutletTemperature_baseline_0', imperial: '℉', metric: '℃' },
      { method: 3, inputId: 'consumption_baseline_0', imperial: 'MMBtu/yr', metric: 'GJ/yr' },
    ];

    FIELD_UNITS.forEach(entry => {
      [{ settings: IMPERIAL_SETTINGS, unit: entry.imperial }, { settings: METRIC_SETTINGS, unit: entry.metric }].forEach(variant => {
        it(`shows ${variant.unit} for ${entry.inputId} (${variant.settings.unitsOfMeasure})`, () => {
          renderMethod(entry.method, variant.settings);
          if (entry.nameplate) {
            component.form.controls.airIsNameplate.setValue(true);
            fixture.detectChanges();
          }
          expect(getUnitAddons(entry.inputId)).toEqual([variant.unit]);
        });
      });
    });

    it('shows the celsius unit for water inlet but no unit for water outlet when units are neither imperial nor metric', () => {
      renderMethod(2, OTHER_SETTINGS);
      expect(getUnitAddons('waterInletTemperature_baseline_0')).toEqual(['℃']);
      expect(getUnitAddons('waterOutletTemperature_baseline_0')).toEqual([]);
    });

    it('shows hrs/yr for operating hours', () => {
      render();
      expect(getUnitAddons('operatingHours_baseline_0')).toEqual(['hrs/yr']);
    });
  });

  describe('template visibility: result rows', () => {
    it('shows the imperial energy subtotal', () => {
      renderMethod(0);
      expect(getRowValue('Energy Subtotal')).toBe('1,234 MMBtu/yr');
      expect(getRowValue('Steam Flow Rate')).toBeNull();
    });

    it('shows the metric energy subtotal', () => {
      renderMethod(0, METRIC_SETTINGS);
      expect(getRowValue('Energy Subtotal')).toBe('1,234 GJ/yr');
    });

    [1, 2].forEach(method => {
      it(`shows the imperial steam flow rate for method ${method}`, () => {
        renderMethod(method);
        expect(getRowValue('Steam Flow Rate')).toBe('56.789 klb/yr');
      });

      it(`shows the metric steam flow rate for method ${method}`, () => {
        renderMethod(method, METRIC_SETTINGS);
        expect(getRowValue('Steam Flow Rate')).toBe('56.789 tonne/yr');
      });
    });

    it('updates the energy subtotal after a recalculation', () => {
      renderMethod(0);
      (steamReductionService.calculateIndividualEquipment as jasmine.Spy).and.returnValue({ energyUse: 99, steamUse: 1, energyCost: 1 });
      component.calculate();
      fixture.detectChanges();
      expect(getRowValue('Energy Subtotal')).toBe('99 MMBtu/yr');
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
