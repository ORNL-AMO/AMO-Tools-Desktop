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
export class TreasureHuntPptTableService {

    constructor(private treasureHuntReportService: TreasureHuntReportService) { }

    getDetailedSummaryTable(slide: pptxgen.Slide, treasureHuntResults: TreasureHuntResults, settings: Settings): pptxgen.Slide {
        let rows = [];
        rows.push([
            { text: "Utility", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Unit", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Unit Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Current Use", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Projected Use", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Utility Savings", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Current Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Projected Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Cost Savings", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Implementation Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Payback (Years)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
        ]);
        if (treasureHuntResults.electricity.baselineEnergyUsage != 0) {
            let electricity = treasureHuntResults.electricity;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && electricity.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Electricity", options: { bold: true, fill: { color: fillColor } } },
                { text: "kWh", options: { fill: { color: fillColor } } },
                { text: '$' + this.returnValAsString(settings.electricityCost)+"/kWh", options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(electricity.baselineEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(electricity.modifiedEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(electricity.energySavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(electricity.baselineEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(electricity.modifiedEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(electricity.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(electricity.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(electricity.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.naturalGas.baselineEnergyUsage != 0) {
            let naturalGas = treasureHuntResults.naturalGas;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && naturalGas.hasMixed) {
                fillColor = "D0FCBA";
            }
            let utilityUnit: string = this.getUtilityUnit("Natural Gas", settings);
            rows.push([
                { text: "Natural Gas", options: { bold: true, fill: { color: fillColor } } },
                { text: utilityUnit, options: { fill: { color: fillColor } } },
                { text: '$' + this.returnValAsString(settings.fuelCost) + '/' + utilityUnit, options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(naturalGas.baselineEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(naturalGas.modifiedEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(naturalGas.energySavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(naturalGas.baselineEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(naturalGas.modifiedEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(naturalGas.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(naturalGas.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(naturalGas.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.water.baselineEnergyUsage != 0) {
            let water = treasureHuntResults.water;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && water.hasMixed) {
                fillColor = "D0FCBA";
            }
            let utilityUnit: string = this.getUtilityUnit("Water", settings);
            rows.push([
                { text: "Water", options: { bold: true, fill: { color: fillColor } } },
                { text: utilityUnit, options: { fill: { color: fillColor } } },
                { text: '$' + this.returnValAsString(settings.waterCost) + '/' + utilityUnit, options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(water.baselineEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(water.modifiedEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(water.energySavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(water.baselineEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(water.modifiedEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(water.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(water.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(water.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.wasteWater.baselineEnergyUsage != 0) {
            let wasteWater = treasureHuntResults.wasteWater;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && wasteWater.hasMixed) {
                fillColor = "D0FCBA";
            }
            let utilityUnit: string = this.getUtilityUnit("Waste Water", settings);
            rows.push([
                { text: "Wastewater", options: { bold: true, fill: { color: fillColor } } },
                { text: utilityUnit, options: { fill: { color: fillColor } } },
                { text: '$' + this.returnValAsString(settings.waterWasteCost) + '/' + utilityUnit, options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(wasteWater.baselineEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(wasteWater.modifiedEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(wasteWater.energySavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(wasteWater.baselineEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(wasteWater.modifiedEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(wasteWater.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(wasteWater.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(wasteWater.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.otherFuel.baselineEnergyUsage != 0) {
            let otherFuel = treasureHuntResults.otherFuel;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && otherFuel.hasMixed) {
                fillColor = "D0FCBA";
            }
            let utilityUnit: string = this.getUtilityUnit("Other Fuel", settings);
            rows.push([
                { text: "Other Fuel", options: { bold: true, fill: { color: fillColor } } },
                { text: utilityUnit, options: { fill: { color: fillColor } } },
                { text: '$' + this.returnValAsString(settings.otherFuelCost) + '/' + utilityUnit, options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(otherFuel.baselineEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(otherFuel.modifiedEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(otherFuel.energySavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(otherFuel.baselineEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(otherFuel.modifiedEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(otherFuel.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(otherFuel.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(otherFuel.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.compressedAir.baselineEnergyUsage != 0) {
            let compressedAir = treasureHuntResults.compressedAir;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && compressedAir.hasMixed) {
                fillColor = "D0FCBA";
            }
            let utilityUnit: string = this.getUtilityUnit("Compressed Air", settings);
            rows.push([
                { text: "Compressed Air", options: { bold: true, fill: { color: fillColor } } },
                { text: utilityUnit, options: { fill: { color: fillColor } } },
                { text: '$' + this.returnValAsString(settings.compressedAirCost) + '/' + utilityUnit, options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(compressedAir.baselineEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(compressedAir.modifiedEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(compressedAir.energySavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(compressedAir.baselineEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(compressedAir.modifiedEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(compressedAir.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(compressedAir.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(compressedAir.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.steam.baselineEnergyUsage != 0) {
            let steam = treasureHuntResults.steam;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && steam.hasMixed) {
                fillColor = "D0FCBA";
            }
            let utilityUnit: string = this.getUtilityUnit("Steam", settings);
            rows.push([
                { text: "Steam", options: { bold: true, fill: { color: fillColor } } },
                { text: utilityUnit, options: { fill: { color: fillColor } } },
                { text: '$' + this.returnValAsString(settings.steamCost) + '/' + utilityUnit, options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(steam.baselineEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(steam.modifiedEnergyUsage), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(steam.energySavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(steam.baselineEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(steam.modifiedEnergyCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(steam.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(steam.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(steam.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.other.implementationCost != 0) {
            let other = treasureHuntResults.other;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Mixed", options: { bold: true, fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(other.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(other.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.totalAdditionalSavings != 0) {
            rows.push([
                { text: "Other", options: { bold: true } },
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                this.roundValToCurrency(treasureHuntResults.totalAdditionalSavings),
                "",
                ""
            ]);
        }
        rows.push([
            { text: "Total", options: { bold: true } },
            "",
            "",
            "",
            "",
            "",
            this.roundValToCurrency(treasureHuntResults.totalBaselineCost),
            this.roundValToCurrency(treasureHuntResults.totalModificationCost),
            this.roundValToCurrency(treasureHuntResults.totalSavings),
            this.roundValToCurrency(treasureHuntResults.totalImplementationCost),
            this.roundValToFormatString(treasureHuntResults.paybackPeriod)
        ]);

        slide.addTable(rows, { x: 0.16, y: 1.6, w: 13.02, colW: [1.12, 0.73, 1.15, 1.27, 1.28, 1.17, 1.29, 1.27, 1.3, 1.46, 0.91], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, valign: 'middle', align: 'left' });
        if (treasureHuntResults.hasMixed) {
            slide.addText('* * * Savings for opportunities with mixed utilities are under their respective utilities; implementation costs and payback are under "Mixed“ * * *', { x: 1.26, y: 6.58, w: 10.82, h: 0.3, align: 'center', fill: { color: 'D0FCBA' }, color: '1D428A', fontSize: 12, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
        }
        return slide;
    }

    getOpportunityTableRows(rows: any[], opportunity: OpportunitySummary, settings: Settings) {
        let utilityUnit: string;
        if (opportunity.mixedIndividualResults) {
            opportunity.mixedIndividualResults.forEach(opp => {
                utilityUnit = this.getUtilityUnit(opp.utilityType, settings);
                rows.push([opp.opportunityName, opp.utilityType, this.roundValToFormatString(opp.totalEnergySavings), utilityUnit, this.roundValToCurrency(opp.costSavings), this.roundValToCurrency(opp.opportunityCost.material), this.roundValToCurrency(opp.opportunityCost.labor), this.getOtherCost(opp.opportunityCost), this.roundValToCurrency(opp.totalCost), this.roundValToFormatString(opp.payback)]);
            });
        } else {
            utilityUnit = this.getUtilityUnit(opportunity.utilityType, settings);
            rows.push([opportunity.opportunityName, opportunity.utilityType, this.roundValToFormatString(opportunity.totalEnergySavings), utilityUnit, this.roundValToCurrency(opportunity.costSavings), this.roundValToCurrency(opportunity.opportunityCost.material), this.roundValToCurrency(opportunity.opportunityCost.labor), this.getOtherCost(opportunity.opportunityCost), this.roundValToCurrency(opportunity.totalCost), this.roundValToFormatString(opportunity.payback)]);
        }
        return rows;
    }


    getCostSummaryTable(slide: pptxgen.Slide, treasureHuntResults: TreasureHuntResults): pptxgen.Slide {
        let rows = [];
        rows.push([
            { text: "Utility", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Cost Savings", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Implementation Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Payback (Years)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
        ]);
        if (treasureHuntResults.electricity.baselineEnergyUsage != 0) {
            let electricity = treasureHuntResults.electricity;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && electricity.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Electricity", options: { bold: true, fill: { color: fillColor } } },
                { text: this.roundValToCurrency(electricity.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(electricity.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(electricity.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.naturalGas.baselineEnergyUsage != 0) {
            let naturalGas = treasureHuntResults.naturalGas;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && naturalGas.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Natural Gas", options: { bold: true, fill: { color: fillColor } } },
                { text: this.roundValToCurrency(naturalGas.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(naturalGas.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(naturalGas.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.water.baselineEnergyUsage != 0) {
            let water = treasureHuntResults.water;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && water.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Water", options: { bold: true, fill: { color: fillColor } } },
                { text: this.roundValToCurrency(water.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(water.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(water.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.wasteWater.baselineEnergyUsage != 0) {
            let wasteWater = treasureHuntResults.wasteWater;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && wasteWater.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Wastewater", options: { bold: true, fill: { color: fillColor } } },
                { text: this.roundValToCurrency(wasteWater.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(wasteWater.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(wasteWater.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.otherFuel.baselineEnergyUsage != 0) {
            let otherFuel = treasureHuntResults.otherFuel;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && otherFuel.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Other Fuel", options: { bold: true, fill: { color: fillColor } } },
                { text: this.roundValToCurrency(otherFuel.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(otherFuel.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(otherFuel.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.compressedAir.baselineEnergyUsage != 0) {
            let compressedAir = treasureHuntResults.compressedAir;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && compressedAir.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Compressed Air", options: { bold: true, fill: { color: fillColor } } },
                { text: this.roundValToCurrency(compressedAir.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(compressedAir.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(compressedAir.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.steam.baselineEnergyUsage != 0) {
            let steam = treasureHuntResults.steam;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed && steam.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Steam", options: { bold: true, fill: { color: fillColor } } },
                { text: this.roundValToCurrency(steam.costSavings), options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(steam.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(steam.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.other.implementationCost != 0) {
            let other = treasureHuntResults.other;
            let fillColor: string = "BDEEFF";
            if (treasureHuntResults.hasMixed) {
                fillColor = "D0FCBA";
            }
            rows.push([
                { text: "Mixed", options: { bold: true, fill: { color: fillColor } } },
                { text: "", options: { fill: { color: fillColor } } },
                { text: this.roundValToCurrency(other.implementationCost), options: { fill: { color: fillColor } } },
                { text: this.roundValToFormatString(other.paybackPeriod), options: { fill: { color: fillColor } } }
            ]);
        }
        if (treasureHuntResults.totalAdditionalSavings != 0) {
            rows.push([
                { text: "Other", options: { bold: true } },
                this.roundValToCurrency(treasureHuntResults.totalAdditionalSavings),
                "",
                "",
                ""
            ]);
        }
        rows.push([
            { text: "Total", options: { bold: true } },
            this.roundValToCurrency(treasureHuntResults.totalSavings),
            this.roundValToCurrency(treasureHuntResults.totalImplementationCost),
            this.roundValToFormatString(treasureHuntResults.paybackPeriod),
            ""
        ]);


        slide.addTable(rows, { x: 5.8, y: 1.8, w: 6.5, colW: [1.5, 1.5, 2, 1.5], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: "middle" });
        if (treasureHuntResults.hasMixed) {
            slide.addText('* * * Savings for opportunities with mixed utilities are under their respective utilities; implementation costs and payback are under "Mixed“ * * *', { x: 1.26, y: 6.58, w: 10.82, h: 0.3, align: 'center', fill: { color: 'D0FCBA' }, color: '1D428A', fontSize: 12, fontFace: 'Arial (Body)', valign: 'middle', isTextBox: true, autoFit: true });
        }
        return slide;
    }


    getCarbonSummaryTable(slide: pptxgen.Slide, carbonResults: TreasureHuntCo2EmissionsResults): pptxgen.Slide {
        let rows = [];
        rows.push([
            { text: "Utility", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Current CO2 Emissions (tonne CO2)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Projected CO2 Emissions (tonne CO2)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "CO2 Emission Savings (tonne CO2)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
        ]);
        if (carbonResults.electricityCO2CurrentUse != 0) {
            rows.push([
                { text: "Electricity", options: { bold: true } },
                this.roundValToFormatString(carbonResults.electricityCO2CurrentUse),
                this.roundValToFormatString(carbonResults.electricityCO2ProjectedUse),
                this.roundValToFormatString(carbonResults.electricityCO2Savings)
            ]);
        }
        if (carbonResults.naturalGasCO2CurrentUse != 0) {
            rows.push([
                { text: "Natural Gas", options: { bold: true } },
                this.roundValToFormatString(carbonResults.naturalGasCO2CurrentUse),
                this.roundValToFormatString(carbonResults.naturalGasCO2ProjectedUse),
                this.roundValToFormatString(carbonResults.naturalGasCO2Savings)
            ]);
        }
        if (carbonResults.waterCO2CurrentUse != 0) {
            rows.push([
                { text: "Water", options: { bold: true } },
                this.roundValToFormatString(carbonResults.waterCO2CurrentUse),
                this.roundValToFormatString(carbonResults.waterCO2ProjectedUse),
                this.roundValToFormatString(carbonResults.waterCO2Savings)
            ]);
        }
        if (carbonResults.wasteWaterCO2CurrentUse != 0) {
            rows.push([
                { text: "Wastewater", options: { bold: true } },
                this.roundValToFormatString(carbonResults.wasteWaterCO2CurrentUse),
                this.roundValToFormatString(carbonResults.wasteWaterCO2ProjectedUse),
                this.roundValToFormatString(carbonResults.wasteWaterCO2Savings)
            ]);
        }
        if (carbonResults.otherFuelCO2CurrentUse != 0) {
            rows.push([
                { text: "Other Fuel", options: { bold: true } },
                this.roundValToFormatString(carbonResults.otherFuelCO2CurrentUse),
                this.roundValToFormatString(carbonResults.otherFuelCO2ProjectedUse),
                this.roundValToFormatString(carbonResults.otherFuelCO2Savings)
            ]);
        }
        if (carbonResults.compressedAirCO2CurrentUse != 0) {
            rows.push([
                { text: "Compressed Air", options: { bold: true } },
                this.roundValToFormatString(carbonResults.compressedAirCO2CurrentUse),
                this.roundValToFormatString(carbonResults.compressedAirCO2ProjectedUse),
                this.roundValToFormatString(carbonResults.compressedAirCO2Savings)
            ]);
        }
        if (carbonResults.steamCO2CurrentUse != 0) {
            rows.push([
                { text: "Steam", options: { bold: true } },
                this.roundValToFormatString(carbonResults.steamCO2CurrentUse),
                this.roundValToFormatString(carbonResults.steamCO2ProjectedUse),
                this.roundValToFormatString(carbonResults.steamCO2Savings)
            ]);
        }
        rows.push([
            { text: "Total", options: { bold: true } },
            this.roundValToFormatString(carbonResults.totalCO2CurrentUse),
            this.roundValToFormatString(carbonResults.totalCO2ProjectedUse),
            this.roundValToFormatString(carbonResults.totalCO2Savings)
        ]);

        slide.addTable(rows, { x: 5.3, y: 1.77, w: 7.77, colW: [1.5, 2.04, 2.23, 2], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: "left", valign: "middle" });

        return slide;
    }


    getTeamSummaryTable(slide: pptxgen.Slide, opportunityCardsData: Array<OpportunityCardData>): pptxgen.Slide {
        let teamData = this.treasureHuntReportService.getTeamData(opportunityCardsData);
        let rows = [];
        rows.push([
            { text: "Team", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Area", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Cost Savings", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Implementation Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Payback (Years)", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
        ]);
        teamData.forEach(data => {
            rows.push([
                data.team,
                " ",
                this.roundValToCurrency(data.costSavings),
                this.roundValToCurrency(data.implementationCost),
                this.roundValToFormatString(data.paybackPeriod)
            ]);
        });

        slide.addTable(rows, { x: 0.12, y: 1.32, w: 6.5, colW: [1.25, 1.35, 1.5, 1.5, 0.9], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });

        return slide;
    }

    getOppPaybackTable(slide: pptxgen.Slide, opportunitiesPaybackDetails: OpportunitiesPaybackDetails): pptxgen.Slide {
        let rows = [];
        rows.push([
            { text: "Payback Length", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Number of Opportunities", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Total Savings", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
        ]);
        rows.push([
            "Less than 1 year",
            this.roundValToFormatString(opportunitiesPaybackDetails.lessThanOneYear.numOpportunities),
            this.roundValToCurrency(opportunitiesPaybackDetails.lessThanOneYear.totalSavings)
        ]);
        rows.push([
            "1 to 2 years",
            this.roundValToFormatString(opportunitiesPaybackDetails.oneToTwoYears.numOpportunities),
            this.roundValToCurrency(opportunitiesPaybackDetails.oneToTwoYears.totalSavings)
        ]);
        rows.push([
            "2 to 3 years",
            this.roundValToFormatString(opportunitiesPaybackDetails.twoToThreeYears.numOpportunities),
            this.roundValToCurrency(opportunitiesPaybackDetails.twoToThreeYears.totalSavings)
        ]);
        rows.push([
            "More than 3 years",
            this.roundValToFormatString(opportunitiesPaybackDetails.moreThanThreeYears.numOpportunities),
            this.roundValToCurrency(opportunitiesPaybackDetails.moreThanThreeYears.totalSavings)
        ]);
        rows.push([
            "Total",
            this.roundValToFormatString(opportunitiesPaybackDetails.totals.numOpportunities),
            this.roundValToCurrency(opportunitiesPaybackDetails.totals.totalSavings)
        ]);

        slide.addTable(rows, { x: 0.12, y: 1.32, w: 5.42, colW: [1.6, 2.22, 1.6], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: 'left', valign: 'middle' });

        return slide;
    }

    getEnergyUtilityTable(slide: pptxgen.Slide, currentEnergyUsage: EnergyUsage, settings: Settings): pptxgen.Slide {
        let rows = [];
        rows.push([
            { text: "Utility", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Unit Cost", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Annual Consumption", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Annual Costs", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } },
            { text: "Total Carbon Emission Output Rate", options: { color: "FFFFFF", bold: true, fill: { color: '1D428A' } } }
        ]);
        if (currentEnergyUsage.electricityUsage) {
            let utilityUnit: string = this.getUtilityUnit("Electricity", settings);
            rows.push([
                "Electricity",
                this.returnValAsString(settings.electricityCost) + " $/" + utilityUnit,
                this.roundValToFormatString(currentEnergyUsage.electricityUsage) + " " + utilityUnit,
                this.roundValToCurrency(currentEnergyUsage.electricityCosts),
                this.roundValToFormatString(currentEnergyUsage.electricityCO2SavingsData.totalEmissionOutputRate) + " kg CO2/" + utilityUnit
            ]);
        }
        if (currentEnergyUsage.naturalGasUsed) {
            let utilityUnit: string = this.getUtilityUnit("Natural Gas", settings);
            rows.push([
                "Natural Gas",
                this.returnValAsString(settings.fuelCost) + " $/" + utilityUnit,
                this.roundValToFormatString(currentEnergyUsage.naturalGasUsage) + " " + utilityUnit,
                this.roundValToCurrency(currentEnergyUsage.naturalGasCosts),
                this.roundValToFormatString(currentEnergyUsage.naturalGasCO2SavingsData.totalEmissionOutputRate) + " kg CO2/" + utilityUnit
            ]);
        }
        if (currentEnergyUsage.otherFuelUsed) {
            let utilityUnit: string = this.getUtilityUnit("Other Fuel", settings);
            rows.push([
                "Other Fuel",
                this.returnValAsString(settings.otherFuelCost) + " $/" + utilityUnit,
                this.roundValToFormatString(currentEnergyUsage.otherFuelUsage) + " " + utilityUnit,
                this.roundValToCurrency(currentEnergyUsage.otherFuelCosts),
                this.roundValToFormatString(currentEnergyUsage.otherFuelCO2SavingsData.totalEmissionOutputRate) + " kg CO2/" + utilityUnit
            ]);
        }
        if (currentEnergyUsage.waterUsed || currentEnergyUsage.wasteWaterUsed) {
            let waterUtilityUnit: string;
            let waterUtilityCostUnit: string;
            if (settings.unitsOfMeasure == 'Imperial') {
                waterUtilityUnit = 'kgal';
                waterUtilityCostUnit = 'gal';
            } else {
                waterUtilityUnit = 'L';
                waterUtilityCostUnit = 'L';
            }
            if (currentEnergyUsage.waterUsed) {
                rows.push([
                    "Water",
                    this.returnValAsString(settings.waterCost) + " $/" + waterUtilityCostUnit,
                    this.roundValToFormatString(currentEnergyUsage.waterUsage) + " " + waterUtilityUnit,
                    this.roundValToCurrency(currentEnergyUsage.waterCosts),
                    this.roundValToFormatString(currentEnergyUsage.waterCO2OutputRate) + " kg CO2/" + waterUtilityCostUnit
                ]);
            }
            if (currentEnergyUsage.wasteWaterUsed) {
                rows.push([
                    "Wastewater",
                    this.returnValAsString(settings.waterWasteCost) + " $/" + waterUtilityCostUnit,
                    this.roundValToFormatString(currentEnergyUsage.wasteWaterUsage) + " " + waterUtilityUnit,
                    this.roundValToCurrency(currentEnergyUsage.wasteWaterCosts),
                    this.roundValToFormatString(currentEnergyUsage.wasteWaterCO2OutputRate) + " kg CO2/" + waterUtilityCostUnit
                ]);
            }
        }

        if (currentEnergyUsage.compressedAirUsed) {
            let utilityUnit: string;
            let utilityCostUnit: string;
            if (settings.unitsOfMeasure == 'Imperial') {
                utilityUnit = 'kscf';
                utilityCostUnit = 'scf';
            } else {
                utilityUnit = 'm<sup>3</sup>';
                utilityCostUnit = 'm<sup>3</sup>';
            }
            rows.push([
                "Compressed Air",
                this.returnValAsString(settings.compressedAirCost) + " $/" + utilityCostUnit,
                this.roundValToFormatString(currentEnergyUsage.compressedAirUsage) + " " + utilityUnit,
                this.roundValToCurrency(currentEnergyUsage.compressedAirCosts),
                this.roundValToFormatString(currentEnergyUsage.compressedAirCO2OutputRate) + " kg CO2/" + utilityCostUnit
            ]);
        }
        if (currentEnergyUsage.steamUsed) {
            let utilityUnit: string = this.getUtilityUnit("Steam", settings);
            rows.push([
                "Steam",
                this.returnValAsString(settings.steamCost) + " $/" + utilityUnit,
                this.roundValToFormatString(currentEnergyUsage.steamUsage) + " " + utilityUnit,
                this.roundValToCurrency(currentEnergyUsage.steamCosts),
                this.roundValToFormatString(currentEnergyUsage.steamCO2OutputRate) + " kg CO2/" + utilityUnit
            ]);
        }

        slide.addTable(rows, { x: 1.84, y: 1.6, w: 9.95, colW: [1.5, 1.3, 2, 1.75, 3.1], color: "1D428A", fontSize: 12, fontFace: 'Arial (Body)', border: { type: "solid", color: '1D428A' }, fill: { color: 'BDEEFF' }, align: "left", valign: "middle" });

        return slide;
    }



    getOtherCost(oppCost: OpportunityCost): string {
        let total: number = 0;
        if (oppCost && oppCost.otherCosts && oppCost.otherCosts.length != 0) {
            oppCost.otherCosts.forEach(oCost => {
                total = total + oCost.cost;
            });
        }
        if (oppCost && oppCost.additionalSavings) {
            total = total - oppCost.additionalSavings.cost
        }
        return this.roundValToCurrency(total);
    }

    roundValToFormatString(num: number): string {
        if (!num) {
            return "-";
        } else {
            return Number(num.toFixed(2)).toLocaleString('en-US');
        }
    }

    returnValAsString(num: number): string {
        if (!num) {
            return "-";
        } else {
            return num.toString();
        }
    }

    roundValToCurrency(num: number): string {
        if (!num) {
            return "-";
        } else {
            let number = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
            return number;
        }
    }

    getUtilityUnit(utilityType: string, settings: Settings): string {
        let utilityUnit: string;
        if (utilityType == 'Electricity') {
            utilityUnit = 'kWh';
        } else if (utilityType == 'Compressed Air') {
            if (settings.unitsOfMeasure == 'Imperial') {
                utilityUnit = 'kscf';
            } else {
                utilityUnit = 'Nm<sup>3</sup>';
            }
        } else if (utilityType == 'Water' || utilityType == 'Waste Water' || utilityType == 'Waste-Water') {
            if (settings.unitsOfMeasure == 'Imperial') {
                utilityUnit = 'kgal';
            } else {
                utilityUnit = 'm<sup>3</sup>';
            }
        } else if (utilityType == 'Steam') {
            if (settings.unitsOfMeasure == 'Imperial') {
                utilityUnit = 'klb';
            } else {
                utilityUnit = 'tonne';
            }
        } else if (utilityType == 'Natural Gas' || utilityType == 'Other Fuel') {
            if (settings.unitsOfMeasure == 'Imperial') {
                utilityUnit = 'MMBtu';
            } else {
                utilityUnit = 'GJ';
            }
        }
        return utilityUnit;
    }


}
