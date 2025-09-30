import { CompressedAirDayType, CompressorInventoryItem, ProfileSummaryTotal, ReplaceCompressor, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { getProfileSummaryTotals } from "../../caCalculationHelpers";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";
import { FlowReallocationResults } from "./FlowReallocationResults";

export class ReplaceCompressorResults {


    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    adjustedCompressors: Array<CompressorInventoryItemClass>;
    order: number
    constructor(dayType: CompressedAirDayType,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        replaceCompressor: ReplaceCompressor,
        atmosphericPressure: number,
        settings: Settings,
        previousProfileSummary: Array<CompressedAirProfileSummary>,
        replacementCompressors: Array<CompressorInventoryItemClass>,
        costKwh: number,
        summaryDataInterval: number,
        totalAirStorage: number,
        systemInformation: SystemInformation,
        _compressedAirCalculationService: CompressedAirCalculationService,
        order: number
    ) {
        this.adjustedCompressors = adjustedCompressors;
        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });
        //1. Replace Compressors
        this.replaceCompressors(replaceCompressor.compressorsMapping, replacementCompressors);
        //2. Reallocate flow based on new compressors..
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
            undefined,
            _compressedAirCalculationService,
            costKwh,
            replaceCompressor.implementationCost,
            summaryDataInterval,
            undefined,
            order);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
        this.order = order;
    }

    replaceCompressors(compressorsMapping: Array<{ originalCompressorId: string, replacementCompressorId: string }>, replacementCompressors: Array<CompressorInventoryItemClass>) {
        compressorsMapping.forEach(mapping => {
            if (mapping.replacementCompressorId) {
                let replacementCompressor: CompressorInventoryItemClass = replacementCompressors.find(comp => { return comp.itemId == mapping.replacementCompressorId });
                let indexToReplace: number = this.adjustedCompressors.findIndex(comp => { return comp.itemId == mapping.originalCompressorId });
                let replacementCompressorClass: CompressorInventoryItemClass = new CompressorInventoryItemClass(replacementCompressor);
                replacementCompressorClass.isReplacementCompressor = true;
                replacementCompressorClass.originalCompressorId = mapping.originalCompressorId;
                this.adjustedCompressors[indexToReplace] = replacementCompressorClass;
            }
        });
    }

}