import { AssessmentCo2SavingsService } from "../../shared/assessment-co2-savings/assessment-co2-savings.service";
import { CompressedAirAssessment } from "../../shared/models/compressed-air-assessment";
import { Settings } from "../../shared/models/settings";
import { CompressedAirCalculationService } from "../compressed-air-calculation.service";
import { BaselineResult, BaselineResults } from "./caCalculationModels";
import { CompressedAirBaselineDayTypeProfileSummary } from "./CompressedAirBaselineDayTypeProfileSummary";

import * as _ from 'lodash';
export class CompressedAirAssessmentBaselineResults {

    baselineDayTypeProfileSummaries: Array<CompressedAirBaselineDayTypeProfileSummary>;
    baselineResults: BaselineResults;
    constructor(compressedAirAssessment: CompressedAirAssessment,
        settings: Settings,
        _compressedAirCalculationService: CompressedAirCalculationService,
        _assessmentCo2SavingsService: AssessmentCo2SavingsService) {
        this.setBaselineProfileSummaries(compressedAirAssessment, settings, _compressedAirCalculationService, _assessmentCo2SavingsService);
        this.setBaselineResults(compressedAirAssessment)

    }
    setBaselineProfileSummaries(compressedAirAssessment: CompressedAirAssessment, settings: Settings, _compressedAirCalculationService: CompressedAirCalculationService,
        _assessmentCo2SavingsService: AssessmentCo2SavingsService) {
        this.baselineDayTypeProfileSummaries = new Array();
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
            let dayTypeSummary: CompressedAirBaselineDayTypeProfileSummary = new CompressedAirBaselineDayTypeProfileSummary(compressedAirAssessment, dayType, settings, _compressedAirCalculationService, _assessmentCo2SavingsService);
            this.baselineDayTypeProfileSummaries.push(dayTypeSummary);
        });
    }

    setBaselineResults(compressedAirAssessment: CompressedAirAssessment) {
        let dayTypeResults: Array<BaselineResult> = this.baselineDayTypeProfileSummaries.flatMap(baselineProfileSummary => {
            return baselineProfileSummary.baselineResult
        });
        let sumAverages: number = 0;
        let totalDays: number = 0;
        let sumAveragePercent: number = 0;
        let sumAverageLoadFactor: number = 0;
        let totalEnergyUse: number = 0;
        let totalAnnualEmissionOutput: number = 0;
        let annualEnergyCost: number = 0;
        dayTypeResults.forEach(result => {
            totalDays = totalDays + result.operatingDays;
            sumAverages = sumAverages + (result.averageAirFlow * result.operatingDays);
            sumAveragePercent = sumAveragePercent + (result.averageAirFlowPercentCapacity * result.operatingDays);
            sumAverageLoadFactor = sumAverageLoadFactor + (result.loadFactorPercent * result.operatingDays);
            totalEnergyUse = totalEnergyUse + result.energyUse;
            totalAnnualEmissionOutput = totalAnnualEmissionOutput + result.annualEmissionOutput;
            annualEnergyCost = annualEnergyCost + result.cost;
        });

        let peakDemand: number = _.maxBy(dayTypeResults, (result: BaselineResult) => { return result.peakDemand }).peakDemand;
        let demandCost: number = peakDemand * 12 * compressedAirAssessment.systemBasics.demandCost;
        let maxAirflow: number = _.maxBy(dayTypeResults, (result: BaselineResult) => { return result.maxAirFlow }).maxAirFlow;

        this.baselineResults = {
            dayTypeResults: dayTypeResults,
            total: {
                cost: annualEnergyCost,
                peakDemand: peakDemand,
                energyUse: totalEnergyUse,
                name: 'System Totals',
                averageAirFlow: (sumAverages / totalDays),
                averageAirFlowPercentCapacity: sumAveragePercent / totalDays,
                operatingDays: totalDays,
                annualEmissionOutput: totalAnnualEmissionOutput,
                totalOperatingHours: _.sumBy(dayTypeResults, (result: BaselineResult) => { return result.totalOperatingHours }),
                loadFactorPercent: sumAverageLoadFactor / totalDays,
                demandCost: demandCost,
                totalAnnualOperatingCost: demandCost + annualEnergyCost,
                maxAirFlow: maxAirflow
            }
        }
    }
}