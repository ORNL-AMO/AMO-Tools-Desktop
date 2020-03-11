import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';
import * as Plotly from 'plotly.js';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
@Component({
  selector: 'app-opportunity-payback-donut',
  templateUrl: './opportunity-payback-donut.component.html',
  styleUrls: ['./opportunity-payback-donut.component.css']
})
export class OpportunityPaybackDonutComponent implements OnInit {
  @Input()
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  @Input()
  showPrint: boolean;

  @ViewChild('paybackDonutChart', { static: false }) paybackDonutChart: ElementRef;
  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    if (!this.showPrint) {
      this.createChart();
    } else if (this.showPrint) {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.paybackDonutChart && !this.showPrint) {
      this.createChart();
    } else if (this.paybackDonutChart && this.showPrint) {
      this.createPrintChart();
    }
  }

  createChart() {
    let valuesAndLabels = this.getValuesAndLabels();
    Plotly.purge(this.paybackDonutChart.nativeElement)
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
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
    }];
    var layout = {
      showlegend: false,
      margin: { t: 30, b: 30, l: 40, r: 40 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    Plotly.react(this.paybackDonutChart.nativeElement, data, layout, modebarBtns);
  }

  createPrintChart(){
    let valuesAndLabels = this.getValuesAndLabels();
    Plotly.purge(this.paybackDonutChart.nativeElement)
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
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
    }];
    var layout = {
      width: 900,
      font: {
        size: 16,
      },
      showlegend: false,
      margin: { t: 70, b: 110, l: 130, r: 130 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true
    };
    Plotly.react(this.paybackDonutChart.nativeElement, data, layout, modebarBtns);
  }


  getValuesAndLabels(): { values: Array<number>, labels: Array<string> } {
    return {
      values: [
        this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings,
        this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings,
        this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings,
        this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
      ],
      labels: [
        'Less than 1 Year',
        '1 to 2 Years',
        '2 to 3 Years',
        'More than 3 Years'
      ]
    };
  }

  // initChart() {
  //   if (this.showPrint) {
  //     this.chart = c3.generate({
  //       bindto: this.donutChartElement.nativeElement,
  //       data: {
  //         type: 'donut',
  //         columns: [
  //           ['Less than 1 Year ', this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings],
  //           ['1 to 2 Years ', this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings],
  //           ['2 to 3 Years ', this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings],
  //           ['More than 3 Years ', this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings],
  //         ]
  //       },
  //       size: {
  //         width: 850,
  //         height: 350
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
  //           ['Less than 1 Year ', this.opportunitiesPaybackDetails.lessThanOneYear.totalSavings],
  //           ['1 to 2 Years ', this.opportunitiesPaybackDetails.oneToTwoYears.totalSavings],
  //           ['2 to 3 Years ', this.opportunitiesPaybackDetails.twoToThreeYears.totalSavings],
  //           ['More than 3 Years ', this.opportunitiesPaybackDetails.moreThanThreeYears.totalSavings],
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
