import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
// import * as c3 from 'c3';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
@Component({
  selector: 'app-utility-donut-chart',
  templateUrl: './utility-donut-chart.component.html',
  styleUrls: ['./utility-donut-chart.component.css']
})
export class UtilityDonutChartComponent implements OnInit {
  @Input()
  savings: number;
  @Input()
  newCost: number;
  @Input()
  showPrint: boolean;


  @ViewChild('utilityDonutChart', { static: false }) utilityDonutChart: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (!this.showPrint) {
      this.createChart();
    } else {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.utilityDonutChart && !this.showPrint) {
      this.createChart();
    } else if (this.utilityDonutChart && this.showPrint) {
      this.createPrintChart();
    }
  }

  ngOnDestroy() { }

  createChart() {
    let rotationAmount: number = (this.savings / (this.savings + this.newCost)) / 2 * 360;
    Plotly.purge(this.utilityDonutChart.nativeElement);
    var data = [{
      width: this.utilityDonutChart.nativeElement.clientWidth,
      values: [this.savings, this.newCost],
      labels: ['Utility Savings', 'Projected Cost'],
      marker: {
        colors: graphColors
      },
      type: 'pie',
      hole: .5,
      textposition: 'auto',
      insidetextorientation: "horizontal",
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:$,.0f}',
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: rotationAmount
    }];
    var layout = {
      font: {
        size: 12,
      },
      showlegend: false,
      margin: { t: 15, b: 5, l: 25, r: 25 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.utilityDonutChart.nativeElement, data, layout, modebarBtns);
  }

  createPrintChart() {
    Plotly.purge(this.utilityDonutChart.nativeElement);
    let rotationAmount: number = (this.savings / (this.savings + this.newCost)) / 2 * 360;
    var data = [{
      width: this.utilityDonutChart.nativeElement.clientWidth,
      values: [this.savings, this.newCost],
      labels: ['Utility Savings', 'Projected Cost'],
      marker: {
        colors: graphColors
      },
      type: 'pie',
      hole: .5,
      textposition: 'auto',
      insidetextorientation: "horizontal",
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:$,.0f}',
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: rotationAmount
    }];
    var layout = {
      width: 300,
      font: {
        size: 14,
      },
      showlegend: false,
      margin: { t: 15, b: 5, l: 35, r: 35 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true
    };
    Plotly.react(this.utilityDonutChart.nativeElement, data, layout, modebarBtns);
  }
}
