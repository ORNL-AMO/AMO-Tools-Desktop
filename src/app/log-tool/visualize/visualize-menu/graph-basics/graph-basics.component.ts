import { Component, OnInit } from '@angular/core';
import { GraphObj } from '../../../log-tool-models';
import { Subscription } from 'rxjs';
import { VisualizeService } from '../../visualize.service';

@Component({
  selector: 'app-graph-basics',
  templateUrl: './graph-basics.component.html',
  styleUrls: ['./graph-basics.component.css']
})
export class GraphBasicsComponent implements OnInit {

  graphTypes: Array<{ label: string, value: string }> = [
    { value: 'scattergl', label: 'Scatter Plot' },
    { value: 'bar', label: 'Histogram' }
  ]
  selectedGraphObj: GraphObj;
  selectedGraphObjSub: Subscription;

  constructor(private visualizeService: VisualizeService) { }

  ngOnInit(): void {
    this.selectedGraphObjSub = this.visualizeService.selectedGraphObj.subscribe(val => {
      if (this.selectedGraphObj == undefined || val.graphId != this.selectedGraphObj.graphId) {
        this.selectedGraphObj = val;
        this.setGraphType();
      }
    });
  }

  ngOnDestroy(){
    this.selectedGraphObjSub.unsubscribe();
  }

  setGraphType(){
    
  }

}
