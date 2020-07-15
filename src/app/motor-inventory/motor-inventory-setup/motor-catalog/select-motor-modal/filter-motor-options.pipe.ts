import { Pipe, PipeTransform } from '@angular/core';
import { SuiteDbMotor } from '../../../../shared/models/materials';
import * as _ from 'lodash';
@Pipe({
  name: 'filterMotorOptions',
  pure: false
})
export class FilterMotorOptionsPipe implements PipeTransform {

  transform(motorOptions: Array<SuiteDbMotor>, filterMotorOptions: FilterMotorOptions): Array<SuiteDbMotor> {
    let motorOptionsCopy: Array<SuiteDbMotor> = JSON.parse(JSON.stringify(motorOptions));
    if (filterMotorOptions) {
      // enclosureTypes: Array<string>;
      if (filterMotorOptions.enclosureTypes.length != 0) {
        motorOptionsCopy = _.filter(motorOptionsCopy, (motorOption) => {
          return _.has(filterMotorOptions.enclosureTypes, motorOption.enclosureType);
        })
      }
      // efficiencyClass: Array<number>;
      if (filterMotorOptions.efficiencyClass.length != 0) {
        motorOptionsCopy = _.filter(motorOptionsCopy, (motorOption) => {
          return _.has(filterMotorOptions.efficiencyClass, motorOption.efficiencyClass);
        })
      }
      // lineFrequencies: Array<number>;
      if (filterMotorOptions.lineFrequencies.length != 0) {
        motorOptionsCopy = _.filter(motorOptionsCopy, (motorOption) => {
          return _.has(filterMotorOptions.lineFrequencies, motorOption.lineFrequency);
        })
      }
      // poles: Array<number>;
      if (filterMotorOptions.poles.length != 0) {
        motorOptionsCopy = _.filter(motorOptionsCopy, (motorOption) => {
          return _.has(filterMotorOptions.poles, motorOption.poles);
        })
      }
      //min/max ranges
      motorOptionsCopy = _.filter(motorOptionsCopy, (motorOption) => {
        return this.checkInRange(motorOption, filterMotorOptions);
      })
    }
    return motorOptionsCopy;
  }

  checkInRange(motorOption: SuiteDbMotor, filterMotorOptions: FilterMotorOptions): boolean {
    let isInRange: boolean = true;
    // efficiencyMin: number;
    // efficiencyMax: number;
    if (motorOption.nominalEfficiency < filterMotorOptions.efficiencyMin || motorOption.nominalEfficiency > filterMotorOptions.efficiencyMax) {
      isInRange = false;
    };
    // voltageLimitMin: number;
    // voltageLimitMax: number;
    if (motorOption.voltageLimit < filterMotorOptions.voltageLimitMin || motorOption.voltageLimit > filterMotorOptions.voltageLimitMax) {
      isInRange = false;
    };
    // syncSpeedMin: number;
    // syncSpeedMax: number;
    if (motorOption.synchronousSpeed < filterMotorOptions.syncSpeedMin || motorOption.synchronousSpeed > filterMotorOptions.syncSpeedMax) {
      isInRange = false;
    };
    // motorPowerMin: number;
    // motorPowerMax: number;
    if (motorOption.hp < filterMotorOptions.motorPowerMin || motorOption.hp > filterMotorOptions.motorPowerMax) {
      isInRange = false;
    };
    return isInRange;
  }

}


export interface FilterMotorOptions {
  enclosureTypes: Array<string>;
  efficiencyClass: Array<number>;
  lineFrequencies: Array<number>;
  efficiencyMin: number;
  efficiencyMax: number;
  poles: Array<number>;
  voltageLimitMin: number;
  voltageLimitMax: number;
  syncSpeedMin: number;
  syncSpeedMax: number;
  motorPowerMin: number;
  motorPowerMax: number;
}