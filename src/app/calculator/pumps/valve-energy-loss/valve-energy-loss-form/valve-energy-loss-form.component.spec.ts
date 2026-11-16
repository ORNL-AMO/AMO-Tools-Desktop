import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ValveEnergyLossFormComponent } from './valve-energy-loss-form.component';
import { ValveEnergyLossFormService } from './valve-energy-loss-form.service';
import { ValveEnergyLossService } from '../valve-energy-loss.service';
import { ValveEnergyLossInputs } from '../../../../shared/models/calculators';
import { Settings } from '../../../../shared/models/settings';
import { OperatingHours } from '../../../../shared/models/operations';

const IMPERIAL_SETTINGS = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC_SETTINGS = { unitsOfMeasure: 'Metric' } as Settings;

function makeInputs(overrides: Partial<ValveEnergyLossInputs> = {}): ValveEnergyLossInputs {
  return {
    hoursOperation: 8760,
    electricalRate: 0.05,
    efficiencyPump: 85,
    efficiencyMotor: 95,
    SG: 1,
    flowRate: 5000,
    upstreamPressure: 50,
    upstreamDiameter: 5,
    upstreamHeight: 5,
    valveDiameter: 8,
    downstreamPressure: 35,
    downstreamDiameter: 6,
    downstreamHeight: 2,
    pipeSizeFactor: 1.5,
    ...overrides,
  };
}

function makeServiceMock(baseline?: ValveEnergyLossInputs, modification?: ValveEnergyLossInputs): Partial<ValveEnergyLossService> {
  return {
    baselineData: new BehaviorSubject<ValveEnergyLossInputs>(baseline),
    modificationData: new BehaviorSubject<ValveEnergyLossInputs>(modification),
    currentField: new BehaviorSubject<string>('default'),
    resetData: new BehaviorSubject<boolean>(undefined),
    generateExample: new BehaviorSubject<boolean>(undefined),
    operatingHours: undefined,
  };
}

// [control, invalid value, expected error text]. The error block shows only the matching message.
const ERROR_CASES: Array<[control: string, value: number, message: string]> = [
  ['hoursOperation', null, 'Value required.'],
  ['hoursOperation', 9000, "Value can't be greater than 8760."],
  ['hoursOperation', -1, "Value can't be less than 0."],
  ['electricalRate', null, 'Value required.'],
  ['electricalRate', -1, "Value can't be less than 0."],
  ['efficiencyPump', null, 'Value required.'],
  ['efficiencyPump', 101, "Value can't be greater than 100."],
  ['efficiencyPump', -1, "Value can't be less than 0."],
  ['efficiencyMotor', null, 'Value required.'],
  ['efficiencyMotor', 101, "Value can't be greater than 100."],
  ['efficiencyMotor', -1, "Value can't be less than 0."],
  ['SG', null, 'Value required.'],
  ['SG', 8, "Value can't be greater than 7."],
  ['SG', 0.5, 'Value must be greater than 0.'],
  ['flowRate', null, 'Value required.'],
  ['flowRate', -1, "Value can't be less than 0."],
  ['upstreamPressure', null, 'Value required.'],
  ['upstreamPressure', 1001, "Value can't be greater than 1000."],
  ['upstreamPressure', -1, "Value can't be less than 0."],
  ['upstreamHeight', null, 'Value required.'],
  ['downstreamPressure', null, 'Value required.'],
  ['downstreamPressure', 60, "Value can't be greater than 50."],
  ['downstreamPressure', -1, "Value can't be less than 0."],
  ['downstreamHeight', null, 'Value required.'],
];

const VALIDATED_CONTROLS: Array<string> = [
  'hoursOperation', 'electricalRate', 'efficiencyPump', 'efficiencyMotor', 'SG', 'flowRate',
  'upstreamPressure', 'upstreamHeight', 'downstreamPressure', 'downstreamHeight',
];

