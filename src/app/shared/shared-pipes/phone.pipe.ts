import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'phone',
    standalone: false
})
export class PhonePipe implements PipeTransform {

  transform(val: any, args?: any): any {
    let phoneNumber: any = "";
    let internationalCode: any = "";
    if (val === undefined || val === null) {
      return;
    }
    val = val.toString().trim();
    val = val.replace(/\D/g, '');
    let length = val.length;
    let tmpVal;
    if (length > 10) {
      internationalCode = val.slice(0, Math.min(length - 10, 3));
      val = val.slice(Math.min(length - 10, 3));
    }
    for (let i = 0; i < length; i++) {
      if (internationalCode === '' || internationalCode === '1') {
        if (i === 0) {
          phoneNumber = phoneNumber + "(" + val.charAt(i);
        }
        else if (i === 3) {
          phoneNumber = phoneNumber + ') ' + val.charAt(i);
        }
        else if (i === 6) {
          phoneNumber = phoneNumber + '-' + val.charAt(i);
        }
        else {
          phoneNumber = phoneNumber + val.charAt(i);
        }
      }
      else {
        if (i % 2 === 0 && i !== 0) {
          phoneNumber = phoneNumber + " " + val.charAt(i);
        }
        else {
          phoneNumber = phoneNumber + val.charAt(i);
        }
      }
    }
    if (internationalCode !== '') {
      internationalCode = "+" + internationalCode + " ";
    }
    phoneNumber = internationalCode + phoneNumber;
    return phoneNumber;
  }
}
