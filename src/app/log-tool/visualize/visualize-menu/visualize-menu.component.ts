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
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
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
  }
  
  toggleXAxisOptions() {
    this.showXAxisOptions = !this.showXAxisOptions;
  }
  
  toggleYAxisOptions() {
    this.showYAxisOptions = !this.showYAxisOptions;
  }

  toggleAnnotateGraph() {
    this.showAnnotateGraph = !this.showAnnotateGraph;
  }
}

