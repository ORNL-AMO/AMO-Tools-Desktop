import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { combineLatestWith, debounceTime, Subscription } from 'rxjs';
import { GraphInteractivity, GraphObj } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';
import { VisualizeMenuService } from './visualize-menu.service';

@Component({
  selector: 'app-visualize-menu',
  templateUrl: './visualize-menu.component.html',
  styleUrls: ['./visualize-menu.component.css']
})
export class VisualizeMenuComponent implements OnInit {

  selectedGraphObj: GraphObj;
  selectedGraphObjSub: Subscription;
  graphObjsSub: Subscription;
  numberOfGraphs: number;

  showUserGraphOptions: boolean = true;
  showGraphBasics: boolean = true;
  showXAxisOptions: boolean = true;
  showYAxisOptions: boolean = true;
  showHistogramBins: boolean = true;

  showSidebar: boolean = true;
  isGraphInteractive: boolean = false;
  graphInteractivity: GraphInteractivity;
  toolTipHoldTimeout;
  showTooltipHover: boolean = false;
  showTooltipClick: boolean = false;
  selectedGraphObjSubscription: Subscription;

  constructor(private visualizeService: VisualizeService, private visualizeMenuService: VisualizeMenuService, private logToolDataService: LogToolDataService,) { }

  ngOnInit() {
    this.visualizeService.focusedPanel.next('default');
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    this.selectedGraphObjSubscription = this.visualizeService.selectedGraphObj
    .pipe(
      // debounceTime(25)
      ).subscribe((selectedGraphObj: GraphObj) => {
        if (selectedGraphObj) {
          this.selectedGraphObj = selectedGraphObj;
          this.isGraphInteractive = this.selectedGraphObj.graphInteractivity.isGraphInteractive;
        } 
    });


    this.graphObjsSub = this.visualizeService.graphObjects.subscribe(val => {
      this.numberOfGraphs = val.length;
    });
  }
  
  focusField(field: string) {
    this.visualizeService.focusedPanel.next(field);
  }

  ngOnDestroy() {
    this.selectedGraphObjSubscription.unsubscribe();
    this.graphObjsSub.unsubscribe();
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
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Deleting Graph. This may take a moment
    depending on the amount of data you have supplied...`})
    setTimeout(() => {
    this.visualizeService.removeGraphDataObj(this.selectedGraphObj.graphId);
  }, 100);
  }

  toggleUserGraphOptions() {
    this.showUserGraphOptions = !this.showUserGraphOptions;
  }

  toggleGraphBasics() {
    this.showGraphBasics = !this.showGraphBasics;
    this.visualizeService.focusedPanel.next('graphBasics');
  }

  toggleXAxisOptions() {
    this.showXAxisOptions = !this.showXAxisOptions;
    this.visualizeService.focusedPanel.next('xAxis');
  }

  toggleYAxisOptions() {
    this.showYAxisOptions = !this.showYAxisOptions;
    this.visualizeService.focusedPanel.next('yAxis');
  }

  dismissPerformanceWarning() {
    this.selectedGraphObj.graphInteractivity.showDefaultPerformanceWarning = false;
  }
  
  dismissUserToggledPerformanceWarning() {
    this.selectedGraphObj.graphInteractivity.showUserToggledPerformanceWarning = false;
  }

  toggleAnnotateGraph() {
    this.selectedGraphObj.graphInteractivity.isGraphInteractive = this.isGraphInteractive;
    setTimeout(() => {
      this.visualizeMenuService.saveExistingPlotChange(this.selectedGraphObj, true);
      this.visualizeService.focusedPanel.next('annotation');
    }, 10);
  }

  toggleHistogramBins() {
    this.showHistogramBins = !this.showHistogramBins;
    this.visualizeService.focusedPanel.next('histogram');
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    //need to call resize so that responsive graph resizes properly.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50)
  }
  
  hideTooltipHover() {
    // Allow user to hover on tip text
    this.toolTipHoldTimeout = setTimeout(() => {
      this.showTooltipHover = false;
    }, 200)
  }

  displayTooltipHover(hoverOnInfo: boolean = false) {
    if (hoverOnInfo) {
      clearTimeout(this.toolTipHoldTimeout);
    }
    this.showTooltipHover = true;
  }

  toggleClickTooltip(){
    this.showTooltipClick = !this.showTooltipClick;
  }

}

