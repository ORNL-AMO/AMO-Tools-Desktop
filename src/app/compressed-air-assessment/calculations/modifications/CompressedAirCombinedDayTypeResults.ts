import { DayTypeModificationResult, EemSavingsResults } from "../caCalculationModels";
import { CompressedAirAssessmentModificationResults } from "./CompressedAirAssessmentModificationResults";
import { CompressedAirEemSavingsResult, getEmptyEemSavings } from "./CompressedAirEemSavingsResult";
import { CompressedAirModifiedDayTypeProfileSummary } from "./CompressedAirModifiedDayTypeProfileSummary";
import * as _ from 'lodash';

export class CompressedAirCombinedDayTypeResults {
    allSavingsResults: EemSavingsResults;
    flowReallocationSavings: EemSavingsResults;
    addReceiverVolumeSavings: EemSavingsResults;
    adjustCascadingSetPointsSavings: EemSavingsResults;
    improveEndUseEfficiencySavings: EemSavingsResults;
    reduceAirLeaksSavings: EemSavingsResults;
    reduceRunTimeSavings: EemSavingsResults;
    reduceSystemAirPressureSavings: EemSavingsResults;
    useAutomaticSequencerSavings: EemSavingsResults;
    auxiliaryPowerUsage: { cost: number, energyUse: number } = { cost: 0, energyUse: 0 };

    peakDemand: number = 0;
    peakDemandCost: number = 0;
    peakDemandCostSavings: number = 0;
    totalAnnualOperatingCost: number = 0;
    annualEmissionOutput: number = 0;

