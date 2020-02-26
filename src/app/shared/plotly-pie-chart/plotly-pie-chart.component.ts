import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import * as Plotly from 'plotly.js';

@Component({
  selector: 'app-plotly-pie-chart',
  templateUrl: './plotly-pie-chart.component.html',
  styleUrls: ['./plotly-pie-chart.component.css']
})
export class PlotlyPieChartComponent implements OnInit {
  @Input()
  values: Array<number>;
  @Input()
  labels: Array<string>;

  @ViewChild('plotlyPieChart', { static: false }) plotlyPieChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.drawPlot();
  }

  ngOnChanges() {
    if (this.plotlyPieChart) {
      this.drawPlot();
    }
  }

  drawPlot() {
    var data = [{
      values: this.values,
      labels: this.labels,
      type: 'pie',
      textposition: 'outside',
      automargin: true,
      textinfo: 'label+percent'
    }];

    var layout = {
      margin: { "t": 0, "b": 0, "l": 0, "r": 0 },
      showlegend: false
    };

    Plotly.react(this.plotlyPieChart.nativeElement, data, layout, { responsive: true });
  }
}
