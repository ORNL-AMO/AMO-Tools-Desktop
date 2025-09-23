import { CompressedAirDayType, CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryTotal, ReduceRuntime, SystemInformation } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { AdjustProfileResults, EemSavingsResults } from "../caCalculationModels";
import { CompressedAirEemSavingsResult } from "./CompressedAirEemSavingsResult";
import { CompressorInventoryItemClass } from "../CompressorInventoryItemClass";
import { CompressedAirProfileSummary } from "../CompressedAirProfileSummary";
import { CompressedAirBaselineDayTypeProfileSummary } from "../CompressedAirBaselineDayTypeProfileSummary";
import { CompressedAirModifiedDayTypeProfileSummary } from "./CompressedAirModifiedDayTypeProfileSummary";


export class CompressedAirAdjustedProfileSummary {

    adjustedCompressors: Array<CompressorInventoryItemClass>;
    addReceiverVolumeSavings: EemSavingsResults;
    adjustCascadingSetPointsSavings: EemSavingsResults;
    improveEndUseEfficiencySavings: EemSavingsResults;
    reduceAirLeaksSavings: EemSavingsResults;
    reduceRunTimeSavings: EemSavingsResults;
    reduceSystemAirPressureSavings: EemSavingsResults;
    useAutomaticSequencerSavings: EemSavingsResults;
    flowReallocationSavings: EemSavingsResults;

    modifiedProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>;

    constructor(dayType: CompressedAirDayType,
        settings: Settings,
        baselineProfileSummaries: Array<CompressedAirBaselineDayTypeProfileSummary>,
        modifiedInventoryItems: Array<CompressorInventoryItemClass>,
        modification: Modification,
        modificationOrders: Array<number>,
        systemInformation: SystemInformation,
        numberOfSummaryIntervals: number,
        electricityCost: number) {
        this.adjustedCompressors = modifiedInventoryItems;
        this.addReceiverVolumeSavings = new CompressedAirEemSavingsResult();
        this.adjustCascadingSetPointsSavings = new CompressedAirEemSavingsResult();
        this.improveEndUseEfficiencySavings = new CompressedAirEemSavingsResult();
        this.reduceAirLeaksSavings = new CompressedAirEemSavingsResult();
        this.reduceRunTimeSavings = new CompressedAirEemSavingsResult();
        this.reduceSystemAirPressureSavings = new CompressedAirEemSavingsResult();
        this.useAutomaticSequencerSavings = new CompressedAirEemSavingsResult();
        this.flowReallocationSavings = new CompressedAirEemSavingsResult();
        this.modifiedProfileSummaries = baselineProfileSummaries.map(baselineProfileSummary => {
            return new CompressedAirModifiedDayTypeProfileSummary(baselineProfileSummary);
        });
    }

    // adjustProfile() {
    //     let flowAllocationProfileSummary: Array<ProfileSummary>;
    //     let reduceRunTimeProfileSummary: Array<ProfileSummary>;
    //     let addReceiverVolumeProfileSummary: Array<ProfileSummary>;
    //     let adjustCascadingSetPointsProfileSummary: Array<ProfileSummary>;
    //     let improveEndUseEfficiencyProfileSummary: Array<ProfileSummary>;
    //     let reduceAirLeaksProfileSummary: Array<ProfileSummary>;
    //     let reduceSystemAirPressureProfileSummary: Array<ProfileSummary>;
    //     let useAutomaticSequencerProfileSummary: Array<ProfileSummary>;
    //     let auxiliaryPowerUsage: { cost: number, energyUse: number } = { cost: 0, energyUse: 0 };
    //     //1. start with flow allocation
    //     let adjustedProfileSummary: Array<ProfileSummary>;
    //     let flowReallocationSummary: FlowReallocationSummary = this.getFlowReallocationSummary(dayType.dayTypeId);
    //     if (flowReallocationSummary) {
    //         flowReallocationSavings = flowReallocationSummary.flowReallocationSavings;
    //         flowAllocationProfileSummary = flowReallocationSummary.profileSummary;
    //         adjustedProfileSummary = JSON.parse(JSON.stringify(flowReallocationSummary.profileSummary));
    //     } else {
    //         let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, baselineProfileSummary, numberOfSummaryIntervals);
    //         adjustedProfileSummary = this.reallocateFlow(dayType, settings, baselineProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage, systemInformation);
    //         flowAllocationProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //         if (electricityCost) {
    //             flowReallocationSavings = this.calculateSavings(baselineProfileSummary, adjustedProfileSummary, dayType, electricityCost, modification.flowReallocation.implementationCost, numberOfSummaryIntervals);
    //         }
    //     }
    //     //2. iterate modification orders
    //     for (let orderIndex = 1; orderIndex <= modificationOrders.length; orderIndex++) {
    //         let adjustedProfileCopy: Array<ProfileSummary> = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //         let reduceRuntime: ReduceRuntime;
    //         if (orderIndex > modification.reduceRuntime.order) {
    //             reduceRuntime = modification.reduceRuntime;
    //         }
    //         if (modification.addPrimaryReceiverVolume.order == orderIndex) {
    //             //ADD PRIMARY RECEIVER VOLUME
    //             let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals);
    //             adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, modification.addPrimaryReceiverVolume.increasedVolume, totals, atmosphericPressure, totalAirStorage, systemInformation, reduceRuntime);
    //             addReceiverVolumeProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //             if (electricityCost) {
    //                 addReceiverVolumeSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.addPrimaryReceiverVolume.implementationCost, numberOfSummaryIntervals)
    //             }
    //         } else if (modification.adjustCascadingSetPoints.order == orderIndex) {
    //             //ADJUST CASCADING SET POINTS
    //             let compressorPriorToAdjustement: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(adjustedCompressors));
    //             //adjust compressors
    //             adjustedCompressors = this.adjustCascadingSetPointsAdjustCompressors(adjustedCompressors, modification.adjustCascadingSetPoints, atmosphericPressure, settings);
    //             //adjusted air flow based on compressor pressure changes
    //             adjustedProfileSummary = this.systemPressureChangeAdjustProfile(compressorPriorToAdjustement, settings, adjustedCompressors, adjustedProfileSummary, atmosphericPressure, dayType)
    //             let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals);
    //             adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage, systemInformation, reduceRuntime);
    //             adjustCascadingSetPointsProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //             if (electricityCost) {
    //                 adjustCascadingSetPointsSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.adjustCascadingSetPoints.implementationCost, numberOfSummaryIntervals)
    //             }

