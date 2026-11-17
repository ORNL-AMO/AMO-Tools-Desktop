import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChillerStagingFormComponent } from './chiller-staging-form.component';
import { ChillerStagingService } from '../chiller-staging.service';
import { ChillerStagingFormService } from '../chiller-staging-form.service';
import { ChillerCalculatorSuiteApiService } from '../../../../tools-suite-api/chiller-calculator-suite-api.service';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial', electricityCost: 0.1 } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric', electricityCost: 0.1 } as Settings;
const OTHER_SETTINGS = { unitsOfMeasure: 'Custom', electricityCost: 0.1 } as Settings;

const UNIT_FIELDS: Array<{ id: string, imperial: string, metric: string }> = [
  { id: 'ariCapacity', imperial: 'tons', metric: 'kW' },
  { id: 'waterSupplyTemp', imperial: '℉', metric: '℃' },
  { id: 'waterEnteringTemp', imperial: '℉', metric: '℃' },
  { id: 'baselineLoad0', imperial: 'tons', metric: 'kW' },
  { id: 'modLoad0', imperial: 'tons', metric: 'kW' },
];

// Example data: waterSupplyTemp 42, waterEnteringTemp 82.12, 3 chillers
const ERROR_CASES: Array<{ id: string, control: string, value: number, message: string }> = [
  { id: 'ariCapacity', control: 'ariCapacity', value: null, message: 'Value required.' },
  { id: 'ariCapacity', control: 'ariCapacity', value: -1, message: "Value can't be less than 0." },
  { id: 'ariEfficiency', control: 'ariEfficiency', value: null, message: 'Value required.' },
  { id: 'ariEfficiency', control: 'ariEfficiency', value: -1, message: "Value can't be less than 0." },
  { id: 'maxCapacityRatio', control: 'maxCapacityRatio', value: null, message: 'Value required.' },
  { id: 'maxCapacityRatio', control: 'maxCapacityRatio', value: -1, message: "Value can't be less than 0." },
  { id: 'maxCapacityRatio', control: 'maxCapacityRatio', value: 1.5, message: "Value can't be greater than 1" },
  { id: 'waterSupplyTemp', control: 'waterSupplyTemp', value: null, message: 'Value required.' },
  { id: 'waterSupplyTemp', control: 'waterSupplyTemp', value: 90, message: "Value can't be greater than Condenser Water Temperature (82.12)" },
  { id: 'waterEnteringTemp', control: 'waterEnteringTemp', value: null, message: 'Value required.' },
  { id: 'waterEnteringTemp', control: 'waterEnteringTemp', value: 30, message: "Value can't be less than Water Supply Temperature (42)." },
  { id: 'operatingHours', control: 'operatingHours', value: null, message: 'Value required.' },
  { id: 'operatingHours', control: 'operatingHours', value: 9000, message: "Value can't be greater than 8760." },
  { id: 'operatingHours', control: 'operatingHours', value: -1, message: "Value can't be less than 0." },
  { id: 'electricityCost', control: 'electricityCost', value: null, message: 'Value required.' },
  { id: 'electricityCost', control: 'electricityCost', value: -1, message: 'Value cannot not be less than 0.' },
];

const LOAD_ERROR_CASES: Array<{ list: string, idPrefix: string, value: number, message: string }> = [
  { list: 'baselineLoadList', idPrefix: 'baselineLoad', value: null, message: 'Value required.' },
  { list: 'baselineLoadList', idPrefix: 'baselineLoad', value: -1, message: "Value can't be less than 0." },
  { list: 'modLoadList', idPrefix: 'modLoad', value: null, message: 'Value required.' },
  { list: 'modLoadList', idPrefix: 'modLoad', value: -1, message: "Value can't be less than 0." },
];

