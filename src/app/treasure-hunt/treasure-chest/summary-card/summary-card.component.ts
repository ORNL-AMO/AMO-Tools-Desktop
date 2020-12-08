import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { OpportunityCardsService, OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { SortCardsService } from '../opportunity-cards/sort-cards.service';
import { TreasureHuntService } from '../../treasure-hunt.service';
import { TreasureHunt } from '../../../shared/models/treasure-hunt';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.css']
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

  totals: UtilityTotal;
  opportunityCardsSub: Subscription;
  sortBySub: Subscription;
  sortCardsData: SortCardsData;
  opportunityCards: Array<OpportunityCardData>;
  constructor(private opportunityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private sortCardsService: SortCardsService, private treasureHuntService: TreasureHuntService) { }

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
      this.totals = {
        baselineCost: this.electricityData.baselineCost + this.naturalGasData.baselineCost + this.waterData.baselineCost + this.compressedAirData.baselineCost + this.steamData.baselineCost + this.wasteWaterData.baselineCost + this.otherFuelData.baselineCost,
        modificationCost: this.electricityData.modificationCost + this.naturalGasData.modificationCost + this.waterData.modificationCost + this.compressedAirData.modificationCost + this.steamData.modificationCost + this.wasteWaterData.modificationCost + this.otherFuelData.modificationCost,
        totalCostSavings: this.electricityData.totalCostSavings + this.naturalGasData.totalCostSavings + this.waterData.totalCostSavings + this.compressedAirData.totalCostSavings + this.steamData.totalCostSavings + this.wasteWaterData.totalCostSavings + this.otherFuelData.totalCostSavings,
        totalPercentSavings: this.electricityData.totalPercentSavings + this.naturalGasData.totalPercentSavings + this.waterData.totalPercentSavings + this.compressedAirData.totalPercentSavings + this.steamData.totalPercentSavings + this.wasteWaterData.totalPercentSavings + this.otherFuelData.totalPercentSavings
      }
    }
  }


  setUtilityTotal(utilityUsed: boolean, baselineCost: number, utilityType: string): UtilityTotal {
    let opportunityCards: Array<OpportunityCardData> = this.opportunityCards;
    opportunityCards = this.sortCardsService.sortCards(opportunityCards, this.sortCardsData);
    if (utilityUsed) {
      let utilityData: UtilityTotal = this.getSavingsByUtilityType(opportunityCards, utilityType);
      return {
        baselineCost: baselineCost,
        modificationCost: baselineCost - utilityData.totalCostSavings,
        totalCostSavings: utilityData.totalCostSavings,
        totalPercentSavings: utilityData.totalPercentSavings
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


  getSavingsByUtilityType(opportunityCards: Array<OpportunityCardData>, utilityType: string): UtilityTotal {
    let filteredCards: Array<OpportunityCardData> = _.filter(opportunityCards, (data) => { return _.includes(data.utilityType, utilityType) });
    let totalPercentSavings: number = 0;
    let totalCostSavings: number = 0;
    let baselineCost: number = 0;
    let modificationCost: number = 0;
    filteredCards.forEach(card => {
      if (card.selected == true) {
        let percentSavings = _.find(card.percentSavings, (card) => { return card.label == utilityType });
        if (percentSavings) {
          totalPercentSavings = totalPercentSavings + percentSavings.percent;
          totalCostSavings = totalCostSavings + card.annualCostSavings;
          baselineCost = percentSavings.baselineCost + baselineCost;
          modificationCost = modificationCost + percentSavings.modificationCost;
        }
      }
    });
    return { totalPercentSavings: totalPercentSavings, totalCostSavings: totalCostSavings, baselineCost: baselineCost, modificationCost: modificationCost }
  }
}

export interface UtilityTotal {
  totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number
}