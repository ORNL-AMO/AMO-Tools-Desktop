import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { CalculationsTableRow, WasteWater, WasteWaterResults } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';

@Injectable()
export class WasteWaterAnalysisService {

  analysisTab: BehaviorSubject<string>;

  analysisGraphItems: BehaviorSubject<Array<AnalysisGraphItem>>;
  constructor(private wasteWaterService: WasteWaterService) {
    this.analysisTab = new BehaviorSubject<string>('graphs');
    this.analysisGraphItems = new BehaviorSubject<Array<AnalysisGraphItem>>(new Array());
  }

  setGraphGata(wasteWater: WasteWater, settings: Settings) {
    debugger
    let baselineResults: WasteWaterResults = this.wasteWaterService.calculateResults(wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.systemBasics, settings);
    let modificationsResultsArr: Array<{
      name: string,
      results: WasteWaterResults,
      // markerColor: string
    }> = new Array();
    wasteWater.modifications.forEach(modification => {
      let modificationResults: WasteWaterResults = this.wasteWaterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, baselineResults);
      modificationsResultsArr.push({
        name: modification.name,
        results: modificationResults,
        // markerColor: ''
      });
    });
    //
    let analysisGraphItems: Array<AnalysisGraphItem> = this.getAnalysisGraphItems(baselineResults, modificationsResultsArr);
    this.analysisGraphItems.next(analysisGraphItems);
  }

  getAnalysisGraphItems(baselineResults: WasteWaterResults, modificationsResultsArr: Array<{ name: string, results: WasteWaterResults }>): Array<AnalysisGraphItem> {
    let analysisGraphItems: Array<AnalysisGraphItem> = new Array();
    // Se: number,
    let graphItem: AnalysisGraphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'Se', true);
    analysisGraphItems.push(graphItem);
    // HeterBio: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'HeterBio', false);
    analysisGraphItems.push(graphItem);
    // CellDeb: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'CellDeb', false);
    analysisGraphItems.push(graphItem);
    // InterVes: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'InterVes', false);
    analysisGraphItems.push(graphItem);
    // MLVSS: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'MLVSS', true);
    analysisGraphItems.push(graphItem);
    // MLSS: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'MLSS', true);
    analysisGraphItems.push(graphItem);
    // BiomassProd: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'BiomassProd', false);
    analysisGraphItems.push(graphItem);
    // SludgeProd: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'SludgeProd', true);
    analysisGraphItems.push(graphItem);
    // SolidProd: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'SolidProd', true);
    analysisGraphItems.push(graphItem);
    // Effluent: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'Effluent', false);
    analysisGraphItems.push(graphItem);
    // IntentWaste: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'IntentWaste', false);
    analysisGraphItems.push(graphItem);
    // OxygenRqd: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'OxygenRqd', true);
    analysisGraphItems.push(graphItem);
    // FlowMgd: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'FlowMgd', false);
    analysisGraphItems.push(graphItem);
    // NRemoved: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'NRemoved', false);
    analysisGraphItems.push(graphItem);
    // NRemovedMgl: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'NRemovedMgl', false);
    analysisGraphItems.push(graphItem);
    // NitO2Dem: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'NitO2Dem', false);
    analysisGraphItems.push(graphItem);
    // O2Reqd: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'O2Reqd', false);
    analysisGraphItems.push(graphItem);
    // EffNH3N: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'EffNH3N', false);
    analysisGraphItems.push(graphItem);
    // EffNo3N: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'EffNo3N', false);
    analysisGraphItems.push(graphItem);
    // TotalO2Rqd: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'TotalO2Rqd', false);
    analysisGraphItems.push(graphItem);
    // WAS: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'WAS', false);
    analysisGraphItems.push(graphItem);
    // EstimatedEff: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'EstimatedEff', false);
    analysisGraphItems.push(graphItem);
    // EstimRas: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'EstimRas', false);
    analysisGraphItems.push(graphItem);
    // FmRatio: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'FmRatio', false);
    analysisGraphItems.push(graphItem);
    // Diff_MLSS: number,
    graphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, 'Diff_MLSS', false);
    analysisGraphItems.push(graphItem);
    return analysisGraphItems;
  }

  getAnalysisGraphItem(baselineResults: WasteWaterResults, modificationsResultsArr: Array<{ name: string, results: WasteWaterResults }>, analysisVariableName: string, selected: boolean): AnalysisGraphItem {
    let traces: Array<GraphItemTrace> = new Array();
    let baselineXYData = this.getXYData(baselineResults.calculationsTableMapped, analysisVariableName);
    traces.push({
      name: 'Baseline',
      x: baselineXYData.x,
      y: baselineXYData.y,
    });
    modificationsResultsArr.forEach(modResult => {
      let modXYData = this.getXYData(modResult.results.calculationsTableMapped, analysisVariableName);
      traces.push({
        name: modResult.name,
        x: modXYData.x,
        y: modXYData.y
      });
    });
    return {
      title: analysisVariableName + ' vs SRT Days',
      analysisVariableName: analysisVariableName,
      traces: traces,
      selected: selected
    }
  }

  getXYData(calculationsTableMapped: Array<CalculationsTableRow>, analysisVariableName: string): { x: Array<number>, y: Array<number> } {
    return {
      x: calculationsTableMapped.map(tableRow => { return tableRow.SRT }),
      y: calculationsTableMapped.map(tableRow => { return tableRow[analysisVariableName] }),
    }
  }

}


export interface AnalysisGraphItem {
  title: string,
  analysisVariableName: string,
  traces: Array<GraphItemTrace>,
  selected: boolean
}


export interface GraphItemTrace {
  x: Array<number>,
  y: Array<number>,
  // marker: {
  //   color: string
  // }
  name: string
}