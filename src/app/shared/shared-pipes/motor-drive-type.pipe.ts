import { Pipe, PipeTransform } from '@angular/core';
import { driveConstants } from '../../psat/psatConstants';

@Pipe({
    name: 'motorDriveType',
    standalone: false
})
export class MotorDriveTypePipe implements PipeTransform {

  transform(value: number): string {
    let motorConstant: { value: number, display: string } = driveConstants.find(constant => { return constant.value == value });
    if (motorConstant) {
      return motorConstant.display;
    } else {
      return '';
    }
  }

}
