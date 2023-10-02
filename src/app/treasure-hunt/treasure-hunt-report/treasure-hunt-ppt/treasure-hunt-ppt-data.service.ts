import { Injectable } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { TreasureHuntResults, OpportunitiesPaybackDetails, OpportunitySummary, OpportunitySheet, OpportunityCost, TreasureHuntCo2EmissionsResults, EnergyUsage, TreasureHunt } from '../../../shared/models/treasure-hunt';
import { TreasureHuntReportService } from '../treasure-hunt-report.service';
import { OpportunityCardData } from '../../treasure-chest/opportunity-cards/opportunity-cards.service';
import pptxgen from 'pptxgenjs';
import * as _ from 'lodash';
import * as betterPlantsPPTimg from '../better-plants-ppt-img.js';
import moment from 'moment';

@Injectable()
export class TreasureHuntPptDataService {

    constructor(private treasureHuntReportService: TreasureHuntReportService) { }

    getCostSummaryData(treasureHuntResults: TreasureHuntResults): PptxgenjsChartData[] {
        let labels = new Array<string>();
        let projectedCosts = new Array<number>();
        let costSavings = new Array<number>();
        if (treasureHuntResults.electricity.costSavings > 0) {
            labels.push('Electricity');
            projectedCosts.push(treasureHuntResults.electricity.modifiedEnergyCost);
            costSavings.push(treasureHuntResults.electricity.costSavings);
        }
        if (treasureHuntResults.naturalGas.costSavings > 0) {
            labels.push('Natural Gas');
            projectedCosts.push(treasureHuntResults.naturalGas.modifiedEnergyCost);
            costSavings.push(treasureHuntResults.naturalGas.costSavings);
        }
        if (treasureHuntResults.otherFuel.costSavings > 0) {
            labels.push('Other Fuel');
            projectedCosts.push(treasureHuntResults.otherFuel.modifiedEnergyCost);
            costSavings.push(treasureHuntResults.otherFuel.costSavings);
        }
        if (treasureHuntResults.water.costSavings > 0) {
            labels.push('Water');
            projectedCosts.push(treasureHuntResults.water.modifiedEnergyCost);
            costSavings.push(treasureHuntResults.water.costSavings);
        }
        if (treasureHuntResults.wasteWater.costSavings > 0) {
            labels.push('Wastewater');
            projectedCosts.push(treasureHuntResults.wasteWater.modifiedEnergyCost);
            costSavings.push(treasureHuntResults.wasteWater.costSavings);
        }
        if (treasureHuntResults.steam.costSavings > 0) {
            labels.push('Steam');
            projectedCosts.push(treasureHuntResults.steam.modifiedEnergyCost);
            costSavings.push(treasureHuntResults.steam.costSavings);
        }
        if (treasureHuntResults.compressedAir.costSavings > 0) {
            labels.push('Comp. Air');
            projectedCosts.push(treasureHuntResults.compressedAir.modifiedEnergyCost);
            costSavings.push(treasureHuntResults.compressedAir.costSavings);
        }
        let costSumBarData: PptxgenjsChartData[] = [
            { name: "Modification Costs", labels: labels, values: projectedCosts },
            { name: "Savings From Baseline", labels: labels, values: costSavings }
        ];
        return costSumBarData;
    }

    getPaybackData(opportunitiesPaybackDetails: OpportunitiesPaybackDetails, settings: Settings): PptxgenjsChartData[] {
        let values: Array<number> = new Array();
        let labels: Array<string> = new Array();
        values = [
            opportunitiesPaybackDetails.lessThanOneYear.totalSavings,
            opportunitiesPaybackDetails.oneToTwoYears.totalSavings,
            opportunitiesPaybackDetails.twoToThreeYears.totalSavings,
            opportunitiesPaybackDetails.moreThanThreeYears.totalSavings
        ];
        labels = [
            "Less than 1 Year (" + settings.currency + ")",
            "1 to 2 Years (" + settings.currency + ")",
            "2 to 3 Years (" + settings.currency + ")",
            "More than 3 Years (" + settings.currency + ")"
        ];
        let data: PptxgenjsChartData[] = [{
            name: "Opportunity Payback Details",
            labels: labels,
            values: values
        }];
        return data;
    }