    //         } else if (modification.improveEndUseEfficiency.order == orderIndex) {
    //             //IMPROVE END USE EFFICIENCY
    //             adjustedProfileSummary = this.improveEndUseEfficiency(adjustedProfileSummary, settings, dayType, modification.improveEndUseEfficiency, adjustedCompressors, atmosphericPressure, numberOfSummaryIntervals, totalAirStorage, systemInformation, reduceRuntime);
    //             improveEndUseEfficiencyProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //             if (electricityCost) {
    //                 auxiliaryPowerUsage = this.calculateEfficiencyImprovementAuxiliaryPower(modification.improveEndUseEfficiency, electricityCost, dayType);
    //                 let implementationCost: number = 0;
    //                 modification.improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => { implementationCost = implementationCost + item.implementationCost });
    //                 improveEndUseEfficiencySavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, implementationCost, numberOfSummaryIntervals)
    //             }
    //         } else if (modification.reduceRuntime.order == orderIndex) {
    //             //REDUCE RUNTIME
    //             adjustedProfileSummary = this.reduceRuntime(adjustedProfileSummary, settings, dayType, modification.reduceRuntime, adjustedCompressors, atmosphericPressure, numberOfSummaryIntervals, totalAirStorage, systemInformation);
    //             reduceRunTimeProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //             if (electricityCost) {
    //                 reduceRunTimeSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.reduceRuntime.implementationCost, numberOfSummaryIntervals)
    //             }
    //         } else if (modification.reduceAirLeaks.order == orderIndex) {
    //             //REDUCE AIR LEAKS
    //             adjustedProfileSummary = this.reduceAirLeaks(adjustedProfileSummary, settings, dayType, modification.reduceAirLeaks, adjustedCompressors, atmosphericPressure, numberOfSummaryIntervals, totalAirStorage, systemInformation, reduceRuntime);
    //             reduceAirLeaksProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //             if (electricityCost) {
    //                 reduceAirLeaksSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.reduceAirLeaks.implementationCost, numberOfSummaryIntervals)
    //             }
    //         } else if (modification.reduceSystemAirPressure.order == orderIndex) {
    //             //REDUCE SYSTEM AIR PRESSURE
    //             let compressorPriorToAdjustement: Array<CompressorInventoryItem> = JSON.parse(JSON.stringify(adjustedCompressors));
    //             //adjust compressors
    //             adjustedCompressors = this.reduceSystemAirPressureAdjustCompressors(adjustedCompressors, modification.reduceSystemAirPressure, atmosphericPressure, settings);
    //             //adjusted air flow based on compressor reduction
    //             adjustedProfileSummary = this.systemPressureChangeAdjustProfile(compressorPriorToAdjustement, settings, adjustedCompressors, adjustedProfileSummary, atmosphericPressure)
    //             let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals);
    //             adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage, systemInformation, reduceRuntime);
    //             reduceSystemAirPressureProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //             if (electricityCost) {
    //                 reduceSystemAirPressureSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.reduceSystemAirPressure.implementationCost, numberOfSummaryIntervals)
    //             }
    //         } else if (modification.useAutomaticSequencer.order == orderIndex) {
    //             //USE AUTOMATIC SEQUENCER
    //             adjustedCompressors = this.useAutomaticSequencerAdjustCompressor(modification.useAutomaticSequencer, adjustedCompressors, modification.useAutomaticSequencer.profileSummary, dayType.dayTypeId, atmosphericPressure, settings);
    //             let totals: Array<ProfileSummaryTotal> = this.calculateProfileSummaryTotals(adjustedCompressors, dayType, adjustedProfileSummary, numberOfSummaryIntervals, undefined);
    //             adjustedProfileSummary = this.useAutomaticSequencerMapOrders(modification.useAutomaticSequencer.profileSummary, adjustedProfileSummary);
    //             adjustedProfileSummary = this.reallocateFlow(dayType, settings, adjustedProfileSummary, adjustedCompressors, 0, totals, atmosphericPressure, totalAirStorage, systemInformation, reduceRuntime);
    //             useAutomaticSequencerProfileSummary = JSON.parse(JSON.stringify(adjustedProfileSummary));
    //             if (electricityCost) {
    //                 useAutomaticSequencerSavings = this.calculateSavings(adjustedProfileCopy, adjustedProfileSummary, dayType, electricityCost, modification.useAutomaticSequencer.implementationCost, numberOfSummaryIntervals);
    //             }
    //         }
    //     }
    // }

