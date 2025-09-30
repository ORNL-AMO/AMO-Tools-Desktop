import { CompressedAirDayType, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntime, ReduceRuntimeData, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { getTotalCapacity, getTotalPower } from "../../caCalculationHelpers";
import * as _ from 'lodash';
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirCalculationService, CompressorCalcResult } from "../../../compressed-air-calculation.service";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";

export class FlowReallocationResults {

    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    order: number
    constructor(dayType: CompressedAirDayType,
        settings: Settings,
        previousProfileSummary: Array<CompressedAirProfileSummary>,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        additionalReceiverVolume: number,
        totals: Array<ProfileSummaryTotal>,
        atmosphericPressure: number,
        totalAirStorage: number,
        systemInformation: SystemInformation,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService,
        costKwh: number,
        implementationCost: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },
        order: number) {
        this.order = order;
        this.reallocateFlow(dayType,
            settings,
            previousProfileSummary,
            adjustedCompressors,
            additionalReceiverVolume,
            totals,
            atmosphericPressure,
            totalAirStorage,
            systemInformation,
            reduceRuntime,
            _compressedAirCalculationService);
        this.savings = new CompressedAirEemSavingsResult(previousProfileSummary, this.profileSummary, dayType, costKwh, implementationCost, summaryDataInterval, auxiliaryPowerUsage);
    }

    reallocateFlow(dayType: CompressedAirDayType,
        settings: Settings,
        previousProfileSummary: Array<CompressedAirProfileSummary>,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        additionalReceiverVolume: number,
        totals: Array<ProfileSummaryTotal>,
        atmosphericPressure: number,
        totalAirStorage: number,
        systemInformation: SystemInformation,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService) {

        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });
        //TODO: Don't think this is necessary..
        this.profileSummary = this.profileSummary.filter(summary => { return summary.dayTypeId == dayType.dayTypeId });
        totals.forEach(total => {
            this.adjustProfile(total.airflow,
                settings,
                total.timeInterval,
                adjustedCompressors,
                dayType,
                additionalReceiverVolume,
                atmosphericPressure,
                totalAirStorage,
                systemInformation,
                reduceRuntime,
                _compressedAirCalculationService);
        });
    }

    adjustProfile(neededAirFlow: number,
        settings: Settings,
        timeInterval: number,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        dayType: CompressedAirDayType,
        additionalRecieverVolume: number,
        atmosphericPressure: number,
        totalAirStorage: number,
        systemInformation: SystemInformation,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService) {

        let intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }> = new Array();
        this.profileSummary.forEach(summary => {
            if (summary.dayTypeId == dayType.dayTypeId) {
                intervalData.push({
                    compressorId: summary.compressorId,
                    summaryData: summary.profileSummaryData.find(summaryData => { return summaryData.timeInterval == timeInterval })
                });
            }
        });
        if (systemInformation.multiCompressorSystemControls == 'loadSharing') {
            this.shareLoad(intervalData, adjustedCompressors, neededAirFlow, settings, additionalRecieverVolume, atmosphericPressure, totalAirStorage, reduceRuntime, dayType, _compressedAirCalculationService);
            return;
        } else if (systemInformation.multiCompressorSystemControls == 'baseTrim') {
            //set base trim ordering
            let trimSelection: { dayTypeId: string, compressorId: string } = systemInformation.trimSelections.find(selection => { return selection.dayTypeId == dayType.dayTypeId });
            if (trimSelection.compressorId) {
                intervalData = this.setBaseTrimOrdering(intervalData, adjustedCompressors, neededAirFlow, trimSelection.compressorId, dayType, reduceRuntime);
            }
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
                let compressor: CompressorInventoryItemClass = adjustedCompressors.find(item => { return item.findItem(data.compressorId)});
                if (reduceRuntime) {
                    compressor.compressorControls.automaticShutdown = reduceRuntimeShutdownTimer;
                }
                let fullLoadAirFlow: number = compressor.performancePoints.fullLoad.airflow;
                if (Math.abs(neededAirFlow) < 0.01) {
                    fullLoadAirFlow = 0;
                }
                //calc with full load
                let calculateFullLoad: CompressorCalcResult = _compressedAirCalculationService.compressorsCalc(compressor, settings, 3, fullLoadAirFlow, atmosphericPressure, totalAirStorage, additionalRecieverVolume, true, undefined);
                let tmpNeededAirFlow: number = neededAirFlow - calculateFullLoad.capacityCalculated;
                //if excess air added then reduce amount and calc again
                if (tmpNeededAirFlow < 0 && (fullLoadAirFlow + tmpNeededAirFlow) > 0) {
                    calculateFullLoad = _compressedAirCalculationService.compressorsCalc(compressor, settings, 3, fullLoadAirFlow + tmpNeededAirFlow, atmosphericPressure, totalAirStorage, additionalRecieverVolume, true);
                    tmpNeededAirFlow = neededAirFlow - calculateFullLoad.capacityCalculated;
                }
                neededAirFlow = tmpNeededAirFlow;
                let adjustedIndex: number = this.profileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
                let adjustedSummaryIndex: number = this.profileSummary[adjustedIndex].profileSummaryData.findIndex(summaryData => { return summaryData.order == data.summaryData.order && summaryData.timeInterval == data.summaryData.timeInterval });

                this.profileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
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
                let adjustedIndex: number = this.profileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
                let adjustedSummaryIndex: number = this.profileSummary[adjustedIndex].profileSummaryData.findIndex(summaryData => { return summaryData.order == data.summaryData.order && summaryData.timeInterval == data.summaryData.timeInterval });
                this.profileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
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


    setBaseTrimOrdering(intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }>, adjustedCompressors: Array<CompressorInventoryItemClass>, neededAirFlow: number, trimCompressorId: string, dayType: CompressedAirDayType, reduceRuntime?: ReduceRuntime): Array<{ compressorId: string, summaryData: ProfileSummaryData }> {
        let trimCompressor: CompressorInventoryItemClass = adjustedCompressors.find(compressor => { return compressor.findItem(trimCompressorId) });
        let additionalAirflow: number = neededAirFlow - trimCompressor.performancePoints.fullLoad.airflow;
        if (additionalAirflow <= 0) {
            //just need trim compressor
            intervalData.forEach(interval => {
                if (interval.compressorId == trimCompressorId) {
                    interval.summaryData.order = 1;
                } else {
                    interval.summaryData.order = 0;
                }
            });
            return intervalData;
        }
        //check base compressors to turn on
        let baseCompressors: Array<string> = new Array();
        let order: number = 1;
        intervalData.forEach(iDataItem => {
            if (reduceRuntime) {
                let reduceRuntimeData: ReduceRuntimeData = reduceRuntime.runtimeData.find(dataItem => {
                    return dataItem.compressorId == iDataItem.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
                });
                let reduceRuntimeDataItem: { isCompressorOn: boolean, timeInterval: number } = reduceRuntimeData.intervalData.find(iData => { return iData.timeInterval == iDataItem.summaryData.timeInterval });
                if (!reduceRuntimeDataItem.isCompressorOn) {
                    iDataItem.summaryData.order = 0;
                } else if (reduceRuntimeDataItem.isCompressorOn && iDataItem.summaryData.order == 0) {
                    iDataItem.summaryData.order = order++;
                } else if (iDataItem.summaryData.order != 0) {
                    order++;
                }

            }
            if (iDataItem.compressorId != trimCompressorId && iDataItem.summaryData.order != 0) {
                baseCompressors.push(iDataItem.compressorId);
            }
        })
        let combinations: Array<Array<string>> = this.getCombinations(baseCompressors);
        let numBaseCompressors: number;
        let foundValidCombo: boolean = false;
        //find least amount of compressors usable
        for (let i = 0; i < combinations.length; i++) {
            let baseCompressorCombo: Array<string> = combinations[i];
            numBaseCompressors = baseCompressorCombo.length;
            let totalAirflowInCombo: number = 0;
            baseCompressorCombo.forEach(baseCompressorId => {
                let baseCompressor: CompressorInventoryItemClass = adjustedCompressors.find(compressor => {
                    return compressor.findItem(baseCompressorId);
                });
                totalAirflowInCombo += baseCompressor.performancePoints.fullLoad.airflow;
            });
            if ((additionalAirflow - totalAirflowInCombo) <= 0) {
                //break for loop. found least number of compressors
                foundValidCombo = true;
                i = combinations.length;
            }
        }
        if (foundValidCombo) {
            //filter combos that meet smallest number of compressors on
            let smallestCompressorCombos: Array<Array<string>> = combinations.filter(combo => { return combo.length == numBaseCompressors });
            let validCompressorCombos: Array<{
                totalPower: number,
                compressorIds: Array<string>
            }> = new Array();
            //get power of smallest compressors combos to select ideal compressor combination
            for (let i = 0; i < smallestCompressorCombos.length; i++) {
                let baseCompressorCombo: Array<string> = smallestCompressorCombos[i];
                let totalAirflowInCombo: number = 0;
                let totalPowerInCombo: number = 0;
                baseCompressorCombo.forEach(baseCompressorId => {
                    let baseCompressor: CompressorInventoryItemClass = adjustedCompressors.find(compressor => {
                        return compressor.findItem(baseCompressorId);
                    });
                    totalAirflowInCombo += baseCompressor.performancePoints.fullLoad.airflow;
                    totalPowerInCombo += baseCompressor.performancePoints.fullLoad.power;
                });
                if ((additionalAirflow - totalAirflowInCombo) <= 0) {
                    //compressor meets demand. add possibility
                    validCompressorCombos.push({
                        totalPower: totalPowerInCombo,
                        compressorIds: baseCompressorCombo
                    });
                }
            }
            //find combo with least power used
            let leastPowerCombo: {
                totalPower: number,
                compressorIds: Array<string>
            } = _.minBy(validCompressorCombos, (cCombo) => {
                return cCombo.totalPower;
            });
            let baseOrder: number = 1;
            //update interval data ordering
            intervalData.forEach(interval => {
                if (interval.compressorId == trimCompressorId) {
                    interval.summaryData.order = numBaseCompressors + 1;
                } else {
                    if (leastPowerCombo.compressorIds.includes(interval.compressorId)) {
                        interval.summaryData.order = baseOrder;
                        baseOrder++;
                    } else {
                        interval.summaryData.order = 0;
                    }
                }
            });
        }
        return intervalData;
    }


    shareLoad(intervalData: Array<{ compressorId: string, summaryData: ProfileSummaryData }>,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        neededAirFlow: number, settings: Settings,
        additionalRecieverVolume: number,
        atmosphericPressure: number,
        totalAirStorage: number,
        reduceRuntime: ReduceRuntime,
        dayType: CompressedAirDayType,
        _compressedAirCalculationService: CompressedAirCalculationService) {
        let compressorIds: Array<string> = new Array();
        let order: number = 1;
        intervalData.forEach(iDataItem => {
            if (reduceRuntime) {
                let reduceRuntimeData: ReduceRuntimeData = reduceRuntime.runtimeData.find(dataItem => {
                    return dataItem.compressorId == iDataItem.compressorId && dataItem.dayTypeId == dayType.dayTypeId;
                });
                let reduceRuntimeDataItem: { isCompressorOn: boolean, timeInterval: number } = reduceRuntimeData.intervalData.find(iData => { return iData.timeInterval == iDataItem.summaryData.timeInterval });
                if (!reduceRuntimeDataItem.isCompressorOn) {
                    iDataItem.summaryData.order = 0;
                } else if (reduceRuntimeDataItem.isCompressorOn && iDataItem.summaryData.order == 0) {
                    iDataItem.summaryData.order = order;
                    order++;
                }

            }
            if (iDataItem.summaryData.order != 0) {
                compressorIds.push(iDataItem.compressorId);
            }
        })

        let compressorCombinations: Array<Array<string>> = this.getCombinations(compressorIds);
        let validCombinations: Array<{
            load: number,
            operatingCompressors: Array<{
                compressorId: string,
                airflow: number,
                power: number,
                compressorResult: CompressorCalcResult
            }>
        }> = new Array();
        for (let compressorIds of compressorCombinations) {
            let compressorsInCombo: Array<CompressorInventoryItemClass> = compressorIds.map(cId => {
                return adjustedCompressors.find(adjustedCompressor => { return adjustedCompressor.findItem(cId) });
            });
            let totalRatedAirflow: number = 0;
            compressorsInCombo.forEach(compressor => {
                totalRatedAirflow += compressor.performancePoints.fullLoad.airflow;
            });
            let load = (neededAirFlow / totalRatedAirflow);
            if (load <= 1) {
                validCombinations.push({
                    load: load,
                    operatingCompressors: compressorsInCombo.map(compressor => {
                        let airflow: number = load * compressor.performancePoints.fullLoad.airflow;
                        let resultsAtLoad: CompressorCalcResult = _compressedAirCalculationService.compressorsCalc(compressor, settings, 3, airflow, atmosphericPressure, totalAirStorage, additionalRecieverVolume, true);
                        return {
                            compressorId: compressor.itemId,
                            airflow: resultsAtLoad.capacityCalculated,
                            power: resultsAtLoad.powerCalculated,
                            compressorResult: resultsAtLoad
                        }
                    })
                })
            }
        }

        let selectedOperatingCombonation: Array<{
            compressorId: string,
            airflow: number,
            power: number,
            compressorResult: CompressorCalcResult
        }> = [];
        let totalFullLoadCapacity: number = getTotalCapacity(adjustedCompressors);
        let totalFullLoadPower: number = getTotalPower(adjustedCompressors);
        let minPower: number = Infinity;
        for (let validCombination of validCombinations) {
            let totalCombinationPower: number = _.sumBy(validCombination.operatingCompressors, (compressor) => {
                return compressor.power
            });
            if (totalCombinationPower < minPower) {
                selectedOperatingCombonation = validCombination.operatingCompressors;
                minPower = totalCombinationPower;
            }
        }

        let orderCount: number = 1;
        intervalData.forEach(data => {
            let selectedCompressorAtLoad: {
                compressorId: string,
                airflow: number,
                power: number,
                compressorResult: CompressorCalcResult
            } = selectedOperatingCombonation.find(item => { return item.compressorId == data.compressorId });
            let adjustedIndex: number = this.profileSummary.findIndex(summary => { return summary.compressorId == data.compressorId && summary.dayTypeId == dayType.dayTypeId });
            let adjustedSummaryIndex: number = this.profileSummary[adjustedIndex].profileSummaryData.findIndex(summaryData => { return summaryData.order == data.summaryData.order && summaryData.timeInterval == data.summaryData.timeInterval });
            if (selectedCompressorAtLoad) {
                this.profileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
                    power: selectedCompressorAtLoad.compressorResult.powerCalculated,
                    airflow: selectedCompressorAtLoad.compressorResult.capacityCalculated,
                    percentCapacity: selectedCompressorAtLoad.compressorResult.percentageCapacity,
                    timeInterval: data.summaryData.timeInterval,
                    percentPower: selectedCompressorAtLoad.compressorResult.percentagePower,
                    percentSystemCapacity: (selectedCompressorAtLoad.compressorResult.capacityCalculated / totalFullLoadCapacity) * 100,
                    percentSystemPower: (selectedCompressorAtLoad.compressorResult.powerCalculated / totalFullLoadPower) * 100,
                    order: orderCount,
                };
                orderCount++;
            } else {
                this.profileSummary[adjustedIndex].profileSummaryData[adjustedSummaryIndex] = {
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


    getCombinations(combinations: Array<string>): Array<Array<string>> {
        let results: Array<Array<string>> = this.combos([], combinations, []);
        return _.orderBy(results, (combo) => { return combo.length });;
    }

    combos(start: Array<string>, rest: Array<string>, results: Array<Array<string>>): Array<Array<string>> {
        let startCopy: Array<string> = start.map(item => { return item });
        let restCopy: Array<string> = rest.map(item => { return item });
        if (rest.length > 0) {
            for (let i = 0; i < rest.length; i++) {
                let item: Array<string> = startCopy.concat(rest[i]);
                results.push(item);
                let restNext: Array<string> = new Array();
                for (let x = i + 1; x < restCopy.length; x++) {
                    restNext.push(restCopy[x]);
                }
                this.combos(item.map(d => { return d }), restNext, results);
            }
        }
        return results;
    }
}