    getCarbonEmissionData(cardonData: TreasureHuntCo2EmissionsResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (cardonData.electricityCO2Savings) {
            labels.push("Electricity");
            values.push(cardonData.electricityCO2Savings);
        }
        if (cardonData.naturalGasCO2Savings) {
            labels.push("Natural Gas");
            values.push(cardonData.naturalGasCO2Savings);
        }
        if (cardonData.otherFuelCO2Savings) {
            labels.push("Other Fuel");
            values.push(cardonData.otherFuelCO2Savings);
        }
        if (cardonData.waterCO2Savings) {
            labels.push("Water");
            values.push(cardonData.waterCO2Savings);
        }
        if (cardonData.wasteWaterCO2Savings) {
            labels.push("Wastewater");
            values.push(cardonData.wasteWaterCO2Savings);
        }
        if (cardonData.compressedAirCO2Savings) {
            labels.push("Compressed Air");
            values.push(cardonData.compressedAirCO2Savings);
        }
        if (cardonData.steamCO2Savings) {
            labels.push("Steam");
            values.push(cardonData.steamCO2Savings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Carbon",
            labels: labels,
            values: values
        }];
        return data;
    }

    getCarbonSavingsData(cardonData: TreasureHuntCo2EmissionsResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (cardonData.totalCO2Savings) {
            labels.push("Projected Emissions");
            values.push(cardonData.totalCO2ProjectedUse);
            labels.push("Emissions Savings");
            values.push(cardonData.totalCO2Savings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Carbon",
            labels: labels,
            values: values
        }];
        return data;
    }

    getCostSavingsData(treasureHunt: TreasureHuntResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (treasureHunt.totalSavings) {
            labels.push("Projected Cost");
            values.push(treasureHunt.totalModificationCost);
            labels.push("Cost Savings");
            values.push(treasureHunt.totalSavings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Cost",
            labels: labels,
            values: values
        }];
        return data;
    }

    getElectricitySavingsData(treasureHunt: TreasureHuntResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (treasureHunt.electricity.energySavings) {
            labels.push("Projected Electricity Usage");
            values.push(treasureHunt.electricity.modifiedEnergyUsage);
            labels.push("Electricity Savings");
            values.push(treasureHunt.electricity.energySavings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Electricity",
            labels: labels,
            values: values
        }];
        return data;
    }

    getNaturalGasSavingsData(treasureHunt: TreasureHuntResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (treasureHunt.naturalGas.energySavings) {
            labels.push("Projected Natural Gas Usage");
            values.push(treasureHunt.naturalGas.modifiedEnergyUsage);
            labels.push("Natural Gas Savings");
            values.push(treasureHunt.naturalGas.energySavings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Natural Gas",
            labels: labels,
            values: values
        }];
        return data;
    }

    getWaterSavingsData(treasureHunt: TreasureHuntResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (treasureHunt.water.energySavings) {
            labels.push("Projected Water Usage");
            values.push(treasureHunt.water.modifiedEnergyUsage);
            labels.push("Water Savings");
            values.push(treasureHunt.water.energySavings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Water",
            labels: labels,
            values: values
        }];
        return data;
    }

    getWastewaterSavingsData(treasureHunt: TreasureHuntResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (treasureHunt.wasteWater.energySavings) {
            labels.push("Projected Wastewater Usage");
            values.push(treasureHunt.wasteWater.modifiedEnergyUsage);
            labels.push("Wastewater Savings");
            values.push(treasureHunt.wasteWater.energySavings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Wastewater",
            labels: labels,
            values: values
        }];
        return data;
    }

    getCompAirSavingsData(treasureHunt: TreasureHuntResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (treasureHunt.compressedAir.energySavings) {
            labels.push("Projected Compressed Air Usage");
            values.push(treasureHunt.compressedAir.modifiedEnergyUsage);
            labels.push("Compressed Air Savings");
            values.push(treasureHunt.compressedAir.energySavings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Compressed Air",
            labels: labels,
            values: values
        }];
        return data;
    }

    getSteamSavingsData(treasureHunt: TreasureHuntResults): PptxgenjsChartData[] {
        let labels: Array<string> = new Array();
        let values: Array<number> = new Array();

        if (treasureHunt.steam.energySavings) {
            labels.push("Projected Steam Usage");
            values.push(treasureHunt.steam.modifiedEnergyUsage);
            labels.push("Steam Savings");
            values.push(treasureHunt.steam.energySavings);
        }

        let data: PptxgenjsChartData[] = [{
            name: "Steam",
            labels: labels,
            values: values
        }];
        return data;
    }

    getTeamSummaryData(opportunityCardsData: Array<OpportunityCardData>): PptxgenjsChartData[] {
        let teamData = this.treasureHuntReportService.getTeamData(opportunityCardsData);
        teamData = _.orderBy(teamData, 'costSavings', 'desc');
        let values: Array<number> = new Array();
        let labels: Array<string> = new Array();
        teamData.forEach(team => {
            values.push(team.costSavings);
            labels.push(team.team);
        });
        let data: PptxgenjsChartData[] = [{
            name: "Team Summary",
            labels: labels,
            values: values
        }];
        return data;
    }



}


export interface PptxgenjsChartData {
    name: string,
    labels: Array<string>,
    values: Array<number>
}