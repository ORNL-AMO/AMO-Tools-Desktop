import { Pipe, PipeTransform } from '@angular/core';
import { SuiteDbMotor } from '../../../../shared/models/materials';
import * as _ from 'lodash';
@Pipe({
    name: 'filterMotorOptions',
    pure: true,
    standalone: false
})
export class FilterMotorOptionsPipe implements PipeTransform {

  transform(motorOptions: Array<SuiteDbMotor>, filterMotorOptions: FilterMotorOptions): Array<SuiteDbMotor> {
    let motorOptionsCopy: Array<SuiteDbMotor> = JSON.parse(JSON.stringify(motorOptions));
    if (filterMotorOptions) {
      motorOptionsCopy = _.filter(motorOptionsCopy, (motorOption) => {
        return this.checkFilterMotorOption(motorOption, filterMotorOptions);
      })
    }
    return motorOptionsCopy;
  }

  checkFilterMotorOption(motorOption: SuiteDbMotor, filterMotorOptions: FilterMotorOptions): boolean {
    let isInRange: boolean = true;
    // enclosureTypes
    if (filterMotorOptions.enclosureType != undefined && filterMotorOptions.enclosureType != motorOption.enclosureType) {
      isInRange = false;
    }
    // efficiencyClass
    if (filterMotorOptions.efficiencyClass != undefined && filterMotorOptions.efficiencyClass != motorOption.efficiencyClass) {
      isInRange = false;
    }
    // lineFrequencies
    if (filterMotorOptions.lineFrequency != undefined && filterMotorOptions.lineFrequency != motorOption.lineFrequency) {
      isInRange = false;
    }
    // poles
    if (filterMotorOptions.poles != undefined && filterMotorOptions.poles != motorOption.poles) {
      isInRange = false;
    }
    // efficiency
    if (motorOption.nominalEfficiency < filterMotorOptions.efficiencyMin || motorOption.nominalEfficiency > filterMotorOptions.efficiencyMax) {
      isInRange = false;
    };
    // voltageLimit
    if (motorOption.voltageLimit < filterMotorOptions.voltageLimitMin || motorOption.voltageLimit > filterMotorOptions.voltageLimitMax) {
      isInRange = false;
    };
    // syncSpeed
    if (motorOption.synchronousSpeed < filterMotorOptions.syncSpeedMin || motorOption.synchronousSpeed > filterMotorOptions.syncSpeedMax) {
      isInRange = false;
    };
    // motorPower
    if (motorOption.hp < filterMotorOptions.motorPowerMin || motorOption.hp > filterMotorOptions.motorPowerMax) {
      isInRange = false;
    };
    return isInRange;
  }

}

export interface FilterMotorOptions {
  enclosureType: string;
  efficiencyClass: number;
  lineFrequency: number;
  efficiencyMin: number;
  efficiencyMax: number;
  poles: number;
  voltageLimitMin: number;
  voltageLimitMax: number;
  syncSpeedMin: number;
  syncSpeedMax: number;
  motorPowerMin: number;
  motorPowerMax: number;
}