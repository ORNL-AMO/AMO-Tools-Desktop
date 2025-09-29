import { CompressorInventoryItem, Modification, ProfileSummary, ProfileSummaryTotal } from "../../shared/models/compressed-air-assessment"

export interface CompressedAirAssessmentResult {
  dayTypeModificationResults: Array<DayTypeModificationResult>,
  totalBaselineCost: number,
  totalBaselinePower: number,
  totalModificationCost: number,
  totalModificationPower: number,
  totalCostSavings: number,
  totalPowerSavings: number,
  modification: Modification
}
export interface DayTypeProfileSummary { dayTypeId: string, profileSummary: Array<ProfileSummary> };

export interface DayTypeModificationResult {
  adjustedProfileSummary: Array<ProfileSummary>,
  adjustedCompressors: Array<CompressorInventoryItem>,
  profileSummaryTotals: Array<ProfileSummaryTotal>,
  allSavingsResults: EemSavingsResults,
  flowReallocationSavings: EemSavingsResults,
  flowAllocationProfileSummary: Array<ProfileSummary>,
  addReceiverVolumeSavings: EemSavingsResults,
  addReceiverVolumeProfileSummary: Array<ProfileSummary>,
  adjustCascadingSetPointsSavings: EemSavingsResults,
  adjustCascadingSetPointsProfileSummary: Array<ProfileSummary>,
  improveEndUseEfficiencySavings: EemSavingsResults,
  improveEndUseEfficiencyProfileSummary: Array<ProfileSummary>,
  reduceAirLeaksSavings: EemSavingsResults,
  reduceAirLeaksProfileSummary: Array<ProfileSummary>,
  reduceRunTimeSavings: EemSavingsResults,
  reduceRunTimeProfileSummary: Array<ProfileSummary>,
  reduceSystemAirPressureSavings: EemSavingsResults,
  reduceSystemAirPressureProfileSummary: Array<ProfileSummary>,
  useAutomaticSequencerSavings: EemSavingsResults,
  useAutomaticSequencerProfileSummary: Array<ProfileSummary>,
  auxiliaryPowerUsage: { cost: number, energyUse: number },
  dayTypeId: string,
  dayTypeName: string,
  peakDemand: number,
  peakDemandCost: number,
  peakDemandCostSavings: number,
  totalAnnualOperatingCost: number,
  annualEmissionOutput: number
}


export interface EemSavingsResults {
  baselineResults: SavingsItem,
  adjustedResults: SavingsItem,
  savings: SavingsItem,
  implementationCost: number,
  paybackPeriod: number,
  dayTypeId: string,
}

export interface SavingsItem {
  cost: number,
  power: number,
  annualEmissionOutput?: number,
  annualEmissionOutputSavings?: number,
  percentSavings?: number
}

export interface BaselineResults {
  total: BaselineResult,
  dayTypeResults: Array<BaselineResult>
}

export interface BaselineResult {
  cost: number,
  energyUse: number,
  peakDemand: number,
  demandCost: number,
  name: string,
  maxAirFlow: number,
  averageAirFlow: number,
  averageAirFlowPercentCapacity: number,
  operatingDays: number,
  totalOperatingHours: number,
  annualEmissionOutput?: number,
  loadFactorPercent: number,
  dayTypeId?: string,
  totalAnnualOperatingCost: number
}


export interface AdjustProfileResults {
  adjustedProfileSummary: Array<ProfileSummary>,
  adjustedCompressors: Array<CompressorInventoryItem>,
  flowReallocationSavings: EemSavingsResults,
  flowAllocationProfileSummary: Array<ProfileSummary>,
  addReceiverVolumeSavings: EemSavingsResults,
  addReceiverVolumeProfileSummary: Array<ProfileSummary>,
  adjustCascadingSetPointsSavings: EemSavingsResults,
  adjustCascadingSetPointsProfileSummary: Array<ProfileSummary>,
  improveEndUseEfficiencySavings: EemSavingsResults,
  improveEndUseEfficiencyProfileSummary: Array<ProfileSummary>,
  reduceAirLeaksSavings: EemSavingsResults,
  reduceAirLeaksProfileSummary: Array<ProfileSummary>,
  reduceRunTimeSavings: EemSavingsResults,
  reduceRunTimeProfileSummary: Array<ProfileSummary>,
  reduceSystemAirPressureSavings: EemSavingsResults,
  reduceSystemAirPressureProfileSummary: Array<ProfileSummary>,
  useAutomaticSequencerSavings: EemSavingsResults,
  useAutomaticSequencerProfileSummary: Array<ProfileSummary>,
  auxiliaryPowerUsage: { cost: number, energyUse: number },
}

export interface FlowReallocationSummary {
  dayTypeId: string,
  profileSummary: Array<ProfileSummary>,
  dayTypeBaselineTotals: Array<ProfileSummaryTotal>,
  flowReallocationSavings: EemSavingsResults
}