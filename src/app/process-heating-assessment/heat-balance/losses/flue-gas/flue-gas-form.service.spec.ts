import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { FLUE_GAS_COMPONENTS, FLUE_GAS_FUEL_ANALYSIS, FlueGasFormService, FlueGasType, isFlueGasMassForm, OxygenCalculationMethod } from './flue-gas-form.service';

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
    expect(v.oxygenCalculationMethod).toBe(OxygenCalculationMethod.ExcessAir);
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
      flueGasByVolume: { gasTypeId: 3, flueGasTemperature: 500, oxygenCalculationMethod: OxygenCalculationMethod.OxygenInFlueGas, o2InFlueGas: 3, excessAirPercentage: 0,
        combustionAirTemperature: 80, fuelTemperature: 70, ambientAirTemp: 60, moistureInAirCombustion: 1, CH4: 90, C2H6: 5, N2: 5, H2: 0, C3H8: 0,
        C4H10_CnH2n: 0, H2O: 0, CO: 0, CO2: 0, SO2: 0, O2: 0, heatingValue: 1000, heatingValueVolume: 900, specificGravity: 0.6 },
    }, IMPERIAL), 'Saved');

    expect(loss.flueGasType).toBe(FlueGasType.ByVolume);
    expect(loss.name).toBe('Saved');
    expect(loss.flueGasByVolume.gasTypeId).toBe(3);
    expect(loss.flueGasByVolume.flueGasTemperature).toBe(500);
    expect(loss.flueGasByVolume.oxygenCalculationMethod).toBe(OxygenCalculationMethod.OxygenInFlueGas);
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

  describe('By Mass', () => {
    it('defaults a new form to legacy values', () => {
      const v = service.getFlueGasMassForm({}, IMPERIAL).getRawValue();

      expect(v.flueGasTemperature).toBe(212);
      expect(v.ashDischargeTemperature).toBe(0);
      expect(v.unburnedCarbonInAsh).toBe(0);
      expect(v.oxygenCalculationMethod).toBe(OxygenCalculationMethod.ExcessAir);
    });

    it('round-trips a saved By Mass loss', () => {
      const loss = service.buildFlueGasMassLoss(service.getFlueGasMassForm({
        flueGasByMass: { gasTypeId: 2, flueGasTemperature: 600, oxygenCalculationMethod: OxygenCalculationMethod.OxygenInFlueGas, o2InFlueGas: 4, excessAirPercentage: 25,
          combustionAirTemperature: 80, fuelTemperature: 70, ambientAirTemp: 60, moistureInAirCombustion: 1, ashDischargeTemperature: 300,
          unburnedCarbonInAsh: 2, carbon: 70, hydrogen: 5, sulphur: 1, inertAsh: 10, o2: 8, moisture: 4, nitrogen: 2, heatingValue: 12000 },
      }, IMPERIAL), 'Coal');

      expect(loss.flueGasType).toBe(FlueGasType.ByMass);
      expect(loss.name).toBe('Coal');
      expect(loss.flueGasByMass).toEqual(jasmine.objectContaining({ gasTypeId: 2, carbon: 70, unburnedCarbonInAsh: 2, ashDischargeTemperature: 300, heatingValue: 12000 }));
    });

    it('requires every fuel analysis field and limits unburned carbon to 0..100', () => {
      const form = service.getFlueGasMassForm({}, IMPERIAL);
      FLUE_GAS_FUEL_ANALYSIS.forEach(({ key }) => expect(form.controls[key].errors?.['required']).toBeTrue());

      form.patchValue({ unburnedCarbonInAsh: 101 });
      expect(form.controls.unburnedCarbonInAsh.errors?.['max']).toBeDefined();
    });

    it('identifies the form type and builds the matching loss', () => {
      const mass = service.getFlueGasMassForm({}, IMPERIAL);
      const volume = service.getFlueGasVolumeForm({}, IMPERIAL);

      expect(isFlueGasMassForm(mass)).toBeTrue();
      expect(isFlueGasMassForm(volume)).toBeFalse();
      expect(service.buildLoss(mass).flueGasType).toBe(FlueGasType.ByMass);
      expect(service.buildLoss(volume).flueGasType).toBe(FlueGasType.ByVolume);
    });
  });
});
