import { AdjustCascadingSetPoints, CompressedAirDayType, ProfileSummaryTotal, ReduceRuntime, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import * as _ from 'lodash';
import { FlowReallocationResults } from "./FlowReallocationResults";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { systemPressureChangeAdjustProfile } from "./compressorsAdjustment";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";

export class AdjustCascadingSetPointsResults {

    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    adjustedCompressors: Array<CompressorInventoryItemClass>;
    order: number;
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
        _compressedAirCalculationService: CompressedAirCalculationService,
        order: number,
        trimSelections: Array<{ dayTypeId: string, compressorId: string }>) {
        this.order = order;
        this.adjustedCompressors = adjustedCompressors;
        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });

        //1. Adjust compressor set points
        this.adjustCascadingSetPointsAdjustCompressors(adjustCascadingSetPoints, atmosphericPressure, settings, _compressedAirCalculationService);
        //2. Adjust profile based on new set points
        this.profileSummary = systemPressureChangeAdjustProfile(originalCompressors, settings, adjustedCompressors, atmosphericPressure, this.profileSummary, _compressedAirCalculationService);
        //3. Reallocate flow based on new set points
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = _compressedAirCalculationService.calculateProfileSummaryTotals(
            summaryDataInterval,
            this.profileSummary,
            dayType,
            undefined,
            this.adjustedCompressors,
            settings);
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
            auxiliaryPowerUsage,
            order,
            trimSelections);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
    }

    adjustCascadingSetPointsAdjustCompressors(adjustCascadingSetPoints: AdjustCascadingSetPoints, atmosphericPressure: number, settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService) {
        adjustCascadingSetPoints.setPointData.forEach(setPointData => {
            let compressorToAdjust: CompressorInventoryItemClass = _.find(this.adjustedCompressors, (compressor) => { return compressor.itemId == setPointData.compressorId; });
            if (compressorToAdjust) {
                compressorToAdjust.adjustCascadingSetPoints(adjustCascadingSetPoints, atmosphericPressure, settings, _compressedAirCalculationService);
            }
        });
    }


}
