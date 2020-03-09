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
    this.createChart();
  }

  ngOnChanges() {
    if (this.utilityDonutChart) {
      this.createChart();
    }
  }

  ngOnDestroy() { }

  createChart() {
    // let valuesAndLabels = this.getValuesAndLabels();

    Plotly.purge(this.utilityDonutChart.nativeElement);
    var data = [{
      width: this.utilityDonutChart.nativeElement.clientWidth,
      values: [ this.savings, this.newCost],
      labels: ['Utility Savings', 'Projected Cost'],
      marker: {
        // colors: JSON.parse(JSON.stringify(graphColors)).reverse()
        colors: graphColors
      },
      type: 'pie',
      hole: .6,
      textposition: 'auto',
      insidetextorientation: "horizontal",
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:$,.0f}',
      hoverinfo: 'label+percent',
      // direction: "clockwise",
      // rotation: 20
    }];
    var layout = {
      font: {
        size: 12,
      },
      showlegend: false,
      margin: { t: 45, b: 25, l: 25, r: 25 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.utilityDonutChart.nativeElement, data, layout, modebarBtns);
  }
  // initChart() {

  //   if (this.showPrint) {
  //     this.chart = c3.generate({
  //       bindto: this.donutChartElement.nativeElement,
  //       data: {
  //         type: 'donut',
  //         columns: [
  //           ['Utility Savings ', this.savings],
  //           ['Projected Cost ', this.newCost]
  //         ]
  //       },
  //       size: {
  //         width: 250,
  //         height: 250
  //       }
  //       // legend: {
  //       //   show: false
  //       // },
  //       // color: {
  //       //   pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
  //       //   threshold: {
  //       //     values: [25, 50]
  //       //   }
  //       // },
  //       // tooltip: {
  //       //   show: false
  //       // },
  //     });
  //   } else {
  //     this.chart = c3.generate({
  //       bindto: this.donutChartElement.nativeElement,
  //       data: {
  //         type: 'donut',
  //         columns: [
  //           ['Utility Savings ', this.savings],
  //           ['Projected Cost ', this.newCost]
  //         ]
  //       },
  //       // legend: {
  //       //   show: false
  //       // },
  //       // color: {
  //       //   pattern: ['#52489C', '#3498DB', '#6DAFA9', '#60B044', '#FF0000'], // the three color levels for the percentage values.
  //       //   threshold: {
  //       //     values: [25, 50]
  //       //   }
  //       // },
  //       // tooltip: {
  //       //   show: false
  //       // },
  //     });
  //   }
  // }
}
