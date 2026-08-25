import { ValidatorFn, AbstractControl } from '@angular/forms';
import { PhonePipe } from '../shared-pipes/phone.pipe';

const phonePipe = new PhonePipe();
// (xxx) xxx-xxxx — the shape PhonePipe only produces for a complete 10-digit domestic number
const DOMESTIC_PATTERN = /^\(\d{3}\) \d{3}-\d{4}$/;
// "+" + 1-3 digit country code + space — what PhonePipe prefixes anything longer than 10 digits with
const INTERNATIONAL_PREFIX_PATTERN = /^\+\d{1,3} /;
const MAX_PHONE_DIGITS = 15; 
export class PhoneNumberValidator {
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const digitCount = value.toString().replace(/\D/g, '').length;
      if (digitCount > MAX_PHONE_DIGITS) {
        return { invalidPhoneNumber: true };
      }
      const formatted: string = phonePipe.transform(value);
      const isValid = DOMESTIC_PATTERN.test(formatted) || INTERNATIONAL_PREFIX_PATTERN.test(formatted);
      return isValid ? null : { invalidPhoneNumber: true };
    };
  }
}
