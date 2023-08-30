import { Component, Input, SimpleChanges } from '@angular/core';
import { VisualizeService } from '../../visualize.service';
import { VisualizeMenuService } from '../../visualize-menu/visualize-menu.service';
import { GraphObj, YAxisDataOption } from '../../../log-tool-models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-graph-series-management',
  templateUrl: './graph-series-management.component.html',
  styleUrls: ['./graph-series-management.component.css']
})
export class GraphSeriesManagementComponent {
  @Input()
  selectedGraphObj: GraphObj;
  selectedGraphObjSubscription: Subscription;

  constructor(private visualizeService: VisualizeService,
    private visualizeMenuService: VisualizeMenuService) { }

  ngOnInit() {
    this.visualizeService.focusedPanel.next('other-series');
  }

  addDataSeries() {
    this.visualizeMenuService.addDataSeries(this.selectedGraphObj);
  }

  focusField() {
    this.visualizeService.focusedPanel.next('yAxis');
  }

  focusOut() {
    this.visualizeService.focusedPanel.next('default');
  }

  addAxis() {
    this.selectedGraphObj.hasSecondYAxis = true;
    this.visualizeMenuService.saveExistingPlotChange(this.selectedGraphObj);
  }

  removeAxis() {
    this.visualizeMenuService.removeAxis(this.selectedGraphObj);
  }

}
