import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { GasDensityFormComponent } from './gas-density-form.component';
import { GasDensityFormService } from './gas-density-form.service';
import { FanAnalysisService } from '../../fan-analysis.service';
import { ConvertUnitsService } from '../../../../../shared/convert-units/convert-units.service';
import { FsatService } from '../../../../../fsat/fsat.service';
import { BaseGasDensity, PsychrometricResults } from '../../../../../shared/models/fans';
import { Settings } from '../../../../../shared/models/settings';

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

function makeSettings(fanTemperatureMeasurement: string = 'F'): Settings {
  return {
    unitsOfMeasure: 'Imperial',
    fanTemperatureMeasurement,
    fanBarometricPressure: 'inHg',
    fanPressureMeasurement: 'inH2o',
    densityMeasurement: 'lbscf',
  } as Settings;
}

function makeGasDensity(overrides: Partial<BaseGasDensity> = {}): BaseGasDensity {
  return {
    ...new FanAnalysisService(null, null, null, null).getDefaultData().BaseGasDensity,
    dryBulbTemp: 70,
    staticPressure: 0,
    barometricPressure: 29.92,
    specificGravity: 1,
    relativeHumidity: 50,
    wetBulbTemp: 60,
    dewPoint: 50,
    ...overrides,
  };
}

function makePsychrometricResults(gasDensity: number = 0.0712): PsychrometricResults {
  return { gasDensity } as PsychrometricResults;
}

const TEMPERATURE_UNITS: Array<{ unit: string, label: string }> = [
  { unit: 'F', label: '℉' },
  { unit: 'C', label: '℃' },
  { unit: 'K', label: 'K' },
  { unit: 'R', label: '°R' },
];

// Fields shown for every non-custom method, the method used to test them, and their messages.
const FIELD_ERRORS: Array<{ name: string, inputType: string, cases: Array<{ value: number, message: string }> }> = [
  {
    name: 'dryBulbTemp', inputType: 'relativeHumidity', cases: [
      { value: null, message: 'Value Required' },
      { value: 1001, message: `Value can't be greater than 1000.` },
      { value: -101, message: `Value can't be less than -100.` },
    ]
  },
  {
    name: 'staticPressure', inputType: 'relativeHumidity', cases: [
      { value: null, message: 'Value Required' },
      { value: 401, message: `Value can't be greater than 400.` },
      { value: -401, message: `Value can't be less than -400.` },
    ]
  },
  {
    name: 'barometricPressure', inputType: 'relativeHumidity', cases: [
      { value: null, message: 'Value Required' },
      { value: 61, message: `Value can't be greater than 60.` },
      { value: 9, message: `Value can't be less than 10.` },
    ]
  },
  {
    name: 'specificGravity', inputType: 'relativeHumidity', cases: [
      { value: null, message: 'Value Required' },
      { value: 3, message: `Value can't be greater than 2.` },
      { value: -1, message: `Value can't be less than 0.` },
    ]
  },
  {
    name: 'relativeHumidity', inputType: 'relativeHumidity', cases: [
      { value: null, message: 'Value Required' },
      { value: 101, message: `Value can't be greater than 100.` },
      { value: -1, message: `Value can't be less than 0.` },
    ]
  },
  {
    name: 'wetBulbTemp', inputType: 'wetBulb', cases: [
      { value: null, message: 'Value Required' },
      { value: 71, message: `Value can't be greater than 70.` },
      { value: 31, message: `Value can't be less than 32.` },
    ]
  },
  {
    name: 'dewPoint', inputType: 'dewPoint', cases: [
      { value: null, message: 'Value Required' },
      { value: 71, message: `Value can't be greater than 70.` },
      { value: -31, message: `Value can't be less than -30.` },
    ]
  },
];

// Which method-specific inputs render for each method.
const METHOD_FIELDS: Array<{ inputType: string, shared: boolean, wetBulbTemp: boolean, relativeHumidity: boolean, dewPoint: boolean, gasDensityInput: boolean }> = [
  { inputType: 'relativeHumidity', shared: true, wetBulbTemp: false, relativeHumidity: true, dewPoint: false, gasDensityInput: false },
  { inputType: 'wetBulb', shared: true, wetBulbTemp: true, relativeHumidity: false, dewPoint: false, gasDensityInput: false },
  { inputType: 'dewPoint', shared: true, wetBulbTemp: false, relativeHumidity: false, dewPoint: true, gasDensityInput: false },
  { inputType: 'custom', shared: false, wetBulbTemp: false, relativeHumidity: false, dewPoint: false, gasDensityInput: true },
];

