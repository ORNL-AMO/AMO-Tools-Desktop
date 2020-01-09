import { Component, OnInit } from '@angular/core';
import { VisualizeService, GraphDataObj } from '../visualize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-visualize-tabs',
  templateUrl: './visualize-tabs.component.html',
  styleUrls: ['./visualize-tabs.component.css']
})
export class VisualizeTabsComponent implements OnInit {

  graphDataSubscription: Subscription;
  graphData: Array<GraphDataObj>;
  selectedGraphDataSub: Subscription;
  selectedGraphData: GraphDataObj;
  constructor(private visualizeService: VisualizeService) { }


  ngOnInit() {
    this.graphDataSubscription = this.visualizeService.graphData.subscribe(graphData => {
      this.graphData = graphData;
    });
    this.selectedGraphDataSub = this.visualizeService.selectedGraphData.subscribe(selectedGraphData => {
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

  selectGraph(graphDataObj: GraphDataObj) {
    this.visualizeService.selectedGraphData.next(graphDataObj);
  }
}
