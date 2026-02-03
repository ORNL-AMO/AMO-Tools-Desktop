import { CompressedAirDayType, ProfileSummaryTotal, ReduceRuntime, SystemInformation, UseAutomaticSequencer, UseAutomaticSequencerProfileSummary } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { getProfileSummaryTotals } from "../../caCalculationHelpers";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirEemSavingsResult } from "../CompressedAirEemSavingsResult";
import { FlowReallocationResults } from "./FlowReallocationResults";

export class UseAutomaticSequencerResults {

    savings: CompressedAirEemSavingsResult;
    profileSummary: Array<CompressedAirProfileSummary>;
    adjustedCompressors: Array<CompressorInventoryItemClass>;
    order: number
    constructor(
        dayType: CompressedAirDayType,
        adjustedCompressors: Array<CompressorInventoryItemClass>,
        useAutomaticSequencer: UseAutomaticSequencer,
        atmosphericPressure: number,
        settings: Settings,
        previousProfileSummary: Array<CompressedAirProfileSummary>,
        costKwh: number,
        summaryDataInterval: number,
        auxiliaryPowerUsage: { cost: number, energyUse: number },
        totalAirStorage: number,
        systemInformation: SystemInformation,
        reduceRuntime: ReduceRuntime,
        _compressedAirCalculationService: CompressedAirCalculationService,
        order: number,
        trimSelections: Array<{ dayTypeId: string, compressorId: string }>) {
        this.order = order;
        // this.adjustedCompressors = adjustedCompressors;

        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });
        //1. Adjust compressor set points
        this.adjustedCompressors = this.useAutomaticSequencerAdjustCompressor(useAutomaticSequencer, systemInformation, settings, adjustedCompressors);
        //2. Adjust profile based on new orders
        this.profileSummary = this.useAutomaticSequencerMapOrders(useAutomaticSequencer.profileSummary, this.profileSummary);       
        //3. Reallocate flow based on new set points
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = getProfileSummaryTotals(
            summaryDataInterval,
            this.profileSummary,
            false,
            dayType,
            undefined,
            this.adjustedCompressors);
        let flowReallocationResults: FlowReallocationResults = new FlowReallocationResults(dayType,
            settings,
            this.profileSummary,
            this.adjustedCompressors,
            0,
            adjustedProfileSummaryTotal,
            atmosphericPressure,
            totalAirStorage,
            systemInformation,
            reduceRuntime,
            _compressedAirCalculationService,
            costKwh,
            useAutomaticSequencer.implementationCost,
            summaryDataInterval,
            auxiliaryPowerUsage,
            order,
            trimSelections);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = new CompressedAirEemSavingsResult(previousProfileSummary, this.profileSummary, dayType, costKwh, useAutomaticSequencer.implementationCost, summaryDataInterval, auxiliaryPowerUsage);
    }


    useAutomaticSequencerAdjustCompressor(useAutomaticSequencer: UseAutomaticSequencer, systemInformation: SystemInformation, settings: Settings, adjustedCompressors: Array<CompressorInventoryItemClass>) {
        adjustedCompressors.forEach(compressor => {
            let sequencerProfile: UseAutomaticSequencerProfileSummary = useAutomaticSequencer.profileSummary.find(profileItem => {
                return profileItem.compressorId == compressor.itemId;
            });
            compressor.compressorControls.automaticShutdown = sequencerProfile.automaticShutdownTimer;
            compressor.adjustCompressorPerformancePointsWithSequencer(useAutomaticSequencer.targetPressure, useAutomaticSequencer.variance, systemInformation.atmosphericPressure, settings)
        });
        return adjustedCompressors
    }

    useAutomaticSequencerMapOrders(automaticSequencerProfile: Array<UseAutomaticSequencerProfileSummary>, adjustedProfile: Array<CompressedAirProfileSummary>): Array<CompressedAirProfileSummary> {
        adjustedProfile.forEach(profileItem => {
            let automaticSequencerProfileItem: UseAutomaticSequencerProfileSummary = automaticSequencerProfile.find(sequencerItem => { return sequencerItem.dayTypeId == profileItem.dayTypeId && sequencerItem.compressorId == profileItem.compressorId });
            profileItem.profileSummaryData.forEach(profileSummaryDataItem => {
                let sequencerProfileDataItem: {
                    timeInterval: number,
                    order: number,
                } = automaticSequencerProfileItem.profileSummaryData.find(profileData => { return profileData.timeInterval == profileSummaryDataItem.timeInterval });
                profileSummaryDataItem.order = sequencerProfileDataItem.order;
            });
        });
        return adjustedProfile;
    }

}