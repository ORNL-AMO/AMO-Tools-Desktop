import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Settings } from '../../shared/models/settings';
import { CalculationsTableRow, WasteWater, WasteWaterResults } from '../../shared/models/waste-water';
import { WasteWaterService } from '../waste-water.service';
import { DataTableVariable, DataTableVariables } from './dataTableVariables';

@Injectable()
export class WasteWaterAnalysisService {

  analysisTab: BehaviorSubject<string>;

  analysisGraphItems: BehaviorSubject<Array<AnalysisGraphItem>>;
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
    this.selectedTableData = new BehaviorSubject<{ name: string, results: WasteWaterResults }>({ name: '', results: undefined });
    this.xAxisHover = new BehaviorSubject<Array<{ curveNumber: number, pointNumber: number }>>(new Array());
  }

  setResults(wasteWater: WasteWater, settings: Settings) {
    this.baselineResults = this.wasteWaterService.calculateResults(wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.systemBasics, settings);
    this.modificationsResultsArr = new Array();

    let color: string = '0,48,135';
    let stepVal: number = 1 / (wasteWater.modifications.length + 1);
    let opacityVal: number = 1 - stepVal;

    wasteWater.modifications.forEach(modification => {
      let modificationResults: WasteWaterResults = this.wasteWaterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, this.baselineResults);
      this.modificationsResultsArr.push({
        name: modification.name,
        results: modificationResults,
        color: '0,48,135,' + opacityVal
      });
      opacityVal = opacityVal - stepVal;
    });
  }

  setGraphGata() {
    let analysisGraphItems: Array<AnalysisGraphItem> = this.getAnalysisGraphItems(this.baselineResults, this.modificationsResultsArr);
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
      mode: 'lines+markers',
      hovertemplate: '%{y:.2f}'
    });
    modificationsResultsArr.forEach(modResult => {
      let modXYData = this.getXYData(modResult.results.calculationsTableMapped, tableVariable.name);
      traces.push({
        name: modResult.name,
        x: modXYData.x,
        y: modXYData.y,
        mode: 'lines+markers',
        hovertemplate: '%{y:.2f}'
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
  mode: string,
  hovertemplate: string
}
