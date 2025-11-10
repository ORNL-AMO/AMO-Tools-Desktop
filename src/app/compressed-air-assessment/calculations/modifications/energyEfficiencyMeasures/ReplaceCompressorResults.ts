import { CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ReplaceCompressor, SystemInformation, SystemProfileSetup } from "../../../../shared/models/compressed-air-assessment";
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
        order: number,
        systemProfileSetup: SystemProfileSetup
    ) {
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
        // let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = getProfileSummaryTotals(
        //     summaryDataInterval,
        //     this.profileSummary,
        //     false,
        //     dayType,
        //     undefined,
        //     this.adjustedCompressors);

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
            order);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
        this.order = order;
    }


    turnOffCompressors(
        currentCompressorMapping: Array<{
            originalCompressorId: string,
            isReplaced: boolean
        }>
    ) {
        let compressorToTurnOff: Array<string> = currentCompressorMapping.filter(mapping => { return mapping.isReplaced == true }).map(mapping => { return mapping.originalCompressorId });
        this.profileSummary.forEach(summary => {
            if (compressorToTurnOff.includes(summary.compressorId)) {
                summary.isCompressorReplaced = true;
                summary.profileSummaryData.forEach(data => {
                    data.order = 0;
                })
            }
        });
    }

    addReplacementCompressors(replacementCompressors: Array<CompressorInventoryItemClass>, replacementCompressorMapping: Array<{ replacementCompressorId: string, isAdded: boolean }>,
        systemProfileSetup: SystemProfileSetup, dayType: CompressedAirDayType
    ) {

        let intervalData: Array<{ isCompressorOn: boolean, timeInterval: number }> = new Array();
        for (let i = 0; i < 24;) {
            intervalData.push({
                isCompressorOn: false,
                timeInterval: i
            })
            i = i + systemProfileSetup.dataInterval
        }
        replacementCompressorMapping.filter(mapping => { return mapping.isAdded == true }).forEach(mapping => {
            let replacement: CompressorInventoryItem = replacementCompressors.find(comp => { return comp.itemId == mapping.replacementCompressorId });
            this.adjustedCompressors.push(new CompressorInventoryItemClass(replacement));
            let _profileSummary: ProfileSummary = {
                compressorId: replacement.itemId,
                dayTypeId: dayType.dayTypeId,
                profileSummaryData: this.getEmptyProfileSummaryData(systemProfileSetup),
                fullLoadPressure: replacement.performancePoints.fullLoad.dischargePressure,
                fullLoadCapacity: replacement.performancePoints.fullLoad.airflow
            };
            console.log(_profileSummary)
            this.profileSummary.push(new CompressedAirProfileSummary(_profileSummary, true));
        });
        console.log(this.profileSummary)
    }

    //TODO: Update performance profile with new compressors and turned off compressors
    // replaceCompressors(compressorsMapping: Array<{ originalCompressorId: string, replacementCompressorId: string }>, replacementCompressors: Array<CompressorInventoryItemClass>) {
    //     compressorsMapping.forEach(mapping => {
    //         if (mapping.replacementCompressorId) {
    //             let replacementCompressor: CompressorInventoryItemClass = replacementCompressors.find(comp => { return comp.itemId == mapping.replacementCompressorId });
    //             let indexToReplace: number = this.adjustedCompressors.findIndex(comp => { return comp.itemId == mapping.originalCompressorId });
    //             let replacementCompressorClass: CompressorInventoryItemClass = new CompressorInventoryItemClass(replacementCompressor);
    //             replacementCompressorClass.isReplacementCompressor = true;
    //             replacementCompressorClass.originalCompressorId = mapping.originalCompressorId;
    //             this.adjustedCompressors[indexToReplace] = replacementCompressorClass;
    //         }
    //     });
    // }


    getEmptyProfileSummaryData(systemProfileSetup: SystemProfileSetup): Array<ProfileSummaryData> {
        let summaryData: Array<ProfileSummaryData> = new Array();
        for (let i = 0; i < 24;) {
            summaryData.push({
                power: 0,
                airflow: 0,
                percentCapacity: 0,
                timeInterval: i,
                percentPower: undefined,
                percentSystemCapacity: undefined,
                percentSystemPower: undefined,
                order: 100
            })
            i = i + systemProfileSetup.dataInterval;
        }
        return summaryData;
    }

}