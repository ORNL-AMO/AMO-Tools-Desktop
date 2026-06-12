export const ROUTE_TOKENS = {
  // Main tabs
  baseline: 'baseline',
  assessment: 'assessment',
  report: 'report',

  // Baseline sub-tabs
  assessmentSettings: 'assessment-settings',
  operations: 'operations',
  heatBalance: 'heat-balance',
  auxiliaryEquipment: 'auxiliary-equipment',
  designedEnergy: 'designed-energy',
  meteredEnergy: 'metered-energy',

  // Assessment sub-tabs
  exploreOpportunities: 'explore-opportunities',

  // Report sub-tabs
  executiveSummary: 'executive-summary',
  inputSummary: 'input-summary',
  facilityInfo: 'facility-info',

  // Loss sub-tabs (under heat-balance) — all-heating system configuration
  chargeMaterial: 'charge-material',
  wallLosses: 'wall-losses',
  extendedSurface: 'extended-surface',
  atmosphere: 'atmosphere',
  fixture: 'fixture',
  cooling: 'cooling',
  opening: 'opening',
  other: 'other',
  // Fuel-fired only
  flueGas: 'flue-gas',
  gasLeakage: 'gas-leakage',
  // Electrotechnology-standard only
  auxiliaryPower: 'auxiliary-power',
  energyInputExhaustGas: 'energy-input-exhaust-gas',
  // EAF only
  energyInput: 'energy-input',
  exhaustGas: 'exhaust-gas',
  slag: 'slag',
  // Steam / Custom Electrotechnology only
  heatSystemEfficiency: 'heat-system-efficiency',
} as const;
