import { Injectable } from '@angular/core';
import { AssessmentOpportunity, AssessmentOpportunityResult, AssessmentOpportunityResults, EnergyUsage, EnergyUseItem, OpportunityCost, OpportunitySheetResults, OpportunitySummary, Treasure, TreasureHunt } from '../../shared/models/treasure-hunt';
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

  getResults(assessmentOpportunity: AssessmentOpportunity, settings: Settings): AssessmentOpportunityResults {
    let energyTypes: Set<string> =  new Set(assessmentOpportunity.baselineEnergyUseItems.map(energyItem => energyItem.type));

    let totalCostSavings: number = 0;
    let baselineElectricityResult: { energyUse: number, energyCost: number, numItems: number };
    let modificationElectricityResult: { energyUse: number, energyCost: number, numItems: number };
    let electricityResults: AssessmentOpportunityResult;

    let baselineGasResult: { energyUse: number, energyCost: number, numItems: number };
    let modificationGasResult: { energyUse: number, energyCost: number, numItems: number };
    let gasResults: AssessmentOpportunityResult;

    let baselineCompressedAirResult: { energyUse: number, energyCost: number, numItems: number };
    let modificationCompressedAirResult: { energyUse: number, energyCost: number, numItems: number };
    let compressedAirResults: AssessmentOpportunityResult;

    let baselineOtherFuelResult: { energyUse: number, energyCost: number, numItems: number };
    let modificationOtherFuelResult: { energyUse: number, energyCost: number, numItems: number };
    let otherFuelResults: AssessmentOpportunityResult;

    let baselineSteamResult: { energyUse: number, energyCost: number, numItems: number };
    let modificationSteamResult: { energyUse: number, energyCost: number, numItems: number };
    let steamResults: AssessmentOpportunityResult;

    let baselineWaterResult: { energyUse: number, energyCost: number, numItems: number };
    let modificationWaterResult: { energyUse: number, energyCost: number, numItems: number };
    let waterResults: AssessmentOpportunityResult;

    let baselineWasterWaterResult: { energyUse: number, energyCost: number, numItems: number };
    let modificationWasteWaterResult: { energyUse: number, energyCost: number, numItems: number };
    let wasteWaterResults: AssessmentOpportunityResult;

    if (energyTypes.has('Electricity')) {
      baselineElectricityResult = this.getEnergyUseData(assessmentOpportunity.baselineEnergyUseItems, 'Electricity');
      modificationElectricityResult = this.getEnergyUseData(assessmentOpportunity.modificationEnergyUseItems, 'Electricity');
      electricityResults = this.getAssessmentOpportunityResult(baselineElectricityResult, modificationElectricityResult);
      totalCostSavings += electricityResults.energyCostSavings;
    }

    if (energyTypes.has('Gas')) {
      baselineGasResult = this.getEnergyUseData(assessmentOpportunity.baselineEnergyUseItems, 'Gas');
      modificationGasResult = this.getEnergyUseData(assessmentOpportunity.modificationEnergyUseItems, 'Gas');
      gasResults = this.getAssessmentOpportunityResult(baselineGasResult, modificationGasResult);
      totalCostSavings += gasResults.energyCostSavings;
    }

    if (energyTypes.has('Compressed Air')) {
      baselineCompressedAirResult = this.getEnergyUseData(assessmentOpportunity.baselineEnergyUseItems, 'Compressed Air');
      modificationCompressedAirResult = this.getEnergyUseData(assessmentOpportunity.modificationEnergyUseItems, 'Compressed Air');
      compressedAirResults = this.getAssessmentOpportunityResult(baselineCompressedAirResult, modificationCompressedAirResult);
      totalCostSavings += compressedAirResults.energyCostSavings;
    }

    if (energyTypes.has('Other Fuel')) {
      baselineOtherFuelResult = this.getEnergyUseData(assessmentOpportunity.baselineEnergyUseItems, 'Other Fuel');
      modificationOtherFuelResult = this.getEnergyUseData(assessmentOpportunity.modificationEnergyUseItems, 'Other Fuel');
      otherFuelResults = this.getAssessmentOpportunityResult(baselineOtherFuelResult, modificationOtherFuelResult);
      totalCostSavings += otherFuelResults.energyCostSavings;
    }

    if (energyTypes.has('Steam')) {
      baselineSteamResult = this.getEnergyUseData(assessmentOpportunity.baselineEnergyUseItems, 'Steam');
      modificationSteamResult = this.getEnergyUseData(assessmentOpportunity.modificationEnergyUseItems, 'Steam');
      steamResults = this.getAssessmentOpportunityResult(baselineSteamResult, modificationSteamResult);
      totalCostSavings += steamResults.energyCostSavings;
    }

    if (energyTypes.has('Water')) {
      baselineWaterResult = this.getEnergyUseData(assessmentOpportunity.baselineEnergyUseItems, 'Water');
      modificationWaterResult = this.getEnergyUseData(assessmentOpportunity.modificationEnergyUseItems, 'Water');
      waterResults = this.getAssessmentOpportunityResult(baselineWaterResult, modificationWaterResult);
      totalCostSavings += waterResults.energyCostSavings;
    }

    if (energyTypes.has('WWT')) {
      baselineWasterWaterResult = this.getEnergyUseData(assessmentOpportunity.baselineEnergyUseItems, 'WWT');
      modificationWasteWaterResult = this.getEnergyUseData(assessmentOpportunity.modificationEnergyUseItems, 'WWT');
      wasteWaterResults = this.getAssessmentOpportunityResult(baselineWasterWaterResult, modificationWasteWaterResult);
      totalCostSavings += wasteWaterResults.energyCostSavings;
    }

    let totalImplementationCost: number = this.getOppSheetImplementationCost(assessmentOpportunity.opportunityCost);

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

  getEnergyUseData(oppItems: Array<EnergyUseItem>, type: string): { energyUse: number, energyCost: number, numItems: number } {
    let items: Array<EnergyUseItem> = oppItems.filter(item => { return item.type == type });
    let energyUse: number = 0;
    let integratedCost: number = 0;
    let numItems: number = 0;
    if (items) {
      items.forEach(item => {
        energyUse = energyUse + item.amount;
        if (item.integratedEnergyCost) {
          integratedCost = integratedCost + item.integratedEnergyCost;
        }
      });
      numItems = items.length;
    }

    let energyData =  {
      energyUse: energyUse,
      energyCost: integratedCost,
      numItems: numItems
    }
    return energyData;
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
