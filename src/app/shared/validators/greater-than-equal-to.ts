import { ValidatorFn, AbstractControl } from '@angular/forms';


export class GreaterThanOrEqualToValidator {
    static greaterThanOrEqualTo = (val: number): ValidatorFn => {
        return (valueControl: AbstractControl): { [key: string]: number } | undefined => {
            if (valueControl.value !== '' && valueControl.value !== null) {
                try {
                    if (Number(valueControl.value) >= val) {
                        return undefined;
                    }
                } catch (e) {
                    console.log(e);
                    return {
                        greaterThanOrEqualTo: val
                    };
                }
                return {
                    greaterThanOrEqualTo: val
                };
            } else {
                return undefined;
            }
        };
    }
}
