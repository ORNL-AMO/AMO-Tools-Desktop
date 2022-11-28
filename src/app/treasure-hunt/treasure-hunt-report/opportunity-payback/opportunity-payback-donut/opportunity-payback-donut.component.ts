import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { OpportunitiesPaybackDetails } from '../../../../shared/models/treasure-hunt';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';
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
  @Input()
  settings: Settings;

  @ViewChild('paybackDonutChart', { static: false }) paybackDonutChart: ElementRef;
  constructor(private plotlyService: PlotlyService) { }

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
      texttemplate: '<b>%{label}</b> <br> %{value:$.0f}',
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      showlegend: false,
      margin: { t: 10, b: 10, l: 60, r: 60 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.paybackDonutChart.nativeElement, data, layout, modebarBtns);
  }

  createPrintChart(){
    let valuesAndLabels = this.getValuesAndLabels();
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
      texttemplate: '<b>%{label}</b> <br> %{value:,.0f}',
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      width: 900,
      font: {
        size: 16,
      },
      showlegend: false,
      margin: { t: 10, b: 10, l: 60, r: 60 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: false
    };
    this.plotlyService.newPlot(this.paybackDonutChart.nativeElement, data, layout, modebarBtns);
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
        '< 1 yr',
        '1-2 yrs',
        '2-3 yrs',
        '> 3 yrs'
      ]
    };
  }
}
