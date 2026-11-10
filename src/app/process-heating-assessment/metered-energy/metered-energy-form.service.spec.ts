import { TestBed } from '@angular/core/testing';
import { MeteredEnergy } from '../../shared/models/phast/meteredEnergy';
import { EnergySourceSelection } from '../energy-validation/default-energy-sources';
import { calculateMeteredFuelEnergy, MeteredEnergyFormService } from './metered-energy-form.service';

const FUEL_ONLY: EnergySourceSelection = { fuel: true, steam: false, electricity: false };

function savedSteam(): MeteredEnergy {
  return {
    fuel: false, steam: true, electricity: false,
    meteredEnergySteam: { totalHeatSteam: 1000, flowRate: 50, collectionTime: 2, electricityUsed: 0, electricityCollectionTime: 0, operatingHours: 8000 },
  };
}

describe('MeteredEnergyFormService', () => {
  let service: MeteredEnergyFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [MeteredEnergyFormService] });
    service = TestBed.inject(MeteredEnergyFormService);
  });

  describe('getForm', () => {
    it('turns on the default sources when nothing is saved', () => {
      const form = service.getForm(undefined, FUEL_ONLY);

      expect(form.getRawValue()).toEqual(jasmine.objectContaining({ fuel: true, steam: false, electricity: false }));
      expect(form.controls.meteredEnergyFuel.enabled).toBeTrue();
      expect(form.controls.meteredEnergySteam.disabled).toBeTrue();
    });

    it('restores the saved sources and values instead of the defaults', () => {
      const form = service.getForm(savedSteam(), FUEL_ONLY);

      expect(form.controls.steam.value).toBeTrue();
      expect(form.controls.fuel.value).toBeFalse();
      expect(form.controls.meteredEnergySteam.controls.totalHeatSteam.value).toBe(1000);
    });
  });

  describe('validators', () => {
    it('requires a turned-on source\'s inputs', () => {
      const form = service.getForm(undefined, FUEL_ONLY);

      expect(form.valid).toBeFalse();
      expect(form.controls.meteredEnergyFuel.controls.heatingValue.hasError('required')).toBeTrue();
    });

    it('rejects negative values', () => {
      const form = service.getForm(savedSteam(), FUEL_ONLY);
      form.controls.meteredEnergySteam.controls.flowRate.setValue(-1);

      expect(form.controls.meteredEnergySteam.controls.flowRate.hasError('min')).toBeTrue();
    });

    it('drops a source\'s validators when it is turned off and restores them when turned back on', () => {
      const form = service.getForm(savedSteam(), FUEL_ONLY);
      service.setSourceEnabled(form, 'fuel', true);
      expect(form.valid).toBeFalse();

      service.setSourceEnabled(form, 'fuel', false);
      expect(form.valid).toBeTrue();

      service.setSourceEnabled(form, 'fuel', true);
      expect(form.valid).toBeFalse();
    });

    it('won\'t turn off the only source left on', () => {
      const form = service.getForm(undefined, FUEL_ONLY);
      service.setSourceEnabled(form, 'fuel', false);

      expect(form.controls.fuel.value).toBeTrue();
      expect(form.controls.meteredEnergyFuel.enabled).toBeTrue();
      expect(service.lockedSource(form)).toBe('fuel');

      service.setSourceEnabled(form, 'steam', true);
      expect(service.lockedSource(form)).toBeUndefined();
    });

    it('requires the flow rate while fuel energy is calculated, and the fuel energy once user-defined', () => {
      const fuelForm = service.getForm(undefined, FUEL_ONLY).controls.meteredEnergyFuel;
      const { fuelEnergy, fuelFlowRateInput } = fuelForm.controls;

      expect(fuelFlowRateInput.enabled).toBeTrue();
      expect(fuelEnergy.disabled).toBeTrue();

      service.setFuelEnergyUserDefined(fuelForm, true);
      expect(fuelFlowRateInput.disabled).toBeTrue();
      expect(fuelEnergy.hasError('required')).toBeTrue();

      service.setFuelEnergyUserDefined(fuelForm, false);
      expect(fuelFlowRateInput.hasError('required')).toBeTrue();
      expect(fuelEnergy.disabled).toBeTrue();
    });

    it('returns fuel to a calculated energy when fuel is turned off and on again, as legacy clears its inputs', () => {
      const form = service.getForm(undefined, FUEL_ONLY);
      service.setSourceEnabled(form, 'steam', true);
      service.setFuelEnergyUserDefined(form.controls.meteredEnergyFuel, true);

      service.setSourceEnabled(form, 'fuel', false);
      service.setSourceEnabled(form, 'fuel', true);

      expect(form.controls.meteredEnergyFuel.controls.userDefinedMeteredEnergy.value).toBeFalse();
      expect(form.controls.meteredEnergyFuel.controls.fuelFlowRateInput.enabled).toBeTrue();
      expect(form.controls.meteredEnergyFuel.controls.fuelEnergy.disabled).toBeTrue();
    });
  });

  describe('isValid', () => {
    it('treats an assessment with no metered energy as valid', () => {
      expect(service.isValid(undefined, FUEL_ONLY)).toBeTrue();
    });

    it('checks the saved inputs of the turned-on sources', () => {
      const saved = savedSteam();
      expect(service.isValid(saved, FUEL_ONLY)).toBeTrue();

      saved.meteredEnergySteam.collectionTime = undefined;
      expect(service.isValid(saved, FUEL_ONLY)).toBeFalse();
    });
  });

  describe('toMeteredEnergy', () => {
    it('derives fuel energy from flow rate, heating value and collection time', () => {
      const form = service.getForm(undefined, FUEL_ONLY);
      form.controls.meteredEnergyFuel.patchValue({ fuelFlowRateInput: 1000, heatingValue: 1020, collectionTime: 2 });

      expect(service.toMeteredEnergy(form).meteredEnergyFuel.fuelEnergy).toBe(2.04);
    });

    it('keeps a user-defined fuel energy as entered', () => {
      const form = service.getForm(undefined, FUEL_ONLY);
      service.setFuelEnergyUserDefined(form.controls.meteredEnergyFuel, true);
      form.controls.meteredEnergyFuel.patchValue({ fuelFlowRateInput: 1000, heatingValue: 1020, collectionTime: 2, fuelEnergy: 7 });

      expect(service.toMeteredEnergy(form).meteredEnergyFuel.fuelEnergy).toBe(7);
    });

    it('saves a turned-off source as legacy\'s zeroed inputs', () => {
      const metered = service.toMeteredEnergy(service.getForm(savedSteam(), FUEL_ONLY));

      expect(metered.meteredEnergyElectricity).toEqual({ electricityCollectionTime: 0, electricityUsed: 0, auxElectricityUsed: 0, auxElectricityCollectionTime: 0, operatingHours: 0 });
      expect(metered.meteredEnergyFuel.heatingValue).toBe(0);
    });

    it('saves blank inputs as undefined so results show dashes', () => {
      const metered = service.toMeteredEnergy(service.getForm(undefined, FUEL_ONLY));

      expect(metered.meteredEnergyFuel.heatingValue).toBeUndefined();
      expect(metered.meteredEnergyFuel.fuelEnergy).toBeUndefined();
    });

    it('round-trips saved values and the operating hours calculation', () => {
      const saved = savedSteam();
      saved.meteredEnergySteam.operatingHoursCalc = { hoursPerYear: 8000 } as never;

      expect(service.toMeteredEnergy(service.getForm(saved, FUEL_ONLY)).meteredEnergySteam).toEqual(saved.meteredEnergySteam);
    });
  });

  describe('calculateMeteredFuelEnergy', () => {
    it('returns null while any input is blank', () => {
      expect(calculateMeteredFuelEnergy(1000, null, 2)).toBeNull();
    });
  });
});
