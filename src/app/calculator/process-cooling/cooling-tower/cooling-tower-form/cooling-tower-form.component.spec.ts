import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CoolingTowerFormComponent } from './cooling-tower-form.component';
import { CoolingTowerService } from '../cooling-tower.service';
import { ChillerService } from '../../chiller.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { CoolingTowerData } from '../../../../shared/models/chillers';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;
const MOCK_OPERATING_HOURS = { hoursPerYear: 5000 } as OperatingHours;

function makeData(index: number, overrides: Partial<CoolingTowerData> = {}): CoolingTowerData {
  return {
    name: 'Case #' + (index + 1),
    operationalHours: 5000,
    flowRate: 1,
    userDefinedCoolingLoad: true,
    waterCost: 0,
    temperatureDifference: 0,
    coolingLoad: 0,
    lossCorrectionFactor: 85,
    hasDriftEliminator: 0,
    driftLossFactor: .2,
    cyclesOfConcentration: 1,
    ...overrides,
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

interface CreateOptions {
  isBaseline?: boolean;
  selected?: boolean;
  settings?: Settings;
  data?: Partial<CoolingTowerData>;
}

describe('CoolingTowerFormComponent', () => {
  let component: CoolingTowerFormComponent;
  let fixture: ComponentFixture<CoolingTowerFormComponent>;
  let service: CoolingTowerService;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function text(element: Element | null): string {
    return element ? normalize(element.textContent) : '';
  }

  function createComponent(options: CreateOptions = {}): void {
    const isBaseline = options.isBaseline ?? true;
    const data = [makeData(0, options.data)];
    service.baselineData.next(data);
    if (!isBaseline) {
      service.modificationData.next(JSON.parse(JSON.stringify(data)));
    }
    fixture = TestBed.createComponent(CoolingTowerFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('index', 0);
    fixture.componentRef.setInput('settings', options.settings ?? IMPERIAL);
    fixture.componentRef.setInput('isBaseline', isBaseline);
    fixture.componentRef.setInput('operatingHours', MOCK_OPERATING_HOURS);
    fixture.componentRef.setInput('selected', options.selected ?? true);
    fixture.detectChanges();
  }

  /** The form-group that holds the element with the given id. */
  function groupFor(id: string): HTMLElement {
    return query('#' + id).closest('.form-group') as HTMLElement;
  }

  function errorMessages(container: Element): Array<string> {
    const alert = container.querySelector('.alert-danger');
    if (!alert) {
      return [];
    }
    return Array.from(alert.children).map(child => normalize(child.textContent));
  }

  function setDirty(controlName: string, value: unknown): void {
    component.form.controls[controlName].setValue(value);
    component.form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function getModificationGroup(label: string): HTMLElement {
    const groups: Array<HTMLElement> = Array.from(query('.form-section.pt-1').querySelectorAll('.form-group'));
    return groups.find(group => normalize(group.querySelector('label').textContent).startsWith(label));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CoolingTowerFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        CoolingTowerService,
        { provide: ChillerService, useValue: jasmine.createSpyObj('ChillerService', ['coolingTowerMakeupWater']) },
        { provide: ConvertUnitsService, useValue: jasmine.createSpyObj('ConvertUnitsService', ['value']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(CoolingTowerService);
    service.initDefaultEmptyOutputs();
  });

  describe('initialization', () => {
    it('builds the form from the baseline case at its index', () => {
      createComponent({ data: { name: 'Tower A', flowRate: 42 } });
      expect(component.idString).toBe('baseline_0');
      expect(component.form.controls.name.value).toBe('Tower A');
      expect(component.form.controls.flowRate.value).toBe(42);
    });

    it('builds the form from the modification case at its index', () => {
      createComponent({ isBaseline: false, data: { name: 'Mod A' } });
      expect(component.idString).toBe('modification_0');
      expect(component.form.controls.name.value).toBe('Mod A');
    });

    it('uses the ids derived from the case', () => {
      createComponent();
      expect(query('#cyclesOfConcentration_baseline_0')).not.toBeNull();
    });

    it('takes the case result for its index from the output', () => {
      createComponent();
      expect(component.caseResultData).toEqual({ wcBaseline: 0, wcModification: 0, waterSavings: 0 });
    });

    it('disables the form when the panel is not selected', () => {
      createComponent({ selected: false });
      expect(component.form.disabled).toBeTrue();
    });

    it('leaves the form enabled when the panel is selected', () => {
      createComponent({ selected: true });
      expect(component.form.enabled).toBeTrue();
    });
  });

  describe('selection changes', () => {
    it('disables and re-enables the form as the selection changes', () => {
      createComponent({ selected: true });
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      expect(component.form.disabled).toBeTrue();
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.form.enabled).toBeTrue();
    });
  });

  describe('reactive observers', () => {
    it('rebuilds the form from the service when data is reset', () => {
      createComponent();
      service.baselineData.getValue()[0] = makeData(0, { name: 'Reset Case' });
      service.resetData.next(true);
      expect(component.form.controls.name.value).toBe('Reset Case');
    });

    it('rebuilds the form from the service when an example is generated', () => {
      createComponent();
      service.baselineData.getValue()[0] = makeData(0, { name: 'Example Case' });
      service.generateExample.next(true);
      expect(component.form.controls.name.value).toBe('Example Case');
    });

    it('updates the case result when a new output is published', () => {
      createComponent();
      const result = { wcBaseline: 10, wcModification: 5, waterSavings: 5 };
      service.coolingTowerOutput.next({ ...service.coolingTowerOutput.getValue(), coolingTowerCaseResults: [result] });
      expect(component.caseResultData).toBe(result);
    });

    it('copies operating data from new modification data into a modification form', () => {
      createComponent({ isBaseline: false });
      service.modificationData.next([makeData(0, {
        name: 'Ignored', operationalHours: 100, flowRate: 7, coolingLoad: 3, temperatureDifference: 9, userDefinedCoolingLoad: false,
      })]);
      expect(component.form.controls.operationalHours.value).toBe(100);
      expect(component.form.controls.flowRate.value).toBe(7);
      expect(component.form.controls.coolingLoad.value).toBe(3);
      expect(component.form.controls.temperatureDifference.value).toBe(9);
      expect(component.form.controls.userDefinedCoolingLoad.value).toBeFalse();
      expect(component.form.controls.name.value).toBe('Case #1');
    });

    it('ignores modification data without an entry for its index', () => {
      createComponent({ isBaseline: false });
      service.modificationData.next([]);
      expect(component.form.controls.flowRate.value).toBe(1);
    });

    it('does not follow modification data in a baseline form', () => {
      createComponent({ isBaseline: true });
      service.modificationData.next([makeData(0, { flowRate: 99 })]);
      expect(component.form.controls.flowRate.value).toBe(1);
    });
  });

  describe('user actions and calculation triggers', () => {
    beforeEach(() => {
      createComponent();
      spyOn(service, 'updateDataArray').and.callThrough();
    });

    it('calculate sends the form values to the service for its case', () => {
      component.form.controls.waterCost.setValue(0.5);
      component.calculate();
      expect(service.updateDataArray).toHaveBeenCalledWith(service.getObjFromForm(component.form), 0, true);
    });

    it('calculate keeps a user-defined cooling load', () => {
      spyOn(service, 'calculateCoolingLoad').and.returnValue(12);
      component.form.controls.coolingLoad.setValue(4);
      component.calculate();
      expect(service.calculateCoolingLoad).not.toHaveBeenCalled();
      expect(component.form.controls.coolingLoad.value).toBe(4);
    });

    it('calculate derives the cooling load when it is not user defined', () => {
      spyOn(service, 'calculateCoolingLoad').and.returnValue(12);
      component.form.controls.userDefinedCoolingLoad.setValue(false);
      component.calculate();
      expect(service.calculateCoolingLoad).toHaveBeenCalledWith(component.form, IMPERIAL);
      expect(component.form.controls.coolingLoad.value).toBe(12);
    });

    it('showHideInputField switches to a calculated load and recalculates', () => {
      spyOn(service, 'calculateCoolingLoad').and.returnValue(6);
      component.showHideInputField();
      expect(component.form.controls.userDefinedCoolingLoad.value).toBeFalse();
      expect(component.form.controls.coolingLoad.value).toBe(6);
      expect(service.updateDataArray).toHaveBeenCalledTimes(1);
    });

    it('showHideInputField switches back to a user-defined load without recalculating', () => {
      component.form.controls.userDefinedCoolingLoad.setValue(false);
      component.showHideInputField();
      expect(component.form.controls.userDefinedCoolingLoad.value).toBeTrue();
      expect(service.updateDataArray).not.toHaveBeenCalled();
    });

    const driftCases: Array<{ hasDriftEliminator: number, driftLossFactor: number }> = [
      { hasDriftEliminator: 0, driftLossFactor: .2 },
      { hasDriftEliminator: 1, driftLossFactor: .01 },
    ];
    driftCases.forEach(testCase => {
      it(`changeHasDriftEliminator sets the drift loss factor to ${testCase.driftLossFactor} for option ${testCase.hasDriftEliminator}`, () => {
        component.form.controls.hasDriftEliminator.setValue(testCase.hasDriftEliminator);
        component.form.controls.driftLossFactor.setValue(.5);
        component.changeHasDriftEliminator();
        expect(component.form.controls.driftLossFactor.value).toBe(testCase.driftLossFactor);
        expect(service.updateDataArray).toHaveBeenCalledTimes(1);
      });
    });

    it('removeCase asks the service to remove its case', () => {
      spyOn(service, 'removeCase');
      component.removeCase();
      expect(service.removeCase).toHaveBeenCalledWith(0);
    });

    it('updateOperatingHours applies the hours, recalculates and closes the modal', () => {
      component.openOperatingHoursModal();
      component.updateOperatingHours({ hoursPerYear: 1234 } as OperatingHours);
      expect(component.form.controls.operationalHours.value).toBe(1234);
      expect(service.updateDataArray).toHaveBeenCalledTimes(1);
      expect(component.showOperatingHoursModal).toBeFalse();
    });
  });

  describe('case name', () => {
    it('shows the name with a remove link on a baseline case', () => {
      createComponent({ data: { name: 'Tower A' } });
      const label = query('label.group-label');
      expect(label.querySelector('.fa-pencil')).not.toBeNull();
      expect(text(label)).toContain('Tower A');
      expect(text(label.querySelector('a'))).toBe('+Remove Case');
      expect(query('#equipmentName')).toBeNull();
    });

    it('shows the name without a remove link on a modification case', () => {
      createComponent({ isBaseline: false, data: { name: 'Mod A' } });
      const label = query('label.group-label');
      expect(text(label)).toContain('Mod A');
      expect(label.querySelector('a')).toBeNull();
    });

    it('shows the name input while editing and the read-only name after', () => {
      createComponent();
      component.editCaseName();
      fixture.detectChanges();
      expect(query('#equipmentName')).not.toBeNull();
      expect(query('.fa-pencil')).toBeNull();
      expect(query('.fa-save')).not.toBeNull();

      component.doneEditingName();
      fixture.detectChanges();
      expect(query('#equipmentName')).toBeNull();
      expect(query('.fa-pencil')).not.toBeNull();
    });

    it('hides the name error while the name is valid', () => {
      createComponent();
      component.editCaseName();
      fixture.detectChanges();
      setDirty('name', 'Valid');
      expect(errorMessages(query('label.group-label'))).toEqual([]);
    });

    it('hides the name error while an invalid name is pristine', () => {
      createComponent();
      component.editCaseName();
      component.form.controls.name.setValue('');
      fixture.detectChanges();
      expect(errorMessages(query('label.group-label'))).toEqual([]);
    });

    it('shows the required error for an edited empty name', () => {
      createComponent();
      component.editCaseName();
      fixture.detectChanges();
      setDirty('name', '');
      expect(errorMessages(query('label.group-label'))).toEqual(['Please enter a name.']);
    });
  });

  describe('section visibility', () => {
    it('shows the editable operating inputs on a baseline case', () => {
      createComponent();
      expect(query('.form-section.pt-2')).not.toBeNull();
      expect(query('.form-section.pt-1')).toBeNull();
      expect(query('#flowRate_baseline_0')).not.toBeNull();
      expect(query('#waterCost_baseline_0')).not.toBeNull();
      expect(query('#operationalHours_baseline_0')).not.toBeNull();
    });

    it('shows read-only operating values on a modification case', () => {
      createComponent({ isBaseline: false });
      expect(query('.form-section.pt-1')).not.toBeNull();
      expect(query('.form-section.pt-2')).toBeNull();
      expect(query('#flowRate_modification_0')).toBeNull();
    });

    it('renders the water conservation inputs for both cases', () => {
      createComponent({ isBaseline: false });
      expect(query('#cyclesOfConcentration_modification_0')).not.toBeNull();
      expect(query('#hasDriftEliminator_modification_0')).not.toBeNull();
      expect(query('#driftLossFactor_modification_0')).not.toBeNull();
      expect(query('#lossCorrectionFactor_modification_0')).not.toBeNull();
    });

    it('renders one drift eliminator option per choice', () => {
      createComponent();
      const options = Array.from(query('#hasDriftEliminator_baseline_0').querySelectorAll('option')).map(option => text(option));
      expect(options).toEqual(['No', 'Yes']);
    });

    it('shows the operating hours modal only while it is open', () => {
      createComponent();
      expect(query('app-operating-hours-modal')).toBeNull();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('baseline units', () => {
    const unitCases: Array<{ settings: Settings, flowRate: string, waterCost: string, coolingLoad: string }> = [
      { settings: IMPERIAL, flowRate: 'gpm', waterCost: '$/gal', coolingLoad: 'MMBtu/h' },
      { settings: METRIC, flowRate: 'm3/s', waterCost: '$/L', coolingLoad: 'GJ/h' },
    ];
    unitCases.forEach(testCase => {
      it(`shows ${testCase.settings.unitsOfMeasure} units on the editable inputs`, () => {
        createComponent({ settings: testCase.settings });
        const flowUnits = Array.from(groupFor('flowRate_baseline_0').querySelectorAll('.units')).map(unit => text(unit));
        const costUnits = Array.from(groupFor('waterCost_baseline_0').querySelectorAll('.units')).map(unit => text(unit));
        const loadUnits = Array.from(groupFor('coolingLoad').querySelectorAll('.units')).map(unit => text(unit));
        expect(flowUnits).toEqual([testCase.flowRate]);
        expect(costUnits).toEqual([testCase.waterCost]);
        expect(loadUnits).toEqual([testCase.coolingLoad]);
      });
    });

    const temperatureCases: Array<{ settings: Settings, unit: string }> = [
      { settings: IMPERIAL, unit: '℉' },
      { settings: METRIC, unit: '℃' },
    ];
    temperatureCases.forEach(testCase => {
      it(`shows the ${testCase.settings.unitsOfMeasure} temperature unit`, () => {
        createComponent({ settings: testCase.settings, data: { userDefinedCoolingLoad: false } });
        const units = Array.from(groupFor('temperatureDifference').querySelectorAll('.units')).map(unit => text(unit));
        expect(units).toEqual([testCase.unit]);
      });
    });
  });

  describe('baseline cooling load', () => {
    it('shows the cooling load input and hides the temperature difference when the load is user defined', () => {
      createComponent({ data: { userDefinedCoolingLoad: true } });
      expect(query('#coolingLoad')).not.toBeNull();
      expect(query('#temperatureDifference')).toBeNull();
      const links = Array.from(groupFor('coolingLoad').querySelectorAll('label a')).map(link => text(link));
      expect(links).toEqual(['Calculate Cooling Load']);
      expect(groupFor('coolingLoad').querySelector('.justify-content-center')).toBeNull();
    });

    it('shows the temperature difference and the calculated load when the load is not user defined', () => {
      createComponent({ data: { userDefinedCoolingLoad: false, coolingLoad: 1234.5 } });
      expect(query('#temperatureDifference')).not.toBeNull();
      expect(query('#coolingLoad')).toBeNull();
      const loadGroup = query('label[for="coolingLoad"]').closest('.form-group');
      const links = Array.from(loadGroup.querySelectorAll('label a')).map(link => text(link));
      expect(links).toEqual(['Define Cooling Load']);
      const spans = Array.from(loadGroup.querySelectorAll('.justify-content-center span')).map(span => text(span));
      expect(spans).toEqual(['1,234.5', 'MMBtu/h']);
    });

    it('shows dashes and metric units for an empty calculated load', () => {
      createComponent({ settings: METRIC, data: { userDefinedCoolingLoad: false, coolingLoad: 0 } });
      const loadGroup = query('label[for="coolingLoad"]').closest('.form-group');
      const spans = Array.from(loadGroup.querySelectorAll('.justify-content-center span')).map(span => text(span));
      expect(spans).toEqual(['— —', 'GJ/h']);
    });
  });

  describe('baseline validation messages', () => {
    const errorCases: Array<{ control: string, id: string, value: unknown, messages: Array<string>, data?: Partial<CoolingTowerData> }> = [
      { control: 'flowRate', id: 'flowRate_baseline_0', value: 0, messages: ['Value must be greater than 0.'] },
      { control: 'flowRate', id: 'flowRate_baseline_0', value: null, messages: ['Value required.'] },
      { control: 'waterCost', id: 'waterCost_baseline_0', value: null, messages: ['Value required.'] },
      { control: 'waterCost', id: 'waterCost_baseline_0', value: -1, messages: ['Value can\'t be less than 0.'] },
      { control: 'coolingLoad', id: 'coolingLoad', value: null, messages: ['Value required.'] },
      { control: 'coolingLoad', id: 'coolingLoad', value: -1, messages: ['Value can\'t be less than 0.'] },
      { control: 'operationalHours', id: 'operationalHours_baseline_0', value: null, messages: ['Value required.'] },
      { control: 'operationalHours', id: 'operationalHours_baseline_0', value: 9000, messages: ['Value can\'t be greater than 8760.'] },
      { control: 'operationalHours', id: 'operationalHours_baseline_0', value: -1, messages: ['Value can\'t be less than 0.'] },
      { control: 'cyclesOfConcentration', id: 'cyclesOfConcentration_baseline_0', value: null, messages: ['Value required.'] },
      { control: 'cyclesOfConcentration', id: 'cyclesOfConcentration_baseline_0', value: 0, messages: ['Value must be greater than 0.'] },
      { control: 'driftLossFactor', id: 'driftLossFactor_baseline_0', value: null, messages: ['Value required.'] },
      { control: 'driftLossFactor', id: 'driftLossFactor_baseline_0', value: -1, messages: ['Value can\'t be less than 0.'] },
      { control: 'driftLossFactor', id: 'driftLossFactor_baseline_0', value: 2, messages: ['Value can\'t be greater than 1.'] },
      { control: 'lossCorrectionFactor', id: 'lossCorrectionFactor_baseline_0', value: null, messages: ['Value required.'] },
      { control: 'lossCorrectionFactor', id: 'lossCorrectionFactor_baseline_0', value: -1, messages: ['Value can\'t be less than 0.'] },
      { control: 'lossCorrectionFactor', id: 'lossCorrectionFactor_baseline_0', value: 200, messages: ['Value can\'t be greater than 150.'] },
    ];

    errorCases.forEach(testCase => {
      it(`hides the ${testCase.control} error for ${testCase.value} while pristine`, () => {
        createComponent({ data: testCase.data });
        component.form.controls[testCase.control].setValue(testCase.value);
        fixture.detectChanges();
        expect(errorMessages(groupFor(testCase.id))).toEqual([]);
      });

      it(`shows only the matching ${testCase.control} error for ${testCase.value} once edited`, () => {
        createComponent({ data: testCase.data });
        setDirty(testCase.control, testCase.value);
        expect(errorMessages(groupFor(testCase.id))).toEqual(testCase.messages);
      });
    });

    const validCases: Array<{ control: string, id: string, value: number }> = [
      { control: 'flowRate', id: 'flowRate_baseline_0', value: 5 },
      { control: 'waterCost', id: 'waterCost_baseline_0', value: 1 },
      { control: 'coolingLoad', id: 'coolingLoad', value: 1 },
      { control: 'operationalHours', id: 'operationalHours_baseline_0', value: 100 },
      { control: 'cyclesOfConcentration', id: 'cyclesOfConcentration_baseline_0', value: 2 },
      { control: 'driftLossFactor', id: 'driftLossFactor_baseline_0', value: .5 },
      { control: 'lossCorrectionFactor', id: 'lossCorrectionFactor_baseline_0', value: 90 },
    ];
    validCases.forEach(testCase => {
      it(`hides the ${testCase.control} error for an edited valid value`, () => {
        createComponent();
        setDirty(testCase.control, testCase.value);
        expect(groupFor(testCase.id).querySelector('.alert-danger')).toBeNull();
      });
    });

    const temperatureErrorCases: Array<{ settings: Settings, unit: string }> = [
      { settings: IMPERIAL, unit: '℉' },
      { settings: METRIC, unit: '℃' },
    ];
    temperatureErrorCases.forEach(testCase => {
      it(`shows the temperature difference error with the ${testCase.settings.unitsOfMeasure} unit`, () => {
        createComponent({ settings: testCase.settings, data: { userDefinedCoolingLoad: false, temperatureDifference: 5 } });
        setDirty('temperatureDifference', 0);
        const alert = groupFor('temperatureDifference').querySelector('.alert-danger');
        expect(alert).not.toBeNull();
        const message = alert.querySelector(':scope > span');
        expect(text(message)).toContain('Value must be greater than 0.');
        const units = Array.from(message.querySelectorAll('span')).map(unit => text(unit));
        expect(units).toEqual([testCase.unit]);
      });
    });

    it('shows no temperature difference message for an edited empty value', () => {
      createComponent({ data: { userDefinedCoolingLoad: false, temperatureDifference: 5 } });
      setDirty('temperatureDifference', null);
      const alert = groupFor('temperatureDifference').querySelector('.alert-danger');
      expect(alert).not.toBeNull();
      expect(alert.querySelector('span')).toBeNull();
    });

    it('hides the temperature difference error for an edited valid value', () => {
      createComponent({ data: { userDefinedCoolingLoad: false, temperatureDifference: 5 } });
      setDirty('temperatureDifference', 10);
      expect(groupFor('temperatureDifference').querySelector('.alert-danger')).toBeNull();
    });

    it('hides errors on a disabled form', () => {
      createComponent({ selected: false });
      setDirty('flowRate', 0);
      expect(groupFor('flowRate_baseline_0').querySelector('.alert-danger')).toBeNull();
    });
  });

  describe('modification read-only values', () => {
    it('shows the operating values with imperial units', () => {
      createComponent({
        isBaseline: false,
        data: { flowRate: 2500, operationalHours: 1000, coolingLoad: 10, userDefinedCoolingLoad: true },
      });
      expect(Array.from(getModificationGroup('Water Flow Rate').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['2,500', 'gpm']);
      expect(Array.from(getModificationGroup('Cooling Load').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['10', 'MMBtu/h']);
      expect(Array.from(getModificationGroup('Annual Operating Hours').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['1,000', 'hrs/yr']);
    });

    it('shows dashes for empty operating values with metric units', () => {
      createComponent({
        isBaseline: false,
        settings: METRIC,
        data: { flowRate: 0, operationalHours: 0, coolingLoad: 0, temperatureDifference: 0, userDefinedCoolingLoad: false },
      });
      expect(Array.from(getModificationGroup('Water Flow Rate').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['— —', 'm3/s']);
      expect(Array.from(getModificationGroup('Temperature Difference').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['— —', '℃']);
      expect(Array.from(getModificationGroup('Cooling Load').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['— —', 'GJ/h']);
      expect(Array.from(getModificationGroup('Annual Operating Hours').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['— —', 'hrs/yr']);
    });

    it('hides the temperature difference when the cooling load is user defined', () => {
      createComponent({ isBaseline: false, data: { userDefinedCoolingLoad: true } });
      expect(getModificationGroup('Temperature Difference')).toBeUndefined();
    });

    it('shows the temperature difference value with the imperial unit when the load is calculated', () => {
      createComponent({ isBaseline: false, data: { userDefinedCoolingLoad: false, temperatureDifference: 12.5 } });
      expect(Array.from(getModificationGroup('Temperature Difference').querySelectorAll('.input-group span')).map(span => text(span)))
        .toEqual(['12.5', '℉']);
    });

    const loadLabelCases: Array<{ userDefinedCoolingLoad: boolean, label: string }> = [
      { userDefinedCoolingLoad: true, label: 'Calculated Cooling Load' },
      { userDefinedCoolingLoad: false, label: 'Defined Cooling Load' },
    ];
    loadLabelCases.forEach(testCase => {
      it(`labels the cooling load "${testCase.label}" when userDefinedCoolingLoad is ${testCase.userDefinedCoolingLoad}`, () => {
        createComponent({ isBaseline: false, data: { userDefinedCoolingLoad: testCase.userDefinedCoolingLoad } });
        const labelSpans = Array.from(getModificationGroup('Cooling Load').querySelectorAll('label span')).map(span => text(span));
        expect(labelSpans).toEqual([testCase.label]);
      });
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after destroy', () => {
      createComponent();
      const form = component.form;
      fixture.destroy();
      service.resetData.next(true);
      service.generateExample.next(true);
      expect(component.form).toBe(form);
    });

    it('stops following output and modification data after destroy', () => {
      createComponent({ isBaseline: false });
      const result = component.caseResultData;
      fixture.destroy();
      service.coolingTowerOutput.next({ ...service.coolingTowerOutput.getValue(), coolingTowerCaseResults: [{ wcBaseline: 1, wcModification: 1, waterSavings: 0 }] });
      service.modificationData.next([makeData(0, { flowRate: 99 })]);
      expect(component.caseResultData).toBe(result);
      expect(component.form.controls.flowRate.value).toBe(1);
    });
  });
});
