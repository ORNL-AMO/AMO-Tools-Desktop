import { CompressedAirDayType, ProfileSummary, ProfileSummaryData, ProfileSummaryTotal, ReduceRuntime, SystemInformation, UseAutomaticSequencer } from "../../../../shared/models/compressed-air-assessment";
import { Settings } from "../../../../shared/models/settings";
import { CompressedAirCalculationService } from "../../../compressed-air-calculation.service";
import { getProfileSummaryTotals } from "../../caCalculationHelpers";
import { EemSavingsResults } from "../../caCalculationModels";
import { CompressedAirProfileSummary } from "../../CompressedAirProfileSummary";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { FlowReallocationResults } from "./FlowReallocationResults";

export class UseAutomaticSequencerResults {

    savings: EemSavingsResults;
    profileSummary: Array<CompressedAirProfileSummary>;
    adjustedCompressors: Array<CompressorInventoryItemClass>;

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
        _compressedAirCalculationService: CompressedAirCalculationService) {
        this.adjustedCompressors = adjustedCompressors;
        
        this.profileSummary = previousProfileSummary.map(summary => {
            return new CompressedAirProfileSummary(summary, true);
        });

        //1. Adjust compressor set points
        this.useAutomaticSequencerAdjustCompressor(useAutomaticSequencer, systemInformation, settings);
        //3. Reallocate flow based on new set points
        let adjustedProfileSummaryTotal: Array<ProfileSummaryTotal> = getProfileSummaryTotals(
            summaryDataInterval,
            this.profileSummary,
            false,
            dayType,
            undefined);
        let flowReallocationResults: FlowReallocationResults = new FlowReallocationResults(dayType,
            settings,
            previousProfileSummary,
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
            auxiliaryPowerUsage);
        this.profileSummary = flowReallocationResults.profileSummary;
        this.savings = flowReallocationResults.savings;
    }


    useAutomaticSequencerAdjustCompressor(useAutomaticSequencer: UseAutomaticSequencer, systemInformation: SystemInformation, settings: Settings) {
        this.adjustedCompressors.forEach(compressor => {
            let sequencerProfile: CompressedAirProfileSummary = this.profileSummary.find(profileItem => { return profileItem.compressorId == compressor.itemId });
            compressor.compressorControls.automaticShutdown = sequencerProfile.automaticShutdownTimer;
            compressor.adjustCompressorPerformancePointsWithSequencer(useAutomaticSequencer.targetPressure, useAutomaticSequencer.variance, systemInformation, settings)
        });
    }

    // useAutomaticSequencerMapOrders(automaticSequencerProfile: Array<ProfileSummary>, adjustedProfile: Array<ProfileSummary>): Array<ProfileSummary> {
    //     adjustedProfile.forEach(profileItem => {
    //         let automaticSequencerProfileItem: ProfileSummary = automaticSequencerProfile.find(sequencerItem => { return sequencerItem.dayTypeId == profileItem.dayTypeId && sequencerItem.compressorId == profileItem.compressorId });
    //         profileItem.profileSummaryData.forEach(profileSummaryDataItem => {
    //             let sequencerProfileDataItem: ProfileSummaryData = automaticSequencerProfileItem.profileSummaryData.find(profileData => { return profileData.timeInterval == profileSummaryDataItem.timeInterval });
    //             profileSummaryDataItem.order = sequencerProfileDataItem.order;
    //         });
    //     });
    //     return adjustedProfile;
    // }

}