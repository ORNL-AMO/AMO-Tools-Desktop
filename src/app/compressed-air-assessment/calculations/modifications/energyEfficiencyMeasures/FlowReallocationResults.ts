import { CompressedAirDayType, ProfileSummaryTotal, ReduceRuntime, SystemInformation } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";

export class FlowReallocationResults {

    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    order: number
    constructor(dayType: CompressedAirDayType,
        settings: Settings,
        previousProfileSummary: Array<CompressedAirProfileSummary>,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        additionalReceiverVolume: number,
        totals: Array<ProfileSummaryTotal>,
        atmosphericPressure: number,
        totalAirStorage: number,
        systemInformation: SystemInformation,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService,
        costKwh: number,
        implementationCost: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },
        order: number,
        trimSelections: Array<{ dayTypeId: string, compressorId: string }>) {
        this.order = order;
        let adjustedCompressorCopys: Array<CompressorInventoryItemClass> = adjustedCompressors.map(compressor => { return new CompressorInventoryItemClass(compressor) });
        this.reallocateFlow(dayType,
            settings,
            previousProfileSummary,
            adjustedCompressorCopys,
            additionalReceiverVolume,
            totals,
            atmosphericPressure,
            totalAirStorage,
            systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            trimSelections);
        this.savings = new CompressedAirEemSavingsResult(previousProfileSummary, this.profileSummary, dayType, costKwh, implementationCost, summaryDataInterval, auxiliaryPowerUsage, 0, _compressedAirCalculationService, settings);
    }

    reallocateFlow(dayType: CompressedAirDayType,
        settings: Settings,
        previousProfileSummary: Array<CompressedAirProfileSummary>,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        additionalReceiverVolume: number,
        totals: Array<ProfileSummaryTotal>,
        atmosphericPressure: number,
        totalAirStorage: number,
        systemInformation: SystemInformation,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService,
        trimSelections: Array<{ dayTypeId: string, compressorId: string }>) {
        this.profileSummary = _compressedAirCalculationService.reallocateProfileSummary(
            dayType,
            previousProfileSummary,
            adjustedCompressors,
            additionalReceiverVolume,
            totals,
            atmosphericPressure,
            totalAirStorage,
            systemInformation.multiCompressorSystemControls,
            reduceRuntime,
            trimSelections,
            settings
        );
    }
}
