import { Injectable } from '@angular/core';
import { CompressedAirAssessment, EndUseDayTypeSetup } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults } from '../../compressed-air-assessment-results.service';
import { EndUseEnergyData, EndUsesService } from '../../end-uses/end-uses.service';

@Injectable()
export class AirflowSankeyService {
  baseSize: number = 300;
  constructor(private endUsesService: EndUsesService) { }

  getAirFlowSankeyResults(compressedAirAssessment: CompressedAirAssessment, endUseDayTypeSetup: EndUseDayTypeSetup, settings: Settings): AirFlowSankeyResults {
    let airflowSankeyResults: AirFlowSankeyResults = {
      endUseEnergyData: [],
      warnings: { minAirflow: undefined}
    };

    if (compressedAirAssessment.endUseData.endUses.length > 0) {
      let dayTypeBaselineResults: BaselineResults = this.endUsesService.getBaselineResults(compressedAirAssessment, settings);
      let endUseEnergyData: Array<EndUseEnergyData> = this.endUsesService.getEndUseEnergyData(compressedAirAssessment, endUseDayTypeSetup, dayTypeBaselineResults);
      airflowSankeyResults.endUseEnergyData = endUseEnergyData;  
      if (compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflow) {
        airflowSankeyResults.unaccountedEnergyData = {
          dayTypeAverageAirFlow: compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflow, 
          dayTypeAverageAirflowPercent: (compressedAirAssessment.endUseData.dayTypeAirFlowTotals.unaccountedAirflow / compressedAirAssessment.endUseData.dayTypeAirFlowTotals.totalDayTypeAverageAirflow) * 100,
          endUseName: 'Unaccounted Airflow',
          endUseId: 'unaccounted',
          color: 'rgb(190,190,190)',
        }
        airflowSankeyResults.endUseEnergyData.splice(1, 0, airflowSankeyResults.unaccountedEnergyData);
      }
      
      if (compressedAirAssessment.endUseData.dayTypeAirFlowTotals.totalDayTypeAverageAirflow) {
        if (endUseEnergyData.length > 10) {
          airflowSankeyResults.endUseEnergyData = endUseEnergyData.slice(0, 10);
          airflowSankeyResults.otherEndUseData = endUseEnergyData.slice(11, endUseEnergyData.length).reduce((totalOtherEnergyData, data) => {
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
            endUseName: 'Other End Use Airflow',
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
  unaccountedEnergyData?: EndUseEnergyData,
  warnings: AirflowSankeyWarnings

}

export interface AirflowSankeyWarnings {
  minAirflow: string;
}