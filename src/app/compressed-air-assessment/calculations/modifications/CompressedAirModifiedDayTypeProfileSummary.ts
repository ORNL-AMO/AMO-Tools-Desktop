import { DayType } from "../../../log-tool/log-tool-models";
import { AssessmentCo2SavingsService } from "../../../shared/assessment-co2-savings/assessment-co2-savings.service";
import { AdjustCascadingSetPoints, CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ImproveEndUseEfficiency, Modification, ProfileSummaryTotal, ReduceAirLeaks, ReduceRuntime, ReduceSystemAirPressure, SystemInformation, UseAutomaticSequencer } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../compressed-air-calculation.service";
import { getProfileSummaryTotals } from "../caCalculationHelpers";
import { DayTypeModificationResult } from "../caCalculationModels";
import { CompressedAirBaselineDayTypeProfileSummary } from "../CompressedAirBaselineDayTypeProfileSummary";
import { CompressedAirProfileSummary } from "../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../CompressorInventoryItemClass";
import { CompressedAirEemSavingsResult } from "./CompressedAirEemSavingsResult";
import { AdjustCascadingSetPointsResults } from "./energyEfficiencyMeasures/AdjustCascadingSetPointsSavingsResults";
import { FlowReallocationResults } from "./energyEfficiencyMeasures/FlowReallocationResults";
import { ImproveEndUseEfficiencyResults } from "./energyEfficiencyMeasures/ImproveEndUseEfficiencyResults";
import { ReduceAirLeaksResults } from "./energyEfficiencyMeasures/ReduceAirLeaksResults";
import { ReduceSystemAirPressureResults } from "./energyEfficiencyMeasures/ReduceSystemAirPressureResults";
import { UseAutomaticSequencerResults } from "./energyEfficiencyMeasures/UseAutomaticSequencerResults";
import * as _ from 'lodash';

export class CompressedAirModifiedDayTypeProfileSummary {

    originalCompressors: Array<CompressorInventoryItemClass>
    adjustedCompressors: Array<CompressorInventoryItemClass>;
    adjustedProfileSummary: Array<CompressedAirProfileSummary>;
    adjustedProfileSummaryTotals: Array<ProfileSummaryTotal>;

    dayType: CompressedAirDayType;
    totalFullLoadCapacity: number;
    totalFullLoadPower: number;
    flowReallocationResults: FlowReallocationResults;
    addPrimaryReceiverVolumeResults: FlowReallocationResults;
    adjustCascadingSetPointsResults: AdjustCascadingSetPointsResults;
    improveEndUseEfficiencyResults: ImproveEndUseEfficiencyResults;
    reduceRuntimeResults: FlowReallocationResults;
    reduceAirLeaksResults: ReduceAirLeaksResults;
    reduceSystemAirPressureResults: ReduceSystemAirPressureResults
    useAutomaticSequencerResults: UseAutomaticSequencerResults;

    auxiliaryPowerUsage: { cost: number, energyUse: number } = { cost: 0, energyUse: 0 };
    atmosphericPressure: number;
    totalAirStorage: number;
    systemInformation: SystemInformation;
    costKwh: number;
    summaryDataInterval: number;
    modificationImplementationCost: number;
    modificationSavings: CompressedAirEemSavingsResult;

