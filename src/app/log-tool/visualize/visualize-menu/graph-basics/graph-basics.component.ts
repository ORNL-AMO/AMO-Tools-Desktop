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
  canRunDayTypeAnalysis: boolean;
  constructor(private visualizeService: VisualizeService, private visualizeMenuService: VisualizeMenuService, private logToolDataService: LogToolDataService) { }

  ngOnInit(): void {
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      if (val.graphId != this.selectedGraphObj.graphId) {
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
    this.canRunDayTypeAnalysis = this.logToolDataService.explorerData.getValue().canRunDayTypeAnalysis;
  }
  
  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  saveChanges() {
    this.visualizeMenuService.saveUserGraphOptionsChange(this.selectedGraphObj);
  }

  setLinesMarkers() {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data. This may take a moment
    depending on the amount of data you have supplied...`});
    this.selectedGraphObj.selectedYAxisDataOptions.forEach((option) => {
      option.linesOrMarkers = this.markerType;
    });
    this.visualizeMenuService.setGraphData(this.selectedGraphObj);
  }

  setGraphType() {
    if (this.selectedGraphObj.data[0].type == 'bar') {
      this.checkBarHistogramData();
    }
    this.visualizeMenuService.setGraphData(this.selectedGraphObj);
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
    this.visualizeMenuService.setBarHistogramData(this.selectedGraphObj);
  }

  checkBarHistogramData() {
    if (this.selectedGraphObj.binnedField == undefined || this.selectedGraphObj.binnedField.fieldName != this.selectedGraphObj.selectedXAxisDataOption.dataField.fieldName || this.selectedGraphObj.bins == undefined) {
      this.selectedGraphObj = this.visualizeMenuService.initializeBinData(this.selectedGraphObj);
    }
  }
}
