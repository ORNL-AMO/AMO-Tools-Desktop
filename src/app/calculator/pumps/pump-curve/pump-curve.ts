export interface PumpCurveForm {
  dataRows?: PumpCurveDataRow[],
  baselineDiameter?: number,
  modifiedDiameter?: number,
  exploreLine?: number,
  exploreHead?: number,
  exploreFlow?: number,
  explorePumpEfficiency?: number,
  headOrder?: number,
  headConstant?: number,
  headFlow?: number,
  headFlow2?: number,
  headFlow3?: number,
  pumpEfficiencyOrder?: number,
  pumpEfficiencyConstant?: number
}

export interface PumpCurveDataRow {
  head: number,
  flow: number,
  pumpEfficiency: number
}