describe('GasDensityFormComponent', () => {
  let component: GasDensityFormComponent;
  let fixture: ComponentFixture<GasDensityFormComponent>;
  let fanAnalysisService: FanAnalysisService;
  let gasDensityFormService: GasDensityFormService;
  let fsatServiceSpy: jasmine.SpyObj<FsatService>;

  async function createComponent(gasDensity: BaseGasDensity = makeGasDensity(), settings: Settings = makeSettings()) {
    fanAnalysisService = new FanAnalysisService(null, null, null, null);
    fanAnalysisService.inputData = fanAnalysisService.getDefaultData();
    fanAnalysisService.inputData.BaseGasDensity = gasDensity;
    fsatServiceSpy = jasmine.createSpyObj('FsatService', [
      'getPsychrometricRelativeHumidity',
      'getPsychrometricWetBulb',
      'getPsychrometricDewPoint',
    ]);
    fsatServiceSpy.getPsychrometricRelativeHumidity.and.callFake(() => makePsychrometricResults());
    fsatServiceSpy.getPsychrometricWetBulb.and.callFake(() => makePsychrometricResults());
    fsatServiceSpy.getPsychrometricDewPoint.and.callFake(() => makePsychrometricResults());

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [GasDensityFormComponent, SettingsLabelStubPipe, SigFigsStubPipe],
      providers: [
        GasDensityFormService,
        ConvertUnitsService,
        UntypedFormBuilder,
        { provide: FsatService, useValue: fsatServiceSpy },
        { provide: FanAnalysisService, useValue: fanAnalysisService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    gasDensityFormService = TestBed.inject(GasDensityFormService);
    fixture = TestBed.createComponent(GasDensityFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  function query(selector: string): HTMLElement {
    return fixture.nativeElement.querySelector(selector);
  }

  function field(name: string): HTMLElement {
    return query(`[formControlName="${name}"]`);
  }

  function clean(el: Element): string {
    return el.textContent.replace(/\s+/g, ' ').trim();
  }

  function groupFor(labelFor: string): HTMLElement {
    return query(`label[for="${labelFor}"]`).closest('.form-group') as HTMLElement;
  }

  function errorTexts(labelFor: string): Array<string> {
    return Array.from(groupFor(labelFor).querySelectorAll('.alert-danger span')).map(clean);
  }

  function unitTexts(name: string): Array<string> {
    return Array.from(groupFor(name).querySelectorAll('.input-group-addon.units')).map(clean);
  }

  function setDirtyValue(name: string, value: any) {
    component.gasDensityForm.controls[name].setValue(value);
    component.gasDensityForm.controls[name].markAsDirty();
    fixture.detectChanges();
  }

  function selectMethod(inputType: string) {
    component.gasDensityForm.controls.inputType.setValue(inputType);
    component.setValidators();
    fixture.detectChanges();
  }

  describe('initialization', () => {
    it('creates the component', async () => {
      await createComponent();
      expect(component).toBeTruthy();
    });

    it('builds the form from the base gas density', async () => {
      await createComponent(makeGasDensity({ inputType: 'custom', gasDensity: 0.0765 }));
      expect(component.gasDensityForm.controls.inputType.value).toBe('custom');
      expect(component.gasDensity).toBe(0.0765);
    });

    it('publishes the calculation type on init', async () => {
      await createComponent(makeGasDensity({ inputType: 'dewPoint' }));
      expect(gasDensityFormService.baselineCalculationType.value).toBe('dewPoint');
    });
  });

  describe('calculation triggers', () => {
    it('uses the relative humidity calculation and patches gas density', async () => {
      await createComponent(makeGasDensity({ inputType: 'relativeHumidity' }));
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).toHaveBeenCalled();
      expect(component.gasDensityForm.controls.gasDensity.value).toBe(0.0712);
      expect(component.gasDensity).toBe(0.0712);
      expect(fanAnalysisService.inputData.BaseGasDensity.gasDensity).toBe(0.0712);
    });

    it('uses the wet bulb calculation', async () => {
      await createComponent(makeGasDensity({ inputType: 'wetBulb' }));
      expect(fsatServiceSpy.getPsychrometricWetBulb).toHaveBeenCalled();
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).not.toHaveBeenCalled();
    });

    it('uses the dew point calculation', async () => {
      await createComponent(makeGasDensity({ inputType: 'dewPoint' }));
      expect(fsatServiceSpy.getPsychrometricDewPoint).toHaveBeenCalled();
    });

    it('publishes psychrometric results with dry bulb and barometric pressure', async () => {
      await createComponent(makeGasDensity({ inputType: 'relativeHumidity' }));
      const published = gasDensityFormService.baselinePsychrometricResults.value;
      expect(published.gasDensity).toBe(0.0712);
      expect(published.dryBulbTemp).toBe(70);
      expect(published.barometricPressure).toBe(29.92);
    });

    it('produces updated output when inputs change', async () => {
      await createComponent(makeGasDensity({ inputType: 'relativeHumidity' }));
      fsatServiceSpy.getPsychrometricRelativeHumidity.and.callFake(() => makePsychrometricResults(0.065));
      component.gasDensityForm.controls.relativeHumidity.setValue(80);
      component.getResults();
      expect(component.gasDensity).toBe(0.065);
    });

    it('clears gas density when the calculation returns NaN', async () => {
      await createComponent(makeGasDensity({ inputType: 'relativeHumidity' }));
      fsatServiceSpy.getPsychrometricRelativeHumidity.and.callFake(() => makePsychrometricResults(NaN));
      component.getResults();
      expect(component.gasDensityForm.controls.gasDensity.value).toBeUndefined();
    });

    it('skips the calculation and clears gas density when inputs are invalid', async () => {
      await createComponent(makeGasDensity({ inputType: 'relativeHumidity', relativeHumidity: 150 }));
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).not.toHaveBeenCalled();
      expect(component.gasDensityForm.controls.gasDensity.value).toBeUndefined();
    });

    it('keeps a custom gas density without calculating', async () => {
      await createComponent(makeGasDensity({ inputType: 'custom', gasDensity: 0.08 }));
      expect(fsatServiceSpy.getPsychrometricRelativeHumidity).not.toHaveBeenCalled();
      expect(component.gasDensityForm.controls.gasDensity.value).toBe(0.08);
      expect(gasDensityFormService.baselinePsychrometricResults.value).toBeUndefined();
    });
  });

  describe('validator toggling', () => {
    beforeEach(async () => await createComponent(makeGasDensity({ inputType: 'custom', relativeHumidity: null })));

    it('requires the shared fields when switching away from custom', () => {
      component.gasDensityForm.controls.dryBulbTemp.setValue(null);
      selectMethod('relativeHumidity');
      expect(component.gasDensityForm.controls.dryBulbTemp.errors?.required).toBeTrue();
      expect(component.gasDensityForm.controls.relativeHumidity.errors?.required).toBeTrue();
    });

    it('drops the required validators when switching back to custom', () => {
      component.gasDensityForm.controls.dryBulbTemp.setValue(null);
      selectMethod('relativeHumidity');
      selectMethod('custom');
      expect(component.gasDensityForm.controls.dryBulbTemp.errors).toBeNull();
      expect(component.gasDensityForm.controls.relativeHumidity.errors).toBeNull();
    });
  });

  describe('user actions', () => {
    beforeEach(async () => await createComponent());

    it('save copies the form into input data and requests results', () => {
      const results: Array<boolean> = [];
      fanAnalysisService.getResults.subscribe(val => results.push(val));
      component.gasDensityForm.controls.gasType.setValue('OTHER');
      component.save();
      expect(fanAnalysisService.inputData.BaseGasDensity.gasType).toBe('OTHER');
      expect(results.length).toBe(2);
    });

    it('focusField sets the current field', () => {
      component.focusField('dewPoint');
      expect(fanAnalysisService.currentField.value).toBe('dewPoint');
    });

    it('rebuilds the form when resetForms emits true', () => {
      const original = component.gasDensityForm;
      fanAnalysisService.resetForms.next(true);
      expect(component.gasDensityForm).not.toBe(original);
    });
  });

  describe('template visibility', () => {
    describe('select options', () => {
      beforeEach(async () => await createComponent());

      it('lists gas types', () => {
        expect(Array.from(field('gasType').querySelectorAll('option')).map(clean)).toEqual(['Air', 'Other Gas']);
      });

      it('lists gas density methods', () => {
        expect(Array.from(field('inputType').querySelectorAll('option')).map(clean))
          .toEqual(['Relative Humidity %', 'Wet Bulb Temperature', 'Gas Dew Point', 'Use Custom Density']);
      });
    });

    describe('method fields', () => {
      METHOD_FIELDS.forEach(m => {
        it(`renders the ${m.inputType} fields`, async () => {
          await createComponent(makeGasDensity({ inputType: m.inputType }));
          ['dryBulbTemp', 'staticPressure', 'barometricPressure', 'specificGravity'].forEach(name => {
            expect(field(name) !== null).withContext(name).toBe(m.shared);
          });
          expect(field('wetBulbTemp') !== null).withContext('wetBulbTemp').toBe(m.wetBulbTemp);
          expect(field('relativeHumidity') !== null).withContext('relativeHumidity').toBe(m.relativeHumidity);
          expect(field('dewPoint') !== null).withContext('dewPoint').toBe(m.dewPoint);
          expect(field('gasDensity') !== null).withContext('gasDensity input').toBe(m.gasDensityInput);
          expect(groupFor('gasDensity').querySelector('.text-center') !== null).withContext('gasDensity text').toBe(!m.gasDensityInput);
        });
      });
    });

    describe('temperature units', () => {
      TEMPERATURE_UNITS.forEach(t => {
        it(`shows ${t.label} on dry bulb and wet bulb temperatures for ${t.unit}`, async () => {
          await createComponent(makeGasDensity({ inputType: 'wetBulb' }), makeSettings(t.unit));
          expect(unitTexts('dryBulbTemp')).toEqual([t.label]);
          expect(unitTexts('wetBulbTemp')).toEqual([t.label]);
        });

        it(`shows ${t.label} on dew point for ${t.unit}`, async () => {
          await createComponent(makeGasDensity({ inputType: 'dewPoint' }), makeSettings(t.unit));
          expect(unitTexts('dewPoint')).toEqual([t.label]);
        });
      });
    });

    describe('validation messages', () => {
      it('hides the message for an invalid field that is still pristine', async () => {
        await createComponent(makeGasDensity({ inputType: 'relativeHumidity', dryBulbTemp: null }));
        expect(component.gasDensityForm.controls.dryBulbTemp.invalid).toBeTrue();
        expect(errorTexts('dryBulbTemp')).toEqual([]);
      });

      FIELD_ERRORS.forEach(f => {
        it(`hides the ${f.name} message when the value is valid`, async () => {
          await createComponent(makeGasDensity({ inputType: f.inputType }));
          component.gasDensityForm.controls[f.name].markAsDirty();
          fixture.detectChanges();
          expect(errorTexts(f.name)).toEqual([]);
        });

        f.cases.forEach(c => {
          it(`shows "${c.message}" for ${f.name} = ${c.value}`, async () => {
            await createComponent(makeGasDensity({ inputType: f.inputType }));
            setDirtyValue(f.name, c.value);
            expect(errorTexts(f.name)).toEqual([c.message]);
          });
        });
      });
    });

    describe('gas density', () => {
      it('shows the calculated gas density', async () => {
        await createComponent(makeGasDensity({ inputType: 'relativeHumidity' }));
        expect(clean(groupFor('gasDensity').querySelector('.text-center'))).toBe('0.0712 lb/ft 3');
      });

      it('shows a placeholder without a calculated gas density', async () => {
        await createComponent(makeGasDensity({ inputType: 'relativeHumidity', relativeHumidity: 150 }));
        expect(clean(groupFor('gasDensity').querySelector('.text-center'))).toBe('— —');
      });

      it('shows the required message when no gas density could be calculated', async () => {
        await createComponent(makeGasDensity({ inputType: 'relativeHumidity', relativeHumidity: 150 }));
        expect(errorTexts('gasDensity')).toEqual(['Gas Density Value Required']);
      });

      it('hides the gas density message when it is valid', async () => {
        await createComponent(makeGasDensity({ inputType: 'custom', gasDensity: 0.0765 }));
        expect(errorTexts('gasDensity')).toEqual([]);
      });

      [
        { value: null, message: 'Gas Density Value Required' },
        { value: 0.3, message: `Value can't be greater than 0.2.` },
        { value: -1, message: `Value can't be less than 0.` },
      ].forEach(c => {
        it(`shows "${c.message}" for a custom gas density of ${c.value} even while pristine`, async () => {
          await createComponent(makeGasDensity({ inputType: 'custom' }));
          component.gasDensityForm.controls.gasDensity.setValue(c.value);
          fixture.detectChanges();
          expect(errorTexts('gasDensity')).toEqual([c.message]);
        });
      });
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form and clears published results after destroy', async () => {
      await createComponent(makeGasDensity({ inputType: 'relativeHumidity' }));
      const original = component.gasDensityForm;
      fixture.destroy();
      fanAnalysisService.resetForms.next(true);
      expect(component.gasDensityForm).toBe(original);
      expect(gasDensityFormService.baselinePsychrometricResults.value).toBeUndefined();
      expect(gasDensityFormService.baselineCalculationType.value).toBeUndefined();
    });
  });
});
