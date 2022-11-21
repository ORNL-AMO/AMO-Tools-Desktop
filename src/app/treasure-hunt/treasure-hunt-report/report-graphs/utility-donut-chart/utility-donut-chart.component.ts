import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { SavingsItem } from '../../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-utility-donut-chart',
  templateUrl: './utility-donut-chart.component.html',
  styleUrls: ['./utility-donut-chart.component.css']
})
export class UtilityDonutChartComponent implements OnInit {
  @Input()
  savingsItem: SavingsItem;
  @Input()
  showPrint: boolean;
  @Input()
  graphTab: string;

  @ViewChild('utilityDonutChart', { static: false }) utilityDonutChart: ElementRef;
  constructor(private plotlyService: PlotlyService) { }

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
    let labels: Array<string> = new Array<string>();
    let text: string = "Cost";
    labels = ['Savings', 'Projection'];
    if (this.graphTab == 'carbon'){
      text = "CO<sub>2</sub> Emissions";
    } else if (this.graphTab == 'cost') {
      text = "Cost";
    } else if (this.graphTab == 'energy') {
      text = "Utility Usage";
    }
    let rotationAmount: number = (this.savingsItem.savings / (this.savingsItem.savings + this.savingsItem.newCost)) / 2 * 360;
    var data = [{
      values: [this.savingsItem.savings, this.savingsItem.newCost],
      labels: labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      hole: .5,
      textposition: "auto",
      insidetextorientation: "horizontal",
      hoverformat: '.2r',
      texttemplate: `<b>%{label}</b> <br> %{value:,.0f} <br> (%{percent})`,
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: rotationAmount
    }];
    var layout = {
      font: {
        size: 12,
      },
      annotations: [
        {
          font: {
            size: 12
          },
          showarrow: false,
          text: `<b>Current ${text}</b> <br>${this.savingsItem.currentCost}`,
          x: .5,
          y: 0.5
        },
      ],
      showlegend: false,
      margin: { t: 10, b: 10, l: 10, r: 10 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.utilityDonutChart.nativeElement, data, layout, modebarBtns);
  }

  createPrintChart() {
    let labels: Array<string> = new Array<string>();
    let text: string;
    labels = ['Savings', 'Projection'];
    if (this.graphTab === 'carbon'){
      text = "CO<sub>2</sub> Emissions";
    } else if (this.graphTab === 'cost') {
      text = "Cost";
    } else if (this.graphTab === 'energy') {
      text = "Utility Usage";
    }
    let rotationAmount: number = (this.savingsItem.savings / (this.savingsItem.savings + this.savingsItem.newCost)) / 2 * 360;
    var data = [{
      width: this.utilityDonutChart.nativeElement.clientWidth,
      values: [this.savingsItem.savings, this.savingsItem.newCost],
      labels: labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      hole: .5,
      textposition: "auto",
      insidetextorientation: "horizontal",
      hoverformat: '.2r',
      texttemplate: `<b>%{label}</b> <br> %{value:,.0f} <br> (%{percent})`,
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: rotationAmount
    }];
    var layout = {
      width: 300,
      font: {
        size: 12,
      },
      annotations: [
        {
          font: {
            size: 12
          },
          showarrow: false,
          text: `<b>Current ${text}</b> <br>${this.savingsItem.currentCost}`,
          x: 0,
          y: 0.5
        },
      ],
      showlegend: false,
      margin: { t: 10, b: 10, l: 10, r: 10 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: false
    };
    this.plotlyService.newPlot(this.utilityDonutChart.nativeElement, data, layout, modebarBtns);
  }
}
