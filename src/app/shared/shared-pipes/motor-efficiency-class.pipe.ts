import { Pipe, PipeTransform } from '@angular/core';
import { motorEfficiencyConstants } from '../../psat/psatConstants';

@Pipe({
    name: 'motorEfficiencyClass',
    standalone: false
})
export class MotorEfficiencyClassPipe implements PipeTransform {

  transform(value: number): string {
    let motorConstant: { value: number, display: string } = motorEfficiencyConstants.find(constant => { return constant.value == value });
    if (motorConstant) {
      return motorConstant.display;
    } else {
      return '';
    }
  }

}
