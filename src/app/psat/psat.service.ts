import { Injectable } from '@angular/core';
declare var psatAddon: any;

@Injectable()
export class PsatService {

  constructor() { }

  test(){
    console.log(psatAddon)
  }

}
