import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sigFigs'
})
export class SigFigsPipe implements PipeTransform {

  transform(value: number, sigFigs: number, scientificNotation?: boolean): any {
    //string value of number in scientific notation
    let newValString = value.toPrecision(sigFigs);
    //converted to number with trailing/leading zeros
    let newValNumber = parseFloat(newValString);
    if(scientificNotation){
      return newValString;
    }else{
      return newValNumber;
    }
  }

}
