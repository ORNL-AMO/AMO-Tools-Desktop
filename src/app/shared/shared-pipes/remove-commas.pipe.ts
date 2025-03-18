import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'removeCommas',
    standalone: false
})
export class RemoveCommasPipe implements PipeTransform {

  constructor() { }

  transform(value: number): any {
    if (value != null) {
        return value.toString().replace(/,/g, "");
    }
  }
}
