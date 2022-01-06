import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { UtilityUsageData, OpportunitySummary, TreasureHuntResults, OpportunitiesPaybackDetails } from '../../shared/models/treasure-hunt';
import { TreasureHuntResultsData, ReportItem } from '../report-rollup-models';
import { ReportRollupService } from '../report-rollup.service';
import * as _ from 'lodash';
import { OpportunityCardData, OpportunityCardsService } from '../../treasure-hunt/treasure-chest/opportunity-cards/opportunity-cards.service';
import { TreasureHuntReportService } from '../../treasure-hunt/treasure-hunt-report/treasure-hunt-report.service';
import { OpportunityPaybackService } from '../../treasure-hunt/treasure-hunt-report/opportunity-payback.service';
import { TreasureHuntReportRollupService } from '../treasure-hunt-report-rollup.service';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-treasure-hunt-rollup',
  templateUrl: './treasure-hunt-rollup.component.html',
  styleUrls: ['./treasure-hunt-rollup.component.css']
})
export class TreasureHuntRollupComponent implements OnInit {

  @Input()
  printView: boolean;
  @Input()
  settings: Settings;

  combinedTreasureHuntResults: TreasureHuntResults;
  allOpportunityCardsData: Array<OpportunityCardData>
  opportunitiesPaybackDetails: OpportunitiesPaybackDetails;
  
  allTeamsData: Array<{ team: string, costSavings: number, implementationCost: number, paybackPeriod: number }>;
  constructor(private treasureHuntReportRollupService: TreasureHuntReportRollupService, private opportunityCardsService: OpportunityCardsService, private treasureHuntReportService: TreasureHuntReportService,
    private opportunityPaybackService: OpportunityPaybackService, private convertUnitsService: ConvertUnitsService, private reportRollupService: ReportRollupService) { }

  ngOnInit(): void {
    if(!this.settings){
      this.settings = this.reportRollupService.settings.getValue();
    }   
    let allTreasureHuntResults: Array<TreasureHuntResultsData> = this.treasureHuntReportRollupService.allTreasureHuntResults.getValue();
    this.combinedTreasureHuntResults = this.getCombinedTreasureHuntResults(allTreasureHuntResults);
    this.convertCurrencyForDisplay();
    this.opportunitiesPaybackDetails = this.opportunityPaybackService.getOpportunityPaybackDetails(this.combinedTreasureHuntResults.opportunitySummaries, this.settings);
    let treasureHuntAssessments: Array<ReportItem> = this.treasureHuntReportRollupService.treasureHuntAssessments.getValue();
    this.setAllOpporutnityCardsData(treasureHuntAssessments);
  }

  setAllOpporutnityCardsData(treasureHuntAssessments: Array<ReportItem>) {
    this.allOpportunityCardsData = new Array();
    treasureHuntAssessments.forEach(item => {
      let assessmentOppCardData = this.opportunityCardsService.getOpportunityCardsData(item.assessment.treasureHunt, item.settings);
      this.allOpportunityCardsData = this.allOpportunityCardsData.concat(assessmentOppCardData);
    });
    this.allTeamsData = this.treasureHuntReportService.getTeamData(this.allOpportunityCardsData);
    if (this.settings.currency !== '$') {
      this.allTeamsData.forEach(data => {
       data.costSavings = this.convertUnitsService.value(data.costSavings).from('$').to(this.settings.currency);
       data.implementationCost = this.convertUnitsService.value(data.implementationCost).from('$').to(this.settings.currency);
      });
    }
  }

  convertCurrencyForDisplay() {
    if (this.settings.currency !== '$') {
      this.combinedTreasureHuntResults.totalBaselineCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.totalBaselineCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.totalModificationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.totalModificationCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.totalAdditionalSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.totalAdditionalSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.totalSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.totalSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.totalImplementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.totalImplementationCost).from('$').to(this.settings.currency);
      
      this.combinedTreasureHuntResults.water.costSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.water.costSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.water.baselineEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.water.baselineEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.water.modifiedEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.water.modifiedEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.water.implementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.water.implementationCost).from('$').to(this.settings.currency);
      
