import { PreAssessment } from "../../calculator/furnaces/pre-assessment/pre-assessment";
import { FormGroup } from "@angular/forms";

export interface Calculator {
    directoryId?: number,
    assessmentId?: number,
    id?: number,
    name?: string,
    type?: string,
    preAssessments?: Array<PreAssessment>,
    headTool?: HeadTool,
    headToolSuction?: HeadToolSuction,
    headToolType?: string
}

export interface HeadToolSuction {
    specificGravity: number,
    flowRate: number,
    suctionPipeDiameter: number,
    suctionTankGasOverPressure: number,
    suctionTankFluidSurfaceElevation: number,
    suctionLineLossCoefficients: number,
    dischargePipeDiameter: number,
    dischargeGaugePressure: number,
    dischargeGaugeElevation: number,
    dischargeLineLossCoefficients: number,
}


export interface HeadTool{
    specificGravity: number,
    flowRate: number,
    suctionPipeDiameter: number,
    suctionGaugePressure: number,
    suctionGaugeElevation: number,
    suctionLineLossCoefficients: number,
    dischargePipeDiameter: number,
    dischargeGaugePressure: number,
    dischargeGaugeElevation: number,
    dischargeLineLossCoefficients: number,
}