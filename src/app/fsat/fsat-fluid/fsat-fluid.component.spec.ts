import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FsatFluidComponent } from './fsat-fluid.component';
import { FsatFluidService } from './fsat-fluid.service';
import { FsatService } from '../fsat.service';
import { CompareService } from '../compare.service';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { GasDensityFormService } from '../../calculator/fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { BaseGasDensity, FSAT, PsychrometricResults } from '../../shared/models/fans';
import { Settings } from '../../shared/models/settings';

@Pipe({ name: 'settingsLabel', standalone: false })
class SettingsLabelStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Pipe({ name: 'sigFigs', standalone: false })
class SigFigsStubPipe implements PipeTransform {
  transform(value: number): string {
    return String(value);
  }
}

const BASELINE_ID = 'fsat_baseline';
const MOD_ID = 'fsat_modification_0';
const CALCULATED_DENSITY = 0.0765;

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    unitsOfMeasure: 'Imperial',
    fanBarometricPressure: 'inHg',
    fanTemperatureMeasurement: 'F',
    fanPressureMeasurement: 'inH2o',
    densityMeasurement: 'lbscf',
    ...overrides,
  } as Settings;
}

function makeGasDensity(overrides: Partial<BaseGasDensity> = {}): BaseGasDensity {
  return {
    inputType: 'relativeHumidity',
    gasType: 'AIR',
    dryBulbTemp: 68,
    staticPressure: -1,
    barometricPressure: 29.92,
    specificGravity: 1,
    wetBulbTemp: 60,
    relativeHumidity: 50,
    dewPoint: 55,
    gasDensity: 0.075,
    specificHeatGas: 0.24,
    specificHeatRatio: 1.4,
    ...overrides,
  };
}

