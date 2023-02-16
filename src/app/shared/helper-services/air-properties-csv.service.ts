import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';

@Injectable()
export class AirPropertiesCsvService {


  airPropertiesData: Array<AirProperties>;

  constructor() {}
  
  initAirPropertiesData(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Papa.parse("assets/airpropertiescsv_final.csv", {
        header: true,
        download: true,
        complete: results => {
          this.setAirPropertiesData(results.data);
          resolve(true);
        },
        error: results => {
          reject(true);
        },
      });
    });

  }

  setAirPropertiesData(csvResults: Array<any>) {
    let airPropertiesData = new Array<AirProperties>();
    csvResults.forEach(result => {
      if (result['Factor_Compressibility']) {
        airPropertiesData.push({
            pressure: Number(result['Pressure']),
            temperature: Number(result['Temperature']),
            c_p: Number(result['c_p']),
            c_v: Number(result['c_v']),
            density: Number(result['Density']),
            enthalpy: Number(result['Enthalpy']),
            compressibilityFactor: Number(result['Factor_Compressibility']),
          })
      }
    });

    this.airPropertiesData = airPropertiesData;
  }

}

export interface AirProperties {
  pressure: number,
  temperature: number,
  c_p: number,
  c_v: number,
  density: number,
  enthalpy: number,
  compressibilityFactor: number,
}

