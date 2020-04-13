import { Component, OnInit } from '@angular/core';
import { VisualizeService } from '../visualize.service';
import { Subscription } from 'rxjs';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-visualize-graph',
  templateUrl: './visualize-graph.component.html',
  styleUrls: ['./visualize-graph.component.css']
})
export class VisualizeGraphComponent implements OnInit {

  selectedGraphDataSubscription: Subscription;
  constructor(private visualizeService: VisualizeService) { }

  ngOnInit() {
    this.selectedGraphDataSubscription = this.visualizeService.selectedGraphObj.subscribe(graphObj => {
      // console.log(graphObj);
      Plotly.react('plotlyDiv', graphObj.data, graphObj.layout, { responsive: true });
    })
  }

  ngOnDestroy() {
    this.selectedGraphDataSubscription.unsubscribe();
  }
}
