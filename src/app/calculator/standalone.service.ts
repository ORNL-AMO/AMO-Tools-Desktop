import { Injectable } from '@angular/core';
declare var standaloneAddon: any;
@Injectable()
export class StandaloneService {

  constructor() { }
  test(){
    console.log(standaloneAddon)
  }


  CHPcalculator(inputs: any){
    return standaloneAddon.CHPcalculator(inputs);
  }
}
