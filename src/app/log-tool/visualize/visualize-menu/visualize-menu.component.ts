import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { GraphObj } from '../../log-tool-models';

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

  showGraphBasics: boolean = true;
  showXAxisOptions: boolean = true;
  showYAxisOptions: boolean = true;
  showAnnotateGraph: boolean = false;

  showSidebar: boolean = true;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.visualizeService.focusedPanel.next('graphBasics');
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      this.selectedGraphObj = val;
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
    this.showAnnotateGraph = !this.showAnnotateGraph;
    this.visualizeService.focusedPanel.next('annotation');
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
    //need to call resize so that responsive graph resizes properly.
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      console.log('resize')
    }, 100)
  }
}

