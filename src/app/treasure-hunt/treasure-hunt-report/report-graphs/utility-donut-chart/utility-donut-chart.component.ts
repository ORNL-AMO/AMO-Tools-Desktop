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
    let rotationAmount: number = (this.savingsItem.savings / (this.savingsItem.savings + this.savingsItem.newCost)) / 2 * 360;
    var data = [{
      width: this.utilityDonutChart.nativeElement.clientWidth,
      values: [this.savingsItem.savings, this.savingsItem.newCost],
      labels: ['Utility Savings', 'Projected Cost'],
      marker: {
        colors: graphColors
      },
      type: 'pie',
      hole: .5,
      textposition: 'outside',
      insidetextorientation: "horizontal",
      automargin: true,
      hoverformat: '.2r',
      texttemplate: `<b>%{label}</b> <br> %{value:,.0f} (%{percent})`,
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
          text: `<b>Current Cost</b> <br>${this.savingsItem.currentCost}`,
          x: .5,
          y: 0.5
        },
      ],
      showlegend: false,
      margin: { t: 15, b: 5, l: 25, r: 25 },
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
    let rotationAmount: number = (this.savingsItem.savings / (this.savingsItem.savings + this.savingsItem.newCost)) / 2 * 360;
    var data = [{
      width: this.utilityDonutChart.nativeElement.clientWidth,
      values: [this.savingsItem.savings, this.savingsItem.newCost],
      labels: ['Utility Savings', 'Projected Cost'],
      marker: {
        colors: graphColors
      },
      type: 'pie',
      hole: .5,
      textposition: 'outside',
      insidetextorientation: "horizontal",
      hoverformat: '.2r',
      texttemplate: `<b>%{label}</b> <br> %{value:$,.0f} (%{percent})`,
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
          text: `<b>Current Cost</b> <br>${this.savingsItem.currentCost}`,
          x: 0,
          y: 0.5
        },
      ],
      showlegend: false,
      margin: { t: 15, b: 5, l: 35, r: 35 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: false
    };
    this.plotlyService.newPlot(this.utilityDonutChart.nativeElement, data, layout, modebarBtns);
  }
}
