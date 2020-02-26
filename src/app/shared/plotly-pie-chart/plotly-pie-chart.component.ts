import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-plotly-pie-chart',
  templateUrl: './plotly-pie-chart.component.html',
  styleUrls: ['./plotly-pie-chart.component.css']
})
export class PlotlyPieChartComponent implements OnInit {

  @ViewChild('plotlyPieChart', { static: false }) plotlyPieChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
    var data = [{
      values: [19, 26, 55],
      labels: ['Residential', 'Non-Residential', 'Utility'],
      type: 'pie'
    }];

    var layout = {
      height: 400,
      width: 500
    };

    Plotly.newPlot(this.plotlyPieChart, data, layout, { showSendToCloud: true });
  }

}
