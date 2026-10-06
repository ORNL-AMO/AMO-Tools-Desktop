import { TestBed } from '@angular/core/testing';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { EnergyInputEAF } from '../../../../shared/models/phast/losses/energyInputEAF';
import { Settings } from '../../../../shared/models/settings';
import { EnergyInputFormService } from './energy-input-form.service';

const LOSS: EnergyInputEAF = {
  naturalGasHeatInput: 10, coalCarbonInjection: 100, coalHeatingValue: 12000,
  electrodeUse: 50, electrodeHeatingValue: 14000, otherFuels: 1, electricityInput: 5000, flowRateInput: 100,
};
const settingsFor = (unitsOfMeasure: string) => ({ unitsOfMeasure } as Settings);

describe('EnergyInputFormService', () => {
  let service: EnergyInputFormService;
  let convert: ConvertUnitsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EnergyInputFormService, ConvertUnitsService] });
    service = TestBed.inject(EnergyInputFormService);
    convert = TestBed.inject(ConvertUnitsService);
  });

  it('is invalid on an empty loss and defaults heating values in Imperial', () => {
    const form = service.getEnergyInputForm({}, settingsFor('Imperial'));

    expect(form.valid).toBeFalse();
    expect(form.controls.coalHeatingValue.value).toBe(12000);
    expect(form.controls.electrodeHeatingValue.value).toBe(14000);
  });

  it('defaults heating values in kJ/kg for Metric', () => {
    const form = service.getEnergyInputForm({}, settingsFor('Metric'));

    expect(form.controls.coalHeatingValue.value).toBeCloseTo(convert.value(12000).from('btuLb').to('kJkg'), 6);
  });

  it('keeps saved heating values over defaults', () => {
    expect(service.getEnergyInputForm({ ...LOSS, coalHeatingValue: 9000 }, settingsFor('Imperial')).controls.coalHeatingValue.value).toBe(9000);
  });

  it('is valid for a complete loss', () => {
    expect(service.getEnergyInputForm(LOSS, settingsFor('Imperial')).valid).toBeTrue();
  });

  it('rejects negative inputs', () => {
    expect(service.getEnergyInputForm({ ...LOSS, electricityInput: -1 }, settingsFor('Imperial')).controls.electricityInput.errors?.['min']).toBeTruthy();
  });

  it('round-trips a loss through the form', () => {
    expect(service.buildEnergyInput(service.getEnergyInputForm(LOSS, settingsFor('Imperial')))).toEqual(LOSS);
  });

  it('derives natural gas heat input from flow rate', () => {
    expect(service.calculateHeatInputFromFlowRate(1_000_000, settingsFor('Imperial'))).toBe(1020);
  });
});
