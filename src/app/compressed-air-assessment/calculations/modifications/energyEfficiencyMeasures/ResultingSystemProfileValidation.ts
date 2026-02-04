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

        let totalIntervals: number = 24 / dataInterval;
        this.requiredAirflow = new Array(totalIntervals).fill(0)
        this.availableAirflow = new Array(totalIntervals).fill(0)
        this.profilePower = new Array(totalIntervals).fill(0)
        this.timeInterval = new Array(totalIntervals).fill(0).map((x, i) => i);
        previousOrderProfile.forEach(summary => {
            let index: number = 0;
            for (let i = 0; i < 24;) {
                if (summary.profileSummaryData[index].order != 0) {
                    this.requiredAirflow[index] = this.requiredAirflow[index] + summary.profileSummaryData[index].airflow;
                }

                let totalAvailableAirFlow: number = 0;
                adjustedCompressors.forEach(compressor => {
                    totalAvailableAirFlow = totalAvailableAirFlow + compressor.performancePoints.fullLoad.airflow;
                });
                this.availableAirflow[index] = totalAvailableAirFlow;
                let eemDataOn: Array<ProfileSummary> = eemProfileSummary.filter(eemSummary => {
                    let intervalData: ProfileSummaryData = eemSummary.profileSummaryData.find(data => { return data.timeInterval == i });
                    return intervalData.order != 0;
                })
                let intervalSummaryData: Array<ProfileSummaryData> = eemDataOn.flatMap(eemSummary => { return eemSummary.profileSummaryData });
                //calculate power
                this.profilePower[index] = _.sumBy(intervalSummaryData, (data: ProfileSummaryData) => {
                    if (data.timeInterval == i) {
                        return data.power;
                    } else {
                        return 0
                    }
                });
                i = i + dataInterval;
                index++;
            }
        });
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