import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { WaterHeatingFormComponent } from './water-heating-form.component';
import { WaterHeatingService } from '../water-heating.service';
import { WaterHeatingFormService } from '../water-heating-form.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';
import { WaterHeatingInput, WaterHeatingOutput } from '../../../../shared/models/steam/waterHeating';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

function makeSettings(unitsOfMeasure: string = 'Imperial'): Settings {
  const metric = unitsOfMeasure == 'Metric';
  return {
    unitsOfMeasure,
    steamTemperatureMeasurement: metric ? 'C' : 'F',
    steamPressureMeasurement: metric ? 'kPag' : 'psig',
    steamMassFlowMeasurement: metric ? 'kg/hr' : 'lb/hr',
    steamVolumeFlowMeasurement: metric ? 'm3/hr' : 'gpm',
    steamVolumeMeasurement: metric ? 'L' : 'gal',
    fuelCost: 5,
    otherFuelCost: 7,
  } as Settings;
}

function makeInput(overrides: Partial<WaterHeatingInput> = {}): WaterHeatingInput {
  return {
    boilerUtilityType: 'Natural Gas',
    hxUtilityType: 'Natural Gas',
    operatingHours: 7000,
    fuelCost: 6,
    fuelCostBoiler: 6,
    effBoiler: 80,
    waterCost: 0.002,
    treatCost: 0.002,
    pressureSteamIn: 8,
    flowSteamRate: 750,
    temperatureWaterIn: 55,
    pressureWaterOut: 60,
    flowWaterRate: 12,
    effWaterHeater: 72,
    tempMakeupWater: 55,
    presMakeupWater: 15,
    ...overrides,
  };
}

function makeOutput(bpTempWarningFlag: boolean = false): WaterHeatingOutput {
  return { bpTempWarningFlag } as WaterHeatingOutput;
}

const UNIT_CASES: Array<{ field: string, imperial: Array<string>, metric: Array<string> }> = [
  { field: 'fuelCost', imperial: ['$/MMBtu'], metric: ['$/GJ'] },
  { field: 'fuelCostBoiler', imperial: ['$/MMBtu'], metric: ['$/GJ'] },
  { field: 'treatCost', imperial: ['$/gal'], metric: ['$/m3'] },
  { field: 'waterCost', imperial: ['$/gal'], metric: ['$/L'] },
  { field: 'pressureSteamIn', imperial: ['psig'], metric: ['kPag'] },
  { field: 'flowSteamRate', imperial: ['lb/hr'], metric: ['kg/hr'] },
  { field: 'flowWaterRate', imperial: ['gpm'], metric: ['m3/hr'] },
  { field: 'temperatureWaterIn', imperial: ['F'], metric: ['C'] },
];

