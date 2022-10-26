import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { GraphInteractivity, GraphObj } from '../../log-tool-models';

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
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.visualizeService.focusedPanel.next('default');
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
      this.isGraphInteractive = this.selectedGraphObj.graphInteractivity.isGraphInteractive;
    });

    this.graphObjsSub = this.visualizeService.graphObjects.subscribe(val => {
      this.numberOfGraphs = val.length;
    });
  }

  ngOnDestroy() {
    this.selectedGraphObjSub.unsubscribe();
    this.graphObjsSub.unsubscribe();
  }

  deleteGraph() {
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

  toggleAnnotateGraph() {
    let graphInteractivity: GraphInteractivity = {
      isGraphInteractive: this.isGraphInteractive,
      showPerformanceWarning: false
      // showPerformanceWarning: this.isGraphInteractive? true : false
    }

    let userGraphOptionsGraphObj = this.visualizeService.userGraphOptions.getValue();
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
      console.log('resize')
    }, 50)
  }
}

