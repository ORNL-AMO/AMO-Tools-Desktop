import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolField, GraphObj } from '../../log-tool-models';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';

@Component({
  selector: 'app-visualize-menu',
  templateUrl: './visualize-menu.component.html',
  styleUrls: ['./visualize-menu.component.css']
})
export class VisualizeMenuComponent implements OnInit {

  graphTypes: Array<{ label: string, value: string }> = [
    { value: 'scattergl', label: 'Scatter Plot' },
    { value: 'bar', label: 'Histogram' }
  ]

  selectedGraphObj: GraphObj;
  xAxisDataOptions: Array<{
    dataField: LogToolField,
    data: Array<number | string>
  }>;
  yAxisDataOptions: Array<{
    dataField: LogToolField,
    data: Array<number | string>
  }>

  yAxisOptions: Array<{ axis: string, label: string }> = [{ axis: 'y', label: 'Left' }, { axis: 'y2', label: 'Right' }];
  histogramMethod: string = 'stdDeviation';
  selectedGraphObjSub: Subscription;
  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService) { }


  ngOnInit() {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      if (this.selectedGraphObj == undefined || val.graphId != this.selectedGraphObj.graphId) {
        this.selectedGraphObj = val;
        this.setGraphType();
      }
    });
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  setGraphType() {
    if (this.selectedGraphObj.data[0].type == 'scattergl') {
      this.setScatterPlotType();
    } else if (this.selectedGraphObj.data[0].type == 'bar') {
      this.setBarChartType();
    }
  }

  setScatterPlotType() {
    // this.selectedGraphObj.layout.yaxis.title.text = 'Y Axis Label';
    this.setXAxisDataOptions();
    if (this.selectedGraphObj.selectedXAxisDataOption && this.selectedGraphObj.selectedXAxisDataOption.dataField) {
      //check still exists after updating x axis options
      let testOptionExists = this.xAxisDataOptions.find(option => { return this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == option.dataField.fieldName });
      if (testOptionExists) {
        this.selectedGraphObj.selectedXAxisDataOption = testOptionExists;
      } else {
        this.selectedGraphObj.selectedXAxisDataOption = this.xAxisDataOptions[0];
      }
    } else {
      this.selectedGraphObj.selectedXAxisDataOption = this.xAxisDataOptions[0];
    }
    this.setXAxisDataOption();
    this.setYAxisDataOptions();
    let tmpSelectedYAxisDataOptions = new Array();
    this.selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      if (option.dataOption) {
        //check still exists after updating y axis options
        let testOptionExists = this.yAxisDataOptions.find(yAxisOption => { return yAxisOption.dataField.fieldName == option.dataOption.dataField.fieldName });
        if (testOptionExists) {
          //set to current option value for data binding
          option.dataOption = testOptionExists;
          tmpSelectedYAxisDataOptions.push(option);
        }
      }
    });
    if (tmpSelectedYAxisDataOptions.length != 0) {
      this.selectedGraphObj.selectedYAxisDataOptions = tmpSelectedYAxisDataOptions;
    } else {
      this.setDefaultYAxisDataOptions();
    }
    this.setYAxisData();
  }

  setDefaultYAxisDataOptions() {
    this.selectedGraphObj.selectedYAxisDataOptions = [{ index: 0, dataOption: this.yAxisDataOptions[0], seriesColor: graphColors[0], seriesName: 'Series 1', yaxis: 'y' }];
  }

  setBarChartType() {
    this.selectedGraphObj.layout.xaxis.type = 'category';
    // this.selectedGraphObj.layout.yaxis.title.text = 'Number of Data Points';
    //start with only one (purge additional data series) 
    this.setXAxisDataOptions();
    if (this.selectedGraphObj.selectedXAxisDataOption && this.selectedGraphObj.selectedXAxisDataOption.dataField) {
      //check still exists
      let testExists = this.xAxisDataOptions.find(option => { return this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName == option.dataField.fieldName });
      if (testExists) {
        this.selectedGraphObj.selectedXAxisDataOption = testExists;
      } else {
        this.selectedGraphObj.selectedXAxisDataOption = this.xAxisDataOptions[0];
      }
    } else {
      this.selectedGraphObj.selectedXAxisDataOption = this.xAxisDataOptions[0];
    }
    this.setBarHistogramData();
  }

  setXAxisDataOptions() {
    let dataFields: Array<LogToolField>;
    if (this.selectedGraphObj.data[0].type == 'bar') {
      //no date
      dataFields = this.logToolDataService.getDataFieldOptions();
    } else {
      //includes dates
      dataFields = this.logToolDataService.getDataFieldOptionsWithDate();
    }
    this.xAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let data = this.visualizeService.getVisualizeData(field.fieldName);
      this.xAxisDataOptions.push({
        data: data,
        dataField: field
      })
    });
  }

  setXAxisDataOption() {
    if (this.selectedGraphObj.selectedXAxisDataOption.dataField.isDateField) {
      this.selectedGraphObj.layout.xaxis.type = 'date';
    } else {
      this.selectedGraphObj.layout.xaxis.type = 'category';
    }
    if (this.selectedGraphObj.data[0].type == 'bar') {
      this.setBarHistogramData();
    } else {
      this.selectedGraphObj.data[0].x = this.selectedGraphObj.selectedXAxisDataOption.data;
      this.saveChanges();
    }
  }

  setYAxisDataOptions() {
    let dataFields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
    this.yAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let data = this.visualizeService.getVisualizeData(field.fieldName);
      this.yAxisDataOptions.push({
        data: data,
        dataField: field
      })
    });
  }

  setYAxisData() {
    let index: number = 0;
    this.selectedGraphObj.selectedYAxisDataOptions.forEach(selectedDataOption => {
      this.selectedGraphObj.data[index].y = selectedDataOption.dataOption.data;
      this.selectedGraphObj.data[index].name = selectedDataOption.seriesName;
      this.selectedGraphObj.data[index].marker.color = selectedDataOption.seriesColor;
      this.selectedGraphObj.data[index].yaxis = selectedDataOption.yaxis
      index++;
    })
    this.saveChanges();
  }

  setTimeSeries() {
    if (this.selectedGraphObj.isTimeSeries) {
      //set x axis to time
    }
    this.saveChanges();
  }

  saveChanges() {
    this.visualizeService.selectedGraphObj.next(this.selectedGraphObj);
  }

  addData() {
    let dataOption = this.yAxisDataOptions.find(dataOption => { return dataOption.dataField.fieldName == this.selectedGraphObj.selectedYAxisDataOptions[0].dataOption.dataField.fieldName });
    this.selectedGraphObj.selectedYAxisDataOptions.push({
      index: this.selectedGraphObj.selectedYAxisDataOptions.length,
      dataOption: dataOption,
      seriesName: 'Series ' + (this.selectedGraphObj.selectedYAxisDataOptions.length + 1),
      seriesColor: graphColors[this.selectedGraphObj.selectedYAxisDataOptions.length],
      yaxis: 'y'
    });
    this.selectedGraphObj.data.push(JSON.parse(JSON.stringify(this.selectedGraphObj.data[0])));
    this.setYAxisData();
  }

  addAxis() {
    this.selectedGraphObj.hasSecondYAxis = true;
  }

  removeAxis() {
    this.selectedGraphObj.hasSecondYAxis = false;
    this.selectedGraphObj.selectedYAxisDataOptions.forEach(option => {
      option.yaxis = 'y';
    });
    this.setYAxisData();
  }

  setHistogramStdDeviation(bool: boolean) {
    this.selectedGraphObj.useStandardDeviation = bool;
    this.setBarHistogramData();
  }

  setBarHistogramData() {
    if (this.selectedGraphObj.useStandardDeviation == true) {
      //get std deviation
      let stdDeviationBarData = this.visualizeService.getStandardDevBarChartData(this.selectedGraphObj.selectedXAxisDataOption.dataField);
      //set data
      this.selectedGraphObj.data[0].x = stdDeviationBarData.xLabels;
      this.selectedGraphObj.data[0].y = stdDeviationBarData.yValues;
    } else {
      //get num bins data
      let binsData = this.visualizeService.getNumberOfBinsBarChartData(this.selectedGraphObj.selectedXAxisDataOption.dataField, this.selectedGraphObj.numberOfBins);
      this.selectedGraphObj.data[0].x = binsData.xLabels;
      this.selectedGraphObj.data[0].y = binsData.yValues;
    }
    //set to first value for bar charts
    this.selectedGraphObj.data = [this.selectedGraphObj.data[0]];
    this.selectedGraphObj.selectedYAxisDataOptions = [this.selectedGraphObj.selectedYAxisDataOptions[0]];
    this.saveChanges();
  }

  removeYAxisData(index: number) {
    this.selectedGraphObj.selectedYAxisDataOptions.splice(index, 1);
    this.selectedGraphObj.data.splice(index, 1);
    if (this.selectedGraphObj.data.length == 1 && this.selectedGraphObj.hasSecondYAxis == true) {
      this.selectedGraphObj.hasSecondYAxis = false;
    }
    this.setYAxisData();
  }
}
