import { Co2SavingsData } from "../../calculator/utilities/co2-savings/co2-savings.service";
import { AssessmentCo2SavingsService } from "../../shared/assessment-co2-savings/assessment-co2-savings.service";
import { roundVal } from "../../shared/helperFunctions";
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal } from "../../shared/models/compressed-air-assessment";
import { Settings } from "../../shared/models/settings";
import { CompressedAirCalculationService, CompressorCalcResult } from "../compressed-air-calculation.service";
import { getTotalCapacity, getTotalPower } from "./caCalculationHelpers";
import { BaselineResult, SavingsItem } from "./caCalculationModels";
import { CompressedAirProfileSummary } from "./CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "./CompressorInventoryItemClass";
import * as _ from 'lodash';

export class CompressedAirBaselineDayTypeProfileSummary {

    inventoryItems: Array<CompressorInventoryItemClass>;
    profileSummary: Array<CompressedAirProfileSummary>
    baselineDayTypeProfileSummary: Array<CompressedAirProfileSummary>;
    dayType: CompressedAirDayType;
    profileSummaryTotals: Array<ProfileSummaryTotal>;
    savingsItem: SavingsItem;
    emissionsOutput: number;
    baselineResult: BaselineResult;
    totalFullLoadCapacity: number;
    totalFullLoadPower: number;
    constructor(
        compressedAirAssessment: CompressedAirAssessment,
        dayType: CompressedAirDayType,
        settings: Settings,
        _compressedAirCalculationService: CompressedAirCalculationService,
        _assessmentCo2SavingsService: AssessmentCo2SavingsService
    ) {
        this.dayType = dayType;
        this.totalFullLoadCapacity = getTotalCapacity(this.inventoryItems);
        this.totalFullLoadPower = getTotalPower(this.inventoryItems);
        this.setBaselineProfileSummary(compressedAirAssessment.systemProfile.profileSummary);
        this.setInventoryItems(compressedAirAssessment.compressorInventoryItems);
        //Adjust perfomance points for sequencer
        if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer') {
            this.inventoryItems.forEach(item => {
                item.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessment.systemInformation.targetPressure, compressedAirAssessment.systemInformation.variance, compressedAirAssessment.systemInformation, settings);
            })
        }
        this.setDayTypeSummary(_compressedAirCalculationService, settings, compressedAirAssessment.systemInformation.atmosphericPressure, compressedAirAssessment.systemInformation.totalAirStorage)
        this.setProfileSummaryTotals(compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval);
        this.setSavingsItem(compressedAirAssessment.systemBasics.electricityCost, compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval);
        this.setEmissionsOutput(_assessmentCo2SavingsService, compressedAirAssessment.systemInformation.co2SavingsData, settings);
        this.setBaselineResults(compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval, compressedAirAssessment.systemBasics.demandCost)
    }

    setInventoryItems(caInventoryItems: Array<CompressorInventoryItem>) {
        this.inventoryItems = caInventoryItems.map(item => {
            return new CompressorInventoryItemClass(item);
        });
    }

    setBaselineProfileSummary(profileSummary: Array<ProfileSummary>) {
        let dayTypeSummaries: Array<ProfileSummary> = profileSummary.filter(summary => {
            return summary.dayTypeId == this.dayType.dayTypeId;
        });
        this.baselineDayTypeProfileSummary = dayTypeSummaries.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });
    }

    setDayTypeSummary(
        _compressedAirCalculationService: CompressedAirCalculationService,
        settings: Settings,
        atmosphericPressure: number,
        totalAirStorage: number
    ) {
        this.profileSummary = new Array();
        this.baselineDayTypeProfileSummary.forEach(baselineSummary => {
            let compressor: CompressorInventoryItemClass = this.getCompressor(baselineSummary.compressorId);
            let summary: CompressedAirProfileSummary = new CompressedAirProfileSummary(baselineSummary, false);
            baselineSummary.profileSummaryData.forEach(baselineSummaryData => {
                let summaryData: ProfileSummaryData = {
                    ...baselineSummaryData
                };
                if (summaryData.order != 0) {
                    let computeFrom: 0 | 1 | 2 | 3 | 4;
                    let computeFromVal: number;
                    let powerFactorData: { amps: number, volts: number };
                    if (this.dayType.profileDataType == 'power') {
                        computeFrom = 2;
                        computeFromVal = summaryData.power;
                    } else if (this.dayType.profileDataType == 'percentCapacity') {
                        computeFrom = 1;
                        computeFromVal = summaryData.percentCapacity;
                    } else if (this.dayType.profileDataType == 'airflow') {
                        computeFrom = 3;
                        computeFromVal = summaryData.airflow;
                    } else if (this.dayType.profileDataType == 'percentPower') {
                        computeFrom = 0;
                        computeFromVal = summaryData.percentPower;
                    } else if (this.dayType.profileDataType == 'powerFactor') {
                        computeFrom = 4;
                        powerFactorData = { amps: summaryData.amps, volts: summaryData.volts };
                        computeFromVal = summaryData.powerFactor;
                    }
                    let calcResult: CompressorCalcResult = _compressedAirCalculationService.compressorsCalc(compressor, settings, computeFrom, computeFromVal, atmosphericPressure, totalAirStorage, 0, true, powerFactorData);
                    summaryData.airflow = roundVal(calcResult.capacityCalculated, 2);
                    summaryData.power = calcResult.powerCalculated;
                    summaryData.percentCapacity = calcResult.percentageCapacity;
                    summaryData.percentPower = calcResult.percentagePower;
                    summaryData.percentSystemCapacity = (calcResult.capacityCalculated / this.totalFullLoadCapacity) * 100;
                    summaryData.percentSystemPower = (calcResult.powerCalculated / this.totalFullLoadPower) * 100;
                } else {
                    summaryData.airflow = 0;
                    summaryData.power = 0;
                    summaryData.percentCapacity = 0;
                    summaryData.percentPower = 0;
                    summaryData.percentSystemCapacity = 0;
                    summaryData.percentSystemPower = 0;
                }
                summary.profileSummaryData.push(summaryData);
            });
            this.profileSummary.push(summary);
        });
    }

    getCompressor(compressorId: string): CompressorInventoryItemClass {
        return this.inventoryItems.find(item => {
            return item.itemId == compressorId
        });
    }


    setProfileSummaryTotals(selectedHourInterval: number) {
        let totalSystemCapacity: number = getTotalCapacity(this.inventoryItems);
        let totalFullLoadPower: number = getTotalPower(this.inventoryItems);
        //already baseline summary by day type
        //let allData: Array<ProfileSummaryData> = new Array();
        // this.profileSummary.forEach(summary => {
        //   if (summary.dayTypeId == selectedDayType.dayTypeId) {
        //     allData = allData.concat(summary.profileSummaryData);
        //   }
        // });
        let allData: Array<ProfileSummaryData> = this.profileSummary.flatMap(summary => {
            return summary.profileSummaryData;
        });
        this.profileSummaryTotals = new Array();
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
            //   let auxiliaryPower: number = this.getTotalAuxiliaryPower(selectedDayType, interval, improveEndUseEfficiency);
            this.profileSummaryTotals.push({
                auxiliaryPower: 0,
                airflow: totalAirFlow,
                power: compressorPower,
                totalPower: compressorPower,
                percentCapacity: (totalAirFlow / totalSystemCapacity) * 100,
                percentPower: (compressorPower / totalFullLoadPower) * 100,
                timeInterval: interval
            });
            interval = interval + selectedHourInterval;
        }
    }

    setSavingsItem(costKwh: number, selectedHourInterval: number) {
        let flatSummaryData: Array<ProfileSummaryData> = this.profileSummary.flatMap(summary => {
            return summary.profileSummaryData;
        });;
        flatSummaryData = flatSummaryData.filter(data => { return isNaN(data.power) == false })
        let sumPower: number = _.sumBy(flatSummaryData, 'power');
        sumPower = sumPower * selectedHourInterval * this.dayType.numberOfDays;
        //no aux power baseline
        // if (auxiliaryPowerUsage) {
        //     sumPower = sumPower + auxiliaryPowerUsage.energyUse;
        // }
        let sumCost: number = sumPower * costKwh;
        this.savingsItem = {
            cost: sumCost,
            power: sumPower,
        };
    }

    setEmissionsOutput(_assessmentCo2SavingsService: AssessmentCo2SavingsService, co2SavingsData: Co2SavingsData, settings: Settings) {
        if (co2SavingsData) {
            co2SavingsData.electricityUse = this.savingsItem.power;
            this.emissionsOutput = _assessmentCo2SavingsService.getCo2EmissionsResult(co2SavingsData, settings);
            // * handle offset result - electricity use is passed here as kWh but the method is meant to accept MWh
            this.emissionsOutput = this.emissionsOutput / 1000;
        }
    }

    setBaselineResults(selectedHourInterval: number, demandCost: number) {
        let hoursOn: number = 0;
        let numberOfDataPoints: number = 0;
        this.profileSummaryTotals.forEach(total => {
            if (total.power != 0) {
                hoursOn = hoursOn + selectedHourInterval;
                numberOfDataPoints++;
            }
        });
        let totalOperatingHours: number = this.dayType.numberOfDays * hoursOn;
        let averageAirFlow: number = _.sumBy(this.profileSummaryTotals, (total: ProfileSummaryTotal) => { return total.airflow }) / numberOfDataPoints;
        if (isNaN(averageAirFlow)) {
            averageAirFlow = 0;
        }
        let averagePower: number = _.sumBy(this.profileSummaryTotals, (total: ProfileSummaryTotal) => { return total.power }) / numberOfDataPoints;
        if (isNaN(averagePower)) {
            averagePower = 0;
        }

        let peakDemandTotal: ProfileSummaryTotal = _.maxBy(this.profileSummaryTotals, (total: ProfileSummaryTotal) => { return total.power });
        let peakDemand: number = 0;
        if (peakDemandTotal) {
            peakDemand = peakDemandTotal.power;
        }
        let dayTypeDemandCost: number = peakDemand * 12 * demandCost;
        let maxAirFlowTotal: ProfileSummaryTotal = _.maxBy(this.profileSummaryTotals, (total: ProfileSummaryTotal) => { return total.airflow });
        let maxAirFlow: number = 0;
        if (maxAirFlowTotal) {
            maxAirFlow = maxAirFlowTotal.airflow;
        }

        this.baselineResult = {
            cost: this.savingsItem.cost,
            energyUse: this.savingsItem.power,
            annualEmissionOutput: this.emissionsOutput,
            peakDemand: peakDemand,
            name: this.dayType.name,
            averageAirFlow: averageAirFlow,
            averageAirFlowPercentCapacity: averageAirFlow / this.totalFullLoadCapacity * 100,
            operatingDays: this.dayType.numberOfDays,
            totalOperatingHours: totalOperatingHours,
            loadFactorPercent: averagePower / this.totalFullLoadPower * 100,
            dayTypeId: this.dayType.dayTypeId,
            demandCost: dayTypeDemandCost,
            totalAnnualOperatingCost: demandCost + this.savingsItem.cost,
            maxAirFlow: maxAirFlow
        }
    }
}
