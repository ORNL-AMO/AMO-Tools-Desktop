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
    Papa.parse("assets/eGRID-co2-emissions.csv", {
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

  getEmissionsParsed(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      Papa.parse("assets/eGRID-co2-emissions.csv", {
        header: true,
        download: true,
        complete: results => {
          this.setCo2Emissions(results.data);
          resolve(true);
        },
        error: results => {
          reject(true);
        },
      });
    });
  }

  getSubRegionsParsed(): Promise<boolean> {  
    return new Promise((resolve, reject) => {
      Papa.parse("assets/eGrid_zipcode_lookup.csv", {
        header: true,
        download: true,
        complete: results => {
          this.setSubRegionsByZip(results.data); 
          resolve(true);
        },
        error: results => {
          reject(true);
        },
      });
    });
  }

  processCSVData(): Promise<[boolean, boolean]> {
    let emissionsParsed: Promise<boolean> = this.getEmissionsParsed();
    let subRegionsParsed: Promise<boolean> = this.getSubRegionsParsed();
    return Promise.all([emissionsParsed, subRegionsParsed]);
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
      if (result['eGRID Subregion']) {
        co2Emissions.push({
            subregion: result['eGRID Subregion'],
            co2Emissions: Number(result['CO2 Factor']),
          })
      }
    });

    this.co2Emissions = co2Emissions;
  }

  findEGRIDCO2Emissions(eGridSubregion: string): SubregionEmissions {
    let emissiongsMatch =  _.find(this.co2Emissions, (val) => val.subregion.includes(eGridSubregion));
    if(emissiongsMatch){
      return JSON.parse(JSON.stringify(emissiongsMatch));
    }else{
      return{
        subregion: undefined,
        co2Emissions: undefined
      }
    }
  }

}

export interface SubRegionData {
  zip: string,
  state: string,
  co2Emissions?: number,
  subregions?: Array<string>
}

export interface SubregionEmissions {
  subregion: string, 
  co2Emissions: number
}

