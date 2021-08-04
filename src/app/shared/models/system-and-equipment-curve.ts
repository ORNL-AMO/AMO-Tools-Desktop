export interface SystemAndEquipmentCurveData {
    pumpSystemCurveData?: PumpSystemCurveData,
    fanSystemCurveData?: FanSystemCurveData,
    byEquationInputs?: ByEquationInputs,
    byDataInputs?: ByDataInputs,
    equipmentInputs?: EquipmentInputs,
    equipmentCurveFormView?: string,
  }
  
  export interface PumpSystemCurveData {
    specificGravity: number,
    systemLossExponent: number,
    pointOneFlowRate: number,
    pointOneHead: number,
    pointTwo: string,
    pointTwoFlowRate: number,
    pointTwoHead: number,
    modificationCurve?: ModificationCurve
  }

  export interface ModificationCurve {
    modificationMeasurementOption?: number,
    modifiedHead?: number,
    modifiedFlow?: number
    modifiedPressure?: number
  }
  
  
  export interface FanSystemCurveData {
    compressibilityFactor: number,
    systemLossExponent: number,
    pointOneFlowRate: number,
    pointOnePressure: number,
    pointTwo: string,
    pointTwoFlowRate: number,
    pointTwoPressure: number,
    modificationCurve?: ModificationCurve
  }
  
  export interface ByEquationInputs {
    maxFlow: number,
    equationOrder: number,
    constant: number,
    flow: number,
    flowTwo: number,
    flowThree: number,
    flowFour: number,
    flowFive: number,
    flowSix: number,
    powerDataRows?: Array<{ flow: number, yValue: number, power: number }>,
    powerConstant: number,
    powerOrder: number,
    powerFlow: number,
    powerFlowTwo: number,
    powerFlowThree: number,
    powerFlowFour: number,
    powerFlowFive: number,
    powerFlowSix: number,
  }
  
  export interface EquipmentInputs {
    measurementOption: number,
    baselineMeasurement: number,
    modificationMeasurementOption: number,
    modifiedMeasurement?: number,
  }
  
  export interface ByDataInputs {
    dataRows: Array<{ flow: number, yValue: number, power: number }>,
    dataOrder: number,
    powerDataOrder?: number,
  }

  export interface ModificationEquipment {
    head?: number,
    flow?: number,
    pressure?: number,
    speed?: number,
  }