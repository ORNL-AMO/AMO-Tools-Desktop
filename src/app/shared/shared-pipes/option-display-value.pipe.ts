import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'optionDisplayValue',
  pure: true
})
export class OptionDisplayValuePipe implements PipeTransform {

  transform(formValue: number, optionList: string[], matchProperty: string, displayKey: string) : string {
    return optionList.filter(option => option[matchProperty] === formValue)[0][displayKey];
  }

}