      this.combinedTreasureHuntResults.electricity.costSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.electricity.costSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.electricity.baselineEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.electricity.baselineEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.electricity.modifiedEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.electricity.modifiedEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.electricity.implementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.electricity.implementationCost).from('$').to(this.settings.currency);
      
      this.combinedTreasureHuntResults.other.costSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.other.costSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.other.baselineEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.other.baselineEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.other.modifiedEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.other.modifiedEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.other.implementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.other.implementationCost).from('$').to(this.settings.currency);
      
      this.combinedTreasureHuntResults.steam.costSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.steam.costSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.steam.baselineEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.steam.baselineEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.steam.modifiedEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.steam.modifiedEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.steam.implementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.steam.implementationCost).from('$').to(this.settings.currency);
      
      this.combinedTreasureHuntResults.wasteWater.costSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.wasteWater.costSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.wasteWater.baselineEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.wasteWater.baselineEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.wasteWater.modifiedEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.wasteWater.modifiedEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.wasteWater.implementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.wasteWater.implementationCost).from('$').to(this.settings.currency);
      
      this.combinedTreasureHuntResults.compressedAir.costSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.compressedAir.costSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.compressedAir.baselineEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.compressedAir.baselineEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.compressedAir.modifiedEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.compressedAir.modifiedEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.compressedAir.implementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.compressedAir.implementationCost).from('$').to(this.settings.currency);
      
      this.combinedTreasureHuntResults.naturalGas.costSavings = this.convertUnitsService.value(this.combinedTreasureHuntResults.naturalGas.costSavings).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.naturalGas.baselineEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.naturalGas.baselineEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.naturalGas.modifiedEnergyCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.naturalGas.modifiedEnergyCost).from('$').to(this.settings.currency);
      this.combinedTreasureHuntResults.naturalGas.implementationCost = this.convertUnitsService.value(this.combinedTreasureHuntResults.naturalGas.implementationCost).from('$').to(this.settings.currency); 

    }
  }

  getCombinedTreasureHuntResults(resultsData: Array<TreasureHuntResultsData>): TreasureHuntResults {
    let electricity: UtilityUsageData;
    let naturalGas: UtilityUsageData;
    let water: UtilityUsageData;
    let wasteWater: UtilityUsageData;
    let otherFuel: UtilityUsageData;
    let compressedAir: UtilityUsageData;
    let steam: UtilityUsageData;
    let other: UtilityUsageData;
    let opportunitySummaries: Array<OpportunitySummary> = new Array();
    resultsData.forEach(data => {
      data.treasureHuntResults.opportunitySummaries.forEach(summary => {
        opportunitySummaries.push(summary);
      })
    })

    let electricityUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.electricity });
    if (electricityUsageArr.length != 0) {
      electricity = this.combineUtilityUsageData(electricityUsageArr);
    }
    let naturalGasUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.naturalGas });
    if (naturalGasUsageArr.length != 0) {
      naturalGas = this.combineUtilityUsageData(naturalGasUsageArr);
    }

    let waterUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.water });
    if (waterUsageArr.length != 0) {
      water = this.combineUtilityUsageData(waterUsageArr);
    }
    let wasteWaterUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.wasteWater });
    if (wasteWaterUsageArr.length != 0) {
      wasteWater = this.combineUtilityUsageData(wasteWaterUsageArr);
    }
    let otherFuelUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.otherFuel });
    if (otherFuelUsageArr.length != 0) {
      otherFuel = this.combineUtilityUsageData(otherFuelUsageArr);
    }
    let compressedAirUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.compressedAir });
    if (compressedAirUsageArr.length != 0) {
      compressedAir = this.combineUtilityUsageData(compressedAirUsageArr);
    }
    let steamUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.steam });
    if (steamUsageArr.length != 0) {
      steam = this.combineUtilityUsageData(steamUsageArr);
    }
    let otherUsageArr: Array<UtilityUsageData> = resultsData.map(data => { return data.treasureHuntResults.other });
    if (otherUsageArr.length != 0) {
      other = this.combineUtilityUsageData(otherUsageArr);
    }

    let utilityArr: Array<UtilityUsageData> = [electricity, compressedAir, naturalGas, water, steam, wasteWater, otherFuel];
    let totalAdditionalSavings: number = _.sumBy(resultsData, data => { return data.treasureHuntResults.totalAdditionalSavings });
    let totalImplementationCost: number = _.sumBy(utilityArr, (usage: UtilityUsageData) => { return usage.implementationCost }) + other.implementationCost;
    let totalCostSavings: number = _.sumBy(utilityArr, (usage: UtilityUsageData) => { return usage.costSavings }) + totalAdditionalSavings;
    let totalBaselineCost: number = _.sumBy(utilityArr, (usage: UtilityUsageData) => { return usage.baselineEnergyCost });
    let hasMixed: boolean = electricity.hasMixed || naturalGas.hasMixed || water.hasMixed || wasteWater.hasMixed || otherFuel.hasMixed || compressedAir.hasMixed || steam.hasMixed;
    
    
    return {
      totalSavings: totalCostSavings,
      percentSavings: (totalCostSavings / totalBaselineCost) * 100,
      totalBaselineCost: totalBaselineCost,
      totalModificationCost: totalBaselineCost - totalCostSavings,
      paybackPeriod: totalImplementationCost / totalCostSavings,
      electricity: electricity,
      naturalGas: naturalGas,
      water: water,
      wasteWater: wasteWater,
      otherFuel: otherFuel,
      compressedAir: compressedAir,
      steam: steam,
      other: other,
      opportunitySummaries: opportunitySummaries,
      totalImplementationCost: totalImplementationCost,
      hasMixed: hasMixed,
      totalAdditionalSavings: totalAdditionalSavings
    }
  }

  combineUtilityUsageData(usageData: Array<UtilityUsageData>): UtilityUsageData {
    let baselineEnergyUsage: number = _.sumBy(usageData, (dataItem) => { return dataItem.baselineEnergyUsage });
    let baselineEnergyCost: number = _.sumBy(usageData, (dataItem) => { return dataItem.baselineEnergyCost });
    let modifiedEnergyUsage: number = _.sumBy(usageData, (dataItem) => { return dataItem.modifiedEnergyUsage });
    let modifiedEnergyCost: number = _.sumBy(usageData, (dataItem) => { return dataItem.modifiedEnergyCost });
    let energySavings: number = baselineEnergyUsage - modifiedEnergyUsage;
    let costSavings: number = baselineEnergyCost - modifiedEnergyCost;
    let implementationCost: number = _.sumBy(usageData, (dataItem) => { return dataItem.implementationCost });
    let paybackPeriod: number = implementationCost / costSavings;
    let percentSavings: number = (costSavings / baselineEnergyCost) * 100;
    let checkHasMixed: UtilityUsageData = _.find(usageData, (dataItem) => { return dataItem.hasMixed });
    let hasMixed: boolean = (checkHasMixed != undefined);
    return {
      baselineEnergyUsage: baselineEnergyUsage,
      baselineEnergyCost: baselineEnergyCost,
      modifiedEnergyUsage: modifiedEnergyUsage,
      modifiedEnergyCost: modifiedEnergyCost,
      energySavings: energySavings,
      costSavings: costSavings,
      implementationCost: implementationCost,
      paybackPeriod: paybackPeriod,
      percentSavings: percentSavings,
      hasMixed: hasMixed
    }
  }
}
