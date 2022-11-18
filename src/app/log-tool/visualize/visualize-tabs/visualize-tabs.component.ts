import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { debounce, interval, Subscription } from 'rxjs';
import { GraphDataObj, GraphObj } from '../../log-tool-models';
import { LogToolDataService } from '../../log-tool-data.service';
import { LogToolDbService } from '../../log-tool-db.service';

@Component({
  selector: 'app-visualize-tabs',
  templateUrl: './visualize-tabs.component.html',
  styleUrls: ['./visualize-tabs.component.css']
})
export class VisualizeTabsComponent implements OnInit {

  graphDataSubscription: Subscription;
  graphObjects: Array<GraphObj>;
  selectedGraphDataSub: Subscription;
  selectedGraphData: GraphObj;
  userGraphOptionsSubscription: Subscription;
  constructor(private visualizeService: VisualizeService, 
    private logToolDbService: LogToolDbService,
    private logToolDataService: LogToolDataService) { }


  ngOnInit() {
    this.graphDataSubscription = this.visualizeService.graphObjects.subscribe(graphObjects => {
      this.graphObjects = graphObjects;
    });
    this.selectedGraphDataSub = this.visualizeService.selectedGraphObj.subscribe(selectedGraphData => {
      this.selectedGraphData = selectedGraphData;
    });

    this.userGraphOptionsSubscription = this.visualizeService.userGraphOptions
    .pipe(
      debounce((userGraphOptionsGraphObj: GraphObj) => {
        let userInputDelay: number = this.visualizeService.userInputDelay.getValue()
        return interval(userInputDelay);
      })
      ).subscribe((userGraphOptionsGraphObj: GraphObj) => {
        if (userGraphOptionsGraphObj) {
          this.graphObjects.map(graph => {
            if (graph.graphId === userGraphOptionsGraphObj.graphId) {
              graph.layout.title.text = userGraphOptionsGraphObj.layout.title.text;
            } 
            return graph;
          });
        }
    });
  }

  ngOnDestroy() {
    this.selectedGraphDataSub.unsubscribe()
    this.graphDataSubscription.unsubscribe();
  }

  addNewGraphDataObj() {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Adding New Graph...`});
    this.visualizeService.saveUserOptionsChanges();
    let updatedSelectedGraphObject: GraphObj = this.visualizeService.selectedGraphObj.getValue();
    this.visualizeService.annotateDataPoint.next(undefined);
    this.logToolDbService.saveDataWithOptions(updatedSelectedGraphObject);
    this.visualizeService.addNewGraphDataObj();
  }

  selectGraph(graphObj: GraphObj) {
    this.logToolDataService.loadingSpinner.next({show: true, msg: `Graphing Data...`});
    this.visualizeService.selectedGraphObj.next(graphObj);
    this.visualizeService.annotateDataPoint.next(undefined);
    this.visualizeService.userGraphOptions.next(graphObj);
  }
}
