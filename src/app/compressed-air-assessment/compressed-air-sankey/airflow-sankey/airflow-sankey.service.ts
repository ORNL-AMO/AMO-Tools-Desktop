import { Injectable } from '@angular/core';
import { CompressedAirAssessment, EndUseDayTypeSetup } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { BaselineResults } from '../../calculations/caCalculationModels';
import { CompressedAirAssessmentBaselineResults } from '../../calculations/CompressedAirAssessmentBaselineResults';
import { CompressedAirCalculationService } from '../../compressed-air-calculation.service';
import { AssessmentCo2SavingsService } from '../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { EndUseEnergy, EndUseEnergyData, EndUsesFormService } from '../../baseline-tab-content/end-uses-setup/end-uses-form/end-uses-form.service';

@Injectable()
export class AirflowSankeyService {
  baseSize: number = 300;
  constructor(private endUsesFormService: EndUsesFormService,
    private compressedAirCalculationService: CompressedAirCalculationService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService) { }

  getAirFlowSankeyResults(compressedAirAssessment: CompressedAirAssessment, endUseDayTypeSetup: EndUseDayTypeSetup, settings: Settings): AirFlowSankeyResults {
    let airflowSankeyResults: AirFlowSankeyResults = {
      endUseEnergyData: [],
      warnings: { minAirflow: undefined, hasInvalidEndUses: undefined }
    };

    if (compressedAirAssessment.endUseData.endUses.length > 0) {
      let compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(compressedAirAssessment, settings, this.compressedAirCalculationService, this.assessmentCo2SavingsService);
      let baselineResults: BaselineResults = compressedAirAssessmentBaselineResults.baselineResults;
      let endUseEnergy: EndUseEnergy = this.endUsesFormService.getEndUseEnergyData(compressedAirAssessment, endUseDayTypeSetup, baselineResults);
      if (endUseEnergy.hasValidEndUses) {
        let endUseEnergyData: Array<EndUseEnergyData> = endUseEnergy.endUseEnergyData;
        airflowSankeyResults.endUseEnergyData = endUseEnergy.endUseEnergyData;
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
      } else {
        airflowSankeyResults.warnings.hasInvalidEndUses = `One or more End Use is invalid - review End Uses and make changes to continue`;
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
  hasInvalidEndUses: string;
}