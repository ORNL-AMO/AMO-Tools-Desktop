import { CompressorInventoryItem, ProfileSummary, ProfileSummaryData } from "../../shared/models/compressed-air-assessment";
import { EemSavingsResults } from "./caCalculationModels";
import * as _ from 'lodash';

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


export function getTotalCapacity(inventoryItems: Array<CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
        return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
}

export function getTotalPower(inventoryItems: Array<CompressorInventoryItem>): number {
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