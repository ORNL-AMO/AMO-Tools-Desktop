import { ValidatorFn, AbstractControl } from '@angular/forms';


export class EqualToValidator {
    static equalTo = (val: number): ValidatorFn => {
        return (valueControl: AbstractControl): { [key: string]: number } => {
            if (valueControl.value !== '' && valueControl.value !== null) {
                try {
                    if (valueControl.value === val) {
                        return undefined;
                    }
                }
                catch (e) {
                    console.log(e);
                    return {
                        equalTo: val
                    };
                }
                return {
                    equalTo: val
                };
            }
            else {
                return undefined;
            }
        };
    }
}
