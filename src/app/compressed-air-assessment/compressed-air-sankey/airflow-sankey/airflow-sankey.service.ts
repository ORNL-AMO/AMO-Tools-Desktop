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
      warnings: { minAirflow: undefined}
    };

    if (compressedAirAssessment.endUseData.endUses.length > 0) {
      // TODO should just combine sankey results into normal results so we only have to iterate through everything once
      // Set results as behavior subject?
      let dayTypeBaselineResults: BaselineResults = this.endUsesService.getBaselineResults(compressedAirAssessment, settings);
      let endUseEnergyData: Array<EndUseEnergyData> = this.endUsesService.getEndUseEnergyData(compressedAirAssessment, selectedDayTypeId, dayTypeBaselineResults);
      airflowSankeyResults.endUseEnergyData = endUseEnergyData;  
      airflowSankeyResults.totalEndUseAirflow = compressedAirAssessment.endUseData.dayTypeAirFlowTotals.totalDayTypeEndUseAirflow;

      if (airflowSankeyResults.totalEndUseAirflow) {
        if (endUseEnergyData.length > 10) {
          // 2440
          airflowSankeyResults.endUseEnergyData = endUseEnergyData.slice(0, 10);
          airflowSankeyResults.otherEndUseData = endUseEnergyData.slice(10, endUseEnergyData.length - 1).reduce((totalOtherEnergyData, data) => {
            return {
              dayTypeAverageAirFlow: totalOtherEnergyData.dayTypeAverageAirFlow += data.dayTypeAverageAirFlow,
              dayTypeAverageAirflowPercent: totalOtherEnergyData.dayTypeAverageAirflowPercent += data.dayTypeAverageAirflowPercent,
              endUseName: totalOtherEnergyData.endUseName,
              endUseId: totalOtherEnergyData.endUseId,
              color: undefined,
            };
          }, {
            dayTypeAverageAirFlow: 0,
            dayTypeAverageAirflowPercent: 0,
            endUseName: 'Other End Use Energy',
            endUseId: Math.random().toString(36).substr(2, 9),
            color: undefined,
          });
        } 
      } else {
        airflowSankeyResults.warnings.minAirflow = `Total end use airflow should be greater than 0. Please check end use airflow values`; 
      }
    }
    
    
    return airflowSankeyResults;
  }

  // TODO only need this if we're going to display the unaccounted/exceeded flows
  // // totalDayTypeAverageAirflow differences
  // checkunaccountedAirflow(airflowSankeyResults: AirFlowSankeyResults, selectedDayTypeId: string, dayTypeBaselineResults: BaselineResults) {
  //   let unaccountedAirflow: EndUseEnergyData
  //   let totalDayTypeAverageAirflow: number = dayTypeBaselineResults.dayTypeResults.find(dayTypeResult => dayTypeResult.dayTypeId === selectedDayTypeId).averageAirFlow; 

  //   debugger;
  //   if (airflowSankeyResults.totalEndUseAirflow < totalDayTypeAverageAirflow) {
  //     // add unallocated
  //     unaccountedAirflow = {
  //       dayTypeAverageAirFlow: totalDayTypeAverageAirflow - airflowSankeyResults.totalEndUseAirflow, 
  //       dayTypeAverageAirflowPercent: 0,
  //       endUseName: 'Airflow unaccounted for in end uses',
  //       endUseId: Math.random().toString(36).substr(2, 9),
  //       color: 'grey',
  //     }
  //   } else if (airflowSankeyResults.totalEndUseAirflow > totalDayTypeAverageAirflow) {
  //     unaccountedAirflow = {
  //       dayTypeAverageAirFlow: airflowSankeyResults.totalEndUseAirflow - totalDayTypeAverageAirflow, 
  //       dayTypeAverageAirflowPercent: 0,
  //       endUseName: 'Airflow over-allocated from end uses',
  //       endUseId: Math.random().toString(36).substr(2, 9),
  //       color: 'grey',
  //     }
  //   }
  //   return unaccountedAirflow;
  // }


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
  otherEndUseData?: EndUseEnergyData,
  totalEndUseAirflow: number,
  warnings: AirflowSankeyWarnings

}

export interface AirflowSankeyWarnings {
  minAirflow: string;
}