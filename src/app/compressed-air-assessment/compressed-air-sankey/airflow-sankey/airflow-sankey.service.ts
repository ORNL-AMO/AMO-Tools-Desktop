import { Injectable } from '@angular/core';
import { CompressedAirAssessment } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults } from '../../compressed-air-assessment-results.service';
import { EndUseEnergyData, EndUsesService } from '../../end-uses/end-uses.service';

@Injectable()
export class AirflowSankeyService {
  baseSize: number = 300;
  constructor(private endUsesService: EndUsesService) { }

  getAirFlowSankeyResults(compressedAirAssessment: CompressedAirAssessment, selectedDayTypeId: string, settings: Settings): AirFlowSankeyResults {
    let airflowSankeyResults: AirFlowSankeyResults = {
      endUseEnergyData: [],
      totalEndUseAirflow: undefined,
      warnings: {
        CFMWarning: undefined,
      }
    };

    if (compressedAirAssessment.endUses.length > 0) {
      // TODO should just combine sankey results into normal results so we only have to iterate through everything once
      // Set as behavior subject?
      let dayTypeBaselineResults: BaselineResults = this.endUsesService.getBaselineResults(compressedAirAssessment, settings);
      airflowSankeyResults.endUseEnergyData = this.endUsesService.getEndUseEnergyData(compressedAirAssessment, selectedDayTypeId, dayTypeBaselineResults);
      // TODO Should this be total system airflow for daytype, from sys profile?
      airflowSankeyResults.totalEndUseAirflow = airflowSankeyResults.endUseEnergyData.reduce((total, endUseData) => total + endUseData.dayTypeAverageAirFlow, 0);
    }
    
    
    console.log('sankeyResults', airflowSankeyResults);
    return airflowSankeyResults;
  }


  // TODO merge with existing sankey node from mroot
  createNode(name: string, value: number, displaySize: number, width: number, x: number, y: number, input: boolean, usefulOutput: boolean, inter: boolean, top: boolean, units: string, extSurfaceLoss: boolean, availableHeatPercent?: boolean): SankeyNode {
    let newNode: SankeyNode = {
      name: name,
      value: value,
      displaySize: displaySize,
      width: width,
      x: x,
      y: y,
      input: input,
      usefulOutput: usefulOutput,
      inter: inter,
      top: top,
      units: units,
    };

    return newNode;
  }



}

export interface SankeyNode {
  name: string;
  value: number;
  displaySize: number;
  width: number;
  x: number;
  y: number;
  input: boolean;
  usefulOutput: boolean;
  inter: boolean;
  top: boolean;
  units: string;
}


export interface CompressedAirSankeyNode {
  name: string,
  value: number,
  x: number,
  y: number,
  nodeColor: string,
  flow: number,
  source: number,
  target: number[],
  isConnector: boolean,
  isConnectingPath?: boolean,
  isCircularFlow?: boolean,
  id?: string,
}

export interface AirFlowSankeyResults {
  endUseEnergyData?: Array<EndUseEnergyData>,
  totalEndUseAirflow: number,
  warnings: CompressedAirSankeyWarnings

}


// export interface SankeyEndUseResults {
//   endUseId: string,
//   endUseName: string,
//   dayTypeEndUses?: Array<DayTypeEndUse>,
// }


export interface AirFlowSankeyInputs {
  selectedDayTypeId: string,
  dayTypeLeakRates: Array<{dayTypeId: string, dayTypeLeakRate: number}>,
}

export interface CompressedAirSankeyWarnings {
  CFMWarning: string;
}