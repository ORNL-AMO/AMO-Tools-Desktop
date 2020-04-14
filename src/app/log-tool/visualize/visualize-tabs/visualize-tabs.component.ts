import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import { GraphDataObj, GraphObj } from '../../log-tool-models';

@Component({
  selector: 'app-visualize-tabs',
  templateUrl: './visualize-tabs.component.html',
  styleUrls: ['./visualize-tabs.component.css']
})
export class VisualizeTabsComponent implements OnInit {

  graphDataSubscription: Subscription;
  graphData: Array<GraphObj>;
  selectedGraphDataSub: Subscription;
  selectedGraphData: GraphObj;
  constructor(private visualizeService: VisualizeService) { }


  ngOnInit() {
    this.graphDataSubscription = this.visualizeService.graphObjects.subscribe(graphData => {
      this.graphData = graphData;
    });
    this.selectedGraphDataSub = this.visualizeService.selectedGraphObj.subscribe(selectedGraphData => {
      this.selectedGraphData = selectedGraphData;
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSub.unsubscribe()
    this.graphDataSubscription.unsubscribe();
  }

  addNewGraphDataObj() {
    this.visualizeService.addNewGraphDataObj();
  }

  selectGraph(graphObj: GraphObj) {
    this.visualizeService.selectedGraphObj.next(graphObj);
  }
}
