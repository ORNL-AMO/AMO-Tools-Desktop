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
        treasureHunt.boilerBlowdownRateOpportunities.splice(index, 1);
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

    getWaterOpportunityResults(boilerBlowdownRate: BoilerBlowdownRateTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
        this.setCalculatorInputFromOpportunity(boilerBlowdownRate);
        let baselineResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.baseline, settings, true, true);
        let modificationResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.modification, settings, true, true);
        let costSavings: number = baselineResults.makeupWaterCost - modificationResults.makeupWaterCost;
        let energySavings: number = baselineResults.makeupWaterUse - baselineResults.makeupWaterUse;
        let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
            costSavings: costSavings,
            energySavings: energySavings,
            baselineCost: baselineResults.makeupWaterCost,
            modificationCost: modificationResults.makeupWaterCost,
            utilityType: 'Water',
        }

        return treasureHuntOpportunityResults;
    }

    getGasOpportunityResults(boilerBlowdownRate: BoilerBlowdownRateTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
        this.setCalculatorInputFromOpportunity(boilerBlowdownRate);
        let baselineResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.baseline, settings, true, true);
        let modificationResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.modification, settings, true, true);
        let costSavings: number = baselineResults.boilerFuelCost - modificationResults.boilerFuelCost;
        let energySavings: number = baselineResults.boilerFuelUse - baselineResults.boilerFuelUse;
        let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
            costSavings: costSavings,
            energySavings: energySavings,
            baselineCost: baselineResults.boilerFuelCost,
            modificationCost: modificationResults.boilerFuelCost,
            utilityType: boilerBlowdownRate.baseline.boilerUtilityType,
        }
        return treasureHuntOpportunityResults;
    }


    getTreasureHuntOpportunityResults(boilerBlowdownRate: BoilerBlowdownRateTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
        let baselineResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.baseline, settings, true, true);
        let modificationResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.modification, settings, true, true);
        let costSavings: number = baselineResults.totalCost - modificationResults.totalCost;
        let energySavings: number = baselineResults.makeupWaterUse - baselineResults.makeupWaterUse;
        let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
            costSavings: costSavings,
            energySavings: energySavings,
            baselineCost: baselineResults.totalCost,
            modificationCost: modificationResults.totalCost,
            utilityType: 'Mixed',
        }

        return treasureHuntOpportunityResults;
    }

    getBoilerBlowdownRateCardData(opportunity: BoilerBlowdownRateTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
        let energyData = this.getEnergyData(opportunity, settings, currentEnergyUsage, opportunitySummary,);
    
        let cardData: OpportunityCardData = {
            implementationCost: opportunitySummary.totalCost,
            paybackPeriod: opportunitySummary.payback,
            selected: opportunity.selected,
            opportunityType: 'boiler-blowdown-rate',
            opportunityIndex: index,
            annualCostSavings: opportunitySummary.costSavings,
            annualEnergySavings: energyData.annualEnergySavings,
            percentSavings: energyData.percentSavings,
            utilityType: energyData.utilityTypes,
            boilerBlowdownRate: opportunity,
            name: opportunitySummary.opportunityName,
            opportunitySheet: opportunity.opportunitySheet,
            iconString: 'assets/images/calculator-icons/steam-icons/blowdown-rate.png',
            teamName: opportunity.opportunitySheet ? opportunity.opportunitySheet.owner : undefined,
            iconCalcType: 'steam',
            needBackground: true
        }
        return cardData;
    }

    getEnergyData(boilerBlowdownRate: BoilerBlowdownRateTreasureHunt, settings: Settings, currentEnergyUsage: EnergyUsage, opportunitySummary: OpportunitySummary): {
        annualEnergySavings: Array<{
            savings: number,
            label: string,
            energyUnit: string
        }>,
        percentSavings: Array<{ percent: number, label: string, baselineCost: number, modificationCost: number }>,
        utilityTypes: Array<string>
    } {
        let annualEnergySavings: Array<{ savings: number, label: string, energyUnit: string }> = new Array();
        let percentSavings: Array<{ percent: number, label: string, baselineCost: number, modificationCost: number }> = new Array();
        let utilityTypes: Array<string> = new Array();
        let baselineResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.baseline, settings, true, true);
        let modificationResults: BoilerBlowdownRateResults = this.boilerBlowdownRateService.calculateResults(boilerBlowdownRate.modification, settings, true, true);
        
        let currentCosts: number = 0;
        if (boilerBlowdownRate.baseline.boilerUtilityType == 'Natural Gas') {
            currentCosts = currentEnergyUsage.naturalGasCosts;
        } else if (boilerBlowdownRate.baseline.boilerUtilityType == 'Other Fuel') {
            currentCosts = currentEnergyUsage.otherFuelCosts;
        }

        let fuelUnit: string = 'MMBTu/yr';
        if (settings.unitsOfMeasure == 'Metric') {
            fuelUnit = 'MJ/yr';
        }
        annualEnergySavings.push({
            savings: baselineResults.boilerFuelUse - modificationResults.boilerFuelUse,
            label: boilerBlowdownRate.baseline.boilerUtilityType,
            energyUnit: fuelUnit
        });
        percentSavings.push(
            {
                percent: ((baselineResults.boilerFuelCost - modificationResults.boilerFuelCost) / currentCosts) * 100,
                label: boilerBlowdownRate.baseline.boilerUtilityType,
                baselineCost: baselineResults.boilerFuelCost,
                modificationCost: modificationResults.boilerFuelCost
            }
        )
        utilityTypes.push(boilerBlowdownRate.baseline.boilerUtilityType);

        let waterUnit: string = 'L/yr';
        if (settings.unitsOfMeasure == 'Metric') {
            waterUnit = 'gal/yr';
        }
        annualEnergySavings.push({
            savings: baselineResults.makeupWaterUse - modificationResults.makeupWaterUse,
            label: 'Water',
            energyUnit: waterUnit
        });
        percentSavings.push(
            {
                percent: ((baselineResults.makeupWaterCost - modificationResults.makeupWaterCost) / currentEnergyUsage.waterCosts) * 100,
                label: 'Water',
                baselineCost: baselineResults.makeupWaterCost,
                modificationCost: modificationResults.makeupWaterCost
            }
        )
        utilityTypes.push('Water');

        return { annualEnergySavings: annualEnergySavings, percentSavings: percentSavings, utilityTypes: utilityTypes }

    }

    convertBoilerBlowdownRates(boilerBlowdownRate: Array<BoilerBlowdownRateTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<BoilerBlowdownRateTreasureHunt> {
        boilerBlowdownRate.forEach(boiler => {
            boiler.baseline = this.convertBoilerBlowdownRate(boiler.baseline, oldSettings, newSettings);

            if (boiler.modification) {
                boiler.modification = this.convertBoilerBlowdownRate(boiler.modification, oldSettings, newSettings);
            }
        });
        return boilerBlowdownRate;
    }

    convertBoilerBlowdownRate(boiler: BoilerBlowdownRateInputs, oldSettings: Settings, newSettings: Settings): BoilerBlowdownRateInputs {
        boiler.steamFlow = this.convertUnitsService.value(boiler.steamFlow).from(oldSettings.steamMassFlowMeasurement).to(newSettings.steamMassFlowMeasurement);
        boiler.steamTemperature = this.convertUnitsService.value(boiler.steamTemperature).from(oldSettings.steamTemperatureMeasurement).to(newSettings.steamTemperatureMeasurement);
        boiler.makeupWaterTemperature = this.convertUnitsService.value(boiler.makeupWaterTemperature).from(oldSettings.steamTemperatureMeasurement).to(newSettings.steamTemperatureMeasurement);
        return boiler;
    }



}