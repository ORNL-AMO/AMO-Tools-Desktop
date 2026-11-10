import { ImportExportOpportunities } from '../../shared/models/treasure-hunt';

export interface OpportunityExportSection {
  label: string;
  key: Exclude<keyof ImportExportOpportunities, 'origin'>;
  fallbackName: string;
  usesItemName?: boolean;
}

export interface OpportunityCounts {
  selected: number;
  total: number;
}

export const OPPORTUNITY_EXPORT_SECTIONS: ReadonlyArray<OpportunityExportSection> = [
  { label: 'Lighting Replacements', key: 'lightingReplacements', fallbackName: 'Lighting Replacement' },
  { label: 'Motor Replacements', key: 'replaceExistingMotors', fallbackName: 'Replace Motor' },
  { label: 'Upgrade Motor Drives', key: 'motorDrives', fallbackName: 'Motor Drive' },
  { label: 'Natural Gas Reductions', key: 'naturalGasReductions', fallbackName: 'Natural Gas Reduction' },
  { label: 'Electricity Reductions', key: 'electricityReductions', fallbackName: 'Electricity Reduction' },
  { label: 'Compressed Air Reductions', key: 'compressedAirReductions', fallbackName: 'Compressed Air Reduction' },
  { label: 'Compressed Air Pressure Reductions', key: 'compressedAirPressureReductions', fallbackName: 'Compressed Air Pressure Reduction' },
  { label: 'Water Reductions', key: 'waterReductions', fallbackName: 'Water Reduction' },
  { label: 'Steam Reductions', key: 'steamReductions', fallbackName: 'Steam Reduction' },
  { label: 'Pipe Insulations', key: 'pipeInsulationReductions', fallbackName: 'Pipe Insulation' },
  { label: 'Tank Insulations', key: 'tankInsulationReductions', fallbackName: 'Tank Insulation' },
  { label: 'Air Leak Surveys', key: 'airLeakSurveys', fallbackName: 'Air Leak Survey' },
  { label: 'Steam Leak Surveys', key: 'steamLeakSurveys', fallbackName: 'Steam Leak Survey' },
  { label: 'Opening Losses', key: 'openingLosses', fallbackName: 'Opening Loss' },
  { label: 'Wall Losses', key: 'wallLosses', fallbackName: 'Wall Loss' },
  { label: 'Leakage Losses', key: 'leakageLosses', fallbackName: 'Leakage Loss' },
  { label: 'Air Heating Opportunities', key: 'airHeatingOpportunities', fallbackName: 'Air Heating' },
  { label: 'Flue Gas Losses', key: 'flueGasLosses', fallbackName: 'Flue Gas Loss' },
  { label: 'Waste Heat', key: 'wasteHeatReductions', fallbackName: 'Waste Heat Reduction' },
  { label: 'Heat Cascading', key: 'heatCascadingOpportunities', fallbackName: 'Heat Cascading' },
  { label: 'Water Heating', key: 'waterHeatingOpportunities', fallbackName: 'Water Heating' },
  { label: 'Boiler Blowdown Rate', key: 'boilerBlowdownRateOpportunities', fallbackName: 'Boiler Blowdown Rate' },
  { label: 'Cooling Tower Makeup Water', key: 'coolingTowerMakeupOpportunities', fallbackName: 'Cooling Tower Makeup Water' },
  { label: 'Chiller Staging', key: 'chillerStagingOpportunities', fallbackName: 'Chiller Staging' },
  { label: 'Chiller Performance', key: 'chillerPerformanceOpportunities', fallbackName: 'Chiller Performance' },
  { label: 'Cooling Tower Fan', key: 'coolingTowerFanOpportunities', fallbackName: 'Cooling Tower Fan' },
  { label: 'Cooling Tower Basin', key: 'coolingTowerBasinOpportunities', fallbackName: 'Cooling Tower Basin' },
  { label: 'Power Factor Correction', key: 'powerFactorCorrectionOpportunities', fallbackName: 'Power Factor Correction' },
  { label: 'Opportunity Sheets', key: 'opportunitySheets', fallbackName: 'Opportunity Sheet', usesItemName: true },
  { label: 'Assessment Opportunities', key: 'assessmentOpportunities', fallbackName: 'Assessment Opportunity', usesItemName: true }
];