const ERROR_CASES: Array<{ field: string, value: number, message: string }> = [
  { field: 'operatingHours', value: null, message: 'Value required.' },
  { field: 'operatingHours', value: 9000, message: "Value can't be greater than 8760." },
  { field: 'operatingHours', value: -1, message: "Value can't be less than 0." },
  { field: 'fuelCost', value: null, message: 'Value Required' },
  { field: 'fuelCost', value: -1, message: "Value can't be less than 0." },
  { field: 'fuelCostBoiler', value: null, message: 'Value Required' },
  { field: 'fuelCostBoiler', value: -1, message: "Value can't be less than 0." },
  { field: 'effBoiler', value: null, message: 'Value Required' },
  { field: 'effBoiler', value: 101, message: "Value can't be greater than 100." },
  { field: 'effBoiler', value: -1, message: "Value can't be less than 0." },
  { field: 'waterCost', value: null, message: 'Value Required' },
  { field: 'waterCost', value: -1, message: "Value can't be less than 0 $/gal ." },
  { field: 'treatCost', value: null, message: 'Value Required' },
  { field: 'treatCost', value: -1, message: "Value can't be less than 0." },
  { field: 'effWaterHeater', value: null, message: 'Value Required' },
  { field: 'effWaterHeater', value: -1, message: "Value can't be less than 0." },
  { field: 'effWaterHeater', value: 101, message: "Value can't be greater than 100." },
  { field: 'pressureSteamIn', value: null, message: 'Value Required' },
  { field: 'pressureSteamIn', value: -1, message: "Value can't be less than 0 psig ." },
  { field: 'flowSteamRate', value: null, message: 'Value Required' },
  { field: 'flowSteamRate', value: -1, message: "Value can't be less than 0 lb/hr ." },
  { field: 'flowWaterRate', value: null, message: 'Value Required' },
  { field: 'flowWaterRate', value: -1, message: "Value can't be less than 0 gpm ." },
  { field: 'temperatureWaterIn', value: null, message: 'Value Required' },
  { field: 'pressureWaterOut', value: null, message: 'Value Required' },
  { field: 'pressureWaterOut', value: -1, message: "Value can't be less than 0 psig ." },
  { field: 'tempMakeupWater', value: null, message: 'Value Required' },
  { field: 'tempMakeupWater', value: 10, message: "Value can't be less than 32 F ." },
  { field: 'tempMakeupWater', value: 250, message: "Value can't be greater than 200 F ." },
  { field: 'presMakeupWater', value: null, message: 'Value Required' },
  { field: 'presMakeupWater', value: -1, message: "Value can't be less than 0 psig ." },
];

const WARNING_CASES: Array<{ field: string, value: number, message: string }> = [
  { field: 'temperatureWaterIn', value: 20, message: 'Water HX Inlet Temperature should be 32 or greater' },
  { field: 'tempMakeupWater', value: 40, message: 'Make up water sourced from municipal water should be between 50 and 100' },
  { field: 'tempMakeupWater', value: 150, message: 'Make up water sourced from municipal water should be between 50 and 100' },
];

