import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { LogToolDataService } from '../../log-tool-data.service';
import { GraphDataObj, LogToolField, GraphObj } from '../../log-tool-models';
import { measurementOptions } from '../../system-setup/clean-data/field-units-modal/field-unit-options';

@Component({
  selector: 'app-visualize-menu',
  templateUrl: './visualize-menu.component.html',
  styleUrls: ['./visualize-menu.component.css']
})
export class VisualizeMenuComponent implements OnInit {

  graphDataSubscription: Subscription;
  // graphData: Array<GraphDataObj>;
  selectedGraphDataSub: Subscription;
  selectedGraphData: GraphDataObj;
  xDataFieldDropdown: boolean = false;
  yDataFieldDropdown: boolean = false;
  graphTypeDropdown: boolean = false;
  histogramDataFieldDropdown: boolean = false;
  dataFields: Array<LogToolField>;

  graphTypes: Array<{ label: string, value: string }> = [
    { value: 'scattergl', label: 'Scatter Plot' },
    { value: 'bar', label: 'Histogram' }
  ]
  showScatterLines: boolean = false;
  showScatterMarkers: boolean = true;
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
  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService) { }


  ngOnInit() {
    this.measurementOptions = measurementOptions;
    this.unitOptions = new Array();
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    console.log(this.selectedGraphObj);
    this.setXAxisDataOptions();
    this.setYAxisDataOptions();
  }

  ngOnDestroy() {
    // this.selectedGraphDataSub.unsubscribe()
    // this.graphDataSubscription.unsubscribe();
  }

  setXAxisDataOptions() {
    let dataFields: Array<LogToolField> = this.logToolDataService.getDataFieldOptionsWithDate();
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
    this.selectedGraphObj.selectedYAxisDataOption = this.yAxisDataOptions[0];
    this.setYAxisDataOption();
  }

  setYAxisDataOption() {
    this.selectedGraphObj.data[0].y = this.selectedGraphObj.selectedYAxisDataOption.data;
    this.saveChanges();
  }

  toggleXDataFieldDropdown() {
    this.xDataFieldDropdown = !this.xDataFieldDropdown;
  }

  toggleYDataFieldDropdown() {
    this.yDataFieldDropdown = !this.yDataFieldDropdown;
  }

  setXDataField(dataField: LogToolField) {
    this.visualizeService.updateSelectedXDataField(dataField);
    this.xDataFieldDropdown = false;
  }

  setYDataField(dataField: LogToolField) {
    this.visualizeService.updateSelectedYDataField(dataField);
    this.yDataFieldDropdown = false;
  }

  // setGraphType(newGraphType: { label: string, value: string }) {
  //   this.visualizeService.updateGraphType(newGraphType);
  //   this.graphTypeDropdown = false;
  // }

  setTimeSeries() {
    if (this.selectedGraphObj.isTimeSeries) {
      //set x axis to time
    }
    this.saveChanges();
  }

  toggleGraphType() {
    this.graphTypeDropdown = !this.graphTypeDropdown;
  }

  setUseStandardDeviation() {
    if (this.selectedGraphData.useStandardDeviation == false) {
      this.visualizeService.updateUseStandardDeviation(true);
    }
  }

  setUseBins() {
    if (this.selectedGraphData.useStandardDeviation == true) {
      this.visualizeService.updateUseStandardDeviation(false);
    }
  }

  decreaseNumberOfBins() {
    this.selectedGraphData.numberOfBins--;
    this.updateNumberOfBins();
  }

  increaseNumberOfBins() {
    this.selectedGraphData.numberOfBins++;
    this.updateNumberOfBins();
  }

  updateNumberOfBins() {
    this.visualizeService.updateNumberOfBins(this.selectedGraphData.numberOfBins);
  }

  toggleHistogramDataFieldDropdown() {
    this.histogramDataFieldDropdown = !this.histogramDataFieldDropdown;
  }

  setHistogramDataField(dataField: LogToolField) {
    this.visualizeService.updateSelectedHistogramDataField(dataField);
    this.histogramDataFieldDropdown = false;
  }

  saveChanges() {
    this.visualizeService.selectedGraphObj.next(this.selectedGraphObj);
  }
}
