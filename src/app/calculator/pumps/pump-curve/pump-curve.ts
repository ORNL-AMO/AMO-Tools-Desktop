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
