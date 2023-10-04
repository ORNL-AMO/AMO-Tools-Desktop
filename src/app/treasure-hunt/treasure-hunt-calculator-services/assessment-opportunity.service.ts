import { Injectable } from '@angular/core';
import { AssessmentOpportunity, AssessmentOpportunityResult, AssessmentOpportunityResults, EnergyUseItem, OpportunityCost, OpportunitySheetResults, Treasure, TreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';

@Injectable({
  providedIn: 'root'
})
export class AssessmentOpportunityService {

  defaultSheetName: string = 'New Opportunity';
  assessmentOpportunity: AssessmentOpportunity;
  constructor() { }
  
  initAssessmentOpportunity(): AssessmentOpportunity {
    return {
      name: this.defaultSheetName,
      equipment: 'pump',
      description: '',
      originator: '',
      date: new Date(),
      owner: '',
      businessUnits: '',
      iconString: 'assets/images/app-icon.png',
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
      opportunityType: Treasure.assessmentOpportunity,
      existingIntegrationData: undefined
    };
  }

  getResults(opportunitySheet: AssessmentOpportunity, settings: Settings): OpportunitySheetResults {
    let baselineElectricityResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.electricityCost, 'Electricity');
    let modificationElectricityResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.electricityCost, 'Electricity');
    let electricityResults: AssessmentOpportunityResult = this.getAssessmentOpportunityResult(baselineElectricityResult, modificationElectricityResult);

    let baselineGasResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.fuelCost, 'Gas');
    let modificationGasResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.fuelCost, 'Gas');
    let gasResults: AssessmentOpportunityResult = this.getAssessmentOpportunityResult(baselineGasResult, modificationGasResult);

    let baselineCompressedAirResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.compressedAirCost, 'Compressed Air');
    let modificationCompressedAirResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.compressedAirCost, 'Compressed Air');
    let compressedAirResults: AssessmentOpportunityResult = this.getAssessmentOpportunityResult(baselineCompressedAirResult, modificationCompressedAirResult);

    let baselineOtherFuelResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.otherFuelCost, 'Other Fuel');
    let modificationOtherFuelResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.otherFuelCost, 'Other Fuel');
    let otherFuelResults: AssessmentOpportunityResult = this.getAssessmentOpportunityResult(baselineOtherFuelResult, modificationOtherFuelResult);

    let baselineSteamResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.steamCost, 'Steam');
    let modificationSteamResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.steamCost, 'Steam');
    let steamResults: AssessmentOpportunityResult = this.getAssessmentOpportunityResult(baselineSteamResult, modificationSteamResult);

    let baselineWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.waterCost, 'Water');
    let modificationWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.waterCost, 'Water');
    let waterResults: AssessmentOpportunityResult = this.getAssessmentOpportunityResult(baselineWaterResult, modificationWaterResult);

    let baselineWasterWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.baselineEnergyUseItems, settings.waterWasteCost, 'WWT');
    let modificationWasteWaterResult: { energyUse: number, energyCost: number, numItems: number } = this.getEnergyUseData(opportunitySheet.modificationEnergyUseItems, settings.waterWasteCost, 'WWT');
    let wasteWaterResults: AssessmentOpportunityResult = this.getAssessmentOpportunityResult(baselineWasterWaterResult, modificationWasteWaterResult);

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

  getEnergyUseData(oppItems: Array<EnergyUseItem>, unitCost: number, type: string): { energyUse: number, energyCost: number, numItems: number } {
    let items: Array<EnergyUseItem> = oppItems.filter(item => { return item.type == type });
    let energyUse: number = 0;
    let numItems: number = 0;
    if (items) {
      items.forEach(item => {
        energyUse = energyUse + item.amount;
      });
      numItems = items.length;
    }
    return {
      energyUse: energyUse,
      energyCost: energyUse * unitCost,
      numItems: numItems
    }
  }

  getAssessmentOpportunityResult(baseline: { energyUse: number, energyCost: number, numItems: number }, modification: { energyUse: number, energyCost: number, numItems: number }): AssessmentOpportunityResult {
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

  saveTreasureHuntOpportunity(assessmentOpportunity: AssessmentOpportunity, treasureHunt: TreasureHunt): TreasureHunt {
    if (!treasureHunt.assessmentOpportunities) {
      treasureHunt.assessmentOpportunities = new Array();
    }
    treasureHunt.assessmentOpportunities.push(assessmentOpportunity);
    return treasureHunt;
  }
 
  deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
    treasureHunt.assessmentOpportunities.splice(index, 1);
    return treasureHunt;
  }
}
