import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as Plotly from 'plotly.js';
import { TreasureHuntResults } from '../../../../shared/models/treasure-hunt';
@Component({
  selector: 'app-utility-bar-chart',
  templateUrl: './utility-bar-chart.component.html',
  styleUrls: ['./utility-bar-chart.component.css']
})
export class UtilityBarChartComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @ViewChild('utilityBarChart', { static: false }) utilityBarChart: ElementRef;

  constructor() { }

  ngOnInit(): void {

  }

  ngAfterViewInit() {
    this.createBarChart();
  }


  createBarChart() {
    let chartData: { projectedCosts: Array<number>, labels: Array<string>, costSavings: Array<number> } = this.getChartData();
    let projectCostTrace: { x: Array<string>, y: Array<number>, name: string, type: string } = {
      x: chartData.labels,
      y: chartData.projectedCosts,
      name: "Projected Costs",
      type: "bar"
    };
    let costSavingsTrace: { x: Array<string>, y: Array<number>, name: string, type: string } = {
      x: chartData.labels,
      y: chartData.costSavings,
      name: "Cost Savings",
      type: "bar"
    }

    var data = [projectCostTrace, costSavingsTrace];

    var layout = { 
      barmode: 'stack' 
    };

    Plotly.newPlot(this.utilityBarChart.nativeElement, data, layout);
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
      labels.push('Compressed Air');
      projectedCosts.push(this.treasureHuntResults.compressedAir.modifiedEnergyCost);
      costSavings.push(this.treasureHuntResults.compressedAir.costSavings);
      // data.push([this.treasureHuntResults.compressedAir.modifiedEnergyCost, this.treasureHuntResults.compressedAir.costSavings > 0 ? this.treasureHuntResults.compressedAir.costSavings : 0]);
    }
    return { projectedCosts: projectedCosts, labels: labels, costSavings: costSavings };
  }

}