    peakDemand: number;
    peakDemandCost: number;
    peakDemandCostSavings: number;
    totalModifiedAnnualOperatingCost: number;
    constructor(dayType: CompressedAirDayType,
        baselineDayTypeProfileSummaries: Array<CompressedAirBaselineDayTypeProfileSummary>,
        settings: Settings,
        _compressedAirCalculationService: CompressedAirCalculationService,
        compressedAirAssessment: CompressedAirAssessment,
        modification: Modification,
        _assessmentCo2SavingsService: AssessmentCo2SavingsService
    ) {
        this.dayType = dayType;
        this.atmosphericPressure = compressedAirAssessment.systemInformation.atmosphericPressure;
        this.totalAirStorage = compressedAirAssessment.systemInformation.totalAirStorage;
        this.systemInformation = compressedAirAssessment.systemInformation;
        this.costKwh = compressedAirAssessment.systemBasics.electricityCost;
        this.summaryDataInterval = compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;

        //baseline profile summary
        let baselineDayTypeProfileSummary: CompressedAirBaselineDayTypeProfileSummary = baselineDayTypeProfileSummaries.find(summary => { return summary.dayType.dayTypeId == dayType.dayTypeId });
        this.adjustedProfileSummary = baselineDayTypeProfileSummary.profileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });
        //initialize original and adjusted compressors
        this.setInventoryItems(compressedAirAssessment.compressorInventoryItems);
        //Apply target sequencer
        if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer') {
            this.adjustedCompressors.forEach(compressor => {
                compressor.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessment.systemInformation.targetPressure, compressedAirAssessment.systemInformation.variance, compressedAirAssessment.systemInformation, settings)
            });
        }
        //Initial Flow Reallocation
        this.setFlowReallocationResults(settings, _compressedAirCalculationService, modification.flowReallocation.implementationCost);
        //Apply Modifications in order
        let modificationOrders: Array<number> = this.getModificationOrders(modification);
        //improveEndUseEfficiency and reduceRuntime will be set according to the order
        let improveEndUseEfficiency: ImproveEndUseEfficiency;
        let reduceRuntime: ReduceRuntime;
        for (let orderIndex = 1; orderIndex <= modificationOrders.length; orderIndex++) {
            //Calculate totals for adjusted profile summary
            this.adjustedProfileSummaryTotals = getProfileSummaryTotals(this.summaryDataInterval, this.adjustedProfileSummary, false, this.dayType, improveEndUseEfficiency);
            //Primary receiver volume
            if (modification.addPrimaryReceiverVolume.order == orderIndex) {
                this.setAddPrimaryReceiverVolumeResults(settings, reduceRuntime, _compressedAirCalculationService, modification.addPrimaryReceiverVolume.implementationCost, modification.addPrimaryReceiverVolume.increasedVolume);
            }
            //Adjust cascading set points
            else if (modification.adjustCascadingSetPoints.order == orderIndex) {
                this.setAdjustCascadingSetPointsResults(modification.adjustCascadingSetPoints, settings, reduceRuntime, _compressedAirCalculationService);
            }
            //Improve end use efficiency
            else if (modification.improveEndUseEfficiency.order == orderIndex) {
                improveEndUseEfficiency = modification.improveEndUseEfficiency;
                this.setImproveEndUseEfficiencyResults(improveEndUseEfficiency, settings, reduceRuntime, _compressedAirCalculationService);
            }
            //Reduce runtime
            else if (modification.reduceRuntime.order == orderIndex) {
                reduceRuntime = modification.reduceRuntime;
                this.setReduceRuntimeResults(settings, reduceRuntime, _compressedAirCalculationService, modification.reduceRuntime.implementationCost);
            }
            //Reduce air leaks
            else if (modification.reduceAirLeaks.order == orderIndex) {
                this.setReduceAirLeaksResults(modification.reduceAirLeaks, settings, reduceRuntime, _compressedAirCalculationService);
            }
            //Reduce system air pressure
            else if (modification.reduceSystemAirPressure.order == orderIndex) {
                this.setReduceSystemAirPressureResults(modification.reduceSystemAirPressure, settings, reduceRuntime, _compressedAirCalculationService);
            }
            //Use automatic sequencer
            else if (modification.useAutomaticSequencer.order == orderIndex) {
                this.setUseAutomaticSequencerResults(modification.useAutomaticSequencer, settings, reduceRuntime, _compressedAirCalculationService);
            }
        }
        //Final profile totals
        this.adjustedProfileSummaryTotals = getProfileSummaryTotals(this.summaryDataInterval, this.adjustedProfileSummary, true, this.dayType, improveEndUseEfficiency);
        //Calculate total savings
        this.modificationSavings = new CompressedAirEemSavingsResult(baselineDayTypeProfileSummary.profileSummary, this.adjustedProfileSummary, dayType, this.costKwh, this.modificationImplementationCost, this.summaryDataInterval, this.auxiliaryPowerUsage);
        //Calculate CO2 savings
        if (compressedAirAssessment.systemInformation.co2SavingsData) {
            compressedAirAssessment.systemInformation.co2SavingsData.electricityUse = this.modificationSavings.adjustedResults.power;
            this.modificationSavings.adjustedResults.annualEmissionOutput = _assessmentCo2SavingsService.getCo2EmissionsResult(compressedAirAssessment.systemInformation.co2SavingsData, settings);
            // * handle offset result - electricity use is passed here as kWh but the method is meant to accept MWh
            this.modificationSavings.adjustedResults.annualEmissionOutput = this.modificationSavings.adjustedResults.annualEmissionOutput / 1000;
            this.modificationSavings.savings.annualEmissionOutputSavings = baselineDayTypeProfileSummary.emissionsOutput - this.modificationSavings.adjustedResults.annualEmissionOutput;
        }
        //Calculate peak demand and cost
        this.setPeakDemandCosts(compressedAirAssessment, baselineDayTypeProfileSummary);
    }

    setInventoryItems(caInventoryItems: Array<CompressorInventoryItem>) {
        this.originalCompressors = caInventoryItems.map(item => {
            return new CompressorInventoryItemClass(item);
        });
        this.adjustedCompressors = caInventoryItems.map(item => {
            return new CompressorInventoryItemClass(item);
        });
    }

    getModificationOrders(modification: Modification): Array<number> {
        let modificationOrders: Array<number> = [
            modification.addPrimaryReceiverVolume.order,
            modification.adjustCascadingSetPoints.order,
            modification.improveEndUseEfficiency.order,
            modification.reduceRuntime.order,
            modification.reduceAirLeaks.order,
            modification.reduceSystemAirPressure.order,
            modification.useAutomaticSequencer.order,
        ]
        return modificationOrders.filter(order => { return order != 100 });
    }

    setFlowReallocationResults(
        settings: Settings,
        _compressedAirCalculationService: CompressedAirCalculationService,
        implementationCost: number) {
        this.flowReallocationResults = new FlowReallocationResults(this.dayType,
            settings,
            this.adjustedProfileSummary,
            this.adjustedCompressors,
            0,
            this.adjustedProfileSummaryTotals,
            this.atmosphericPressure,
            this.totalAirStorage,
            this.systemInformation,
            undefined,
            _compressedAirCalculationService,
            this.costKwh,
            implementationCost,
            this.summaryDataInterval);
        this.adjustedProfileSummary = this.flowReallocationResults.profileSummary;
    }

    // reallocate flow with additional receiver volume
    setAddPrimaryReceiverVolumeResults(
        settings: Settings,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService,
        implementationCost: number,
        additionalReceiverVolume: number) {
        this.addPrimaryReceiverVolumeResults = new FlowReallocationResults(this.dayType,
            settings,
            this.adjustedProfileSummary,
            this.adjustedCompressors,
            additionalReceiverVolume,
            this.adjustedProfileSummaryTotals,
            this.atmosphericPressure,
            this.totalAirStorage,
            this.systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            this.costKwh,
            implementationCost,
            this.summaryDataInterval,
            this.auxiliaryPowerUsage);
        this.adjustedProfileSummary = this.addPrimaryReceiverVolumeResults.profileSummary;
    }

    setAdjustCascadingSetPointsResults(
        adjustCascadingSetPoints: AdjustCascadingSetPoints,
        settings: Settings,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService) {
        this.adjustCascadingSetPointsResults = new AdjustCascadingSetPointsResults(this.dayType,
            this.adjustedCompressors,
            adjustCascadingSetPoints,
            this.atmosphericPressure,
            settings,
            this.adjustedProfileSummary,
            this.originalCompressors,
            this.costKwh,
            this.summaryDataInterval,
            this.auxiliaryPowerUsage,
            this.totalAirStorage,
            this.systemInformation,
            reduceRuntime,
            _compressedAirCalculationService);
        this.adjustedProfileSummary = this.adjustCascadingSetPointsResults.profileSummary;
        this.adjustedCompressors = this.adjustCascadingSetPointsResults.adjustedCompressors;
    }

    setImproveEndUseEfficiencyResults(improveEndUseEfficiency: ImproveEndUseEfficiency,
        settings: Settings,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService
    ) {
        this.improveEndUseEfficiencyResults = new ImproveEndUseEfficiencyResults(this.dayType,
            improveEndUseEfficiency,
            this.adjustedProfileSummaryTotals,
            settings,
            this.adjustedProfileSummary,
            this.adjustedCompressors,
            this.atmosphericPressure,
            this.totalAirStorage,
            this.systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            this.costKwh,
            this.summaryDataInterval,
            this.auxiliaryPowerUsage
        );
        this.adjustedProfileSummary = this.improveEndUseEfficiencyResults.profileSummary;
        this.auxiliaryPowerUsage = this.improveEndUseEfficiencyResults.auxiliaryPowerUsage;
    }

    setReduceRuntimeResults(
        settings: Settings,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService,
        implementationCost: number) {
        this.reduceRuntimeResults = new FlowReallocationResults(this.dayType,
            settings,
            this.adjustedProfileSummary,
            this.adjustedCompressors,
            0,
            this.adjustedProfileSummaryTotals,
            this.atmosphericPressure,
            this.totalAirStorage,
            this.systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            this.costKwh,
            implementationCost,
            this.summaryDataInterval,
            this.auxiliaryPowerUsage);
        this.adjustedProfileSummary = this.reduceRuntimeResults.profileSummary;
    }

    setReduceAirLeaksResults(reduceAirLeaks: ReduceAirLeaks,
        settings: Settings,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService
    ) {
        this.reduceAirLeaksResults = new ReduceAirLeaksResults(this.dayType,
            reduceAirLeaks,
            this.adjustedProfileSummaryTotals,
            settings,
            this.adjustedProfileSummary,
            this.adjustedCompressors,
            this.atmosphericPressure,
            this.totalAirStorage,
            this.systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            this.costKwh,
            this.summaryDataInterval,
            this.auxiliaryPowerUsage
        );
        this.adjustedProfileSummary = this.reduceAirLeaksResults.profileSummary;
    }

    setReduceSystemAirPressureResults(
        reduceSystemAirPressure: ReduceSystemAirPressure,
        settings: Settings,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService) {
        this.reduceSystemAirPressureResults = new ReduceSystemAirPressureResults(this.dayType,
            this.adjustedCompressors,
            reduceSystemAirPressure,
            this.atmosphericPressure,
            settings,
            this.adjustedProfileSummary,
            this.originalCompressors,
            this.costKwh,
            this.summaryDataInterval,
            this.auxiliaryPowerUsage,
            this.totalAirStorage,
            this.systemInformation,
            reduceRuntime,
            _compressedAirCalculationService);
        this.adjustedProfileSummary = this.reduceSystemAirPressureResults.profileSummary;
        this.adjustedCompressors = this.reduceSystemAirPressureResults.adjustedCompressors;
    }

    setUseAutomaticSequencerResults(
        useAutomaticSequencer: UseAutomaticSequencer,
        settings: Settings,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService) {
        this.useAutomaticSequencerResults = new UseAutomaticSequencerResults(this.dayType,
            this.adjustedCompressors,
            useAutomaticSequencer,
            this.atmosphericPressure,
            settings,
            this.adjustedProfileSummary,
            this.costKwh,
            this.summaryDataInterval,
            this.auxiliaryPowerUsage,
            this.totalAirStorage,
            this.systemInformation,
            reduceRuntime,
            _compressedAirCalculationService);
        this.adjustedProfileSummary = this.useAutomaticSequencerResults.profileSummary;
        this.adjustedCompressors = this.useAutomaticSequencerResults.adjustedCompressors;
    }

    setTotalImplementationCost(modification: Modification) {
        let implementationCost: number = 0;
        if (modification.addPrimaryReceiverVolume.order != 100) {
            implementationCost += modification.addPrimaryReceiverVolume.implementationCost;
        }
        if (modification.adjustCascadingSetPoints.order != 100) {
            implementationCost += modification.adjustCascadingSetPoints.implementationCost;
        }
        if (modification.improveEndUseEfficiency.order != 100) {
            modification.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => { implementationCost += item.implementationCost });
        }
        if (modification.reduceAirLeaks.order != 100) {
            implementationCost += modification.reduceAirLeaks.implementationCost;
        }
        if (modification.reduceRuntime.order != 100) {
            implementationCost += modification.reduceRuntime.implementationCost;
        }
        if (modification.reduceSystemAirPressure.order != 100) {
            implementationCost += modification.reduceSystemAirPressure.implementationCost;
        }
        if (modification.useAutomaticSequencer.order != 100) {
            implementationCost += modification.useAutomaticSequencer.implementationCost;
        }
        if (modification.flowReallocation) {
            implementationCost += modification.flowReallocation.implementationCost;
        }
        this.modificationImplementationCost = implementationCost;
    }

    setPeakDemandCosts(compressedAirAssessment: CompressedAirAssessment,
        baselineDayTypeProfileSummary: CompressedAirBaselineDayTypeProfileSummary) {
        let peakDemandObj: ProfileSummaryTotal = _.maxBy(this.adjustedProfileSummaryTotals, (result: ProfileSummaryTotal) => { return result.totalPower });
        this.peakDemand = peakDemandObj?.totalPower || 0;
        this.peakDemandCost = this.peakDemand * 12 * compressedAirAssessment.systemBasics.demandCost;
        this.peakDemandCostSavings = 0;
        if (baselineDayTypeProfileSummary.baselineResult) {
            this.peakDemandCostSavings = baselineDayTypeProfileSummary.baselineResult.demandCost - this.peakDemandCost;
        }
        this.totalModifiedAnnualOperatingCost = this.peakDemandCost + this.modificationSavings.adjustedResults.cost;
    }


    getDayTypeModificationResult(): DayTypeModificationResult {
        return {
          adjustedProfileSummary: this.adjustedProfileSummary,
          adjustedCompressors: this.adjustedCompressors,
          profileSummaryTotals: this.adjustedProfileSummaryTotals,
          allSavingsResults: this.modificationSavings,
          flowReallocationSavings: this.flowReallocationResults.savings,
          flowAllocationProfileSummary: this.flowReallocationResults.profileSummary,
          addReceiverVolumeSavings: this.addPrimaryReceiverVolumeResults.savings,
          addReceiverVolumeProfileSummary: this.addPrimaryReceiverVolumeResults.profileSummary,
          adjustCascadingSetPointsSavings: this.adjustCascadingSetPointsResults.savings,
          adjustCascadingSetPointsProfileSummary: this.adjustCascadingSetPointsResults.profileSummary,
          improveEndUseEfficiencySavings: this.improveEndUseEfficiencyResults.savings,
          improveEndUseEfficiencyProfileSummary: this.improveEndUseEfficiencyResults.profileSummary,
          reduceAirLeaksSavings: this.reduceAirLeaksResults.savings,
          reduceAirLeaksProfileSummary: this.reduceAirLeaksResults.profileSummary,
          reduceRunTimeSavings: this.reduceRuntimeResults.savings,
          reduceRunTimeProfileSummary: this.reduceRuntimeResults.profileSummary,
          reduceSystemAirPressureSavings: this.reduceSystemAirPressureResults.savings,
          reduceSystemAirPressureProfileSummary: this.reduceSystemAirPressureResults.profileSummary,
          useAutomaticSequencerSavings: this.useAutomaticSequencerResults.savings,
          useAutomaticSequencerProfileSummary: this.useAutomaticSequencerResults.profileSummary,
          auxiliaryPowerUsage: this.auxiliaryPowerUsage,
          dayTypeId: this.dayType.dayTypeId,
          dayTypeName: this.dayType.name,
          peakDemand: this.peakDemand,
          peakDemandCost: this.peakDemandCost,
          peakDemandCostSavings: this.peakDemandCostSavings,
          totalAnnualOperatingCost: this.totalModifiedAnnualOperatingCost,
          annualEmissionOutput: this.modificationSavings.adjustedResults.annualEmissionOutput

        }
    }
}