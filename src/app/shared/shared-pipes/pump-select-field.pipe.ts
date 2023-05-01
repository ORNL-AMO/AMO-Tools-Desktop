import { Pipe, PipeTransform } from '@angular/core';
import { fluidTypes, motorEfficiencyConstants, priorityTypes, pumpTypesConstant, statusTypes } from '../../psat/psatConstants';
import { pumpInventoryDriveConstants, pumpInventoryShaftOrientations, pumpInventoryShaftSealTypes } from '../../pump-inventory/pump-inventory.service';


@Pipe({
  name: 'pumpSelectField'
})
export class PumpSelectFieldPipe implements PipeTransform {

  transform(value: number, fieldName: string): string {
    let motorConstant: { value: number, display: string };
    if (fieldName === 'motorEfficiencyClass') {
      motorConstant = motorEfficiencyConstants.find(constant => { return constant.value == value });
    } else if (fieldName === 'driveType') {
      motorConstant = pumpInventoryDriveConstants.find(constant => { return constant.value == value });

    } else if (fieldName === 'pumpType') {
      motorConstant = pumpTypesConstant.find(constant => { return constant.value == value });

    } else if (fieldName === 'shaftOrientation') {
      motorConstant = pumpInventoryShaftOrientations.find(constant => { return constant.value == value });

    } else if (fieldName === 'shaftSealType') {
      motorConstant = pumpInventoryShaftSealTypes.find(constant => { return constant.value == value });

    } else if (fieldName === 'statusType') {
      motorConstant = statusTypes.find(constant => { return constant.value == value });

    } else if (fieldName === 'priorityType') {
      motorConstant = priorityTypes.find(constant => { return constant.value == value });
    }

    if (motorConstant) {
      return motorConstant.display;
    } else {
      return '';
    }
  }

}
