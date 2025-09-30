import { CompressedAirDayType, EndUseEfficiencyItem, EndUseEfficiencyReductionData, ImproveEndUseEfficiency, ProfileSummaryTotal, ReduceRuntime, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";
import { FlowReallocationResults } from "./FlowReallocationResults";
import * as _ from 'lodash';

export class ImproveEndUseEfficiencyResults {

    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    auxiliaryPowerUsage: { cost: number, energyUse: number };
    order: number;
    constructor(dayType: CompressedAirDayType, improveEndUseEfficiency: ImproveEndUseEfficiency, totals: Array<ProfileSummaryTotal>,
        settings: Settings, previousProfileSummary: Array<CompressedAirProfileSummary>, adjustedCompressors: Array<CompressorInventoryItemClass>,
        atmosphericPressure: number, totalAirStorage: number, systemInformation: SystemInformation, reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService, costKwh: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },
        order: number
    ) {
        //1. Adjust totals based on end use efficiency reductions
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = this.adjustTotalsWithImprovedEndUseEfficiency(dayType, improveEndUseEfficiency, totals);
        //2. Calculate auxiliary power usage
        this.setAuxiliaryPowerUsage(improveEndUseEfficiency, costKwh, dayType);
        //3. Calculate implementation cost
        let implementationCost: number = _.sumBy(improveEndUseEfficiency.endUseEfficiencyItems, (item: EndUseEfficiencyItem) => { return item.implementationCost });
        //4. Reallocate flow based on new totals
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
            implementationCost,
            summaryDataInterval,
            this.auxiliaryPowerUsage,
            order);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
        this.order = order;
    }

    adjustTotalsWithImprovedEndUseEfficiency(dayType: CompressedAirDayType, improveEndUseEfficiency: ImproveEndUseEfficiency, totals: Array<ProfileSummaryTotal>): Array<ProfileSummaryTotal> {
        totals.forEach(total => {
            improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
                let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
                let intervalReductionData = reductionData.data.find(rData => { return rData.hourInterval == total.timeInterval });
                if (item.reductionType == 'Fixed') {
                    if (intervalReductionData.applyReduction) {
                        total.airflow = total.airflow - item.airflowReduction;
                    }
                } else if (item.reductionType == 'Variable') {
                    if (intervalReductionData.reductionAmount) {
                        total.airflow = total.airflow - intervalReductionData.reductionAmount;
                    }
                }
                if (total.airflow < 0) {
                    total.airflow = 0;
                }
            });
        });
        return totals
    }

    setAuxiliaryPowerUsage(improveEndUseEfficiency: ImproveEndUseEfficiency, electricityCost: number, dayType: CompressedAirDayType) {
        let energyUse: number = 0;
        improveEndUseEfficiency.endUseEfficiencyItems.forEach(item => {
            if (item.substituteAuxiliaryEquipment) {
                if (item.reductionType == 'Fixed') {
                    let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
                    reductionData.data.forEach(d => {
                        if (d.applyReduction) {
                            energyUse = energyUse + item.equipmentDemand;
                        }
                    });

                } else if (item.reductionType == 'Variable') {
                    let reductionData: EndUseEfficiencyReductionData = item.reductionData.find(rData => { return rData.dayTypeId == dayType.dayTypeId });
                    reductionData.data.forEach(d => {
                        if (d.reductionAmount) {
                            energyUse = energyUse + item.equipmentDemand;
                        }
                    });
                }
            }
        });
        energyUse = energyUse * dayType.numberOfDays;
        this.auxiliaryPowerUsage = { cost: energyUse * electricityCost, energyUse: energyUse };
    }

}