    constructor(compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults) {
        this.totalAnnualOperatingCost = compressedAirAssessmentModificationResults.totalModificationAnnualOperatingCost;
        this.annualEmissionOutput = compressedAirAssessmentModificationResults.totalModificationAnnualEmissionOutput;
        this.setAuxiliaryPowerUsage(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setFlowReallocationSavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setAddReceiverVolumeSavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setAdjustCascadingSetPointsSavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setImproveEndUseEfficiencySavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setReduceAirLeaksSavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setReduceRunTimeSavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setReduceSystemAirPressureSavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setUseAutomaticSequencerSavings(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries);
        this.setPeakDemand(compressedAirAssessmentModificationResults.modifiedDayTypeProfileSummaries, compressedAirAssessmentModificationResults.baselineDemandCost);
        this.setAllSavingsResults(compressedAirAssessmentModificationResults);
    }

    setFlowReallocationSavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.flowReallocationResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.flowReallocationResults.savings);
            this.flowReallocationSavings = this.getTotalSavingsResults(eemSavingsResults);
        } else {
            this.flowReallocationSavings = getEmptyEemSavings();
        }
    }

    setAddReceiverVolumeSavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.addPrimaryReceiverVolumeResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.addPrimaryReceiverVolumeResults.savings);
            this.addReceiverVolumeSavings = this.getTotalSavingsResults(eemSavingsResults);
        } else {
            this.addReceiverVolumeSavings = getEmptyEemSavings();
        }
    }

    setAdjustCascadingSetPointsSavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.adjustCascadingSetPointsResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.adjustCascadingSetPointsResults.savings);
            this.adjustCascadingSetPointsSavings = this.getTotalSavingsResults(eemSavingsResults);
        } else {
            this.adjustCascadingSetPointsSavings = getEmptyEemSavings();
        }
    }

    setImproveEndUseEfficiencySavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.improveEndUseEfficiencyResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.improveEndUseEfficiencyResults.savings);
            this.improveEndUseEfficiencySavings = this.getTotalSavingsResults(eemSavingsResults, this.auxiliaryPowerUsage.cost);
        } else {
            this.improveEndUseEfficiencySavings = getEmptyEemSavings();
        }
    }

    setReduceAirLeaksSavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.reduceAirLeaksResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.reduceAirLeaksResults.savings);
            this.reduceAirLeaksSavings = this.getTotalSavingsResults(eemSavingsResults);
        } else {
            this.reduceAirLeaksSavings = getEmptyEemSavings();
        }
    }

    setReduceRunTimeSavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.reduceRunTimeResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.reduceRunTimeResults.savings);
            this.reduceRunTimeSavings = this.getTotalSavingsResults(eemSavingsResults);
        } else {
            this.reduceRunTimeSavings = getEmptyEemSavings();
        }
    }

    setReduceSystemAirPressureSavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.reduceSystemAirPressureResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.reduceSystemAirPressureResults.savings);
            this.reduceSystemAirPressureSavings = this.getTotalSavingsResults(eemSavingsResults);
        } else {
            this.reduceSystemAirPressureSavings = getEmptyEemSavings();
        }
    }

    setUseAutomaticSequencerSavings(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let summaries: Array<CompressedAirModifiedDayTypeProfileSummary> = modifiedDayTypeProfileSummaries.filter(summary => summary.useAutomaticSequencerResults != undefined);
        if (summaries.length != 0) {
            let eemSavingsResults: Array<CompressedAirEemSavingsResult> = summaries.map(summary => summary.useAutomaticSequencerResults.savings);
            this.useAutomaticSequencerSavings = this.getTotalSavingsResults(eemSavingsResults);
        } else {
            this.useAutomaticSequencerSavings = getEmptyEemSavings();
        }
    }

    getTotalSavingsResults(savingsResults: Array<CompressedAirEemSavingsResult>, additionalCosts: number = 0): EemSavingsResults {
        let eemSavingsResults: EemSavingsResults = getEmptyEemSavings();
        savingsResults.forEach((result, index) => {
            eemSavingsResults.savings.cost += result.savings.cost;
            eemSavingsResults.savings.power += result.savings.power;
            //prevent double counting of implementation cost
            if (index == 0) {
                eemSavingsResults.implementationCost = result.implementationCost;
            }
        });

        if (additionalCosts) {
            eemSavingsResults.savings.cost -= additionalCosts;
        }
        eemSavingsResults.paybackPeriod = this.getPaybackPeriod(eemSavingsResults.implementationCost, eemSavingsResults.savings.cost);
        return eemSavingsResults;
    }

    getPaybackPeriod(implementationCost: number, costSavings: number): number {
        let paybackPeriod: number = (implementationCost / costSavings) * 12;
        if (paybackPeriod < 0 || isNaN(paybackPeriod)) {
            paybackPeriod = 0;
        }
        return paybackPeriod;
    }

    setAuxiliaryPowerUsage(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>) {
        let cost: number = 0;
        let energyUse: number = 0;
        modifiedDayTypeProfileSummaries.forEach(summary => {
            if (!isNaN(summary.auxiliaryPowerUsage.cost)) {
                cost += summary.auxiliaryPowerUsage.cost;
            }
            if (!isNaN(summary.auxiliaryPowerUsage.energyUse)) {
                energyUse += summary.auxiliaryPowerUsage.energyUse;
            }
        });
        this.auxiliaryPowerUsage = {
            cost: cost,
            energyUse: energyUse
        };
    }

    setPeakDemand(modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>, baselineDemandCost: number) {
        this.peakDemand = _.maxBy(modifiedDayTypeProfileSummaries, (result: CompressedAirModifiedDayTypeProfileSummary) => { return result.peakDemand }).peakDemand;
        this.peakDemandCost = _.maxBy(modifiedDayTypeProfileSummaries, (result: CompressedAirModifiedDayTypeProfileSummary) => { return result.peakDemandCost }).peakDemandCost;
        this.peakDemandCostSavings = baselineDemandCost - this.peakDemandCost;
    }

    setAllSavingsResults(compressedAirAssessmentModificationResults: CompressedAirAssessmentModificationResults) {
        let percentSavings: number = ((compressedAirAssessmentModificationResults.totalAnnualOperatingCostSavings) / compressedAirAssessmentModificationResults.totalBaselineAnnualOperatingCost) * 100
        let allEemSavingsItems: Array<EemSavingsResults> = [
            this.flowReallocationSavings,
            this.addReceiverVolumeSavings,
            this.adjustCascadingSetPointsSavings,
            this.improveEndUseEfficiencySavings,
            this.reduceAirLeaksSavings,
            this.reduceRunTimeSavings,
            this.reduceSystemAirPressureSavings,
            this.useAutomaticSequencerSavings
        ];
        let totalImplementationCost: number = _.sumBy(allEemSavingsItems, (item: EemSavingsResults) => { return item.implementationCost; });
        let paybackPeriod: number = this.getPaybackPeriod(totalImplementationCost, compressedAirAssessmentModificationResults.totalAnnualOperatingCostSavings);
        this.allSavingsResults = {
            baselineResults: {
                cost: compressedAirAssessmentModificationResults.totalBaselineCost,
                power: compressedAirAssessmentModificationResults.totalBaselinePower,
                annualEmissionOutput: compressedAirAssessmentModificationResults.totalBaselineAnnualEmissionOutput,
            },
            adjustedResults: {
                cost: compressedAirAssessmentModificationResults.totalModificationCost,
                power: compressedAirAssessmentModificationResults.totalModificationPower,
                annualEmissionOutput: compressedAirAssessmentModificationResults.totalModificationAnnualEmissionOutput,
            },
            savings: {
                cost: compressedAirAssessmentModificationResults.totalCostSavings,
                power: compressedAirAssessmentModificationResults.totalPowerSavings,
                annualEmissionOutput: compressedAirAssessmentModificationResults.totalAnnualEmissionOutputSavings,
                annualEmissionOutputSavings: compressedAirAssessmentModificationResults.totalAnnualEmissionOutputSavings,
                percentSavings: percentSavings
            },
            implementationCost: totalImplementationCost,
            paybackPeriod: paybackPeriod,
            dayTypeId: undefined
        }
    }

    getDayTypeModificationResult(): DayTypeModificationResult {
        return {
            adjustedProfileSummary: [],
            adjustedCompressors: [],
            profileSummaryTotals: [],
            allSavingsResults: this.allSavingsResults,
            flowReallocationSavings: this.flowReallocationSavings,
            addReceiverVolumeSavings: this.addReceiverVolumeSavings,
            adjustCascadingSetPointsSavings: this.adjustCascadingSetPointsSavings,
            improveEndUseEfficiencySavings: this.improveEndUseEfficiencySavings,
            reduceAirLeaksSavings: this.reduceAirLeaksSavings,
            reduceRunTimeSavings: this.reduceRunTimeSavings,
            reduceSystemAirPressureSavings: this.reduceSystemAirPressureSavings,
            useAutomaticSequencerSavings: this.useAutomaticSequencerSavings,
            reduceRunTimeProfileSummary: undefined,
            flowAllocationProfileSummary: undefined,
            reduceAirLeaksProfileSummary: undefined,
            addReceiverVolumeProfileSummary: undefined,
            useAutomaticSequencerProfileSummary: undefined,
            improveEndUseEfficiencyProfileSummary: undefined,
            reduceSystemAirPressureProfileSummary: undefined,
            adjustCascadingSetPointsProfileSummary: undefined,
            dayTypeId: undefined,
            dayTypeName: undefined,
            auxiliaryPowerUsage: this.auxiliaryPowerUsage,
            peakDemand: this.peakDemand,
            peakDemandCost: this.peakDemandCost,
            peakDemandCostSavings: this.peakDemandCostSavings,
            totalAnnualOperatingCost: this.totalAnnualOperatingCost,
            annualEmissionOutput: this.annualEmissionOutput
        }
    }

}