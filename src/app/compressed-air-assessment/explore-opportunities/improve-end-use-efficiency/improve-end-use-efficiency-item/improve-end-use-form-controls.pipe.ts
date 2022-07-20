import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

@Pipe({
  name: 'improveEndUseFormControls'
})
export class ImproveEndUseFormControlsPipe implements PipeTransform {

  // transform(value: unknown, ...args: unknown[]): unknown {
  //   return null;
  // }

  transform(form: FormGroup): Array<{control: AbstractControl, name: string}>{
    let controlNames: Array<{control: AbstractControl, name: string}> = new Array();
    for (let key in form.controls) {
      controlNames.push({ control: form.controls[key], name: key});
    }
    return controlNames;
  }

}