describe('FsatFluidComponent', () => {
  let component: FsatFluidComponent;
  let fixture: ComponentFixture<FsatFluidComponent>;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;
  let compareServiceSpy: jasmine.SpyObj<CompareService>;
  let convertUnitsSpy: jasmine.SpyObj<ConvertUnitsService>;
  let gasDensityFormServiceSpy: jasmine.SpyObj<GasDensityFormService>;
  let currentField: BehaviorSubject<string>;
  let root: HTMLElement;

  interface InputOverrides {
    baseGasDensity?: BaseGasDensity;
    settings?: Settings;
    baseline?: boolean;
    selected?: boolean;
    inSetup?: boolean;
  }

  function createComponent(overrides: InputOverrides = {}): void {
    fixture = TestBed.createComponent(FsatFluidComponent);
    component = fixture.componentInstance;
    component.baseGasDensity = overrides.baseGasDensity ?? makeGasDensity();
    component.fsat = { baseGasDensity: component.baseGasDensity } as FSAT;
    component.settings = overrides.settings ?? makeSettings();
    component.baseline = overrides.baseline ?? true;
    component.selected = overrides.selected ?? true;
    component.inSetup = overrides.inSetup ?? false;
    component.modificationIndex = 0;
    fixture.detectChanges();
    root = fixture.nativeElement;
  }

  function idString(): string {
    return component.baseline ? BASELINE_ID : MOD_ID;
  }

  /** Finds the form-group wrapper of a field via its label's `for` attribute. */
  function group(labelFor: string): HTMLElement | null {
    return root.querySelector(`label[for="${labelFor}"]`)?.closest('.form-group') ?? null;
  }

  function makeInvalidDirty(controlName: string, value: number | null): void {
    component.gasDensityForm.controls[controlName].setValue(value);
    component.gasDensityForm.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function makePristine(controlName: string): void {
    component.gasDensityForm.controls[controlName].markAsPristine();
    fixture.detectChanges();
  }

  function errorMessages(labelFor: string): HTMLElement[] {
    const error = group(labelFor)?.querySelector('.alert-danger');
    return error ? Array.from(error.querySelectorAll(':scope > span')) : [];
  }

  function optionTexts(controlName: string): string[] {
    return Array.from(root.querySelectorAll(`[formControlName="${controlName}"] option`)).map((o: Element) => o.textContent.trim());
  }

  beforeEach(async () => {
    fsatServiceSpy = jasmine.createSpyObj('FsatService', ['getPsychrometricRelativeHumidity', 'getPsychrometricWetBulb', 'getPsychrometricDewPoint']);
    const makeResults = () => ({ gasDensity: CALCULATED_DENSITY } as PsychrometricResults);
    fsatServiceSpy.getPsychrometricRelativeHumidity.and.callFake(makeResults);
    fsatServiceSpy.getPsychrometricWetBulb.and.callFake(makeResults);
    fsatServiceSpy.getPsychrometricDewPoint.and.callFake(makeResults);

    compareServiceSpy = jasmine.createSpyObj('CompareService', [
      'isDryBulbTempDifferent', 'isStaticPressureDifferent', 'isBarometricPressureDifferent', 'isGasDensityDifferent',
      'isGasTypeDifferent', 'isSpecificGravityDifferent', 'isInputTypeDifferent', 'isSpecificHeatRatioDifferent',
      'isDewPointDifferent', 'isRelativeHumidityDifferent', 'isWetBulbTempDifferent'
    ]);

    // Only used by the real FsatFluidService to derive barometric pressure limits; identity keeps limits at 10 and 60
    convertUnitsSpy = jasmine.createSpyObj('ConvertUnitsService', ['value', 'roundVal']);
    // value() is a fluent builder returning the service itself, so the minimal chain is cast
    convertUnitsSpy.value.and.callFake((val: number) => ({ from: () => ({ to: () => val }) }) as unknown as ConvertUnitsService);
    convertUnitsSpy.roundVal.and.callFake((val: number) => val);

    gasDensityFormServiceSpy = jasmine.createSpyObj('GasDensityFormService', [], {
      baselinePsychrometricResults: new BehaviorSubject<PsychrometricResults>(undefined),
      modificationPsychrometricResults: new BehaviorSubject<PsychrometricResults>(undefined),
      baselineCalculationType: new BehaviorSubject<string>(undefined),
      modificationCalculationType: new BehaviorSubject<string>(undefined),
    });

    currentField = new BehaviorSubject<string>('default');

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FsatFluidComponent, SettingsLabelStubPipe, SigFigsStubPipe],
      providers: [
        FsatFluidService,
        { provide: ConvertUnitsService, useValue: convertUnitsSpy },
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: CompareService, useValue: compareServiceSpy },
        { provide: GasDensityFormService, useValue: gasDensityFormServiceSpy },
        { provide: HelpPanelService, useValue: jasmine.createSpyObj('HelpPanelService', [], { currentField }) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('creates the component', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('uses the baseline id string for the baseline', () => {
      createComponent({ baseline: true });
      expect(component.idString).toBe(BASELINE_ID);
      expect(root.querySelector(`#barometricPressure_${BASELINE_ID}`)).not.toBeNull();
    });

    it('uses the modification id string with the modification index otherwise', () => {
      createComponent({ baseline: false });
      expect(component.idString).toBe(MOD_ID);
      expect(root.querySelector(`#barometricPressure_${MOD_ID}`)).not.toBeNull();
    });

    it('builds the form from the base gas density', () => {
      createComponent();
      expect(component.gasDensityForm.controls.barometricPressure.value).toBe(29.92);
      expect(component.gasDensityForm.controls.gasType.value).toBe('AIR');
    });

    it('disables gas type and input type when not selected', () => {
      createComponent({ selected: false });
      expect(component.gasDensityForm.controls.gasType.disabled).toBeTrue();
      expect(component.gasDensityForm.controls.inputType.disabled).toBeTrue();
      expect(component.gasDensityForm.controls.barometricPressure.enabled).toBeTrue();
    });

    it('keeps the form enabled when selected', () => {
      createComponent({ selected: true });
      expect(component.gasDensityForm.enabled).toBeTrue();
    });

    it('calculates the gas density from the relative humidity and emits during init', () => {
      const emitted: BaseGasDensity[] = [];
      fixture = TestBed.createComponent(FsatFluidComponent);
      fixture.componentInstance.emitSave.subscribe((data: BaseGasDensity) => emitted.push(data));
      fixture.componentInstance.baseGasDensity = makeGasDensity();
      fixture.componentInstance.settings = makeSettings();
      fixture.componentInstance.baseline = true;
      fixture.componentInstance.selected = true;
      fixture.detectChanges();
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).toHaveBeenCalled();
      expect(emitted.length).toBe(1);
      expect(emitted[0].gasDensity).toBe(CALCULATED_DENSITY);
    });
  });

  describe('ngOnChanges', () => {
    it('enables gas type and input type when selected changes to true', () => {
      createComponent({ selected: false });
      component.selected = true;
      component.ngOnChanges({ selected: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false } });
      expect(component.gasDensityForm.controls.gasType.enabled).toBeTrue();
      expect(component.gasDensityForm.controls.inputType.enabled).toBeTrue();
    });

    it('disables gas type and input type when selected changes to false', () => {
      createComponent({ selected: true });
      component.selected = false;
      component.ngOnChanges({ selected: { currentValue: false, previousValue: true, firstChange: false, isFirstChange: () => false } });
      expect(component.gasDensityForm.controls.gasType.disabled).toBeTrue();
      expect(component.gasDensityForm.controls.inputType.disabled).toBeTrue();
    });

    it('rebuilds the form when the modification index changes', () => {
      createComponent();
      const previousForm = component.gasDensityForm;
      component.ngOnChanges({ modificationIndex: { currentValue: 1, previousValue: 0, firstChange: false, isFirstChange: () => false } });
      expect(component.gasDensityForm).not.toBe(previousForm);
    });
  });

  describe('template visibility', () => {
    describe('form wrapper', () => {
      it('renders the form when the gas density form exists', () => {
        createComponent();
        expect(root.querySelector('form')).not.toBeNull();
      });

      it('renders nothing when the gas density form does not exist', () => {
        createComponent();
        component.gasDensityForm = undefined;
        fixture.detectChanges();
        expect(root.querySelector('form')).toBeNull();
        expect(root.querySelector('.form-group')).toBeNull();
      });
    });

    describe('setup header', () => {
      it('hides the header when not in setup', () => {
        createComponent({ inSetup: false });
        expect(root.querySelector('.header')).toBeNull();
      });

      it('shows the Fluid header when in setup', () => {
        createComponent({ inSetup: true });
        expect(root.querySelector('.header h3').textContent.trim()).toBe('Fluid');
      });

      it('applies the larger padding class only when in setup', () => {
        createComponent({ inSetup: true });
        expect(root.querySelector('.p-4')).not.toBeNull();
        expect(root.querySelector('.p-3')).toBeNull();
      });

      it('applies the smaller padding class when not in setup', () => {
        createComponent({ inSetup: false });
        expect(root.querySelector('.p-3')).not.toBeNull();
        expect(root.querySelector('.p-4')).toBeNull();
      });
    });

    describe('barometric pressure', () => {
      it('shows the Pa unit and not the in Hg unit for metric settings', () => {
        createComponent({ settings: makeSettings({ unitsOfMeasure: 'Metric' }) });
        const units = Array.from(group(`barometricPressure_${idString()}`).querySelectorAll('.input-group > .units')).map((u: Element) => u.textContent.trim());
        expect(units).toEqual(['Pa']);
      });

      it('shows the in Hg unit and not the Pa unit for imperial settings', () => {
        createComponent({ settings: makeSettings({ unitsOfMeasure: 'Imperial' }) });
        const units = Array.from(group(`barometricPressure_${idString()}`).querySelectorAll('.input-group > .units')).map((u: Element) => u.textContent.trim());
        expect(units).toEqual(['in Hg']);
      });

      describe('errors', () => {
        beforeEach(() => createComponent());

        it('hides the error when valid', () => {
          expect(errorMessages(`barometricPressure_${idString()}`).length).toBe(0);
          expect(group(`barometricPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.gasDensityForm.controls.barometricPressure.setValue(null);
          makePristine('barometricPressure');
          expect(group(`barometricPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when empty and dirty', () => {
          makeInvalidDirty('barometricPressure', null);
          const messages = errorMessages(`barometricPressure_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Required');
          expect(group(`barometricPressure_${idString()}`).classList).toContain('invalid');
        });

        it('shows only the min message when below the minimum', () => {
          makeInvalidDirty('barometricPressure', 5);
          const messages = errorMessages(`barometricPressure_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain("Value can't be less than");
          expect(messages[0].textContent).toContain('10');
        });

        it('shows only the max message when above the maximum', () => {
          makeInvalidDirty('barometricPressure', 100);
          const messages = errorMessages(`barometricPressure_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain("Value can't be greater than");
          expect(messages[0].textContent).toContain('60');
        });
      });
    });

    describe('specific heat ratio errors', () => {
      beforeEach(() => createComponent());

      it('hides the error when valid', () => {
        expect(group(`specificHeatRatio_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('hides the error when invalid but pristine', () => {
        component.gasDensityForm.controls.specificHeatRatio.setValue(null);
        makePristine('specificHeatRatio');
        expect(group(`specificHeatRatio_${idString()}`).querySelector('.alert-danger')).toBeNull();
      });

      it('shows only the required message when empty and dirty', () => {
        makeInvalidDirty('specificHeatRatio', null);
        const messages = errorMessages(`specificHeatRatio_${idString()}`);
        expect(messages.length).toBe(1);
        expect(messages[0].textContent).toContain('Value Required');
        expect(group(`specificHeatRatio_${idString()}`).classList).toContain('invalid');
      });

      it('shows only the max message when above the maximum', () => {
        makeInvalidDirty('specificHeatRatio', 3);
        const messages = errorMessages(`specificHeatRatio_${idString()}`);
        expect(messages.length).toBe(1);
        expect(messages[0].textContent).toContain("Value can't be greater than");
      });

      it('shows only the greater than message when not above 1', () => {
        makeInvalidDirty('specificHeatRatio', 0.5);
        const messages = errorMessages(`specificHeatRatio_${idString()}`);
        expect(messages.length).toBe(1);
        expect(messages[0].textContent).toContain('Value must be greater than 1.');
      });
    });

    describe('gas type select', () => {
      beforeEach(() => createComponent());

      it('renders one option per gas type', () => {
        expect(optionTexts('gasType')).toEqual(['Air', 'Other Gas']);
      });

      it('renders no gas type options when there are no gas types', () => {
        component.gasTypes = [];
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="gasType"]')).not.toBeNull();
        expect(optionTexts('gasType').length).toBe(0);
      });
    });

    describe('air method section', () => {
      it('shows the method select when the gas type is air', () => {
        createComponent({ baseGasDensity: makeGasDensity({ gasType: 'AIR' }) });
        expect(root.querySelector('[formControlName="inputType"]')).not.toBeNull();
      });

      it('hides the method select and every method field when the gas type is other', () => {
        createComponent({ baseGasDensity: makeGasDensity({ gasType: 'OTHER', inputType: 'custom' }) });
        expect(root.querySelector('[formControlName="inputType"]')).toBeNull();
        expect(root.querySelector('[formControlName="dryBulbTemp"]')).toBeNull();
        expect(root.querySelector('[formControlName="staticPressure"]')).toBeNull();
        expect(root.querySelector('[formControlName="wetBulbTemp"]')).toBeNull();
        expect(root.querySelector('[formControlName="relativeHumidity"]')).toBeNull();
        expect(root.querySelector('[formControlName="dewPoint"]')).toBeNull();
      });

      it('hides the method section even when an air input type is still set for another gas', () => {
        createComponent({ baseGasDensity: makeGasDensity({ gasType: 'OTHER', inputType: 'wetBulb' }) });
        expect(root.querySelector('[formControlName="inputType"]')).toBeNull();
        expect(root.querySelector('[formControlName="wetBulbTemp"]')).toBeNull();
      });

      it('shows the method section again when the gas type changes back to air', () => {
        createComponent({ baseGasDensity: makeGasDensity({ gasType: 'OTHER', inputType: 'custom' }) });
        component.gasDensityForm.controls.gasType.setValue('AIR');
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="inputType"]')).not.toBeNull();
      });

      it('renders one method option per method', () => {
        createComponent();
        expect(optionTexts('inputType')).toEqual(['Relative Humidity %', 'Wet Bulb Temperature', 'Gas Dew Point', 'Use Known Density']);
      });

      it('renders no method options when there are no methods', () => {
        createComponent();
        component.methods = [];
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="inputType"]')).not.toBeNull();
        expect(optionTexts('inputType').length).toBe(0);
      });
    });

    describe('method fields', () => {
      it('shows dry bulb, static pressure, and relative humidity only for the relative humidity method', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'relativeHumidity' }) });
        expect(root.querySelector('[formControlName="dryBulbTemp"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="staticPressure"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="relativeHumidity"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="wetBulbTemp"]')).toBeNull();
        expect(root.querySelector('[formControlName="dewPoint"]')).toBeNull();
      });

      it('shows dry bulb, static pressure, and wet bulb only for the wet bulb method', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'wetBulb' }) });
        expect(root.querySelector('[formControlName="dryBulbTemp"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="staticPressure"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="wetBulbTemp"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="relativeHumidity"]')).toBeNull();
        expect(root.querySelector('[formControlName="dewPoint"]')).toBeNull();
      });

      it('shows dry bulb, static pressure, and dew point only for the dew point method', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'dewPoint' }) });
        expect(root.querySelector('[formControlName="dryBulbTemp"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="staticPressure"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="dewPoint"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="wetBulbTemp"]')).toBeNull();
        expect(root.querySelector('[formControlName="relativeHumidity"]')).toBeNull();
      });

      it('hides every method field for the known density method', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'custom' }) });
        expect(root.querySelector('[formControlName="inputType"]')).not.toBeNull();
        expect(root.querySelector('[formControlName="dryBulbTemp"]')).toBeNull();
        expect(root.querySelector('[formControlName="staticPressure"]')).toBeNull();
        expect(root.querySelector('[formControlName="wetBulbTemp"]')).toBeNull();
        expect(root.querySelector('[formControlName="relativeHumidity"]')).toBeNull();
        expect(root.querySelector('[formControlName="dewPoint"]')).toBeNull();
      });

      it('swaps the method fields when the method changes', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'relativeHumidity' }) });
        component.gasDensityForm.controls.inputType.setValue('dewPoint');
        fixture.detectChanges();
        expect(root.querySelector('[formControlName="relativeHumidity"]')).toBeNull();
        expect(root.querySelector('[formControlName="dewPoint"]')).not.toBeNull();
      });

      describe('dry bulb errors', () => {
        beforeEach(() => createComponent());

        it('hides the error when valid', () => {
          expect(group(`dryBulbTemp_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.gasDensityForm.controls.dryBulbTemp.setValue(null);
          makePristine('dryBulbTemp');
          expect(group(`dryBulbTemp_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows the required message when empty and dirty', () => {
          makeInvalidDirty('dryBulbTemp', null);
          expect(errorMessages(`dryBulbTemp_${idString()}`)[0].textContent).toContain('Required');
          expect(group(`dryBulbTemp_${idString()}`).classList).toContain('invalid');
        });
      });

      describe('static pressure errors', () => {
        beforeEach(() => createComponent());

        it('hides the error when valid', () => {
          expect(group(`staticPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.gasDensityForm.controls.staticPressure.setValue(null);
          makePristine('staticPressure');
          expect(group(`staticPressure_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows the required message when empty and dirty', () => {
          makeInvalidDirty('staticPressure', null);
          expect(errorMessages(`staticPressure_${idString()}`)[0].textContent).toContain('Required');
          expect(group(`staticPressure_${idString()}`).classList).toContain('invalid');
        });
      });

      describe('wet bulb errors', () => {
        beforeEach(() => createComponent({ baseGasDensity: makeGasDensity({ inputType: 'wetBulb' }) }));

        it('hides the error when valid', () => {
          expect(group(`wetBulbTemp_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.gasDensityForm.controls.wetBulbTemp.setValue(null);
          makePristine('wetBulbTemp');
          expect(group(`wetBulbTemp_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when empty and dirty', () => {
          makeInvalidDirty('wetBulbTemp', null);
          const messages = errorMessages(`wetBulbTemp_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Required');
          expect(group(`wetBulbTemp_${idString()}`).classList).toContain('invalid');
        });

        it('shows only the max message when above the dry bulb', () => {
          makeInvalidDirty('wetBulbTemp', 100);
          const messages = errorMessages(`wetBulbTemp_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Value must be less than Dry Bulb');
          expect(messages[0].textContent).toContain('68');
        });
      });

      describe('relative humidity errors', () => {
        beforeEach(() => createComponent({ baseGasDensity: makeGasDensity({ inputType: 'relativeHumidity' }) }));

        it('hides the error when valid', () => {
          expect(group(`relativeHumidity_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.gasDensityForm.controls.relativeHumidity.setValue(null);
          makePristine('relativeHumidity');
          expect(group(`relativeHumidity_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when empty and dirty', () => {
          makeInvalidDirty('relativeHumidity', null);
          const messages = errorMessages(`relativeHumidity_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Required');
          expect(group(`relativeHumidity_${idString()}`).classList).toContain('invalid');
        });

        it('shows only the min message when below 0', () => {
          makeInvalidDirty('relativeHumidity', -5);
          const messages = errorMessages(`relativeHumidity_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain("Value can't be less than 0");
        });

        it('shows only the max message when above 100', () => {
          makeInvalidDirty('relativeHumidity', 150);
          const messages = errorMessages(`relativeHumidity_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain("Value can't be greater than");
          expect(messages[0].textContent).toContain('100 %');
        });
      });

      describe('dew point errors', () => {
        beforeEach(() => createComponent({ baseGasDensity: makeGasDensity({ inputType: 'dewPoint' }) }));

        it('hides the error when valid', () => {
          expect(group(`dewPoint_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.gasDensityForm.controls.dewPoint.setValue(null);
          makePristine('dewPoint');
          expect(group(`dewPoint_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when empty and dirty', () => {
          makeInvalidDirty('dewPoint', null);
          const messages = errorMessages(`dewPoint_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Required');
          expect(group(`dewPoint_${idString()}`).classList).toContain('invalid');
        });

        it('shows only the max message when above the dry bulb', () => {
          makeInvalidDirty('dewPoint', 100);
          const messages = errorMessages(`dewPoint_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Value must be less than Dry Bulb');
          expect(messages[0].textContent).toContain('68');
        });
      });
    });

    describe('gas density', () => {
      const densityLabels = () => Array.from(group(`gasDensity_${idString()}`).querySelectorAll('label > span')).map((s: Element) => s.textContent.trim());

      it('labels the field Air for the air gas type and not Gas', () => {
        createComponent({ baseGasDensity: makeGasDensity({ gasType: 'AIR' }) });
        expect(densityLabels()).toEqual(['Air']);
      });

      it('labels the field Gas for the other gas type and not Air', () => {
        createComponent({ baseGasDensity: makeGasDensity({ gasType: 'OTHER', inputType: 'custom' }) });
        expect(densityLabels()).toEqual(['Gas']);
      });

      it('shows the calculated density and hides the input for calculated methods', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'relativeHumidity' }) });
        const densityGroup = group(`gasDensity_${idString()}`);
        expect(densityGroup.querySelector('[formControlName="gasDensity"]')).toBeNull();
        expect(densityGroup.querySelector('.text-center').textContent).toContain(String(CALCULATED_DENSITY));
      });

      it('shows the input and hides the calculated density for the known density method', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'custom' }) });
        const densityGroup = group(`gasDensity_${idString()}`);
        expect(densityGroup.querySelector('[formControlName="gasDensity"]')).not.toBeNull();
        expect(densityGroup.querySelector('.text-center')).toBeNull();
      });

      describe('errors', () => {
        beforeEach(() => createComponent({ baseGasDensity: makeGasDensity({ inputType: 'custom' }) }));

        it('hides the error when valid', () => {
          expect(group(`gasDensity_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('hides the error when invalid but pristine', () => {
          component.gasDensityForm.controls.gasDensity.setValue(null);
          makePristine('gasDensity');
          expect(group(`gasDensity_${idString()}`).querySelector('.alert-danger')).toBeNull();
        });

        it('shows only the required message when empty and dirty', () => {
          makeInvalidDirty('gasDensity', null);
          const messages = errorMessages(`gasDensity_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Value');
          expect(messages[0].textContent).toContain('Required');
          expect(group(`gasDensity_${idString()}`).classList).toContain('invalid');
        });

        it('shows only the greater than zero message when zero', () => {
          makeInvalidDirty('gasDensity', 0);
          const messages = errorMessages(`gasDensity_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain('Value must be greater than 0');
        });

        it('shows only the max message when a maximum validator fails', () => {
          component.gasDensityForm.controls.gasDensity.addValidators(Validators.max(1));
          makeInvalidDirty('gasDensity', 5);
          const messages = errorMessages(`gasDensity_${idString()}`);
          expect(messages.length).toBe(1);
          expect(messages[0].textContent).toContain("Value can't be greater than");
        });
      });
    });

    describe('difference indicators', () => {
      beforeEach(() => {
        compareServiceSpy.baselineFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
        compareServiceSpy.modifiedFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
      });

      it('shows no indicators when nothing differs', () => {
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'wetBulb' }) });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      it('shows no indicators while in setup even when values differ', () => {
        compareServiceSpy.isBarometricPressureDifferent.and.returnValue(true);
        compareServiceSpy.isGasTypeDifferent.and.returnValue(true);
        createComponent({ inSetup: true });
        expect(root.querySelector('.indicate-different')).toBeNull();
      });

      const cases: Array<{ method: keyof CompareService, labelFor: string, inputType: string }> = [
        { method: 'isBarometricPressureDifferent', labelFor: 'barometricPressure_', inputType: 'relativeHumidity' },
        { method: 'isSpecificHeatRatioDifferent', labelFor: 'specificHeatRatio_', inputType: 'relativeHumidity' },
        { method: 'isGasTypeDifferent', labelFor: 'gasType_', inputType: 'relativeHumidity' },
        { method: 'isInputTypeDifferent', labelFor: 'inputType_', inputType: 'relativeHumidity' },
        { method: 'isDryBulbTempDifferent', labelFor: 'dryBulbTemp_', inputType: 'relativeHumidity' },
        { method: 'isStaticPressureDifferent', labelFor: 'staticPressure_', inputType: 'relativeHumidity' },
        { method: 'isWetBulbTempDifferent', labelFor: 'wetBulbTemp_', inputType: 'wetBulb' },
        { method: 'isRelativeHumidityDifferent', labelFor: 'relativeHumidity_', inputType: 'relativeHumidity' },
        { method: 'isDewPointDifferent', labelFor: 'dewPoint_', inputType: 'dewPoint' },
        { method: 'isGasDensityDifferent', labelFor: 'gasDensity_', inputType: 'custom' },
      ];

      cases.forEach(({ method, labelFor, inputType }) => {
        it(`marks the ${labelFor.replace('_', '')} group when ${method} is true`, () => {
          (compareServiceSpy[method] as jasmine.Spy).and.returnValue(true);
          createComponent({ baseGasDensity: makeGasDensity({ inputType }) });
          expect(group(labelFor + idString()).classList).toContain('indicate-different');
        });
      });

      it('marks the calculated density display when the gas density differs', () => {
        compareServiceSpy.isGasDensityDifferent.and.returnValue(true);
        createComponent({ baseGasDensity: makeGasDensity({ inputType: 'relativeHumidity' }) });
        expect(group(`gasDensity_${idString()}`).querySelector('.text-center').classList).toContain('indicate-different');
      });
    });
  });

  describe('getResults', () => {
    beforeEach(() => createComponent());

    it('calculates from the relative humidity inputs and patches the gas density', () => {
      fsatServiceSpy.getPsychrometricRelativeHumidity.calls.reset();
      component.gasDensityForm.controls.gasDensity.setValue(0.5);
      component.getResults();
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).toHaveBeenCalledTimes(1);
      expect(component.gasDensityForm.controls.gasDensity.value).toBe(CALCULATED_DENSITY);
    });

    it('calculates from the wet bulb inputs', () => {
      component.gasDensityForm.controls.inputType.setValue('wetBulb');
      component.getResults();
      expect(fsatServiceSpy.getPsychrometricWetBulb).toHaveBeenCalled();
      expect(component.gasDensityForm.controls.gasDensity.value).toBe(CALCULATED_DENSITY);
    });

    it('calculates from the dew point inputs', () => {
      component.gasDensityForm.controls.inputType.setValue('dewPoint');
      component.getResults();
      expect(fsatServiceSpy.getPsychrometricDewPoint).toHaveBeenCalled();
      expect(component.gasDensityForm.controls.gasDensity.value).toBe(CALCULATED_DENSITY);
    });

    it('does not calculate and clears the gas density when the method inputs are invalid', () => {
      fsatServiceSpy.getPsychrometricRelativeHumidity.calls.reset();
      component.gasDensityForm.controls.dryBulbTemp.setValue(null);
      component.getResults();
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).not.toHaveBeenCalled();
      expect(component.gasDensityForm.controls.gasDensity.value).toBeUndefined();
    });

    it('clears the gas density when the calculated density is not a number', () => {
      fsatServiceSpy.getPsychrometricRelativeHumidity.and.returnValue({ gasDensity: NaN } as PsychrometricResults);
      component.getResults();
      expect(component.gasDensityForm.controls.gasDensity.value).toBeUndefined();
    });

    it('keeps the entered gas density for the known density method', () => {
      component.gasDensityForm.controls.inputType.setValue('custom');
      component.gasDensityForm.controls.gasDensity.setValue(0.09);
      component.getResults();
      expect(component.gasDensityForm.controls.gasDensity.value).toBe(0.09);
    });

    it('publishes baseline results with dry bulb and barometric pressure for the baseline', () => {
      const results = gasDensityFormServiceSpy.baselinePsychrometricResults.value;
      expect(results.gasDensity).toBe(CALCULATED_DENSITY);
      expect(results.dryBulbTemp).toBe(68);
      expect(results.barometricPressure).toBe(29.92);
      expect(gasDensityFormServiceSpy.baselineCalculationType.value).toBe('relativeHumidity');
      expect(gasDensityFormServiceSpy.modificationPsychrometricResults.value).toBeUndefined();
    });

    it('publishes modification results for a modification', () => {
      createComponent({ baseline: false });
      expect(gasDensityFormServiceSpy.modificationPsychrometricResults.value.gasDensity).toBe(CALCULATED_DENSITY);
      expect(gasDensityFormServiceSpy.modificationCalculationType.value).toBe('relativeHumidity');
    });

    it('re-renders the calculated density', () => {
      fsatServiceSpy.getPsychrometricRelativeHumidity.and.returnValue({ gasDensity: 0.081 } as PsychrometricResults);
      component.getResults();
      fixture.detectChanges();
      expect(group(`gasDensity_${idString()}`).querySelector('.text-center').textContent).toContain('0.081');
    });
  });

  describe('save', () => {
    beforeEach(() => createComponent());

    it('emits the base gas density built from the form', () => {
      const emitted: BaseGasDensity[] = [];
      component.emitSave.subscribe((data: BaseGasDensity) => emitted.push(data));
      component.gasDensityForm.controls.barometricPressure.setValue(30);
      component.save();
      expect(emitted.length).toBe(1);
      expect(emitted[0].barometricPressure).toBe(30);
    });

    it('applies dew point validators bounded by the dry bulb for the dew point method', () => {
      createComponent({ baseGasDensity: makeGasDensity({ inputType: 'dewPoint' }) });
      component.gasDensityForm.controls.dryBulbTemp.setValue(40);
      component.save();
      component.gasDensityForm.controls.dewPoint.setValue(50);
      expect(component.gasDensityForm.controls.dewPoint.errors.max).toBeDefined();
      component.gasDensityForm.controls.dewPoint.setValue(30);
      expect(component.gasDensityForm.controls.dewPoint.valid).toBeTrue();
    });

    it('applies wet bulb validators bounded by the dry bulb for the wet bulb method', () => {
      createComponent({ baseGasDensity: makeGasDensity({ inputType: 'wetBulb' }) });
      component.gasDensityForm.controls.dryBulbTemp.setValue(40);
      component.save();
      component.gasDensityForm.controls.wetBulbTemp.setValue(50);
      expect(component.gasDensityForm.controls.wetBulbTemp.errors.max).toBeDefined();
      component.gasDensityForm.controls.wetBulbTemp.setValue(30);
      expect(component.gasDensityForm.controls.wetBulbTemp.valid).toBeTrue();
    });
  });

  describe('changeGasType', () => {
    beforeEach(() => createComponent());

    it('switches to the known density method and clears method validators for other gases', () => {
      component.gasDensityForm.controls.gasType.setValue('OTHER');
      component.changeGasType();
      expect(component.gasDensityForm.controls.inputType.value).toBe('custom');
      component.gasDensityForm.controls.dryBulbTemp.setValue(null);
      expect(component.gasDensityForm.controls.dryBulbTemp.valid).toBeTrue();
    });

    it('hides the method section after switching to another gas', () => {
      component.gasDensityForm.controls.gasType.setValue('OTHER');
      component.changeGasType();
      fixture.detectChanges();
      expect(root.querySelector('[formControlName="inputType"]')).toBeNull();
    });

    it('recalculates results without changing the method for air', () => {
      fsatServiceSpy.getPsychrometricRelativeHumidity.calls.reset();
      component.gasDensityForm.controls.gasType.setValue('AIR');
      component.changeGasType();
      expect(component.gasDensityForm.controls.inputType.value).toBe('relativeHumidity');
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).toHaveBeenCalled();
    });
  });

  describe('changeMethod', () => {
    beforeEach(() => createComponent());

    it('requires the method inputs when switching to a calculated method', () => {
      component.gasDensityForm.controls.inputType.setValue('custom');
      component.changeMethod();
      component.gasDensityForm.controls.dryBulbTemp.setValue(null);
      expect(component.gasDensityForm.controls.dryBulbTemp.valid).toBeTrue();
      component.gasDensityForm.controls.inputType.setValue('wetBulb');
      component.changeMethod();
      component.gasDensityForm.controls.dryBulbTemp.setValue(null);
      expect(component.gasDensityForm.controls.dryBulbTemp.errors.required).toBeTrue();
    });

    it('recalculates results for the new method', () => {
      component.gasDensityForm.controls.inputType.setValue('dewPoint');
      component.changeMethod();
      expect(fsatServiceSpy.getPsychrometricDewPoint).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('clears the published psychrometric results and calculation types', () => {
      createComponent({ baseline: true });
      expect(gasDensityFormServiceSpy.baselinePsychrometricResults.value).toBeDefined();
      fixture.destroy();
      expect(gasDensityFormServiceSpy.baselinePsychrometricResults.value).toBeUndefined();
      expect(gasDensityFormServiceSpy.modificationPsychrometricResults.value).toBeUndefined();
      expect(gasDensityFormServiceSpy.baselineCalculationType.value).toBeUndefined();
      expect(gasDensityFormServiceSpy.modificationCalculationType.value).toBeUndefined();
    });
  });

  describe('focusField', () => {
    it('publishes the field name to the help panel', () => {
      createComponent();
      component.focusField('gasType');
      expect(currentField.value).toBe('gasType');
    });
  });

  describe('difference helpers', () => {
    beforeEach(() => createComponent());

    it('canCompare is false without both fsats', () => {
      compareServiceSpy.baselineFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
      compareServiceSpy.modifiedFSAT = undefined;
      expect(component.canCompare()).toBeFalse();
      compareServiceSpy.baselineFSAT = undefined;
      compareServiceSpy.modifiedFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
      expect(component.canCompare()).toBeFalse();
    });

    it('canCompare is false while in setup', () => {
      compareServiceSpy.baselineFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
      compareServiceSpy.modifiedFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
      component.inSetup = true;
      expect(component.canCompare()).toBeFalse();
    });

    it('return false without calling the compare service when comparison is not possible', () => {
      compareServiceSpy.baselineFSAT = undefined;
      expect(component.isDryBulbTempDifferent()).toBeFalse();
      expect(component.isStaticPressureDifferent()).toBeFalse();
      expect(component.isBarometricPressureDifferent()).toBeFalse();
      expect(component.isGasDensityDifferent()).toBeFalse();
      expect(component.isGasTypeDifferent()).toBeFalse();
      expect(component.isSpecificGravityDifferent()).toBeFalse();
      expect(component.isInputTypeDifferent()).toBeFalse();
      expect(component.isSpecificHeatRatioDifferent()).toBeFalse();
      expect(component.isDewPointDifferent()).toBeFalse();
      expect(component.isRelativeHumidityDifferent()).toBeFalse();
      expect(component.isWetBulbTempDifferent()).toBeFalse();
      expect(compareServiceSpy.isDryBulbTempDifferent).not.toHaveBeenCalled();
    });

    it('delegate to the compare service when comparison is possible', () => {
      compareServiceSpy.baselineFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
      compareServiceSpy.modifiedFSAT = { baseGasDensity: makeGasDensity() } as FSAT;
      compareServiceSpy.isDryBulbTempDifferent.and.returnValue(true);
      compareServiceSpy.isStaticPressureDifferent.and.returnValue(true);
      compareServiceSpy.isBarometricPressureDifferent.and.returnValue(true);
      compareServiceSpy.isGasDensityDifferent.and.returnValue(true);
      compareServiceSpy.isGasTypeDifferent.and.returnValue(true);
      compareServiceSpy.isSpecificGravityDifferent.and.returnValue(true);
      compareServiceSpy.isInputTypeDifferent.and.returnValue(true);
      compareServiceSpy.isSpecificHeatRatioDifferent.and.returnValue(true);
      compareServiceSpy.isDewPointDifferent.and.returnValue(true);
      compareServiceSpy.isRelativeHumidityDifferent.and.returnValue(true);
      compareServiceSpy.isWetBulbTempDifferent.and.returnValue(true);
      expect(component.isDryBulbTempDifferent()).toBeTrue();
      expect(component.isStaticPressureDifferent()).toBeTrue();
      expect(component.isBarometricPressureDifferent()).toBeTrue();
      expect(component.isGasDensityDifferent()).toBeTrue();
      expect(component.isGasTypeDifferent()).toBeTrue();
      expect(component.isSpecificGravityDifferent()).toBeTrue();
      expect(component.isInputTypeDifferent()).toBeTrue();
      expect(component.isSpecificHeatRatioDifferent()).toBeTrue();
      expect(component.isDewPointDifferent()).toBeTrue();
      expect(component.isRelativeHumidityDifferent()).toBeTrue();
      expect(component.isWetBulbTempDifferent()).toBeTrue();
    });
  });
});
