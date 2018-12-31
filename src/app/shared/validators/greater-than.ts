import { ValidatorFn, AbstractControl } from '@angular/forms';


export class GreaterThanValidator {
    static greaterThan = (val: number): ValidatorFn => {
        return (valueControl: AbstractControl): { [key: string]: boolean } => {
            if (valueControl.value !== '' && valueControl.value !== null) {
                try {
                    if (valueControl.value > val) {
                        return undefined;
                    }
                }
                catch (e) {
                    console.log(e);
                    return {
                        greaterThan: true
                    };
                }
                return {
                    greaterThan: true
                };
            }
            else {
                return undefined;
            }
        }
    }
}
