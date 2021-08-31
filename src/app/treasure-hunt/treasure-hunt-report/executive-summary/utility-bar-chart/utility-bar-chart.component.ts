import { Component, OnInit, ViewChild, ElementRef, Input, SimpleChanges } from '@angular/core';
import * as Plotly from 'plotly.js';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';
import { graphColors } from '../../../../phast/phast-report/report-graphs/graphColors';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-utility-bar-chart',
  templateUrl: './utility-bar-chart.component.html',
  styleUrls: ['./utility-bar-chart.component.css']
})
export class UtilityBarChartComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  showPrintView: boolean;
  @Input()
  inRollupPrintView: boolean;
  @Input()
  settings: Settings;

  @ViewChild('utilityBarChart', { static: false }) utilityBarChart: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    if (!this.showPrintView && !this.inRollupPrintView) {
      this.createBarChart();
    } else if (this.showPrintView && !this.inRollupPrintView) {
      this.createPrintBarChart();
    } else if(this.inRollupPrintView){
      this.createRollupPrintBarChart();
    }
  }

  ngOnChanges() {
    if (this.utilityBarChart && !this.showPrintView && !this.inRollupPrintView) {
      this.createBarChart();
    }else if (this.utilityBarChart && this.showPrintView && !this.inRollupPrintView) {
      this.createPrintBarChart();
    }else if (this.utilityBarChart && this.inRollupPrintView){
      this.createRollupPrintBarChart();
    }
  }

  createBarChart() {
    var data = this.getDataObject();
    var layout = {
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: .25,
        y: 1.3,
        orientation: "h"
      },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        // automargin: true,
        tickformat: '.2s',
        fixedrange: true
      },
      xaxis: {
        automargin: true,
        fixedrange: true
      },
      margin: { t: 15, b: 10 }
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: true,
      responsive: true
    };

    Plotly.react(this.utilityBarChart.nativeElement, data, layout, configOptions);
  }

  createPrintBarChart() {
    var data = this.getDataObject();
    var layout = {
      width: 575,
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: 0,
        y: 1.3,
        orientation: "h"
      },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        // automargin: true,
        tickformat: '$.2s',
        fixedrange: true
      },
      xaxis: {
        // automargin: true,
        fixedrange: true
      },
      margin: { t: 30, b: 30 }
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: false
    };

    Plotly.react(this.utilityBarChart.nativeElement, data, layout, configOptions);
  }

  createRollupPrintBarChart() {
    var data = this.getDataObject();
    var layout = {
      width: 800,
      barmode: 'stack',
      showlegend: true,
      legend: {
        x: 0,
        y: 1,
        orientation: "h"
      },
      font: {
        size: 14,
      },
      yaxis: {
        hoverformat: '.3r',
        // automargin: true,
        tickformat: '$.2s',
        // fixedrange: true
      },
      xaxis: {
        // automargin: true,
        // fixedrange: true
      },
      margin: { t: 30, b: 30 }
    };
    var configOptions = {
      modeBarButtonsToRemove: ['toggleHover', 'zoomIn2d', 'zoomOut2d', 'autoScale2d', 'resetScale2d', 'zoom2d', 'lasso2d', 'pan2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian'],
      displaylogo: false,
      displayModeBar: false
    };

    Plotly.react(this.utilityBarChart.nativeElement, data, layout, configOptions);
  }

  getDataObject(){
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData();
    let projectCostTrace = {
      x: chartData.labels,
      y: chartData.projectedCosts,
      hoverinfo: 'all',
      hovertemplate: '%{y:,.0f}<extra></extra>',
      name: "Modification Costs (" + this.settings.currency + ")",
      type: "bar",
      marker: {
        color: graphColors[1],
        width: .8
      },
    };
    let costSavingsTrace = {
      x: chartData.labels,
      y: chartData.costSavings,
      hoverinfo: 'all',
      hovertemplate: '%{y:,.0f}<extra></extra>',
      name: "Savings From Baseline (" + this.settings.currency + ")",
      type: "bar",
      marker: {
        color: graphColors[0]
      },
    }

    var data = [projectCostTrace, costSavingsTrace];
    return data;
  }

  getChartData(): { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } {
    let labels = new Array<string>();
    let projectedCosts = new Array<number>();
    let costSavings = new Array<number>();
    /*
      Electricity
      Natural Gas
      Other Fuel
      Water
      Wastewater
      Steam
      Compressed Air
    */
    if (this.treasureHuntResults.electricity.costSavings > 0) {
      labels.push('Electricity');
      projectedCosts.push(this.treasureHuntResults.electricity.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.electricity.costSavings);
      // data.push([this.treasureHuntResults.electricity.modifiedEnergyCost, this.treasureHuntResults.electricity.costSavings]);
    }
    if (this.treasureHuntResults.naturalGas.costSavings > 0) {
      labels.push('Natural Gas');
      projectedCosts.push(this.treasureHuntResults.naturalGas.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.naturalGas.costSavings);
      // data.push([this.treasureHuntResults.naturalGas.modifiedEnergyCost, this.treasureHuntResults.naturalGas.costSavings]);
    }
    if (this.treasureHuntResults.otherFuel.costSavings > 0) {
      labels.push('Other Fuel');
      projectedCosts.push(this.treasureHuntResults.otherFuel.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.otherFuel.costSavings);
      // data.push([this.treasureHuntResults.otherFuel.modifiedEnergyCost, this.treasureHuntResults.otherFuel.costSavings]);
    }
    if (this.treasureHuntResults.water.costSavings > 0) {
      labels.push('Water');
      projectedCosts.push(this.treasureHuntResults.water.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.water.costSavings);
      // data.push([this.treasureHuntResults.water.modifiedEnergyCost, this.treasureHuntResults.water.costSavings]);
    }
    if (this.treasureHuntResults.wasteWater.costSavings > 0) {
      labels.push('Wastewater');
      projectedCosts.push(this.treasureHuntResults.wasteWater.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.wasteWater.costSavings);
      // data.push([this.treasureHuntResults.wasteWater.modifiedEnergyCost, this.treasureHuntResults.wasteWater.costSavings]);
    }
    if (this.treasureHuntResults.steam.costSavings > 0) {
      labels.push('Steam');
      projectedCosts.push(this.treasureHuntResults.steam.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.steam.costSavings);
      // data.push([this.treasureHuntResults.steam.modifiedEnergyCost, this.treasureHuntResults.steam.costSavings]);
    }
    if (this.treasureHuntResults.compressedAir.costSavings > 0) {
      labels.push('Comp. Air');
      projectedCosts.push(this.treasureHuntResults.compressedAir.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.compressedAir.costSavings);
      // data.push([this.treasureHuntResults.compressedAir.modifiedEnergyCost, this.treasureHuntResults.compressedAir.costSavings > 0 ? this.treasureHuntResults.compressedAir.costSavings : 0]);
    }
    return { projectedCosts: projectedCosts, labels: labels, costSavings: costSavings };
  }

}