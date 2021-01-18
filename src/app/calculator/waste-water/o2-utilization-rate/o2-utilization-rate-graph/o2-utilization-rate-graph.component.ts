import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { O2UtilizationDataPoints, O2UtilizationRateService } from '../o2-utilization-rate.service';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-o2-utilization-rate-graph',
  templateUrl: './o2-utilization-rate-graph.component.html',
  styleUrls: ['./o2-utilization-rate-graph.component.css']
})
export class O2UtilizationRateGraphComponent implements OnInit {


  @ViewChild("o2UtilizationChart", { static: false }) o2UtilizationChart: ElementRef;
  inputDataPoints: Array<O2UtilizationDataPoints>;
  inputDataPointsSub: Subscription;

  constructor(private o2UtilizationRateService: O2UtilizationRateService) { }

  ngOnInit(): void {
    this.inputDataPointsSub = this.o2UtilizationRateService.inputDataPoints.subscribe(val => {
      this.inputDataPoints = val;
      this.drawGraph();
    });
  }

  ngOnDestroy() {
    this.inputDataPointsSub.unsubscribe();
  }

  ngAfterViewInit() {
    this.drawGraph();
  }

  drawGraph() {
    if (this.o2UtilizationChart) {
      Plotly.purge(this.o2UtilizationChart.nativeElement);
      var trace1 = {
        x: this.inputDataPoints.map(dataPoint => { return dataPoint.time }),
        y: this.inputDataPoints.map(dataPoint => { return dataPoint.dissolvedOxygen }),
        type: 'scatter'
      };

      var data = [trace1];

      Plotly.newPlot(this.o2UtilizationChart.nativeElement, data);
    }
  }

}
