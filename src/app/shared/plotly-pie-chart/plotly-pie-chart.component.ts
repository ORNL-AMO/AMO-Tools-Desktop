import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../phast/phast-report/report-graphs/graphColors';

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
  @Input()
  valuesUnit: string;
  @Input()
  title: string;

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
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      automargin: true,
      textinfo: 'label+percent',
      hoverformat: '.2r',
      text: this.values.map(y => { return (y).toFixed(2) + ' ' + this.valuesUnit; }),
      hoverinfo: 'text'
    }];

    var layout = {
      // title: {
      //   text: this.title,
      //   font: {
      //     size: 24,
      //     xanchor: "center",
      //     yanchor: "bottom"
      //   }
      // },
      font: {
        size: 14,
      },
      margin: { "t": 0, "b": 0, "l": 0, "r": 0 },
      showlegend: false
    };
    Plotly.react(this.plotlyPieChart.nativeElement, data, layout, { responsive: true });
  }
}
