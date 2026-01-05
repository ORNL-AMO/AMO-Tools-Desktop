import { CompressedAirDayType, CompressorInventoryItem, EndUseEfficiencyReductionData, ImproveEndUseEfficiency, PerformancePoint, PerformancePoints, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, SystemProfileSetup } from "../../shared/models/compressed-air-assessment";
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
    let totalCapacity = _.sumBy(inventoryItems, (inventoryItem: CompressorInventoryItemClass | CompressorInventoryItem) => {
        return inventoryItem.nameplateData.fullLoadRatedCapacity;
    });
    return totalCapacity;
}

export function getTotalPower(inventoryItems: Array<CompressorInventoryItemClass | CompressorInventoryItem>): number {
    return _.sumBy(inventoryItems, (inventoryItem) => {
        return inventoryItem.performancePoints.fullLoad.power;
    });
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


export function compareOpratingPoints(originalCompressors: Array<CompressorInventoryItemClass>, adjustedCompressors: Array<CompressorInventoryItemClass>) {
    adjustedCompressors.forEach((adjustedCompressor, index) => {
        let ogCompressor: CompressorInventoryItemClass = originalCompressors.find(compressor => { return compressor.findItem(adjustedCompressor.itemId) });
        let ogOperatingPoints = ogCompressor.performancePoints;
        let adjustedOperatingPoints = adjustedCompressor.performancePoints;
        comparePoint(ogOperatingPoints.fullLoad, adjustedOperatingPoints.fullLoad, adjustedCompressor.name + ' Full Load');
        comparePoint(ogOperatingPoints.maxFullFlow, adjustedOperatingPoints.maxFullFlow, adjustedCompressor.name + ' Max Full Flow');
        if (ogOperatingPoints.midTurndown && adjustedOperatingPoints.midTurndown) {
            comparePoint(ogOperatingPoints.midTurndown, adjustedOperatingPoints.midTurndown, adjustedCompressor.name + ' Mid Turndown');
        }
        if (ogOperatingPoints.turndown && adjustedOperatingPoints.turndown) {
            comparePoint(ogOperatingPoints.turndown, adjustedOperatingPoints.turndown, adjustedCompressor.name + ' Turndown');
        }
        comparePoint(ogOperatingPoints.unloadPoint, adjustedOperatingPoints.unloadPoint, adjustedCompressor.name + ' Unload Point');
        comparePoint(ogOperatingPoints.noLoad, adjustedOperatingPoints.noLoad, adjustedCompressor.name + ' No Load');
        comparePoint(ogOperatingPoints.blowoff, adjustedOperatingPoints.blowoff, adjustedCompressor.name + ' Blowoff');
    });
}

export function comparePoint(ogPoints: PerformancePoint, adjustedPoints: PerformancePoint, label: string) {
    let dischargePressure = ogPoints.dischargePressure != adjustedPoints.dischargePressure;
    if (dischargePressure) {
        console.log(`${label} - discharge pressure changed`);
    }
    let airflow = ogPoints.airflow != adjustedPoints.airflow;
    if (airflow) {
        console.log(`${label} - airflow changed`);
    }
    let power = ogPoints.power != adjustedPoints.power;
    if (power) {
        console.log(`${label} - power changed`);
    }
}


export function getCompressorPressureMinMax(controlType: number, performancePoints: PerformancePoints): { min: number, max: number } {
    let min: number = performancePoints.fullLoad.dischargePressure || 0;
    let max: number = 0;

    if (controlType == 2 || controlType == 3 || controlType == 8 || controlType == 10) {
        max = performancePoints.unloadPoint.dischargePressure;
    } else if (controlType == 1) {
        max = performancePoints.noLoad.dischargePressure;
    } else if (controlType == 6 || controlType == 4 || controlType == 5) {
        max = performancePoints.maxFullFlow.dischargePressure;
    } else if (controlType == 7 || controlType == 9) {
        max = performancePoints.blowoff.dischargePressure;
    } else if (controlType == 11) {
        max = performancePoints.turndown.dischargePressure;
    }
    return { min: min, max: max };
}

export function getPressureMinMax(inventoryItems: Array<CompressorInventoryItem>): { min: number, max: number } {
    let min: number;
    let max: number;
    inventoryItems.forEach(compressor => {
        let minMax: { min: number, max: number } = getCompressorPressureMinMax(compressor.compressorControls.controlType, compressor.performancePoints);
        if (min == undefined || minMax.min < min) {
            min = minMax.min;
        }
        if (max == undefined || minMax.max > max) {
            max = minMax.max;
        }
    });
    return {
        min: min,
        max: max
    }
}


export function getEmptyProfileSummaryData(systemProfileSetup: SystemProfileSetup, isOn?: boolean): Array<ProfileSummaryData> {
    let summaryData: Array<ProfileSummaryData> = new Array();
    for (let i = 0; i < systemProfileSetup.numberOfHours;) {
        summaryData.push({
            power: 0,
            airflow: 0,
            percentCapacity: 0,
            timeInterval: i,
            percentPower: undefined,
            percentSystemCapacity: undefined,
            percentSystemPower: undefined,
            order: isOn ? 1 : 0
        })
        i = i + systemProfileSetup.dataInterval;
    }
    return summaryData;
}