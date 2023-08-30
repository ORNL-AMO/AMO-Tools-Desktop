import { Component } from '@angular/core';
import { GraphObj } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeMenuService } from '../../visualize-menu/visualize-menu.service';
import { VisualizeService } from '../../visualize.service';
import { LogToolDataService } from '../../../log-tool-data.service';

@Component({
  selector: 'app-graph-data-selection',
  templateUrl: './graph-data-selection.component.html',
  styleUrls: ['./graph-data-selection.component.css']
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
  canRunDayTypeAnalysis: boolean;
  constructor(private visualizeService: VisualizeService, 
    private visualizeMenuService: VisualizeMenuService, 
    private logToolDataService: LogToolDataService) { }

  ngOnInit(): void {
    this.visualizeService.focusedPanel.next('graph-data');
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(selectedGraphObj => {
      this.selectedGraphObj = selectedGraphObj;
      debugger;

      // 'scattergl' represents MEASUR scatter graph type, but plotly graph type for time series must be set 'scattergl'
      if (this.selectedGraphObj.isTimeSeries === true) {
        this.selectedGraphObj.data[0].type = 'time-series';
        this.markerTypes = [{ label: "Lines & Markers", value: "lines+markers" }, { label: "Lines", value: "lines" }, { label: "Markers", value: "markers" }];
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
    this.visualizeMenuService.changeSelectedGraphData(this.selectedGraphObj);
  }

  setLinesMarkers() {
    this.selectedGraphObj.selectedYAxisDataOptions.map((option) => {
      option.linesOrMarkers = this.markerType;
    });
    this.visualizeMenuService.setGraphData(this.selectedGraphObj);
  }

  saveUserInput() {
    this.visualizeMenuService.saveUserInputChange(this.selectedGraphObj);
  }

  focusField(field: string) {
    this.visualizeService.focusedPanel.next(field);
  }

  focusOut() {
    this.visualizeService.focusedPanel.next('default');
  }

}
