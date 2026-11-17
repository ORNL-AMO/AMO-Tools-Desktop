import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { WaterReductionFormComponent } from './water-reduction-form.component';
import { WaterReductionService } from '../water-reduction.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { StandaloneService } from '../../../standalone.service';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { WaterReductionData, WaterReductionResult } from '../../../../shared/models/standalone';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

function makeData(overrides: Partial<WaterReductionData> = {}): WaterReductionData {
  return {
    name: 'Equipment #1',
    hoursPerYear: 8760,
    waterCost: 0.005,
    measurementMethod: 0,
    meteredFlowMethodData: { meterReading: 100 },
    volumeMeterMethodData: { initialMeterReading: 4235, finalMeterReading: 5842, elapsedTime: 15 },
    bucketMethodData: { bucketVolume: 10, bucketFillTime: 20 },
    otherMethodData: { consumption: 15000 },
    isWastewater: false,
    ...overrides,
  };
}

function makeResult(waterUse: number = 1234): WaterReductionResult {
  return { waterUse: waterUse, waterCost: 10, annualWaterSavings: 0, costSavings: 0 };
}

// Inputs rendered by each measurement-method section.
const METHOD_SECTIONS: Array<{ method: number, controls: Array<string> }> = [
  { method: 0, controls: ['meterReading'] },
  { method: 1, controls: ['initialMeterReading', 'finalMeterReading', 'elapsedTime'] },
  { method: 2, controls: ['bucketVolume', 'bucketFillTime'] },
  { method: 3, controls: ['consumption'] },
];
const ALL_METHOD_CONTROLS: Array<string> = METHOD_SECTIONS.reduce((all, section) => all.concat(section.controls), []);

// Unit addon text next to each input, per unit system (whitespace-collapsed; <sup>3</sup> reads as "3").
const UNIT_CASES: Array<{ method: number, control: string, imperial: string, metric: string }> = [
  { method: 0, control: 'waterCost', imperial: '$/gal', metric: '$/L' },
  { method: 0, control: 'meterReading', imperial: 'gpm', metric: 'L/min' },
  { method: 1, control: 'initialMeterReading', imperial: 'gal', metric: 'L' },
  { method: 1, control: 'finalMeterReading', imperial: 'gal', metric: 'L' },
  { method: 2, control: 'bucketVolume', imperial: 'gal', metric: 'L' },
  { method: 3, control: 'consumption', imperial: 'gal/yr', metric: 'm3/yr' },
];

// Validation messages under each input: [control, method that shows the input, invalid value, expected message].
// Method-data controls get their validators set in the test, since the template is what is under test here.
const ERROR_CASES: Array<{ control: string, method: number, value: number, message: string }> = [
  { control: 'hoursPerYear', method: 0, value: null, message: 'Value required.' },
  { control: 'hoursPerYear', method: 0, value: 9000, message: "Value can't be greater than 8760." },
  { control: 'hoursPerYear', method: 0, value: -1, message: "Value can't be less than 0." },
  { control: 'waterCost', method: 0, value: null, message: 'Value required.' },
  { control: 'waterCost', method: 0, value: -1, message: "Value can't be less than 0." },
  { control: 'meterReading', method: 0, value: null, message: 'Value required.' },
  { control: 'meterReading', method: 0, value: -1, message: "Value can't be less than 0." },
  { control: 'initialMeterReading', method: 1, value: null, message: 'Value required.' },
  { control: 'initialMeterReading', method: 1, value: -1, message: "Value can't be less than 0." },
  { control: 'finalMeterReading', method: 1, value: null, message: 'Value required.' },
  { control: 'finalMeterReading', method: 1, value: -1, message: "Value can't be less than 0." },
  { control: 'elapsedTime', method: 1, value: null, message: 'Value required.' },
  { control: 'elapsedTime', method: 1, value: -1, message: "Value can't be less than 0." },
  { control: 'bucketVolume', method: 2, value: null, message: 'Value required.' },
  { control: 'bucketVolume', method: 2, value: -1, message: "Value can't be less than 0." },
  { control: 'bucketFillTime', method: 2, value: null, message: 'Value required.' },
  { control: 'bucketFillTime', method: 2, value: -1, message: "Value can't be less than 0." },
  { control: 'consumption', method: 3, value: null, message: 'Value required.' },
  { control: 'consumption', method: 3, value: -1, message: "Value can't be less than 0." },
];
const SERVICE_VALIDATED_CONTROLS: Array<string> = ['hoursPerYear', 'waterCost'];

