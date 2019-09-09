import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { OpportunityCardsService, OpportunityCardData } from '../opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';
import { TreasureChestMenuService } from '../treasure-chest-menu/treasure-chest-menu.service';
import { SortCardsData } from '../opportunity-cards/sort-cards-by.pipe';
import { SortCardsService } from '../opportunity-cards/sort-cards.service';

@Component({
  selector: 'app-summary-card',
  templateUrl: './summary-card.component.html',
  styleUrls: ['./summary-card.component.css']
})
export class SummaryCardComponent implements OnInit {
  @Input()
  settings: Settings;

  electricityData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number }
  naturalGasData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number }
  compressedAirData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number }
  waterData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number }
  wasteWaterData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number }
  steamData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number }
  otherFuelData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number }

  totals: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number };
  opportunityCardsSub: Subscription;
  sortBySub: Subscription;
  sortCardsData: SortCardsData;
  opportunityCards: Array<OpportunityCardData>;
  constructor(private opportunityCardsService: OpportunityCardsService, private treasureChestMenuService: TreasureChestMenuService,
    private sortCardsService: SortCardsService) { }

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
  }

  setSavingsData() {
    if (this.sortCardsData != undefined && this.opportunityCards != undefined) {
      let opportunityCards: Array<OpportunityCardData> = this.opportunityCards;
      opportunityCards = this.sortCardsService.sortCards(opportunityCards, this.sortCardsData);
      let electricityData = this.getSavingsByUtilityType(opportunityCards, 'Electricity');
      this.electricityData = {
        baselineCost: electricityData.baselineCost,
        modificationCost: electricityData.modificationCost,
        totalCostSavings: electricityData.totalCostSavings,
        totalPercentSavings: electricityData.totalPercentSavings
      }
      let naturalGas = this.getSavingsByUtilityType(opportunityCards, 'Natural Gas');
      this.naturalGasData = {
        baselineCost: naturalGas.baselineCost,
        modificationCost: naturalGas.modificationCost,
        totalCostSavings: naturalGas.totalCostSavings,
        totalPercentSavings: naturalGas.totalPercentSavings
      }
      let water = this.getSavingsByUtilityType(opportunityCards, 'Water');
      this.waterData = {
        baselineCost: water.baselineCost,
        modificationCost: water.modificationCost,
        totalCostSavings: water.totalCostSavings,
        totalPercentSavings: water.totalPercentSavings
      }
      let compressedAir = this.getSavingsByUtilityType(opportunityCards, 'Compressed Air');
      this.compressedAirData = {
        baselineCost: compressedAir.baselineCost,
        modificationCost: compressedAir.modificationCost,
        totalCostSavings: compressedAir.totalCostSavings,
        totalPercentSavings: compressedAir.totalPercentSavings
      }
      let steam = this.getSavingsByUtilityType(opportunityCards, 'Steam');
      this.steamData = {
        baselineCost: steam.baselineCost,
        modificationCost: steam.modificationCost,
        totalCostSavings: steam.totalCostSavings,
        totalPercentSavings: steam.totalPercentSavings
      }
      let wasteWater = this.getSavingsByUtilityType(opportunityCards, 'Waste Water');
      this.wasteWaterData = {
        baselineCost: wasteWater.baselineCost,
        modificationCost: wasteWater.modificationCost,
        totalCostSavings: wasteWater.totalCostSavings,
        totalPercentSavings: wasteWater.totalPercentSavings
      }
      let otherFuel = this.getSavingsByUtilityType(opportunityCards, 'Other Fuel');
      this.otherFuelData = {
        baselineCost: otherFuel.baselineCost,
        modificationCost: otherFuel.modificationCost,
        totalCostSavings: otherFuel.totalCostSavings,
        totalPercentSavings: otherFuel.totalPercentSavings
      }
      this.totals = {
        baselineCost: this.electricityData.baselineCost + this.naturalGasData.baselineCost + this.waterData.baselineCost + this.compressedAirData.baselineCost + this.steamData.baselineCost + this.wasteWaterData.baselineCost + this.otherFuelData.baselineCost,
        modificationCost: this.electricityData.modificationCost + this.naturalGasData.modificationCost + this.waterData.modificationCost + this.compressedAirData.modificationCost + this.steamData.modificationCost + this.wasteWaterData.modificationCost + this.otherFuelData.modificationCost,
        totalCostSavings: this.electricityData.totalCostSavings + this.naturalGasData.totalCostSavings + this.waterData.totalCostSavings + this.compressedAirData.totalCostSavings + this.steamData.totalCostSavings + this.wasteWaterData.totalCostSavings + this.otherFuelData.totalCostSavings,
        totalPercentSavings: this.electricityData.totalPercentSavings + this.naturalGasData.totalPercentSavings + this.waterData.totalPercentSavings + this.compressedAirData.totalPercentSavings + this.steamData.totalPercentSavings + this.wasteWaterData.totalPercentSavings + this.otherFuelData.totalPercentSavings
      }
    }
  }


  getSavingsByUtilityType(opportunityCards: Array<OpportunityCardData>, utilityType: string): { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number } {
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
          totalCostSavings = totalCostSavings + (percentSavings.baselineCost - percentSavings.modificationCost);
          baselineCost = percentSavings.baselineCost + baselineCost;
          modificationCost = modificationCost + percentSavings.modificationCost;
        }
      }
    });
    return { totalPercentSavings: totalPercentSavings, totalCostSavings: totalCostSavings, baselineCost: baselineCost, modificationCost: modificationCost }
  }

}
