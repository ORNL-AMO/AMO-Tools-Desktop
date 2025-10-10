import { CompressedAirDayType, ProfileSummary, ProfileSummaryData } from "../../../../shared/models/compressed-air-assessment";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirModifiedDayTypeProfileSummary } from "../CompressedAirModifiedDayTypeProfileSummary";

export class ResultingSystemProfileValidation {

    dayType: CompressedAirDayType;
    isValid: boolean
    requiredAirflow: Array<number>;
    availableAirflow: Array<number>;
    profilePower: Array<number>;
    constructor(modificationProfileSummary: CompressedAirModifiedDayTypeProfileSummary, order: number, dataInterval: number) {
        this.dayType = modificationProfileSummary.dayType;
        let adjustedProfileSummary: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(order - 1);
        let eemSequencerProfileSummary: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(order);
        this.setDataArrays(adjustedProfileSummary, dataInterval, eemSequencerProfileSummary, modificationProfileSummary.adjustedCompressors, false);
        this.isValid = this.checkAirflowValid(this.requiredAirflow, this.availableAirflow);
    }

    setDataArrays(previousOrderProfile: Array<ProfileSummary>, dataInterval: number,
        eemProfileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItemClass>,
        profilePowerNeeded: boolean) {
        this.requiredAirflow = new Array(24).fill(0)
        this.availableAirflow = new Array(24).fill(0)
        this.profilePower = new Array(24).fill(0)
        previousOrderProfile.forEach(summary => {
            let index: number = 0;
            for (let i = 0; i < 24;) {
                if (summary.profileSummaryData[index].order != 0) {
                    this.requiredAirflow[index] = this.requiredAirflow[index] + summary.profileSummaryData[index].airflow;
                }
                let profileSummary: ProfileSummary = eemProfileSummary.find(sequencerSummary => { return summary.compressorId == sequencerSummary.compressorId && summary.dayTypeId == sequencerSummary.dayTypeId });
                let intervalItem: ProfileSummaryData = profileSummary.profileSummaryData.find(data => { return data.timeInterval == i });
                if (intervalItem.order != 0) {
                    this.availableAirflow[index] = this.availableAirflow[index] + this.getFullLoadCapacity(profileSummary.compressorId, adjustedCompressors);
                }
                if (profilePowerNeeded) {
                    let powerProfile: ProfileSummary = eemProfileSummary.find(profileSummary => { return summary.compressorId == profileSummary.compressorId && summary.dayTypeId == profileSummary.dayTypeId });
                    let powerProfileData: ProfileSummaryData = powerProfile.profileSummaryData.find(data => { return data.timeInterval == i });
                    this.profilePower[index] = this.profilePower[index] + powerProfileData.power;
                }
                i = i + dataInterval;
                index++;
            }
        });
    }

    getFullLoadCapacity(compressorId: string, adjustedCompressors: Array<CompressorInventoryItemClass>): number {
        let compressor: CompressorInventoryItemClass = adjustedCompressors.find(compressor => { return compressor.itemId == compressorId });
        return compressor.performancePoints.fullLoad.airflow;
    }

    checkAirflowValid(requiredAirflow: Array<number>, availableAirflow: Array<number>): boolean {
        let isValid: boolean = true;
        for (let i = 0; i < requiredAirflow.length; i++) {
            if (availableAirflow[i] < requiredAirflow[i]) {
                isValid = false;
                i = requiredAirflow.length;
            }
        }
        return isValid;
    }

}