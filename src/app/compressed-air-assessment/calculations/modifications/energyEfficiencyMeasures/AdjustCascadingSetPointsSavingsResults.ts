import { AdjustCascadingSetPoints, CascadingSetPointData, CompressedAirAssessment, CompressedAirDayType, ProfileSummary, ProfileSummaryTotal, ReduceRuntime, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { EemSavingsResults } from "../../caCalculationModels";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import * as _ from 'lodash';
import { getProfileSummaryTotals } from "../../caCalculationHelpers";
import { FlowReallocationResults } from "./FlowReallocationResults";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { systemPressureChangeAdjustProfile } from "./CompressorsAdjustment";

export class AdjustCascadingSetPointsResults {

    savings: EemSavingsResults;
    profileSummary: Array<CompressedAirProfileSummary>;
    adjustedCompressors: Array<CompressorInventoryItemClass>;

    constructor(
        dayType: CompressedAirDayType,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        adjustCascadingSetPoints: AdjustCascadingSetPoints,
        atmosphericPressure: number,
        settings: Settings,
        previousProfileSummary: Array<CompressedAirProfileSummary>,
        originalCompressors: Array<CompressorInventoryItemClass>,
        costKwh: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },
        totalAirStorage: number,
        systemInformation: SystemInformation,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService) {
        this.adjustedCompressors = adjustedCompressors;
        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });

        //1. Adjust compressor set points
        this.adjustCascadingSetPointsAdjustCompressors(adjustCascadingSetPoints, atmosphericPressure, settings);
        //2. Adjust profile based on new set points
        this.profileSummary = systemPressureChangeAdjustProfile(originalCompressors, settings, adjustedCompressors, atmosphericPressure, this.profileSummary);
        //3. Reallocate flow based on new set points
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = getProfileSummaryTotals(
            summaryDataInterval,
            this.profileSummary,
            false,
            dayType,
            undefined);
        let flowReallocationResults: FlowReallocationResults = new FlowReallocationResults(dayType,
            settings,
            previousProfileSummary,
            this.adjustedCompressors,
            0,
            adjustedProfileSummaryTotal,
            atmosphericPressure,
            totalAirStorage,
            systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            costKwh,
            adjustCascadingSetPoints.implementationCost,
            summaryDataInterval,
            auxiliaryPowerUsage);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
    }

    adjustCascadingSetPointsAdjustCompressors(adjustCascadingSetPoints: AdjustCascadingSetPoints, atmosphericPressure: number, settings: Settings) {
        this.adjustedCompressors.forEach(compressor => {
            compressor.adjustCascadingSetPoints(adjustCascadingSetPoints, atmosphericPressure, settings);
        });
    }
}