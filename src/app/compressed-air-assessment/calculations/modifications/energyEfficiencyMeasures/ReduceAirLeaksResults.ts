import { CompressedAirDayType, ProfileSummaryTotal, ReduceAirLeaks, ReduceRuntime, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import * as _ from 'lodash';
import { FlowReallocationResults } from "./FlowReallocationResults";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";

export class ReduceAirLeaksResults {

    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    order: number
    constructor(dayType: CompressedAirDayType, reduceAirLeaks: ReduceAirLeaks, totals: Array<ProfileSummaryTotal>,
        settings: Settings, previousProfileSummary: Array<CompressedAirProfileSummary>, adjustedCompressors: Array<CompressorInventoryItemClass>,
        atmosphericPressure: number, totalAirStorage: number, systemInformation: SystemInformation, reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService, costKwh: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },
        order: number
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
            auxiliaryPowerUsage,
            order);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
        this.order = order;
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