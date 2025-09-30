import { CompressedAirDayType, PerformancePoint, ProfileSummaryTotal, ReduceRuntime, ReduceSystemAirPressure, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { getProfileSummaryTotals } from "../../caCalculationHelpers";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";
import { systemPressureChangeAdjustProfile } from "./compressorsAdjustment";
import { FlowReallocationResults } from "./FlowReallocationResults";
import * as _ from 'lodash';

export class ReduceSystemAirPressureResults {

    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    adjustedCompressors: Array<CompressorInventoryItemClass>;
    order: number
    constructor(
        dayType: CompressedAirDayType,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        reduceSystemAirPressure: ReduceSystemAirPressure,
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
        _compressedAirCalculationService: CompressedAirCalculationService,
        order: number) {

        this.adjustedCompressors = adjustedCompressors;
        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });
        if (reduceSystemAirPressure.averageSystemPressureReduction != 0) {
            //1. Adjust compressor set points
            this.reduceSystemAirPressureAdjustCompressors(reduceSystemAirPressure, atmosphericPressure, settings);
            //2. Adjust profile based on new set points
            this.profileSummary = systemPressureChangeAdjustProfile(originalCompressors, settings, adjustedCompressors, atmosphericPressure, this.profileSummary);
        }
        //3. Reallocate flow based on new set points
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = getProfileSummaryTotals(
            summaryDataInterval,
            this.profileSummary,
            false,
            dayType,
            undefined,
            this.adjustedCompressors);
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
            reduceSystemAirPressure.implementationCost,
            summaryDataInterval,
            auxiliaryPowerUsage,
            order);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
        this.order = order;
    }

    reduceSystemAirPressureAdjustCompressors(reduceSystemAirPressure: ReduceSystemAirPressure, atmosphericPressure: number, settings: Settings) {
        this.adjustedCompressors.forEach(compressor => {

            compressor.reduceSystemPressure(reduceSystemAirPressure, atmosphericPressure, settings);
        });
    }
}