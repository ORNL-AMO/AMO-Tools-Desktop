import { CompressedAirDayType, ProfileSummary, ProfileSummaryTotal, ReduceAirLeaks, ReduceRuntime, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { EemSavingsResults } from "../../caCalculationModels";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import * as _ from 'lodash';
import { FlowReallocationResults } from "./FlowReallocationResults";

export class ReduceAirLeaksResults {

    savings: EemSavingsResults;
    profileSummary: Array<CompressedAirProfileSummary>;

    constructor(dayType: CompressedAirDayType, reduceAirLeaks: ReduceAirLeaks, totals: Array<ProfileSummaryTotal>,
        settings: Settings, previousProfileSummary: Array<CompressedAirProfileSummary>, adjustedCompressors: Array<CompressorInventoryItemClass>,
        atmosphericPressure: number, totalAirStorage: number, systemInformation: SystemInformation, reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService, costKwh: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },

    ) {
        //1. Adjust totals based on air leak reduction
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = this.reduceAirLeaks(reduceAirLeaks, totals);
        //2. Reallocate flow based on new totals
        let flowReallocationResults: FlowReallocationResults = new FlowReallocationResults(dayType,
            settings,
            previousProfileSummary,
            adjustedCompressors,
            0,
            adjustedProfileSummaryTotal,
            atmosphericPressure,
            totalAirStorage,
            systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            costKwh,
            reduceAirLeaks.implementationCost,
            summaryDataInterval,
            auxiliaryPowerUsage);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
    }

    reduceAirLeaks(reduceAirLeaks: ReduceAirLeaks, totals: Array<ProfileSummaryTotal>): Array<ProfileSummaryTotal> {
        totals.forEach(total => {
            total.airflow = total.airflow - (reduceAirLeaks.leakReduction / 100 * reduceAirLeaks.leakFlow);
            if (total.airflow < 0) {
                total.airflow = 0;
            }
        });
        return totals;
    }
}