    reallocateFlow(dayType: CompressedAirDayType, settings: Settings, profileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItem>, additionalReceiverVolume: number, totals: Array<ProfileSummaryTotal>, atmosphericPressure: number, totalAirStorage: number, systemInformation: SystemInformation, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
        // let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
        let adjustedProfileSummary: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
        totals.forEach(total => {
            adjustedProfileSummary = this.adjustProfile(total.airflow, settings, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, additionalReceiverVolume, atmosphericPressure, totalAirStorage, systemInformation, reduceRuntime);
        });
        return adjustedProfileSummary;
    }

    // reallocateFlow(dayType: CompressedAirDayType, settings: Settings, profileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItem>, additionalReceiverVolume: number, totals: Array<ProfileSummaryTotal>, atmosphericPressure: number, totalAirStorage: number, systemInformation: SystemInformation, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
    //     // let adjustedProfileSummary: Array<ProfileSummary> = JSON.parse(JSON.stringify(profileSummary));
    //     let adjustedProfileSummary: Array<ProfileSummary> = profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
    //     totals.forEach(total => {
    //         adjustedProfileSummary = this.adjustProfile(total.airflow, settings, total.timeInterval, adjustedCompressors, adjustedProfileSummary, dayType, additionalReceiverVolume, atmosphericPressure, totalAirStorage, systemInformation, reduceRuntime);
    //     });
    //     return adjustedProfileSummary;
    // }

    adjustProfile(neededAirFlow: number, settings: Settings, timeInterval: number, adjustedCompressors: Array<CompressorInventoryItem>, adjustedProfileSummary: Array<ProfileSummary>, dayType: CompressedAirDayType, additionalRecieverVolume: number, atmosphericPressure: number, totalAirStorage: number, systemInformation: SystemInformation, reduceRuntime?: ReduceRuntime): Array<ProfileSummary> {
        let intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }> = new Array();
        adjustedProfileSummary.forEach(summary => {
            if (summary.dayTypeId == dayType.dayTypeId) {
                intervalData.push({
                    compressorId: summary.compressorId,
                    summaryData: summary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == timeInterval })
                });
            }
        });

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
        return adjustedProfileSummary;
    }

    // getAdjustedProfile(): AdjustProfileResults {
    //     return {
    //         adjustedCompressors: this.adjustedCompressors.map(compressor => { return compressor.toModel() }),
    //         adjustedProfileSummary: this.adjustedProfileSummary,
    //         addReceiverVolumeSavings: this.addReceiverVolumeSavings,
    //         adjustCascadingSetPointsSavings: this.adjustCascadingSetPointsSavings,
    //         improveEndUseEfficiencySavings: this.improveEndUseEfficiencySavings,
    //         reduceAirLeaksSavings: this.reduceAirLeaksSavings,
    //         reduceRunTimeSavings: this.reduceRunTimeSavings,
    //         reduceSystemAirPressureSavings: this.reduceSystemAirPressureSavings,
    //         useAutomaticSequencerSavings: this.useAutomaticSequencerSavings,
    //         flowReallocationSavings: this.flowReallocationSavings,
    //         flowAllocationProfileSummary: this.flowAllocationProfileSummary,
    //         reduceRunTimeProfileSummary: this.reduceRunTimeProfileSummary,
    //         addReceiverVolumeProfileSummary: this.addReceiverVolumeProfileSummary,
    //         adjustCascadingSetPointsProfileSummary: this.adjustCascadingSetPointsProfileSummary,
    //         improveEndUseEfficiencyProfileSummary: this.improveEndUseEfficiencyProfileSummary,
    //         reduceAirLeaksProfileSummary: this.reduceAirLeaksProfileSummary,
    //         reduceSystemAirPressureProfileSummary: this.reduceSystemAirPressureProfileSummary,
    //         useAutomaticSequencerProfileSummary: this.useAutomaticSequencerProfileSummary,
    //         auxiliaryPowerUsage: this.auxiliaryPowerUsage
    //     };

    // }
}