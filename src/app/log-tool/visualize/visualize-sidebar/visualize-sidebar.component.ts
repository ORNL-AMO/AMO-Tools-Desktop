import { Component } from '@angular/core';
import { GraphObj } from '../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../visualize.service';
import { LogToolDataService } from '../../log-tool-data.service';
import { VisualizeSidebarService } from './visualize-sidebar.service';

@Component({
    selector: 'app-visualize-sidebar',
    templateUrl: './visualize-sidebar.component.html',
    styleUrls: ['./visualize-sidebar.component.css'],
    standalone: false
})
export class VisualizeSidebarComponent {

  selectedGraphObj: GraphObj;
  graphObjsSub: Subscription;
  selectedGraphObjSubscription: Subscription;
  
  numberOfGraphs: number;
  showSidebar: boolean = true;
  selectedSidebarTab: SidebarTab = 'graph-data';

  constructor(private visualizeService: VisualizeService,
    private visualizeSidebarService: VisualizeSidebarService,
    private logToolDataService: LogToolDataService) { }

  ngOnInit() {
    this.visualizeService.focusedPanel.next('graph-data');
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    this.selectedGraphObjSubscription = this.visualizeService.selectedGraphObj.subscribe((selectedGraphObj: GraphObj) => {
      if (selectedGraphObj) {
        let isSelectedGraphChange = selectedGraphObj.graphId != this.selectedGraphObj.graphId;
        this.selectedGraphObj = selectedGraphObj;
        if (isSelectedGraphChange) {
          this.visualizeSidebarService.changeSelectedGraphData(this.selectedGraphObj, isSelectedGraphChange);
        } else if (this.selectedGraphObj.data[0].type == 'bar') {
          this.visualizeSidebarService.checkBarHistogramData(this.selectedGraphObj);
        }

        // 'scattergl' represents MEASUR scatter graph type, but plotly graph type for time series must be set 'scattergl'
        if (this.selectedGraphObj.isTimeSeries === true) {
          this.selectedGraphObj.data[0].type = 'time-series';
        } else if (this.selectedGraphObj.data[0].type !== 'bar') {
          this.selectedGraphObj.data[0].type = 'scattergl';
        }
      }
    });

    this.graphObjsSub = this.visualizeService.graphObjects.subscribe(val => {
      this.numberOfGraphs = val.length;
    });
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    //need to call resize so that responsive graph resizes properly.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50)
  }

  ngOnDestroy() {
    this.selectedGraphObjSubscription.unsubscribe();
    this.graphObjsSub.unsubscribe();
  }
  
  saveChanges() {
    this.visualizeSidebarService.saveUserInputChange(this.selectedGraphObj)
  }

  setSidebarTab(tab: SidebarTab) {
    this.selectedSidebarTab = tab;
    this.visualizeService.focusedPanel.next(tab);
  }


  renderGraph() {
    this.logToolDataService.loadingSpinner.next({
      show: true, msg: `Graphing Data. This may take a moment
    depending on the amount of data you have supplied...`});
    setTimeout(() => {
      this.visualizeService.shouldRenderGraph.next(true);
    }, 100);
  }

  deleteGraph() {
    this.logToolDataService.loadingSpinner.next({
      show: true, msg: `Deleting Graph. This may take a moment
    depending on the amount of data you have supplied...`})
    setTimeout(() => {
      this.visualizeService.removeGraphDataObj(this.selectedGraphObj.graphId);
    }, 100);
  }
}


export type SidebarTab = 'graph-data' | 'other-series' | 'annotations' | 'settings';