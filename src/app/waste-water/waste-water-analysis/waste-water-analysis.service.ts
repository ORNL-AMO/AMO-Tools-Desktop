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

    DataTableVariables.forEach(variable => {
      let graphItem: AnalysisGraphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, variable);
      analysisGraphItems.push(graphItem);
    });
    return analysisGraphItems;
  }

  getAnalysisGraphItem(baselineResults: WasteWaterResults, modificationsResultsArr: Array<{ name: string, results: WasteWaterResults }>, tableVariable: DataTableVariable): AnalysisGraphItem {
    let traces: Array<GraphItemTrace> = new Array();
    let baselineXYData = this.getXYData(baselineResults.calculationsTableMapped, tableVariable.name);
    traces.push({
      name: 'Baseline',
      x: baselineXYData.x,
      y: baselineXYData.y,
      mode: 'lines+markers'
    });
    modificationsResultsArr.forEach(modResult => {
      let modXYData = this.getXYData(modResult.results.calculationsTableMapped, tableVariable.name);
      traces.push({
        name: modResult.name,
        x: modXYData.x,
        y: modXYData.y,
        mode: 'lines+markers'
      });
    });
    return {
      title: tableVariable.label,
      analysisVariableName: tableVariable.name,
      traces: traces,
      selected: tableVariable.selected,
      dataVariable: tableVariable
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
  selected: boolean,
  dataVariable: DataTableVariable
}


export interface GraphItemTrace {
  x: Array<number>,
  y: Array<number>,
  // marker: {
  //   color: string
  // }
  name: string,
  mode: string
}


export interface DataTableVariable {
  name: string,
  label: string,
  metricUnit: string,
  imperialUnit: string,
  selected: boolean

}


export const DataTableVariables: Array<DataTableVariable> = [{
  name: 'Se',
  label: 'Efffluent CBOD5 Concentration (S&#x2080;)',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: true
}, {
  name: 'HeterBio',
  label: 'Heterotrophic biomass concentration',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: false
}, {
  name: 'CellDeb',
  label: 'Cell Debris Concentration',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: false
}, {
  name: 'InterVes',
  label: 'Influent Inert VSS Concentration',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: false
}, {
  name: 'MLVSS',
  label: 'MLVSS Concentration',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: true
}, {
  name: 'MLSS',
  label: 'MLSS Concentration',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: true
}, {
  name: 'BiomassProd',
  label: 'BiomassProd',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: false
}, {
  name: 'SludgeProd',
  label: 'SludgeProd',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: true
}, {
  name: 'SolidProd',
  label: 'SolidProd',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: true
}, {
  name: 'Effluent',
  label: 'Effluent',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: false
}, {
  name: 'IntentWaste',
  label: 'IntentWaste',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: false
}, {
  name: 'OxygenRqd',
  label: 'OxygenRqd',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: true
}, {
  name: 'FlowMgd',
  label: 'FlowMgd',
  metricUnit: 'mgd',
  imperialUnit: 'm&#x00B3;/day',
  selected: false
}, {
  name: 'NRemoved',
  label: 'NRemoved',
  metricUnit: '',
  imperialUnit: '',
  selected: false
}, {
  name: 'NRemovedMgl',
  label: 'NRemovedMgl',
  metricUnit: 'mgl',
  imperialUnit: 'm&#x00B3;',
  selected: false
}, {
  name: 'NitO2Dem',
  label: 'NitO2Dem',
  metricUnit: '',
  imperialUnit: '',
  selected: false
}, {
  name: 'O2Reqd',
  label: 'O&#x2082; Required',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: false
}, {
  name: 'EffNH3N',
  label: 'Effluent NH&#x00B3;-N Concentration',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: false
}, {
  name: 'EffNo3N',
  label: 'Effluent NO&#x00B3;-N Concentration',
  metricUnit: 'mg/L',
  imperialUnit: 'mg/L',
  selected: false
}, {
  name: 'TotalO2Rqd',
  label: 'Total O&#x2082; Requirements',
  metricUnit: 'lb/day',
  imperialUnit: 'kg/day',
  selected: false
}, {
  name: 'WAS',
  label: 'WAS Flow',
  metricUnit: 'mgd',
  imperialUnit: 'm&#x00B3;/day',
  selected: false
}, {
  name: 'EstimatedEff',
  label: 'EstimatedEff',
  metricUnit: '',
  imperialUnit: '',
  selected: false
}, {
  name: 'EstimRas',
  label: 'EstimRas',
  metricUnit: '',
  imperialUnit: '',
  selected: false
}, {
  name: 'FmRatio',
  label: 'F/M Ratio',
  metricUnit: '',
  imperialUnit: '',
  selected: false
}, {
  name: 'Diff_MLSS',
  label: 'Diff_MLSS',
  metricUnit: '',
  imperialUnit: '',
  selected: false
}]