describe('ChillerStagingFormComponent', () => {
  let component: ChillerStagingFormComponent;
  let fixture: ComponentFixture<ChillerStagingFormComponent>;
  let chillerStagingService: ChillerStagingService;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  function optionTexts(selectId: string): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll(`#${selectId} option`))
      .map((option: HTMLOptionElement) => option.textContent.trim());
  }

  function unitTexts(inputId: string): Array<string> {
    return Array.from(query(`#${inputId}`).closest('.input-group').querySelectorAll('.units'))
      .map((unit: HTMLElement) => unit.textContent.trim());
  }

  function errorText(inputId: string): string | null {
    const alert = query(`#${inputId}`).closest('.form-group').querySelector(':scope > .alert-danger');
    return alert ? normalize(alert.textContent) : null;
  }

  function loadInputs(idPrefix: string): Array<HTMLInputElement> {
    return Array.from(fixture.nativeElement.querySelectorAll(`input[id^="${idPrefix}"]`));
  }

  function loadLabels(idPrefix: string): Array<string> {
    return loadInputs(idPrefix).map(input => normalize(input.closest('.form-group').querySelector('label').textContent));
  }

  function setDirtyValue(controlName: string, value: number): void {
    component.form.controls[controlName].setValue(value);
    component.form.controls[controlName].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(settings: Settings = IMPERIAL_SETTINGS, seed: 'example' | 'empty' = 'example'): void {
    if (seed === 'example') {
      chillerStagingService.generateExampleData(settings);
    } else {
      chillerStagingService.initDefaultEmptyInputs(settings);
    }
    fixture = TestBed.createComponent(ChillerStagingFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    const suiteApiSpy = jasmine.createSpyObj('ChillerCalculatorSuiteApiService', ['chillerStagingEfficiency']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ChillerStagingFormComponent],
      providers: [
        ChillerStagingService,
        ChillerStagingFormService,
        ConvertUnitsService,
        { provide: ChillerCalculatorSuiteApiService, useValue: suiteApiSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    chillerStagingService = TestBed.inject(ChillerStagingService);
  });

  describe('initialization', () => {
    it('should build the form from the service input', () => {
      createComponent();
      expect(component.form.controls.ariCapacity.value).toBe(1000);
      expect(component.form.controls.baselineLoadList.value).toEqual([300, 300, 300]);
      expect(component.form.controls.modLoadList.value).toEqual([450, 450, 0]);
    });

    it('should apply the centrifugal defaults and publish the input', () => {
      createComponent();
      expect(component.form.controls.maxCapacityRatio.value).toBe(0.92);
      expect(chillerStagingService.chillerStagingInput.getValue().maxCapacityRatio).toBe(0.92);
    });

    it('should render one load row per chiller in baseline and modification', () => {
      createComponent();
      expect(loadLabels('baselineLoad')).toEqual(['Load Assigned to Chiller 1', 'Load Assigned to Chiller 2', 'Load Assigned to Chiller 3']);
      expect(loadLabels('modLoad')).toEqual(['Load Assigned to Chiller 1', 'Load Assigned to Chiller 2', 'Load Assigned to Chiller 3']);
      expect(loadInputs('modLoad').map(input => input.value)).toEqual(['450', '450', '0']);
    });

    it('should render a single load row for empty inputs', () => {
      createComponent(IMPERIAL_SETTINGS, 'empty');
      expect(loadInputs('baselineLoad').length).toBe(1);
      expect(loadInputs('modLoad').length).toBe(1);
    });
  });

  describe('chiller characteristic options', () => {
    it('should render every chiller type and condenser cooling type', () => {
      createComponent();
      expect(optionTexts('chillerType')).toEqual(['Centrifugal', 'Screw']);
      expect(optionTexts('condenserCoolingType')).toEqual(['Water Cooled', 'Air Cooled']);
    });

    const CASES: Array<{ name: string, patch: object, motor: Array<string>, compressor: Array<string>, motorDisabled: boolean, compressorDisabled: boolean }> = [
      {
        name: 'centrifugal, water cooled, hermetic',
        patch: { chillerType: 0, condenserCoolingType: 0, motorDriveType: 0 },
        motor: ['Hermetic', 'Open'], compressor: ['No VFD', 'VFD', 'Magnetic Bearing'],
        motorDisabled: false, compressorDisabled: false,
      },
      {
        name: 'centrifugal, water cooled, open',
        patch: { chillerType: 0, condenserCoolingType: 0, motorDriveType: 1 },
        motor: ['Hermetic', 'Open'], compressor: ['No VFD', 'VFD'],
        motorDisabled: false, compressorDisabled: false,
      },
      {
        name: 'centrifugal, air cooled',
        patch: { chillerType: 0, condenserCoolingType: 1, motorDriveType: 0 },
        motor: ['Hermetic', 'Open'], compressor: ['No VFD'],
        motorDisabled: false, compressorDisabled: true,
      },
      {
        name: 'screw',
        patch: { chillerType: 1 },
        motor: ['Hermetic', 'Open', 'N/A'], compressor: ['No VFD', 'VFD', 'Magnetic Bearing'],
        motorDisabled: true, compressorDisabled: true,
      },
    ];

    CASES.forEach(testCase => {
      it(`should render the motor drive and compressor options for ${testCase.name}`, () => {
        createComponent();
        component.form.patchValue(testCase.patch);
        component.setChillerCharacteristics();
        fixture.detectChanges();
        expect(optionTexts('motorDriveType')).toEqual(testCase.motor);
        expect(optionTexts('compressorConfigType')).toEqual(testCase.compressor);
        expect(component.form.controls.motorDriveType.disabled).toBe(testCase.motorDisabled);
        expect(component.form.controls.compressorConfigType.disabled).toBe(testCase.compressorDisabled);
      });
    });

    it('should force screw chillers to a 1.0 capacity ratio', () => {
      createComponent();
      component.form.patchValue({ chillerType: 1 });
      component.setChillerCharacteristics();
      expect(component.form.controls.maxCapacityRatio.value).toBe(1);
      expect(component.form.controls.maxCapacityRatio.disabled).toBeTrue();
    });
  });

  describe('unit labels', () => {
    UNIT_FIELDS.forEach(field => {
      it(`should show imperial units for ${field.id}`, () => {
        createComponent(IMPERIAL_SETTINGS);
        expect(unitTexts(field.id)).toEqual([field.imperial]);
      });

      it(`should show metric units for ${field.id}`, () => {
        createComponent(METRIC_SETTINGS);
        expect(unitTexts(field.id)).toEqual([field.metric]);
      });

      it(`should show no units for ${field.id} with other unit settings`, () => {
        createComponent(OTHER_SETTINGS);
        expect(unitTexts(field.id)).toEqual([]);
      });
    });

    it('should show unit labels on every added chiller row', () => {
      createComponent(METRIC_SETTINGS);
      component.addChiller();
      fixture.detectChanges();
      expect(unitTexts('baselineLoad3')).toEqual(['kW']);
      expect(unitTexts('modLoad3')).toEqual(['kW']);
    });
  });

  describe('validation messages', () => {
    ERROR_CASES.forEach(errorCase => {
      it(`should show "${errorCase.message}" for ${errorCase.control} = ${errorCase.value}`, () => {
        createComponent();
        setDirtyValue(errorCase.control, errorCase.value);
        expect(errorText(errorCase.id)).toBe(errorCase.message);
      });
    });

    ['ariCapacity', 'ariEfficiency', 'maxCapacityRatio', 'operatingHours', 'electricityCost', 'waterSupplyTemp', 'waterEnteringTemp'].forEach(id => {
      it(`should show no error for a valid ${id}`, () => {
        createComponent();
        expect(errorText(id)).toBeNull();
      });
    });

    it('should hide the error while an invalid field is still pristine', () => {
      createComponent();
      component.form.controls.ariCapacity.setValue(null);
      fixture.detectChanges();
      expect(component.form.controls.ariCapacity.invalid).toBeTrue();
      expect(errorText('ariCapacity')).toBeNull();
    });

    LOAD_ERROR_CASES.forEach(errorCase => {
      it(`should show "${errorCase.message}" for ${errorCase.list}[1] = ${errorCase.value} only on that row`, () => {
        createComponent();
        const control = component.form.get(errorCase.list).get('1');
        control.setValue(errorCase.value);
        control.markAsDirty();
        fixture.detectChanges();
        expect(errorText(`${errorCase.idPrefix}1`)).toBe(errorCase.message);
        expect(errorText(`${errorCase.idPrefix}0`)).toBeNull();
        expect(errorText(`${errorCase.idPrefix}2`)).toBeNull();
      });
    });

    it('should hide the error on a pristine added chiller row', () => {
      createComponent();
      component.addChiller();
      component.form.get('baselineLoadList').get('3').setValue(-1);
      fixture.detectChanges();
      expect(errorText('baselineLoad3')).toBeNull();
    });
  });

  describe('water temperature validator toggling', () => {
    it('should apply the max on supply temperature from the entering temperature', () => {
      createComponent();
      component.form.controls.waterSupplyTemp.setValue(90);
      expect(component.form.controls.waterSupplyTemp.hasError('max')).toBeTrue();
    });

    it('should clear the supply max error once calculate picks up a higher entering temperature', () => {
      createComponent();
      component.form.controls.waterSupplyTemp.setValue(90);
      component.form.controls.waterEnteringTemp.setValue(100);
      component.calculate();
      fixture.detectChanges();
      expect(component.form.controls.waterSupplyTemp.valid).toBeTrue();
      expect(errorText('waterSupplyTemp')).toBeNull();
    });
  });

  describe('total load equality', () => {
    const MESSAGE = 'Sum of all baseline chiller loads must be equal to that of modification chiller loads.';

    function totalLoadAlert(): string | null {
      const alert = query('.row > .alert-danger');
      return alert ? normalize(alert.textContent) : null;
    }

    it('should hide the alert while baseline and modification totals match', () => {
      createComponent();
      expect(totalLoadAlert()).toBeNull();
    });

    it('should show the alert when the totals differ', () => {
      createComponent();
      component.form.get('modLoadList').get('0').setValue(100);
      fixture.detectChanges();
      expect(totalLoadAlert()).toBe(MESSAGE);
    });

    it('should hide the alert again when the totals match again', () => {
      createComponent();
      component.form.get('modLoadList').get('0').setValue(100);
      fixture.detectChanges();
      component.form.get('modLoadList').get('0').setValue(450);
      fixture.detectChanges();
      expect(totalLoadAlert()).toBeNull();
    });
  });

  describe('adding and removing chillers', () => {
    it('should add a row to baseline and modification and publish the input', () => {
      createComponent();
      component.addChiller();
      fixture.detectChanges();
      expect(loadInputs('baselineLoad').length).toBe(4);
      expect(loadLabels('modLoad')[3]).toBe('Load Assigned to Chiller 4');
      expect(chillerStagingService.chillerStagingInput.getValue().modLoadList).toEqual([450, 450, 0, 0]);
    });

    it('should remove a row from both lists when its delete button is clicked', () => {
      createComponent();
      const deleteButtons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.btn-delete-field');
      expect(deleteButtons.length).toBe(3);
      deleteButtons[1].click();
      fixture.detectChanges();
      expect(loadLabels('baselineLoad')).toEqual(['Load Assigned to Chiller 1', 'Load Assigned to Chiller 2']);
      expect(loadInputs('modLoad').map(input => input.value)).toEqual(['450', '0']);
      expect(chillerStagingService.chillerStagingInput.getValue().modLoadList).toEqual([450, 0]);
    });

    it('should not remove the first chiller', () => {
      createComponent();
      component.removeChiller(0);
      fixture.detectChanges();
      expect(loadInputs('baselineLoad').length).toBe(3);
      expect(loadInputs('modLoad').length).toBe(3);
    });

    it('should keep the DOM node of a following row when an earlier row is removed (identity tracking)', () => {
      createComponent();
      const baselineThird = loadInputs('baselineLoad')[2];
      const modThird = loadInputs('modLoad')[2];
      const baselineSecond = loadInputs('baselineLoad')[1];
      component.removeChiller(1);
      fixture.detectChanges();
      expect(loadInputs('baselineLoad')[1]).toBe(baselineThird);
      expect(loadInputs('modLoad')[1]).toBe(modThird);
      expect(baselineSecond.isConnected).toBeFalse();
      expect(modThird.value).toBe('0');
      expect(modThird.id).toBe('modLoad1');
    });
  });

  describe('operating hours modal', () => {
    it('should be hidden by default', () => {
      createComponent();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('should open from the calculator link', () => {
      createComponent();
      (query('.op-hour-addon a') as HTMLElement).click();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
    });

    it('should close without changing hours', () => {
      createComponent();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
      expect(component.form.controls.operatingHours.value).toBe(1);
    });

    it('should apply the saved hours, publish them, and close', () => {
      createComponent();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.updateOperatingHours({ hoursPerYear: 4000 } as any);
      fixture.detectChanges();
      expect(component.form.controls.operatingHours.value).toBe(4000);
      expect(chillerStagingService.chillerStagingInput.getValue().operatingHours).toBe(4000);
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('user actions', () => {
    it('should publish the edited form values on calculate', () => {
      createComponent();
      component.form.controls.ariCapacity.setValue(500);
      component.calculate();
      expect(chillerStagingService.chillerStagingInput.getValue().ariCapacity).toBe(500);
      component.form.controls.ariCapacity.setValue(600);
      component.calculate();
      expect(chillerStagingService.chillerStagingInput.getValue().ariCapacity).toBe(600);
    });

    it('should publish the focused field', () => {
      createComponent();
      component.focusField('ariEfficiency');
      expect(chillerStagingService.currentField.getValue()).toBe('ariEfficiency');
    });
  });

  describe('reset and example observers', () => {
    it('should rebuild the form when reset is signalled', () => {
      createComponent();
      chillerStagingService.initDefaultEmptyInputs(IMPERIAL_SETTINGS);
      chillerStagingService.resetData.next(true);
      fixture.detectChanges();
      expect(component.form.controls.ariCapacity.value).toBe(0);
      expect(loadInputs('modLoad').length).toBe(1);
    });

    it('should rebuild the form when an example is generated', () => {
      createComponent(IMPERIAL_SETTINGS, 'empty');
      chillerStagingService.generateExampleData(IMPERIAL_SETTINGS);
      chillerStagingService.generateExample.next(true);
      fixture.detectChanges();
      expect(component.form.controls.ariCapacity.value).toBe(1000);
      expect(loadInputs('modLoad').length).toBe(3);
    });

    it('should ignore a false signal', () => {
      createComponent();
      const form = component.form;
      chillerStagingService.resetData.next(false);
      chillerStagingService.generateExample.next(false);
      expect(component.form).toBe(form);
    });
  });

  describe('destroy', () => {
    it('should stop rebuilding the form after destroy', () => {
      createComponent();
      const form = component.form;
      fixture.destroy();
      chillerStagingService.resetData.next(true);
      chillerStagingService.generateExample.next(true);
      expect(component.form).toBe(form);
    });
  });
});
