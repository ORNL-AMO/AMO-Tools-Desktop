import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { LogToolField, GraphObj, AnnotationData, GraphDataOption } from '../log-tool-models';
import { LogToolService } from '../log-tool.service';

@Injectable()
export class VisualizeService {

  allDataByAxisFieldsInitialized: boolean = false;
  allDataByAxisField: Array<GraphDataOption>;
  graphObjects: BehaviorSubject<Array<GraphObj>>;
  selectedGraphObj: BehaviorSubject<GraphObj>;
  shouldRenderGraph: BehaviorSubject<boolean>;
  userInputDelay: BehaviorSubject<number>;
  annotateDataPoint: BehaviorSubject<AnnotationData>;
  tabSelect: BehaviorSubject<string>;
  focusedPanel: BehaviorSubject<string>;
  plotFunctionType: string;
  restyleRanges: BehaviorSubject<{ xMin: number, xMax: number, yMin: number, yMax: number, y2Min: number, y2Max: number }>;
  constructor(private logToolService: LogToolService) {
    this.initializeService();
  }

  initializeService() {
    this.focusedPanel = new BehaviorSubject<string>(undefined);
    this.userInputDelay = new BehaviorSubject<number>(0);
    let initData = this.initGraphObj();
    this.graphObjects = new BehaviorSubject([initData]);
    this.selectedGraphObj = new BehaviorSubject<GraphObj>(initData);
    this.shouldRenderGraph = new BehaviorSubject<boolean>(undefined);
    this.annotateDataPoint = new BehaviorSubject<AnnotationData>(undefined);
    this.restyleRanges = new BehaviorSubject(undefined);
    this.tabSelect = new BehaviorSubject(undefined);
  }

  buildGraphData() {
    this.allDataByAxisFieldsInitialized = true;
    this.allDataByAxisField = new Array();
    let graphAxisOptions = this.getDataFieldOptionsWithDate();
    graphAxisOptions.forEach(field => {
      let data = this.getAxisOptionGraphData(field.fieldName);
      this.allDataByAxisField.push({
        data: data,
        numberOfDataPoints: data.length,
        dataField: field
      });
    });
  }

  displayAnnotationHelp() {
    this.tabSelect.next('help');
    this.focusedPanel.next('highlight-performance-info');
  }

  displayTimeSeriesHelp() {
    this.tabSelect.next('help');
    this.focusedPanel.next('highlight-timeseries-info');
  }

  getDataFieldOptions(isDayTypeAnalysisChart: boolean = false): Array<LogToolField> {
    //non date and used fields
    let fields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    fields = this.filterFieldsForPresentation(fields);
    if (isDayTypeAnalysisChart) {
      fields.push(
      {
        fieldName: 'all',
        alias: 'Total Aggregated Equipment Data',
        useField: true,
        useForDayTypeAnalysis: true,
        isDateField: undefined,
        isTimeField: undefined,
        unit: undefined,
        invalidField: undefined,
        csvId: undefined,
        csvName: undefined,
        fieldId: 'all'
    });
    }
    return fields;
  }

  filterFieldsForPresentation(fields: LogToolField[], isDaytypeAnalysis: boolean = false) {
    return fields.filter((field, index, self) => {
      let useField: boolean = (isDaytypeAnalysis && field.useForDayTypeAnalysis) || (!isDaytypeAnalysis && field.useField);
      return useField && field.isDateField != true;
    });
  }

  // field == axis
  getDataFieldOptionsWithDate() {
    let tmpFields: Array<LogToolField> = JSON.parse(JSON.stringify(this.logToolService.fields));
    _.remove(tmpFields, (field) => { return field.useField == false });
    return tmpFields;
  }

  
  isValidDate(dateItem: any) {
    let dateISOFormat = new Date(dateItem);
    return dateISOFormat instanceof Date && !isNaN(dateISOFormat.getTime());
  }
  
  getAxisOptionGraphData(fieldName: string): Array<number> {
    let data: Array<any> = new Array();
    this.logToolService.individualDataFromCsv.forEach(individualDataItem => {
      let foundData = individualDataItem.csvImportData.meta.fields.find(field => { return field == fieldName });
      // 6108 continue to concat time, don't allow concat of other data fields (breaks time segment display in non time-series visualizer)
      if (foundData && individualDataItem.dateField && fieldName === individualDataItem.dateField.fieldName) {
        data = _.concat(data, individualDataItem.csvImportData.data);
      }
      if (foundData) {
        data = individualDataItem.csvImportData.data;
      }
    });
    
    let mappedValues: Array<any> = _.mapValues(data, (dataItem) => { return dataItem[fieldName] });
    let valueArr = _.values(mappedValues);
    return valueArr;
  }

