import { Injectable } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { Settings } from '../../shared/models/settings';
import { BoilerBlowdownRateTreasureHunt, EnergyUsage, OpportunitySummary, TreasureHunt, TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import * as _ from 'lodash';
import { BoilerBlowdownRateInputs, BoilerBlowdownRateResults, BoilerBlowdownRateService } from '../../calculator/steam/boiler-blowdown-rate/boiler-blowdown-rate.service';

@Injectable()
export class BoilerBlowdownRateTreasureHuntService {

    constructor(private boilerBlowdownRateService: BoilerBlowdownRateService, private convertUnitsService: ConvertUnitsService) { }


    initNewCalculator() {
        this.resetCalculatorInputs();
    }

    setCalculatorInputFromOpportunity(boilerBlowdownRate: BoilerBlowdownRateTreasureHunt) {
        this.boilerBlowdownRateService.baselineInputs.next(boilerBlowdownRate.baseline);
        this.boilerBlowdownRateService.modificationInputs.next(boilerBlowdownRate.modification);
    }

    deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
        treasureHunt.steamReductions.splice(index, 1);
        return treasureHunt;
    }

    saveTreasureHuntOpportunity(boilerBlowdownRate: BoilerBlowdownRateTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
        if (!treasureHunt.boilerBlowdownRateOpportunities) {
            treasureHunt.boilerBlowdownRateOpportunities = new Array();
        }
        treasureHunt.boilerBlowdownRateOpportunities.push(boilerBlowdownRate);
        return treasureHunt;
    }

    resetCalculatorInputs() {
        this.boilerBlowdownRateService.baselineInputs.next(undefined);
        this.boilerBlowdownRateService.modificationInputs.next(undefined);
    }


    getTreasureHuntOpportunityResults(boilerBlowdownRate: BoilerBlowdownRateTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
        let baselineResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.baseline, settings, true, true);
        let modificationResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.modification, settings, true, true);
        let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
            costSavings: baselineResults.makeupWaterCost - modificationResults.makeupWaterCost,
            energySavings: (baselineResults.makeupWaterCost - modificationResults.makeupWaterCost) / settings.waterCost,
            baselineCost: baselineResults.makeupWaterCost,
            modificationCost: modificationResults.makeupWaterCost,
            utilityType: 'Water',
        }

        return treasureHuntOpportunityResults;
    }

    getBoilerBlowdownRateCardData(opportunity: BoilerBlowdownRateTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
        let unitStr: string = 'm3';
        if (settings.unitsOfMeasure == 'Imperial') {
            unitStr = 'kgal';
        }
        let utilityCost: number = currentEnergyUsage.waterCosts;

        let cardData: OpportunityCardData = {
            implementationCost: opportunitySummary.totalCost,
            paybackPeriod: opportunitySummary.payback,
            selected: opportunity.selected,
            opportunityType: 'boiler-blowdown-rate',
            opportunityIndex: index,
            annualCostSavings: opportunitySummary.costSavings,
            annualEnergySavings: [{
                savings: opportunitySummary.totalEnergySavings,
                energyUnit: unitStr,
                label: opportunitySummary.utilityType
            }],
            utilityType: [opportunitySummary.utilityType],
            percentSavings: [{
                percent: (opportunitySummary.costSavings / utilityCost) * 100,
                label: opportunitySummary.utilityType,
                baselineCost: opportunitySummary.baselineCost,
                modificationCost: opportunitySummary.modificationCost,
            }],
            boilerBlowdownRate: opportunity,
            name: opportunitySummary.opportunityName,
            opportunitySheet: opportunity.opportunitySheet,
            iconString: 'assets/images/calculator-icons/steam-icons/blowdown-rate.png',
            teamName: opportunity.opportunitySheet ? opportunity.opportunitySheet.owner : undefined
        }
        return cardData;
    }

    convertBoilerBlowdownRates(boilerBlowdownRate: Array<BoilerBlowdownRateTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<BoilerBlowdownRateTreasureHunt> {
        boilerBlowdownRate.forEach(boiler => {
            boiler.baseline = this.convertBoilerBlowdownRate(boiler.baseline, oldSettings, newSettings);
         
            if (boiler.modification) {               
                boiler.modification = this.convertBoilerBlowdownRate(boiler.modification, oldSettings, newSettings);
             
            }
        })
        return boilerBlowdownRate;
    }

    convertBoilerBlowdownRate(boiler: BoilerBlowdownRateInputs, oldSettings: Settings, newSettings: Settings): BoilerBlowdownRateInputs {
      
        return boiler;
    }



}