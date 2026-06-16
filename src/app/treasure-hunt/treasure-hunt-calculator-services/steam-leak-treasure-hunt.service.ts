import { Injectable } from '@angular/core';
import { SteamLeakSurveyService } from '../../calculator/steam/steam-leak/steam-leak-survey-service';
import { TreasureHuntOpportunityResults } from '../../shared/models/treasure-hunt';
import { TreasureHunt } from '../../shared/models/treasure-hunt';
import { SteamLeakSurveyTreasureHunt } from '../../shared/models/treasure-hunt';
import { Settings } from '../../shared/models/settings';
import { ConvertSteamLeakService } from '../../calculator/steam/steam-leak/convert-steam-leak.service';
import { OpportunitySummary } from '../../shared/models/treasure-hunt';
import { OpportunityCardData } from '../treasure-chest/opportunity-cards/opportunity-cards.service';
import { EnergyUsage } from '../../shared/models/treasure-hunt';
import { SteamLeakSurveyData, SteamLeakSurveyInput } from '../../shared/models/standalone';
import * as _ from 'lodash';
@Injectable()
    export class SteamLeakTreasureHuntService {
    constructor(
        private steamLeakService: SteamLeakSurveyService,
        private convertSteamLeakService: ConvertSteamLeakService,
    ) {}

    initNewCalculator() {
        this.steamLeakService.steamLeakInput.set(undefined);
    }

    setCalculatorInputFromOpportunity(steamLeakSurvey: SteamLeakSurveyTreasureHunt, treasureHunt: TreasureHunt) {
        let steamLeakInput = _.cloneDeep(steamLeakSurvey.steamLeakSurveyInput);
        this.steamLeakService.steamLeakInput.set(steamLeakInput);
    }

    deleteOpportunity(index: number, treasureHunt: TreasureHunt): TreasureHunt {
        treasureHunt.steamLeakSurveys.splice(index, 1);
        return treasureHunt;
    }

    saveTreasureHuntOpportunity(steamLeakSurvey: SteamLeakSurveyTreasureHunt, treasureHunt: TreasureHunt): TreasureHunt {
        if (!treasureHunt.steamLeakSurveys) {
            treasureHunt.steamLeakSurveys = new Array();
        }
        treasureHunt.steamLeakSurveys.push(steamLeakSurvey);
        return treasureHunt;
    }

    resetCalculatorInputs() {
        this.steamLeakService.steamLeakInput.set(undefined);
    }

    getTreasureHuntOpportunityResults(steamLeakSurveyTreasureHunt: SteamLeakSurveyTreasureHunt, settings: Settings): TreasureHuntOpportunityResults {
        const results = this.steamLeakService.getResults(settings, steamLeakSurveyTreasureHunt.steamLeakSurveyInput);

        let treasureHuntOpportunityResults: TreasureHuntOpportunityResults = {
            costSavings: results.savings.leakCost,
            energySavings: 0,
            baselineCost: results.savings.leakCost,
            modificationCost: 0,
            utilityType: 'Steam',
        };

        // facilityUtilityType: 0 = Steam, 1 = Electricity, 2 = Natural Gas
        const facilityUtilityType = steamLeakSurveyTreasureHunt.steamLeakSurveyInput.facilitySteamLeakData.utilityType;
        if (facilityUtilityType === 1) {
            treasureHuntOpportunityResults.energySavings = results.savings.energyLoss;
            treasureHuntOpportunityResults.utilityType = 'Electricity';
        } else if (facilityUtilityType === 2) {
            treasureHuntOpportunityResults.energySavings = results.savings.energyLoss;
            treasureHuntOpportunityResults.utilityType = 'Natural Gas';
        } else {
            treasureHuntOpportunityResults.energySavings = results.savings.steamLoss;
            treasureHuntOpportunityResults.utilityType = 'Steam';
        }

        return treasureHuntOpportunityResults;
    }

    getSteamLeakSurveyCardData(steamLeakSurvey: SteamLeakSurveyTreasureHunt, opportunitySummary: OpportunitySummary, settings: Settings, index: number, currentEnergyUsage: EnergyUsage): OpportunityCardData {
        let unitStr: string;
        let currentCosts: number;
        // utilityType: 0 = Steam, 1 = Electricity, 2 = Natural Gas
        const facilityUtilityType = steamLeakSurvey.steamLeakSurveyInput.facilitySteamLeakData.utilityType;
        if (facilityUtilityType === 1) {
            currentCosts = currentEnergyUsage.electricityCosts;
            unitStr = 'kWh';
        } else if (facilityUtilityType === 2) {
            currentCosts = currentEnergyUsage.naturalGasCosts;
            unitStr = settings.unitsOfMeasure === 'Metric' ? 'GJ' : 'MMBtu';
        } else {
            currentCosts = currentEnergyUsage.steamCosts;
            unitStr = settings.unitsOfMeasure === 'Metric' ? 'kg' : 'lb';
        }

        let annualCostSavings: number = opportunitySummary.costSavings;
        if (steamLeakSurvey.opportunitySheet) {
            if (steamLeakSurvey.opportunitySheet.opportunityCost.additionalAnnualSavings) {
                annualCostSavings += steamLeakSurvey.opportunitySheet.opportunityCost.additionalAnnualSavings.cost;
            }
        }

        let cardData: OpportunityCardData = {
            implementationCost: opportunitySummary.totalCost,
            paybackPeriod: opportunitySummary.payback,
            selected: steamLeakSurvey.selected,
            opportunityType: 'steam-leak-survey',
            opportunityIndex: index,
            annualCostSavings: annualCostSavings,
            annualEnergySavings: [{
                savings: opportunitySummary.totalEnergySavings,
                energyUnit: unitStr,
                label: opportunitySummary.utilityType
            }],
            utilityType: [opportunitySummary.utilityType],
            percentSavings: [{
                percent: (opportunitySummary.costSavings / currentCosts) * 100,
                label: opportunitySummary.utilityType,
                baselineCost: opportunitySummary.baselineCost,
                modificationCost: opportunitySummary.modificationCost,
            }],
            steamLeakSurvey: steamLeakSurvey,
            name: opportunitySummary.opportunityName,
            opportunitySheet: steamLeakSurvey.opportunitySheet,
            iconString: 'assets/images/calculator-icons/utilities-icons/steam-reduction-icon.png',
            teamName: steamLeakSurvey.opportunitySheet ? steamLeakSurvey.opportunitySheet.owner : undefined,
            iconCalcType: 'steam',
            needBackground: true
        };
        return cardData;
    }

    convertSteamLeakSurveys(steamLeakSurveys: Array<SteamLeakSurveyTreasureHunt>, oldSettings: Settings, newSettings: Settings): Array<SteamLeakSurveyTreasureHunt> {
        steamLeakSurveys.forEach(steamLeakSurvey => {
            steamLeakSurvey.steamLeakSurveyInput = this.convertSteamLeakSurveyInput(steamLeakSurvey.steamLeakSurveyInput, oldSettings, newSettings);
        });
        return steamLeakSurveys;
    }

    convertSteamLeakSurveyInput(survey: SteamLeakSurveyInput, oldSettings: Settings, newSettings: Settings): SteamLeakSurveyInput {
        survey.steamLeakSurveyInputVec = survey.steamLeakSurveyInputVec.map((input: SteamLeakSurveyData) => {
            if (oldSettings.unitsOfMeasure === 'Imperial' && newSettings.unitsOfMeasure === 'Metric') {
                return this.convertSteamLeakService.convertInputDataImperialToMetric(input);
            } else if (oldSettings.unitsOfMeasure === 'Metric' && newSettings.unitsOfMeasure === 'Imperial') {
                return this.convertSteamLeakService.convertInputDataMetricToImperial(input);
            }
            return input;
        });
        survey.facilitySteamLeakData = this.convertSteamLeakService.convertFacilitySteamLeakData(survey.facilitySteamLeakData, oldSettings, newSettings);
        return survey;
    }

}