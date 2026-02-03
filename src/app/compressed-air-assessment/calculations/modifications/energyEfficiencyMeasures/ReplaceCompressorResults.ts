import { CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ReplaceCompressor, SystemInformation, SystemProfileSetup } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { getEmptyProfileSummaryData, getProfileSummaryTotals } from "../../caCalculationHelpers";
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
        order: number,
        systemProfileSetup: SystemProfileSetup
    ) {
        this.order = order;
        this.adjustedCompressors = adjustedCompressors;
        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = getProfileSummaryTotals(
            summaryDataInterval,
            this.profileSummary,
            false,
            dayType,
            undefined,
            this.adjustedCompressors);

        //1. Turn off old compressors..
        this.turnOffCompressors(replaceCompressor.currentCompressorMapping);
        //2. Add new compressors..
        this.addReplacementCompressors(replacementCompressors, replaceCompressor.replacementCompressorMapping, systemProfileSetup, dayType);

        // this.replaceCompressors(replaceCompressor.compressorsMapping, replacementCompressors);
        //2. Reallocate flow based on new compressors..
        let implementationCost: number = replaceCompressor.implementationCost;
        if (replaceCompressor.salvageValue) {
            implementationCost = implementationCost - replaceCompressor.salvageValue;
        }

        let flowReallocationResults: FlowReallocationResults = new FlowReallocationResults(dayType,
            settings,
            this.profileSummary,
            this.adjustedCompressors,
            0,
            adjustedProfileSummaryTotal,
            atmosphericPressure,
            totalAirStorage,
            systemInformation,
            undefined,
            _compressedAirCalculationService,
            costKwh,
            implementationCost,
            summaryDataInterval,
            undefined,
            order,
            replaceCompressor.trimSelections);
        this.profileSummary = flowReallocationResults.profileSummary;

        this.savings = new CompressedAirEemSavingsResult(previousProfileSummary, this.profileSummary, dayType, costKwh, implementationCost, summaryDataInterval, undefined);
    }


    turnOffCompressors(
        currentCompressorMapping: Array<{
            originalCompressorId: string,
            isReplaced: boolean
        }>
    ) {
        let compressorToTurnOff: Array<string> = currentCompressorMapping.filter(mapping => { return mapping.isReplaced == true }).map(mapping => { return mapping.originalCompressorId });
        // this.profileSummary.forEach(summary => {
        //     if (compressorToTurnOff.includes(summary.compressorId)) {
        //         summary.isCompressorReplaced = true;
        //         summary.profileSummaryData.forEach(data => {
        //             data.order = 0;
        //         })
        //     }
        // });
        this.profileSummary = this.profileSummary.filter(summary => { return !compressorToTurnOff.includes(summary.compressorId) });
        this.adjustedCompressors = this.adjustedCompressors.filter(compressor => { return !compressorToTurnOff.includes(compressor.itemId) });
    }

    addReplacementCompressors(replacementCompressors: Array<CompressorInventoryItemClass>, replacementCompressorMapping: Array<{ replacementCompressorId: string, isAdded: boolean }>,
        systemProfileSetup: SystemProfileSetup, dayType: CompressedAirDayType
    ) {
        replacementCompressorMapping.filter(mapping => { return mapping.isAdded == true }).forEach(mapping => {
            let replacement: CompressorInventoryItem = replacementCompressors.find(comp => { return comp.itemId == mapping.replacementCompressorId });
            this.adjustedCompressors.push(new CompressorInventoryItemClass(replacement));
            let _profileSummary: ProfileSummary = {
                compressorId: replacement.itemId,
                dayTypeId: dayType.dayTypeId,
                profileSummaryData: getEmptyProfileSummaryData(systemProfileSetup, true),
                fullLoadPressure: replacement.performancePoints.fullLoad.dischargePressure,
                fullLoadCapacity: replacement.performancePoints.fullLoad.airflow
            };
            this.profileSummary.push(new CompressedAirProfileSummary(_profileSummary, true));
        });
    }
}