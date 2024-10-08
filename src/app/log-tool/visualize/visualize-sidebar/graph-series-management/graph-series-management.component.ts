import { Component, Input, SimpleChanges } from '@angular/core';
import { VisualizeService } from '../../visualize.service';
import { GraphObj, YAxisDataOption } from '../../../log-tool-models';
import { VisualizeSidebarService } from '../visualize-sidebar.service';

@Component({
  selector: 'app-graph-series-management',
  templateUrl: './graph-series-management.component.html',
  styleUrls: ['./graph-series-management.component.css']
})
export class GraphSeriesManagementComponent {
  @Input()
  selectedGraphObj: GraphObj;
  @Input()
  selectedYAxisDataOptions: YAxisDataOption[];

  constructor(private visualizeService: VisualizeService,
    private visualizeSidebarService: VisualizeSidebarService) { }

  ngOnInit() {
    this.visualizeService.focusedPanel.next('other-series');
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.selectedGraphObj) {
      this.selectedYAxisDataOptions = this.selectedGraphObj.selectedYAxisDataOptions;
    }
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
    this.visualizeSidebarService.saveExistingPlotChange(this.selectedGraphObj);
  }

  addAxis() {
    this.selectedGraphObj.hasSecondYAxis = true;
    this.visualizeSidebarService.saveExistingPlotChange(this.selectedGraphObj);
  }

  removeAxis() {
    this.visualizeSidebarService.removeAxis(this.selectedGraphObj);
  }

}