describe('WaterHeatingFormComponent', () => {
  let component: WaterHeatingFormComponent;
  let fixture: ComponentFixture<WaterHeatingFormComponent>;
  let serviceSpy: jasmine.SpyObj<WaterHeatingService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getInput(field: string): HTMLInputElement | null {
    return fixture.nativeElement.querySelector(`#${field}`);
  }

  function getFormGroup(field: string): HTMLElement {
    return getInput(field).closest('.form-group') as HTMLElement;
  }

  function normalize(el: Element): string {
    return el.textContent.replace(/\s+/g, ' ').trim();
  }

  function getUnitTexts(field: string): Array<string> {
    return Array.from(getFormGroup(field).querySelectorAll('.input-group-addon.units:not(.op-hour-addon)')).map(normalize);
  }

  function getErrorTexts(field: string): Array<string> {
    const alert = getFormGroup(field).querySelector('.alert-danger');
    if (!alert) {
      return [];
    }
    return Array.from(alert.querySelectorAll(':scope > span')).map(normalize);
  }

  function getWarning(field: string): HTMLElement | null {
    return getFormGroup(field).querySelector('.alert-warning');
  }

  function boilingPointWarning(): HTMLElement | null {
    return query('div.alert-warning');
  }

  function createComponent(options: { input?: WaterHeatingInput, settings?: Settings, inTreasureHunt?: boolean } = {}): void {
    serviceSpy.waterHeatingInput.next(options.input ?? makeInput());
    fixture = TestBed.createComponent(WaterHeatingFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', options.settings ?? makeSettings());
    if (options.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', options.inTreasureHunt);
    }
    fixture.detectChanges();
  }

  function setDirtyValue(field: string, value: number): void {
    component.form.controls[field].setValue(value);
    component.form.controls[field].markAsDirty();
    component.calculate();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj<WaterHeatingService>('WaterHeatingService', ['getTreasureHuntFuelCost'], {
      waterHeatingInput: new BehaviorSubject<WaterHeatingInput>(undefined),
      waterHeatingOutput: new BehaviorSubject<WaterHeatingOutput>(makeOutput()),
      resetData: new BehaviorSubject<boolean>(undefined),
      generateExample: new BehaviorSubject<boolean>(undefined),
      currentField: new BehaviorSubject<string>(undefined),
    });

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [WaterHeatingFormComponent, SettingsLabelStubPipe],
      providers: [
        WaterHeatingFormService,
        UntypedFormBuilder,
        ConvertUnitsService,
        { provide: WaterHeatingService, useValue: serviceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('initialization', () => {
    it('builds the form from the service input and publishes it', () => {
      createComponent();
      expect(component.form.controls.operatingHours.value).toBe(7000);
      expect(getInput('operatingHours').value).toBe('7000');
      expect(serviceSpy.waterHeatingInput.getValue()).toEqual(makeInput());
    });

    it('rebuilds the form when data is reset', () => {
      createComponent();
      serviceSpy.waterHeatingInput.next(makeInput({ operatingHours: 250 }));
      serviceSpy.resetData.next(true);
      fixture.detectChanges();
      expect(getInput('operatingHours').value).toBe('250');
    });

    it('rebuilds the form when an example is generated', () => {
      createComponent();
      serviceSpy.waterHeatingInput.next(makeInput({ effBoiler: 70 }));
      serviceSpy.generateExample.next(true);
      fixture.detectChanges();
      expect(getInput('effBoiler').value).toBe('70');
    });
  });

  describe('treasure hunt utility types', () => {
    it('shows the utility type selects in a treasure hunt', () => {
      createComponent({ inTreasureHunt: true });
      expect(getInput('boilerUtilityType')).not.toBeNull();
      expect(getInput('hxUtilityType')).not.toBeNull();
    });

    it('hides the utility type selects outside a treasure hunt', () => {
      createComponent({ inTreasureHunt: false });
      expect(getInput('boilerUtilityType')).toBeNull();
      expect(getInput('hxUtilityType')).toBeNull();
    });

    it('copies the boiler utility type and applies the treasure hunt fuel cost', () => {
      serviceSpy.getTreasureHuntFuelCost.and.returnValue(7);
      createComponent({ inTreasureHunt: true });
      component.form.controls.boilerUtilityType.setValue('Other Fuel');
      component.setUtilityType();
      expect(component.form.controls.hxUtilityType.value).toBe('Other Fuel');
      expect(serviceSpy.getTreasureHuntFuelCost).toHaveBeenCalledWith('Other Fuel', component.settings);
      expect(serviceSpy.waterHeatingInput.getValue()).toEqual(jasmine.objectContaining({
        hxUtilityType: 'Other Fuel', fuelCost: 7, fuelCostBoiler: 7
      }));
    });

    it('copies the boiler utility type without changing fuel cost outside a treasure hunt', () => {
      createComponent({ inTreasureHunt: false });
      component.form.controls.boilerUtilityType.setValue('Other Fuel');
      component.setUtilityType();
      expect(component.form.controls.hxUtilityType.value).toBe('Other Fuel');
      expect(serviceSpy.getTreasureHuntFuelCost).not.toHaveBeenCalled();
      expect(serviceSpy.waterHeatingInput.getValue().fuelCost).toBe(6);
    });
  });

  describe('units', () => {
    UNIT_CASES.forEach(({ field, imperial, metric }) => {
      it(`shows the imperial unit for ${field}`, () => {
        createComponent({ settings: makeSettings('Imperial') });
        expect(getUnitTexts(field)).toEqual(imperial);
      });

      it(`shows the metric unit for ${field}`, () => {
        createComponent({ settings: makeSettings('Metric') });
        expect(getUnitTexts(field)).toEqual(metric);
      });
    });

    it('shows no unit text for unit-system dependent fields with an unknown unit system', () => {
      createComponent({ settings: { ...makeSettings(), unitsOfMeasure: 'Other' } as Settings });
      expect(getUnitTexts('fuelCost')).toEqual(['']);
      expect(getUnitTexts('fuelCostBoiler')).toEqual(['']);
      expect(getUnitTexts('treatCost')).toEqual(['']);
    });
  });

  describe('validation errors', () => {
    ERROR_CASES.forEach(({ field, value, message }) => {
      it(`shows only "${message}" for ${field} = ${value}`, () => {
        createComponent();
        setDirtyValue(field, value);
        expect(getErrorTexts(field)).toEqual([message]);
      });
    });

    it('shows the metric makeup water temperature maximum', () => {
      createComponent({ settings: makeSettings('Metric') });
      setDirtyValue('tempMakeupWater', 150);
      expect(getErrorTexts('tempMakeupWater')).toEqual(["Value can't be greater than 93 C ."]);
    });

    it('hides errors for an invalid but pristine field', () => {
      createComponent({ input: makeInput({ fuelCost: null }) });
      expect(component.form.controls.fuelCost.invalid).toBeTrue();
      expect(getErrorTexts('fuelCost')).toEqual([]);
    });

    it('hides errors for a valid dirty field', () => {
      createComponent();
      setDirtyValue('fuelCost', 3);
      expect(getErrorTexts('fuelCost')).toEqual([]);
    });
  });

  describe('warnings', () => {
    WARNING_CASES.forEach(({ field, value, message }) => {
      it(`shows the ${field} warning for ${value}`, () => {
        createComponent();
        setDirtyValue(field, value);
        expect(normalize(getWarning(field))).toBe(message);
      });
    });

    it('hides the field warnings for typical values', () => {
      createComponent();
      expect(getWarning('temperatureWaterIn')).toBeNull();
      expect(getWarning('tempMakeupWater')).toBeNull();
    });

    it('hides the boiling point warning when the result flag is off', () => {
      createComponent();
      expect(component.showBoilingPointResultWarning).toBeFalse();
      expect(boilingPointWarning()).toBeNull();
    });

    it('shows the boiling point warning when the result flag is on', () => {
      createComponent();
      serviceSpy.waterHeatingOutput.next(makeOutput(true));
      fixture.detectChanges();
      expect(normalize(boilingPointWarning())).toContain('Water temperature at the heat exchanger outlet is 90% value of the boiling point');
    });
  });

  describe('user actions', () => {
    it('focusField publishes the current field', () => {
      createComponent();
      component.focusField('effBoiler');
      expect(serviceSpy.currentField.getValue()).toBe('effBoiler');
    });

    it('calculate publishes the updated input', () => {
      createComponent();
      component.form.controls.operatingHours.setValue(4000);
      component.calculate();
      expect(serviceSpy.waterHeatingInput.getValue().operatingHours).toBe(4000);
    });
  });

  describe('operating hours modal', () => {
    it('is hidden by default', () => {
      createComponent();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('opens and closes', () => {
      createComponent();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('applies the selected operating hours and closes', () => {
      createComponent();
      component.openOperatingHoursModal();
      component.updateOperatingHours({ hoursPerYear: 4000 } as OperatingHours);
      fixture.detectChanges();
      expect(component.form.controls.operatingHours.value).toBe(4000);
      expect(serviceSpy.waterHeatingInput.getValue().operatingHours).toBe(4000);
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after destroy', () => {
      createComponent();
      const form = component.form;
      fixture.destroy();
      serviceSpy.resetData.next(true);
      serviceSpy.generateExample.next(true);
      expect(component.form).toBe(form);
    });

    it('stops tracking the boiling point flag after destroy', () => {
      createComponent();
      fixture.destroy();
      serviceSpy.waterHeatingOutput.next(makeOutput(true));
      expect(component.showBoilingPointResultWarning).toBeFalse();
    });
  });
});
