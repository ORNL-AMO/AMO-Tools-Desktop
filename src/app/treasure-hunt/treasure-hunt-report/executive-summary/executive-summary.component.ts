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
  @Input()
  showPrint: boolean;

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

  prepChartData(): void {
    let dataTitles = new Array<string>();
    let data = new Array<Array<number>>();
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
      dataTitles.push('Electricity');
      data.push([this.treasureHuntResults.electricity.modifiedEnergyCost, this.treasureHuntResults.electricity.costSavings]);
    }
    if (this.treasureHuntResults.naturalGas.costSavings > 0) {
      dataTitles.push('Natural Gas');
      data.push([this.treasureHuntResults.naturalGas.modifiedEnergyCost, this.treasureHuntResults.naturalGas.costSavings]);
    }
    if (this.treasureHuntResults.otherFuel.costSavings > 0) {
      dataTitles.push('Other Fuel');
      data.push([this.treasureHuntResults.otherFuel.modifiedEnergyCost, this.treasureHuntResults.otherFuel.costSavings]);
    }
    if (this.treasureHuntResults.water.costSavings > 0) {
      dataTitles.push('Water');
      data.push([this.treasureHuntResults.water.modifiedEnergyCost, this.treasureHuntResults.water.costSavings]);
    }
    if (this.treasureHuntResults.wasteWater.costSavings > 0) {
      dataTitles.push('Wastewater');
      data.push([this.treasureHuntResults.wasteWater.modifiedEnergyCost, this.treasureHuntResults.wasteWater.costSavings]);
    }
    if (this.treasureHuntResults.steam.costSavings > 0) {
      dataTitles.push('Steam');
      data.push([this.treasureHuntResults.steam.modifiedEnergyCost, this.treasureHuntResults.steam.costSavings]);
    }
    if (this.treasureHuntResults.compressedAir.costSavings > 0) {
      dataTitles.push('Compressed Air');
      data.push([this.treasureHuntResults.compressedAir.modifiedEnergyCost, this.treasureHuntResults.compressedAir.costSavings > 0 ? this.treasureHuntResults.compressedAir.costSavings : 0]);
    }
    this.data = data;
    this.dataTitles = dataTitles;
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