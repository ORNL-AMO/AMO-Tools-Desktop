import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../shared/models/settings';
import { CalculationsTableRow, WasteWater, WasteWaterResults } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { DataTableVariable, DataTableVariables } from './dataTableVariables';

@Injectable()
export class WasteWaterAnalysisService {

  analysisTab: BehaviorSubject<string>;

  analysisGraphItems: BehaviorSubject<Array<AnalysisGraphItem>>;
  analysisXAxisVariables: BehaviorSubject<Array<DataTableVariable>>;
  baselineResults: WasteWaterResults;
  modificationsResultsArr: Array<{
    name: string,
    results: WasteWaterResults,
    color: string
  }>;

  selectedTableData: BehaviorSubject<{ name: string, results: WasteWaterResults }>;
  xAxisHover: BehaviorSubject<Array<{ curveNumber: number, pointNumber: number }>>;
  constructor(private wasteWaterService: WasteWaterService) {
    this.analysisTab = new BehaviorSubject<string>('graphs');
    this.analysisGraphItems = new BehaviorSubject<Array<AnalysisGraphItem>>(new Array());
    this.analysisXAxisVariables = new BehaviorSubject<Array<DataTableVariable>>(undefined);
    this.selectedTableData = new BehaviorSubject<{ name: string, results: WasteWaterResults }>({ name: '', results: undefined });
    this.xAxisHover = new BehaviorSubject<Array<{ curveNumber: number, pointNumber: number }>>(new Array());
  }

  setResults(wasteWater: WasteWater, settings: Settings) {
    //baseline color: '#1E7640'
    this.baselineResults = this.wasteWaterService.calculateResults(wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.baselineData.operations, wasteWater.baselineData.co2SavingsData, settings, true);
    this.modificationsResultsArr = new Array();
    let index: number = 1;
    wasteWater.modifications.forEach(modification => {
      let modificationResults: WasteWaterResults = this.wasteWaterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, modification.operations, modification.co2SavingsData, settings, true, this.baselineResults);
      this.modificationsResultsArr.push({
        name: modification.name,
        results: modificationResults,
        color: graphColors[index]
      });
      index++;
    });
  }

  setGraphData(selectedXAxisVariable?: DataTableVariable) {
    let xAxisVariable = selectedXAxisVariable;
    if (!xAxisVariable) {
      xAxisVariable = this.analysisXAxisVariables.getValue().find(x => x.selected == true);
    } 

    let analysisGraphItems: Array<AnalysisGraphItem> = this.getAnalysisGraphItems(this.baselineResults, this.modificationsResultsArr, xAxisVariable);
    this.analysisGraphItems.next(analysisGraphItems);
  }

  initXAxisVariables() {
    let analysisXAxisVariables: Array<DataTableVariable> = JSON.parse(JSON.stringify(DataTableVariables));
    analysisXAxisVariables.forEach(x => x.selected = false);
    let defaultXVariable: DataTableVariable = {
      name: 'SRT',
      label: 'SRT Days',
      metricUnit: '',
      imperialUnit: '',
      selected: true
    }
    analysisXAxisVariables.unshift(defaultXVariable);
    this.analysisXAxisVariables.next(analysisXAxisVariables);
  }


  getAnalysisGraphItems(baselineResults: WasteWaterResults, modificationsResultsArr: Array<{ name: string, results: WasteWaterResults, color: string }>, xAxisVariable: DataTableVariable): Array<AnalysisGraphItem> {
    let analysisGraphItems: Array<AnalysisGraphItem> = new Array();

    DataTableVariables.forEach(variable => {
      let graphItem: AnalysisGraphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, variable, xAxisVariable);
      analysisGraphItems.push(graphItem);
    });
    return analysisGraphItems;
  }

  getAnalysisGraphItem(baselineResults: WasteWaterResults, modificationsResultsArr: Array<{ name: string, results: WasteWaterResults, color: string }>, tableVariable: DataTableVariable, xAxisVariable: DataTableVariable): AnalysisGraphItem {
    let traces: Array<GraphItemTrace> = new Array();
    let baselineXYData = this.getXYData(baselineResults.calculationsTableMapped, tableVariable.name, xAxisVariable.name);
    let markerSize = this.setMarkerSize(baselineXYData, baselineResults.SolidsRetentionTime);

    traces.push({
      name: 'Baseline',
      x: baselineXYData.x,
      y: baselineXYData.y,
      marker: {
        color: '#1E7640',
        size: markerSize
      },
      mode: 'lines+markers',
      hovertemplate: '%{y:.2f}'
    });
    modificationsResultsArr.forEach(modResult => {
      let modXYData = this.getXYData(modResult.results.calculationsTableMapped, tableVariable.name, xAxisVariable.name);
      let markerSize: Array<number> = this.setMarkerSize(modXYData, modResult.results.SolidsRetentionTime);

      traces.push({
        name: modResult.name,
        x: modXYData.x,
        y: modXYData.y,
        marker: {
          color: modResult.color,
          size: markerSize
        },
        mode: 'lines+markers',
        hovertemplate: '%{y:.2f}'
      });
    });
    return {
      title: tableVariable.label,
      analysisVariableName: tableVariable.name,
      traces: traces,
      selected: tableVariable.selected,
      variableY: tableVariable,
      variableX: xAxisVariable
    }
  }

  setMarkerSize(data: { x: Array<number>, y: Array<number>, srt: Array<number> }, SRTResult: number): Array<number> {
    let sizes: Array<number> = [];
    data.x.forEach((x, index) => {
      if (data.srt[index] == SRTResult) {
        sizes.push(12);
      } else {
        sizes.push(6);
      }
    });
    return sizes;
  }

  getXYData(calculationsTableMapped: Array<CalculationsTableRow>, analysisVariableName: string, xAxisVariableName: string): { x: Array<number>, y: Array<number>, srt: Array<number> } {
    return {
      x: calculationsTableMapped.map(tableRow => { return tableRow[xAxisVariableName] }),
      y: calculationsTableMapped.map(tableRow => { return tableRow[analysisVariableName] }),
      srt: calculationsTableMapped.map(tableRow => { return tableRow.SRT }),
    }
  }

}


export interface AnalysisGraphItem {
  title: string,
  analysisVariableName: string,
  traces: Array<GraphItemTrace>,
  selected: boolean,
  variableY: DataTableVariable
  variableX: DataTableVariable
}


export interface GraphItemTrace {
  x: Array<number>,
  y: Array<number>,
  marker: {
    color: string,
    size: Array<number>
  },
  name: string,
  mode: string,
  hovertemplate: string
}
