import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import * as _ from 'lodash';



@Injectable()
export class EGridService {

  zipCodeLookup;
  allZipcodesMapped: Array<any>;
  subRegionsByZipcode: Array<SubRegionData>;
  co2Emissions: Array<SubregionEmissions>;

  constructor() {}
  
  getAllSubRegions() {
    Papa.parse("assets/eGrid_co2.csv", {
      header: true,
      download: true,
      complete: results => {
        this.setCo2Emissions(results.data);
      }
    });

    Papa.parse("assets/eGrid_zipcode_lookup.csv", {
      header: true,
      download: true,
      complete: results => {
        this.setSubRegionsByZip(results.data);
      }
    });
  }

  setSubRegionsByZip(csvResults: Array<any>) {
    let subRegionsByZipcode = new Array<SubRegionData>();
    csvResults.forEach(result => {
      if (result['ZIP (character)']) {
          subRegionsByZipcode.push({
            zip: result['ZIP (character)'],
            state: result['state'],
            subregions: [
              result['eGRID Subregion #1'],
              result['eGRID Subregion #2'],
              result['eGRID Subregion #3'],
            ]
          })
      }
    });

    this.subRegionsByZipcode = subRegionsByZipcode;
  }

  setCo2Emissions(csvResults: Array<any>) {
    let co2Emissions = new Array<SubregionEmissions>();
    csvResults.forEach(result => {
      if (result['SUBRGN']) {
        co2Emissions.push({
            subregion: result['SUBRGN'],
            co2Emissions: Number(result['CO2e']),
          })
      }
    });

    this.co2Emissions = co2Emissions;
  }

}

export interface SubRegionData {
  zip: number,
  state: string,
  co2Emissions?: number,
  subregions?: Array<string>
}

export interface SubregionEmissions {
  subregion: string, 
  co2Emissions: number
}