  getGraphDataByField(fieldName: string) {
    let data: Array<number | string>;
    if (fieldName == 'Time Series') {
      // 6040 rework for setXAxisDataOptionts call?
    } else {
      data = _.find(this.allDataByAxisField, (dataItem) => { return dataItem.dataField.fieldName == fieldName }).data;
    }
    return data;
  }

  // Need to filter by unique identifiers for data fields here
  getTimeSeriesData(field: LogToolField): Array<number | string> {
    let data: Array<number | string> = _.find(this.allDataByAxisField, (dataItem) => { 
      let fieldData = dataItem.dataField.csvId == field.csvId && dataItem.dataField.isDateField
      return fieldData;
    }).data;
    return data;
  }

  setDefaultGraphInteractivity(graphObj: GraphObj, dataPoints: number) {
    graphObj.graphInteractivity.hasLargeDataset = dataPoints > 200000;
    graphObj.graphInteractivity.showUserToggledPerformanceWarning = false;

    return graphObj;
  }

  initGraphObj(): GraphObj {
    return {
      name: 'Data Visualization',
      data: this.getEmptyGraphData(),
      layout: this.getEmptyLayout(),
      mode: {
        modeBarButtonsToRemove: ['lasso2d'],
        // plotGlPixelRatio: 3,
        responsive: true,
        displaylogo: false,
        displayModeBar: true
      },
      graphInteractivity: {
        isGraphInteractive: true,
        showDefaultPerformanceWarning: false,
      },
      selectedXAxisDataOption: { dataField: undefined, data: [] },
      selectedYAxisDataOptions: [],
      shouldRenderNewPlot: true,
      hasChanges: false,
      isTimeSeries: true,
      hasSecondYAxis: false,
      numberOfBins: undefined,
      bins: undefined,
      binnedField: undefined,
      binningMethod: 'binSize',
      binSize: undefined,
      useStandardDeviation: true,
      usePercentForBins: true,
      graphId: Math.random().toString(36).substr(2, 9),
      xAxisDataOptions: [],
      yAxisDataOptions: []
    }
  }

  getEmptyLayout() {
    return {
      title: {
        text: 'Data Visualization 1',
        font: {
          size: 22
        }
      },
      hovermode: false,
      dragmode: false,
      annotations: [],
      xaxis: {
        autorange: true,
        type: undefined,
        // spikemode: 'across',
        title: {
          text: 'X Axis Label'
        },
        side: undefined,
        overlaying: undefined,
        titlefont: {
          color: undefined
        },
        tickfont: {
          color: undefined
        }
      },
      yaxis: {
        autorange: true,
        type: undefined,
        title: {
          text: 'Y Axis Label'
        },
        side: undefined,
        overlaying: undefined,
        titlefont: {
          color: undefined
        },
        tickfont: {
          color: undefined
        },
        rangemode: 'tozero'
      },
      yaxis2: {
        autorange: true,
        type: undefined,
        title: {
          text: 'Y Axis 2 Label'
        },
        side: 'right',
        overlaying: 'y',
        titlefont: {
          color: undefined
        },
        tickfont: {
          color: undefined
        },
        rangemode: 'tozero'
      },
      margin: {
        t: 75,
        b: 100,
        l: 100,
        r: 50
      }
    }
  }

  getEmptyGraphData() {
    return [{
      x: [],
      y: [],
      name: 'empty',
      // type: 'time-series',
      type: 'scattergl',
      mode: 'markers',
      yaxis: undefined,
      marker: {
        color: undefined
      },
      line: {
        color: undefined,
        width: 1
      }
    }]
  }

  resetData() {
    this.initializeService();
    this.allDataByAxisFieldsInitialized = false;
  }

  addNewGraphDataObj() {
    let currentGraphs: Array<GraphObj> = this.graphObjects.getValue();
    let newGraphDataObj: GraphObj = this.initGraphObj();
    newGraphDataObj.layout.title.text = 'Data Visualization ' + (currentGraphs.length + 1);
    this.selectedGraphObj.next(newGraphDataObj);
    currentGraphs.push(newGraphDataObj);
    this.graphObjects.next(currentGraphs);
  }

  removeGraphDataObj(graphId: string) {
    let currentGraphData: Array<GraphObj> = this.graphObjects.getValue();
    _.remove(currentGraphData, (graphDataObj) => { return graphDataObj.graphId == graphId });
    this.graphObjects.next(currentGraphData);
    this.selectedGraphObj.next(currentGraphData[0]);
    this.shouldRenderGraph.next(true)
  }

