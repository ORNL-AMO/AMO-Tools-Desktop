import { CompressedAirDayType, CompressorInventoryItem, EndUseEfficiencyReductionData, ImproveEndUseEfficiency, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal } from "../../shared/models/compressed-air-assessment";
import { EemSavingsResults } from "./caCalculationModels";
import * as _ from 'lodash';
import { CompressorInventoryItemClass } from "./CompressorInventoryItemClass";
import { CompressedAirProfileSummary } from "./CompressedAirProfileSummary";

export function getEmptyEemSavings(): EemSavingsResults {
    return {
        baselineResults: {
            cost: 0,
            power: 0,
        },
        adjustedResults: {
            cost: 0,
            power: 0,
        },
        savings: {
            cost: 0,
            power: 0,
            percentSavings: 0,
        },
        implementationCost: 0,
        paybackPeriod: 0,
        dayTypeId: undefined,
    };
}


export function getTotalCapacity(inventoryItems: Array<CompressorInventoryItemClass | CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
        return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
}

export function getTotalPower(inventoryItems: Array<CompressorInventoryItemClass | CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
        return inventoryItem.performancePoints.fullLoad.power;
    });
}


export function getProfileSummaryDataAverages(profileSummary: Array<ProfileSummary>): Array<ProfileSummary> {
    let updatedSum: Array<ProfileSummary> = new Array<ProfileSummary>();
    profileSummary.forEach(sums => {
        let updatedData: ProfileSummary = sums;
        updatedData.avgPower = getAvgPower(sums.profileSummaryData);
        updatedData.avgAirflow = getAvgAirflow(sums.profileSummaryData);
        updatedData.avgPrecentPower = getAvgPercentPower(sums.profileSummaryData);
        updatedData.avgPercentCapacity = getAvgPercentCapacity(sums.profileSummaryData);
        updatedSum.push(updatedData);
    });
    return updatedSum;
}

export function getAvgPower(profileSummaryData: Array<ProfileSummaryData>): number {
    let powerData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
        powerData.push(data.power);
    });
    let avgPower: number = _.mean(powerData);
    return avgPower;
}

export function getAvgAirflow(profileSummaryData: Array<ProfileSummaryData>): number {
    let airflowData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
        airflowData.push(data.airflow);
    });
    let avgAirflow: number = _.mean(airflowData);
    return avgAirflow;
}

export function getAvgPercentPower(profileSummaryData: Array<ProfileSummaryData>): number {
    let percentPowerData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
        if (data.percentPower != 0) {
            percentPowerData.push(data.percentPower);
        }
    });
    let avgPercentPower: number = _.mean(percentPowerData);
    return avgPercentPower;
}

export function getAvgPercentCapacity(profileSummaryData: Array<ProfileSummaryData>): number {
    let percentCapacityData: Array<number> = new Array<number>();
    profileSummaryData.forEach(data => {
        if (data.percentCapacity != 0) {
            percentCapacityData.push(data.percentCapacity);
        }
    });
    let avgPercentCapacity: number = _.mean(percentCapacityData);
    return avgPercentCapacity;
}

export function getProfileSummaryTotals(selectedHourInterval: number,
    profileSummary: Array<CompressedAirProfileSummary>,
    isBaseline: boolean,
    selectedDayType: CompressedAirDayType,
    improveEndUseEfficiency: ImproveEndUseEfficiency,
    inventoryItems: Array<CompressorInventoryItemClass>): Array<ProfileSummaryTotal> {
    let totalSystemCapacity: number = getTotalCapacity(inventoryItems);
    let totalFullLoadPower: number = getTotalPower(inventoryItems);
    //already baseline summary by day type
    //let allData: Array<ProfileSummaryData> = new Array();
    // this.profileSummary.forEach(summary => {
    //   if (summary.dayTypeId == selectedDayType.dayTypeId) {
    //     allData = allData.concat(summary.profileSummaryData);
    //   }
    // });
    let allData: Array<ProfileSummaryData> = profileSummary.flatMap(summary => {
        return summary.profileSummaryData;
    });
    let profileSummaryTotals: Array<ProfileSummaryTotal> = new Array();
    for (let interval = 0; interval < 24;) {
        let totalAirFlow: number = 0;
        let compressorPower: number = 0;
        allData.forEach(dataItem => {
            if (dataItem.timeInterval == interval && dataItem.order != 0) {
                if (isNaN(dataItem.airflow) == false) {
                    totalAirFlow += dataItem.airflow;
                }
                if (isNaN(dataItem.power) == false) {
                    compressorPower += dataItem.power;
                }
            }
        });
        //no aux power for baseline
        let auxiliaryPower: number = 0;
        // Get auxiliary power if not baseline
        if (!isBaseline) {
            auxiliaryPower = getTotalAuxiliaryPower(selectedDayType, interval, improveEndUseEfficiency);
        }

        profileSummaryTotals.push({
            auxiliaryPower: auxiliaryPower,
            airflow: totalAirFlow,
            power: compressorPower,
            totalPower: compressorPower,
            percentCapacity: (totalAirFlow / totalSystemCapacity) * 100,
            percentPower: (compressorPower / totalFullLoadPower) * 100,
            timeInterval: interval
        });
        interval = interval + selectedHourInterval;
    }
    return profileSummaryTotals;
}

export function getTotalAuxiliaryPower(selectedDayType: CompressedAirDayType, interval: number, improveEndUseEfficiency?: ImproveEndUseEfficiency): number {
    if (!improveEndUseEfficiency || improveEndUseEfficiency.order == 100) {
        return 0;
    } else {
        let auxiliaryPower: number = 0;
        improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
            if (item.substituteAuxiliaryEquipment) {
                let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(data => {
                    return data.dayTypeId == selectedDayType.dayTypeId;
                });
                let data: { hourInterval: number, applyReduction: boolean, reductionAmount: number } = reductionData.data.find(d => { return d.hourInterval == interval });
                if (item.reductionType == 'Fixed' && data.applyReduction) {
                    auxiliaryPower += item.equipmentDemand;
                } else if (item.reductionType == 'Variable' && data.reductionAmount) {
                    auxiliaryPower += item.equipmentDemand;
                }
            }
        });
        return auxiliaryPower;
    }
}