import { MotorItem } from '../../motor-inventory';

export type MotorSupplyType = 'threePhase' | 'singlePhase' | 'dc';

export const motorSupplyOptions: Array<{ value: MotorSupplyType, display: string }> = [
  { value: 'threePhase', display: 'AC Three-Phase' },
  { value: 'singlePhase', display: 'AC Single-Phase' },
  { value: 'dc', display: 'DC' }
];

//existing motors have blank or 3 phase / AC, so anything not set is treated as three-phase
export function getMotorSupplyType(motorItem: MotorItem): MotorSupplyType {
  if (motorItem?.manualSpecificationData?.currentType == 'DC') {
    return 'dc';
  } else if (motorItem?.nameplateData?.numberOfPhases == 1) {
    return 'singlePhase';
  }
  return 'threePhase';
}

//stored in the existing numberOfPhases and currentType fields, no new saved data
export function setMotorSupplyType(motorItem: MotorItem, supplyType: MotorSupplyType): MotorItem {
  if (supplyType == 'dc') {
    motorItem.manualSpecificationData.currentType = 'DC';
  } else {
    motorItem.manualSpecificationData.currentType = 'AC';
    motorItem.nameplateData.numberOfPhases = supplyType == 'singlePhase' ? 1 : 3;
  }
  return motorItem;
}

//connected assessments assume a three-phase AC motor
export function getNonThreePhaseMotors(catalog: Array<MotorItem>): Array<{ id: string, reason: string }> {
  return catalog.filter(motorItem => getMotorSupplyType(motorItem) != 'threePhase').map(motorItem => {
    let supply: string = getMotorSupplyType(motorItem) == 'dc' ? 'DC' : 'single-phase';
    return { id: motorItem.id, reason: `cannot connect to ${supply} motors` };
  });
}
