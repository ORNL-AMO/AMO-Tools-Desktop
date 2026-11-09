import { MotorItem } from '../../motor-inventory';
import { getMotorSupplyType, getNonThreePhaseMotors, setMotorSupplyType } from './motor-supply';

function motorWith(numberOfPhases: number | null | undefined, currentType: string | null | undefined): MotorItem {
  return {
    nameplateData: { numberOfPhases: numberOfPhases },
    manualSpecificationData: { currentType: currentType }
  } as MotorItem;
}

describe('motor supply type', () => {
  it('treats blank phases and current type as three-phase', () => {
    expect(getMotorSupplyType(motorWith(undefined, undefined))).toBe('threePhase');
    expect(getMotorSupplyType(motorWith(null, null))).toBe('threePhase');
  });

  it('reads 3 phase AC as three-phase and 1 phase AC as single-phase', () => {
    expect(getMotorSupplyType(motorWith(3, 'AC'))).toBe('threePhase');
    expect(getMotorSupplyType(motorWith(1, 'AC'))).toBe('singlePhase');
    expect(getMotorSupplyType(motorWith(1, undefined))).toBe('singlePhase');
  });

  it('reads DC from current type whatever the number of phases is', () => {
    expect(getMotorSupplyType(motorWith(3, 'DC'))).toBe('dc');
    expect(getMotorSupplyType(motorWith(1, 'DC'))).toBe('dc');
  });

  it('saves the choice into the existing fields and reads it back', () => {
    let motor: MotorItem = motorWith(undefined, undefined);
    setMotorSupplyType(motor, 'singlePhase');
    expect(motor.nameplateData.numberOfPhases).toBe(1);
    expect(motor.manualSpecificationData.currentType).toBe('AC');
    expect(getMotorSupplyType(motor)).toBe('singlePhase');

    setMotorSupplyType(motor, 'dc');
    expect(getMotorSupplyType(motor)).toBe('dc');

    setMotorSupplyType(motor, 'threePhase');
    expect(motor.nameplateData.numberOfPhases).toBe(3);
    expect(motor.manualSpecificationData.currentType).toBe('AC');
    expect(getMotorSupplyType(motor)).toBe('threePhase');
  });

  it('lists single-phase and DC motors as not connectable', () => {
    let threePhase: MotorItem = { ...motorWith(3, 'AC'), id: 'a' } as MotorItem;
    let singlePhase: MotorItem = { ...motorWith(1, 'AC'), id: 'b' } as MotorItem;
    let dc: MotorItem = { ...motorWith(3, 'DC'), id: 'c' } as MotorItem;
    expect(getNonThreePhaseMotors([threePhase, singlePhase, dc])).toEqual([
      { id: 'b', reason: 'cannot connect to single-phase motors' },
      { id: 'c', reason: 'cannot connect to DC motors' }
    ]);
  });
});
