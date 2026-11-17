import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { CoolingTowerBasinFormComponent } from './cooling-tower-basin-form.component';
import { CoolingTowerBasinService } from '../cooling-tower-basin.service';
import { CoolingTowerBasinFormService } from '../cooling-tower-basin-form.service';
import { CoolingTowerBasinInput } from '../../../../shared/models/chillers';
import { OperatingHours } from '../../../../shared/models/operations';
import { Settings } from '../../../../shared/models/settings';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

function makeInput(overrides: Partial<CoolingTowerBasinInput> = {}): CoolingTowerBasinInput {
  return {
    ratedCapacity: 1000,
    ratedTempSetPoint: 40,
    ratedTempDryBulb: 0,
    ratedWindSpeed: 15,
    panLossRatio: 0.011,
    operatingTempDryBulb: 28,
    operatingWindSpeed: 10,
    operatingHours: 1000,
    baselineTempSetPoint: 40,
    modTempSetPoint: 35,
    electricityCost: 0.066,
    ...overrides,
  };
}

const UNIT_CASES: Array<{ field: string, imperial: string, metric: string }> = [
  { field: 'ratedCapacity', imperial: 'tons', metric: 'kW' },
  { field: 'ratedTempSetPoint', imperial: '℉', metric: '℃' },
  { field: 'ratedTempDryBulb', imperial: '℉', metric: '℃' },
  { field: 'ratedWindSpeed', imperial: 'mph', metric: 'km/h' },
  { field: 'operatingWindSpeed', imperial: 'mph', metric: 'km/h' },
  { field: 'operatingTempDryBulb', imperial: '℉', metric: '℃' },
  { field: 'baselineTempSetPoint', imperial: '℉', metric: '℃' },
  { field: 'modTempSetPoint', imperial: '℉', metric: '℃' },
];

const ERROR_CASES: Array<{ field: string, value: number, message: string }> = [
  { field: 'ratedCapacity', value: null, message: 'Value required.' },
  { field: 'ratedCapacity', value: -1, message: "Value can't be less than 0." },
  { field: 'ratedTempSetPoint', value: null, message: 'Value required.' },
  { field: 'ratedTempSetPoint', value: 10, message: "Value can't be less than 32." },
  { field: 'ratedTempDryBulb', value: null, message: 'Value required.' },
  { field: 'ratedWindSpeed', value: null, message: 'Value required.' },
  { field: 'ratedWindSpeed', value: -1, message: "Value can't be less than 0." },
  { field: 'panLossRatio', value: null, message: 'Value required.' },
  { field: 'panLossRatio', value: -1, message: "Value can't be less than 0." },
  { field: 'panLossRatio', value: 2, message: "Value can't be greater than 1." },
  { field: 'operatingWindSpeed', value: null, message: 'Value required.' },
  { field: 'operatingHours', value: null, message: 'Value required.' },
  { field: 'operatingHours', value: 9000, message: "Value can't be greater than 8760." },
  { field: 'operatingHours', value: -1, message: "Value can't be less than 0." },
  { field: 'electricityCost', value: null, message: 'Value required.' },
  { field: 'electricityCost', value: -1, message: 'Value cannot not be less than 0.' },
  { field: 'operatingTempDryBulb', value: null, message: 'Value required.' },
  { field: 'baselineTempSetPoint', value: null, message: 'Value required.' },
  { field: 'baselineTempSetPoint', value: 10, message: "Value can't be less than 32." },
  { field: 'modTempSetPoint', value: null, message: 'Value required.' },
  { field: 'modTempSetPoint', value: 10, message: "Value can't be less than 32." },
];

const WARNING_CASES: Array<{ field: string }> = [
  { field: 'ratedTempSetPoint' },
  { field: 'baselineTempSetPoint' },
  { field: 'modTempSetPoint' },
];

const WEATHER_ONLY_FIELDS = ['operatingHours', 'operatingTempDryBulb'];
const WEATHER_INFO = 'Operating Hours and Operating Ambient Dry Bulb Temperature are set from Weather Data conditions';
const TREASURE_HUNT_INFO = 'Weather Binned Results are used for the Treasure Hunt Opportunity';
const NO_WEATHER_WARNING = 'Please enter Weather Data conditions for results to be calculated';

