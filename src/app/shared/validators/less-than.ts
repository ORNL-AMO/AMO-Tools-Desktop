import { ValidatorFn, AbstractControl } from '@angular/forms';


//use this custom validator to check that form input value is less than supplied value
export class LessThanValidator {
    static lessThan = (val: number): ValidatorFn => {
        return (valueControl: AbstractControl): { [key: string]: boolean } => {
            if (valueControl.value !== '' && valueControl.value !== null) {
                try {
                    if (valueControl.value < val) {
                        return undefined;
                    }
                }
                catch (e) {
                    console.log(e);
                    return {
                        lessThan: true
                    };
                }
                return {
                    lessThan: true
                };
            }
            else {
                return undefined;
            }
        }
    }
}

