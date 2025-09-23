import { CompressedAirDayType, SystemInformation } from "../../../shared/models/compressed-air-assessment";
import { CompressedAirBaselineDayTypeProfileSummary } from "../CompressedAirBaselineDayTypeProfileSummary";
import { CompressedAirProfileSummary } from "../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../CompressorInventoryItemClass";

export class CompressedAirModifiedDayTypeProfileSummary {

    profileSummary: Array<CompressedAirProfileSummary>
    dayType: CompressedAirDayType;
    totalFullLoadCapacity: number;
    totalFullLoadPower: number;
    constructor(compressedAirBaselineDayTypeProfileSummary: CompressedAirBaselineDayTypeProfileSummary) {
        this.profileSummary = compressedAirBaselineDayTypeProfileSummary.profileSummary.map(summary => { return summary });
        this.dayType = compressedAirBaselineDayTypeProfileSummary.dayType;
        this.totalFullLoadCapacity = compressedAirBaselineDayTypeProfileSummary.totalFullLoadCapacity;
        this.totalFullLoadPower = compressedAirBaselineDayTypeProfileSummary.totalFullLoadPower;
    }

    adjustProfile(systemInformation: SystemInformation) {
        if (systemInformation.multiCompressorSystemControls == 'baseTrim') {
            //set base trim ordering
            let trimSelection: { dayTypeId: string, compressorId: string } = systemInformation.trimSelections.find(selection => { return selection.dayTypeId == dayType.dayTypeId });
            if (trimSelection.compressorId) {
                intervalData = this.setBaseTrimOrdering(intervalData, adjustedCompressors, neededAirFlow, trimSelection.compressorId, dayType, reduceRuntime);
            }
        } else if (systemInformation.multiCompressorSystemControls == 'loadSharing') {
            //share load..
            return this.shareLoad(intervalData, adjustedProfileSummary, adjustedCompressors, neededAirFlow, settings, additionalRecieverVolume, atmosphericPressure, totalAirStorage, reduceRuntime, dayType);
        }
        //calc totals for system percentages
        let totalFullLoadCapacity: number = getTotalCapacity(adjustedCompressors);
        let totalFullLoadPower: number = getTotalPower(adjustedCompressors);
        let reduceRuntimeShutdownTimer: boolean;
        intervalData = _.orderBy(intervalData, (data) => { return data.summaryData.order });
        let orderCount: number = 1;
        intervalData.forEach(data => {
            let isTurnedOn: boolean = data.summaryData.order != 0;
            if (reduceRuntime && systemInformation.multiCompressorSystemControls != 'baseTrim') {
                let reduceRuntimeData: ReduceRuntimeData = reduceRuntime.runtimeData.find(dataItem => {
                    return dataItem.compressorId == data.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
                });
                let intervalData: { isCompressorOn: boolean, timeInterval: number } = reduceRuntimeData.intervalData.find(iData => { return iData.timeInterval == data.summaryData.timeInterval });
                isTurnedOn = intervalData.isCompressorOn;
                if (!isTurnedOn) {
                    data.summaryData.order = 0;
                } else if (isTurnedOn && data.summaryData.order == 0) {
                    data.summaryData.order = orderCount;
                }
                reduceRuntimeShutdownTimer = reduceRuntimeData.automaticShutdownTimer;
            }
            if (data.summaryData.order != 0 && isTurnedOn) {
                let compressor: CompressorInventoryItem = adjustedCompressors.find(item => { return item.itemId == data.compressorId });
                if (reduceRuntime) {
                    compressor.compressorControls.automaticShutdown = reduceRuntimeShutdownTimer;
                }
                let fullLoadAirFlow: number = compressor.performancePoints.fullLoad.airflow;
                if (Math.abs(neededAirFlow) < 0.01) {
                    fullLoadAirFlow = 0;
                }
                //calc with full load
                let calculateFullLoad: CompressorCalcResult = this.compressedAirCalculationService.compressorsCalc(compressor, settings, 3, fullLoadAirFlow, atmosphericPressure, totalAirStorage, additionalRecieverVolume, true, undefined);
                let tmpNeededAirFlow: number = neededAirFlow - calculateFullLoad.capacityCalculated;
                //if excess air added then reduce amount and calc again
                if (tmpNeededAirFlow < 0 && (fullLoadAirFlow + tmpNeededAirFlow) > 0) {
                    calculateFullLoad = this.compressedAirCalculationService.compressorsCalc(compressor, settings, 3, fullLoadAirFlow + tmpNeededAirFlow, atmosphericPressure, totalAirStorage, additionalRecieverVolume, true);
                    tmpNeededAirFlow = neededAirFlow - calculateFullLoad.capacityCalculated;
                }
                neededAirFlow = tmpNeededAirFlow;
                let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
                let adjustedSummaryIndex: number = adjustedProfileSummary[adjustedIndex].profileSummaryData.findIndex(summaryData => { return summaryData.order == data.summaryData.order && summaryData.timeInterval == data.summaryData.timeInterval });
                adjustedProfileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
                    power: calculateFullLoad.powerCalculated,
                    airflow: calculateFullLoad.capacityCalculated,
                    percentCapacity: calculateFullLoad.percentageCapacity,
                    timeInterval: data.summaryData.timeInterval,
                    percentPower: calculateFullLoad.percentagePower,
                    percentSystemCapacity: (calculateFullLoad.capacityCalculated / totalFullLoadCapacity) * 100,
                    percentSystemPower: (calculateFullLoad.powerCalculated / totalFullLoadPower) * 100,
                    order: orderCount,
                };
                orderCount++;
            } else {
                let adjustedIndex: number = adjustedProfileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
                let adjustedSummaryIndex: number = adjustedProfileSummary[adjustedIndex].profileSummaryData.findIndex(summaryData => { return summaryData.order == data.summaryData.order && summaryData.timeInterval == data.summaryData.timeInterval });
                adjustedProfileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
                    power: 0,
                    airflow: 0,
                    percentCapacity: 0,
                    timeInterval: data.summaryData.timeInterval,
                    percentPower: 0,
                    percentSystemCapacity: 0,
                    percentSystemPower: 0,
                    order: 0,
                };
            }
        });
    }
}