describe('CoolingTowerBasinFormComponent', () => {
  let component: CoolingTowerBasinFormComponent;
  let fixture: ComponentFixture<CoolingTowerBasinFormComponent>;
  let serviceStub: Partial<CoolingTowerBasinService>;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function getInput(field: string): HTMLInputElement | null {
    return fixture.nativeElement.querySelector(`input#${field}`);
  }

  function getFormGroup(field: string): HTMLElement {
    return getInput(field).closest('.form-group') as HTMLElement;
  }

  function getUnitTexts(field: string): Array<string> {
    return Array.from(getFormGroup(field).querySelectorAll('.input-group-addon.units:not(.op-hour-addon)'))
      .map((span: HTMLElement) => span.textContent.trim());
  }

  function getErrorTexts(field: string): Array<string> {
    const alert = getFormGroup(field).querySelector('.alert-danger');
    if (!alert) {
      return [];
    }
    return Array.from(alert.querySelectorAll('span')).map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function getWarning(field: string): HTMLElement | null {
    return getFormGroup(field).querySelector('.alert-warning');
  }

  function getInfoTexts(): Array<string> {
    return Array.from(fixture.nativeElement.querySelectorAll('.alert-info, div.mx-auto > .alert-warning'))
      .map((span: HTMLElement) => span.textContent.replace(/\s+/g, ' ').trim());
  }

  function createComponent(inputs: { settings?: Settings, inTreasureHunt?: boolean } = {}): void {
    fixture = TestBed.createComponent(CoolingTowerBasinFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('settings', inputs.settings ?? IMPERIAL);
    if (inputs.inTreasureHunt !== undefined) {
      fixture.componentRef.setInput('inTreasureHunt', inputs.inTreasureHunt);
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
    serviceStub = {
      coolingTowerBasinInput: new BehaviorSubject<CoolingTowerBasinInput>(makeInput()),
      resetData: new BehaviorSubject<boolean>(undefined),
      generateExample: new BehaviorSubject<boolean>(undefined),
      hasWeatherBinsData: new BehaviorSubject<boolean>(false),
      isShowingWeatherResults: new BehaviorSubject<boolean>(false),
      currentField: new BehaviorSubject<string>(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [CoolingTowerBasinFormComponent],
      providers: [
        { provide: CoolingTowerBasinService, useValue: serviceStub },
        CoolingTowerBasinFormService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('initialization', () => {
    it('builds the form from the service input and publishes the calculated input', () => {
      const nextSpy = spyOn(serviceStub.coolingTowerBasinInput, 'next').and.callThrough();
      createComponent();
      expect(component.form.controls.ratedCapacity.value).toBe(1000);
      expect(getInput('ratedCapacity').value).toBe('1000');
      expect(nextSpy).toHaveBeenCalledWith(makeInput());
    });

    it('rebuilds the form when data is reset', () => {
      createComponent();
      serviceStub.coolingTowerBasinInput.next(makeInput({ ratedCapacity: 250 }));
      serviceStub.resetData.next(true);
      fixture.detectChanges();
      expect(getInput('ratedCapacity').value).toBe('250');
    });

    it('rebuilds the form when an example is generated', () => {
      createComponent();
      serviceStub.coolingTowerBasinInput.next(makeInput({ panLossRatio: 0.5 }));
      serviceStub.generateExample.next(true);
      fixture.detectChanges();
      expect(getInput('panLossRatio').value).toBe('0.5');
    });

    it('renders every always-visible input', () => {
      createComponent({ inTreasureHunt: true });
      ['ratedCapacity', 'ratedTempSetPoint', 'ratedTempDryBulb', 'ratedWindSpeed', 'panLossRatio',
        'operatingWindSpeed', 'electricityCost', 'baselineTempSetPoint', 'modTempSetPoint']
        .forEach(field => expect(getInput(field)).withContext(field).not.toBeNull());
    });
  });

  describe('units', () => {
    UNIT_CASES.forEach(({ field, imperial, metric }) => {
      it(`shows the imperial unit for ${field}`, () => {
        createComponent({ settings: IMPERIAL });
        expect(getUnitTexts(field)).toEqual([imperial]);
      });

      it(`shows the metric unit for ${field}`, () => {
        createComponent({ settings: METRIC });
        expect(getUnitTexts(field)).toEqual([metric]);
      });
    });

    it('shows fixed units for operating hours and electricity cost', () => {
      createComponent();
      expect(getUnitTexts('operatingHours')).toEqual(['hrs/yr']);
      expect(getUnitTexts('electricityCost')).toEqual(['$/kWh']);
    });

    it('shows no unit for pan loss ratio', () => {
      createComponent();
      expect(getUnitTexts('panLossRatio')).toEqual([]);
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

    it('hides errors for an invalid but pristine field', () => {
      serviceStub.coolingTowerBasinInput.next(makeInput({ ratedCapacity: null }));
      createComponent();
      expect(component.form.controls.ratedCapacity.invalid).toBeTrue();
      expect(getErrorTexts('ratedCapacity')).toEqual([]);
    });

    it('hides errors for a valid dirty field', () => {
      createComponent();
      setDirtyValue('ratedCapacity', 5);
      expect(getErrorTexts('ratedCapacity')).toEqual([]);
    });

    it('uses the metric temperature minimum', () => {
      createComponent({ settings: METRIC });
      setDirtyValue('modTempSetPoint', -5);
      expect(getErrorTexts('modTempSetPoint')).toEqual(["Value can't be less than 0."]);
    });
  });

  describe('basin temperature warnings', () => {
    WARNING_CASES.forEach(({ field }) => {
      it(`shows the ${field} warning above the maximum`, () => {
        createComponent();
        setDirtyValue(field, 60);
        expect(getWarning(field).textContent.trim()).toBe('Basin temperature should be less than 50');
      });

      it(`hides the ${field} warning at or below the maximum`, () => {
        createComponent();
        setDirtyValue(field, 50);
        expect(getWarning(field)).toBeNull();
      });
    });

    it('uses the metric maximum', () => {
      createComponent({ settings: METRIC });
      setDirtyValue('baselineTempSetPoint', 20);
      expect(getWarning('baselineTempSetPoint').textContent.trim()).toBe('Basin temperature should be less than 10');
    });
  });

  describe('weather and treasure hunt conditions', () => {
    it('shows operating hours and dry bulb inputs and no info alerts by default', () => {
      createComponent();
      WEATHER_ONLY_FIELDS.forEach(field => expect(getInput(field)).withContext(field).not.toBeNull());
      expect(getInfoTexts()).toEqual([]);
    });

    it('hides operating hours and dry bulb inputs and shows the weather info when weather results are showing', () => {
      serviceStub.isShowingWeatherResults.next(true);
      createComponent();
      WEATHER_ONLY_FIELDS.forEach(field => expect(getInput(field)).withContext(field).toBeNull());
      expect(getInfoTexts()).toEqual([WEATHER_INFO]);
    });

    it('toggles when the weather results observer changes', () => {
      createComponent();
      serviceStub.isShowingWeatherResults.next(true);
      fixture.detectChanges();
      expect(getInput('operatingHours')).toBeNull();
      serviceStub.isShowingWeatherResults.next(false);
      fixture.detectChanges();
      expect(getInput('operatingHours')).not.toBeNull();
    });

    it('shows the treasure hunt alerts and the missing weather warning without weather data', () => {
      createComponent({ inTreasureHunt: true });
      WEATHER_ONLY_FIELDS.forEach(field => expect(getInput(field)).withContext(field).toBeNull());
      expect(getInfoTexts()).toEqual([WEATHER_INFO, TREASURE_HUNT_INFO, NO_WEATHER_WARNING]);
    });

    it('hides the missing weather warning in a treasure hunt with weather data', () => {
      serviceStub.hasWeatherBinsData.next(true);
      createComponent({ inTreasureHunt: true });
      expect(getInfoTexts()).toEqual([WEATHER_INFO, TREASURE_HUNT_INFO]);
    });

    it('does not show the missing weather warning outside a treasure hunt', () => {
      serviceStub.hasWeatherBinsData.next(false);
      createComponent({ inTreasureHunt: false });
      expect(getInfoTexts()).toEqual([]);
    });
  });

  describe('user actions', () => {
    it('publishes the focused field', () => {
      createComponent();
      getInput('panLossRatio').dispatchEvent(new Event('focus'));
      expect(serviceStub.currentField.getValue()).toBe('panLossRatio');
    });

    it('recalculates and publishes the input on typing', () => {
      createComponent();
      const input = getInput('ratedWindSpeed');
      input.value = '22';
      input.dispatchEvent(new Event('input'));
      expect(serviceStub.coolingTowerBasinInput.getValue().ratedWindSpeed).toBe(22);
    });
  });

  describe('operating hours modal', () => {
    it('is hidden by default', () => {
      createComponent();
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('opens from the calculator link', () => {
      createComponent();
      (query('a.click-link') as HTMLElement).click();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).not.toBeNull();
    });

    it('applies the hours, recalculates, and closes on save', () => {
      createComponent();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.updateOperatingHours({ hoursPerYear: 4000 } as OperatingHours);
      fixture.detectChanges();
      expect(component.form.controls.operatingHours.value).toBe(4000);
      expect(serviceStub.coolingTowerBasinInput.getValue().operatingHours).toBe(4000);
      expect(query('app-operating-hours-modal')).toBeNull();
    });

    it('closes on close', () => {
      createComponent();
      component.openOperatingHoursModal();
      fixture.detectChanges();
      component.closeOperatingHoursModal();
      fixture.detectChanges();
      expect(query('app-operating-hours-modal')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('unsubscribes from the service subjects', () => {
      createComponent();
      fixture.destroy();
      expect(serviceStub.resetData.observed).toBeFalse();
      expect(serviceStub.generateExample.observed).toBeFalse();
      expect(serviceStub.hasWeatherBinsData.observed).toBeFalse();
      expect(serviceStub.isShowingWeatherResults.observed).toBeFalse();
    });
  });
});
