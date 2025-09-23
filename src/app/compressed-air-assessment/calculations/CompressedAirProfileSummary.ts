import { ProfileSummary, ProfileSummaryData, SystemInformation } from "../../shared/models/compressed-air-assessment";
import { ProfileSummaryValid } from "../compressed-air-assessment.service";
import { CompressorInventoryItemClass } from "./CompressorInventoryItemClass";

export class CompressedAirProfileSummary {

    //todo: needed data
    fullLoadPressure: number;
    fullLoadCapacity: number;
    compressorId: string;
    dayTypeId: string;
    automaticShutdownTimer: boolean;
    avgPower: number;
    avgAirflow: number;
    avgPrecentPower: number;
    avgPercentCapacity: number;
    adjustedIsentropicEfficiency: number


    profileSummaryData: Array<ProfileSummaryData>;
    constructor(profileSummary: ProfileSummary, includeSummaryData: boolean) {
        this.fullLoadPressure = profileSummary.fullLoadPressure;
        this.fullLoadCapacity = profileSummary.fullLoadPressure;
        this.compressorId = profileSummary.compressorId;
        this.dayTypeId = profileSummary.dayTypeId;
        this.automaticShutdownTimer = profileSummary.automaticShutdownTimer;
        this.avgPower = profileSummary.avgPower;
        this.avgAirflow = profileSummary.avgAirflow;
        this.avgPrecentPower = profileSummary.avgPrecentPower;
        this.avgPercentCapacity = profileSummary.avgPercentCapacity;
        this.adjustedIsentropicEfficiency = profileSummary.adjustedIsentropicEfficiency;
        if (includeSummaryData) {
            this.profileSummaryData = profileSummary.profileSummaryData.map(data => {
                return data;
            })
        } else {
            this.profileSummaryData = new Array();
        }
    }

    // setOrdering(systemInformation: SystemInformation, adjustedCompressors: Array<CompressorInventoryItemClass>) {
    //     if (systemInformation.multiCompressorSystemControls == 'baseTrim') {
    //         //set base trim ordering
    //         let trimSelection: { dayTypeId: string, compressorId: string } = systemInformation.trimSelections.find(selection => { return selection.dayTypeId == this.dayTypeId });
    //         if (trimSelection.compressorId) {
    //             intervalData = this.setBaseTrimOrdering(intervalData, adjustedCompressors, neededAirFlow, trimSelection.compressorId, dayType, reduceRuntime);
    //         }
    //     } else if (systemInformation.multiCompressorSystemControls == 'loadSharing') {
    //         //share load..
    //         return this.shareLoad(intervalData, adjustedProfileSummary, adjustedCompressors, neededAirFlow, settings, additionalRecieverVolume, atmosphericPressure, totalAirStorage, reduceRuntime, dayType);
    //     }
    // }

    // setBaseTrimOrdering(intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }>, adjustedCompressors: Array<CompressorInventoryItem>, neededAirFlow: number, trimCompressorId: string, dayType: CompressedAirDayType, reduceRuntime?: ReduceRuntime): Array<{ compressorId: string, summaryData: ProfileSummaryData }> {
    //     let trimCompressor: CompressorInventoryItem = adjustedCompressors.find(compressor => { return compressor.itemId == trimCompressorId });
    //     let additionalAirflow: number = neededAirFlow - trimCompressor.performancePoints.fullLoad.airflow;
    //     if (additionalAirflow <= 0) {
    //         //just need trim compressor
    //         intervalData.forEach(interval => {
    //             if (interval.compressorId == trimCompressorId) {
    //                 interval.summaryData.order = 1;
    //             } else {
    //                 interval.summaryData.order = 0;
    //             }
    //         });
    //         return intervalData;
    //     }
    //     //check base compressors to turn on
    //     let baseCompressors: Array<string> = new Array();
    //     let order: number = 1;
    //     intervalData.forEach(iDataItem => {
    //         if (reduceRuntime) {
    //             let reduceRuntimeData: ReduceRuntimeData = reduceRuntime.runtimeData.find(dataItem => {
    //                 return dataItem.compressorId == iDataItem.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
    //             });
    //             let reduceRuntimeDataItem: { isCompressorOn: boolean, timeInterval: number } = reduceRuntimeData.intervalData.find(iData => { return iData.timeInterval == iDataItem.summaryData.timeInterval });
    //             if (!reduceRuntimeDataItem.isCompressorOn) {
    //                 iDataItem.summaryData.order = 0;
    //             } else if (reduceRuntimeDataItem.isCompressorOn && iDataItem.summaryData.order == 0) {
    //                 iDataItem.summaryData.order = order++;
    //             } else if (iDataItem.summaryData.order != 0) {
    //                 order++;
    //             }