describe('WaterReductionFormComponent', () => {
  let component: WaterReductionFormComponent;
  let fixture: ComponentFixture<WaterReductionFormComponent>;
  let service: WaterReductionService;
  let standaloneServiceSpy: jasmine.SpyObj<StandaloneService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function inputFor(control: string): HTMLElement | null {
    return query(`[formControlName="${control}"]`);
  }

  function collapse(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  // The unit addon(s) after an input, inside the same .input-group.
  function unitsFor(control: string): Array<string> {
    return Array.from(inputFor(control).parentElement.querySelectorAll('span.units'))
      .filter((span: HTMLElement) => !span.classList.contains('op-hour-addon'))
      .map((span: HTMLElement) => collapse(span.textContent));
  }

  // The validation block after an input's .input-group, inside the same .form-group.
  function errorTextFor(control: string): string | null {
    const errorBlock: HTMLElement = inputFor(control).closest('.form-group').querySelector('span.alert-danger');
    return errorBlock ? collapse(errorBlock.textContent) : null;
  }

  function setMethod(method: number): void {
    component.form.controls.measurementMethod.setValue(method);
    fixture.detectChanges();
  }

  function render(inputs: {
    data?: WaterReductionData, index?: number, isBaseline?: boolean, selected?: boolean,
    isWastewater?: boolean, settings?: Settings
  } = {}): void {
    fixture = TestBed.createComponent(WaterReductionFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', inputs.settings ?? IMPERIAL_SETTINGS);
    fixture.componentRef.setInput('data', inputs.data ?? makeData());
    fixture.componentRef.setInput('index', inputs.index ?? 0);
    fixture.componentRef.setInput('isBaseline', inputs.isBaseline ?? true);
    fixture.componentRef.setInput('selected', inputs.selected ?? true);
    fixture.componentRef.setInput('isWastewater', inputs.isWastewater ?? false);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    standaloneServiceSpy = jasmine.createSpyObj('StandaloneService', ['waterReduction']);
    standaloneServiceSpy.waterReduction.and.callFake(() => makeResult());

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [WaterReductionFormComponent],
      providers: [
        WaterReductionService,
        ConvertUnitsService,
        { provide: StandaloneService, useValue: standaloneServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    service = TestBed.inject(WaterReductionService);
    spyOn(service, 'getFormFromObj').and.callThrough();
    spyOn(service, 'setValidators').and.callThrough();
    spyOn(service, 'calculateIndividualEquipment').and.returnValue(makeResult(1234));
  });

  describe('initialization', () => {
    it('builds the form from the input data, index, and baseline flag', () => {
      const data = makeData({ name: 'Rinse Line', waterCost: 0.01 });
      render({ data: data, index: 0, isBaseline: true });
      expect(service.getFormFromObj).toHaveBeenCalledWith(data, 0, true);
      expect(component.form.controls.name.value).toBe('Rinse Line');
      expect(component.form.controls.waterCost.value).toBe(0.01);
    });

    it('builds a baseline id string', () => {
      render({ index: 1, isBaseline: true });
      expect(component.idString).toBe('baseline_1');
      expect(inputFor('hoursPerYear').id).toBe('hoursPerYear_baseline_1');
    });

    it('builds a modification id string', () => {
      render({ index: 2, isBaseline: false });
      expect(component.idString).toBe('modification_2');
      expect(inputFor('waterCost').id).toBe('waterCost_modification_2');
    });

    it('calculates the individual result from the form values', () => {
      render({ settings: METRIC_SETTINGS });
      expect(service.calculateIndividualEquipment).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Equipment #1' }), METRIC_SETTINGS);
      expect(component.individualResults).toEqual(makeResult(1234));
    });

    it('disables the form when not selected', () => {
      render({ selected: false });
      expect(component.form.disabled).toBeTrue();
    });

    it('leaves the form enabled when selected', () => {
      render({ selected: true });
      expect(component.form.controls.name.enabled).toBeTrue();
    });

    it('enables the calculator type only for the first baseline equipment', () => {
      render({ index: 0, isBaseline: true });
      expect(component.form.controls.isWastewater.enabled).toBeTrue();
    });

    it('disables the calculator type for later baseline equipment and modifications', () => {
      render({ index: 1, isBaseline: true });
      expect(component.form.controls.isWastewater.disabled).toBeTrue();
      render({ index: 0, isBaseline: false });
      expect(component.form.controls.isWastewater.disabled).toBeTrue();
    });
  });

  describe('input changes', () => {
    it('patches the calculator type when isWastewater changes', () => {
      render({ isWastewater: false });
      fixture.componentRef.setInput('isWastewater', true);
      fixture.detectChanges();
      expect(component.form.controls.isWastewater.value).toBeTrue();
    });

    it('disables the form when deselected', () => {
      render({ selected: true });
      fixture.componentRef.setInput('selected', false);
      fixture.detectChanges();
      expect(component.form.disabled).toBeTrue();
    });

    it('re-enables the first baseline form including the calculator type when reselected', () => {
      render({ selected: false, index: 0, isBaseline: true });
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.form.controls.name.enabled).toBeTrue();
      expect(component.form.controls.isWastewater.enabled).toBeTrue();
    });

    it('re-enables a modification form but keeps its calculator type disabled', () => {
      render({ selected: false, index: 0, isBaseline: false });
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.form.controls.name.enabled).toBeTrue();
      expect(component.form.controls.isWastewater.disabled).toBeTrue();
    });

    it('re-enables a later baseline form but keeps its calculator type disabled', () => {
      render({ selected: false, index: 1, isBaseline: true });
      fixture.componentRef.setInput('selected', true);
      fixture.detectChanges();
      expect(component.form.controls.isWastewater.disabled).toBeTrue();
    });
  });

  describe('validator toggling', () => {
    it('re-applies validators for the selected measurement method and recalculates', () => {
      render();
      const emitted: Array<WaterReductionData> = [];
      component.emitCalculate.subscribe(data => emitted.push(data));
      (service.setValidators as jasmine.Spy).calls.reset();

      component.form.controls.measurementMethod.setValue(3);
      component.changeMeasurementMethod();

      expect(service.setValidators).toHaveBeenCalledWith(component.form);
      expect(emitted.length).toBe(1);
      expect(emitted[0].measurementMethod).toBe(3);
    });

    it('makes consumption required after switching to the offsheet method', () => {
      render();
      component.form.controls.measurementMethod.setValue(3);
      component.changeMeasurementMethod();
      component.form.controls.consumption.setValue(null);
      expect(component.form.controls.consumption.hasError('required')).toBeTrue();
    });

    it('leaves consumption without validators while another method is selected', () => {
      render({ data: makeData({ measurementMethod: 2 }) });
      component.form.controls.consumption.setValue(null);
      expect(component.form.controls.consumption.valid).toBeTrue();
    });

    it('re-applies validators and recalculates when the calculator type changes', () => {
      render();
      const emitted: Array<WaterReductionData> = [];
      component.emitCalculate.subscribe(data => emitted.push(data));
      (service.setValidators as jasmine.Spy).calls.reset();

      component.form.controls.isWastewater.setValue(true);
      component.changeCalculatorType();

      expect(service.setValidators).toHaveBeenCalledWith(component.form);
      expect(emitted[0].isWastewater).toBeTrue();
    });
  });

  describe('user actions', () => {
    beforeEach(() => {
      render({ index: 2 });
    });

    it('calculate emits the form data and recalculates the individual result', () => {
      const emitted: Array<WaterReductionData> = [];
      component.emitCalculate.subscribe(data => emitted.push(data));
      (service.calculateIndividualEquipment as jasmine.Spy).and.returnValue(makeResult(999));

      component.form.controls.waterCost.setValue(0.02);
      component.calculate();

      expect(emitted.length).toBe(1);
      expect(emitted[0].waterCost).toBe(0.02);
      expect(component.individualResults.waterUse).toBe(999);
    });

    it('renders the updated individual result after recalculating', () => {
      (service.calculateIndividualEquipment as jasmine.Spy).and.returnValue(makeResult(4321));
      component.calculate();
      fixture.detectChanges();
      expect(collapse(query('.row .col-6.text-center').textContent)).toBe('4,321 kgal/yr');
    });

    it('removeEquipment emits the form index', () => {
      const emitted: Array<number> = [];
      component.emitRemoveEquipment.subscribe(index => emitted.push(index));
      component.removeEquipment();
      expect(emitted).toEqual([2]);
    });

    it('editEquipmentName and doneEditingName toggle name editing', () => {
      component.editEquipmentName();
      expect(component.isEditingName).toBeTrue();
      component.doneEditingName();
      expect(component.isEditingName).toBeFalse();
    });

    it('focusField emits the focused field name', () => {
      const emitted: Array<string> = [];
      component.emitChangeField.subscribe(field => emitted.push(field));
      component.focusField('bucketVolume');
      expect(emitted).toEqual(['bucketVolume']);
    });

    it('openOperatingHoursModal and closeOperatingHoursModal toggle the modal flag', () => {
      component.openOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeTrue();
      component.closeOperatingHoursModal();
      expect(component.showOperatingHoursModal).toBeFalse();
    });

    it('updateOperatingHours stores the hours, patches the form, recalculates, and closes the modal', () => {
      const emitted: Array<WaterReductionData> = [];
      component.emitCalculate.subscribe(data => emitted.push(data));
      const hours = { hoursPerYear: 4000 } as OperatingHours;
      component.openOperatingHoursModal();

      component.updateOperatingHours(hours);

      expect(service.operatingHours).toBe(hours);
      expect(component.form.controls.hoursPerYear.value).toBe(4000);
      expect(emitted[0].hoursPerYear).toBe(4000);
      expect(component.showOperatingHoursModal).toBeFalse();
    });
  });

  describe('template visibility', () => {
    describe('equipment name', () => {
      beforeEach(() => {
        render({ data: makeData({ name: 'Rinse Line' }) });
      });

      it('shows the name label and hides the name input when not editing', () => {
        expect(query('label.group-label').textContent).toContain('Rinse Line');
        expect(query('.fa-pencil')).not.toBeNull();
        expect(query('#equipmentName')).toBeNull();
      });

      it('shows the name input and hides the name label when editing', () => {
        component.editEquipmentName();
        fixture.detectChanges();
        expect(query('#equipmentName')).not.toBeNull();
        expect(query('.fa-pencil')).toBeNull();
      });

      it('hides the name error while editing a valid name', () => {
        component.editEquipmentName();
        component.form.controls.name.markAsDirty();
        fixture.detectChanges();
        expect(query('label.group-label .alert-danger')).toBeNull();
      });

      it('hides the name error for an empty but pristine name', () => {
        component.editEquipmentName();
        component.form.controls.name.setValue('');
        fixture.detectChanges();
        expect(query('label.group-label .alert-danger')).toBeNull();
      });

      it('shows the required message for an empty, edited name', () => {
        component.editEquipmentName();
        component.form.controls.name.setValue('');
        component.form.controls.name.markAsDirty();
        fixture.detectChanges();
        expect(collapse(query('label.group-label .alert-danger').textContent)).toBe('Please enter a name.');
      });
    });

    describe('dropdown options', () => {
      beforeEach(() => {
        render();
      });

      it('lists both calculator types', () => {
        const options = Array.from(inputFor('isWastewater').querySelectorAll('option')).map(option => option.textContent.trim());
        expect(options).toEqual(['Water', 'Wastewater']);
      });

      it('lists every measurement method', () => {
        const options = Array.from(inputFor('measurementMethod').querySelectorAll('option')).map(option => option.textContent.trim());
        expect(options).toEqual(['Metered Flow', 'Volume Meter', 'Bucket Method', 'Offsheet / Other Method']);
      });
    });

    describe('measurement method sections', () => {
      METHOD_SECTIONS.forEach(section => {
        it(`shows only the method ${section.method} inputs when method ${section.method} is selected`, () => {
          render({ data: makeData({ measurementMethod: section.method }) });
          ALL_METHOD_CONTROLS.forEach(control => {
            const shouldShow = section.controls.includes(control);
            expect(inputFor(control) !== null).withContext(control).toBe(shouldShow);
          });
        });
      });

      it('swaps the visible section when the method changes', () => {
        render();
        expect(inputFor('meterReading')).not.toBeNull();
        setMethod(2);
        expect(inputFor('meterReading')).toBeNull();
        expect(inputFor('bucketVolume')).not.toBeNull();
      });
    });

    describe('consumption label', () => {
      function consumptionLabels(): Array<string> {
        return Array.from(fixture.nativeElement.querySelectorAll('label'))
          .filter((label: HTMLLabelElement) => label.getAttribute('for') === 'consumption_' + component.idString)
          .map((label: HTMLLabelElement) => label.textContent.trim());
      }

      it('shows "Water Consumption" for water in the offsheet method', () => {
        render({ data: makeData({ measurementMethod: 3 }), isWastewater: false });
        expect(consumptionLabels()).toEqual(['Water Consumption']);
      });

      it('shows "Wastewater Disposal" for wastewater in the offsheet method', () => {
        render({ data: makeData({ measurementMethod: 3 }), isWastewater: true });
        expect(consumptionLabels()).toEqual(['Wastewater Disposal']);
      });

      it('shows neither label when wastewater is set but another method is selected', () => {
        render({ data: makeData({ measurementMethod: 0 }), isWastewater: true });
        expect(consumptionLabels()).toEqual([]);
      });
    });

    describe('units', () => {
      UNIT_CASES.forEach(unitCase => {
        it(`shows imperial units for ${unitCase.control}`, () => {
          render({ data: makeData({ measurementMethod: unitCase.method }), settings: IMPERIAL_SETTINGS });
          expect(unitsFor(unitCase.control)).toEqual([unitCase.imperial]);
        });

        it(`shows metric units for ${unitCase.control}`, () => {
          render({ data: makeData({ measurementMethod: unitCase.method }), settings: METRIC_SETTINGS });
          expect(unitsFor(unitCase.control)).toEqual([unitCase.metric]);
        });
      });

      it('shows fixed units for operating hours, elapsed time, and bucket fill time', () => {
        render({ data: makeData({ measurementMethod: 1 }) });
        expect(unitsFor('hoursPerYear')).toEqual(['hrs/yr']);
        expect(unitsFor('elapsedTime')).toEqual(['min']);
        setMethod(2);
        expect(unitsFor('bucketFillTime')).toEqual(['sec']);
      });
    });

    describe('validation messages', () => {
      ERROR_CASES.forEach(errorCase => {
        it(`shows "${errorCase.message}" for ${errorCase.control} = ${errorCase.value}`, () => {
          render({ data: makeData({ measurementMethod: errorCase.method }) });
          const control = component.form.controls[errorCase.control];
          if (!SERVICE_VALIDATED_CONTROLS.includes(errorCase.control)) {
            control.setValidators([Validators.required, Validators.min(0)]);
          }
          control.setValue(errorCase.value);
          control.markAsDirty();
          fixture.detectChanges();
          expect(errorTextFor(errorCase.control)).toBe(errorCase.message);
        });
      });

      it('hides the message for an invalid but pristine value', () => {
        render();
        component.form.controls.hoursPerYear.setValue(null);
        fixture.detectChanges();
        expect(errorTextFor('hoursPerYear')).toBeNull();
      });

      it('hides the message for a valid, edited value', () => {
        render();
        component.form.controls.hoursPerYear.setValue(100);
        component.form.controls.hoursPerYear.markAsDirty();
        fixture.detectChanges();
        expect(errorTextFor('hoursPerYear')).toBeNull();
      });
    });

    describe('individual result row', () => {
      function resultLabels(): Array<string> {
        return Array.from(fixture.nativeElement.querySelectorAll('.row label')).map((label: HTMLElement) => label.textContent.trim());
      }

      it('labels the result as water consumption in kgal/yr for imperial water', () => {
        render({ isWastewater: false, settings: IMPERIAL_SETTINGS });
        expect(resultLabels()).toEqual(['Water Consumption']);
        expect(collapse(query('.row .col-6.text-center').textContent)).toBe('1,234 kgal/yr');
      });

      it('labels the result as wastewater disposal in m3/yr for metric wastewater', () => {
        render({ isWastewater: true, settings: METRIC_SETTINGS });
        expect(resultLabels()).toEqual(['Wastewater Disposal']);
        expect(collapse(query('.row .col-6.text-center').textContent)).toBe('1,234 m3/yr');
      });
    });

    describe('operating hours modal', () => {
      beforeEach(() => {
        render();
      });

      it('hides the modal by default', () => {
        expect(query('app-operating-hours-modal')).toBeNull();
      });

      it('shows the modal when opened', () => {
        component.openOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).not.toBeNull();
      });

      it('hides the modal again when closed', () => {
        component.openOperatingHoursModal();
        fixture.detectChanges();
        component.closeOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).toBeNull();
      });
    });
  });
});
