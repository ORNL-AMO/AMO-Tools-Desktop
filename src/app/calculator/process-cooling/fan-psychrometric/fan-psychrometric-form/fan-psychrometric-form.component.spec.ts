import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { FanPsychrometricFormComponent } from './fan-psychrometric-form.component';
import { FanPsychrometricService } from '../fan-psychrometric.service';
import { GasDensityFormService } from '../../../fans/fan-analysis/fan-analysis-form/gas-density-form/gas-density-form.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { SharedPipesModule } from '../../../../shared/shared-pipes/shared-pipes.module';
import { BaseGasDensity } from '../../../../shared/models/fans';
import { Settings } from '../../../../shared/models/settings';
import { TraceData } from '../../../../shared/models/plotting';

const IMPERIAL_SETTINGS = {
  unitsOfMeasure: 'Imperial',
  fanTemperatureMeasurement: 'F',
  densityMeasurement: 'lbscf',
  fanBarometricPressure: 'inHg',
  fanPressureMeasurement: 'inH2o',
} as Settings;
const METRIC_SETTINGS = {
  unitsOfMeasure: 'Metric',
  fanTemperatureMeasurement: 'C',
  densityMeasurement: 'kgNm3',
  fanBarometricPressure: 'kPa',
  fanPressureMeasurement: 'Pa',
} as Settings;

function makeInputData(overrides: Partial<BaseGasDensity> = {}): BaseGasDensity {
  return {
    dryBulbTemp: 100,
    staticPressure: 0,
    barometricPressure: 29.92,
    gasDensity: 0.0765,
    altitude: undefined,
    gasType: 'AIR',
    inputType: 'wetBulb',
    specificGravity: 1,
    wetBulbTemp: 90,
    relativeHumidity: undefined,
    dewPoint: undefined,
    specificHeatGas: 0.24,
    ...overrides,
  };
}

