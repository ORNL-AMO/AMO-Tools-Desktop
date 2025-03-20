import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'currencyThousands',
    standalone: false
})
export class CurrencyThousandsPipe implements PipeTransform {

  transform(input: number, decimals: number = 0): any {
    if (Number.isNaN(input)) {
      return null;
    }
    if (input < 1000) {
      return '$' + input.toFixed();
    }
    return '$' + (input / 1000).toFixed(decimals) + 'k';
  }
}
