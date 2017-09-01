export interface PumpCurveForm {
  dataRows?: PumpCurveDataRow[],
  dataPumpEfficiencyOrder?: number,
  dataHeadFlowOrder?: number,
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
  headFlow6?:number,
  pumpEfficiencyOrder?: number,
  pumpEfficiencyConstant?: number
}

export interface PumpCurveDataRow {
  head: number,
  flow: number,
  pumpEfficiency: number
}
