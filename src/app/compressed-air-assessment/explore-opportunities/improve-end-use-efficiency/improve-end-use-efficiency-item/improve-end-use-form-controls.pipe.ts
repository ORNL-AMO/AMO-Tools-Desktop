import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, UntypedFormGroup } from '@angular/forms';

@Pipe({
    name: 'improveEndUseFormControls',
    standalone: false
})
export class ImproveEndUseFormControlsPipe implements PipeTransform {

  transform(form: UntypedFormGroup): Array<{control: AbstractControl, name: string}>{
    let controlNames: Array<{control: AbstractControl, name: string}> = new Array();
    for (let key in form.controls) {
      controlNames.push({ control: form.controls[key], name: key});
    }
    return controlNames;
  }

}
