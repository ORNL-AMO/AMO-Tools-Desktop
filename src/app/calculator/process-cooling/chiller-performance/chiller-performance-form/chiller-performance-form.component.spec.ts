import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ChillerPerformanceFormComponent } from './chiller-performance-form.component';
import { ChillerPerformanceFormService } from '../chiller-performance-form.service';
import { ChillerPerformanceService } from '../chiller-performance.service';
import { ChillerPerformanceInput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

function makeInput(overrides: Partial<ChillerPerformanceInput> = {}): ChillerPerformanceInput {
  return {
    chillerType: 0,
    condenserCoolingType: 0,
    motorDriveType: 0,
    compressorConfigType: 0,
    ariCapacity: 1000,
    ariEfficiency: 0.676,
    maxCapacityRatio: 0.92,
    waterDeltaT: 10,
    waterFlowRate: 2400,
    operatingHours: 8760,
    baselineWaterSupplyTemp: 44,
    baselineWaterEnteringTemp: 85,
    modWaterSupplyTemp: 46,
    modWaterEnteringTemp: 80,
    electricityCost: 0.066,
    ...overrides,
  };
}

// [control id, error kind, invalid value, expected message]
const ERROR_CASES: Array<[string, string, number, string]> = [
  ['ariCapacity', 'required', null, 'Value required.'],
  ['ariCapacity', 'min', -1, "Value can't be less than 0."],
  ['ariEfficiency', 'required', null, 'Value required.'],
  ['ariEfficiency', 'min', -1, "Value can't be less than 0."],
  ['maxCapacityRatio', 'required', null, 'Value required.'],
  ['maxCapacityRatio', 'min', -1, "Value can't be less than 0."],
  ['maxCapacityRatio', 'max', 2, "Value can't be greater than 1"],
  ['operatingHours', 'required', null, 'Value required.'],
  ['operatingHours', 'max', 9000, "Value can't be greater than 8760."],
  ['operatingHours', 'min', -1, "Value can't be less than 0."],
  ['electricityCost', 'required', null, 'Value required.'],
  ['electricityCost', 'min', -1, 'Value cannot not be less than 0.'],
  ['waterFlowRate', 'required', null, 'Value required.'],
  ['waterFlowRate', 'min', -1, "Value can't be less than 0."],
  ['waterDeltaT', 'required', null, 'Value required.'],
  ['waterDeltaT', 'min', -1, "Value can't be less than 0."],
  ['baselineWaterSupplyTemp', 'required', null, 'Value required.'],
  ['baselineWaterSupplyTemp', 'max', 90, "Value can't be greater than Condenser Water Temperature 85"],
  ['baselineWaterEnteringTemp', 'required', null, 'Value required.'],
  ['baselineWaterEnteringTemp', 'min', 40, "Value can't be less than Water Supply Temperature 44."],
  ['modWaterSupplyTemp', 'required', null, 'Value required.'],
  ['modWaterSupplyTemp', 'max', 90, "Value can't be greater than Condenser Water Temperature 80"],
  ['modWaterEnteringTemp', 'required', null, 'Value required.'],
  ['modWaterEnteringTemp', 'min', 40, "Value can't be less than Water Supply Temperature 46."],
];

// [control id, imperial unit, metric unit]
const UNIT_CASES: Array<[string, string, string]> = [
  ['ariCapacity', 'tons', 'kW'],
  ['waterFlowRate', 'GPM', 'm3/s'],
  ['waterDeltaT', '℉', '℃'],
  ['baselineWaterSupplyTemp', '℉', '℃'],
  ['baselineWaterEnteringTemp', '℉', '℃'],
  ['modWaterSupplyTemp', '℉', '℃'],
  ['modWaterEnteringTemp', '℉', '℃'],
];

describe('ChillerPerformanceFormComponent', () => {
  let component: ChillerPerformanceFormComponent;
  let fixture: ComponentFixture<ChillerPerformanceFormComponent>;
  let inputSubject: BehaviorSubject<ChillerPerformanceInput>;
  let resetData: BehaviorSubject<boolean>;
  let generateExample: BehaviorSubject<boolean>;
  let currentField: BehaviorSubject<string>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getOptionTexts(selectId: string): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll(`#${selectId} option`))
      .map((option: HTMLElement) => option.textContent.trim());
  }

  function getFormGroup(controlId: string): HTMLElement {
    return query(`#${controlId}`).closest('.form-group') as HTMLElement;
  }

  function getErrorContainer(controlId: string): HTMLElement | null {
    return getFormGroup(controlId).querySelector('.alert-danger');
  }

  function getErrorMessages(controlId: string): Array<string> {
    return Array.from(getErrorContainer(controlId).querySelectorAll('span'))
      .map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function getUnitTexts(controlId: string): Array<string> {
    return Array.from(getFormGroup(controlId).querySelectorAll('.input-group span.units'))
      .map((span: HTMLElement) => span.textContent.trim())
      .filter(text => text.length > 0);
  }

  function createComponent(input: ChillerPerformanceInput = makeInput(), settings: Settings = IMPERIAL_SETTINGS): void {
    inputSubject.next(input);
    fixture = TestBed.createComponent(ChillerPerformanceFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    inputSubject = new BehaviorSubject<ChillerPerformanceInput>(undefined);
    resetData = new BehaviorSubject<boolean>(undefined);
    generateExample = new BehaviorSubject<boolean>(undefined);
    currentField = new BehaviorSubject<string>(undefined);
    const chillerPerformanceService: Partial<ChillerPerformanceService> = {
      chillerPerformanceInput: inputSubject,
      resetData: resetData,
      generateExample: generateExample,
      currentField: currentField,
    };

    await TestBed.configureTestingModule({
      declarations: [ChillerPerformanceFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        ChillerPerformanceFormService,
        { provide: ChillerPerformanceService, useValue: chillerPerformanceService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('builds the form from the service input', () => {
      createComponent();
      expect(component.form.controls.ariCapacity.value).toBe(1000);
      expect(component.form.controls.electricityCost.value).toBe(0.066);
    });

    it('pushes the form input back to the service on init', () => {
      createComponent();
      expect(inputSubject.getValue()).toEqual(makeInput());
    });

    it('rebuilds the form when reset data is pressed', () => {
      createComponent();
      const firstForm = component.form;
      inputSubject.next(makeInput({ ariCapacity: 0 }));
      resetData.next(true);
      expect(component.form).not.toBe(firstForm);
      expect(component.form.controls.ariCapacity.value).toBe(0);
    });

    it('rebuilds the form when generate example is pressed', () => {
      createComponent();
      const firstForm = component.form;
      inputSubject.next(makeInput({ ariCapacity: 750 }));
      generateExample.next(true);
      expect(component.form).not.toBe(firstForm);
      expect(component.form.controls.ariCapacity.value).toBe(750);
    });

    it('does not rebuild the form when reset emits false', () => {
      createComponent();
      const firstForm = component.form;
      resetData.next(false);
      expect(component.form).toBe(firstForm);
    });
  });

  describe('chiller characteristic options', () => {
    it('shows both chiller and condenser types', () => {
      createComponent();
      expect(getOptionTexts('chillerType')).toEqual(['Centrifugal', 'Screw']);
      expect(getOptionTexts('condenserCoolingType')).toEqual(['Water Cooled', 'Air Cooled']);
    });

    it('drops N/A motor drive and keeps all compressor configs for water-cooled hermetic centrifugal', () => {
      createComponent(makeInput({ chillerType: 0, condenserCoolingType: 0, motorDriveType: 0 }));
      expect(getOptionTexts('motorDriveType')).toEqual(['Hermetic', 'Open']);
      expect(getOptionTexts('compressorConfigType')).toEqual(['No VFD', 'VFD', 'Magnetic Bearing']);
      expect(component.form.controls.compressorConfigType.enabled).toBeTrue();
      expect(component.form.controls.maxCapacityRatio.value).toBe(0.92);
    });

    it('drops magnetic bearing for water-cooled open centrifugal', () => {
      createComponent(makeInput({ chillerType: 0, condenserCoolingType: 0, motorDriveType: 1 }));
      expect(getOptionTexts('motorDriveType')).toEqual(['Hermetic', 'Open']);
      expect(getOptionTexts('compressorConfigType')).toEqual(['No VFD', 'VFD']);
    });

    it('only offers No VFD and disables compressor config for air-cooled centrifugal', () => {
      createComponent(makeInput({ chillerType: 0, condenserCoolingType: 1, compressorConfigType: 1 }));
      expect(getOptionTexts('compressorConfigType')).toEqual(['No VFD']);
      expect(component.form.controls.compressorConfigType.disabled).toBeTrue();
      expect(component.form.controls.compressorConfigType.value).toBe(0);
    });

    it('shows all options and disables screw-specific fields for screw chillers', () => {
      createComponent(makeInput({ chillerType: 1 }));
      expect(getOptionTexts('motorDriveType')).toEqual(['Hermetic', 'Open', 'N/A']);
      expect(getOptionTexts('compressorConfigType')).toEqual(['No VFD', 'VFD', 'Magnetic Bearing']);
      expect(component.form.controls.motorDriveType.disabled).toBeTrue();
      expect(component.form.controls.motorDriveType.value).toBe(2);
      expect(component.form.controls.compressorConfigType.disabled).toBeTrue();
      expect(component.form.controls.maxCapacityRatio.disabled).toBeTrue();
      expect(component.form.controls.maxCapacityRatio.value).toBe(1);
    });

    it('updates the options when the chiller type changes', () => {
      createComponent();
      component.form.controls.chillerType.patchValue(1);
      component.setChillerCharacteristics();
      fixture.detectChanges();
      expect(getOptionTexts('motorDriveType')).toEqual(['Hermetic', 'Open', 'N/A']);
      expect(inputSubject.getValue().motorDriveType).toBe(2);
    });
  });

  describe('units', () => {
    UNIT_CASES.forEach(([controlId, imperial, metric]) => {
      it(`shows ${imperial} for ${controlId} with imperial settings`, () => {
        createComponent(makeInput(), IMPERIAL_SETTINGS);
        expect(getUnitTexts(controlId)).toEqual([imperial]);
      });

      it(`shows ${metric} for ${controlId} with metric settings`, () => {
        createComponent(makeInput(), METRIC_SETTINGS);
        expect(getUnitTexts(controlId)).toEqual([metric]);
      });
    });

    it('shows no unit-system specific units for other unit systems', () => {
      createComponent(makeInput(), { unitsOfMeasure: 'Other' } as Settings);
      expect(getUnitTexts('ariCapacity')).toEqual([]);
      expect(getUnitTexts('waterFlowRate')).toEqual([]);
    });

    it('always shows fixed units', () => {
      createComponent(makeInput(), METRIC_SETTINGS);
      expect(getUnitTexts('ariEfficiency')).toEqual(['kW/ton']);
      expect(getUnitTexts('operatingHours')).toEqual(['hrs/yr']);
      expect(getUnitTexts('electricityCost')).toEqual(['$/kWh']);
    });
  });

  describe('validation messages', () => {
    beforeEach(() => createComponent());

    it('shows no validation messages for a valid form', () => {
      expect(fixture.nativeElement.querySelectorAll('.alert-danger').length).toBe(0);
    });

    ERROR_CASES.forEach(([controlId, kind, value, message]) => {
      it(`shows only the ${kind} message for ${controlId}`, () => {
        const control = component.form.controls[controlId];
        control.setValue(value);
        control.markAsDirty();
        fixture.detectChanges();
        expect(getErrorContainer(controlId)).not.toBeNull();
        expect(getErrorMessages(controlId)).toEqual([message]);
      });
    });

    it('hides messages for an invalid pristine field', () => {
      const control = component.form.controls.ariCapacity;
      control.setValue(null);
      control.markAsPristine();
      fixture.detectChanges();
      expect(getErrorContainer('ariCapacity')).toBeNull();
    });

    it('shows water temperature messages after calculate sets cross-field validators', () => {
      component.form.controls.baselineWaterSupplyTemp.setValue(90);
      component.calculate();
      fixture.detectChanges();
      expect(getErrorMessages('baselineWaterSupplyTemp')).toEqual(["Value can't be greater than Condenser Water Temperature 85"]);
      expect(getErrorMessages('baselineWaterEnteringTemp')).toEqual(["Value can't be less than Water Supply Temperature 90."]);
      expect(getErrorContainer('modWaterSupplyTemp')).toBeNull();
    });
  });

  describe('calculation triggers', () => {
    it('pushes updated input to the service on calculate', () => {
      createComponent();
      component.form.controls.ariCapacity.setValue(1500);
      component.calculate();
      expect(inputSubject.getValue().ariCapacity).toBe(1500);
    });

    it('pushes updated input on each change', () => {
      createComponent();
      component.form.controls.waterDeltaT.setValue(12);
      component.calculate();
      component.form.controls.waterDeltaT.setValue(14);
      component.calculate();
      expect(inputSubject.getValue().waterDeltaT).toBe(14);
    });
  });

  describe('focus', () => {
    it('sets the current help field', () => {
      createComponent();
      component.focusField('ariCapacity');
      expect(currentField.getValue()).toBe('ariCapacity');
    });
  });

  describe('operating hours modal', () => {
    beforeEach(() => createComponent());

    it('hides the modal by default', () => {
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('shows the modal when opened', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
    });

    it('hides the modal when closed', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('applies operating hours, recalculates, and closes the modal', () => {
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.updateOperatingHours({ hoursPerYear: 4000 } as OperatingHours);
      fixture.detectChanges();
      expect(component.form.controls.operatingHours.value).toBe(4000);
      expect(inputSubject.getValue().operatingHours).toBe(4000);
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form on reset and generate after destroy', () => {
      createComponent();
      const form = component.form;
      fixture.destroy();
      resetData.next(true);
      generateExample.next(true);
      expect(component.form).toBe(form);
    });
  });
});
