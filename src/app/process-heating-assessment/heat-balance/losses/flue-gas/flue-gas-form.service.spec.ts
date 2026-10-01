import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FLUE_GAS_COMPONENTS, FlueGasFormService } from './flue-gas-form.service';

const IMPERIAL = { unitsOfMeasure: 'Imperial' } as Settings;
const METRIC = { unitsOfMeasure: 'Metric' } as Settings;

describe('FlueGasFormService', () => {
  let service: FlueGasFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule], providers: [FlueGasFormService, ConvertUnitsService] });
    service = TestBed.inject(FlueGasFormService);
  });

  it('defaults a new form to legacy values in Imperial', () => {
    const v = service.getFlueGasVolumeForm({}, IMPERIAL).getRawValue();

    expect(v.materialId).toBe(1);
    expect(v.flueGasTemperature).toBe(212);
    expect(v.combustionAirTemperature).toBe(65);
    expect(v.oxygenCalculationMethod).toBe('Excess Air');
    expect(v.moistureInAirCombustion).toBe(0.0077);
  });

  it('converts default temperatures to Celsius in Metric', () => {
    const v = service.getFlueGasVolumeForm({}, METRIC).getRawValue();

    expect(v.flueGasTemperature).toBeCloseTo(100, 6);
    expect(v.fuelTemperature).toBeCloseTo(18.3333, 3);
  });

  it('round-trips a saved By Volume loss', () => {
    const loss = service.buildFlueGasLoss(service.getFlueGasVolumeForm({
      name: 'Saved',
      flueGasByVolume: { gasTypeId: 3, flueGasTemperature: 500, oxygenCalculationMethod: 'Oxygen in Flue Gas', o2InFlueGas: 3, excessAirPercentage: 0,
        combustionAirTemperature: 80, fuelTemperature: 70, ambientAirTemp: 60, moistureInAirCombustion: 1, CH4: 90, C2H6: 5, N2: 5, H2: 0, C3H8: 0,
        C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0, SO2: 0, O2: 0, heatingValue: 1000, heatingValueVolume: 900, specificGravity: 0.6 },
    }, IMPERIAL), 'Saved');

    expect(loss.flueGasType).toBe('By Volume');
    expect(loss.name).toBe('Saved');
    expect(loss.flueGasByVolume.gasTypeId).toBe(3);
    expect(loss.flueGasByVolume.flueGasTemperature).toBe(500);
    expect(loss.flueGasByVolume.oxygenCalculationMethod).toBe('Oxygen in Flue Gas');
    expect(loss.flueGasByVolume.CH4).toBe(90);
    expect(loss.flueGasByVolume.specificGravity).toBe(0.6);
  });

  it('requires every gas fraction', () => {
    const form = service.getFlueGasVolumeForm({}, IMPERIAL);

    FLUE_GAS_COMPONENTS.forEach(component => expect(form.controls[component].errors?.['required']).toBeTrue());
  });

  it('bounds flue gas temperature below by combustion air temperature and vice versa', () => {
    const form = service.getFlueGasVolumeForm({}, IMPERIAL);
    form.patchValue({ combustionAirTemperature: 300 });
    service.setTemperatureValidators(form);

    expect(form.controls.flueGasTemperature.errors?.['min']).toBeDefined();

    form.patchValue({ combustionAirTemperature: 100 });
    service.setTemperatureValidators(form);

    expect(form.controls.flueGasTemperature.errors).toBeNull();
    form.patchValue({ flueGasTemperature: 50 });
    service.setTemperatureValidators(form);

    expect(form.controls.combustionAirTemperature.errors?.['max']).toBeDefined();
  });
});
