import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { combineLatestWith, debounceTime, Subscription } from 'rxjs';
import { GraphInteractivity, GraphObj } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';

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
  onUpdateGraphEventsSubscription: Subscription;

  constructor(private visualizeService: VisualizeService, private logToolDataService: LogToolDataService,) { }

  ngOnInit() {
    this.visualizeService.focusedPanel.next('default');
    this.selectedGraphObj = this.visualizeService.selectedGraphObj.getValue();
    this.onUpdateGraphEventsSubscription = this.visualizeService.selectedGraphObj
    .pipe(
      combineLatestWith(this.visualizeService.userGraphOptions),
      debounceTime(25)
      ).subscribe(([selectedGraphObj, userGraphOptionsObj]: any) => {
        if (selectedGraphObj || userGraphOptionsObj) {
          this.selectedGraphObj = selectedGraphObj? selectedGraphObj : userGraphOptionsObj;
          this.isGraphInteractive = this.selectedGraphObj.graphInteractivity.isGraphInteractive;
          this.graphInteractivity = this.selectedGraphObj.graphInteractivity;
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
    this.onUpdateGraphEventsSubscription.unsubscribe();
    this.graphObjsSub.unsubscribe();
  }

  deleteGraph() {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data...`})
    this.visualizeService.removeGraphDataObj(this.selectedGraphObj.graphId);
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
    let graphInteractivity: GraphInteractivity = {
      isGraphInteractive: this.isGraphInteractive,
    }

    let userGraphOptionsGraphObj = this.visualizeService.userGraphOptions.getValue();
    if (!userGraphOptionsGraphObj) {
      userGraphOptionsGraphObj = this.visualizeService.selectedGraphObj.getValue();
    }
    userGraphOptionsGraphObj.graphInteractivity = graphInteractivity;
    this.visualizeService.userGraphOptions.next(userGraphOptionsGraphObj);
    this.visualizeService.focusedPanel.next('annotation');
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

