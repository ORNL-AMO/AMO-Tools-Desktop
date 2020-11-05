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
    //baseline color: '#1E7640'
    this.baselineResults = this.wasteWaterService.calculateResults(wasteWater.baselineData.activatedSludgeData, wasteWater.baselineData.aeratorPerformanceData, wasteWater.systemBasics, settings);
    this.modificationsResultsArr = new Array();
    let index: number = 1;
    wasteWater.modifications.forEach(modification => {
      let modificationResults: WasteWaterResults = this.wasteWaterService.calculateResults(modification.activatedSludgeData, modification.aeratorPerformanceData, wasteWater.systemBasics, settings, this.baselineResults);
      this.modificationsResultsArr.push({
        name: modification.name,
        results: modificationResults,
        color: graphColors[index]
      });
      index++;
    });
  }

  setGraphGata() {
    let analysisGraphItems: Array<AnalysisGraphItem> = this.getAnalysisGraphItems(this.baselineResults, this.modificationsResultsArr);
    this.analysisGraphItems.next(analysisGraphItems);
  }

  getAnalysisGraphItems(baselineResults: WasteWaterResults, modificationsResultsArr: Array<{ name: string, results: WasteWaterResults, color: string }>): Array<AnalysisGraphItem> {
    let analysisGraphItems: Array<AnalysisGraphItem> = new Array();

    DataTableVariables.forEach(variable => {
      let graphItem: AnalysisGraphItem = this.getAnalysisGraphItem(baselineResults, modificationsResultsArr, variable);
      analysisGraphItems.push(graphItem);
    });
    return analysisGraphItems;
  }

  getAnalysisGraphItem(baselineResults: WasteWaterResults, modificationsResultsArr: Array<{ name: string, results: WasteWaterResults, color: string }>, tableVariable: DataTableVariable): AnalysisGraphItem {
    let traces: Array<GraphItemTrace> = new Array();
    let baselineXYData = this.getXYData(baselineResults.calculationsTableMapped, tableVariable.name);
    let markerSize: Array<number> = new Array();
    baselineXYData.x.forEach(x => {
      if (x == baselineResults.SolidsRetentionTime) {
        markerSize.push(12);
      } else {
        markerSize.push(6);
      }
    });
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
      let modXYData = this.getXYData(modResult.results.calculationsTableMapped, tableVariable.name);

      let markerSize: Array<number> = new Array();
      modXYData.x.forEach(x => {
        if (x == modResult.results.SolidsRetentionTime) {
          markerSize.push(12);
        } else {
          markerSize.push(6);
        }
      });
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
  marker: {
    color: string,
    size: Array<number>
  },
  name: string,
  mode: string,
  hovertemplate: string
}
