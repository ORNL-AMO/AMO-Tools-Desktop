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
    headToolType?: string,
    systemCurve?: SystemCurve,
    pumpCurveForm?: PumpCurveForm,
    selected?: boolean
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

export interface SystemCurve {
    specificGravity?: number,
    systemLossExponent?: number,
    dataPoints?: Array<CurveData>,
    selectedP1Name?: string,
    selectedP2Name?: string
}

export interface CurveData {
    flowRate?: number,
    head?: number,
    modName?: string
}


export interface PumpCurveForm {
    dataRows?: PumpCurveDataRow[],
    dataOrder?: number,
    measurementOption?: string,
    baselineMeasurement?: number,
    modifiedMeasurement?: number,
    exploreLine?: number,
    exploreHead?: number,
    exploreFlow?: number,
    explorePumpEfficiency?: number,
    headOrder?: number,
    headConstant?: number,
    headFlow?: number,
    headFlow2?: number,
    headFlow3?: number,
    headFlow4?: number,
    headFlow5?: number,
    headFlow6?: number,
    pumpEfficiencyOrder?: number,
    pumpEfficiencyConstant?: number,
    maxFlow?: number
  }
  
  export interface PumpCurveDataRow {
    head: number,
    flow: number
  }
  