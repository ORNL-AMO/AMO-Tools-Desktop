import { Component } from '@angular/core';
import { GraphObj, YAxisDataOption } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';
import { LogToolDataService } from '../../../log-tool-data.service';
import { VisualizeSidebarService } from '../visualize-sidebar.service';

@Component({
    selector: 'app-graph-data-selection',
    templateUrl: './graph-data-selection.component.html',
    styleUrls: ['./graph-data-selection.component.css'],
    standalone: false
})
export class GraphDataSelectionComponent {

  graphTypes: Array<{ label: string, value: string }> = [
    { value: 'time-series', label: 'Time Series' },
    { value: 'scattergl', label: 'Scatter Plot' },
    { value: 'bar', label: 'Histogram' }
  ]
  selectedGraphObj: GraphObj;
  selectedGraphObjSub: Subscription;
  markerTypes: Array<Object>;
  markerType: string;
  selectedYAxisDataOptions: YAxisDataOption[];
  canRunDayTypeAnalysis: boolean;
  constructor(private visualizeService: VisualizeService, 
    private visualizeSidebarService: VisualizeSidebarService, 
    private logToolDataService: LogToolDataService) { }

  ngOnInit(): void {
    this.visualizeService.focusedPanel.next('graph-data');
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(selectedGraphObj => {
      this.selectedGraphObj = selectedGraphObj;
      this.selectedYAxisDataOptions = this.selectedGraphObj.selectedYAxisDataOptions;

      // 'scattergl' represents MEASUR scatter graph type, but plotly graph type for time series must be set 'scattergl'
      if (this.selectedGraphObj.isTimeSeries === true) {
        this.selectedGraphObj.data[0].type = 'time-series';
        this.markerTypes = [{ label: "Lines", value: "lines" }, { label: "Lines & Markers", value: "lines+markers" }, { label: "Markers", value: "markers" }];
      } else if (this.selectedGraphObj.data[0].type !== 'bar') {
        this.selectedGraphObj.data[0].type = 'scattergl';
      }
    });
    this.canRunDayTypeAnalysis = this.logToolDataService.explorerData.getValue().canRunDayTypeAnalysis;
  }

  
  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
  }

  changeSelectedGraphData() {
    this.visualizeSidebarService.changeSelectedGraphData(this.selectedGraphObj);
  }

  setLinesMarkers() {
    this.selectedGraphObj.selectedYAxisDataOptions.map((option) => {
      option.linesOrMarkers = this.markerType;
    });
    this.visualizeSidebarService.setGraphData(this.selectedGraphObj);
  }

  saveUserInput() {
    this.visualizeSidebarService.saveUserInputChange(this.selectedGraphObj);
  }

  focusField(field: string) {
    this.visualizeService.focusedPanel.next(field);
  }

  focusOut() {
    this.visualizeService.focusedPanel.next('default');
  }

}