function makeFanPsychrometricService(inputData: BaseGasDensity): Partial<FanPsychrometricService> {
  return {
    currentField: new BehaviorSubject<string>('default'),
    resetData: new BehaviorSubject<boolean>(undefined),
    generateExample: new BehaviorSubject<boolean>(undefined),
    selectedDataPoints: new BehaviorSubject<Array<TraceData>>([]),
    disabledChartTab: new BehaviorSubject<boolean>(true),
    baseGasDensityData: new BehaviorSubject<BaseGasDensity>(inputData),
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('FanPsychrometricFormComponent', () => {
  let component: FanPsychrometricFormComponent;
  let fixture: ComponentFixture<FanPsychrometricFormComponent>;
  let fanPsychrometricService: Partial<FanPsychrometricService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getErrorText(inputId: string): string | null {
    const error = query(`#${inputId}`).closest('.input-group').querySelector('.alert-danger');
    return error ? normalize(error.textContent) : null;
  }

  function setDirtyValue(controlName: string, value: any): void {
    const control = component.gasDensityForm.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    fixture.detectChanges();
  }

  function getBarometricLinks(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('label[for="barometricPressure"] a'))
      .map((link: HTMLElement) => link.textContent.trim());
  }

  function getCalculatedPressureSpans(): Array<string> {
    const group = query('.input-group.justify-content-center');
    return Array.from(group.querySelectorAll('span.mr-2')).map((span: HTMLElement) => normalize(span.textContent));
  }

  function createComponent(settings: Settings = IMPERIAL_SETTINGS, inputData: BaseGasDensity = makeInputData()): void {
    fanPsychrometricService.baseGasDensityData.next(inputData);
    fixture = TestBed.createComponent(FanPsychrometricFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  function showAltitude(): void {
    component.showHideInputField();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    fanPsychrometricService = makeFanPsychrometricService(makeInputData());

    await TestBed.configureTestingModule({
      declarations: [FanPsychrometricFormComponent],
      imports: [ReactiveFormsModule, SharedPipesModule],
      providers: [
        GasDensityFormService,
        ConvertUnitsService,
        { provide: FanPsychrometricService, useValue: fanPsychrometricService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('builds the form from the service input data', () => {
      createComponent();
      expect(component.gasDensityForm.controls.dryBulbTemp.value).toBe(100);
      expect(component.gasDensityForm.controls.wetBulbTemp.value).toBe(90);
      expect(component.gasDensityForm.controls.inputType.value).toBe('wetBulb');
    });

    it('starts with user-defined barometric pressure', () => {
      createComponent();
      expect(component.userDefinedBarometricPressure).toBeTrue();
    });

    it('saves the form back to the service and clears selected points', () => {
      const staleTrace = { x: [1], y: [1] } as TraceData;
      fanPsychrometricService.selectedDataPoints.next([staleTrace]);
      createComponent();
      expect(fanPsychrometricService.selectedDataPoints.getValue()).toEqual([]);
      const saved = fanPsychrometricService.baseGasDensityData.getValue();
      expect(saved.dryBulbTemp).toBe(100);
      expect(saved.wetBulbTemp).toBe(90);
    });

    it('enables the chart tab when the form is valid', () => {
      createComponent();
      expect(fanPsychrometricService.disabledChartTab.getValue()).toBeFalse();
    });

    it('leaves the chart tab disabled when the form is invalid', () => {
      createComponent(IMPERIAL_SETTINGS, makeInputData({ dryBulbTemp: undefined, wetBulbTemp: undefined }));
      expect(fanPsychrometricService.disabledChartTab.getValue()).toBeTrue();
    });

    it('renders one option per humidity metric', () => {
      createComponent();
      const options = Array.from(fixture.nativeElement.querySelectorAll('#inputType option'))
        .map((option: HTMLElement) => option.textContent.trim());
      expect(options).toEqual(['Relative Humidity %', 'Wet Bulb Temperature', 'Dew Point']);
    });
  });

  describe('humidity metric sections', () => {
    const SECTIONS: Array<{ inputType: string, visibleId: string, hiddenIds: Array<string> }> = [
      { inputType: 'wetBulb', visibleId: 'wetBulbTemp', hiddenIds: ['relativeHumidity', 'dewPoint'] },
      { inputType: 'relativeHumidity', visibleId: 'relativeHumidity', hiddenIds: ['wetBulbTemp', 'dewPoint'] },
      { inputType: 'dewPoint', visibleId: 'dewPoint', hiddenIds: ['wetBulbTemp', 'relativeHumidity'] },
    ];

    SECTIONS.forEach(testCase => {
      it(`shows only the ${testCase.visibleId} field for ${testCase.inputType}`, () => {
        createComponent(IMPERIAL_SETTINGS, makeInputData({ inputType: testCase.inputType }));
        expect(query(`#${testCase.visibleId}`)).not.toBeNull();
        testCase.hiddenIds.forEach(id => expect(query(`#${id}`)).withContext(id).toBeNull());
      });
    });

    it('switches the visible field when the metric changes', () => {
      createComponent();
      component.gasDensityForm.controls.inputType.setValue('dewPoint');
      component.setValidators();
      fixture.detectChanges();
      expect(query('#dewPoint')).not.toBeNull();
      expect(query('#wetBulbTemp')).toBeNull();
    });
  });

  describe('field errors', () => {
    it('hides the dry bulb error while the field is pristine even when invalid', () => {
      createComponent(IMPERIAL_SETTINGS, makeInputData({ dryBulbTemp: undefined }));
      expect(component.gasDensityForm.controls.dryBulbTemp.invalid).toBeTrue();
      expect(getErrorText('dryBulbTemp')).toBeNull();
    });

    it('hides the dry bulb error when dirty and valid', () => {
      createComponent();
      setDirtyValue('dryBulbTemp', 120);
      expect(getErrorText('dryBulbTemp')).toBeNull();
    });

    const ERROR_CASES: Array<{ inputType: string, control: string, value: number, expected: string }> = [
      { inputType: 'wetBulb', control: 'dryBulbTemp', value: null, expected: 'Value Required' },
      { inputType: 'wetBulb', control: 'dryBulbTemp', value: 2000, expected: "Value can't be greater than 1000." },
      { inputType: 'wetBulb', control: 'dryBulbTemp', value: -200, expected: "Value can't be less than -100." },
      { inputType: 'wetBulb', control: 'wetBulbTemp', value: null, expected: 'Value Required' },
      { inputType: 'wetBulb', control: 'wetBulbTemp', value: 150, expected: "Value can't be greater than 100." },
      { inputType: 'wetBulb', control: 'wetBulbTemp', value: 10, expected: "Value can't be less than 32." },
      { inputType: 'relativeHumidity', control: 'relativeHumidity', value: null, expected: 'Value Required' },
      { inputType: 'relativeHumidity', control: 'relativeHumidity', value: 150, expected: "Value can't be greater than 100." },
      { inputType: 'relativeHumidity', control: 'relativeHumidity', value: -5, expected: "Value can't be less than 0." },
      { inputType: 'dewPoint', control: 'dewPoint', value: null, expected: 'Value Required' },
      { inputType: 'dewPoint', control: 'dewPoint', value: 150, expected: "Value can't be greater than 100." },
      { inputType: 'dewPoint', control: 'dewPoint', value: -50, expected: "Value can't be less than -30." },
      { inputType: 'wetBulb', control: 'barometricPressure', value: null, expected: 'Value Required' },
      { inputType: 'wetBulb', control: 'barometricPressure', value: 70, expected: "Value can't be greater than 60." },
      { inputType: 'wetBulb', control: 'barometricPressure', value: 5, expected: "Value can't be less than 10." },
    ];

    ERROR_CASES.forEach(testCase => {
      it(`shows "${testCase.expected}" for ${testCase.control} = ${testCase.value}`, () => {
        createComponent(IMPERIAL_SETTINGS, makeInputData({ inputType: testCase.inputType, relativeHumidity: 50, dewPoint: 50 }));
        setDirtyValue(testCase.control, testCase.value);
        expect(getErrorText(testCase.control)).toBe(testCase.expected);
      });
    });

    ['wetBulbTemp', 'relativeHumidity', 'dewPoint', 'barometricPressure'].forEach(control => {
      it(`hides the ${control} error when dirty and valid`, () => {
        const inputType = control === 'relativeHumidity' || control === 'dewPoint' ? control : 'wetBulb';
        createComponent(IMPERIAL_SETTINGS, makeInputData({ inputType: inputType, relativeHumidity: 50, dewPoint: 50 }));
        setDirtyValue(control, 50 / (control === 'barometricPressure' ? 2 : 1));
        expect(getErrorText(control)).toBeNull();
      });
    });
  });

  describe('barometric pressure source', () => {
    it('shows the barometric pressure input and the altitude link when user-defined', () => {
      createComponent();
      expect(query('#barometricPressure')).not.toBeNull();
      expect(query('#altitude')).toBeNull();
      expect(query('.input-group.justify-content-center')).toBeNull();
      expect(getBarometricLinks()).toEqual(['Calculate From Altitude']);
    });

    it('shows the altitude input and calculated pressure when calculating from altitude', () => {
      createComponent();
      showAltitude();
      expect(query('#altitude')).not.toBeNull();
      expect(query('#barometricPressure')).toBeNull();
      expect(query('.input-group.justify-content-center')).not.toBeNull();
      expect(getBarometricLinks()).toEqual(['Define Actual Barometric Pressure']);
    });

    it('toggles back to user-defined pressure from the link', () => {
      createComponent();
      showAltitude();
      (query('label[for="barometricPressure"] a') as HTMLElement).click();
      fixture.detectChanges();
      expect(component.userDefinedBarometricPressure).toBeTrue();
      expect(query('#barometricPressure')).not.toBeNull();
    });

    it('shows ft for the altitude unit with imperial settings', () => {
      createComponent(IMPERIAL_SETTINGS);
      showAltitude();
      expect(query('#altitude').closest('.input-group').querySelector('.units').textContent.trim()).toBe('ft');
    });

    it('shows m for the altitude unit with metric settings', () => {
      createComponent(METRIC_SETTINGS, makeInputData({ barometricPressure: 101.3, dryBulbTemp: 40, wetBulbTemp: 30 }));
      showAltitude();
      expect(query('#altitude').closest('.input-group').querySelector('.units').textContent.trim()).toBe('m');
    });

    it('calculates barometric pressure from altitude on save', () => {
      createComponent();
      showAltitude();
      component.gasDensityForm.controls.altitude.setValue(0);
      component.save();
      fixture.detectChanges();
      expect(component.gasDensityForm.controls.barometricPressure.value).toBeCloseTo(29.92, 2);
      expect(fanPsychrometricService.baseGasDensityData.getValue().barometricPressure).toBeCloseTo(29.92, 2);
      expect(getCalculatedPressureSpans()).toEqual(['29.92']);
    });

    it('shows dashes when there is no calculated pressure', () => {
      createComponent();
      showAltitude();
      component.gasDensityForm.controls.barometricPressure.setValue(null);
      fixture.detectChanges();
      expect(getCalculatedPressureSpans()).toEqual(['— —']);
    });

    describe('altitude error', () => {
      function makeAltitudeInvalid(): void {
        component.gasDensityForm.controls.altitude.setValidators(Validators.min(0));
        setDirtyValue('altitude', -10);
      }

      it('hides the altitude error when altitude is valid', () => {
        createComponent();
        showAltitude();
        setDirtyValue('altitude', 100);
        expect(getErrorText('altitude')).toBeNull();
      });

      it('shows the minimum with ft for imperial settings', () => {
        createComponent(IMPERIAL_SETTINGS);
        showAltitude();
        makeAltitudeInvalid();
        expect(getErrorText('altitude')).toBe("Value can't be less than 0 ft.");
      });

      it('shows the minimum with m for metric settings', () => {
        createComponent(METRIC_SETTINGS, makeInputData({ barometricPressure: 101.3, dryBulbTemp: 40, wetBulbTemp: 30 }));
        showAltitude();
        makeAltitudeInvalid();
        expect(getErrorText('altitude')).toBe("Value can't be less than 0 m.");
      });
    });
  });

  describe('validator toggling', () => {
    it('requires relative humidity when the metric switches to relative humidity', () => {
      createComponent();
      component.gasDensityForm.controls.inputType.setValue('relativeHumidity');
      component.setValidators();
      expect(component.gasDensityForm.controls.relativeHumidity.hasValidator(Validators.required)).toBeTrue();
    });

    it('stops requiring relative humidity when the metric switches away', () => {
      createComponent(IMPERIAL_SETTINGS, makeInputData({ inputType: 'relativeHumidity', relativeHumidity: 50 }));
      component.gasDensityForm.controls.inputType.setValue('dewPoint');
      component.setValidators();
      expect(component.gasDensityForm.controls.relativeHumidity.hasValidator(Validators.required)).toBeFalse();
      expect(component.gasDensityForm.controls.dewPoint.hasValidator(Validators.required)).toBeTrue();
    });

    it('saves after changing validators', () => {
      createComponent();
      component.gasDensityForm.controls.inputType.setValue('dewPoint');
      component.setValidators();
      expect(fanPsychrometricService.baseGasDensityData.getValue().inputType).toBe('dewPoint');
    });
  });

  describe('user input', () => {
    it('saves the edited value to the service', () => {
      createComponent();
      const input = query('#dryBulbTemp') as HTMLInputElement;
      input.value = '110';
      input.dispatchEvent(new Event('input'));
      expect(fanPsychrometricService.baseGasDensityData.getValue().dryBulbTemp).toBe(110);
    });
  });

  describe('reset and example', () => {
    it('rebuilds the form and returns to user-defined pressure on reset', () => {
      createComponent();
      showAltitude();
      const oldForm = component.gasDensityForm;
      fanPsychrometricService.baseGasDensityData.next(makeInputData({ dryBulbTemp: 77 }));
      fanPsychrometricService.resetData.next(true);
      fixture.detectChanges();
      expect(component.gasDensityForm).not.toBe(oldForm);
      expect(component.gasDensityForm.controls.dryBulbTemp.value).toBe(77);
      expect(component.userDefinedBarometricPressure).toBeTrue();
      expect(query('#barometricPressure')).not.toBeNull();
    });

    it('rebuilds the form from the example data', () => {
      createComponent();
      fanPsychrometricService.baseGasDensityData.next(makeInputData({ dryBulbTemp: 123, wetBulbTemp: 119 }));
      fanPsychrometricService.generateExample.next(true);
      fixture.detectChanges();
      expect((query('#dryBulbTemp') as HTMLInputElement).value).toBe('123');
      expect((query('#wetBulbTemp') as HTMLInputElement).value).toBe('119');
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after destroy', () => {
      createComponent();
      const form = component.gasDensityForm;
      fixture.destroy();
      fanPsychrometricService.resetData.next(true);
      fanPsychrometricService.generateExample.next(true);
      expect(component.gasDensityForm).toBe(form);
    });
  });
});
