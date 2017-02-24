import { Injectable } from '@angular/core';
declare var addon: any;

@Injectable()
export class AddonService {

  constructor() { }

  wallLosses(surfaceArea:number, ambientTemperature: number, surfaceTemperature: number, windVelocity:number, surfaceEmissivity: number, conditionFactor: number, correctionFactor: number){
    return addon.wallLosses(surfaceArea, ambientTemperature, surfaceTemperature, windVelocity, surfaceEmissivity, conditionFactor, correctionFactor);
  }
}
