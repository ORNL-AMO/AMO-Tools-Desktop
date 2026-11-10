import { TestBed } from '@angular/core/testing';
import { DesignedEnergy } from '../../shared/models/phast/designedEnergy';
import { EnergySourceSelection } from '../energy-validation/default-energy-sources';
import { DesignedEnergyFormService } from './designed-energy-form.service';

const ELECTRICITY_ONLY: EnergySourceSelection = { fuel: false, steam: false, electricity: true };
const EMPTY_FUEL = { fuelType: 0, percentCapacityUsed: 0, totalBurnerCapacity: 0, operatingHours: 0 };
const EMPTY_STEAM = { totalHeat: 0, steamFlow: 0, percentCapacityUsed: 0, operatingHours: 0 };

function savedFuel(): DesignedEnergy {
  return {
    fuel: true, steam: false, electricity: false,
    zones: [
      { name: 'Preheat', designedEnergyFuel: { fuelType: 0, totalBurnerCapacity: 10, percentCapacityUsed: 80, operatingHours: 8000 }, designedEnergySteam: EMPTY_STEAM, designedEnergyElectricity: { kwRating: 0, percentCapacityUsed: 0, operatingHours: 0 } },
      { name: 'Soak', designedEnergyFuel: { fuelType: 0, totalBurnerCapacity: 5, percentCapacityUsed: 50, operatingHours: 8000 }, designedEnergySteam: EMPTY_STEAM, designedEnergyElectricity: { kwRating: 0, percentCapacityUsed: 0, operatingHours: 0 } },
    ],
  };
}

describe('DesignedEnergyFormService', () => {
  let service: DesignedEnergyFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [DesignedEnergyFormService] });
    service = TestBed.inject(DesignedEnergyFormService);
  });

  describe('getForm', () => {
    it('starts with one zone and the default sources when nothing is saved', () => {
      const form = service.getForm(undefined, ELECTRICITY_ONLY);

      expect(form.controls.electricity.value).toBeTrue();
      expect(form.controls.zones.length).toBe(1);
      expect(form.controls.zones.at(0).controls.name.value).toBe('Zone #1');
      expect(form.controls.zones.at(0).controls.designedEnergyFuel.disabled).toBeTrue();
    });

    it('restores the saved sources and zones instead of the defaults', () => {
      const form = service.getForm(savedFuel(), ELECTRICITY_ONLY);

      expect(form.controls.fuel.value).toBeTrue();
      expect(form.controls.electricity.value).toBeFalse();
      expect(form.controls.zones.controls.map(zone => zone.controls.name.value)).toEqual(['Preheat', 'Soak']);
      expect(form.controls.zones.at(1).controls.designedEnergyFuel.controls.totalBurnerCapacity.value).toBe(5);
    });
  });

  describe('validators', () => {
    it('requires a turned-on source\'s inputs in every zone and rejects negatives', () => {
      const form = service.getForm(savedFuel(), ELECTRICITY_ONLY);
      expect(form.valid).toBeTrue();

      form.controls.zones.at(1).controls.designedEnergyFuel.controls.percentCapacityUsed.setValue(-1);
      expect(form.controls.zones.at(1).controls.designedEnergyFuel.controls.percentCapacityUsed.hasError('min')).toBeTrue();

      form.controls.zones.at(1).controls.designedEnergyFuel.controls.percentCapacityUsed.setValue(null);
      expect(form.valid).toBeFalse();
    });

    it('drops a source\'s validators in every zone when turned off and restores them when turned back on', () => {
      const form = service.getForm(savedFuel(), ELECTRICITY_ONLY);
      service.setSourceEnabled(form, 'electricity', true);
      expect(form.valid).toBeFalse();

      service.setSourceEnabled(form, 'electricity', false);
      expect(form.valid).toBeTrue();

      service.setSourceEnabled(form, 'electricity', true);
      expect(form.controls.zones.controls.every(zone => zone.controls.designedEnergyElectricity.controls.kwRating.hasError('required'))).toBeTrue();
    });

    it('won\'t turn off the only source left on', () => {
      const form = service.getForm(undefined, ELECTRICITY_ONLY);
      service.setSourceEnabled(form, 'electricity', false);

      expect(form.controls.electricity.value).toBeTrue();
      expect(service.lockedSource(form)).toBe('electricity');
    });
  });

  describe('zones', () => {
    it('adds a zone named after its position, with the current sources turned on', () => {
      const form = service.getForm(savedFuel(), ELECTRICITY_ONLY);
      service.addZone(form);

      const added = form.controls.zones.at(2);
      expect(added.controls.name.value).toBe('Zone #3');
      expect(added.controls.designedEnergyFuel.enabled).toBeTrue();
      expect(added.controls.designedEnergyElectricity.disabled).toBeTrue();
    });

    it('removes the zone at the given index', () => {
      const form = service.getForm(savedFuel(), ELECTRICITY_ONLY);
      service.removeZone(form, 0);

      expect(form.controls.zones.controls.map(zone => zone.controls.name.value)).toEqual(['Soak']);
    });
  });

  describe('isValid', () => {
    it('treats an assessment with no designed energy as valid', () => {
      expect(service.isValid(undefined, ELECTRICITY_ONLY)).toBeTrue();
    });

    it('checks every saved zone of the turned-on sources', () => {
      const saved = savedFuel();
      saved.zones[1].designedEnergyFuel.operatingHours = undefined;

      expect(service.isValid(saved, ELECTRICITY_ONLY)).toBeFalse();
    });
  });

  describe('toDesignedEnergy', () => {
    it('round-trips saved zones and their operating hours calculations', () => {
      const saved = savedFuel();
      saved.zones.forEach(zone => zone.designedEnergyFuel.operatingHoursCalc = { hoursPerYear: 8000 } as never);

      expect(service.toDesignedEnergy(service.getForm(saved, ELECTRICITY_ONLY))).toEqual(saved);
    });

    it('zeroes a turned-off source in every zone, since the designed total adds all sources', () => {
      const form = service.getForm(savedFuel(), ELECTRICITY_ONLY);
      service.setSourceEnabled(form, 'steam', true);
      service.setSourceEnabled(form, 'fuel', false);

      const designed = service.toDesignedEnergy(form);
      expect(designed.fuel).toBeFalse();
      expect(designed.zones.map(zone => zone.designedEnergyFuel)).toEqual([EMPTY_FUEL, EMPTY_FUEL]);
    });

    it('saves blank inputs of a turned-on source as undefined so results show dashes', () => {
      const designed = service.toDesignedEnergy(service.getForm(undefined, ELECTRICITY_ONLY));

      expect(designed.zones[0].designedEnergyElectricity.kwRating).toBeUndefined();
      expect(designed.zones[0].designedEnergyFuel).toEqual(EMPTY_FUEL);
    });
  });
});
