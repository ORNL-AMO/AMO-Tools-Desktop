import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { TreasureHuntResults, OpportunitySheet, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import { graphColors } from '../../../phast/phast-report/report-graphs/graphColors';
import * as _ from 'lodash';
import { OpportunityCardData } from '../../treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureChestMenuService } from '../../treasure-chest/treasure-chest-menu/treasure-chest-menu.service';

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
  @Input()
  opportunityCardsData: Array<OpportunityCardData>;

  @ViewChild('costSummaryChartContainer', { static: false }) costSummaryChartContainer: ElementRef;
  @ViewChild('teamSummaryChartContainer', { static: false }) teamSummaryChartContainer: ElementRef;

  //data set titles describe the different sections of each bar, i.e. the legend titles
  dataSetTitles: Array<string> = ['Projected Cost', 'Savings'];
  //data titles describe each bar, i.e. all the x-axis labels for each complete bar
  dataTitles: Array<string>;
  //data holds all the numerical data to be visualized in bar chart
  data: Array<Array<number>>;
  teamData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;

  chartContainerHeight: number;
  chartContainerWidth: number;


  pieChartLabels: Array<string>;
  pieChartValues: Array<number>;
  graphColors: Array<string>;


  constructor(private treasureChestMenuService: TreasureChestMenuService) { }

  ngOnInit() {
    this.graphColors = graphColors;
    this.prepChartData();
    if (this.opportunityCardsData) {
      this.prepTeamData();
      this.prepPieChartData();
    }
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

  prepPieChartData() {
    this.pieChartValues = new Array<number>();
    this.pieChartLabels = new Array<string>();
    for (let i = 0; i < this.teamData.length; i++) {
      this.pieChartLabels.push(this.teamData[i].team + ' $' + Number(Math.round(this.teamData[i].costSavings)).toLocaleString());
      this.pieChartValues.push(this.teamData[i].costSavings);
    }
  }

  prepTeamData() {
    let teams: Array<string> = this.treasureChestMenuService.getAllTeams(this.opportunityCardsData);
    this.teamData = new Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>();
    teams.forEach(team => {
      let teamOpps: Array<OpportunityCardData> = this.opportunityCardsData.filter(cardData => { return cardData.teamName == team && cardData.selected == true });
      let teamName: string = team;
      let costSavings: number = _.sumBy(teamOpps, 'annualCostSavings');
      let implementationCost: number = _.sumBy(teamOpps, 'implementationCost');
      let paybackPeriod: number = implementationCost / costSavings;
      this.teamData.push({
        team: teamName,
        costSavings: costSavings,
        implementationCost: implementationCost,
        paybackPeriod: paybackPeriod
      });
    });
  }

  getChartHeight(chart: string): number {
    if (chart == 'pie') {
      if (this.teamSummaryChartContainer) {
        return this.teamSummaryChartContainer.nativeElement.clientHeight;
      } else {
        return 0;
      }
    } else {
      if (this.costSummaryChartContainer) {
        return this.costSummaryChartContainer.nativeElement.clientHeight;
      } else {
        return 0;
      }
    }
  }

  getChartWidth(chart: string): number {
    if (chart == 'pie') {
      if (this.teamSummaryChartContainer) {
        return this.teamSummaryChartContainer.nativeElement.clientWidth;
      } else {
        return 0;
      }
    } else {
      if (this.costSummaryChartContainer) {
        let width = this.costSummaryChartContainer.nativeElement.clientWidth;
        width = width + 170;
        return width;
      } else {
        return 0;
      }
    }

  }


}