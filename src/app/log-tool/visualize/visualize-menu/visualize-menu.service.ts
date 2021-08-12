import { Injectable } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { GraphObj, LogToolField, AnnotationData } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { LogToolService } from '../../log-tool.service';
@Injectable()
export class VisualizeMenuService {
  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService, private logToolService: LogToolService) { }

  save(selectedGraphObj: GraphObj) {
    this.visualizeService.selectedGraphObj.next(selectedGraphObj);
  }

  setGraphType(selectedGraphObj: GraphObj) {
    if (selectedGraphObj.data[0].type == 'scattergl') {
      this.setScatterPlotType(selectedGraphObj);
    } else if (selectedGraphObj.data[0].type == 'bar') {
      this.setBarChartType(selectedGraphObj);
    }
  }

  setScatterPlotType(selectedGraphObj: GraphObj) {
    this.setXAxisDataOptions(selectedGraphObj);
    if (selectedGraphObj.selectedXAxisDataOption && selectedGraphObj.selectedXAxisDataOption.dataField) {
      //check still exists after updating x axis options
      let testOptionExists = selectedGraphObj.xAxisDataOptions.find(option => { return selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == option.dataField.fieldName });
      if (testOptionExists) {
        selectedGraphObj.selectedXAxisDataOption = testOptionExists;
      } else {
        selectedGraphObj.selectedXAxisDataOption = selectedGraphObj.xAxisDataOptions[0];
      }
    } else {
      selectedGraphObj.selectedXAxisDataOption = selectedGraphObj.xAxisDataOptions[0];
    }
    this.setXAxisDataOption(selectedGraphObj);
    this.setYAxisDataOptions(selectedGraphObj);
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
      this.setDefaultYAxisDataOptions(selectedGraphObj);
    }
    selectedGraphObj.layout.yaxis.ticksuffix = '';
    this.setYAxisData(selectedGraphObj);
  }

  setDefaultYAxisDataOptions(selectedGraphObj: GraphObj) {
    selectedGraphObj.selectedYAxisDataOptions = [{
      index: 0,
      dataOption: selectedGraphObj.yAxisDataOptions[0],
      seriesColor: graphColors[0],
      seriesName: this.getSeriesName(selectedGraphObj.yAxisDataOptions[0].dataField),
      yaxis: 'y',
      linesOrMarkers: 'markers'
    }];
  }

  setTimeSeriesData(selectedGraphObj: GraphObj) {
    let index: number = 0;
    selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      let timeData: Array<string | number> = this.visualizeService.getVisualizeDateData(option.dataOption.dataField);
      //if found set time data
      if (timeData) {
        selectedGraphObj.data[index].x = timeData;
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
    let dataFields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
    let noDayTypeAnalysis: boolean = this.logToolService.noDayTypeAnalysis.getValue();
    if (selectedGraphObj.data[0].type == 'scattergl' && noDayTypeAnalysis == false) {
      dataFields.push({
        fieldName: 'Time Series',
        alias: 'Time Series',
        useField: true,
        isDateField: true,
        unit: 'time',
        invalidField: false,
        csvId: undefined,
        csvName: undefined
      })
    }
    selectedGraphObj.xAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let data = this.visualizeService.getVisualizeData(field.fieldName);
      selectedGraphObj.xAxisDataOptions.push({
        data: data,
        dataField: field
      })
    });
  }


  setXAxisDataOption(selectedGraphObj: GraphObj) {
    selectedGraphObj.layout.annotations = [];
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
      this.setYAxisData(selectedGraphObj);
    }
  }

  setBarChartType(selectedGraphObj: GraphObj) {
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
    if (selectedGraphObj.useStandardDeviation == true) {
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

  setYAxisDataOptions(selectedGraphObj: GraphObj) {
    let dataFields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
    selectedGraphObj.yAxisDataOptions = new Array();
    dataFields.forEach(field => {
      //check can add
      //bar doesn't matter
      //time series, only with time data
      if (selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == 'Time Series') {
        //if time data exists add
        let timeData: Array<string | number> = this.visualizeService.getVisualizeDateData(field);
        if (timeData) {
          let data = this.visualizeService.getVisualizeData(field.fieldName);
          selectedGraphObj.yAxisDataOptions.push({
            data: data,
            dataField: field
          });
        }
      }
      //scatter add with corresponding csv options
      else if (selectedGraphObj.data[0].type == 'scattergl' && selectedGraphObj.selectedXAxisDataOption.dataField.csvId == field.csvId) {
        let data = this.visualizeService.getVisualizeData(field.fieldName);
        selectedGraphObj.yAxisDataOptions.push({
          data: data,
          dataField: field
        });
      }
    });
    //set selected option to new option array for select menus
    selectedGraphObj.selectedYAxisDataOptions.forEach(selectedOption => {
      let findOption = selectedGraphObj.yAxisDataOptions.find(option => { return option.dataField.fieldName == selectedOption.dataOption.dataField.fieldName });
      selectedOption.dataOption = findOption;
    });
  }

  setYAxisData(selectedGraphObj: GraphObj) {
    let index: number = 0;
    selectedGraphObj.selectedYAxisDataOptions.forEach(selectedDataOption => {
      if (selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == 'Time Series') {
        let timeData: Array<string | number> = this.visualizeService.getVisualizeDateData(selectedDataOption.dataOption.dataField);
        if (timeData) {
          selectedGraphObj.data[index].x = timeData;
        }
      } else if (selectedDataOption.dataOption.dataField.csvId != selectedGraphObj.selectedXAxisDataOption.dataField.csvId) {
        selectedDataOption.dataOption = selectedGraphObj.yAxisDataOptions[0]
        selectedDataOption.seriesName = this.getSeriesName(selectedGraphObj.yAxisDataOptions[0].dataField);
      }
      selectedGraphObj.data[index].y = selectedDataOption.dataOption.data;
      selectedGraphObj.data[index].name = selectedDataOption.seriesName;
      selectedGraphObj.data[index].marker.color = selectedDataOption.seriesColor;
      selectedGraphObj.data[index].line.color = selectedDataOption.seriesColor;
      selectedGraphObj.data[index].yaxis = selectedDataOption.yaxis;
      selectedGraphObj.data[index].mode = selectedDataOption.linesOrMarkers;
      index++;
    })
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
    this.setYAxisData(selectedGraphObj);
  }

  addData(selectedGraphObj: GraphObj) {
    let currentSelections: Array<string> = selectedGraphObj.selectedYAxisDataOptions.map(option => { return option.dataOption.dataField.fieldName });
    let unusedSelections: Array<{ dataField: LogToolField }> = JSON.parse(JSON.stringify(selectedGraphObj.yAxisDataOptions))
    _.remove(unusedSelections, (option) => { return currentSelections.includes(option.dataField.fieldName) });
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
    this.setYAxisData(selectedGraphObj);
  }

  removeYAxisData(index: number, selectedGraphObj: GraphObj) {
    selectedGraphObj.selectedYAxisDataOptions.splice(index, 1);
    selectedGraphObj.data.splice(index, 1);
    if (selectedGraphObj.data.length == 1 && selectedGraphObj.hasSecondYAxis == true) {
      this.removeAxis(selectedGraphObj);
    } else {
      this.setYAxisData(selectedGraphObj);
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
    this.save(selectedGraphObj);
  }

  deleteAnnotation(annotation: AnnotationData, selectedGraphObj: GraphObj) {
    _.remove(selectedGraphObj.layout.annotations, (currentAnnotation) => { return currentAnnotation.annotationId == annotation.annotationId });
    this.save(selectedGraphObj);
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