  getNumberOfBinsBarChartData(dataField: LogToolField, bins: Array<{ max: number, min: number }>, calculatePercentage: boolean): { xLabels: Array<string>, yValues: Array<number> } {
    let graphData: Array<number> = this.getAxisOptionGraphData(dataField.fieldName);
    let xLabels: Array<string> = new Array();
    let yValues: Array<number> = new Array();
    bins.forEach(bin => {
      let graphDataInRange: Array<number> = _.filter(graphData, (dataItem) => {
        if (dataItem >= bin.min && dataItem < bin.max) {
          return true;
        }
      });
      if (calculatePercentage) {
        let percentOfItemsInBin: number = graphDataInRange.length / graphData.length * 100;
        percentOfItemsInBin = Number(percentOfItemsInBin.toFixed(2));
        yValues.push(percentOfItemsInBin);

      } else {
        yValues.push(graphDataInRange.length);
      }
      let xLabel: string = bin.min.toLocaleString() + ' - ' + bin.max.toLocaleString();
      xLabels.push(xLabel)
    });
    return { xLabels: xLabels, yValues: yValues };
  }

  getStandardDevBarChartData(dataField: LogToolField, calculatePercentage: boolean, binStart: number): { xLabels: Array<string>, yValues: Array<number>, standardDeviation: number, average: number } {
    let graphData: Array<number> = this.getAxisOptionGraphData(dataField.fieldName);
    let graphDataMin: number;
    if (binStart != undefined) {
      graphDataMin = binStart;
    } else {
      graphDataMin = _.min(graphData);
    }
    let graphDataMax: number = _.max(graphData);
    let graphRange: number = graphDataMax - graphDataMin;
    let mean: number = _.mean(graphData);
    let standardDeviation: number = this.calculateStandardDeviation(graphData, mean);
    let numberOfBins: number = graphRange / standardDeviation;
    let xLabels: Array<string> = new Array();
    let yValues: Array<number> = new Array();
    let minValue: number = graphDataMin;
    for (let i = 0; i < numberOfBins; i++) {
      let maxValue: number = Number((minValue + standardDeviation).toFixed(0));
      let graphDataInRange: Array<number> = _.filter(graphData, (dataItem) => {
        if (dataItem >= minValue && dataItem <= maxValue) {
          return true;
        }
      });
      if (calculatePercentage) {
        let percentOfItemsInBin: number = graphDataInRange.length / graphData.length * 100;
        percentOfItemsInBin = Number(percentOfItemsInBin.toFixed(2));
        yValues.push(percentOfItemsInBin);

      } else {
        yValues.push(graphDataInRange.length);
      }
      let xLabel: string = minValue.toLocaleString() + ' - ' + maxValue.toLocaleString();
      xLabels.push(xLabel)
      minValue = Number((minValue + standardDeviation).toFixed(0));
    }
    return { xLabels: xLabels, yValues: yValues, standardDeviation: standardDeviation, average: mean };
  }

  calculateStandardDeviation(graphData: Array<number>, mean: number): number {
    let squareDiffs: Array<number> = _.map(graphData, (dataItem) => {
      let diff: number = dataItem - mean;
      let squareDiff: number = diff * diff;
      return squareDiff;
    });
    _.remove(squareDiffs, (diff) => { return isNaN(diff) == true });
    let averageSquareDiff: number = _.mean(squareDiffs);
    let squareRootOfAverageSquareDiff: number = Math.sqrt(averageSquareDiff);
    return Number(squareRootOfAverageSquareDiff.toFixed(3));
  }

  getAnnotationPoint(data): AnnotationData {
    let selectedGraphObj: GraphObj = this.selectedGraphObj.getValue();
    let findAnnotation: AnnotationData = selectedGraphObj.layout.annotations.find(annotation => { return (annotation.x == data.points[0].x && annotation.y == data.points[0].y) });
    if (findAnnotation) {
      return findAnnotation;
    } else {
      return {
        x: data.points[0].x,
        y: data.points[0].y,
        text: '',
        showarrow: true,
        selectedXAxis: selectedGraphObj.selectedXAxisDataOption.dataField.fieldName,
        font: {
          // family: string,
          size: 16,
          color: '#000000'
        },
        // align: string,
        // arrowhead: number,
        arrowsize: 1,
        // arrowwidth: number,
        arrowcolor: '#000000',
        ax: 0,
        ay: -100,
        // bordercolor: string,
        // borderwidth: number,
        borderpad: 10,
        bgcolor: '#ffffff',
        // opacity: number
        annotationId: Math.random().toString(36).substr(2, 9),
        yref: data.points[0].fullData.yaxis,
        seriesName: data.points[0].fullData.name,
        dataSeriesId: data.points[0].data.dataSeriesId
      }
    }
  }
}
