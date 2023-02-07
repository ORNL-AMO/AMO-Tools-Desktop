import { Injectable } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { GraphObj, LogToolField, AnnotationData, GraphDataOption } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';

@Injectable()
export class VisualizeMenuService {
  selectedGraphObj: any;
  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService) { }

  saveUserGraphOptionsChange(userGraphOptionsGraph: GraphObj) {
    this.visualizeService.userInputDelay.next(175);
    this.visualizeService.userGraphOptions.next(userGraphOptionsGraph);
  }

  save(selectedGraphObj: GraphObj) {
    this.visualizeService.userInputDelay.next(0);
    this.visualizeService.selectedGraphObj.next(selectedGraphObj);
  }

  setGraphType(selectedGraphObj: GraphObj) {
    if (selectedGraphObj.data[0].type == 'scattergl') {
      this.setScatterGraphDataOptions(selectedGraphObj);
    } else if (selectedGraphObj.data[0].type == 'bar') {
      this.setBarChartDataOptions(selectedGraphObj);
    }
  }

  setScatterGraphDataOptions(selectedGraphObj: GraphObj) {
    this.setXAxisDataOptions(selectedGraphObj);
    this.setSelectedXAxisDataOption(selectedGraphObj);

    this.setSelectedYAxisDataOption(selectedGraphObj);
    this.setGraphYAxisData(selectedGraphObj);
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
      } {
        // 6040 no dataOption.. When is this??
      }
    });

    if (tmpSelectedYAxisDataOptions.length != 0) {
      selectedGraphObj.selectedYAxisDataOptions = tmpSelectedYAxisDataOptions;
    } else {
      selectedGraphObj.selectedYAxisDataOptions = [{
        index: 0,
        dataOption: selectedGraphObj.yAxisDataOptions[0],
        seriesColor: graphColors[0],
        seriesName: this.getSeriesName(selectedGraphObj.yAxisDataOptions[0].dataField),
        yaxis: 'y',
        linesOrMarkers: 'markers'
      }];
    }
  }


  setTimeSeriesData(selectedGraphObj: GraphObj) {
    let index: number = 0;
    selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      // already called in setYAxisDataOptions
      let timeData: Array<string | number> = this.visualizeService.getTimeSeriesData(option.dataOption.dataField);
      if (timeData) {
        // timeData will have overlapping values - i.e. 3 datasets with same time logs concatenated together
        // Should this go in getAxisOptionGraphData?
        // let uniqueDates: Set<string | number> = new Set(timeData);
        // timeData = Array.from(uniqueDates);
        selectedGraphObj.data[index].x = timeData;
        selectedGraphObj.data[index].mode = 'lines'
      } else {
        //delete if no time data
        selectedGraphObj.data.splice(index, 1);
        selectedGraphObj.selectedYAxisDataOptions.splice(index, 1);
      }
      index++;
    });
    this.save(selectedGraphObj);
  }


  setXAxisDataOptions(selectedGraphObj: GraphObj) {
    let dataFields: Array<LogToolField> = this.visualizeService.getDataFieldOptions();
    let canRunDayTypeAnalysis: boolean = this.logToolDataService.explorerData.getValue().canRunDayTypeAnalysis;
    if (selectedGraphObj.data[0].type == 'scattergl' && canRunDayTypeAnalysis) {
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


  setSelectedXAxisDataOption(selectedGraphObj: GraphObj) {
    this.setDefaultSelectedXAxis(selectedGraphObj);
    this.resetXAxisRelatedData(selectedGraphObj);

    if (selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == 'Time Series') {
      selectedGraphObj.layout.xaxis.type = 'date';
      this.setYAxisDataOptions(selectedGraphObj);
      this.setTimeSeriesData(selectedGraphObj);
    } else if (selectedGraphObj.data[0].type == 'bar') {
      selectedGraphObj.layout.xaxis.type = 'category';
      this.setYAxisDataOptions(selectedGraphObj);
      this.setBarHistogramData(selectedGraphObj);
    } else {
      selectedGraphObj.layout.xaxis.type = 'linear';
      selectedGraphObj.data.forEach(dataItem => {
        dataItem.x = selectedGraphObj.selectedXAxisDataOption.data;
      });
      this.setYAxisDataOptions(selectedGraphObj);
      this.setGraphYAxisData(selectedGraphObj);
    }
  }

  resetXAxisRelatedData(selectedGraphObj: GraphObj) {
    selectedGraphObj.layout.yaxis.ticksuffix = '';
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
      if (selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == 'Time Series') {
        let timeData: Array<string | number> = this.visualizeService.getTimeSeriesData(field);
        if (timeData) {
          let data: (string | number)[]  = this.visualizeService.getGraphDataByField(field.fieldName);
          selectedGraphObj.yAxisDataOptions.push({
            data: data,
            dataField: field
          });
        }
      }
      else if (selectedGraphObj.data[0].type == 'scattergl') {
        let data = this.visualizeService.getGraphDataByField(field.fieldName);
        let yAxisOption: GraphDataOption = {
          data: data,
          dataField: field
        }
        selectedGraphObj.yAxisDataOptions.push(yAxisOption);
      }
    });
    //set selected option to new option array for select menus
    selectedGraphObj.selectedYAxisDataOptions.forEach(selectedOption => {
      let findOption = selectedGraphObj.yAxisDataOptions.find(option => { return option.dataField.fieldName == selectedOption.dataOption.dataField.fieldName });
      selectedOption.dataOption = findOption;
    });

  }

  setGraphYAxisData(selectedGraphObj: GraphObj) {
    let index: number = 0;
    selectedGraphObj.selectedYAxisDataOptions.forEach(selectedDataOption => {
      selectedGraphObj.data[index].mode = selectedDataOption.linesOrMarkers;
      if (selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == 'Time Series') {
        let timeData: Array<string | number> = this.visualizeService.getTimeSeriesData(selectedDataOption.dataOption.dataField);
        if (timeData) {
          selectedGraphObj.data[index].x = timeData;
          selectedGraphObj.data[index].mode = 'lines'
        }
      } 
      // Restrict if selected axis data from another file
      // else if (selectedDataOption.dataOption.dataField.csvId != selectedGraphObj.selectedXAxisDataOption.dataField.csvId) {
      //   selectedDataOption.dataOption = selectedGraphObj.yAxisDataOptions[0];
      //   selectedDataOption.seriesName = this.getSeriesName(selectedGraphObj.yAxisDataOptions[0].dataField);
      // }
      else {
        // Lines not a valid mode for non-time series
        selectedDataOption.linesOrMarkers = 'markers';
      }
      selectedGraphObj.isTimeSeries = selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == 'Time Series';
      selectedGraphObj = this.visualizeService.setDefaultGraphInteractivity(selectedGraphObj, selectedGraphObj.data[index].x.length);
      selectedGraphObj.data[index].y = selectedDataOption.dataOption.data;
      selectedGraphObj.data[index].name = selectedDataOption.seriesName;
      selectedGraphObj.data[index].dataSeriesId = Math.random().toString(36).substr(2, 9);
      selectedGraphObj.data[index].marker.color = selectedDataOption.seriesColor;
      selectedGraphObj.data[index].line.color = selectedDataOption.seriesColor;
      selectedGraphObj.data[index].yaxis = selectedDataOption.yaxis;
      index++;
    })
    this.save(selectedGraphObj);
  }

  setBarChartDataOptions(selectedGraphObj: GraphObj) {
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
    this.setBarHistogramData(selectedGraphObj);
  }

  setBarHistogramData(selectedGraphObj: GraphObj) {
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
    this.save(selectedGraphObj);
  }

  addAxis(selectedGraphObj: GraphObj) {
    selectedGraphObj.hasSecondYAxis = true;
    this.save(selectedGraphObj);
  }

  removeAxis(selectedGraphObj: GraphObj) {
    selectedGraphObj.hasSecondYAxis = false;
    selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      option.yaxis = 'y';
    });
    this.setGraphYAxisData(selectedGraphObj);
  }

  addData(selectedGraphObj: GraphObj) {
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
    let removeDataSeriesId: string = selectedGraphObj.data[index].dataSeriesId;
    selectedGraphObj.selectedYAxisDataOptions.splice(index, 1);
    selectedGraphObj.data.splice(index, 1);
    if (selectedGraphObj.data.length == 1 && selectedGraphObj.hasSecondYAxis == true) {
      this.removeAxis(selectedGraphObj);
    } else {
      selectedGraphObj.layout.annotations.forEach((annotation: AnnotationData) => {
        if (annotation.dataSeriesId === removeDataSeriesId) {
          this.deleteAnnotation(annotation, selectedGraphObj);
        }
      });
      this.setGraphYAxisData(selectedGraphObj);
    }
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
    
    this.saveUserGraphOptionsChange(selectedGraphObj);
  }

  deleteAnnotation(annotation: AnnotationData, selectedGraphObj: GraphObj) {
    _.remove(selectedGraphObj.layout.annotations, (currentAnnotation) => { return currentAnnotation.annotationId == annotation.annotationId });
    this.saveUserGraphOptionsChange(selectedGraphObj);
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
    if (selectedGraphObj.binningMethod == 'binSize') {
      for (lowerBound; lowerBound <= maxValue; lowerBound += selectedGraphObj.binSize) {
        selectedGraphObj.bins.push({
          min: Math.floor(lowerBound),
          max: Math.floor(lowerBound + selectedGraphObj.binSize)
        })
      };
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
