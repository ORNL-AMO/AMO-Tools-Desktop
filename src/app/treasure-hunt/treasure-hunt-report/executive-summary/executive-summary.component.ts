import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import * as _ from 'lodash';

@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  treasureHuntResults: TreasureHuntResults;
  @Input()
  settings: Settings;
  @Input()
  showFullSummary: boolean;
  @Input()
  title: string;

  @ViewChild('costSummaryChartContainer') costSummaryChartContainer: ElementRef;

  //data set titles describe the different sections of each bar, i.e. the legend titles
  dataSetTitles: Array<string> = ['Projected Cost', 'Savings'];
  //data titles describe each bar, i.e. all the x-axis labels for each complete bar
  dataTitles: Array<string>;
  //data holds all the numerical data to be visualized in bar chart
  data: Array<Array<number>>;

  chartContainerHeight: number;
  chartContainerWidth: number;


  constructor() { }

  ngOnInit() {
    this.prepChartData();
  }

  // ngAfterViewInit() {
  //   this.chartContainerHeight = this.getChartHeight();
  //   this.chartContainerWidth = this.getChartWidth();
  //   console.log('chartContainerHeight = ' + this.chartContainerHeight);
  //   console.log('chartContainerWidth = ' + this.chartContainerWidth);
  // }


  prepChartData(): void {
    let dataTitles = new Array<string>();
    let data = new Array<Array<number>>();
    if (this.treasureHuntResults.opportunitySummaries !== undefined && this.treasureHuntResults.opportunitySummaries !== null) {
      for (let i = 0; i < this.treasureHuntResults.opportunitySummaries.length; i++) {
        if (!dataTitles.includes(this.treasureHuntResults.opportunitySummaries[i].utilityType)) {
          dataTitles.push(this.treasureHuntResults.opportunitySummaries[i].utilityType);
          data.push(this.getUtilityCost(this.treasureHuntResults.opportunitySummaries[i].utilityType));
        }
      }
    }
    this.data = data;
    this.dataTitles = dataTitles;
  }

  getUtilityCost(utilityType: string): Array<number> {
    /*
    Electricity
    Natural Gas
    Other Fuel
    Water
    Wastewater
    Steam
    Compressed Air
    */
    switch (utilityType) {
      case "Electricity":
        return [this.treasureHuntResults.electricity.modifiedEnergyCost, this.treasureHuntResults.electricity.costSavings > 0 ? this.treasureHuntResults.electricity.costSavings : 0];
      case "Natural Gas":
        return [this.treasureHuntResults.naturalGas.modifiedEnergyCost, this.treasureHuntResults.naturalGas.costSavings > 0 ? this.treasureHuntResults.naturalGas.costSavings : 0];
      case "Other Fuel":
        return [this.treasureHuntResults.otherFuel.modifiedEnergyCost, this.treasureHuntResults.otherFuel.costSavings > 0 ? this.treasureHuntResults.otherFuel.costSavings : 0];
      case "Water":
        return [this.treasureHuntResults.water.modifiedEnergyCost, this.treasureHuntResults.water.costSavings > 0 ? this.treasureHuntResults.water.costSavings : 0];
      case "Wastewater":
        return [this.treasureHuntResults.wasteWater.modifiedEnergyCost, this.treasureHuntResults.wasteWater.costSavings > 0 ? this.treasureHuntResults.wasteWater.costSavings : 0];
      case "Steam":
        return [this.treasureHuntResults.steam.modifiedEnergyCost, this.treasureHuntResults.steam.costSavings > 0 ? this.treasureHuntResults.steam.costSavings : 0];
      case "Compressed Air":
        return [this.treasureHuntResults.compressedAir.modifiedEnergyCost, this.treasureHuntResults.compressedAir.costSavings > 0 ? this.treasureHuntResults.compressedAir.costSavings : 0];
      default:
        throw "in file 'executive-summary-component.ts': Received invalid utilityType: " + utilityType;
    }

  }

  getChartHeight(): number {
    if (this.costSummaryChartContainer) {
      return this.costSummaryChartContainer.nativeElement.clientHeight;
    } else {
      return 0;
    }
  }

  getChartWidth(): number {
    if (this.costSummaryChartContainer) {
      let width = this.costSummaryChartContainer.nativeElement.clientWidth;
      width = width + 170;
      return width;
    } else {
      return 0;
    }
  }


}