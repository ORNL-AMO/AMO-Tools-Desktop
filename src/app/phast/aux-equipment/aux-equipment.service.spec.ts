import { AuxEquipmentService } from './aux-equipment.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { AuxEquipment } from '../../shared/models/phast/auxEquipment';

describe('AuxEquipmentService (direct instantiation — no TestBed)', () => {
  let service: AuxEquipmentService;

  beforeEach(() => {
    service = new AuxEquipmentService(new ConvertUnitsService());
  });

  describe('calcTotalPower', () => {
    it('calculates power for Calculated motor type', () => {
      const equipment: AuxEquipment = {
        name: 'Test Fan',
        motorPower: 'Calculated',
        motorPhase: '3',
        supplyVoltage: 480,
        averageCurrent: 10,
        powerFactor: 0.9,
        dutyCycle: 80,
        totalConnectedPower: 0,
        ratedCapacity: 0,
      };
      // sqrt(3) * 480 * 10 * 0.9 * 0.8 / 1000 ≈ 5.986 kW
      expect(service.calcTotalPower(equipment)).toBeCloseTo(5.986, 2);
    });

    it('calculates power for Rated motor type', () => {
      const equipment: AuxEquipment = {
        name: 'Test Motor',
        motorPower: 'Rated',
        motorPhase: '1',
        supplyVoltage: 0,
        averageCurrent: 0,
        powerFactor: 0,
        dutyCycle: 80,
        totalConnectedPower: 10,
        ratedCapacity: 75,
      };
      // 10 * (75/100) * (80/100) = 6.0 hp
      expect(service.calcTotalPower(equipment)).toBeCloseTo(6.0, 6);
    });

    it('returns 0 when dutyCycle is 0', () => {
      const equipment: AuxEquipment = {
        name: 'Idle Motor',
        motorPower: 'Calculated',
        motorPhase: '3',
        supplyVoltage: 480,
        averageCurrent: 10,
        powerFactor: 0.9,
        dutyCycle: 0,
        totalConnectedPower: 0,
        ratedCapacity: 0,
      };
      expect(service.calcTotalPower(equipment)).toBe(0);
    });
  });

  describe('getResultsSum', () => {
    it('sums Calculated results directly in kW', () => {
      const results = [
        { name: 'A', totalPower: 3.0, motorPower: 'Calculated' },
        { name: 'B', totalPower: 2.5, motorPower: 'Calculated' },
      ];
      expect(service.getResultsSum(results)).toBeCloseTo(5.5, 6);
    });

    it('converts Rated results from hp to kW', () => {
      const results = [{ name: 'A', totalPower: 1, motorPower: 'Rated' }];
      // 1 hp ≈ 0.7457 kW
      expect(service.getResultsSum(results)).toBeCloseTo(0.7457, 3);
    });

    it('skips Rated results with totalPower of 0', () => {
      const results = [
        { name: 'A', totalPower: 0, motorPower: 'Rated' },
        { name: 'B', totalPower: 5.0, motorPower: 'Calculated' },
      ];
      expect(service.getResultsSum(results)).toBeCloseTo(5.0, 6);
    });

    it('mixes Calculated and Rated correctly', () => {
      const results = [
        { name: 'A', totalPower: 2.0, motorPower: 'Calculated' },
        { name: 'B', totalPower: 1, motorPower: 'Rated' },
      ];
      // 2.0 + 0.7457 ≈ 2.7457 kW
      expect(service.getResultsSum(results)).toBeCloseTo(2.7457, 3);
    });
  });
});
