import { Injectable } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { AnnotationData, GraphObj, LogToolField, XAxisDataOption } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class VisualizeSidebarService {
  selectedGraphObj: any;
  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService) { }

  // * update axis names, titles, series color
  saveUserInputChange(selectedGraphObj: GraphObj) {
    if (selectedGraphObj.isGraphInitialized) {
      selectedGraphObj.shouldRenderNewPlot = false;
      this.visualizeService.userInputDelay.next(100);
    }
    this.visualizeService.selectedGraphObj.next(selectedGraphObj);
  }

  // * Update layout, add axis data
  saveExistingPlotChange(selectedGraphObj: GraphObj, shouldRenderGraph?: boolean) {
    selectedGraphObj.shouldRenderNewPlot = false;
    selectedGraphObj.hasChanges = shouldRenderGraph? false : true;
    this.visualizeService.selectedGraphObj.next(selectedGraphObj);
    if (shouldRenderGraph) {
      this.visualizeService.shouldRenderGraph.next(true);
    }
  }

  // * Create new graph, update with new graph data
  saveGraphDataChange(selectedGraphObj: GraphObj) {
    this.visualizeService.userInputDelay.next(0);
    selectedGraphObj.shouldRenderNewPlot = true;
    selectedGraphObj.hasChanges = true;
    this.checkValidData(selectedGraphObj);
    this.visualizeService.selectedGraphObj.next(selectedGraphObj);
  }

  checkValidData(selectedGraphObj: GraphObj) {
    let isScatterPlot: boolean = selectedGraphObj.data[0].type == 'scattergl' && !selectedGraphObj.isTimeSeries;
    let hasValidData = selectedGraphObj.data.every(series => {
      if (series) {
        let hasValidX = series.x.length !== 0 && typeof series.x[0] === 'number' || (typeof series.x[0] === 'string' && selectedGraphObj.data[0].type == 'bar') || (typeof series.x[0] === 'string' && selectedGraphObj.isTimeSeries);
        let hasValidY = series.y.length !== 0 && typeof series.y[0] === 'number';
        return hasValidX && hasValidY;
      } else {
        return false;
      }
    }); 
    
    if (!hasValidData) {
      let invalidState: string = 'invalid-data-selected';
      let canRunDayTypeAnalysis = this.logToolDataService.explorerData.getValue().canRunDayTypeAnalysis;
      if (canRunDayTypeAnalysis) {
        
      } else if (!canRunDayTypeAnalysis) {
        if (selectedGraphObj.isTimeSeries) {
          invalidState = 'invalid-date-setup';
        } else if (isScatterPlot) {
          invalidState = 'invalid-scatter-selected';
        }
      }
      selectedGraphObj.invalidState = invalidState;
    } else {
      selectedGraphObj.invalidState = undefined;
    }
  }


  setGraphData(selectedGraphObj: GraphObj, shouldRenderGraph?: boolean) {
    if (selectedGraphObj.isTimeSeries || selectedGraphObj.data[0].type == 'scattergl') {
      this.setScatterXAxisDataOptions(selectedGraphObj, shouldRenderGraph);
    } else if (selectedGraphObj.data[0].type == 'bar') {
      this.setBarChartDataOptions(selectedGraphObj, shouldRenderGraph);
    }
  }

  setScatterXAxisDataOptions(selectedGraphObj: GraphObj, shouldRenderGraph?: boolean) {
    this.setXAxisDataOptions(selectedGraphObj);
    this.setSelectedXAxisDataOption(selectedGraphObj);

    this.setSelectedYAxisDataOption(selectedGraphObj);
    this.setGraphYAxisData(selectedGraphObj, shouldRenderGraph);
  }

  changeSelectedGraphData(selectedGraphObj: GraphObj, isSelectedGraphChange?: boolean) {
    selectedGraphObj.isTimeSeries = false;
    let validSelection: boolean = true;
    if (selectedGraphObj.data[0].type == 'bar') {
      validSelection = typeof selectedGraphObj.selectedXAxisDataOption.data[0] === 'number'; 

      if (validSelection) {
        this.checkBarHistogramData(selectedGraphObj);
        selectedGraphObj.invalidState = undefined;
      } else {
        selectedGraphObj.invalidState = 'invalid-data-selected';
      }
    } else if (selectedGraphObj.data[0].type == 'time-series') {
      selectedGraphObj.isTimeSeries = true;
      selectedGraphObj.selectedYAxisDataOptions.map(selectedYOption => selectedYOption.linesOrMarkers = 'lines');
      // plotly type for time-series == scattergl
      selectedGraphObj.data[0].type = 'scattergl';
    }

    if (!isSelectedGraphChange) {
      // We don't need to reset because we're changing to an entirely different graph
      this.resetLayoutRelatedData(selectedGraphObj);
      // reset series any added series related data
      let graphType = selectedGraphObj.data[0].type;
      selectedGraphObj.data = this.visualizeService.getEmptyGraphData();
      selectedGraphObj.data[0].type = graphType;
      selectedGraphObj.selectedYAxisDataOptions = [selectedGraphObj.selectedYAxisDataOptions[0]];
    }

    if (validSelection) {
      this.setGraphData(selectedGraphObj);
    } else {
      // graph data unchanged, message state set above
      this.saveExistingPlotChange(selectedGraphObj, false);
    }
  }

  checkBarHistogramData(selectedGraphObj: GraphObj) {
    if (typeof selectedGraphObj.selectedXAxisDataOption.data[0] === 'number' && (selectedGraphObj.binnedField == undefined || selectedGraphObj.binnedField.fieldName != selectedGraphObj.selectedXAxisDataOption.dataField.fieldName || selectedGraphObj.bins == undefined)) {
      selectedGraphObj = this.initializeBinData(selectedGraphObj);
    }
  }

  setSelectedYAxisDataOption(selectedGraphObj: GraphObj) {
    this.resetYAxisRelatedData(selectedGraphObj);
    let tmpSelectedYAxisDataOptions = new Array();
    selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      if (option.dataOption) {
        //check still exists after updating y axis options
        let testOptionExists = selectedGraphObj.yAxisDataOptions.find(yAxisOption => { return yAxisOption.dataField.fieldName == option.dataOption.dataField.fieldName });
        if (testOptionExists) {
          //set to current option value for data binding
          option.dataOption = testOptionExists;
          tmpSelectedYAxisDataOptions.push(option);
        }
      }
    });

    if (tmpSelectedYAxisDataOptions.length != 0) {
      selectedGraphObj.selectedYAxisDataOptions = tmpSelectedYAxisDataOptions;
    } else {
      let defaultColor: string = '#351e76';
      let defaultMarkerType: string = selectedGraphObj.isTimeSeries? 'lines' : 'markers';
      selectedGraphObj.selectedYAxisDataOptions = [{
        index: 0,
        dataOption: selectedGraphObj.yAxisDataOptions[0],
        seriesColor: defaultColor,
        seriesName: this.getSeriesName(selectedGraphObj.yAxisDataOptions[0].dataField),
        yaxis: 'y',
        linesOrMarkers: defaultMarkerType
      }];
    }
  }


  setTimeSeriesData(selectedGraphObj: GraphObj) {
    let index: number = 0;
    selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      // already called in setYAxisDataOptions
      let timeData: Array<string | number> = this.visualizeService.getTimeSeriesData(option.dataOption.dataField);
      if (timeData) {
        selectedGraphObj.data[index].x = timeData;
        selectedGraphObj.data[index].mode = 'lines'
      } else {
        //delete if no time data
        selectedGraphObj.data.splice(index, 1);
        selectedGraphObj.selectedYAxisDataOptions.splice(index, 1);
      }
      index++;
    });
    this.saveGraphDataChange(selectedGraphObj);
  }


  setXAxisDataOptions(selectedGraphObj: GraphObj) {
    let dataFields: Array<LogToolField> = this.visualizeService.getDataFieldOptions();
    let canRunDayTypeAnalysis: boolean = this.logToolDataService.explorerData.getValue().canRunDayTypeAnalysis;
    if (selectedGraphObj.isTimeSeries && canRunDayTypeAnalysis) {
      dataFields.push({
        fieldName: 'Time Series',
        alias: 'Time Series',
        useField: true,
        isDateField: true,
        unit: 'time',
        invalidField: false,
        csvId: undefined,
        csvName: undefined,
        fieldId: undefined
      });
    }
    selectedGraphObj.xAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let data = this.visualizeService.getGraphDataByField(field.fieldName);
      selectedGraphObj.xAxisDataOptions.push({
        data: data,
        dataField: field
      });
    });
  }


  // * called on graph init and user select change event
  setSelectedXAxisDataOption(selectedGraphObj: GraphObj) {
    this.setDefaultSelectedXAxis(selectedGraphObj);
    if (selectedGraphObj.isTimeSeries) {
      selectedGraphObj.layout.xaxis.type = 'date';
      this.setYAxisDataOptions(selectedGraphObj);
      this.setTimeSeriesData(selectedGraphObj);
    } else if (selectedGraphObj.data[0].type == 'bar') {
      let validSelection = typeof selectedGraphObj.selectedXAxisDataOption.data[0] === 'number'; 
      if (validSelection) {
        selectedGraphObj.layout.xaxis.type = 'category';
        this.setYAxisDataOptions(selectedGraphObj);
        this.setBarHistogramData(selectedGraphObj);
        selectedGraphObj.invalidState = undefined;
      } else {
        selectedGraphObj.invalidState = 'invalid-data-selected';
        this.saveExistingPlotChange(selectedGraphObj, false);
      }
    } else {
      selectedGraphObj.data.map(series => {
        series.type = 'scattergl'
      });
      selectedGraphObj.layout.xaxis.type = 'linear';
      selectedGraphObj.data.forEach(dataItem => {
        dataItem.x = selectedGraphObj.selectedXAxisDataOption.data;
      });
      this.setYAxisDataOptions(selectedGraphObj);
      this.setGraphYAxisData(selectedGraphObj);
    }
  }

    // * reset to avoid annotations/custom layout showing on incorrect axis
  resetLayoutRelatedData(selectedGraphObj: GraphObj) {
    this.visualizeService.annotateDataPoint.next(undefined);
    selectedGraphObj.layout.annotations = [];
    selectedGraphObj.layout.yaxis.ticksuffix = '';
    
    selectedGraphObj.layout.autosize = true;
    selectedGraphObj.layout.xaxis.autorange = true;
    selectedGraphObj.layout.yaxis.autorange = true;
    selectedGraphObj.layout.yaxis2.autorange = true;
  }

  resetYAxisRelatedData(selectedGraphObj: GraphObj) {
    selectedGraphObj.layout.yaxis.ticksuffix = '';
  }

  setDefaultSelectedXAxis(selectedGraphObj: GraphObj) {
    if (selectedGraphObj.selectedXAxisDataOption && selectedGraphObj.selectedXAxisDataOption.dataField) {
      //check still exists after updating x axis options
      // 6040 was this for multiple file/column compares restriction?
      let testOptionExists = selectedGraphObj.xAxisDataOptions.find(option => { return selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == option.dataField.fieldName });
      if (testOptionExists) {
        selectedGraphObj.selectedXAxisDataOption = testOptionExists;
      } else {
        selectedGraphObj.selectedXAxisDataOption = selectedGraphObj.xAxisDataOptions[0];
      }
    } else {
      selectedGraphObj.selectedXAxisDataOption = selectedGraphObj.xAxisDataOptions[0];
    }
  }

  setYAxisDataOptions(selectedGraphObj: GraphObj) {
    let dataFields: Array<LogToolField> = this.visualizeService.getDataFieldOptions();
    selectedGraphObj.yAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let yAxisOption: XAxisDataOption;
      let yData: (string | number)[];
      if (selectedGraphObj.isTimeSeries) {
        let timeData: Array<string | number> = this.visualizeService.getTimeSeriesData(field);
        if (timeData) {
          yData = this.visualizeService.getGraphDataByField(field.fieldName);
        }
      }
      else if (selectedGraphObj.data[0].type == 'scattergl') {
        yData = this.visualizeService.getGraphDataByField(field.fieldName);
      }
      yAxisOption = {
        data: yData,
        dataField: field
      }
      selectedGraphObj.yAxisDataOptions.push(yAxisOption);
    });
    selectedGraphObj.selectedYAxisDataOptions.forEach(selectedOption => {
      let optionFound: XAxisDataOption;
      if (selectedOption.dataOption) {
      optionFound = selectedGraphObj.yAxisDataOptions.find(option => { 
          return option.dataField.fieldName == selectedOption.dataOption.dataField.fieldName 
        });
      }
      if (optionFound) {
        selectedOption.dataOption = optionFound;
      }
    });
  }

  setGraphYAxisData(selectedGraphObj: GraphObj, shouldRenderGraph?: boolean) {
    selectedGraphObj.selectedYAxisDataOptions.forEach((selectedDataOption, index) => {
      if (selectedGraphObj.data[index]) {
        if (selectedGraphObj.isTimeSeries) {
          let timeData: Array<string | number> = this.visualizeService.getTimeSeriesData(selectedDataOption.dataOption.dataField);
          if (timeData) {
            selectedGraphObj.data[index].x = timeData;
            selectedGraphObj.data[index].mode = selectedDataOption.linesOrMarkers;
          }
        } else {
          // Lines not a valid mode for non-time series
          selectedGraphObj.data[index].mode = 'markers';
          selectedDataOption.linesOrMarkers = 'markers';
        }
        selectedGraphObj.isTimeSeries = selectedGraphObj.isTimeSeries;
        selectedGraphObj = this.visualizeService.setDefaultGraphInteractivity(selectedGraphObj, selectedGraphObj.data[index].x.length);
        selectedGraphObj.data[index].y = selectedDataOption.dataOption.data;
        selectedGraphObj.data[index].name = selectedDataOption.seriesName;
        selectedGraphObj.data[index].dataSeriesId = Math.random().toString(36).substr(2, 9);
        selectedGraphObj.data[index].marker.color = selectedDataOption.seriesColor;
        selectedGraphObj.data[index].line.color = selectedDataOption.seriesColor;
        selectedGraphObj.data[index].yaxis = selectedDataOption.yaxis;
      }
    })
    if (shouldRenderGraph) {
      this.saveGraphDataChange(selectedGraphObj);
      this.visualizeService.shouldRenderGraph.next(true)
    } else {
      this.saveGraphDataChange(selectedGraphObj);
    }
  }

  setBarChartDataOptions(selectedGraphObj: GraphObj, shouldRenderGraph?: boolean) {
    selectedGraphObj.layout.xaxis.type = 'category';
    this.setXAxisDataOptions(selectedGraphObj);
    if (selectedGraphObj.selectedXAxisDataOption && selectedGraphObj.selectedXAxisDataOption.dataField) {
      //check still exists
      let testExists = selectedGraphObj.xAxisDataOptions.find(option => { return selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == option.dataField.fieldName });
      if (testExists) {
        selectedGraphObj.selectedXAxisDataOption = testExists;
      } else {
        selectedGraphObj.selectedXAxisDataOption = selectedGraphObj.xAxisDataOptions[0];
      }
    } else {
      selectedGraphObj.selectedXAxisDataOption = selectedGraphObj.xAxisDataOptions[0];
    }
    if (selectedGraphObj.usePercentForBins) {
      selectedGraphObj.layout.yaxis.ticksuffix = '%';
    } else {
      selectedGraphObj.layout.yaxis.ticksuffix = '';
    }
    this.setBarHistogramData(selectedGraphObj, shouldRenderGraph);
  }

  setBarHistogramData(selectedGraphObj: GraphObj, shouldRenderGraph?: boolean) {
    if (selectedGraphObj.useStandardDeviation == true && selectedGraphObj.bins.length != 0) {
      //get std deviation
      let stdDeviationBarData = this.visualizeService.getStandardDevBarChartData(selectedGraphObj.selectedXAxisDataOption.dataField, selectedGraphObj.usePercentForBins, selectedGraphObj.bins[0].min);
      //set data
      selectedGraphObj.data[0].x = stdDeviationBarData.xLabels;
      selectedGraphObj.data[0].y = stdDeviationBarData.yValues;
    } else {
      //get bin size data
      let binsData = this.visualizeService.getNumberOfBinsBarChartData(selectedGraphObj.selectedXAxisDataOption.dataField, selectedGraphObj.bins, selectedGraphObj.usePercentForBins);
      selectedGraphObj.data[0].x = binsData.xLabels;
      selectedGraphObj.data[0].y = binsData.yValues;
    }
    selectedGraphObj.data[0].yaxis = 'y';
    //set to first value for bar charts
    selectedGraphObj.data = [selectedGraphObj.data[0]];
    selectedGraphObj.selectedYAxisDataOptions = [selectedGraphObj.selectedYAxisDataOptions[0]];

    if (shouldRenderGraph) {
      this.saveGraphDataChange(selectedGraphObj);
      this.visualizeService.shouldRenderGraph.next(true)
    } else {
      this.saveGraphDataChange(selectedGraphObj);
    }
  }

  removeAxis(selectedGraphObj: GraphObj, shouldRender?: boolean) {
    selectedGraphObj.hasSecondYAxis = false;
    selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      option.yaxis = 'y';
    });
    this.setGraphYAxisData(selectedGraphObj, shouldRender);
  }

  addDataSeries(selectedGraphObj: GraphObj) {
    let currentSelections: Array<string> = selectedGraphObj.selectedYAxisDataOptions.map(option => { return option.dataOption.dataField.fieldName });
    let unusedSelections: Array<{ dataField: LogToolField }> = JSON.parse(JSON.stringify(selectedGraphObj.yAxisDataOptions))
    _.remove(unusedSelections, (option) => { return currentSelections.includes(option.dataField.fieldName) });
    // Easier way to do above?
    let dataOption;
    if (unusedSelections.length != 0) {
      dataOption = selectedGraphObj.yAxisDataOptions.find(dataOption => { return dataOption.dataField.fieldName == unusedSelections[0].dataField.fieldName });
    } else {
      dataOption = selectedGraphObj.yAxisDataOptions.find(dataOption => { return dataOption.dataField.fieldName == selectedGraphObj.selectedYAxisDataOptions[0].dataOption.dataField.fieldName });
    }
    selectedGraphObj.selectedYAxisDataOptions.push({
      index: selectedGraphObj.selectedYAxisDataOptions.length,
      dataOption: dataOption,
      seriesName: this.getSeriesName(dataOption.dataField),
      seriesColor: graphColors[selectedGraphObj.selectedYAxisDataOptions.length],
      yaxis: 'y',
      linesOrMarkers: selectedGraphObj.data[0].mode
    });
    selectedGraphObj.data.push(JSON.parse(JSON.stringify(selectedGraphObj.data[0])));
    this.setGraphYAxisData(selectedGraphObj);
  }

  removeYAxisData(index: number, selectedGraphObj: GraphObj) {
    this.logToolDataService.loadingSpinner.next({
      show: true, msg: `Graphing Data. This may take a moment
        depending on the amount of data you have supplied...`});
    setTimeout(() => {
      let removeDataSeriesId: string = selectedGraphObj.data[index].dataSeriesId;
      selectedGraphObj.selectedYAxisDataOptions.splice(index, 1);
      selectedGraphObj.data.splice(index, 1);
      if (selectedGraphObj.data.length == 1 && selectedGraphObj.hasSecondYAxis == true) {
        this.removeAxis(selectedGraphObj, true);
      } else {
        selectedGraphObj.layout.annotations.forEach((annotation: AnnotationData) => {
          if (annotation.dataSeriesId === removeDataSeriesId) {
            this.deleteAnnotation(annotation, selectedGraphObj);
          }
        });
        this.setGraphYAxisData(selectedGraphObj, true);
      }
    }, 100);

  }

  setAnnotation(annotateDataPoint: AnnotationData, selectedGraphObj: GraphObj) {
    if (!selectedGraphObj.layout.annotations && annotateDataPoint.text) {
      selectedGraphObj.layout.annotations = [annotateDataPoint];
    } else {
      let testExistIndex: number = selectedGraphObj.layout.annotations.findIndex(annotation => { return annotation.annotationId == annotateDataPoint.annotationId });
      if (testExistIndex != -1) {
        if (annotateDataPoint.text) {
          selectedGraphObj.layout.annotations[testExistIndex] = annotateDataPoint;
        } else {
          this.deleteAnnotation(annotateDataPoint, selectedGraphObj);
        }
      } else if (annotateDataPoint.text) {
        selectedGraphObj.layout.annotations.push(annotateDataPoint);
      }
    }

    this.saveUserInputChange(selectedGraphObj);
    
  }
  
  deleteAnnotation(annotation: AnnotationData, selectedGraphObj: GraphObj) {
    _.remove(selectedGraphObj.layout.annotations, (currentAnnotation) => { return currentAnnotation.annotationId == annotation.annotationId });
    this.saveExistingPlotChange(selectedGraphObj, true);
  }

  getSeriesName(logToolField: LogToolField): string {
    let seriesName: string = logToolField.alias;
    if (logToolField.unit) {
      seriesName = seriesName + ' (' + logToolField.unit + ')';
    }
    return seriesName;
  }

  initializeBinData(selectedGraphObj: GraphObj): GraphObj {
    selectedGraphObj.binnedField = selectedGraphObj.selectedXAxisDataOption.dataField;
    selectedGraphObj.binSize = this.visualizeService.getStandardDevBarChartData(selectedGraphObj.binnedField, selectedGraphObj.usePercentForBins, undefined).standardDeviation;
    selectedGraphObj.binSize = Number((selectedGraphObj.binSize).toFixed(0));
    selectedGraphObj = this.setBins(selectedGraphObj);
    selectedGraphObj.numberOfBins = selectedGraphObj.bins.length;
    return selectedGraphObj;
  }

  setNumberOfBins(selectedGraphObj: GraphObj, setLowerBound?: number): GraphObj {
    let lowerBound: number;
    if (setLowerBound != undefined) {
      lowerBound = setLowerBound;
    } else {
      lowerBound = Number(_.min(selectedGraphObj.selectedXAxisDataOption.data));
    }
    let maxValue = Number(_.max(selectedGraphObj.selectedXAxisDataOption.data));
    let diff: number = maxValue - lowerBound;
    selectedGraphObj.binSize = Number((diff / selectedGraphObj.numberOfBins).toFixed(0));
    selectedGraphObj = this.setBins(selectedGraphObj);
    return selectedGraphObj;
  }

  setBins(selectedGraphObj: GraphObj, setLowerBound?: number): GraphObj {
    let lowerBound: number;
    if (setLowerBound != undefined) {
      lowerBound = setLowerBound;
    } else {
      lowerBound = Number(_.min(selectedGraphObj.selectedXAxisDataOption.data));
    }
    selectedGraphObj.bins = new Array();
    let maxValue = Number(_.max(selectedGraphObj.selectedXAxisDataOption.data));

    // todo 7573 Bug ' bin size out of range' - cannot reproduce, adding logging below 
    console.log('maxValue', maxValue);
    console.log('binlength', selectedGraphObj.bins.length);
    console.log('binSize', selectedGraphObj.binSize);
    console.log('starting maxValue, lowerbound', maxValue, lowerBound);

    if (selectedGraphObj.binningMethod == 'binSize') {
      try {
        for (lowerBound; lowerBound <= maxValue; lowerBound += selectedGraphObj.binSize) {
          selectedGraphObj.bins.push({
            min: Math.floor(lowerBound),
            max: Math.floor(lowerBound + selectedGraphObj.binSize)
          })
        };
      } catch (e) {
        console.error(e);
        console.log('error maxValue, lowerbound', maxValue, lowerBound);
        console.log('error binlength', selectedGraphObj.bins.length);
      }
      selectedGraphObj.numberOfBins = selectedGraphObj.bins.length;
    } else {
      for (let binNum = 0; binNum < selectedGraphObj.numberOfBins; binNum++) {
        selectedGraphObj.bins.push({
          min: Math.floor(lowerBound),
          max: Math.floor(lowerBound + selectedGraphObj.binSize)
        });
        lowerBound += selectedGraphObj.binSize;
      };
    }
    return selectedGraphObj;
  }
}