    //         }
    //         if (iDataItem.compressorId != trimCompressorId && iDataItem.summaryData.order != 0) {
    //             baseCompressors.push(iDataItem.compressorId);
    //         }
    //     })
    //     let combinations: Array<Array<string>> = this.getCombinations(baseCompressors);
    //     let numBaseCompressors: number;
    //     let foundValidCombo: boolean = false;
    //     //find least amount of compressors usable
    //     for (let i = 0; i < combinations.length; i++) {
    //         let baseCompressorCombo: Array<string> = combinations[i];
    //         numBaseCompressors = baseCompressorCombo.length;
    //         let totalAirflowInCombo: number = 0;
    //         baseCompressorCombo.forEach(baseCompressorId => {
    //             let baseCompressor: CompressorInventoryItem = adjustedCompressors.find(compressor => {
    //                 return compressor.itemId == baseCompressorId;
    //             });
    //             totalAirflowInCombo += baseCompressor.performancePoints.fullLoad.airflow;
    //         });
    //         if ((additionalAirflow - totalAirflowInCombo) <= 0) {
    //             //break for loop. found least number of compressors
    //             foundValidCombo = true;
    //             i = combinations.length;
    //         }
    //     }
    //     if (foundValidCombo) {
    //         //filter combos that meet smallest number of compressors on
    //         let smallestCompressorCombos: Array<Array<string>> = combinations.filter(combo => { return combo.length == numBaseCompressors });
    //         let validCompressorCombos: Array<{
    //             totalPower: number,
    //             compressorIds: Array<string>
    //         }> = new Array();
    //         //get power of smallest compressors combos to select ideal compressor combination
    //         for (let i = 0; i < smallestCompressorCombos.length; i++) {
    //             let baseCompressorCombo: Array<string> = smallestCompressorCombos[i];
    //             let totalAirflowInCombo: number = 0;
    //             let totalPowerInCombo: number = 0;
    //             baseCompressorCombo.forEach(baseCompressorId => {
    //                 let baseCompressor: CompressorInventoryItem = adjustedCompressors.find(compressor => {
    //                     return compressor.itemId == baseCompressorId;
    //                 });
    //                 totalAirflowInCombo += baseCompressor.performancePoints.fullLoad.airflow;
    //                 totalPowerInCombo += baseCompressor.performancePoints.fullLoad.power;
    //             });
    //             if ((additionalAirflow - totalAirflowInCombo) <= 0) {
    //                 //compressor meets demand. add possibility
    //                 validCompressorCombos.push({
    //                     totalPower: totalPowerInCombo,
    //                     compressorIds: baseCompressorCombo
    //                 });
    //             }
    //         }
    //         //find combo with least power used
    //         let leastPowerCombo: {
    //             totalPower: number,
    //             compressorIds: Array<string>
    //         } = _.minBy(validCompressorCombos, (cCombo) => {
    //             return cCombo.totalPower;
    //         });
    //         let baseOrder: number = 1;
    //         //update interval data ordering
    //         intervalData.forEach(interval => {
    //             if (interval.compressorId == trimCompressorId) {
    //                 interval.summaryData.order = numBaseCompressors + 1;
    //             } else {
    //                 if (leastPowerCombo.compressorIds.includes(interval.compressorId)) {
    //                     interval.summaryData.order = baseOrder;
    //                     baseOrder++;
    //                 } else {
    //                     interval.summaryData.order = 0;
    //                 }
    //             }
    //         });
    //     }
    //     return intervalData;
    // }


}