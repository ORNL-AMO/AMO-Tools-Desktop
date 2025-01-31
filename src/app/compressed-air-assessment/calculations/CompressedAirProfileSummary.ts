import { ProfileSummary, ProfileSummaryData } from "../../shared/models/compressed-air-assessment";
import { ProfileSummaryValid } from "../compressed-air-assessment.service";

export class CompressedAirProfileSummary {

    //todo: needed data
    fullLoadPressure: number;
    fullLoadCapacity: number;
    compressorId: string;
    dayTypeId: string;
    automaticShutdownTimer: boolean;
    avgPower: number;
    avgAirflow: number;
    avgPrecentPower: number;
    avgPercentCapacity: number;
    adjustedIsentropicEfficiency: number


    profileSummaryData: Array<ProfileSummaryData>;
    constructor(profileSummary: ProfileSummary, includeSummaryData: boolean) {
        this.fullLoadPressure = profileSummary.fullLoadPressure;
        this.fullLoadCapacity = profileSummary.fullLoadPressure;
        this.compressorId = profileSummary.compressorId;
        this.dayTypeId = profileSummary.dayTypeId;
        this.automaticShutdownTimer = profileSummary.automaticShutdownTimer;
        this.avgPower = profileSummary.avgPower;
        this.avgAirflow = profileSummary.avgAirflow;
        this.avgPrecentPower = profileSummary.avgPrecentPower;
        this.avgPercentCapacity = profileSummary.avgPercentCapacity;
        this.adjustedIsentropicEfficiency = profileSummary.adjustedIsentropicEfficiency;
        if(includeSummaryData){
            this.profileSummaryData = profileSummary.profileSummaryData.map(data => {
                return data;
            })
        }else{
            this.profileSummaryData = new Array();
        }
    }

    setFromProfileSummary(profileSummary: ProfileSummary) {

    }

}