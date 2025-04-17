import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'optionDisplayValue',
    pure: true,
    standalone: false
})
export class OptionDisplayValuePipe implements PipeTransform {

  transform(formValue: number, optionList: any[], matchProperty: string, displayKey: string) : string {
    const selectedOption = optionList.find(option => {return option[matchProperty] === formValue});
    if (selectedOption) {
      return selectedOption[displayKey]
    }
  }
}
