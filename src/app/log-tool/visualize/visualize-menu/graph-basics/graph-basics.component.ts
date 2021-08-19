import { Component, OnInit } from '@angular/core';
import { GraphObj } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { VisualizeMenuService } from '../visualize-menu.service';
import { LogToolDataService } from '../../../log-tool-data.service';

@Component({
  selector: 'app-graph-basics',
  templateUrl: './graph-basics.component.html',
  styleUrls: ['./graph-basics.component.css']
})
export class GraphBasicsComponent implements OnInit {

  graphTypes: Array<{ label: string, value: string }> = [
    { value: 'scattergl', label: 'Scatter Plot' },
    { value: 'bar', label: 'Histogram' }
  ]
  selectedGraphObj: GraphObj;
  selectedGraphObjSub: Subscription;
  markerTypes: Array<Object>;
  markerType: string;
  isTimeSeries: boolean;

  constructor(private visualizeService: VisualizeService, private visualizeMenuService: VisualizeMenuService, private logToolDataService: LogToolDataService) { }

  ngOnInit(): void {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      if (this.selectedGraphObj == undefined || val.graphId != this.selectedGraphObj.graphId) {
        this.selectedGraphObj = val;
        this.setGraphType();
      } else {
        this.selectedGraphObj = val;
        if (this.selectedGraphObj.data[0].type == 'bar') {
          this.checkBarHistogramData();
        }
      }
      
      if (this.selectedGraphObj.layout.xaxis.type == "date") {
        this.markerTypes = [{label: "Lines & Markers", value: "lines+markers"}, {label: "Lines", value: "lines"}, {label: "Markers", value: "markers"}];
      }
      else {
          this.markerTypes = [{label: "Markers", value: "markers"}];
          this.markerType = "markers";
      }
        
    });
    if (this.selectedGraphObj.layout.xaxis.type == "date") {
    this.markerTypes = [{label: "Lines & Markers", value: "lines+markers"}, {label: "Lines", value: "lines"}, {label: "Markers", value: "markers"}];
    }
    else {
      this.markerTypes = [{label: "Markers", value: "markers"}];
    }
    this.markerType = "markers";
    this.isTimeSeries = this.logToolDataService.isTimeSeries;
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  saveChanges() {
    this.visualizeMenuService.save(this.selectedGraphObj);
  }

  setLinesMarkers() {
    this.visualizeService.plotFunctionType = 'update';
    this.selectedGraphObj.selectedYAxisDataOptions.forEach((option) => {
      option.linesOrMarkers = this.markerType;
    });
    this.visualizeMenuService.setGraphType(this.selectedGraphObj);
  }

  setGraphType() {
    this.visualizeService.plotFunctionType = 'react';
    if (this.selectedGraphObj.data[0].type == 'bar') {
      this.checkBarHistogramData();
    }
    this.visualizeMenuService.setGraphType(this.selectedGraphObj);
  }

  focusField() {
    this.visualizeService.focusedPanel.next('graphBasics');
  }

  focusOut() {
    this.visualizeService.focusedPanel.next('default');
  }

  setHistogramStdDeviation(bool: boolean) {
    this.selectedGraphObj.useStandardDeviation = bool;
    this.setBarHistogramData();
  }

  setHistogramUsePercent(bool: boolean) {
    this.selectedGraphObj.usePercentForBins = bool;
    if (this.selectedGraphObj.usePercentForBins) {
      this.selectedGraphObj.layout.yaxis.ticksuffix = '%';
    } else {
      this.selectedGraphObj.layout.yaxis.ticksuffix = '';
    }
    this.setBarHistogramData();
  }

  setBarHistogramData() {
    this.visualizeService.plotFunctionType = 'react';
    this.visualizeMenuService.setBarHistogramData(this.selectedGraphObj);
  }

  checkBarHistogramData() {
    if (this.selectedGraphObj.binnedField == undefined || this.selectedGraphObj.binnedField.fieldName != this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName || this.selectedGraphObj.bins == undefined) {
      this.visualizeService.plotFunctionType = 'react';
      this.selectedGraphObj = this.visualizeMenuService.initializeBinData(this.selectedGraphObj);
    }
  }
}
