import { CompressedAirDayType, ProfileSummary, ProfileSummaryData } from "../../../../shared/models/compressed-air-assessment";
import { CompressorInventoryItemClass } from "../../CompressorInventoryItemClass";
import { CompressedAirModifiedDayTypeProfileSummary } from "../CompressedAirModifiedDayTypeProfileSummary";
import * as _ from 'lodash';

export class ResultingSystemProfileValidation {

    dayType: CompressedAirDayType;
    isValid: boolean
    requiredAirflow: Array<number>;
    availableAirflow: Array<number>;
    profilePower: Array<number>;
    timeInterval: Array<number>;
    constructor(modificationProfileSummary: CompressedAirModifiedDayTypeProfileSummary, order: number, dataInterval: number) {
        this.dayType = modificationProfileSummary.dayType;
        let adjustedProfileSummary: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(order - 1);
        let eemSequencerProfileSummary: Array<ProfileSummary> = modificationProfileSummary.getProfileSummaryFromOrder(order);
        this.setDataArrays(adjustedProfileSummary, dataInterval, eemSequencerProfileSummary, modificationProfileSummary.adjustedCompressors);
        this.isValid = this.checkAirflowValid(this.requiredAirflow, this.availableAirflow);
    }

    setDataArrays(previousOrderProfile: Array<ProfileSummary>, dataInterval: number,
        eemProfileSummary: Array<ProfileSummary>, adjustedCompressors: Array<CompressorInventoryItemClass>) {
        this.requiredAirflow = new Array(24).fill(0)
        this.availableAirflow = new Array(24).fill(0)
        this.profilePower = new Array(24).fill(0)
        this.timeInterval = new Array(24).fill(0).map((x, i) => i);
        previousOrderProfile.forEach(summary => {
            let index: number = 0;
            for (let i = 0; i < 24;) {
                if (summary.profileSummaryData[index].order != 0) {
                    this.requiredAirflow[index] = this.requiredAirflow[index] + summary.profileSummaryData[index].airflow;
                }
                let eemDataOn: Array<ProfileSummary> = eemProfileSummary.filter(eemSummary => {
                    let intervalData: ProfileSummaryData = eemSummary.profileSummaryData.find(data => { return data.timeInterval == i });
                    return intervalData.order != 0;
                })
                let intervalSummaryData: Array<ProfileSummaryData> = eemDataOn.flatMap(eemSummary => { return eemSummary.profileSummaryData});
                //calculate available airflow
                let compressorsOn: Array<string> = eemDataOn.map(eemSummary => { return eemSummary.compressorId });
                let availableAirflow: number = 0;
                compressorsOn.forEach((compressorId) => {
                    let fullLoadCapacity: number = this.getFullLoadCapacity(compressorId, adjustedCompressors);
                    availableAirflow = availableAirflow + fullLoadCapacity;
                });
                this.availableAirflow[index] = availableAirflow;
                //calculate power
                this.profilePower[index] = _.sumBy(intervalSummaryData, (data: ProfileSummaryData) => { return data.power });
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