import { Co2SavingsData } from "../../calculator/utilities/co2-savings/co2-savings.service";
import { AssessmentCo2SavingsService } from "../../shared/assessment-co2-savings/assessment-co2-savings.service";
import { roundVal } from "../../shared/helperFunctions";
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, CompressorSummary, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal } from "../../shared/models/compressed-air-assessment";
import { Settings } from "../../shared/models/settings";
import { CompressedAirCalculationService } from "../compressed-air-calculation.service";
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
        this.setBaselineProfileSummary(compressedAirAssessment.systemProfile.profileSummary);
        this.setInventoryItems(compressedAirAssessment.compressorInventoryItems);
        this.totalFullLoadCapacity = getTotalCapacity(this.inventoryItems);
        this.totalFullLoadPower = getTotalPower(this.inventoryItems);
        //Adjust perfomance points for sequencer
        if (compressedAirAssessment.systemInformation.multiCompressorSystemControls == 'targetPressureSequencer') {
            this.inventoryItems.forEach(item => {
                item.adjustCompressorPerformancePointsWithSequencer(compressedAirAssessment.systemInformation.targetPressure, compressedAirAssessment.systemInformation.variance, compressedAirAssessment.systemInformation.atmosphericPressure, settings, _compressedAirCalculationService);
            })
        }
        this.setDayTypeSummary(_compressedAirCalculationService, settings, compressedAirAssessment)
        this.setProfileSummaryTotals(compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval, _compressedAirCalculationService, settings);
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
        compressedAirAssessment: CompressedAirAssessment
    ) {
        this.profileSummary = _compressedAirCalculationService.calculateBaselineProfileSummary(
            this.inventoryItems,
            this.baselineDayTypeProfileSummary,
            this.dayType,
            settings,
            compressedAirAssessment.systemInformation.atmosphericPressure,
            compressedAirAssessment.systemInformation.totalAirStorage,
            compressedAirAssessment.systemInformation.multiCompressorSystemControls,
            0,
            false
        );
    }

    getCompressor(compressorId: string): CompressorInventoryItemClass {
        return this.inventoryItems.find(item => {
            return item.findItem(compressorId)
        });
    }


    setProfileSummaryTotals(selectedHourInterval: number, _compressedAirCalculationService: CompressedAirCalculationService, settings: Settings) {
        this.profileSummaryTotals = _compressedAirCalculationService.calculateProfileSummaryTotals(
            selectedHourInterval,
            this.profileSummary,
            this.dayType,
            undefined,
            this.inventoryItems,
            settings
        );
    }

    setSavingsItem(costKwh: number, selectedHourInterval: number) {
        let flatSummaryData: Array<ProfileSummaryData> = this.profileSummary.flatMap(summary => {
            return summary.profileSummaryData;
        });;
        flatSummaryData = flatSummaryData.filter(data => { return isNaN(data.power) == false })
        let sumPower: number = _.sumBy(flatSummaryData, 'power');
        sumPower = sumPower * selectedHourInterval * this.dayType.numberOfDays;
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

    getCompressorDayTypeSummaries(settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService): Array<CompressorSummary> {
        let compressorSummaries: Array<CompressorSummary> = new Array<CompressorSummary>();
        this.profileSummary.forEach(profile => {
            let specificPowerAvgLoad: number = (profile.avgPower / profile.avgAirflow) * 100;
            specificPowerAvgLoad = roundVal(specificPowerAvgLoad, 4);
            let compressor: CompressorInventoryItemClass = this.inventoryItems.find(compressor => { return compressor.findItem(profile.compressorId) });
            let ratedSpecificPower: number = compressor.getRatedSpecificPower(settings, _compressedAirCalculationService);
            let ratedIsentropicEfficiency: number = compressor.getRatedIsentropicEfficiency(settings, _compressedAirCalculationService);
            let compressorSummary: CompressorSummary = {
                dayType: this.dayType,
                specificPowerAvgLoad: specificPowerAvgLoad,
                ratedSpecificPower: roundVal(ratedSpecificPower, 4),
                ratedIsentropicEfficiency: ratedIsentropicEfficiency
            }
            compressorSummaries.push(compressorSummary);
        });
        return compressorSummaries;
    }
}
