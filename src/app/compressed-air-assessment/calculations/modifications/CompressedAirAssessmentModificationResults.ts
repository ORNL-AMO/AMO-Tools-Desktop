import { AssessmentCo2SavingsService } from "../../../shared/assessment-co2-savings/assessment-co2-savings.service";
import { CompressedAirAssessment, Modification } from "../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../compressed-air-calculation.service";
import { CompressedAirAssessmentResult, DayTypeModificationResult } from "./../caCalculationModels";
import { CompressedAirAssessmentBaselineResults } from "./../CompressedAirAssessmentBaselineResults";
import { CompressedAirModifiedDayTypeProfileSummary } from "./CompressedAirModifiedDayTypeProfileSummary";

export class CompressedAirAssessmentModificationResults {

    modifiedDayTypeProfileSummaries: Array<CompressedAirModifiedDayTypeProfileSummary>
    totalBaselineCost: number;
    totalBaselinePower: number;
    totalModificationCost: number;
    totalModificationPower: number;
    totalCostSavings: number;
    totalCostPower: number;
    modification: Modification
    constructor(compressedAirAssessment: CompressedAirAssessment,
        modification: Modification,
        settings: Settings,
        _compressedAirCalculationService: CompressedAirCalculationService,
        _assessmentCo2SavingsService: AssessmentCo2SavingsService,
        compressedAirAssessmentBaselineResults?: CompressedAirAssessmentBaselineResults) {
        this.modification = modification;
        //Calculate baseline results if not passed in
        if (!compressedAirAssessmentBaselineResults) {
            compressedAirAssessmentBaselineResults = new CompressedAirAssessmentBaselineResults(compressedAirAssessment, settings, _compressedAirCalculationService, _assessmentCo2SavingsService);
        }
        this.setModifiedDayTypeProfileSummaries(compressedAirAssessment, modification, settings, _compressedAirCalculationService, _assessmentCo2SavingsService, compressedAirAssessmentBaselineResults);
        this.setTotals(compressedAirAssessmentBaselineResults);
    }

    setModifiedDayTypeProfileSummaries(compressedAirAssessment: CompressedAirAssessment,
        modification: Modification,
        settings: Settings,
        _compressedAirCalculationService: CompressedAirCalculationService,
        _assessmentCo2SavingsService: AssessmentCo2SavingsService,
        compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults) {
        this.modifiedDayTypeProfileSummaries = new Array();
        compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
            let compressedAirModifiedDayTypeProfileSummary: CompressedAirModifiedDayTypeProfileSummary = new CompressedAirModifiedDayTypeProfileSummary(dayType, compressedAirAssessmentBaselineResults.baselineDayTypeProfileSummaries,
                settings, _compressedAirCalculationService, compressedAirAssessment, modification, _assessmentCo2SavingsService);
            this.modifiedDayTypeProfileSummaries.push(compressedAirModifiedDayTypeProfileSummary);
        });
    }

    setTotals(compressedAirAssessmentBaselineResults: CompressedAirAssessmentBaselineResults) {
        this.totalBaselineCost = compressedAirAssessmentBaselineResults.baselineResults.total.cost;
        this.totalBaselinePower = compressedAirAssessmentBaselineResults.baselineResults.total.energyUse;

        this.totalModificationCost = 0;
        this.totalModificationPower = 0;
        this.modifiedDayTypeProfileSummaries.forEach(summary => {
            this.totalModificationCost += summary.modificationSavings.adjustedResults.cost;
            this.totalModificationPower += summary.modificationSavings.adjustedResults.power;
        });
        this.totalCostSavings = this.totalBaselineCost - this.totalModificationCost;
        this.totalCostPower = this.totalBaselinePower - this.totalModificationPower;
    }

    getModificationResults(): CompressedAirAssessmentResult {
        return {
            dayTypeModificationResults: this.modifiedDayTypeProfileSummaries.map(summary => summary.getDayTypeModificationResult()),
            totalBaselineCost: this.totalBaselineCost,
            totalBaselinePower: this.totalBaselinePower,
            totalModificationCost: this.totalModificationCost,
            totalModificationPower: this.totalModificationPower,
            totalCostSavings: this.totalCostSavings,
            totalCostPower: this.totalCostPower,
            modification: this.modification
        }
    }
}