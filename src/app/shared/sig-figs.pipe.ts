import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sigFigs'
})
export class SigFigsPipe implements PipeTransform {

  transform(value: number, sigFigs: number, scientificNotation?: boolean): any {
    if (isNaN(value) == false) {
      //string value of number in scientific notation
      let newValString = value.toPrecision(sigFigs);
      //converted to number to get trailing/leading zeros
      let newValNumber = parseFloat(newValString);
      //convert back to string
      let numWithZerosAndCommas = newValNumber.toLocaleString();
      if (scientificNotation) {
        return newValString;
      } else {
        return numWithZerosAndCommas;
      }
    } else {
      return value;
    }
  }

}
