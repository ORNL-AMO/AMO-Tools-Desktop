import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { TreasureHuntResults, UtilityUsageData } from '../../../../shared/models/treasure-hunt';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'app-cost-pie-chart',
  templateUrl: './cost-pie-chart.component.html',
  styleUrls: ['./cost-pie-chart.component.css']
})
export class CostPieChartComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  isBaseline: boolean;
  @Input()
  showPrint: boolean;
  @Input()
  settings: Settings

  @ViewChild('costPieChart', { static: false }) costPieChart: ElementRef;
  constructor(private plotlyService: PlotlyService) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (!this.showPrint) {
      this.createChart();
    } else {
      this.createPrintChart();
    }
  }

  ngOnChanges() {
    if (this.costPieChart && !this.showPrint) {
      this.createChart();
    } else if (this.costPieChart && this.showPrint) {
      this.createPrintChart();
    }
  }

  ngOnDestroy() { }

  createChart() {
    let valuesAndLabels = this.getLabelsAndValues();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:,.0f}',
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      font: {
        size: 16,
      },
      showlegend: false,
      margin: { t: 50, b: 110, l: 110, r: 110 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };
    this.plotlyService.newPlot(this.costPieChart.nativeElement, data, layout, modebarBtns);
  }


  createPrintChart() {
    let valuesAndLabels = this.getLabelsAndValues();
    var data = [{
      values: valuesAndLabels.values,
      labels: valuesAndLabels.labels,
      marker: {
        colors: graphColors
      },
      type: 'pie',
      textposition: 'auto',
      insidetextorientation: "horizontal",
      // automargin: true,
      // textinfo: 'label+value',
      hoverformat: '.2r',
      texttemplate: '<b>%{label}</b> <br> %{value:,.0f}',
      // text: valuesAndLabels.values.map(y => { return (y).toFixed(2) }),
      hoverinfo: 'label+percent',
      direction: "clockwise",
      rotation: 90
    }];
    var layout = {
      width: 450,
      font: {
        size: 16,
      },
      showlegend: false,
      margin: { t: 50, b: 110, l: 50, r: 110 },
    };

    var modebarBtns = {
      modeBarButtonsToRemove: ['hoverClosestPie'],
      displaylogo: false,
      displayModeBar: false,
    };
    this.plotlyService.newPlot(this.costPieChart.nativeElement, data, layout, modebarBtns);
  }


  getLabelsAndValues(): { values: Array<number>, labels: Array<string> } {
    let values: Array<number> = new Array();
    let labels: Array<string> = new Array();
    this.addItem(values, labels, this.treasureHuntResults.electricity, this.isBaseline, 'Electricity');
    this.addItem(values, labels, this.treasureHuntResults.naturalGas, this.isBaseline, 'Natural Gas');
    this.addItem(values, labels, this.treasureHuntResults.water, this.isBaseline, 'Water');
    this.addItem(values, labels, this.treasureHuntResults.wasteWater, this.isBaseline, 'Waste Water');
    this.addItem(values, labels, this.treasureHuntResults.otherFuel, this.isBaseline, 'Other Fuel');
    this.addItem(values, labels, this.treasureHuntResults.compressedAir, this.isBaseline, 'Comp. Air');
    this.addItem(values, labels, this.treasureHuntResults.steam, this.isBaseline, 'Steam');
    this.addItem(values, labels, this.treasureHuntResults.other, this.isBaseline, 'Other');
    return { values: values, labels: labels };
  }

  addItem(values: Array<number>, labels: Array<string>, data: UtilityUsageData, isBaseline: boolean, label: string) {
    if (isBaseline && data.baselineEnergyCost) {
      labels.push(label);
      values.push(data.baselineEnergyCost);
    } else if (!isBaseline && data.modifiedEnergyCost) {
      labels.push(label);
      values.push(data.modifiedEnergyCost);
    }
  }
}
