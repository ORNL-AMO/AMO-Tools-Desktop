import { ValidatorFn, AbstractControl, Validators } from '@angular/forms';


export class WholeNumberValidator {
  static wholeNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === '') {
        return null;
      }
      if (!Number.isInteger(Number(value))) {
        return { notWholeNumber: true };
      }
      return null;
    };
  }
}
