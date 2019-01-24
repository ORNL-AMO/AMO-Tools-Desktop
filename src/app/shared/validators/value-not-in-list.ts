import { FormControl, ValidatorFn, AbstractControl } from '@angular/forms';

export class ValueNotInListValidator {
    static valueNotInList = (list: Array<any>): ValidatorFn => {
        return (valueControl: AbstractControl): { [key: string]: boolean } => {
            if (valueControl.value !== '' && valueControl.value !== null) {
                try {
                    let isValidValue: boolean = true;
                    for (let i = 0; i < list.length; i++) {
                        if (valueControl.value === list[i]) {
                            isValidValue = false;
                            break;
                        }
                    }

                    if (isValidValue) {
                        return undefined;
                    }
                }
                catch (e) {
                    console.log(e);
                    return {
                        valueNotInList: true
                    };
                }

                return {
                    valueNotInList: true
                };
            }
            else {
                return undefined;
            }
        };
    }
}