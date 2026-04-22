import { ProfileSummary, ProfileSummaryData } from "../../shared/models/compressed-air-assessment";
import * as _ from 'lodash';

export class CompressedAirProfileSummary {

    //todo: needed data
    fullLoadPressure: number;
    fullLoadCapacity: number;
    compressorId: string;
    dayTypeId: string;
    automaticShutdownTimer: boolean;
    avgPower: number;
    avgAirflow: number;
    avgPercentPower: number;
    avgPercentCapacity: number;
    adjustedIsentropicEfficiency: number

    isCompressorReplaced: boolean;
    profileSummaryData: Array<ProfileSummaryData>;
    constructor(profileSummary: ProfileSummary, includeSummaryData: boolean) {
        this.isCompressorReplaced = profileSummary.isCompressorReplaced;
        this.fullLoadPressure = profileSummary.fullLoadPressure;
        this.fullLoadCapacity = profileSummary.fullLoadCapacity;
        this.compressorId = profileSummary.compressorId;
        this.dayTypeId = profileSummary.dayTypeId;
        this.automaticShutdownTimer = profileSummary.automaticShutdownTimer;
        this.adjustedIsentropicEfficiency = profileSummary.adjustedIsentropicEfficiency;
        if (includeSummaryData) {
            this.profileSummaryData = profileSummary.profileSummaryData.map(data => {
                return { ...data };
            })
            this.setAvgPower();
            this.setAvgAirflow();
            this.setAvgPercentPower();
            this.setAvgPercentCapacity();
        } else {
            this.profileSummaryData = new Array();
            this.avgPower = profileSummary.avgPower;
            this.avgAirflow = profileSummary.avgAirflow;
            this.avgPercentPower = profileSummary.avgPercentPower;
            this.avgPercentCapacity = profileSummary.avgPercentCapacity;
        }
    }

    setAvgPower() {
        this.avgPower = _.meanBy(this.profileSummaryData, (data: ProfileSummaryData) => { return data.power });
    }

    setAvgAirflow() {
        this.avgAirflow = _.meanBy(this.profileSummaryData, (data: ProfileSummaryData) => { return data.airflow });
    }

    setAvgPercentPower() {
        this.avgPercentPower = _.meanBy(this.profileSummaryData, (data: ProfileSummaryData) => { return data.percentPower });
    }

    setAvgPercentCapacity() {
        this.avgPercentCapacity = _.meanBy(this.profileSummaryData, (data: ProfileSummaryData) => { return data.percentCapacity });
    }

}