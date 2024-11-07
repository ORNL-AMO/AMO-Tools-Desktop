import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { PlotlyService } from 'angular-plotly.js';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';
import { TreasureHuntCo2EmissionsResults, TreasureHuntResults } from '../../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-carbon-emissions-summary-pie-chart',
  templateUrl: './carbon-emissions-summary-pie-chart.component.html',
  styleUrls: ['./carbon-emissions-summary-pie-chart.component.css']
})
export class CarbonEmissionsSummaryPieChartComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  carbonResults: TreasureHuntCo2EmissionsResults;
  @Input()
  showPrintView: boolean;

  @ViewChild('plotlyPieChart', { static: false }) plotlyPieChart: ElementRef;


  constructor(private plotlyService: PlotlyService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.showPrintView) {
      this.drawPlot();
    } else {
      this.drawPrintPlot();
    }
  }

  ngOnChanges() {
    if (this.plotlyPieChart && !this.showPrintView) {
      this.drawPlot();
    } else if (this.plotlyPieChart && this.showPrintView) {
      this.drawPrintPlot();
    }
  }

  getValuesAndLabels(): { values: Array<number>, labels: Array<string> } {
    let teamData = this.carbonResults;
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();

    if (teamData.electricityCO2Savings) {
      values.push(teamData.electricityCO2Savings);
      labels.push("Electricity");
    }
    if (teamData.naturalGasCO2Savings) {
      values.push(teamData.naturalGasCO2Savings);
      labels.push("Natural Gas");
    }
    if (teamData.otherFuelCO2Savings) {
      values.push(teamData.otherFuelCO2Savings);
      labels.push("Other Fuel");
    }
    if (teamData.waterCO2Savings) {
      values.push(teamData.waterCO2Savings);
      labels.push("Water");
    }
    if (teamData.wasteWaterCO2Savings) {
      values.push(teamData.wasteWaterCO2Savings);
      labels.push("Waste Water");
    }

    if (teamData.compressedAirCO2Savings) {
      values.push(teamData.compressedAirCO2Savings);
      labels.push("Compressed Air");
    }

    if (teamData.steamCO2Savings) {
      values.push(teamData.steamCO2Savings);
      labels.push("Steam");
    }

    return { values: values, labels: labels }
  }

  drawPlot() {
    let valuesAndLabels = this.getValuesAndLabels();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:,.0f}',
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 115
    }];

    let emissionsUnits: string = 'tonne CO<sub>2</sub>';
    if (this.settings.unitsOfMeasure !== 'Metric') {
      emissionsUnits = 'ton CO<sub>2</sub>';
    }
    var layout = {
      title: `CO<sub>2</sub> Emission Savings (${emissionsUnits})`,
      font: {
        size: 10,
      },
      showlegend: false,
      margin: { t: 50, b: 80, l: 95, r: 95 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);
  }

  drawPrintPlot() {
    let valuesAndLabels = this.getValuesAndLabels();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      texttemplate: '<b>%{label}</b> <br> %{value:,.0f}',
      hoverformat: '.2r',
      direction: "clockwise",
      rotation: 125
    }];
    var layout = {
      height: 800,
      width: 1000,
      font: {
        size: 16,
      },
      showlegend: false,
      margin: { t: 50, b: 80, l: 95, r: 95 },
    };
    var modebarBtns = {
      displaylogo: false,
      displayModeBar: false,
      responsive: true
    };
    this.plotlyService.newPlot(this.plotlyPieChart.nativeElement, data, layout, modebarBtns);


  }

}
