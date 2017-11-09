import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sigFigs'
})
export class SigFigsPipe implements PipeTransform {

  transform(value: number, sigFigs: number, scientificNotation?: boolean): any {
    //string value of number in scientific notation
    let newValString = value.toPrecision(sigFigs);
    //converted to number to get trailing/leading zeros
    let newValNumber = parseFloat(newValString);
    //convert back to string
    let str = newValNumber.toString();
    //use string to add commas
    let numWithZerosAndCommas = str.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

    if(scientificNotation){
      return newValString;
    }else{
      return numWithZerosAndCommas;
    }
  }

}
