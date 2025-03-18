import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { debounce, interval, Subscription } from 'rxjs';
import { GraphDataObj, GraphObj } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';

@Component({
    selector: 'app-visualize-tabs',
    templateUrl: './visualize-tabs.component.html',
    styleUrls: ['./visualize-tabs.component.css'],
    standalone: false
})
export class VisualizeTabsComponent implements OnInit {

  graphDataSubscription: Subscription;
  graphObjects: Array<GraphObj>;
  selectedGraphDataSub: Subscription;
  selectedGraphData: GraphObj;
  constructor(private visualizeService: VisualizeService, 
    private logToolDataService: LogToolDataService) { }


  ngOnInit() {
    this.graphDataSubscription = this.visualizeService.graphObjects.subscribe(graphObjects => {
      this.graphObjects = graphObjects;
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
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Adding New Graph.. This may take a moment
    depending on the amount of data you have supplied...`});
    this.visualizeService.annotateDataPoint.next(undefined);
    this.visualizeService.addNewGraphDataObj();
    this.visualizeService.shouldRenderGraph.next(true);
  }

  selectGraph(graphObj: GraphObj) {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data. This may take a moment
    depending on the amount of data you have supplied...`});
    this.visualizeService.selectedGraphObj.next(graphObj);
    this.visualizeService.annotateDataPoint.next(undefined);
    this.visualizeService.shouldRenderGraph.next(true);
  }
}
