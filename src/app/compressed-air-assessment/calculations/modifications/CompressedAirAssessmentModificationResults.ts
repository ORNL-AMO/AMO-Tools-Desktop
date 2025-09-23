import { AssessmentCo2SavingsService } from "../../../shared/assessment-co2-savings/assessment-co2-savings.service";
import { CompressedAirAssessment, CompressorInventoryItem, Modification, ProfileSummary } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../compressed-air-calculation.service";
import { CompressedAirAssessmentResult, DayTypeModificationResult } from "./../caCalculationModels";
import { CompressedAirAdjustedProfileSummary } from "./../modifications/CompressedAirAdjustedProfileSummary";
import { CompressedAirAssessmentBaselineResults } from "./../CompressedAirAssessmentBaselineResults";
import { CompressorInventoryItemClass } from "./../CompressorInventoryItemClass";



export class CompressedAirAssessmentModificationResults {



    compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults;
    modifiedInventoryItems: Array<CompressorInventoryItemClass>;

    dayTypeModificationResults: CompressedAirAssessmentResult;
    totalBaselineCost: number;
    totalBaselinePower: number;
    totalModificationCost: number;
    totalModificationPower: number;
    totalCostSavings: number;
    totalCostPower: number;
    modification: Modification

    constructor(compressedAirAssessment: CompressedAirAssessment,
        modification: Modification,
        settings: Settings,
        _compressedAirCalculationService: CompressedAirCalculationService,
        _assessmentCo2SavingsService: AssessmentCo2SavingsService) {

        this.compressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(compressedAirAssessment, settings, _compressedAirCalculationService, _assessmentCo2SavingsService);


        let modificationOrders: Array<number> = [
            modification.addPrimaryReceiverVolume.order,
            modification.adjustCascadingSetPoints.order,
            modification.improveEndUseEfficiency.order,
            modification.reduceRuntime.order,
            modification.reduceAirLeaks.order,
            modification.reduceSystemAirPressure.order,
            modification.useAutomaticSequencer.order,
        ]
        modificationOrders = modificationOrders.filter(order => { return order != 100 });
        //TODO: See if there is a less expensive way to do this. Is there a smaller set of data we need?
        // let compressedAirAssessmentCopy: CompressedAirAssessment = JSON.parse(JSON.stringify(compressedAirAssessment));
        // if (modification.replaceCompressor.order != 100) {
        //     //TODO: swap out replacement compressors
        // }

        this.setInventoryItems(compressedAirAssessment.compressorInventoryItems);
        //Adjust perfomance points for sequencer
        if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer') {
            this.modifiedInventoryItems.forEach(item => {
                item.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessment.systemInformation, settings);
            })
        }
        let numberOfSummaryIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;

        let modificationResults: Array<DayTypeModificationResult> = new Array();
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
            let baselineProfileSummary: Array<ProfileSummary> = this.compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries.find(summary => summary.dayType.dayTypeId == dayType.dayTypeId).profileSummary;

            // let adjustedCompressors: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(compressedAirAssessmentCopy.compressorInventoryItems));
            // let adjustedData: AdjustProfileResults = this.adjustProfileSummary(dayType, settings, baselineProfileSummary, adjustedCompressors, modification, modificationOrders, compressedAirAssessmentCopy.systemInformation.atmosphericPressure, numberOfSummaryIntervals, compressedAirAssessmentCopy.systemInformation.totalAirStorage, compressedAirAssessmentCopy.systemBasics.electricityCost, compressedAirAssessmentCopy.systemInformation);
            let compressedAirAdjustedProfileSummary: CompressedAirAdjustedProfileSummary = new CompressedAirAdjustedProfileSummary(dayType, settings, baselineProfileSummary, this.modifiedInventoryItems, modification, modificationOrders, compressedAirAssessment.systemInformation, numberOfSummaryIntervals, compressedAirAssessment.systemBasics.electricityCost);
            // let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedData.adjustedProfileSummary, numberOfSummaryIntervals, modification.improveEndUseEfficiency);
            // let totalImplementationCost: number = this.getTotalImplementationCost(modification);
            // let allSavingsResults: EemSavingsResults = this.calculateSavings(baselineProfileSummary, adjustedData.adjustedProfileSummary, dayType, compressedAirAssessmentCopy.systemBasics.electricityCost, totalImplementationCost, numberOfSummaryIntervals, adjustedData.auxiliaryPowerUsage);
            // if (baselineResults && compressedAirAssessment.systemInformation.co2SavingsData) {
            //     compressedAirAssessment.systemInformation.co2SavingsData.electricityUse = allSavingsResults.adjustedResults.power;
            //     allSavingsResults.adjustedResults.annualEmissionOutput = this.assessmentCo2SavingsService.getCo2EmissionsResult(compressedAirAssessment.systemInformation.co2SavingsData, settings);
            //     // * handle offset result - electricity use is passed here as kWh but the method is meant to accept MWh
            //     allSavingsResults.adjustedResults.annualEmissionOutput = allSavingsResults.adjustedResults.annualEmissionOutput / 1000;

            //     let currentDayTypeBaselineResult: BaselineResult = baselineResults.dayTypeResults.find(result => result.dayTypeId === dayType.dayTypeId);
            //     allSavingsResults.savings.annualEmissionOutputSavings = currentDayTypeBaselineResult.annualEmissionOutput - allSavingsResults.adjustedResults.annualEmissionOutput;
            // }

            // let peakDemandObj: ProfileSummaryTotal = _.maxBy(totals, (result) => { return result.totalPower });
            // let peakDemand: number = peakDemandObj?.totalPower || 0;
            // let peakDemandCost: number = peakDemand * 12 * compressedAirAssessmentCopy.systemBasics.demandCost;
            // let peakDemandCostSavings: number = 0;
            // if (baselineResults) {
            //     peakDemandCostSavings = baselineResults.total.demandCost - peakDemandCost;
            // }
            // let totalModifiedAnnualOperatingCost: number = peakDemandCost + allSavingsResults.adjustedResults.cost;
            // modificationResults.push({
            //     adjustedProfileSummary: adjustedData.adjustedProfileSummary,
            //     adjustedCompressors: adjustedData.adjustedCompressors,
            //     profileSummaryTotals: totals,
            //     dayTypeId: dayType.dayTypeId,
            //     allSavingsResults: allSavingsResults,
            //     flowReallocationSavings: adjustedData.flowReallocationSavings,
            //     flowAllocationProfileSummary: adjustedData.flowAllocationProfileSummary,
            //     addReceiverVolumeSavings: adjustedData.addReceiverVolumeSavings,
            //     addReceiverVolumeProfileSummary: adjustedData.addReceiverVolumeProfileSummary,
            //     adjustCascadingSetPointsSavings: adjustedData.adjustCascadingSetPointsSavings,
            //     adjustCascadingSetPointsProfileSummary: adjustedData.adjustCascadingSetPointsProfileSummary,
            //     improveEndUseEfficiencySavings: adjustedData.improveEndUseEfficiencySavings,
            //     improveEndUseEfficiencyProfileSummary: adjustedData.improveEndUseEfficiencyProfileSummary,
            //     reduceAirLeaksSavings: adjustedData.reduceAirLeaksSavings,
            //     reduceAirLeaksProfileSummary: adjustedData.reduceAirLeaksProfileSummary,
            //     reduceRunTimeSavings: adjustedData.reduceRunTimeSavings,
            //     reduceRunTimeProfileSummary: adjustedData.reduceRunTimeProfileSummary,
            //     reduceSystemAirPressureSavings: adjustedData.reduceSystemAirPressureSavings,
            //     reduceSystemAirPressureProfileSummary: adjustedData.reduceSystemAirPressureProfileSummary,
            //     useAutomaticSequencerSavings: adjustedData.useAutomaticSequencerSavings,
            //     useAutomaticSequencerProfileSummary: adjustedData.useAutomaticSequencerProfileSummary,
            //     auxiliaryPowerUsage: adjustedData.auxiliaryPowerUsage,
            //     dayTypeName: dayType.name,
            //     peakDemand: peakDemand,
            //     peakDemandCost: peakDemandCost,
            //     peakDemandCostSavings: peakDemandCostSavings,
            //     totalAnnualOperatingCost: totalModifiedAnnualOperatingCost,
            //     annualEmissionOutput: allSavingsResults.adjustedResults.annualEmissionOutput
            // });
        });
    }

    setInventoryItems(caInventoryItems: Array<CompressorInventoryItem>) {
        this.modifiedInventoryItems = caInventoryItems.map(item => {
            return new CompressorInventoryItemClass(item);
        });
    }

    setDayTypeModificationResults(results: CompressedAirAssessmentResult) {
        let modificationResults: Array<DayTypeModificationResult> = new Array();

    }
}