// [control, Imperial unit, Metric unit] for the unit addons that switch on settings.unitsOfMeasure.
const UNIT_CASES: Array<[control: string, imperial: string, metric: string]> = [
  ['flowRate', 'gpm', 'L/min'],
  ['upstreamPressure', 'psi', 'bar'],
  ['upstreamHeight', 'ft', 'm'],
  ['downstreamPressure', 'psi', 'bar'],
  ['downstreamHeight', 'ft', 'm'],
];

describe('ValveEnergyLossFormComponent', () => {
  let component: ValveEnergyLossFormComponent;
  let fixture: ComponentFixture<ValveEnergyLossFormComponent>;
  let serviceMock: Partial<ValveEnergyLossService>;

  function normalize(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
  }

  function getInput(control: string): HTMLInputElement {
    return fixture.nativeElement.querySelector(`input[formControlName="${control}"]`);
  }

  function getFormGroup(control: string): HTMLElement {
    return getInput(control).closest('.form-group');
  }

  function getErrorBlock(control: string): HTMLElement | null {
    return getFormGroup(control).querySelector('.alert-danger');
  }

  function getUnits(control: string): Array<string> {
    return Array.from(getFormGroup(control).querySelectorAll('.input-group span.units'))
      .map((span: HTMLElement) => span.textContent.trim());
  }

  function getModal(): HTMLElement | null {
    return fixture.nativeElement.querySelector('app-operating-hours-modal');
  }

  function setDirtyValue(control: string, value: number): void {
    component.form.controls[control].setValue(value);
    component.form.controls[control].markAsDirty();
    fixture.detectChanges();
  }

  function createComponent(inputs: { isBaseline?: boolean, selected?: boolean, settings?: Settings } = {}): void {
    fixture = TestBed.createComponent(ValveEnergyLossFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', inputs.settings ?? IMPERIAL_SETTINGS);
    fixture.componentRef.setInput('isBaseline', inputs.isBaseline ?? true);
    if (inputs.selected !== undefined) {
      fixture.componentRef.setInput('selected', inputs.selected);
    }
    fixture.detectChanges();
  }

  function configure(mock: Partial<ValveEnergyLossService>): Promise<void> {
    serviceMock = mock;
    return TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ValveEnergyLossFormComponent],
      providers: [
        { provide: ValveEnergyLossService, useValue: serviceMock },
        ValveEnergyLossFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  describe('initialization', () => {
    it('builds the baseline form from the service baseline data', async () => {
      await configure(makeServiceMock(makeInputs(), makeInputs({ downstreamPressure: 45 })));
      createComponent({ isBaseline: true });
      expect(component.idString).toBe('baseline_0');
      expect(component.form.value).toEqual(makeInputs());
      expect(getInput('hoursOperation').id).toBe('hoursOperation_baseline_0');
    });

    it('builds the modification form from the service modification data', async () => {
      await configure(makeServiceMock(makeInputs(), makeInputs({ downstreamPressure: 45 })));
      createComponent({ isBaseline: false });
      expect(component.idString).toBe('modification_0');
      expect(component.form.controls.downstreamPressure.value).toBe(45);
      expect(getInput('hoursOperation').id).toBe('hoursOperation_modification_0');
    });

    it('builds an empty default form when the service has no data', async () => {
      await configure(makeServiceMock(undefined, undefined));
      createComponent({ isBaseline: true });
      expect(component.form.controls.hoursOperation.value).toBe(0);
      expect(component.form.invalid).toBeTrue();
      expect(serviceMock.baselineData.getValue()).toBeUndefined();
    });

    it('pushes valid baseline form values back to the service', async () => {
      await configure(makeServiceMock(makeInputs({ flowRate: 1234 }), undefined));
      createComponent({ isBaseline: true });
      expect(serviceMock.baselineData.getValue()).toEqual(makeInputs({ flowRate: 1234 }));
    });

    it('enables the form when selected is not false', async () => {
      await configure(makeServiceMock(makeInputs(), undefined));
      createComponent({ isBaseline: true, selected: true });
      expect(component.form.enabled).toBeTrue();
    });

    it('disables the form when created unselected', async () => {
      await configure(makeServiceMock(makeInputs(), makeInputs()));
      createComponent({ isBaseline: false, selected: false });
      expect(component.form.disabled).toBeTrue();
    });
  });

  describe('with baseline data', () => {
    beforeEach(async () => {
      await configure(makeServiceMock(makeInputs(), makeInputs({ downstreamPressure: 45 })));
    });

    describe('selected changes', () => {
      it('disables the form when deselected and re-enables it when selected', () => {
        createComponent({ isBaseline: true, selected: true });
        fixture.componentRef.setInput('selected', false);
        fixture.detectChanges();
        expect(component.form.disabled).toBeTrue();

        fixture.componentRef.setInput('selected', true);
        fixture.detectChanges();
        expect(component.form.enabled).toBeTrue();
      });
    });

    describe('reactive observers', () => {
      beforeEach(() => {
        createComponent({ isBaseline: true });
      });

      it('rebuilds the form from current baseline data when data is reset', () => {
        const previousForm = component.form;
        serviceMock.baselineData.next(makeInputs({ flowRate: 100 }));
        serviceMock.resetData.next(true);
        expect(component.form).not.toBe(previousForm);
        expect(component.form.controls.flowRate.value).toBe(100);
      });

      it('rebuilds the form when an example is generated', () => {
        const previousForm = component.form;
        serviceMock.baselineData.next(makeInputs({ efficiencyPump: 70 }));
        serviceMock.generateExample.next(true);
        expect(component.form).not.toBe(previousForm);
        expect(component.form.controls.efficiencyPump.value).toBe(70);
      });
    });

    describe('calculation triggers', () => {
      it('pushes baseline form values to the baseline data on calculate', () => {
        createComponent({ isBaseline: true });
        component.form.controls.flowRate.setValue(4000);
        component.calculate();
        expect(serviceMock.baselineData.getValue().flowRate).toBe(4000);
        expect(serviceMock.modificationData.getValue().flowRate).toBe(5000);
      });

      it('pushes modification form values to the modification data on calculate', () => {
        createComponent({ isBaseline: false });
        component.form.controls.flowRate.setValue(3000);
        component.calculate();
        expect(serviceMock.modificationData.getValue().flowRate).toBe(3000);
        expect(serviceMock.baselineData.getValue().flowRate).toBe(5000);
      });

      it('does not push values when the form is invalid', () => {
        createComponent({ isBaseline: true });
        component.form.controls.flowRate.setValue(-5);
        component.calculate();
        expect(serviceMock.baselineData.getValue().flowRate).toBe(5000);
      });

      it('recalculates on input events', () => {
        createComponent({ isBaseline: true });
        const input = getInput('electricalRate');
        input.value = '0.2';
        input.dispatchEvent(new Event('input'));
        expect(serviceMock.baselineData.getValue().electricalRate).toBe(0.2);
      });
    });

    describe('validator toggling', () => {
      beforeEach(() => {
        createComponent({ isBaseline: true });
      });

      it('applies a downstream pressure max equal to the upstream pressure', () => {
        component.form.controls.upstreamPressure.setValue(30);
        component.setValidators();
        expect(component.form.controls.downstreamPressure.errors).toEqual({ max: { max: 30, actual: 35 } });
      });

      it('clears the downstream pressure max error when upstream pressure rises again', () => {
        component.form.controls.upstreamPressure.setValue(30);
        component.setValidators();
        component.form.controls.upstreamPressure.setValue(40);
        component.setValidators();
        expect(component.form.controls.downstreamPressure.valid).toBeTrue();
      });

      it('recalculates after updating validators', () => {
        component.form.controls.upstreamPressure.setValue(60);
        component.setValidators();
        expect(serviceMock.baselineData.getValue().upstreamPressure).toBe(60);
      });
    });

    describe('template error messages', () => {
      beforeEach(() => {
        createComponent({ isBaseline: true });
      });

      VALIDATED_CONTROLS.forEach(control => {
        it(`hides the ${control} error block when the value is valid`, () => {
          expect(getErrorBlock(control)).toBeNull();
        });

        it(`hides the ${control} error block when invalid but pristine`, () => {
          component.form.controls[control].setValue(null);
          fixture.detectChanges();
          expect(component.form.controls[control].invalid).toBeTrue();
          expect(getErrorBlock(control)).toBeNull();
        });
      });

      ERROR_CASES.forEach(([control, value, message]) => {
        it(`shows only "${message}" for ${control} = ${value}`, () => {
          setDirtyValue(control, value);
          const errorBlock = getErrorBlock(control);
          expect(errorBlock).not.toBeNull();
          expect(errorBlock.querySelectorAll('span').length).toBe(1);
          expect(normalize(errorBlock.textContent)).toBe(message);
        });
      });

      it('hides the error block again when a dirty value becomes valid', () => {
        setDirtyValue('flowRate', -1);
        setDirtyValue('flowRate', 10);
        expect(getErrorBlock('flowRate')).toBeNull();
      });
    });

    describe('template units', () => {
      UNIT_CASES.forEach(([control, imperial, metric]) => {
        it(`renders only "${imperial}" for ${control} with Imperial settings`, () => {
          createComponent({ isBaseline: true, settings: IMPERIAL_SETTINGS });
          expect(getUnits(control)).toEqual([imperial]);
        });

        it(`renders only "${metric}" for ${control} with Metric settings`, () => {
          createComponent({ isBaseline: true, settings: METRIC_SETTINGS });
          expect(getUnits(control)).toEqual([metric]);
        });
      });

      it('renders fixed units regardless of settings', () => {
        createComponent({ isBaseline: true, settings: METRIC_SETTINGS });
        expect(getUnits('electricalRate')).toEqual(['$/kWh']);
        expect(getUnits('efficiencyPump')).toEqual(['%']);
        expect(getUnits('efficiencyMotor')).toEqual(['%']);
        expect(getUnits('SG')).toEqual([]);
      });
    });

    describe('operating hours modal', () => {
      beforeEach(() => {
        createComponent({ isBaseline: true });
      });

      it('hides the modal initially', () => {
        expect(getModal()).toBeNull();
      });

      it('shows the modal when the calculator link is clicked', () => {
        fixture.nativeElement.querySelector('.op-hour-addon a').click();
        fixture.detectChanges();
        expect(component.showOperatingHoursModal).toBeTrue();
        expect(getModal()).not.toBeNull();
      });

      it('hides the modal when closed', () => {
        component.openOperatingHoursModal();
        fixture.detectChanges();
        component.closeOperatingHoursModal();
        fixture.detectChanges();
        expect(getModal()).toBeNull();
      });

      it('applies saved operating hours, recalculates, and closes the modal', () => {
        const opHours = { hoursPerYear: 4000 } as OperatingHours;
        component.openOperatingHoursModal();
        fixture.detectChanges();
        component.updateOperatingHours(opHours);
        fixture.detectChanges();
        expect(serviceMock.operatingHours).toBe(opHours);
        expect(component.form.controls.hoursOperation.value).toBe(4000);
        expect(serviceMock.baselineData.getValue().hoursOperation).toBe(4000);
        expect(getModal()).toBeNull();
      });
    });

    describe('destroy', () => {
      it('stops rebuilding the form after destroy', () => {
        createComponent({ isBaseline: true });
        const formBeforeDestroy = component.form;
        fixture.destroy();
        serviceMock.resetData.next(true);
        serviceMock.generateExample.next(true);
        expect(component.form).toBe(formBeforeDestroy);
      });
    });
  });
});
