import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import { GraphDataObj, LogToolField, GraphObj } from '../../log-tool-models';
import { measurementOptions } from '../../system-setup/clean-data/field-units-modal/field-unit-options';
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
  measurementOptions: Array<{ measure: string, display: string }>;
  unitOptions: Array<{ unit: any, display: string, displayUnit: string }>;
  selectedGraphObj: GraphObj;

  xAxisDataOptions: Array<{
    dataField: LogToolField,
    data: Array<number | string>
  }>;
  yAxisDataOptions: Array<{
    dataField: LogToolField,
    data: Array<number>
  }>

  selectedYAxisDataOptions: Array<{
    index: number,
    dataOption: {
      dataField: LogToolField,
      data: Array<number>
    },
    seriesColor: string,
    seriesName: string,
    yaxis: string
  }>

  yAxisOptions: Array<{ axis: string, label: string }> = [{ axis: 'y', label: 'Left' }, { axis: 'y2', label: 'Right' }];
  histogramMethod: string = 'stdDeviation';
  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService) { }


  ngOnInit() {
    this.measurementOptions = measurementOptions;
    this.unitOptions = new Array();
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    // console.time('set x axis')
    this.setXAxisDataOptions('scattergl');
    // console.timeEnd('set x axis')
    // console.time('set y axis');
    this.setYAxisDataOptions();
    // console.timeEnd('set y axis');
  }

  setXAxisDataOptions(graphType: string) {
    let dataFields: Array<LogToolField>;
    if (graphType == 'bar') {
      //no date
      dataFields = this.logToolDataService.getDataFieldOptions();
    } else {
      //includes dates
      dataFields = this.logToolDataService.getDataFieldOptionsWithDate();
    }
    this.xAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let data = this.logToolDataService.getAllFieldData(field.fieldName);
      this.xAxisDataOptions.push({
        data: data,
        dataField: field
      })
    });
    this.selectedGraphObj.selectedXAxisDataOption = this.xAxisDataOptions[0];
    this.setXAxisDataOption();
  }

  setXAxisDataOption() {
    this.selectedGraphObj.data[0].x = this.selectedGraphObj.selectedXAxisDataOption.data;
    this.saveChanges();
  }

  setYAxisDataOptions() {
    let dataFields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
    this.yAxisDataOptions = new Array();
    dataFields.forEach(field => {
      let data = this.logToolDataService.getAllFieldData(field.fieldName);
      this.yAxisDataOptions.push({
        data: data,
        dataField: field
      })
    });
    this.selectedYAxisDataOptions = [{ index: 0, dataOption: this.yAxisDataOptions[0], seriesColor: graphColors[0], seriesName: 'Series 1', yaxis: 'y' }];
    this.setYAxisData();
  }

  setYAxisData() {
    let index: number = 0;
    this.selectedYAxisDataOptions.forEach(selectedDataOption => {
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
    this.selectedYAxisDataOptions.push({
      index: this.selectedYAxisDataOptions.length,
      dataOption: JSON.parse(JSON.stringify(this.selectedYAxisDataOptions[0].dataOption)),
      seriesName: 'Series ' + (this.selectedYAxisDataOptions.length + 1),
      seriesColor: graphColors[this.selectedYAxisDataOptions.length],
      yaxis: 'y'
    });
    this.selectedGraphObj.selectedYAxisDataOptions.push(JSON.parse(JSON.stringify(this.selectedGraphObj.selectedYAxisDataOptions[0])));
    this.selectedGraphObj.data.push(JSON.parse(JSON.stringify(this.selectedGraphObj.data[0])));
    this.setYAxisData();
  }

  addAxis() {
    this.selectedGraphObj.hasSecondYAxis = true;
  }

  setGraphType() {
    if (this.selectedGraphObj.data[0].type == 'scattergl') {

    } else if (this.selectedGraphObj.data[0].type == 'bar') {
      let dataFields: Array<LogToolField> = this.logToolDataService.getDataFieldOptions();
      //get std deviation data for first field (non date)
      let stdDeviationBarData = this.visualizeService.getStandardDevBarChartData(dataFields[0]);
      //set data
      this.selectedGraphObj.data[0].x = stdDeviationBarData.xLabels;
      this.selectedGraphObj.data[0].y = stdDeviationBarData.yValues;
      this.selectedGraphObj.data = [this.selectedGraphObj.data[0]];
      this.selectedGraphObj.layout.xaxis.type = 'category';
      this.selectedGraphObj.layout.yaxis.title.text = 'Number of Data Points';
      this.saveChanges();
      console.log(this.selectedGraphObj);

    }
  }

  setHistogramMethod(str: string) {
    this.histogramMethod = str;
  }
}
