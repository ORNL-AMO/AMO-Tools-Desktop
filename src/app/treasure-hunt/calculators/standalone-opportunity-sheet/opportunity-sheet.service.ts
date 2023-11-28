import { Injectable } from '@angular/core';
import { OpportunitySheet, OpportunitySheetResult, OpportunitySheetResults, EnergyUseItem, OpportunityCost, Treasure } from '../../../shared/models/treasure-hunt';
import { Settings } from '../../../shared/models/settings';
import * as _ from 'lodash';

@Injectable()
export class OpportunitySheetService {

  defaultSheetName: string = 'New Opportunity';
  opportunitySheet: OpportunitySheet;
  constructor() { }

  initOpportunitySheet(): OpportunitySheet {
    return {
      name: this.defaultSheetName,
      equipment: '',
      description: '',
      originator: '',
      date: new Date(),
      owner: '',
      businessUnits: '',
      iconString: "assets/images/calculator-icons/opportunity-sheet-icon.png",
      opportunityCost: {
        engineeringServices: 0,
        material: 0,
        otherCosts: [],
        costDescription: '',
        labor: 0,
        additionalSavings: undefined
      },
      baselineEnergyUseItems: [{
        type: 'Electricity',
        amount: 0
      }],
      modificationEnergyUseItems: [],
      opportunityType: Treasure.opportunitySheet
    };
  }

  getResults(opportunitySheet: OpportunitySheet, settings: Settings): OpportunitySheetResults {
    let baselineElectricityResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.electricityCost, 'Electricity', settings);
    let modificationElectricityResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.electricityCost, 'Electricity', settings);
    let electricityResults: OpportunitySheetResult = this.getOpportunitySheetResult(baselineElectricityResult, modificationElectricityResult);

    let baselineGasResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.fuelCost, 'Gas', settings);
    let modificationGasResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.fuelCost, 'Gas', settings);
    let gasResults: OpportunitySheetResult = this.getOpportunitySheetResult(baselineGasResult, modificationGasResult);

    let baselineCompressedAirResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.compressedAirCost, 'Compressed Air', settings);
    let modificationCompressedAirResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.compressedAirCost, 'Compressed Air', settings);
    let compressedAirResults: OpportunitySheetResult = this.getOpportunitySheetResult(baselineCompressedAirResult, modificationCompressedAirResult);

    let baselineOtherFuelResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.otherFuelCost, 'Other Fuel', settings);
    let modificationOtherFuelResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.otherFuelCost, 'Other Fuel', settings);
    let otherFuelResults: OpportunitySheetResult = this.getOpportunitySheetResult(baselineOtherFuelResult, modificationOtherFuelResult);

    let baselineSteamResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.steamCost, 'Steam', settings);
    let modificationSteamResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.steamCost, 'Steam', settings);
    let steamResults: OpportunitySheetResult = this.getOpportunitySheetResult(baselineSteamResult, modificationSteamResult);

    let baselineWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.waterCost, 'Water', settings);
    let modificationWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.waterCost, 'Water', settings);
    let waterResults: OpportunitySheetResult = this.getOpportunitySheetResult(baselineWaterResult, modificationWaterResult);

    let baselineWasterWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.waterWasteCost, 'WWT', settings);
    let modificationWasteWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.waterWasteCost, 'WWT', settings);
    let wasteWaterResults: OpportunitySheetResult = this.getOpportunitySheetResult(baselineWasterWaterResult, modificationWasteWaterResult);

    let totalCostSavings: number = electricityResults.energyCostSavings + gasResults.energyCostSavings + compressedAirResults.energyCostSavings + otherFuelResults.energyCostSavings + steamResults.energyCostSavings + waterResults.energyCostSavings + wasteWaterResults.energyCostSavings;
    let totalImplementationCost: number = this.getOppSheetImplementationCost(opportunitySheet.opportunityCost);
    return {
      electricityResults: electricityResults,
      gasResults: gasResults,
      compressedAirResults: compressedAirResults,
      otherFuelResults: otherFuelResults,
      steamResults: steamResults,
      waterResults: waterResults,
      wasteWaterResults: wasteWaterResults,
      totalEnergySavings: 0,
      totalCostSavings: totalCostSavings,
      totalImplementationCost: totalImplementationCost
    };
  }

  getEnergyUseData(oppItems: Array<EnergyUseItem>, unitCost: number, type: string, settings: Settings): { energyUse: number, energyCost: number, numItems: number } {
    let items: Array<EnergyUseItem> = oppItems.filter(item => { return item.type == type });
    let energyUse: number = 0;
    let numItems: number = 0;
    let energyCost : number = 0;
    if (items) {
      items.forEach(item => {
        energyUse = energyUse + item.amount;
      });
      numItems = items.length;
    }
    if ( settings.unitsOfMeasure == 'Imperial' && (type == 'Water' || type == 'WWT' || type == 'Compressed Air')) {
      energyCost = (energyUse * 1000) * unitCost; 
    } else {
      energyCost = energyUse * unitCost; 
    }
    return {
      energyUse: energyUse,
      energyCost: energyCost,
      numItems: numItems
    }
  }

  getOpportunitySheetResult(baseline: { energyUse: number, energyCost: number, numItems: number }, modification: { energyUse: number, energyCost: number, numItems: number }): OpportunitySheetResult {
    return {
      baselineEnergyUse: baseline.energyUse,
      baselineEnergyCost: baseline.energyCost,
      baselineItems: baseline.numItems,
      modificationEnergyUse: modification.energyUse,
      modificationEnergyCost: modification.energyCost,
      modificationItems: modification.numItems,
      energySavings: baseline.energyUse - modification.energyUse,
      energyCostSavings: baseline.energyCost - modification.energyCost
    }
  }

  getOppSheetImplementationCost(opportunityCost: OpportunityCost): number {
    let implementationCost: number = 0;
    if (opportunityCost) {
      implementationCost = implementationCost + opportunityCost.engineeringServices + opportunityCost.labor + opportunityCost.material;
      if (opportunityCost.otherCosts) {
        opportunityCost.otherCosts.forEach(cost => {
          implementationCost = implementationCost + cost.cost;
        })
      }
      if (opportunityCost.additionalSavings) {
        implementationCost = implementationCost - opportunityCost.additionalSavings.cost;
      }
    }
    return implementationCost;
  }
}
