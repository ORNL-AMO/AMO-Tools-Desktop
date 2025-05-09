import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { OpportunityCardsService, OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { SortCardsService } from '../opportunity-cards/sort-cards.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureHunt, TreasureHuntCo2EmissionsResults, TreasureHuntResults } from '../../../shared/models/treasure-hunt';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { TreasureHuntReportService } from '../../treasure-hunt-report/treasure-hunt-report.service';

@Component({
    selector: 'app-summary-card',
    templateUrl: './summary-card.component.html',
    styleUrls: ['./summary-card.component.css'],
    standalone: false
})
export class SummaryCardComponent implements OnInit {
  @Input()
  settings: Settings;

  electricityData: UtilityTotal;
  naturalGasData: UtilityTotal;
  compressedAirData: UtilityTotal;
  waterData: UtilityTotal;
  wasteWaterData: UtilityTotal;
  steamData: UtilityTotal;
  otherFuelData: UtilityTotal;
  additionalAnnualSavings: UtilityTotal;
  carbonData: UtilityTotal;
  carbonResults: TreasureHuntCo2EmissionsResults;
  treasureHuntResults: TreasureHuntResults;

  totals: UtilityTotal;
  opportunityCardsSub: Subscription;
  sortBySub: Subscription;
  sortCardsData: SortCardsData;
  opportunityCards: Array<OpportunityCardData>;
  currCurrency: string = "$";
  constructor(private opportunityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService, private treasureHuntReportService: TreasureHuntReportService,
    private sortCardsService: SortCardsService, private treasureHuntService: TreasureHuntService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    this.opportunityCardsSub = this.opportunityCardsService.opportunityCards.subscribe(val => {
      if (val) {
        this.opportunityCards = val;
        this.setSavingsData();
      }
    });

    this.sortBySub = this.treasureChestMenuService.sortBy.subscribe(val => {
      this.sortCardsData = val;
      this.setSavingsData();
    })
  }

  ngOnDestroy() {
    this.opportunityCardsSub.unsubscribe();
    this.sortBySub.unsubscribe();
  }

  setSavingsData() {
    if (this.sortCardsData != undefined && this.opportunityCards != undefined) {      
      let treasureHunt: TreasureHunt = this.treasureHuntService.treasureHunt.getValue();
      let opportunityCards: Array<OpportunityCardData> = this.opportunityCards;
      opportunityCards = this.sortCardsService.sortCards(opportunityCards, this.sortCardsData);
      this.electricityData = this.setUtilityTotal(treasureHunt.currentEnergyUsage.electricityUsed, treasureHunt.currentEnergyUsage.electricityCosts, 'Electricity');
      this.naturalGasData = this.setUtilityTotal(treasureHunt.currentEnergyUsage.naturalGasUsed, treasureHunt.currentEnergyUsage.naturalGasCosts, 'Natural Gas');
      this.waterData = this.setUtilityTotal(treasureHunt.currentEnergyUsage.waterUsed, treasureHunt.currentEnergyUsage.waterCosts, 'Water');
      this.compressedAirData = this.setUtilityTotal(treasureHunt.currentEnergyUsage.compressedAirUsed, treasureHunt.currentEnergyUsage.compressedAirCosts, 'Compressed Air');
      this.steamData = this.setUtilityTotal(treasureHunt.currentEnergyUsage.steamUsed, treasureHunt.currentEnergyUsage.steamCosts, 'Steam');
      this.wasteWaterData = this.setUtilityTotal(treasureHunt.currentEnergyUsage.wasteWaterUsed, treasureHunt.currentEnergyUsage.wasteWaterCosts, 'Waste Water');
      this.otherFuelData = this.setUtilityTotal(treasureHunt.currentEnergyUsage.otherFuelUsed, treasureHunt.currentEnergyUsage.otherFuelCosts, 'Other Fuel');
      this.currCurrency = this.settings.currency;
      let baselineCost: number = this.electricityData.baselineCost + this.naturalGasData.baselineCost + this.waterData.baselineCost + this.compressedAirData.baselineCost + this.steamData.baselineCost + this.wasteWaterData.baselineCost + this.otherFuelData.baselineCost;
      this.additionalAnnualSavings = this.calculateAdditionalSavings(baselineCost, opportunityCards);
      
      this.treasureHuntResults = this.treasureHuntReportService.calculateTreasureHuntResults(treasureHunt, this.settings);
      this.carbonResults = this.treasureHuntResults.co2EmissionsResults;
      this.carbonData = {
        totalPercentSavings: (this.carbonResults.totalCO2Savings / this.carbonResults.totalCO2CurrentUse * 100),
        totalCostSavings: this.carbonResults.totalCO2Savings,
        baselineCost: this.carbonResults.totalCO2CurrentUse,
        modificationCost: this.carbonResults.totalCO2ProjectedUse
      }

      if (this.settings.currency !== '$') {
        this.additionalAnnualSavings.totalCostSavings = this.convertUnitsService.value(this.additionalAnnualSavings.totalCostSavings).from("$").to(this.settings.currency);
        this.additionalAnnualSavings.baselineCost = this.convertUnitsService.value(this.additionalAnnualSavings.baselineCost).from("$").to(this.settings.currency);
        this.additionalAnnualSavings.modificationCost = this.convertUnitsService.value(this.additionalAnnualSavings.modificationCost).from("$").to(this.settings.currency);
      }
      let totalCostSavings: number = this.electricityData.totalCostSavings + this.naturalGasData.totalCostSavings + this.waterData.totalCostSavings + this.compressedAirData.totalCostSavings + this.steamData.totalCostSavings + this.wasteWaterData.totalCostSavings + this.otherFuelData.totalCostSavings + this.additionalAnnualSavings.totalCostSavings;
      this.totals = {
        totalPercentSavings: (totalCostSavings / baselineCost * 100),
        totalCostSavings: totalCostSavings,
        baselineCost: baselineCost,
        modificationCost: baselineCost - totalCostSavings
      };
    }
  }


  setUtilityTotal(utilityUsed: boolean, baselineTHCost: number, utilityType: string): UtilityTotal {
    let opportunityCards: Array<OpportunityCardData> = this.opportunityCards;
    opportunityCards = this.sortCardsService.sortCards(opportunityCards, this.sortCardsData);
    if (utilityUsed) {
      let treasureHuntCards: Array<OpportunityCardData> = _.filter(opportunityCards, (card) => { 
          return _.includes(card.utilityType, utilityType);
      });
      let utilityTotals: UtilityTotal = this.getCardSavingsByUtilityType(treasureHuntCards, utilityType);
      if (this.currCurrency !== this.settings.currency) {
        baselineTHCost = this.convertUnitsService.convertValue(baselineTHCost, this.currCurrency, this.settings.currency);
      }
      return {
        baselineCost: baselineTHCost,
        modificationCost: baselineTHCost - utilityTotals.totalCostSavings,
        totalCostSavings: utilityTotals.totalCostSavings,
        totalPercentSavings: utilityTotals.totalPercentSavings
      }
    } else {
      return {
        baselineCost: 0,
        modificationCost: 0,
        totalPercentSavings: 0,
        totalCostSavings: 0
      }
    }
  }


  getCardSavingsByUtilityType(opportunityCards: Array<OpportunityCardData>, utilityType: string): UtilityTotal {
    let totalPercentSavings: number = 0;
    let totalCostSavings: number = 0;
    let baselineCost: number = 0;
    let modificationCost: number = 0;
    opportunityCards.forEach(card => {
      if (card.selected == true) {
        let percentSavings = _.find(card.percentSavings, (card) => { return card.label == utilityType });
        if (percentSavings) {
          totalPercentSavings = totalPercentSavings + percentSavings.percent;
          totalCostSavings = totalCostSavings + (percentSavings.baselineCost - percentSavings.modificationCost);
          baselineCost = percentSavings.baselineCost + baselineCost;
          modificationCost = modificationCost + percentSavings.modificationCost;
        }
      }
    });
    return { totalPercentSavings: totalPercentSavings, totalCostSavings: totalCostSavings, baselineCost: baselineCost, modificationCost: modificationCost }
  }

  calculateAdditionalSavings(baselineCost: number, opportunityCards: Array<OpportunityCardData>): UtilityTotal {
    let additionalAnnualSavings: number = 0;
    opportunityCards.forEach(card => {
      if (card.selected && card.opportunitySheet.opportunityCost.additionalAnnualSavings) {
        additionalAnnualSavings += card.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
      }
    });
    let totalPercentSavings: number = (additionalAnnualSavings / baselineCost * 100);
    return { totalPercentSavings: totalPercentSavings, totalCostSavings: additionalAnnualSavings, baselineCost: 0, modificationCost: 0 }
  }
}


export interface UtilityTotal {
  totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number
}