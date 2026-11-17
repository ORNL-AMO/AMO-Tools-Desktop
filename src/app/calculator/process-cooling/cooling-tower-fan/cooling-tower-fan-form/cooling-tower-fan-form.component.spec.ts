import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerFanFormComponent } from './cooling-tower-fan-form.component';
import { CoolingTowerFanFormService } from '../cooling-tower-fan-form.service';
import { CoolingTowerFanService } from '../cooling-tower-fan.service';
import { CoolingTowerFanInput } from '../../../../shared/models/chillers';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;
const DASHES = '— —';
const FAHRENHEIT = '℉';
const CELSIUS = '℃';

function makeInput(overrides: Partial<CoolingTowerFanInput> = {}): CoolingTowerFanInput {
  return {
    towerType: 0,
    numCells: 1,
    waterFlowRate: 924.9,
    ratedFanPower: 59.5,
    waterLeavingTemp: 81.5,
    waterEnteringTemp: 88,
    operatingTempWetBulb: 76,
    operatingHours: 7000,
    baselineSpeedType: 0,
    modSpeedType: 1,
    electricityCost: 0.066,
    ...overrides,
  };
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('CoolingTowerFanFormComponent', () => {
  let component: CoolingTowerFanFormComponent;
  let fixture: ComponentFixture<CoolingTowerFanFormComponent>;
  let coolingTowerFanService: Partial<CoolingTowerFanService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getFormGroup(controlName: string): HTMLElement {
    return query(`#${controlName}`).closest('.form-group') as HTMLElement;
  }

  function getUnits(controlName: string): Array<string> {
    return Array.from(getFormGroup(controlName).querySelectorAll('.input-group .units'))
      .map((unit: HTMLElement) => normalize(unit.textContent));
  }

  function getAlert(controlName: string): HTMLElement | null {
    return getFormGroup(controlName).querySelector('.alert-danger');
  }

  function getAlertMessages(controlName: string): Array<string> {
    const alert = getAlert(controlName);
    return alert ? Array.from(alert.querySelectorAll('span')).map((span: HTMLElement) => normalize(span.textContent)) : [];
  }

  function getResultValue(label: string): string {
    const group = query(`label[for="${label}"]`).closest('.form-group');
    return normalize(group.querySelector('.input-group').textContent);
  }

  function getOptions(selectId: string): Array<string> {
    return Array.from(query(`#${selectId}`).querySelectorAll('option'))
      .map((option: HTMLElement) => option.textContent.trim());
  }

  function setControl(controlName: string, value: number): void {
    const control = component.form.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(settings: Settings = IMPERIAL, input: CoolingTowerFanInput = makeInput()): void {
    coolingTowerFanService.coolingTowerFanInput.next(input);
    fixture = TestBed.createComponent(CoolingTowerFanFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', settings);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    coolingTowerFanService = {
      coolingTowerFanInput: new BehaviorSubject<CoolingTowerFanInput>(undefined),
      resetData: new BehaviorSubject<boolean>(undefined),
      generateExample: new BehaviorSubject<boolean>(undefined),
      currentField: new BehaviorSubject<string>(undefined),
    };

    await TestBed.configureTestingModule({
      declarations: [CoolingTowerFanFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        CoolingTowerFanFormService,
        { provide: CoolingTowerFanService, useValue: coolingTowerFanService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  describe('initialization', () => {
    it('builds the form from the service input', () => {
      const input = makeInput();
      createComponent(IMPERIAL, input);
      expect(component.form.getRawValue()).toEqual(input);
    });

    it('pushes the form input back to the service and computes range/approach', () => {
      createComponent(IMPERIAL, makeInput({ waterEnteringTemp: 90, waterLeavingTemp: 80, operatingTempWetBulb: 72 }));
      expect(coolingTowerFanService.coolingTowerFanInput.getValue())
        .toEqual(makeInput({ waterEnteringTemp: 90, waterLeavingTemp: 80, operatingTempWetBulb: 72 }));
      expect(component.results).toEqual({ range: 10, approach: 8 });
    });

    it('renders the dropdown options', () => {
      createComponent();
      expect(getOptions('towerType')).toEqual(['Open Tower']);
      expect(getOptions('baselineSpeedType')).toEqual(['One Speed', 'Two Speed', 'Variable Speed']);
      expect(getOptions('modSpeedType')).toEqual(['One Speed', 'Two Speed', 'Variable Speed']);
    });
  });

  describe('reset / generate example observers', () => {
    it('rebuilds the form from the current input on reset', () => {
      createComponent();
      const previousForm = component.form;
      coolingTowerFanService.coolingTowerFanInput.next(makeInput({ numCells: 4 }));
      coolingTowerFanService.resetData.next(true);
      expect(component.form).not.toBe(previousForm);
      expect(component.form.controls.numCells.value).toBe(4);
    });

    it('rebuilds the form from the current input on generate example', () => {
      createComponent();
      const previousForm = component.form;
      coolingTowerFanService.coolingTowerFanInput.next(makeInput({ ratedFanPower: 30 }));
      coolingTowerFanService.generateExample.next(true);
      expect(component.form).not.toBe(previousForm);
      expect(component.form.controls.ratedFanPower.value).toBe(30);
    });
  });

  describe('calculation trigger', () => {
    it('sends updated input to the service and updates the rendered range/approach', () => {
      createComponent();
      component.form.controls.waterEnteringTemp.setValue(95);
      component.form.controls.waterLeavingTemp.setValue(85);
      component.form.controls.operatingTempWetBulb.setValue(80);
      component.calculate();
      fixture.detectChanges();

      expect(coolingTowerFanService.coolingTowerFanInput.getValue().waterEnteringTemp).toBe(95);
      expect(getResultValue('range')).toBe(`10 ${FAHRENHEIT}`);
      expect(getResultValue('approach')).toBe(`5 ${FAHRENHEIT}`);
    });

    it('recalculates on input events', () => {
      createComponent();
      const numCells = query('#numCells') as HTMLInputElement;
      numCells.value = '3';
      numCells.dispatchEvent(new Event('input'));
      expect(coolingTowerFanService.coolingTowerFanInput.getValue().numCells).toBe(3);
    });
  });

  describe('validator toggling', () => {
    it('limits leaving and wet bulb temperature to the entering temperature', () => {
      createComponent();
      component.form.controls.waterEnteringTemp.setValue(70);
      component.calculate();
      expect(component.form.controls.waterLeavingTemp.errors.max).toEqual({ max: 70, actual: 81.5 });
      expect(component.form.controls.operatingTempWetBulb.errors.max).toEqual({ max: 70, actual: 76 });
    });

    it('clears the temperature limits when entering temperature is raised again', () => {
      createComponent();
      component.form.controls.waterEnteringTemp.setValue(70);
      component.calculate();
      component.form.controls.waterEnteringTemp.setValue(100);
      component.calculate();
      expect(component.form.controls.waterLeavingTemp.valid).toBeTrue();
      expect(component.form.controls.operatingTempWetBulb.valid).toBeTrue();
      expect(component.form.controls.waterEnteringTemp.valid).toBeTrue();
    });

    it('requires entering temperature to be at least the leaving temperature', () => {
      createComponent();
      component.form.controls.waterLeavingTemp.setValue(90);
      component.calculate();
      expect(component.form.controls.waterEnteringTemp.errors.min).toEqual({ min: 90, actual: 88 });
    });
  });

  describe('template visibility', () => {
    describe('units', () => {
      const UNIT_CASES: Array<{ control: string, imperial: string, metric: string }> = [
        { control: 'ratedFanPower', imperial: 'hp', metric: 'kW' },
        { control: 'waterFlowRate', imperial: 'GPM', metric: 'm3/s' },
        { control: 'waterLeavingTemp', imperial: FAHRENHEIT, metric: CELSIUS },
        { control: 'waterEnteringTemp', imperial: FAHRENHEIT, metric: CELSIUS },
        { control: 'operatingTempWetBulb', imperial: FAHRENHEIT, metric: CELSIUS },
      ];

      UNIT_CASES.forEach(({ control, imperial, metric }) => {
        it(`shows only the imperial unit for ${control}`, () => {
          createComponent(IMPERIAL);
          expect(getUnits(control)).toEqual([imperial]);
        });

        it(`shows only the metric unit for ${control}`, () => {
          createComponent(METRIC);
          expect(getUnits(control)).toEqual([metric]);
        });

        it(`shows no unit for ${control} with an unknown unit system`, () => {
          createComponent({ unitsOfMeasure: 'Other' } as Settings);
          expect(getUnits(control)).toEqual([]);
        });
      });
    });

    describe('validation messages', () => {
      it('shows no validation messages for valid input', () => {
        createComponent();
        expect(fixture.nativeElement.querySelectorAll('.alert-danger').length).toBe(0);
      });

      it('hides the message for an invalid but pristine field', () => {
        createComponent();
        component.form.controls.numCells.setValue(null);
        fixture.detectChanges();
        expect(component.form.controls.numCells.invalid).toBeTrue();
        expect(getAlert('numCells')).toBeNull();
      });

      const MESSAGE_CASES: Array<{ control: string, value: number, expected: Array<string> }> = [
        { control: 'numCells', value: null, expected: ['Value required.'] },
        { control: 'numCells', value: -1, expected: ['Value can\'t be less than 0.'] },
        { control: 'ratedFanPower', value: null, expected: ['Value required.'] },
        { control: 'ratedFanPower', value: -1, expected: ['Value can\'t be less than 0.'] },
        { control: 'waterFlowRate', value: null, expected: ['Value required.'] },
        { control: 'waterFlowRate', value: -1, expected: ['Value can\'t be less than 0.'] },
        { control: 'operatingHours', value: null, expected: ['Value required.'] },
        { control: 'operatingHours', value: 9000, expected: ['Value can\'t be greater than 8760.'] },
        { control: 'operatingHours', value: -1, expected: ['Value can\'t be less than 0.'] },
        { control: 'electricityCost', value: null, expected: ['Value required.'] },
        { control: 'electricityCost', value: -1, expected: ['Value cannot not be less than 0.'] },
        { control: 'waterLeavingTemp', value: null, expected: ['Value required.'] },
        { control: 'waterLeavingTemp', value: 90, expected: ['Value can\'t be greater than Entering Water Temperature (88).'] },
        { control: 'waterEnteringTemp', value: null, expected: ['Value required.'] },
        { control: 'waterEnteringTemp', value: 80, expected: ['Value can\'t be less than Leaving Water Temperature 81.5.'] },
        { control: 'operatingTempWetBulb', value: null, expected: ['Value required.'] },
        { control: 'operatingTempWetBulb', value: 90, expected: ['Value can\'t be greater than Entering Water Temperature (88).'] },
      ];

      MESSAGE_CASES.forEach(({ control, value, expected }) => {
        it(`shows ${JSON.stringify(expected)} for ${control} = ${value}`, () => {
          createComponent();
          setControl(control, value);
          expect(getAlert(control)).not.toBeNull();
          expect(getAlertMessages(control)).toEqual(expected);
        });
      });
    });

    describe('range and approach', () => {
      it('shows imperial range and approach values', () => {
        createComponent(IMPERIAL, makeInput({ waterEnteringTemp: 90, waterLeavingTemp: 80, operatingTempWetBulb: 72.5 }));
        expect(getResultValue('range')).toBe(`10 ${FAHRENHEIT}`);
        expect(getResultValue('approach')).toBe(`7.5 ${FAHRENHEIT}`);
      });

      it('shows metric range and approach values', () => {
        createComponent(METRIC, makeInput({ waterEnteringTemp: 30, waterLeavingTemp: 25, operatingTempWetBulb: 22 }));
        expect(getResultValue('range')).toBe(`5 ${CELSIUS}`);
        expect(getResultValue('approach')).toBe(`3 ${CELSIUS}`);
      });

      it('shows values without units for an unknown unit system', () => {
        createComponent({ unitsOfMeasure: 'Other' } as Settings, makeInput({ waterEnteringTemp: 90, waterLeavingTemp: 80, operatingTempWetBulb: 72 }));
        expect(getResultValue('range')).toBe('10');
        expect(getResultValue('approach')).toBe('8');
      });

      it('shows dashes for a zero range and approach', () => {
        createComponent(IMPERIAL, makeInput({ waterEnteringTemp: 0, waterLeavingTemp: 0, operatingTempWetBulb: 0 }));
        expect(getResultValue('range')).toBe(DASHES);
        expect(getResultValue('approach')).toBe(DASHES);
      });

      it('shows dashes for range only when range is zero', () => {
        createComponent(IMPERIAL, makeInput({ waterEnteringTemp: 80, waterLeavingTemp: 80, operatingTempWetBulb: 72 }));
        expect(getResultValue('range')).toBe(DASHES);
        expect(getResultValue('approach')).toBe(`8 ${FAHRENHEIT}`);
      });

      it('shows dashes for approach only when approach is zero', () => {
        createComponent(IMPERIAL, makeInput({ waterEnteringTemp: 90, waterLeavingTemp: 80, operatingTempWetBulb: 80 }));
        expect(getResultValue('range')).toBe(`10 ${FAHRENHEIT}`);
        expect(getResultValue('approach')).toBe(DASHES);
      });
    });

    describe('operating hours modal', () => {
      it('hides the modal by default', () => {
        createComponent();
        expect(query('app-operating-hours-modal')).toBeNull();
      });

      it('shows the modal after clicking the calculator link', () => {
        createComponent();
        (query('.click-link') as HTMLElement).click();
        fixture.detectChanges();
        expect(component.showOpHoursModal).toBeTrue();
        expect(query('app-operating-hours-modal')).not.toBeNull();
      });

      it('hides the modal after closing it', () => {
        createComponent();
        component.openOperatingHoursModal();
        fixture.detectChanges();
        component.closeOperatingHoursModal();
        fixture.detectChanges();
        expect(query('app-operating-hours-modal')).toBeNull();
      });
    });
  });

  describe('user actions', () => {
    it('applies operating hours from the modal, recalculates, and closes it', () => {
      createComponent();
      component.openOperatingHoursModal();
      fixture.detectChanges();

      component.updateOperatingHours({ hoursPerYear: 4000 } as OperatingHours);
      fixture.detectChanges();

      expect(component.form.controls.operatingHours.value).toBe(4000);
      expect(coolingTowerFanService.coolingTowerFanInput.getValue().operatingHours).toBe(4000);
      expect(component.showOpHoursModal).toBeFalse();
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('stops rebuilding the form after destroy', () => {
      createComponent();
      const form = component.form;
      fixture.destroy();
      coolingTowerFanService.resetData.next(true);
      coolingTowerFanService.generateExample.next(true);
      expect(component.form).toBe(form);
    });
  });
});
