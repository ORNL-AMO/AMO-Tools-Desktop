import { Component, Input, SimpleChanges } from '@angular/core';
import { VisualizeService } from '../../visualize.service';
import { GraphObj, YAxisDataOption } from '../../../log-tool-models';
import { VisualizeSidebarService } from '../visualize-sidebar.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-graph-series-management',
    templateUrl: './graph-series-management.component.html',
    styleUrls: ['./graph-series-management.component.css'],
    standalone: false
})
export class GraphSeriesManagementComponent {
  selectedGraphObj: GraphObj;
  selectedYAxisDataOptions: YAxisDataOption[];
  selectedGraphObjSubscription: Subscription;

  constructor(private visualizeService: VisualizeService,
    private visualizeSidebarService: VisualizeSidebarService) { }

  ngOnInit() {
    this.selectedGraphObjSubscription = this.visualizeService.selectedGraphObj.subscribe((selectedGraphObj: GraphObj) => {
      if (selectedGraphObj) {
        this.selectedGraphObj = selectedGraphObj;
        this.selectedYAxisDataOptions = this.selectedGraphObj.selectedYAxisDataOptions;
      }
    });

    this.visualizeService.focusedPanel.next('other-series');
  }

  ngOnDestroy() {
    this.selectedGraphObjSubscription.unsubscribe();
  }

  addDataSeries() {
    this.visualizeSidebarService.addDataSeries(this.selectedGraphObj);
  }

  focusField() {
    this.visualizeService.focusedPanel.next('yAxis');
  }

  focusOut() {
    this.visualizeService.focusedPanel.next('default');
  }

  saveUserInput() {
    this.visualizeSidebarService.saveUserInputChange(this.selectedGraphObj);
  }

  addAxis() {
    this.selectedGraphObj.hasSecondYAxis = true;
    if (this.selectedGraphObj.selectedYAxisDataOptions && this.selectedGraphObj.selectedYAxisDataOptions.length > 1) {
      this.selectedGraphObj.selectedYAxisDataOptions = this.selectedGraphObj.selectedYAxisDataOptions.map((option, index) => {
        if (index != 0) {
          return {
            ...option,
            yaxis: 'y2'
          }
        } else {
          return option;
        }
      });
    }
    this.visualizeSidebarService.setGraphYAxisData(this.selectedGraphObj, true);
  }

  removeAxis() {
    this.visualizeSidebarService.removeAxis(this.selectedGraphObj);
  }

}
